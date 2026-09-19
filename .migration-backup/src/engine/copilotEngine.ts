import type { CopilotIntentType, CopilotExecutionResult } from './types';
import { prospectorEngine } from './prospectorEngine';
import { researchEngine } from './researchEngine';
import { signalEngine } from './signalEngine';
import { outreachEngine } from './outreachEngine';

export class CopilotEngine {
  /**
   * Classifies user natural language input into one of HUNTIQ's 9 core operational intents.
   */
  public classifyIntent(input: string): CopilotIntentType {
    const q = input.toLowerCase().trim();

    if (q.includes('find') || q.includes('search') || q.includes('look for') || q.includes('discover') || q.includes('show companies')) {
      return 'SEARCH';
    }
    if (q.includes('research') || q.includes('investigate') || q.includes('dossier') || q.includes('tell me about')) {
      return 'RESEARCH';
    }
    if (q.includes('contact today') || q.includes('prioritize') || q.includes('hot opportunities') || q.includes('top leads') || q.includes('focus on')) {
      return 'PRIORITIZE';
    }
    if (q.includes('write email') || q.includes('draft email') || q.includes('outreach') || q.includes('pitch') || q.includes('call script') || q.includes('message')) {
      return 'OUTREACH';
    }
    if (q.includes('move') || q.includes('update stage') || q.includes('qualify') || q.includes('add to pipeline') || q.includes('create deal')) {
      return 'CRM_ACTION';
    }
    if (q.includes('report') || q.includes('summary') || q.includes('metrics') || q.includes('performance') || q.includes('conversion rate')) {
      return 'REPORT';
    }
    if (q.includes('market') || q.includes('industry') || q.includes('competitor') || q.includes('trends') || q.includes('signals')) {
      return 'MARKET_INTEL';
    }
    if (q.includes('go to') || q.includes('open') || q.includes('take me to') || q.includes('navigate')) {
      return 'NAVIGATE';
    }
    if (q.includes('why') || q.includes('analyze') || q.includes('dropping') || q.includes('risk')) {
      return 'ANALYZE';
    }

    return 'UNKNOWN';
  }

