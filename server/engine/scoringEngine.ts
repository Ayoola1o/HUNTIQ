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
    let velocityScore = 30;

    if (openJobs.length >= 10) {
      velocityScore = 95;
      keyDrivers.push(`High hiring surge (${openJobs.length} active open roles)`);
    } else if (openJobs.length >= 5) {
      velocityScore = 80;
      keyDrivers.push(`Strong hiring momentum (${openJobs.length} open roles)`);
    } else if (openJobs.length >= 2) {
      velocityScore = 65;
      keyDrivers.push(`Active recruitment in ${Array.from(new Set(openJobs.map(j => j.department))).slice(0, 2).join(', ')}`);
    } else if (openJobs.length === 1) {
      velocityScore = 50;
    }

    // 2. Buying Signal Surge (Weight: 35%)
    let signalScore = 30;
    const activeSignals = signals.filter(s => s.status === 'ACTIVE');

    if (activeSignals.some(s => s.type === 'HIRING_ACCELERATION')) {
      signalScore += 35;
      keyDrivers.push('Detected rapid hiring acceleration over 14-day window');
    }
    if (activeSignals.some(s => s.type === 'LEADERSHIP_HIRING')) {
      signalScore += 20;
      keyDrivers.push('Executive leadership search underway');
    }
    if (activeSignals.some(s => s.type === 'EXPANSION' || s.type === 'FUNDING')) {
      signalScore += 15;
      keyDrivers.push('Regional expansion or funding growth signal detected');
    }
    signalScore = Math.min(100, signalScore);

    // 3. Contact Reachability & Decision Maker Presence (Weight: 30%)
    let contactReachabilityScore = 20;
    const verifiedExecs = contacts.filter(c => 
      (c.seniority === 'DIRECTOR' || c.seniority === 'VP' || c.seniority === 'CXO') &&
      c.emailStatus === 'VALID'
    );

    if (verifiedExecs.length >= 2) {
      contactReachabilityScore = 95;
      keyDrivers.push(`Multiple verified C-level/Director contacts (${verifiedExecs.map(e => e.firstName).join(', ')})`);
    } else if (verifiedExecs.length === 1) {
      contactReachabilityScore = 85;
      keyDrivers.push(`Verified key decision maker: ${verifiedExecs[0].firstName} ${verifiedExecs[0].lastName} (${verifiedExecs[0].jobTitle})`);
    } else if (contacts.length > 0) {
      contactReachabilityScore = 55;
    }

    // Composite Weighted Score
    const totalScore = Math.round(
      velocityScore * 0.35 +
      signalScore * 0.35 +
      contactReachabilityScore * 0.30
    );

    const tier: OpportunityEvaluation['tier'] = 
      totalScore >= 85 ? 'Tier 1' : totalScore >= 70 ? 'Tier 2' : 'Tier 3';

    // Estimated Deal Value Calculation based on Employee size & Velocity
    const empCount = parseInt(company.employeeCount || '100', 10) || 100;
    let baseDeal = empCount > 500 ? 45000 : empCount > 200 ? 30000 : 18000;
    if (totalScore >= 90) baseDeal *= 1.25;

    const estimatedDealValue = Math.round(baseDeal / 1000) * 1000;
    const conversionProbability = Math.min(92, Math.max(25, Math.round(totalScore * 0.9)));

    let recommendedAction = 'Monitor for additional buying signals';
    if (totalScore >= 85) {
      recommendedAction = verifiedExecs.length > 0 
        ? `Initiate personalized outreach to ${verifiedExecs[0].firstName} ${verifiedExecs[0].lastName} focusing on strategic scaling`
        : 'Run automated decision-maker enrichment to resolve C-level contacts';
    } else if (totalScore >= 70) {
      recommendedAction = 'Add account to high-priority watchlist and initiate discovery research';
    }

    return {
      totalScore,
      tier,
      velocityScore,
      icpFitScore: signalScore,
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
    let score = 50; // Base baseline for commercial entity discovery

    // Factor 1: Verified Local Presence
    if (place.address) {
      score += 12;
      factors.push({
        type: 'company_presence',
        value: 12,
        evidence: `Verified active commercial address: ${place.address}`
      });
    }

    // Factor 2: Digital Presence Gap or Web Maturity
    if (!place.website) {
      score += 20;
      factors.push({
        type: 'digital_gap_opportunity',
        value: 20,
        evidence: 'High conversion urgency: No verified website found on Google Maps'
      });
    } else if (audit?.gapScore && audit.gapScore >= 70) {
      score += 18;
      factors.push({
        type: 'performance_gap_opportunity',
        value: 18,
        evidence: `Significant digital friction detected (Gap score: ${audit.gapScore}/100)`
      });
    } else {
      score += 10;
      factors.push({
        type: 'digital_optimization',
        value: 10,
        evidence: 'Active digital presence ready for advanced optimization & modernization'
      });
    }

    // Factor 3: Google Maps Review Traction
    if (place.reviewCount && place.reviewCount > 0) {
      const val = Math.min(15, Math.round(place.reviewCount / 5));
      score += val;
      factors.push({
        type: 'market_traction',
        value: val,
        evidence: `${place.reviewCount} customer reviews recorded on Google Maps`
      });
    }

    // Factor 4: Verified Contact Channel
    if (place.phone) {
      score += 8;
      factors.push({
        type: 'contact_reachability',
        value: 8,
        evidence: 'Verified direct business telephone channel available'
      });
    }

    return {
      score: Math.min(98, score),
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
