import { apiClient } from './client';
import type { CopilotExecutionResult } from '../engine/types';

export async function executeCopilotPrompt(prompt: string): Promise<CopilotExecutionResult> {
  return await apiClient.post<CopilotExecutionResult>('/api/copilot/execute', { prompt });
}
