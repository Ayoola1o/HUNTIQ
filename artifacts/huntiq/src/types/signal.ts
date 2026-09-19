export type SignalType = 
  | 'hiring' 
  | 'funding' 
  | 'expansion' 
  | 'leadership' 
  | 'technology' 
  | 'news' 
  | 'compliance' 
  | 'other';

export type SignalImpactLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface AffectedDepartment {
  name: string;
  count: number;
}

export interface SignalItem {
  id: string;
  title: string;
  subtitle: string;
  companyName: string;
  location: string;
  type: SignalType;
  impactLevel: SignalImpactLevel;
  impactScore: number;
  detectedTime: string;
  detectedTimestamp: string;
  whyItMatters: string;
  whatHappened: string;
  source: string;
  sourceType: 'linkedin' | 'globe' | 'news' | 'compliance';
  confidence: string;
  firstDetected: string;
  lastUpdated: string;
  affectedDepartments?: AffectedDepartment[];
  recommendedAction: string;
  targetRole: string;
}
