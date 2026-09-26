import { apiClient } from './client';
import type { CompanyItem } from '../types/company';
import type { OpportunityItem } from '../types/opportunity';
import type { SignalItem } from '../types/signal';
import type { 
  ResearchDossier, 
  GeneratedOutreach,
  CopilotIntentType 
} from '../engine/types';

/**
 * Actual raw contract returned by the backend endpoint:
 * POST /api/copilot/execute
 */
export interface BackendCopilotResponse {
  intent: CopilotIntentType;
  message: string;
  reply?: string;
  actionTaken?: string;
  targetView?: string;
  companies?: CompanyItem[];
  opportunities?: OpportunityItem[];
  signals?: SignalItem[];
  researchData?: ResearchDossier;
  outreachData?: GeneratedOutreach;
  suggestedFollowUps?: string[];
}

/**
 * Normalized action representation derived strictly from actual backend response
 */
export interface CopilotAction {
  id: string;
  type: string;
  label: string;
  targetView?: string;
}

/**
 * Normalized results container aggregating real domain entities from the backend response
 */
export interface CopilotResults {
  companies?: CompanyItem[];
  opportunities?: OpportunityItem[];
  signals?: SignalItem[];
  researchData?: ResearchDossier;
  outreachData?: GeneratedOutreach;
}

/**
 * Normalized frontend contract.
 * Represents what the frontend consumes from the backend response without fabricating fake fields.
 */
export interface CopilotResponse {
  message: string;
  intent?: string;
  actions?: CopilotAction[];
  results?: CopilotResults;

  // Preserved accessors from the real backend response for backwards-compatibility:
  actionTaken?: string;
  targetView?: string;
  companies?: CompanyItem[];
  opportunities?: OpportunityItem[];
  signals?: SignalItem[];
  researchData?: ResearchDossier;
  outreachData?: GeneratedOutreach;
  suggestedFollowUps?: string[];

  // Full untransformed raw payload from the backend contract:
  raw: BackendCopilotResponse;
}

/**
 * Typed adapter: normalizes the raw backend response into the frontend CopilotResponse contract.
 * Accurately translates real backend fields without inserting fabricated values.
 */
export function normalizeCopilotResponse(raw: BackendCopilotResponse): CopilotResponse {
  const actions: CopilotAction[] = [];

  if (raw.actionTaken) {
    actions.push({
      id: `act-${String(raw.intent || 'action').toLowerCase()}`,
      type: String(raw.intent || 'action').toLowerCase(),
      label: raw.actionTaken,
      targetView: raw.targetView
    });
  } else if (raw.targetView) {
    actions.push({
      id: `nav-${raw.targetView}`,
      type: 'navigate',
      label: `Navigate to ${raw.targetView}`,
      targetView: raw.targetView
    });
  }

  const hasResults = Boolean(
    (raw.companies && raw.companies.length > 0) ||
    (raw.opportunities && raw.opportunities.length > 0) ||
    (raw.signals && raw.signals.length > 0) ||
    raw.researchData ||
    raw.outreachData
  );

  const results: CopilotResults | undefined = hasResults ? {
    ...(raw.companies ? { companies: raw.companies } : {}),
    ...(raw.opportunities ? { opportunities: raw.opportunities } : {}),
    ...(raw.signals ? { signals: raw.signals } : {}),
    ...(raw.researchData ? { researchData: raw.researchData } : {}),
    ...(raw.outreachData ? { outreachData: raw.outreachData } : {}),
  } : undefined;

  return {
    message: raw.message || raw.reply || '',
    intent: raw.intent,
    actions: actions.length > 0 ? actions : undefined,
    results,
    actionTaken: raw.actionTaken,
    targetView: raw.targetView,
    companies: raw.companies,
    opportunities: raw.opportunities,
    signals: raw.signals,
    researchData: raw.researchData,
    outreachData: raw.outreachData,
    suggestedFollowUps: raw.suggestedFollowUps || [],
    raw
  };
}

export async function executeCopilotPrompt(prompt: string, model?: string): Promise<CopilotResponse> {
  const raw = await apiClient.post<BackendCopilotResponse>(
    '/api/copilot/execute', 
    { prompt, model }, 
    { timeoutMs: 20000 }
  );
  return normalizeCopilotResponse(raw);
}
