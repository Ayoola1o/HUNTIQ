import type { CompanyItem } from '../types/company';
import type { SignalItem } from '../types/signal';
import type { ScoreBreakdown } from './types';
import type { ScoringWeights, IcpConfig } from '../types/settings';

const DEFAULT_WEIGHTS: ScoringWeights = {
  buyingSignalsWeight: 35,
  icpFitWeight: 25,
  hiringSurgeWeight: 20,
  decisionMakerWeight: 20
};

const DEFAULT_ICP: IcpConfig = {
  targetIndustries: ['FinTech & Digital Banking', 'Enterprise SaaS', 'B2B Logistics', 'Telecommunications', 'Healthcare & Life Sciences'],
  companySizeMin: 50,
  companySizeMax: 500,
  targetGeographies: ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'United Kingdom', 'United States'],
  decisionMakerRoles: ['Head of People', 'VP Operations', 'Chief Executive Officer', 'Chief Commercial Officer', 'Director of Engineering'],
  minOpportunityValue: 10000
};

export class OpportunityScoringEngine {
  private weights: ScoringWeights;
  private icp: IcpConfig;

  constructor(weights: ScoringWeights = DEFAULT_WEIGHTS, icp: IcpConfig = DEFAULT_ICP) {
    this.weights = weights;
    this.icp = icp;
  }

  public setWeights(weights: ScoringWeights) {
    this.weights = weights;
  }

  public setIcp(icp: IcpConfig) {
    this.icp = icp;
  }

  /**
   * Calculates comprehensive 0-100 score and qualitative breakdown for any target company.
   */
  public evaluateOpportunity(
    company: Partial<CompanyItem>,
    signals: SignalItem[] = [],
    hasDecisionMaker: boolean = true
  ): ScoreBreakdown {
    // 1. Calculate ICP Fit Score (0-100)
    let icpScore = 50;
    if (company.industry && this.icp.targetIndustries.some(ind => company.industry?.toLowerCase().includes(ind.toLowerCase()) || ind.toLowerCase().includes(company.industry?.toLowerCase() || ''))) {
      icpScore += 30;
    }
    const headcount = parseInt(company.employees || '100', 10) || 100;
    if (headcount >= this.icp.companySizeMin && headcount <= this.icp.companySizeMax) {
      icpScore += 20;
    }
    icpScore = Math.min(100, icpScore);

    // 2. Calculate Signal Velocity Score (0-100)
    const companySignals = signals.filter(s => 
      s.companyName?.toLowerCase() === company.name?.toLowerCase()
    );
    
    let signalScore = 30;
    if (companySignals.length > 0) {
      signalScore = Math.min(100, 40 + companySignals.length * 20);
    }

    // 3. Calculate Hiring Surge Score (0-100)
    const hasHiringSignal = companySignals.some(s => 
      s.type === 'hiring' || 
      s.type === 'expansion' ||
      s.title?.toLowerCase().includes('hiring')
    );
    const hiringScore = hasHiringSignal ? 90 : (companySignals.length > 0 ? 60 : 40);

    // 4. Decision Maker Access Score (0-100)
    const reachabilityScore = hasDecisionMaker ? 95 : 45;

    // Weighted Formula
    const totalScore = Math.round(
      (signalScore * (this.weights.buyingSignalsWeight / 100)) +
      (icpScore * (this.weights.icpFitWeight / 100)) +
      (hiringScore * (this.weights.hiringSurgeWeight / 100)) +
      (reachabilityScore * (this.weights.decisionMakerWeight / 100))
    );

    const boundedScore = Math.max(10, Math.min(99, totalScore));

    const tier: ScoreBreakdown['tier'] = 
      boundedScore >= 80 ? 'High Intent' :
      boundedScore >= 55 ? 'Medium Intent' : 'Low Intent';

    // Generate Why Now catalyst summary
    let whyNowSummary = 'Moderate account alignment with baseline ICP metrics.';
    if (companySignals.length > 0) {
      const topSignal = companySignals[0];
      whyNowSummary = `Recent trigger event: "${topSignal.title || topSignal.type}" indicates immediate operational change.`;
    } else if (boundedScore >= 80) {
      whyNowSummary = 'Strong industry tailwinds and headcount profile match high-conversion benchmarks.';
    }

    // Tactical next action
    let recommendedAction = 'Monitor account for emerging triggers';
    if (boundedScore >= 85) {
      recommendedAction = 'Initiate multi-touch executive outreach sequence';
    } else if (boundedScore >= 70) {
      recommendedAction = 'Run automated 360° AI intelligence dossier';
    }

    return {
      totalScore: boundedScore,
      tier,
      icpFitScore: icpScore,
      signalVelocityScore: signalScore,
      hiringSurgeScore: hiringScore,
      reachabilityScore,
      whyNowSummary,
      recommendedAction
    };
  }
}

export const scoringEngine = new OpportunityScoringEngine();
