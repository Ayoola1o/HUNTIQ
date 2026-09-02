import { Router, type Response } from 'express';
import { authService } from '../services/auth.service';
import type { AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

/**
 * POST /api/v1/auth/signup
 * Register a new user and create an isolated workspace
 */
authRouter.post('/signup', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, companyName, defaultCurrency } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'email, password, and fullName are mandatory fields.'
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 8 characters long.'
      });
      return;
    }

    const authData = await authService.signup({
      email,
      password,
      fullName,
      companyName,
      defaultCurrency
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully with private workspace.',
      data: authData
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'Registration failed',
      message: error.message || 'Unable to complete signup.'
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Authenticate user credentials and return JWT session token
 */
authRouter.post('/login', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'email and password are required.'
      });
      return;
    }

    const authData = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: authData
    });
  } catch (error: any) {
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message || 'Invalid credentials.'
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user session and workspace profile
 */
authRouter.get('/me', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No active authenticated session.'
      });
      return;
    }

    const profile = await authService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: profile || req.user
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Could not fetch profile.'
    });
  }
});

/**
 * POST /api/v1/auth/logout
 */
authRouter.post('/logout', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});
