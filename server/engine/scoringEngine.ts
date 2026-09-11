import type { DbCompany, DbSignal, DbContact, DbJob } from '../db/types';

export interface OpportunityEvaluation {
  totalScore: number; // 0 - 100
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  velocityScore: number;
  icpFitScore: number;
  contactReachabilityScore: number;
  estimatedDealValue: number;
  conversionProbability: number;
  keyDrivers: string[];
  recommendedAction: string;
}

export class ScoringEngine {
  public evaluate(
    company: DbCompany,
    jobs: DbJob[],
    signals: DbSignal[],
    contacts: DbContact[]
  ): OpportunityEvaluation {
    const keyDrivers: string[] = [];

    // 1. Hiring Velocity Scoring (Weight: 35%)
    const openJobs = jobs.filter(j => j.status === 'OPEN');
    let velocityScore = 20;

    if (openJobs.length >= 10) {
      velocityScore = 95;
      keyDrivers.push(`High hiring surge (${openJobs.length} active open roles)`);
    } else if (openJobs.length >= 5) {
      velocityScore = 80;
      keyDrivers.push(`Strong hiring momentum (${openJobs.length} open roles)`);
    } else if (openJobs.length >= 2) {
      velocityScore = 60;
      keyDrivers.push(`Active recruitment in ${Array.from(new Set(openJobs.map(j => j.department))).slice(0, 2).join(', ')}`);
    } else if (openJobs.length === 1) {
      velocityScore = 40;
    }

    // 2. Buying Signal Surge (Weight: 35%)
    let signalScore = 15;
    const activeSignals = signals.filter(s => s.status === 'ACTIVE');

    if (activeSignals.some(s => s.type === 'HIRING_ACCELERATION')) {
      signalScore += 35;
      keyDrivers.push('Detected rapid hiring acceleration over 14-day window');
    }
    if (activeSignals.some(s => s.type === 'LEADERSHIP_HIRING')) {
      signalScore += 25;
      keyDrivers.push('Executive leadership search underway');
    }
    if (activeSignals.some(s => s.type === 'EXPANSION' || s.type === 'FUNDING')) {
      signalScore += 20;
      keyDrivers.push('Regional expansion or funding growth signal detected');
    }
    signalScore = Math.min(100, signalScore);

    // 3. Contact Reachability & Decision Maker Presence (Weight: 30%)
    let contactReachabilityScore = 10;
    const verifiedExecs = contacts.filter(c => 
      (c.seniority === 'DIRECTOR' || c.seniority === 'VP' || c.seniority === 'CXO') &&
      c.emailStatus === 'VALID'
    );

    if (verifiedExecs.length >= 2) {
      contactReachabilityScore = 95;
      keyDrivers.push(`Multiple verified C-level/Director contacts (${verifiedExecs.map(e => e.firstName).join(', ')})`);
    } else if (verifiedExecs.length === 1) {
      contactReachabilityScore = 80;
      keyDrivers.push(`Verified key decision maker: ${verifiedExecs[0].firstName} ${verifiedExecs[0].lastName} (${verifiedExecs[0].jobTitle})`);
    } else if (contacts.length > 0) {
      const anyVerified = contacts.some(c => c.emailStatus === 'VALID');
      contactReachabilityScore = anyVerified ? 50 : 30;
    }

    // 4. ICP Fit Evaluation (Grounded in verifiable company properties)
    let icpFitScore = 30;
    if (company.domain && !company.domain.includes('gmail.com') && !company.domain.includes('yahoo.com')) {
      icpFitScore += 20;
    }
    if (company.industry && company.industry !== 'Unknown') {
      icpFitScore += 20;
    }
    if (company.employeeCount !== undefined && company.employeeCount > 0) {
      icpFitScore += 20;
    }
    icpFitScore = Math.min(100, icpFitScore);

    // Composite Weighted Score
    const totalScore = Math.round(
      velocityScore * 0.35 +
      signalScore * 0.35 +
      contactReachabilityScore * 0.30
    );

    const tier: OpportunityEvaluation['tier'] = 
      totalScore >= 80 ? 'Tier 1' : totalScore >= 60 ? 'Tier 2' : 'Tier 3';

    // Estimated Deal Value: Calculated strictly when employee count or role count is verified
    let estimatedDealValue = 0;
    if (company.employeeCount && company.employeeCount > 0) {
      estimatedDealValue = company.employeeCount > 500 ? 35000 : company.employeeCount > 100 ? 20000 : 10000;
    } else if (openJobs.length > 0) {
      estimatedDealValue = openJobs.length * 2000;
    }

    const conversionProbability = Math.min(90, Math.max(15, Math.round(totalScore * 0.85)));

    let recommendedAction = 'Monitor for additional buying signals';
    if (totalScore >= 80) {
      recommendedAction = verifiedExecs.length > 0 
        ? `Initiate outreach to ${verifiedExecs[0].firstName} ${verifiedExecs[0].lastName} focusing on strategic scaling`
        : 'Run decision-maker enrichment to resolve verified C-level contacts';
    } else if (totalScore >= 60) {
      recommendedAction = 'Add account to watchlist and monitor signal recency';
    }

    return {
      totalScore,
      tier,
      velocityScore,
      icpFitScore,
      contactReachabilityScore,
      estimatedDealValue,
      conversionProbability,
      keyDrivers,
      recommendedAction
    };
  }

