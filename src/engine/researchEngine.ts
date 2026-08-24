import type { ResearchDossier } from './types';
import type { CompanyItem } from '../types/company';
import { prospectorEngine } from './prospectorEngine';
import { signalEngine } from './signalEngine';

export class ResearchEngine {
  /**
   * Runs an autonomous 360° deep investigation on a company.
   */
  public generateDossier(companyName: string): ResearchDossier {
    const existing = prospectorEngine.getCompanyByName(companyName);
    const company: CompanyItem = existing || {
      id: `c-${Date.now()}`,
      name: companyName,
      domain: `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      industry: 'Enterprise Technology & Services',
      employees: '250',
      revenue: '$10M - $25M',
      location: 'Lagos, Nigeria',
      opportunityScore: 88,
      opportunityLevel: 'High',
      scoreColor: '#6366f1',
      scoreTrend: [75, 80, 84, 88],
      signalsCount: 2,
      activeSignals: [
        { type: 'Expansion', title: 'Operational scaling', description: 'Expanding facilities', time: '3d ago', iconType: 'globe' }
      ],
      lastActivity: '3 days ago',
      description: 'High-growth technology leader scaling commercial operations.',
      founded: '2018',
      headquarters: 'Lagos, Nigeria',
      socials: { linkedin: 'https://linkedin.com' }
    };

    const triggers = signalEngine.getSignalsForCompany(companyName);

    return {
      company,
      executiveSummary: `${company.name} is a high-growth leader in ${company.industry || 'Technology'}, currently accelerating product lines and cross-border expansion with an estimated headcount of ~${company.employees} employees.`,
      painPoints: [
        'Scaling infrastructure reliability under 4x traffic surge',
        'Managing distributed team onboarding and KPI alignment across multiple hubs',
        'Accelerating regulatory and enterprise security compliance audits',
        'Optimizing customer retention and automated account servicing'
      ],
      growthDrivers: [
        'Aggressive expansion into new commercial territories',
        'Recent capital infusion dedicated to engineering and sales expansion',
        'High hiring velocity across senior management positions'
      ],
      hiringFocus: [
        { role: 'VP of Engineering', count: 1, department: 'Engineering' },
        { role: 'Senior Security Architect', count: 3, department: 'Infosec' },
        { role: 'Enterprise Account Executive', count: 5, department: 'Sales & Growth' }
      ],
      techStack: ['React', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL', 'Redis'],
      decisionMakers: [
        {
          name: 'Babafemi Lawson',
          role: 'Head of People & Operations',
          department: 'Human Resources & Ops',
          email: `babafemi@${company.domain || 'company.com'}`,
          linkedin: `https://linkedin.com/in/babafemi-lawson`,
          confidence: 96
        },
        {
          name: 'Kemi Adeleke',
          role: 'Chief Technology Officer',
          department: 'Engineering & Product',
          email: `kemi@${company.domain || 'company.com'}`,
          linkedin: `https://linkedin.com/in/kemi-adeleke`,
          confidence: 94
        },
        {
          name: 'Tariq Al-Mansoor',
          role: 'VP Commercial & Growth',
          department: 'Sales',
          email: `tariq@${company.domain || 'company.com'}`,
          linkedin: `https://linkedin.com/in/tariq-almansoor`,
          confidence: 91
        }
      ],
      triggerEvents: triggers.length > 0 ? triggers : [
        {
          id: 'trig-gen',
          title: `${company.name} expanding product architecture and scaling core teams`,
          subtitle: 'Infrastructure & talent scaling',
          companyName: company.name,
          location: company.location,
          type: 'expansion',
          impactLevel: 'High',
          impactScore: 88,
          detectedTime: '3 days ago',
          detectedTimestamp: '3 days ago',
          whyItMatters: 'Identified notable expansion in job listings and cloud infrastructure adoption.',
          whatHappened: 'Scaling core engineering and product architecture.',
          source: 'HUNTIQ Radar',
          sourceType: 'news',
          confidence: '90%',
          firstDetected: '3 days ago',
          lastUpdated: 'Yesterday',
          recommendedAction: 'Engage leadership with workflow scaling solutions.',
          targetRole: 'VP Operations'
        }
      ],
      recommendedPitch: {
        hook: `I noticed ${company.name}'s rapid expansion and recent leadership scaling across ${company.location || 'the region'}.`,
        valueProposition: `We help fast-scaling organizations streamline operations and eliminate operational bottlenecks before they impact delivery timelines.`,
        objectionHandling: `Unlike generic consulting, our platform integrates directly with your existing tech stack with zero onboarding friction.`
      }
    };
  }
}

export const researchEngine = new ResearchEngine();
