export interface OnboardingData {
  // Step 1: Welcome
  workspaceName: string;
  website: string;
  whatYouSell: string;
  description: string;
  primaryObjective: 'generate_clients' | 'increase_pipeline' | 'expand_accounts' | 'market_intelligence';

  // Step 2: ICP
  industries: string[];
  geographicMarkets: string[];
  companySize: string;
  revenueRange: string;
  businessType: 'B2B' | 'B2B2C' | 'Enterprise';
  preferredTraits: string[];

  // Step 3: Services & Solutions
  offerings: string[];
  averageDealValue: number;
  targetBuyerRoles: string[];
  problemsSolved: string;
  differentiator: string;

  // Step 4: Hunting Preferences (Signals)
  signals: {
    hiringSpikes: boolean;
    fundingRounds: boolean;
    geoExpansion: boolean;
    leadershipChanges: boolean;
    techStackChanges: boolean;
    newsPR: boolean;
    regulatoryEvents: boolean;
  };

  // Step 5: AI Configuration
  discoveryAggressiveness: 'conservative' | 'balanced' | 'aggressive';
  scoringSensitivity: number; // 50 - 95
  researchDepth: 'fast_brief' | 'deep_dossier';
  outreachTone: 'consultative' | 'direct_value' | 'narrative';
}

export const initialOnboardingData: OnboardingData = {
  workspaceName: 'Peak Consulting',
  website: 'https://peakconsulting.com',
  whatYouSell: 'HR Consulting & Employee Training Services',
  description: 'We help growing companies build high-performing teams through HR strategy, leadership development, employee training, and organizational design.',
  primaryObjective: 'generate_clients',

  industries: ['Technology & SaaS', 'Financial Services', 'Healthcare & Life Sciences'],
  geographicMarkets: ['United States', 'United Kingdom', 'Nigeria / West Africa'],
  companySize: '50 – 500 employees',
  revenueRange: '$5M – $50M',
  businessType: 'B2B',
  preferredTraits: ['High Growth (>20% YoY)', 'Hiring Spikes', 'Recently Funded', 'Remote/Hybrid Teams'],

  offerings: ['HR Strategy & Scaling', 'Leadership Development', 'Management Training', 'Org Design & Compensation'],
  averageDealValue: 25000,
  targetBuyerRoles: ['Head of People', 'HR Director', 'Chief People Officer', 'CEO / Founder', 'COO'],
  problemsSolved: 'Rapid scaling friction, high employee turnover, middle management skill gaps, unclear compensation structures.',
  differentiator: 'High-touch executive coaching coupled with agile HR frameworks tailored for rapid scale.',

  signals: {
    hiringSpikes: true,
    fundingRounds: true,
    geoExpansion: true,
    leadershipChanges: true,
    techStackChanges: true,
    newsPR: false,
    regulatoryEvents: true,
  },

  discoveryAggressiveness: 'balanced',
  scoringSensitivity: 80,
  researchDepth: 'deep_dossier',
  outreachTone: 'consultative',
};
