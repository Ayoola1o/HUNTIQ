import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import { hasValidTld } from '../engine/scraper/emailExtractor';
import { verifyDomainMx } from '../engine/scraper/mxValidator';

export type EmailProviderType = 'resend' | 'gmail' | 'smtp' | 'simulation';

export interface EmailIntegrationConfig {
  provider: EmailProviderType;
  fromName?: string;
  fromEmail?: string;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  isConfigured: boolean;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  campaignId?: string;
  prospectId?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  provider: EmailProviderType;
  status: 'sent' | 'simulated' | 'failed';
  to: string;
  deliveredAt: string;
  error?: string;
  previewUrl?: string;
}

export class EmailDispatchService {
  private static workspaceConfigs = new Map<string, EmailIntegrationConfig>();

  /**
   * Retrieves active email integration config for a workspace.
   * Reads from environment variables or saved memory store.
   */
  public static getConfig(workspaceId: string = 'ws-main'): EmailIntegrationConfig {
    if (this.workspaceConfigs.has(workspaceId)) {
      return this.workspaceConfigs.get(workspaceId)!;
    }

    // Default configuration from environment variables
    const envProvider = (process.env.EMAIL_PROVIDER as EmailProviderType) || 'simulation';
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const fromEmail = process.env.EMAIL_FROM?.trim() || 'outreach@huntiq.ai';
    const fromName = process.env.EMAIL_FROM_NAME?.trim() || 'Ayoola Ade';

    let resolvedProvider: EmailProviderType = 'simulation';
    let isConfigured = false;

    if (resendApiKey) {
      resolvedProvider = 'resend';
      isConfigured = true;
    } else if (smtpHost && smtpUser && smtpPass) {
      resolvedProvider = smtpHost.includes('gmail.com') ? 'gmail' : 'smtp';
      isConfigured = true;
    } else if (envProvider === 'resend' || envProvider === 'smtp' || envProvider === 'gmail') {
      resolvedProvider = envProvider;
      isConfigured = true;
    }

    const initialConfig: EmailIntegrationConfig = {
      provider: resolvedProvider,
      fromName,
      fromEmail,
      resendApiKey,
      smtpHost,
      smtpPort,
      smtpSecure: smtpPort === 465,
      smtpUser,
      smtpPass,
      isConfigured
    };

    this.workspaceConfigs.set(workspaceId, initialConfig);
    return initialConfig;
  }

  /**
   * Updates and persists workspace email integration settings.
   */
  public static updateConfig(
    workspaceId: string = 'ws-main',
    updates: Partial<EmailIntegrationConfig>
  ): EmailIntegrationConfig {
    const current = this.getConfig(workspaceId);
    const updated: EmailIntegrationConfig = {
      ...current,
      ...updates,
      isConfigured: updates.provider === 'simulation' 
        ? false 
        : Boolean(updates.resendApiKey || (updates.smtpHost && updates.smtpUser && updates.smtpPass))
    };
    this.workspaceConfigs.set(workspaceId, updated);
    return updated;
  }