  /**
   * Evaluates an explainable opportunity score for a discovered place business.
   * Derives factors strictly from verifiable evidence (digital gaps, presence, reviews, ratings).
   * Missing information does NOT automatically increase score.
   */
  public static evaluateDiscoveredPlace(
    place: {
      website: string | null;
      phone: string | null;
      rating: number | null;
      reviewCount: number | null;
      address: string | null;
      businessStatus: string | null;
    },
    audit?: {
      gapScore?: number;
      issuesDetected?: Array<{ title: string; severity: string }>;
    }
  ): {
    score: number;
    factors: Array<{ type: string; value: number; evidence: string }>;
  } {
    const factors: Array<{ type: string; value: number; evidence: string }> = [];
    let score = 15; // Grounded baseline for verified place entity

    // Factor 1: Verified Local Presence
    if (place.address) {
      score += 15;
      factors.push({
        type: 'company_presence',
        value: 15,
        evidence: `Verified commercial address: ${place.address}`
      });
    }

    // Factor 2: Verified Direct Contact Channel
    if (place.phone) {
      score += 15;
      factors.push({
        type: 'contact_reachability',
        value: 15,
        evidence: 'Verified telephone contact channel available'
      });
    }

    // Factor 3: Google Maps Traction
    if (place.reviewCount && place.reviewCount > 0) {
      const val = Math.min(20, Math.round(place.reviewCount / 5) + 5);
      score += val;
      factors.push({
        type: 'market_traction',
        value: val,
        evidence: `${place.reviewCount} customer reviews recorded (Rating: ${place.rating ?? 'N/A'})`
      });
    }

    // Factor 4: Digital Gap & Performance Audit (Only from verified audit findings)
    if (audit?.gapScore && audit.gapScore >= 70) {
      score += 20;
      factors.push({
        type: 'performance_gap_opportunity',
        value: 20,
        evidence: `Digital audit detected performance friction (Gap score: ${audit.gapScore}/100)`
      });
    } else if (place.website) {
      score += 10;
      factors.push({
        type: 'web_presence',
        value: 10,
        evidence: 'Active domain discovered for reachability'
      });
    }

    return {
      score: Math.min(85, score),
      factors
    };
  }

  public evaluateDiscoveredPlace(
    place: {
      website: string | null;
      phone: string | null;
      rating: number | null;
      reviewCount: number | null;
      address: string | null;
      businessStatus: string | null;
    },
    audit?: {
      gapScore?: number;
      issuesDetected?: Array<{ title: string; severity: string }>;
    }
  ) {
    return ScoringEngine.evaluateDiscoveredPlace(place, audit);
  }
}

export const serverScoringEngine = new ScoringEngine();
