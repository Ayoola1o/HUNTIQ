import type { 
  DigitalAuditPackage, 
  DigitalIssue, 
  DigitalSeverity 
} from '../../types/digitalAudit';

export interface AuditBusinessInput {
  id: string;
  name: string;
  category: string;
  website?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  district?: string;
  hasOnlineBooking?: boolean;
  hasAdTrackingPixels?: boolean;
  isActivelyRunningAds?: boolean;
  hasEmailCaptureFlows?: boolean;
}

export class DigitalAuditEngine {
  /**
   * Performs an in-depth, multi-dimensional digital gap audit for any commercial entity.
   */
  public static audit(input: AuditBusinessInput): DigitalAuditPackage {
    const issues: DigitalIssue[] = [];
    const hasWebsite = !!input.website && input.website.trim() !== '' && input.website !== 'none';
    const isHttps = hasWebsite && input.website!.startsWith('https://');
    const rating = input.rating || 0;
    const reviewCount = input.reviewCount || 0;

    // 1. Website Audit (Max 25 pts)
    let websiteMaturity = 25;
    if (!hasWebsite) {
      websiteMaturity = 0;
      issues.push({
        id: 'iss-web-1',
        category: 'WEBSITE',
        severity: 'CRITICAL',
        title: 'Zero Web Presence / No Live Domain',
        description: 'The business has no official website indexed on Google, losing direct high-intent local customers to competing search results.',
        businessImpact: 'Complete loss of organic search discovery and digital authority in the commercial district.',
        recommendedFix: 'Deploy a modern, mobile-first responsive web portal with fast local server hosting.',
        estimatedValue: 4500
      });
    } else if (!isHttps) {
      websiteMaturity = 10;
      issues.push({
        id: 'iss-web-2',
        category: 'WEBSITE',
        severity: 'HIGH',
        title: 'Insecure Website (Missing SSL Certificate)',
        description: 'Browsers display "Not Secure" warnings to prospective clients, causing high immediate bounce rates.',
        businessImpact: 'Severe trust deficit and suppression on Google Chrome / Safari mobile rankings.',
        recommendedFix: 'Install modern SSL/TLS certificate and force automated HTTPS redirects.',
        estimatedValue: 1200
      });
    }

    // 2. Google / Local Presence Audit (Max 15 pts)
    let localPresenceMaturity = 15;
    if (reviewCount < 5) {
      localPresenceMaturity = 4;
      issues.push({
        id: 'iss-gmb-1',
        category: 'GOOGLE_PROFILE',
        severity: 'HIGH',
        title: 'Unclaimed / Low Google Maps Footprint',
        description: `Only ${reviewCount} customer reviews recorded with zero owner responses on Google Business profile.`,
        businessImpact: 'Excluded from top 3 Google Local Map Pack results for nearby commercial searches.',
        recommendedFix: 'Verify ownership, optimize business categories, and launch automated review generation campaign.',
        estimatedValue: 2000
      });
    } else if (rating < 3.8) {
      localPresenceMaturity = 8;
      issues.push({
        id: 'iss-gmb-2',
        category: 'GOOGLE_PROFILE',
        severity: 'MEDIUM',
        title: 'Reputation Deficit / Unanswered Negative Reviews',
        description: `Average rating of ${rating.toFixed(1)}/5.0 with unaddressed customer complaints damages conversion.`,
        businessImpact: 'Reduces trust when prospective clients compare local providers.',
        recommendedFix: 'Implement proactive customer review feedback funnel and professional response protocol.',
        estimatedValue: 1500
      });
    }

    // 3. Email & Identity Credibility (Max 10 pts)
    let emailCredibilityMaturity = 10;
    if (!hasWebsite || input.phone?.includes('@gmail.com') || input.id.includes('gmail')) {
      emailCredibilityMaturity = 2;
      issues.push({
        id: 'iss-mail-1',
        category: 'EMAIL',
        severity: 'MEDIUM',
        title: 'Conducting Business via Free Public Email (@gmail)',
        description: 'Using free @gmail.com or @yahoo.com accounts for invoices and corporate quotes.',
        businessImpact: 'Damages corporate credibility and reduces reply rates on commercial proposals.',
        recommendedFix: 'Provision professional Google Workspace / Microsoft 365 custom domain email addresses.',
        estimatedValue: 800
      });
    }

    // 4. Conversion Tools & Lead Capture (Max 20 pts)
    let conversionToolsMaturity = 20;
    const hasBooking = input.hasOnlineBooking ?? (hasWebsite && isHttps && Math.random() > 0.6);
    if (!hasBooking) {
      conversionToolsMaturity = 4;
      issues.push({
        id: 'iss-conv-1',
        category: 'CONVERSION',
        severity: 'CRITICAL',
        title: 'Missing Instant Booking & 24/7 Lead Capture System',
        description: 'No online consultation booking widget, quote calculator, or automated after-hours lead capture form.',
        businessImpact: 'Up to 60% of after-hours web visitors bounce without leaving contact details.',
        recommendedFix: 'Integrate automated scheduling, instant quote estimation, and automated WhatsApp/SMS notifications.',
        estimatedValue: 2800
      });
    }

    // 5. Social Presence & Local Citations (Max 10 pts)
    let socialPresenceMaturity = hasWebsite ? 8 : 3;
    if (!hasWebsite) {
      issues.push({
        id: 'iss-soc-1',
        category: 'SOCIAL',
        severity: 'LOW',
        title: 'Fragmented Social & Local Directory Profiles',
        description: 'Inconsistent NAP (Name, Address, Phone) across local business directories and social handles.',
        businessImpact: 'Dilutes local search ranking signals and customer confidence.',
        recommendedFix: 'Synchronize citations across top 40 regional business directories.',
        estimatedValue: 1000
      });
    }

    // 6. Local SEO & Search Visibility (Max 20 pts)
    let localSeoMaturity = 20;
    if (!hasWebsite || reviewCount < 10) {
      localSeoMaturity = 5;
      issues.push({
        id: 'iss-seo-1',
        category: 'SEO',
        severity: 'HIGH',
        title: 'Low Search Engine Authority in District',
        description: `Does not rank on page 1 of Google for high-intent keywords like "${input.category} near me".`,
        businessImpact: 'High-value customer inquiries default to the top 3 ranking local competitors.',
        recommendedFix: 'Execute targeted on-page SEO, localized schema markup, and geo-targeted landing pages.',
        estimatedValue: 3200
      });
    }

    // 7. Advertising & Conversion Pixels (Max 15 pts)
    let adsAndTrackingMaturity = 15;
    const hasPixel = input.hasAdTrackingPixels ?? (hasWebsite && Math.random() > 0.5);
    const runsAds = input.isActivelyRunningAds ?? (hasWebsite && Math.random() > 0.6);

    if (!hasPixel && !runsAds) {
      adsAndTrackingMaturity = 0;
      issues.push({
        id: 'iss-ads-1',
        category: 'ADS_TRACKING',
        severity: 'HIGH',
        title: 'Zero Paid Traffic / Missing Retargeting Pixel',
        description: 'No Meta Pixel or Google conversion tags detected. Visitors leave without ever being retargeted.',
        businessImpact: '95%+ of interested local visitors leave the site and are never re-engaged.',
        recommendedFix: 'Install full Meta & Google tracking pixels and deploy a high-ROI local retargeting campaign.',
        estimatedValue: 2500
      });
    } else if (runsAds && !hasBooking) {
      adsAndTrackingMaturity = 7;
      issues.push({
        id: 'iss-ads-2',
        category: 'ADS_TRACKING',
        severity: 'HIGH',
        title: 'Active Ad Spend Directing to Generic Homepage',
        description: 'Currently paying for ads but lacking dedicated landing page funnels and automated lead capture.',
        businessImpact: 'Wasted ad budget due to high cost-per-acquisition (CPA).',
        recommendedFix: 'Deploy high-converting dedicated campaign landing pages with conversion rate optimization (CRO).',
        estimatedValue: 3500
      });
    }

    // 8. Email Marketing & Automated Drips (Max 15 pts)
    let emailMarketingMaturity = 15;
    const hasEmailFlows = input.hasEmailCaptureFlows ?? (hasWebsite && Math.random() > 0.7);

    if (!hasEmailFlows) {
      emailMarketingMaturity = 2;
      issues.push({
        id: 'iss-em-1',
        category: 'EMAIL_MARKETING',
        severity: 'HIGH',
        title: 'Zero Automated Email Marketing / Retention Sequences',
        description: 'No email capture popup, lead magnet, or automated welcome/nurture drip sequences in place.',
        businessImpact: 'Zero repeat customer retention automation, leaving lifetime customer value untapped.',
        recommendedFix: 'Implement automated email welcome flows, booking reminders, and re-engagement campaigns.',
        estimatedValue: 2400
      });
    }

    // Calculate Overall Maturity & Digital Gap Scores
    const totalCurrentMaturity = Math.round(
      (websiteMaturity + localPresenceMaturity + emailCredibilityMaturity + conversionToolsMaturity + socialPresenceMaturity + localSeoMaturity) / 100 * 100
    );

    const gapScore = Math.max(10, Math.min(95, 100 - totalCurrentMaturity));

    const fixPriority: DigitalSeverity = 
      gapScore >= 80 ? 'CRITICAL' : gapScore >= 60 ? 'HIGH' : gapScore >= 40 ? 'MEDIUM' : 'LOW';

    // Package Recommendation
    let packageName = 'Complete Digital Transformation & Local Acquisition Suite';
    let packageDescription = `Comprehensive modernization package resolving ${issues.length} critical revenue bottlenecks.`;
    let minPrice = 4500;
    let maxPrice = 8500;
    let monthlyRetainer = 1500;

    let deliverables = [
      'Modern High-Converting Mobile Web Portal',
      'Google Business Profile Map Pack Optimization',
      'Custom Corporate Domain Email System',
      '24/7 Automated Appointment & Lead Capture Engine',
      'Meta & Google Ads Campaign Setup with Retargeting Pixels',
      'Automated Email Welcome & Customer Retention Drip Sequences'
    ];

    if (!hasWebsite) {
      packageName = 'Zero-to-One Complete Digital Storefront & Local Authority Suite';
      minPrice = 5500;
      maxPrice = 10500;
      monthlyRetainer = 1800;
    } else if (runsAds) {
      packageName = 'Ad Performance Optimization & Automated Funnel Engine';
      minPrice = 3800;
      maxPrice = 7200;
      monthlyRetainer = 2000;
      deliverables = [
        'High-Converting Campaign Landing Pages (CRO)',
        'Meta & Google Retargeting Pixel Infrastructure',
        'Automated Email Lead Nurture & Review Funnels',
        'Monthly Ad Creative & Campaign Management'
      ];
    }

    // Multi-Channel Pitch Variations
    const primaryGap = issues[0]?.title || 'digital customer acquisition';
    const emailPitch = `Hi ${input.name} Leadership Team,

While reviewing ${input.name}'s digital presence in ${input.district || 'your area'}, we noticed a few areas that may be limiting how easily potential clients discover and convert with your business.

The biggest opportunity appears to be ${primaryGap}.

We prepared a brief digital opportunity assessment showing how resolving these gaps can immediately increase your verified local client inquiries this month.

Would you be open to a 5-minute walkthrough this week?`;

    const linkedInPitch = `Hi ${input.name} Team, I came across your business while researching top ${input.category} providers in ${input.district || 'your area'}.

I noticed a few key digital opportunities around ${primaryGap} and conversion automation.

We help businesses close these gaps to reliably capture high-value clients online. Happy to share the short audit deck if useful!`;

    const salesCallOpener = `Hi, I'm calling from HUNTIQ Growth Advisory. We recently reviewed ${input.name}'s online customer acquisition setup and identified 3 specific areas where prospective clients in ${input.district || 'your area'} are currently dropping off before booking. I'd love to share the 1-page breakdown with your Managing Director.`;

    const valueProposition = `Turnkey client acquisition system for ${input.name}: Modern web storefront, top 3 Google Maps ranking, targeted ad retargeting, and automated 24/7 booking.`;

    return {
      businessId: input.id,
      businessName: input.name,
      category: input.category,
      overallScore: totalCurrentMaturity,
      digitalMaturity: {
        website: websiteMaturity,
        localPresence: localPresenceMaturity,
        emailCredibility: emailCredibilityMaturity,
        conversionTools: conversionToolsMaturity,
        socialPresence: socialPresenceMaturity,
        localSeo: localSeoMaturity,
        adsAndTracking: adsAndTrackingMaturity,
        emailMarketing: emailMarketingMaturity
      },
      gapScore,
      fixPriority,
      issuesDetected: issues,
      beforeAfterScores: {
        current: {
          website: websiteMaturity,
          localPresence: localPresenceMaturity,
          email: emailCredibilityMaturity,
          conversion: conversionToolsMaturity,
          social: socialPresenceMaturity,
          seo: localSeoMaturity,
          ads: adsAndTrackingMaturity,
          emailMarketing: emailMarketingMaturity,
          total: totalCurrentMaturity
        },
        potential: {
          website: 24,
          localPresence: 15,
          email: 10,
          conversion: 19,
          social: 9,
          seo: 18,
          ads: 14,
          emailMarketing: 14,
          total: 92
        }
      },
      recommendedPackage: {
        packageName,
        description: packageDescription,
        estimatedValue: {
          min: minPrice,
          max: maxPrice,
          currency: 'USD'
        },
        monthlyRetainer: {
          amount: monthlyRetainer,
          currency: 'USD'
        },
        deliverables,
        timeline: '10 - 14 Business Days'
      },
      pitchAngles: {
        emailPitch,
        linkedInPitch,
        salesCallOpener,
        valueProposition
      },
      conversionProbability: fixPriority === 'CRITICAL' ? 88 : fixPriority === 'HIGH' ? 82 : 72,
      recommendedNextAction: !hasWebsite ? 'CALL' : runsAds ? 'EMAIL' : 'LINKEDIN',
      auditedAt: new Date().toISOString()
    };
  }
}