  /**
   * Dispatches an email to a recipient using the active integration.
   */
  public static async sendEmail(
    options: SendEmailOptions,
    workspaceId: string = 'ws-main'
  ): Promise<SendEmailResult> {
    const { to, toName, subject, html, text, from, replyTo } = options;
    const cleanTo = to.toLowerCase().trim();

    // 1. Verify recipient email syntax
    if (!hasValidTld(cleanTo)) {
      return {
        success: false,
        messageId: `err-${Date.now()}`,
        provider: 'simulation',
        status: 'failed',
        to: cleanTo,
        deliveredAt: new Date().toISOString(),
        error: `Invalid recipient email syntax or unresolvable TLD: ${cleanTo}`
      };
    }

    const domain = cleanTo.split('@')[1];
    const mxCheck = await verifyDomainMx(domain);
    if (mxCheck.status === 'undeliverable') {
      console.warn(`[EMAIL_DISPATCH] Warning: Recipient domain ${domain} has no valid MX records.`);
    }

    const config = this.getConfig(workspaceId);
    const senderName = config.fromName || 'Ayoola Ade';
    const senderEmail = config.fromEmail || 'outreach@huntiq.ai';
    const fullFrom = from || `"${senderName}" <${senderEmail}>`;
    const fullTo = toName ? `"${toName}" <${cleanTo}>` : cleanTo;

    const emailHtml = html || `<p style="font-family: sans-serif; font-size: 15px; color: #1e293b;">${(text || '').replace(/\n/g, '<br/>')}</p>`;
    const emailText = text || html?.replace(/<[^>]+>/g, ' ').trim() || '';

    // Provider 1: Resend API
    if (config.provider === 'resend' && config.resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fullFrom,
            to: [cleanTo],
            reply_to: replyTo || senderEmail,
            subject,
            html: emailHtml,
            text: emailText
          })
        });

        const data = await resendRes.json();
        if (!resendRes.ok) {
          throw new Error(data.message || `Resend HTTP error ${resendRes.status}`);
        }

        return {
          success: true,
          messageId: data.id || `resend-${Date.now()}`,
          provider: 'resend',
          status: 'sent',
          to: cleanTo,
          deliveredAt: new Date().toISOString()
        };
      } catch (err: any) {
        console.error(`[EMAIL_DISPATCH] Resend delivery failed: ${err.message}`);
        return {
          success: false,
          messageId: `err-${Date.now()}`,
          provider: 'resend',
          status: 'failed',
          to: cleanTo,
          deliveredAt: new Date().toISOString(),
          error: err.message
        };
      }
    }

    // Provider 2: SMTP / Gmail
    if ((config.provider === 'gmail' || config.provider === 'smtp') && config.smtpHost && config.smtpUser && config.smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpSecure ?? (config.smtpPort === 465),
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const info = await transporter.sendMail({
          from: fullFrom,
          to: fullTo,
          replyTo: replyTo || senderEmail,
          subject,
          text: emailText,
          html: emailHtml
        });

        return {
          success: true,
          messageId: info.messageId || `smtp-${Date.now()}`,
          provider: config.provider,
          status: 'sent',
          to: cleanTo,
          deliveredAt: new Date().toISOString()
        };
      } catch (err: any) {
        console.error(`[EMAIL_DISPATCH] SMTP delivery failed: ${err.message}`);
        return {
          success: false,
          messageId: `err-${Date.now()}`,
          provider: config.provider,
          status: 'failed',
          to: cleanTo,
          deliveredAt: new Date().toISOString(),
          error: err.message
        };
      }
    }

    // Provider 3: Simulation Mode (Dev / Demo when credentials are not configured)
    const simMessageId = `sim-${randomUUID()}`;
    console.log(`[EMAIL_DISPATCH] Simulated email delivery to ${cleanTo}: "${subject}" (Message ID: ${simMessageId})`);

    return {
      success: true,
      messageId: simMessageId,
      provider: 'simulation',
      status: 'simulated',
      to: cleanTo,
      deliveredAt: new Date().toISOString(),
      previewUrl: `https://huntiq.ai/preview/${simMessageId}`
    };
  }

  /**
   * Sends a test verification email to confirm credentials.
   */
  public static async sendTestEmail(
    toEmail: string,
    workspaceId: string = 'ws-main'
  ): Promise<SendEmailResult> {
    const config = this.getConfig(workspaceId);
    const subject = `[HUNTIQ] Verification Test Email (${config.provider.toUpperCase()})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #2563eb; margin: 0 0 12px 0;">🎉 HUNTIQ Email Integration Verified!</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">
          Congratulations! Your <strong>${config.provider.toUpperCase()}</strong> email integration has been successfully verified.
        </p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #475569;">
          <div><strong>Provider:</strong> ${config.provider}</div>
          <div><strong>Sender:</strong> ${config.fromName} &lt;${config.fromEmail}&gt;</div>
          <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
        </div>
        <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0;">
          You can now pitch prospects and send automated outreach campaigns directly from HUNTIQ.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: toEmail,
      subject,
      html,
      text: `HUNTIQ Email Integration Verified for ${config.provider} at ${new Date().toISOString()}`
    }, workspaceId);
  }
}