  /**
   * Executes intent and returns structured action cards, companies, or intelligence payloads.
   */
  public executePrompt(prompt: string): CopilotExecutionResult {
    const intent = this.classifyIntent(prompt);
    const q = prompt.toLowerCase();

    switch (intent) {
      case 'SEARCH': {
        const results = prospectorEngine.searchProspects({ query: prompt });
        return {
          intent: 'SEARCH',
          message: `I searched the intelligence database and found ${results.length} companies matching your criteria with verified buying signals.`,
          actionTaken: 'Executed natural language prospect filter',
          companies: results,
          suggestedFollowUps: [
            `Research ${results[0]?.name || 'top company'}`,
            'Draft outreach for top 3 prospects',
            'Save search as daily alert'
          ]
        };
      }

      case 'RESEARCH': {
        // Extract company name if possible
        const allCompanies = prospectorEngine.getAllCompanies();
        const found = allCompanies.find(c => q.includes(c.name.toLowerCase()));
        const targetName = found ? found.name : 'Paystack';
        const dossier = researchEngine.generateDossier(targetName);

        return {
          intent: 'RESEARCH',
          message: `I compiled a 360° Intelligence Dossier on ${targetName}. Identified ${dossier.decisionMakers.length} key decision-makers and ${dossier.painPoints.length} high-urgency pain points.`,
          actionTaken: `Generated 360° dossier for ${targetName}`,
          researchData: dossier,
          suggestedFollowUps: [
            `Draft outreach to ${dossier.decisionMakers[0]?.name || 'Head of People'}`,
            `Add ${targetName} to Pipeline as Discovery Deal`,
            `Find similar companies in ${dossier.company.industry || 'FinTech'}`
          ]
        };
      }

      case 'PRIORITIZE': {
        const topOpps = prospectorEngine.searchProspects({ minOpportunityScore: 80 });
        return {
          intent: 'PRIORITIZE',
          message: `You have ${topOpps.length} high-priority opportunities scoring above 80/100 today based on recent trigger velocity.`,
          actionTaken: 'Calculated Opportunity Score rankings',
          companies: topOpps,
          suggestedFollowUps: [
            'Launch multi-touch campaign for these 5 accounts',
            'View buying signals breakdown',
            'Schedule follow-up tasks'
          ]
        };
      }

      case 'OUTREACH': {
        const allCompanies = prospectorEngine.getAllCompanies();
        const found = allCompanies.find(c => q.includes(c.name.toLowerCase())) || allCompanies[0];
        const outreach = outreachEngine.generateOutreach(
          found.name,
          'Babafemi Lawson',
          'Head of People & Operations',
          'Expansion into Francophone West Africa'
        );

        return {
          intent: 'OUTREACH',
          message: `I generated a signal-anchored outreach package for ${found.name} addressing their recent expansion trigger.`,
          actionTaken: `Drafted Email, LinkedIn InMail, and Executive Call Script`,
          outreachData: outreach,
          suggestedFollowUps: [
            'Send via connected email inbox',
            'Log outreach in CRM timeline',
            'Create 3-day follow-up task'
          ]
        };
      }

      case 'CRM_ACTION': {
        return {
          intent: 'CRM_ACTION',
          message: `Updated CRM record stage to **Qualified Pipeline**. Deal value set to $18,000 ARR with 60-day target close date.`,
          actionTaken: 'Updated Deal Stage & Pipeline Probability',
          targetView: 'pipeline',
          suggestedFollowUps: [
            'View Pipeline Kanban',
            'Schedule demo meeting with decision-maker',
            'Prepare executive brief'
          ]
        };
      }

      case 'REPORT': {
        return {
          intent: 'REPORT',
          message: `Your Weekly Sales Intelligence brief is ready: **48 Opportunities Monitored**, **$428.6k Pipeline Value**, **14 Deals Advanced**, and **18.4% Outbound Response Rate**.`,
          actionTaken: 'Synthesized Weekly Pipeline Attribution Matrix',
          targetView: 'reports',
          suggestedFollowUps: [
            'Open full Executive PDF brief',
            'Compare against last month baseline',
            'Export attribution data to CSV'
          ]
        };
      }

      case 'MARKET_INTEL': {
        const topSignals = signalEngine.getAllSignals();
        return {
          intent: 'MARKET_INTEL',
          message: `Detected 12 new signals across West African FinTech & Enterprise SaaS this week. Strongest cluster: **Leadership Changes (42%)** and **Hiring Surges (33%)**.`,
          actionTaken: 'Aggregated regional market signals',
          signals: topSignals,
          targetView: 'market-intel',
          suggestedFollowUps: [
            'Filter companies affected by these signals',
            'Set up automated Slack alerts for Series B announcements',
            'Open Market Intelligence Map'
          ]
        };
      }

      case 'NAVIGATE': {
        let view = 'dashboard';
        if (q.includes('pipeline') || q.includes('deal')) view = 'pipeline';
        else if (q.includes('opp') || q.includes('opportunity')) view = 'opportunities';
        else if (q.includes('signal')) view = 'signals';
        else if (q.includes('prospect') || q.includes('hunter')) view = 'find-prospects';
        else if (q.includes('company') || q.includes('companies')) view = 'companies';
        else if (q.includes('contact')) view = 'contacts';
        else if (q.includes('research')) view = 'research';
        else if (q.includes('report')) view = 'reports';
        else if (q.includes('setting')) view = 'settings';
        else if (q.includes('integration')) view = 'integrations';

        return {
          intent: 'NAVIGATE',
          message: `Navigating you to **${view.toUpperCase()}**...`,
          actionTaken: `Navigating to ${view}`,
          targetView: view
        };
      }

      default: {
        const topOpps = prospectorEngine.searchProspects({});
        return {
          intent: 'UNKNOWN',
          message: `I analyzed your workspace: You currently have **${topOpps.length} active target accounts**, **5 unread buying signals**, and **$428k in open deal pipeline**. What would you like to investigate?`,
          suggestedFollowUps: [
            'Find 25 technology companies in Lagos hiring engineers',
            'Which prospects should I contact today?',
            'Research Paystack',
            'Draft an email for my hottest prospect'
          ]
        };
      }
    }
  }
}

export const copilotEngine = new CopilotEngine();
