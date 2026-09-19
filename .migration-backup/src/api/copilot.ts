import { apiClient } from './client';
import type { CopilotExecutionResult } from '../engine/types';
import { copilotEngine } from '../engine/copilotEngine';

export async function executeCopilotPrompt(prompt: string): Promise<CopilotExecutionResult> {
  try {
    return await apiClient.post<CopilotExecutionResult>('/api/copilot/execute', { prompt });
  } catch (_err) {
    return copilotEngine.executePrompt(prompt);
  }
}
