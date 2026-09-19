export type DigitalIssueCategory =
  | 'WEBSITE'
  | 'GOOGLE_PROFILE'
  | 'EMAIL'
  | 'CONVERSION'
  | 'SOCIAL'
  | 'SEO'
  | 'ADS_TRACKING'
  | 'EMAIL_MARKETING';

export type DigitalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DigitalIssue {
  id: string;
  category: DigitalIssueCategory;
  severity: DigitalSeverity;
  title: string;
  description: string;
  businessImpact: string;
  recommendedFix: string;
  estimatedValue: number;
}

export interface RecommendedServicePackage {
  packageName: string;
  description: string;
  estimatedValue: {
    min: number;
    max: number;
    currency: string;
  };
  monthlyRetainer?: {
    amount: number;
    currency: string;
  };
  deliverables: string[];
  timeline: string;
}

export interface PitchAngles {
  emailPitch: string;
  linkedInPitch: string;
  salesCallOpener: string;
  valueProposition: string;
}

export interface DigitalAuditPackage {
  businessId: string;
  businessName: string;
  category: string;
  overallScore: number; // 0 - 100 maturity score

  digitalMaturity: {
    website: number;
    localPresence: number;
    emailCredibility: number;
    conversionTools: number;
    socialPresence: number;
    localSeo: number;
    adsAndTracking: number;
    emailMarketing: number;
  };

  gapScore: number; // 0 - 100 (Higher = Bigger Opportunity / Urgent Problem)

  fixPriority: DigitalSeverity;

  issuesDetected: DigitalIssue[];

  beforeAfterScores: {
    current: {
      website: number;
      localPresence: number;
      email: number;
      conversion: number;
      social: number;
      seo: number;
      ads: number;
      emailMarketing: number;
      total: number;
    };
    potential: {
      website: number;
      localPresence: number;
      email: number;
      conversion: number;
      social: number;
      seo: number;
      ads: number;
      emailMarketing: number;
      total: number;
    };
  };

  recommendedPackage: RecommendedServicePackage;

  pitchAngles: PitchAngles;

  conversionProbability: number;

  recommendedNextAction: 'CALL' | 'EMAIL' | 'LINKEDIN' | 'WHATSAPP' | 'MANUAL_RESEARCH';

  auditedAt: string;
}
