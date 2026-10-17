import type { CopilotIntentType, CopilotExecutionResult } from './types';
import { researchEngine } from './researchEngine';
import { outreachEngine } from './outreachEngine';

export interface CopilotExecutionContext {
  companies?: any[];
  deals?: any[];
  signals?: any[];
  workspaceId?: string;
  userId?: string;
  /** Authenticated user's full name — used to sign generated outreach. */
  senderName?: string;
}

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
   * Executes intent and returns structured action cards, companies, or intelligence payloads using live context when available.
   */
  public executePrompt(prompt: string, context?: CopilotExecutionContext): CopilotExecutionResult {
    const intent = this.classifyIntent(prompt);
    const q = prompt.toLowerCase();

    // Use workspace-scoped data from the route context.
    // Never fall back to hardcoded engine demo data: an empty workspace should show 0 results.
    const companies = context?.companies ?? [];
    const signals = context?.signals ?? [];
    const deals = context?.deals ?? [];

    switch (intent) {
      case 'SEARCH': {
        const stopWords = new Set(['find', 'search', 'look', 'for', 'discover', 'show', 'companies', 'in', 'that', 'are', 'with', 'the', 'a', 'an', 'and', 'or', 'to', 'of', 'at', 'by', 'from', 'my', 'me', 'our', 'all']);
        const rawTerms = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
        const queryTerms = rawTerms.filter(t => !/^\d+$/.test(t));
        const results = companies.filter((c: any) => {
          if (queryTerms.length === 0) return true;
          const signalsText = (c.activeSignals || []).map((s: any) => `${s.type || ''} ${s.title || ''} ${s.description || ''}`).join(' ');
          const text = `${c.name} ${c.industry || ''} ${c.location || ''} ${c.description || ''} ${signalsText}`.toLowerCase();
          return queryTerms.some(term => text.includes(term));
        });

        return {
          intent: 'SEARCH',
          message: results.length > 0
            ? `I searched your workspace and found ${results.length} companies matching your criteria.`
            : `I searched your workspace and found 0 companies matching your criteria. Try scanning for businesses with Geo Radar or adjusting your query.`,
          actionTaken: 'Executed workspace prospect filter',
          companies: results,
          suggestedFollowUps: results.length > 0 ? [
            `Research ${results[0]?.name || 'top company'}`,
            'Draft outreach for top prospects',
            'Save search as daily alert'
          ] : [
            'Scan new companies via Geo Radar',
            'View all workspace companies',
            'Import prospect list'
          ]
        };
      }

      case 'RESEARCH': {
        let found = companies.find((c: any) => c.name && q.includes(c.name.toLowerCase()));
        if (!found && (q.includes('top') || q.includes('target account') || q.includes('opportunity') || q.includes('lead') || q.includes('first')) && companies.length > 0) {
          found = [...companies].sort((a: any, b: any) => (b.opportunityScore || 0) - (a.opportunityScore || 0))[0];
        }

        if (!found) {
          return {
            intent: 'RESEARCH',
            message: `Could not find a company matching that name in your workspace directory. You can discover and add companies via Geo Radar.`,
            actionTaken: 'Company lookup in workspace',
            suggestedFollowUps: [
              'View workspace companies',
              'Run Geo Radar scan',
              'Search for prospects'
            ]
          };
        }

        const dossier = researchEngine.generateDossier(found);

        return {
          intent: 'RESEARCH',
          message: `I compiled an Intelligence Dossier for **${found.name}** (${found.industry || 'Enterprise'}, ${found.location || 'Location'}). Identified key operational pain points and growth triggers.`,
          actionTaken: `Generated dossier for ${found.name}`,
          researchData: dossier,
          suggestedFollowUps: [
            `Draft outreach to ${found.name}`,
            `Add ${found.name} to Pipeline`,
            'View similar accounts'
          ]
        };
      }

      case 'PRIORITIZE': {
        let topOpps = companies.filter((c: any) => (c.opportunityScore || 0) >= 80);
        if (topOpps.length === 0 && companies.length > 0) {
          topOpps = [...companies].sort((a: any, b: any) => (b.opportunityScore || 0) - (a.opportunityScore || 0)).slice(0, 5);
        }

        return {
          intent: 'PRIORITIZE',
          message: topOpps.length > 0
            ? `You have ${topOpps.length} priority opportunities in your workspace ranked by Opportunity Score and verified signals.`
            : `You currently have 0 accounts in your workspace. You can scan new prospects via Geo Radar or add target companies.`,
          actionTaken: 'Calculated Opportunity Score rankings',
          companies: topOpps,
          suggestedFollowUps: topOpps.length > 0 ? [
            `Draft outreach for ${topOpps[0]?.name || 'top prospect'}`,
            'View active buying signals',
            'Promote top prospects to Pipeline'
          ] : [
            'Scan new companies via Geo Radar',
            'View Signals Feed',
            'Import prospect list'
          ]
        };
      }

      case 'OUTREACH': {
        const found = companies.find((c: any) => q.includes(c.name.toLowerCase())) || companies[0];
        if (!found) {
          return {
            intent: 'OUTREACH',
            message: `You don't have any companies in your workspace yet to generate outreach for. Add companies first to enable autonomous pitch generation.`,
            actionTaken: 'Checked available accounts',
            suggestedFollowUps: ['Find prospects', 'Scan with Geo Radar']
          };
        }

        const outreach = outreachEngine.generateOutreach(
          found.name,
          'Decision Maker',
          'Executive Leadership',
          'Expansion & Operational Efficiency',
          'Executive & Direct',
          context?.senderName || 'Your Team'
        );

        return {
          intent: 'OUTREACH',
          message: `I generated a signal-anchored outreach package for **${found.name}** targeting their executive team.`,
          actionTaken: `Drafted Email, LinkedIn InMail, and Executive Call Script`,
          outreachData: outreach,
          suggestedFollowUps: [
            'Send via connected email inbox',
            'Log outreach in CRM timeline',
            'Create follow-up task'
          ]
        };
      }

      case 'CRM_ACTION': {
        return {
          intent: 'CRM_ACTION',
          message: `Pipeline command acknowledged. Navigate to Pipeline to view and manage active stages and values.`,
          actionTaken: 'Navigated to Pipeline',
          targetView: 'pipeline',
          suggestedFollowUps: [
            'View Pipeline Kanban',
            'Add deal to pipeline',
            'Update deal stage'
          ]
        };
      }

      case 'REPORT': {
        const totalDeals = deals.length;
        const pipelineValue = deals.reduce((sum: number, d: any) => sum + (d.dealValue || 0), 0);
        const wonDeals = deals.filter((d: any) => d.stage === 'won').length;
        const activeDeals = deals.filter((d: any) => d.stage !== 'lost' && d.stage !== 'won').length;

        return {
          intent: 'REPORT',
          message: totalDeals > 0
            ? `Your Workspace Brief: **${companies.length} Companies Monitored**, **${totalDeals} Deals** ($${pipelineValue.toLocaleString()} Pipeline Value), **${activeDeals} Active Deals**, and **${wonDeals} Deals Won**.`
            : `Your Workspace Brief: **${companies.length} Companies Monitored**, **0 Deals in Pipeline**, and **${signals.length} Signals Detected**. Start adding prospects to build pipeline.`,
          actionTaken: 'Synthesized Workspace Pipeline & Intelligence Summary',
          targetView: 'reports',
          suggestedFollowUps: [
            'View Pipeline Deals',
            'Check Signals Feed',
            'Export summary'
          ]
        };
      }

      case 'MARKET_INTEL': {
        return {
          intent: 'MARKET_INTEL',
          message: signals.length > 0
            ? `Detected **${signals.length} verified buying signals** across your workspace accounts.`
            : `No market signals detected in your workspace yet. Discover companies to stream real-time hiring and expansion signals.`,
          actionTaken: 'Aggregated regional market signals',
          signals,
          targetView: 'signals',
          suggestedFollowUps: [
            'Filter signals by type',
            'View high-impact alerts',
            'Discover new companies'
          ]
        };
      }

      case 'NAVIGATE': {
        let view = 'dashboard';
        if (q.includes('pipeline') || q.includes('deal')) view = 'pipeline';
        else if (q.includes('opp') || q.includes('opportunity')) view = 'opportunities';
        else if (q.includes('signal') || q.includes('alert')) view = 'signals';
        else if (q.includes('prospect') || q.includes('hunter')) view = 'find-prospects';
        else if (q.includes('company') || q.includes('companies')) view = 'companies';
        else if (q.includes('contact')) view = 'contacts';
        else if (q.includes('research')) view = 'research';
        else if (q.includes('report')) view = 'reports';
        else if (q.includes('setting')) view = 'settings';
        else if (q.includes('integration')) view = 'integrations';
        else if (q.includes('outreach') || q.includes('inbox') || q.includes('email')) view = 'outreach';
        else if (q.includes('campaign')) view = 'campaigns';
        else if (q.includes('task')) view = 'tasks';
        else if (q.includes('meeting')) view = 'meetings';
        else if (q.includes('saved')) view = 'saved-searches';

        return {
          intent: 'NAVIGATE',
          message: `Ready to navigate to **${view.toUpperCase().replace('-', ' ')}**. Click below to proceed.`,
          actionTaken: `Navigating to ${view}`,
          targetView: view,
          suggestedFollowUps: [
            `Open ${view.replace('-', ' ')}`,
            'Which prospects should I contact today?',
            'Show my pipeline metrics'
          ]
        };
      }

      default: {
        const pipelineValue = deals.reduce((sum: number, d: any) => sum + (d.dealValue || 0), 0);
        return {
          intent: 'UNKNOWN',
          message: `I analyzed your workspace: You currently have **${companies.length} target accounts**, **${signals.length} buying signals**, and **$${pipelineValue.toLocaleString()} in open deal pipeline**. What would you like to investigate?`,
          suggestedFollowUps: [
            'Which prospects should I contact today?',
            'Show expanding companies in my market',
            'Summarize my pipeline metrics',
            'Draft outreach for top prospects'
          ]
        };
      }
    }
  }
}

export const copilotEngine = new CopilotEngine();
