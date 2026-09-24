export interface CompanyItem {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  logoBg?: string;
  logoColor?: string;
  logoInitial?: string;
  industry: string;
  employees: string;
  revenue: string;
  location: string;
  opportunityScore: number;
  opportunityLevel: 'Very High' | 'High' | 'Medium' | 'Low' | 'Hot';
  scoreColor: string;
  scoreTrend: number[];
  isSaved?: boolean;
  signalsCount: number;
  activeSignals: Array<any>;
  lastActivity: string;
  description: string;
  website?: string;
  founded?: string;
  headquarters: string;
  phone?: string;
  tags?: string[];
  digitalAudit?: any;
  socials: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
}

export interface CompanyKpiData {
  totalCompanies: string;
  totalCompaniesChange: string;
  newCompanies: string;
  newCompaniesChange: string;
  highOpportunity: string;
  highOpportunityChange: string;
  avgScore: string;
  avgScoreChange: string;
  companiesWithSignals: string;
  companiesWithSignalsChange: string;
  totalEmployees: string;
  totalEmployeesChange: string;
}
