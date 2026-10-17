import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { copilotEngine } from '../engine-client/copilotEngine';
import type { AuthenticatedRequest } from '../middleware/auth';
import { createCompanyRepository } from '../repositories/companies';
import { createPipelineRepository } from '../repositories/pipeline';
import { createSignalRepository } from '../repositories/signals';

export const copilotRouter = Router();
const companyRepo = createCompanyRepository();
const pipelineRepo = createPipelineRepository();
const signalRepo = createSignalRepository();

copilotRouter.post(['/copilot/execute', '/copilot/chat'], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prompt = req.body?.prompt || req.body?.message;
    // The backend remains strictly authoritative for workspace/user identity.
    // Client-supplied workspace overrides are ignored to prevent tenant bypass.
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PROMPT',
          message: 'A natural language prompt string is required.'
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    if (!workspaceId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Active workspace session must be established.'
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    let companies: any[] = [];
    let deals: any[] = [];
    let signals: any[] = [];
    const dataWarnings: string[] = [];

    if (workspaceId) {
      const [companyResult, dealResult, signalResult] = await Promise.allSettled([
        companyRepo.list({}, workspaceId),
        userId ? pipelineRepo.listByUser(userId, workspaceId) : Promise.resolve([]),
        signalRepo.list(50, 0, workspaceId)
      ]);

      if (companyResult.status === 'fulfilled') {
        companies = companyResult.value;
      } else {
        console.error('[HUNTIQ-COPILOT] companyRepo.list failed:', companyResult.reason);
        dataWarnings.push('Company data could not be loaded (repository error).');
      }

      if (dealResult.status === 'fulfilled') {
        deals = dealResult.value;
      } else {
        console.error('[HUNTIQ-COPILOT] pipelineRepo.listByUser failed:', dealResult.reason);
        dataWarnings.push('Pipeline data could not be loaded (repository error).');
      }

      if (signalResult.status === 'fulfilled') {
        signals = signalResult.value;
      } else {
        console.error('[HUNTIQ-COPILOT] signalRepo.list failed:', signalResult.reason);
        dataWarnings.push('Signal data could not be loaded (repository error).');
      }
    }

    // Pass senderName so outreach is signed with the authenticated user's name.
    const senderName = (req.user as any)?.fullName || (req.user as any)?.name || undefined;

    const result = copilotEngine.executePrompt(prompt, {
      companies,
      deals,
      signals,
      workspaceId,
      userId,
      senderName
    });

    const response: ApiResponse = {
      success: true,
      data: {
        ...result,
        reply: result.message
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(dataWarnings.length > 0 ? { dataWarnings } : {})
      }
    };

    res.status(200).json(response);
  } catch (err: any) {
    console.error('[HUNTIQ-COPILOT] Error executing copilot prompt:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'EXECUTION_FAILED',
        message: err instanceof Error ? err.message : 'Internal Copilot execution error'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});
