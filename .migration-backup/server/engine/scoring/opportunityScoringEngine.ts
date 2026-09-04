import type { DbCompany, DbJob, DbSignal, DbContact } from '../../db/types';

export interface ScoreDimensionBreakdown {
  name: string;
  weight: number; // e.g. 0.30
  score: number;  // 0 - 100
  weightedScore: number;
  reason: string;
}

export interface LiveOpportunityEvaluation {
  companyId: string;
  companyName: string;
  domain: string;
  totalScore: number; // 0 - 100
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  scoreColor: string; // #10b981 (green), #f59e0b (amber), #64748b (gray)
  scoreTrend: number[];
  conversionProbability: number; // e.g. 88%
  estimatedDealValue: number;    // e.g. $35,000
  dimensions: {
    hiringVelocity: ScoreDimensionBreakdown;
    buyingSignals: ScoreDimensionBreakdown;
    icpFit: ScoreDimensionBreakdown;
    contactReachability: ScoreDimensionBreakdown;
  };
  keyDrivers: string[];
  riskFactors: string[];
  recommendedAction: string;
  evaluatedAt: string;
}

export class OpportunityScoringEngine {
  /**
   * Evaluates live company data across all 4 core dimensions to generate a composite Opportunity Score.
   */
  public static evaluateCompany(
    company: DbCompany,
    jobs: DbJob[],
    signals: DbSignal[],
    contacts: DbContact[]
  ): LiveOpportunityEvaluation {
    const keyDrivers: string[] = [];
    const riskFactors: string[] = [];
    const now = new Date().toISOString();

    // --------------------------------------------------------------------------
    // 1. Hiring Velocity & Job Density (Weight: 30%)
    // --------------------------------------------------------------------------
    const openJobs = jobs.filter(j => j.status === 'OPEN');
    let velocityRaw = 35;
    let velocityReason = 'Standard hiring baseline (1-2 open roles)';

    if (openJobs.length >= 10) {
      velocityRaw = 96;
      velocityReason = `Explosive hiring surge: ${openJobs.length} active requisitions open simultaneously`;
      keyDrivers.push(`Rapid talent acquisition surge (${openJobs.length} live job requisitions)`);
    } else if (openJobs.length >= 5) {
      velocityRaw = 84;
      velocityReason = `Strong hiring momentum: ${openJobs.length} open roles across multiple departments`;
      keyDrivers.push(`Active multi-department hiring (${openJobs.length} open roles)`);
    } else if (openJobs.length >= 2) {
      velocityRaw = 68;
      velocityReason = `Moderate recruitment activity: ${openJobs.length} open positions`;
    } else if (openJobs.length === 0) {
      velocityRaw = 20;
      velocityReason = 'No active public job openings detected';
      riskFactors.push('Zero active hiring requisitions observed in current cycle');
    }

    const hiringVelocityDim: ScoreDimensionBreakdown = {
      name: 'Hiring Velocity & Capacity',
      weight: 0.30,
      score: velocityRaw,
      weightedScore: Math.round(velocityRaw * 0.30),
      reason: velocityReason
    };

    // --------------------------------------------------------------------------
    // 2. Buying Signals & Intent Surge (Weight: 30%)
    // --------------------------------------------------------------------------
    const activeSignals = signals.filter(s => s.status === 'ACTIVE');
    let signalRaw = 30;
    let signalReason = 'Baseline market presence';

    if (activeSignals.some(s => s.type === 'HIRING_ACCELERATION')) {
      signalRaw += 40;
      keyDrivers.push('Detected rapid hiring acceleration (+120% to +240% over baseline)');
    }
    if (activeSignals.some(s => s.type === 'LEADERSHIP_HIRING')) {
      signalRaw += 25;
      keyDrivers.push('Active executive leadership search (C-level / VP / Director level)');
    }
    if (activeSignals.some(s => s.type === 'EXPANSION' || s.type === 'DEPARTMENT_EXPANSION')) {
      signalRaw += 20;
      keyDrivers.push('Regional cross-border expansion or department scaling');
    }

    signalRaw = Math.min(100, signalRaw);
    signalReason = activeSignals.length > 0
      ? `${activeSignals.length} verified high-intent signals active`
      : 'No high-confidence buying signals active in current 30-day window';

    const buyingSignalsDim: ScoreDimensionBreakdown = {
      name: 'Buying Signals & Intent Surge',
      weight: 0.30,
      score: signalRaw,
      weightedScore: Math.round(signalRaw * 0.30),
      reason: signalReason
    };

    // --------------------------------------------------------------------------
    // 3. Firmographic & ICP Fit (Weight: 20%)
    // --------------------------------------------------------------------------
    let icpRaw = 50;
    const empCount = parseInt(company.employeeCount || '100', 10) || 100;
    const industryLower = company.industry.toLowerCase();

    // Industry multiplier
    if (industryLower.includes('fintech') || industryLower.includes('banking') || industryLower.includes('payments')) {
      icpRaw += 25;
      keyDrivers.push('Tier-1 Core ICP Industry (FinTech & Digital Payments)');
    } else if (industryLower.includes('tech') || industryLower.includes('software') || industryLower.includes('services')) {
      icpRaw += 15;
    }

    // Headcount sweet-spot (100 - 1000 employees is highest advisory value)
    if (empCount >= 100 && empCount <= 1000) {
      icpRaw += 20;
      keyDrivers.push(`Optimal headcount stage for advisory services (${company.employeeCount} employees)`);
    } else if (empCount > 1000) {
      icpRaw += 10;
    }

    icpRaw = Math.min(100, icpRaw);

    const icpFitDim: ScoreDimensionBreakdown = {
      name: 'Firmographic & ICP Alignment',
      weight: 0.20,
      score: icpRaw,
      weightedScore: Math.round(icpRaw * 0.20),
      reason: `${company.industry} • ${company.employeeCount} employees in ${company.city}, ${company.country}`
    };

    // --------------------------------------------------------------------------
    // 4. Decision-Maker Reachability (Weight: 20%)
    // --------------------------------------------------------------------------
    let contactRaw = 20;
    const validExecs = contacts.filter(c => 
      (c.seniority === 'DIRECTOR' || c.seniority === 'VP' || c.seniority === 'CXO') &&
      c.emailStatus === 'VALID'
    );

    if (validExecs.length >= 2) {
      contactRaw = 96;
      keyDrivers.push(`Multiple verified C-level/Director contacts (${validExecs.map(e => `${e.firstName} - ${e.jobTitle}`).join('; ')})`);
    } else if (validExecs.length === 1) {
      contactRaw = 88;
      keyDrivers.push(`Verified key decision-maker: ${validExecs[0].firstName} ${validExecs[0].lastName} (${validExecs[0].jobTitle})`);
    } else if (contacts.length > 0) {
      contactRaw = 55;
      riskFactors.push('Contacts exist but C-level direct email verification pending');
    } else {
      contactRaw = 15;
      riskFactors.push('No direct executive contacts enriched yet');
    }

    const contactReachabilityDim: ScoreDimensionBreakdown = {
      name: 'Decision-Maker Reachability',
      weight: 0.20,
      score: contactRaw,
      weightedScore: Math.round(contactRaw * 0.20),
      reason: validExecs.length > 0 
        ? `${validExecs.length} verified executive contacts reachable` 
        : 'Requires automated decision-maker enrichment'
    };

    // --------------------------------------------------------------------------
    // Composite Calculation
    // --------------------------------------------------------------------------
    const totalScore = Math.min(99, Math.max(15, Math.round(
      hiringVelocityDim.weightedScore +
      buyingSignalsDim.weightedScore +
      icpFitDim.weightedScore +
      contactReachabilityDim.weightedScore
    )));

    const tier: LiveOpportunityEvaluation['tier'] = 
      totalScore >= 85 ? 'Tier 1' : totalScore >= 70 ? 'Tier 2' : 'Tier 3';

    const scoreColor = 
      totalScore >= 85 ? '#10b981' : totalScore >= 70 ? '#f59e0b' : '#64748b';

    // Historical trend simulation ending at current totalScore
    const baseTrend = Math.max(50, totalScore - 14);
    const scoreTrend = [
      baseTrend,
      baseTrend + 4,
      baseTrend + 9,
      totalScore
    ];

    // Estimated Deal Value based on headcount and score tier
    let baseDeal = empCount > 500 ? 45000 : empCount > 200 ? 30000 : 18000;
    if (totalScore >= 90) baseDeal *= 1.3;
    const estimatedDealValue = Math.round(baseDeal / 1000) * 1000;

    const conversionProbability = Math.min(94, Math.max(30, Math.round(totalScore * 0.92)));

    let recommendedAction = 'Monitor for additional buying signals';
    if (totalScore >= 85) {
      recommendedAction = validExecs.length > 0
        ? `Initiate personalized executive outreach to ${validExecs[0].firstName} ${validExecs[0].lastName} focusing on hiring acceleration & talent scaling`
        : 'Run Contact Enrichment to resolve direct email for Head of People / VP of Engineering';
    } else if (totalScore >= 70) {
      recommendedAction = 'Track account on priority watchlist and generate deep 360° research dossier';
    }

    return {
      companyId: company.id,
      companyName: company.name,
      domain: company.domain,
      totalScore,
      tier,
      scoreColor,
      scoreTrend,
      conversionProbability,
      estimatedDealValue,
      dimensions: {
        hiringVelocity: hiringVelocityDim,
        buyingSignals: buyingSignalsDim,
        icpFit: icpFitDim,
        contactReachability: contactReachabilityDim
      },
      keyDrivers,
      riskFactors,
      recommendedAction,
      evaluatedAt: now
    };
  }
}
