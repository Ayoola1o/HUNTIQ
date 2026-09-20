import { GoogleAuthService } from './googleAuthService';

export interface GmailSendOptions {
  workspaceId: string;
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export interface GmailSendResult {
  success: boolean;
  messageId: string;
  threadId?: string;
  fromEmail: string;
  to: string;
  deliveredAt: string;
  error?: string;
}

export class GmailService {
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
  }): string {
    const { from, to, subject, html, text, replyTo } = options;

    // UTF-8 encode the subject if it contains non-ASCII characters
    const encodedSubject = /[^\x00-\x7F]/.test(subject)
      ? `=?utf-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`
      : subject;

    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const headers = [
      `From: ${from}`,
      `To: ${to}`,
      ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
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
    if (!integration || !integration.isActive) {
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

    const senderName = integration.accountName || 'HUNTIQ Outreach';
    const senderEmail = integration.accountEmail;
    const fromHeader = `"${senderName}" <${senderEmail}>`;
    const toHeader = toName ? `"${toName}" <${to}>` : to;

    const emailHtml =
      html ||
      `<div style="font-family: sans-serif; font-size: 15px; color: #1e293b;">${(
        text || ''
      ).replace(/\n/g, '<br/>')}</div>`;
    const emailText = text || html?.replace(/<[^>]+>/g, ' ').trim() || '';

    const rawBase64 = this.buildRawRfc2822Email({
      from: fromHeader,
      to: toHeader,
      subject,
      html: emailHtml,
      text: emailText,
      replyTo: replyTo || senderEmail
    });

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: rawBase64 })
      }
    );

    const data = await response.json();

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

    return {
      success: true,
      messageId: data.id || `gmail-${Date.now()}`,
      threadId: data.threadId,
      fromEmail: senderEmail,
      to,
      deliveredAt: new Date().toISOString()
    };
  }
}
