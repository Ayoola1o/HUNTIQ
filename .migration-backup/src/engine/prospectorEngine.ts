import type { CompanyItem } from '../types/company';
import type { ProspectSearchParams } from './types';
import { scoringEngine } from './scoringEngine';
import { signalEngine } from './signalEngine';

export class ProspectorEngine {
  private companies: CompanyItem[] = [
    {
      id: 'c1',
      name: 'Paystack',
      domain: 'paystack.com',
      industry: 'FinTech & Payments',
      employees: '320',
      revenue: '$25M - $50M',
      location: 'Lagos, Nigeria',
      opportunityScore: 94,
      opportunityLevel: 'Very High',
      scoreColor: '#10b981',
      scoreTrend: [82, 86, 91, 94],
      signalsCount: 3,
      activeSignals: [
        { type: 'Expansion', title: 'Francophone expansion', description: 'Opening regional hubs', time: '2h ago', iconType: 'globe' }
      ],
      lastActivity: '2 hours ago',
      description: 'Modern online and offline payments for African businesses.',
      founded: '2015',
      headquarters: 'Lagos, Nigeria',
      socials: { linkedin: 'https://linkedin.com/company/paystack' }
    },
    {
      id: 'c2',
      name: 'Flutterwave',
      domain: 'flutterwave.com',
      industry: 'FinTech & Banking',
      employees: '480',
      revenue: '$50M - $100M',
      location: 'Lagos / San Francisco',
      opportunityScore: 91,
      opportunityLevel: 'Very High',
      scoreColor: '#10b981',
      scoreTrend: [78, 84, 88, 91],
      signalsCount: 4,
      activeSignals: [
        { type: 'Leadership', title: 'New Head of Compliance', description: 'Former Stripe executive hired', time: '4h ago', iconType: 'user' }
      ],
      lastActivity: '4 hours ago',
      description: 'Global payment infrastructure for multinational enterprises.',
      founded: '2016',
      headquarters: 'San Francisco & Lagos',
      socials: { linkedin: 'https://linkedin.com/company/flutterwave' }
    },
    {
      id: 'c3',
      name: 'Moniepoint',
      domain: 'moniepoint.com',
      industry: 'Digital Banking & POS',
      employees: '850',
      revenue: '$50M - $100M',
      location: 'Lagos, Nigeria',
      opportunityScore: 89,
      opportunityLevel: 'High',
      scoreColor: '#6366f1',
      scoreTrend: [74, 80, 85, 89],
      signalsCount: 2,
      activeSignals: [
        { type: 'Hiring', title: '45 Senior Engineering Roles', description: 'Distributed cloud engineering', time: 'Yesterday', iconType: 'users' }
      ],
      lastActivity: 'Yesterday',
      description: 'All-in-one financial services platform for businesses.',
      founded: '2015',
      headquarters: 'Lagos, Nigeria',
      socials: { linkedin: 'https://linkedin.com/company/moniepoint' }
    },
    {
      id: 'c4',
      name: 'Kuda Bank',
      domain: 'kudabank.com',
      industry: 'Neobanking & Consumer Tech',
      employees: '290',
      revenue: '$10M - $25M',
      location: 'London / Lagos',
      opportunityScore: 88,
      opportunityLevel: 'High',
      scoreColor: '#6366f1',
      scoreTrend: [70, 75, 82, 88],
      signalsCount: 2,
      activeSignals: [
        { type: 'Funding', title: '$55M Series B', description: 'Credit infrastructure funding', time: '1d ago', iconType: 'zap' }
      ],
      lastActivity: '1 day ago',
      description: 'Full-service digital bank for the smartphone generation.',
      founded: '2019',
      headquarters: 'London, UK',
      socials: { linkedin: 'https://linkedin.com/company/kudabank' }
    }
  ];

  public getAllCompanies(): CompanyItem[] {
    return this.companies;
  }

  public getCompanyById(id: string): CompanyItem | undefined {
    return this.companies.find(c => c.id === id);
  }

  public getCompanyByName(name: string): CompanyItem | undefined {
    return this.companies.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Discovers and ranks prospects matching criteria.
   */
  public searchProspects(params: ProspectSearchParams): CompanyItem[] {
    const allSignals = signalEngine.getAllSignals();

    let results = this.companies.filter(c => {
      // Free text query filter
      if (params.query) {
        const q = params.query.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesIndustry = c.industry?.toLowerCase().includes(q);
        const matchesLocation = c.location?.toLowerCase().includes(q);
        if (!matchesName && !matchesIndustry && !matchesLocation) {
          return false;
        }
      }

      // Industry filter
      if (params.industries && params.industries.length > 0) {
        const matchesInd = params.industries.some(ind => 
          c.industry?.toLowerCase().includes(ind.toLowerCase())
        );
        if (!matchesInd) return false;
      }

      // Headcount bounds
      const count = parseInt(c.employees || '0', 10) || 0;
      if (params.headcountMin && count < params.headcountMin) return false;
      if (params.headcountMax && count > params.headcountMax) return false;

      // Minimum score
      if (params.minOpportunityScore && (c.opportunityScore || 0) < params.minOpportunityScore) {
        return false;
      }

      return true;
    });

    // Re-score dynamically with the scoring engine
    results = results.map(c => {
      const evaluation = scoringEngine.evaluateOpportunity(c, allSignals);
      return {
        ...c,
        opportunityScore: evaluation.totalScore
      };
    });

    // Sort descending by Opportunity Score
    return results.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
  }
}

export const prospectorEngine = new ProspectorEngine();
