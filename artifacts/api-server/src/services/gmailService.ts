import { GoogleAuthService } from './googleAuthService';

export interface GmailSendOptions {
  workspaceId: string;
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  threadId?: string;
  replyToMessageId?: string;
  requestId?: string;
}

export interface GmailSendResult {
  success: boolean;
  messageId: string;
  threadId?: string;
  rfcMessageId?: string;
  fromEmail: string;
  to: string;
  deliveredAt: string;
  error?: string;
}

export class GmailService {
  private static fetchHandler: typeof fetch = (...args) => globalThis.fetch(...args);

  public static setTestFetchHandler(handler: typeof fetch | null): void {
    this.fetchHandler = handler || ((...args) => globalThis.fetch(...args));
  }
  /**
   * Constructs an RFC 2822 compliant email and base64url encodes it for the Gmail API.
   */
  public static buildRawRfc2822Email(options: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
    inReplyTo?: string;
    requestId?: string;
  }): string {
    const { from, to, subject, html, text, replyTo, inReplyTo, requestId } = options;

    // UTF-8 encode the subject if it contains non-ASCII characters
    const encodedSubject = /[^\x00-\x7F]/.test(subject)
      ? `=?utf-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`
      : subject;

    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const headers = [
      `From: ${from}`,
      `To: ${to}`,
      ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
      ...(inReplyTo ? [`In-Reply-To: ${inReplyTo}`, `References: ${inReplyTo}`] : []),
      ...(requestId ? [`X-HUNTIQ-SEND-ID: ${requestId}`] : []),
      `Subject: ${encodedSubject}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`
    ];

    const bodyParts = [
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      text,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      html,
      ``,
      `--${boundary}--`
    ];

    const rawMessage = `${headers.join('\r\n')}\r\n\r\n${bodyParts.join('\r\n')}`;

    // Base64url encoding (RFC 4648 Section 5)
    return Buffer.from(rawMessage, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Dispatches an email using the official Google Gmail REST API v1.
   */
  public static async sendEmail(options: GmailSendOptions): Promise<GmailSendResult> {
    const { workspaceId, to, toName, subject, html, text, replyTo } = options;

    const integration = await GoogleAuthService.getIntegration(workspaceId);
    if (!integration || !integration.isActive || integration.status !== 'active' || !integration.accessToken) {
      throw new Error(
        'Gmail is not connected for this workspace. Please authenticate with Google first.'
      );
    }

    const accessToken = await GoogleAuthService.getValidAccessToken(workspaceId);
    if (!accessToken) {
      throw new Error(
        'Unable to retrieve valid Google access token. Please re-authenticate your Gmail account.'
      );
    }

    const senderName = (integration.accountName || 'HUNTIQ Outreach').replace(/["\\\r\n]/g, '');
    const senderEmail = integration.accountEmail;
    const fromHeader = `"${senderName}" <${senderEmail}>`;
    const toHeader = toName ? `"${toName}" <${to}>` : to;

    let inReplyTo: string | undefined;
    if (options.threadId && options.replyToMessageId) {
      const parent = await this.fetchHandler(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(options.replyToMessageId)}?format=metadata&metadataHeaders=Message-ID`,
        { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(5000) }
      );
      if (!parent.ok) throw new Error('Gmail could not load the original message.');
      const metadata = await parent.json() as { payload?: { headers?: Array<{ name: string; value: string }> } };
      inReplyTo = metadata.payload?.headers?.find((header: { name: string }) => header.name.toLowerCase() === 'message-id')?.value;
      if (!inReplyTo || /[\r\n]/.test(inReplyTo)) throw new Error('Gmail did not return a valid reply reference.');
    }

    const emailHtml =
      html ||
      `<div style="font-family: sans-serif; font-size: 15px; color: #1e293b;">${(
        text || ''
      ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</div>`;
    const emailText = text || html?.replace(/<[^>]+>/g, ' ').trim() || '';

    const rawBase64 = this.buildRawRfc2822Email({
      from: fromHeader,
      to: toHeader,
      subject,
      html: emailHtml,
      text: emailText,
      replyTo: replyTo || senderEmail,
      inReplyTo,
      requestId: options.requestId
    });

    let response: Response;
    try {
      response = await this.fetchHandler(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: rawBase64, threadId: inReplyTo ? options.threadId : undefined }),
          signal: AbortSignal.timeout(15000)
        }
      );
    } catch {
      throw Object.assign(new Error('Gmail send outcome could not be confirmed. Check Gmail Sent before retrying.'), { code: 'GMAIL_DELIVERY_UNKNOWN', deliveryOutcomeUnknown: true });
    }

    const data: any = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error?.message ||
        `Gmail API returned HTTP ${response.status}: ${JSON.stringify(data.error || data)}`;
      console.error(`[GMAIL_SERVICE] Dispatch error:`, errorMessage);
      return {
        success: false,
        messageId: `err-${Date.now()}`,
        fromEmail: senderEmail,
        to,
        deliveredAt: new Date().toISOString(),
        error: errorMessage
      };
    }

    let rfcMessageId: string | undefined;
    const sentId = typeof data.id === 'string' ? data.id : undefined;
    if (sentId) {
      try {
        const metadataResponse = await this.fetchHandler(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(sentId)}?format=metadata&metadataHeaders=Message-ID`,
          { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(5000) }
        );
        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json() as { payload?: { headers?: Array<{ name: string; value: string }> } };
          const value = metadata.payload?.headers?.find(header => header.name.toLowerCase() === 'message-id')?.value;
          if (value && !/[\r\n]/.test(value)) rfcMessageId = value;
        }
      } catch {
        // Gmail accepted the send; RFC header enrichment is optional because thread IDs remain authoritative.
      }
    }

    return {
      success: true,
      messageId: data.id || `gmail-${Date.now()}`,
      threadId: data.threadId,
      rfcMessageId,
      fromEmail: senderEmail,
      to,
      deliveredAt: new Date().toISOString()
    };
  }
}
