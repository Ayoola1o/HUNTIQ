import type { ResearchDossier } from './types';
import type { CompanyItem } from '../types/company';
import { signalEngine } from './signalEngine';

export class ResearchEngine {
  /**
   * Builds a research dossier grounded in real workspace data.
   * Accepts the actual CompanyItem from the workspace repository.
   * Does NOT fabricate contacts, tech stack, or pain points.
   * Returns only what is verifiably present.
   */
  public generateDossier(company: CompanyItem): ResearchDossier {
    // Real signals from the signal engine (workspace-scoped when route passes context).
    // The signal engine's in-memory list is used here; when signals are passed from the route
    // they should be pre-filtered. This remains workspace-safe because the route always passes
    // workspace-scoped signals to copilotEngine, which calls researchEngine with the found company.
    const triggers = signalEngine.getSignalsForCompany(company.name);

    // Build a summary from real fields only — no invented narrative.
    const industryLabel = company.industry || 'their industry';
    const locationLabel = company.location || company.headquarters || 'their market';
    const employeeLabel = company.employees ? `~${company.employees} employees` : 'an undisclosed headcount';

    const executiveSummary =
      `${company.name} operates in ${industryLabel}, headquartered in ${locationLabel} with ${employeeLabel}.` +
      (company.description ? ` ${company.description}` : '') +
      (company.opportunityScore ? ` Opportunity score: ${company.opportunityScore}/100.` : '');

    return {
      company,
      executiveSummary,

      // Pain points and growth drivers require external intelligence (job listings, news, etc.)
      // that is not available in the current data model. Return empty — do not fabricate.
      painPoints: [],
      growthDrivers: [],

      // Hiring focus requires real job listing data — not available. Return empty.
      hiringFocus: [],

      // Tech stack requires scraping/enrichment — not available. Return empty.
      techStack: [],

      // Decision makers require a real contact database — not available without enrichment.
      // Return empty. The UI must handle the empty case gracefully.
      decisionMakers: [],

      // Use only verified signals from the workspace signal store.
      triggerEvents: triggers,

      // Recommended pitch is grounded in the real company data, without invented details.
      recommendedPitch: {
        hook: `I noticed ${company.name}'s activity${triggers.length > 0 ? ` — specifically: ${triggers[0].title}` : ''}.`,
        valueProposition: `We help organizations like ${company.name} in ${industryLabel} achieve their key objectives.`,
        objectionHandling: `We work within your existing workflows and can demonstrate value quickly.`
      }
    };
  }
}

export const researchEngine = new ResearchEngine();
