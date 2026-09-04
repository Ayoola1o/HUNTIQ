import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { copilotEngine } from '../../src/engine/copilotEngine';

export const copilotRouter = Router();

copilotRouter.post('/copilot/execute', (req: Request, res: Response) => {
  const { prompt } = req.body || {};

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

  const result = copilotEngine.executePrompt(prompt);

  const response: ApiResponse = {
    success: true,
    data: result,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
