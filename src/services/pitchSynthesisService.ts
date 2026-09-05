import type { ProspectPitchPayload } from '../types/outreach';

export interface GeneratedPitchContent {
  subject: string;
  emailBody: string;
  linkedInBody: string;
  callScript: string;
  hasVerifiedEmail: boolean;
  emailStatus: 'verified' | 'unverified' | 'not_found';
}

export function synthesizePitch(payload: Partial<ProspectPitchPayload>, senderName: string = 'Ayoola Ade'): GeneratedPitchContent {
  const company = payload.companyName || 'your company';
  const contact = payload.contactName || 'there';
  const topKw = payload.commercialIntentKeywords?.[0] || 'high-intent commercial keywords';
  const competitor = payload.topCompetitors?.[0]?.name || 'direct competitors';
  const gap = payload.identifiedGaps?.[0] || 'Missing verified local search presence and technical schema';
  const score = payload.seoScore || payload.opportunityScore || 78;
  const pkg = payload.recommendedPackage || 'Turnkey Search & Client Acquisition Suite';

  const hasVerifiedEmail = Boolean(payload.email && payload.email.trim() && !payload.email.includes('company.com'));
  const emailStatus: 'verified' | 'unverified' | 'not_found' = payload.emailStatus || (hasVerifiedEmail ? 'verified' : 'not_found');

  const subject = payload.suggestedSubject || (
    payload.topCompetitors?.length
      ? `Quick note: ${company} vs ${competitor} search ranking on Google`
      : `Audit finding: ${company} organic search traffic gap`
  );

  const keywordsList = payload.commercialIntentKeywords?.slice(0, 3).map(k => `"${k}"`).join(', ') || `"${topKw}"`;

  const emailNotice = !hasVerifiedEmail
    ? `[NOTE: Verified email address not found for this contact. Discover via Hunter enrichment or reach out via LinkedIn InMail / Phone Battlecard.]\n\n`
    : '';

  const emailBody = payload.suggestedBody || `${emailNotice}Hi ${contact},

I was reviewing commercial search visibility across your sector and noticed that ${company} is currently losing top search placement to ${competitor} for key commercial inquiries like ${keywordsList}.

Key findings from our recent digital audit:
• Search Terms Missed: ${keywordsList}
• Critical Vulnerability: ${gap}
• Organic Opportunity Score: ${score}/100
• Recommended Fix: ${pkg}

We formulated a custom 1-Page Competitor & Commercial Opportunity Breakdown illustrating how ${company} can capture these high-intent inbound inquiries.

Would you be open to a 10-minute chat this Thursday, or would you prefer I send over the audit summary directly?

Best regards,
${senderName}`;

  const linkedInBody = `Hi ${contact} – saw your leadership at ${company}.

Our intelligence engine recently analyzed local search market share and detected that ${competitor} is currently capturing search traffic for ${keywordsList}. 

We put together a short teardown on how ${company} can outrank them and win those customer inquiries. Worth a 2-minute look?`;

  const callScript = `"Hi ${contact}, this is ${senderName}. The reason for my call is that our market intelligence engine flagged ${company} as currently losing inbound search volume for '${topKw}' to ${competitor}. 

We've prepared a 3-step action plan to help you reclaim that top placement. Do you have 2 minutes to hear the headline numbers?"`;

  return {
    subject,
    emailBody,
    linkedInBody,
    callScript,
    hasVerifiedEmail,
    emailStatus
  };
}
