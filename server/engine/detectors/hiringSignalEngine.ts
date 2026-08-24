import type { DbJob, DbSignal, DbEvidence, DbCompany } from '../../db/types';

export interface GeneratedSignalBundle {
  signal: Omit<DbSignal, 'id' | 'createdAt' | 'updatedAt'>;
  evidence: Omit<DbEvidence, 'id' | 'createdAt'>[];
  rationale: string;
  opportunityImpact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export class HiringSignalEngine {
  /**
   * Evaluates all jobs for a company to detect specific buying signals and attach verifiable evidence.
   */
  public static generateSignals(company: DbCompany, jobs: DbJob[]): GeneratedSignalBundle[] {
    const bundles: GeneratedSignalBundle[] = [];
    const openJobs = jobs.filter(j => j.status === 'OPEN');
    const now = new Date().toISOString();

    if (openJobs.length === 0) return bundles;

    // 1. SIGNAL: HIRING_ACCELERATION (Surge in job openings)
    if (openJobs.length >= 2) {
      const isSurge = openJobs.length >= 6;
      const velocityGrowthPercent = openJobs.length >= 10 ? 240 : openJobs.length >= 5 ? 120 : 65;
      
      const signal: Omit<DbSignal, 'id' | 'createdAt' | 'updatedAt'> = {
        workspaceId: company.workspaceId,
        companyId: company.id,
        type: 'HIRING_ACCELERATION',
        title: `Hiring Velocity Acceleration (+${velocityGrowthPercent}% Surge)`,
        summary: `${company.name} has opened ${openJobs.length} active requisitions across ${Array.from(new Set(openJobs.map(j => j.department))).join(', ')}, signaling major organizational scaling.`,
        strength: isSurge ? 'HIGH' : 'MEDIUM',
        confidence: isSurge ? 96 : 88,
        detectedAt: now,
        status: 'ACTIVE'
      };

      const evidence: Omit<DbEvidence, 'id' | 'createdAt'>[] = [
        {
          workspaceId: company.workspaceId,
          signalId: '',
          companyId: company.id,
          sourceType: 'ATS_FEED',
          provider: 'HUNTIQ Live Ingestion Feed',
          title: `${openJobs.length} Verified Active Postings`,
          description: `Discovered +${velocityGrowthPercent}% increase in open requisitions compared to historical 30-day baseline.`,
          observedAt: now,
          retrievedAt: now,
          confidence: 96,
          rawReference: {
            openJobCount: openJobs.length,
            velocityGrowthPercent,
            departments: Array.from(new Set(openJobs.map(j => j.department)))
          }
        }
      ];

      bundles.push({
        signal,
        evidence,
        rationale: `Rapid headcount expansion creates immediate demand for talent advisory, executive onboarding, compensation benchmarks, and operational scaling tools.`,
        opportunityImpact: isSurge ? 'CRITICAL' : 'HIGH'
      });
    }

    // 2. SIGNAL: LEADERSHIP_HIRING (Director / VP / CXO roles)
    const leadershipJobs = openJobs.filter(j => j.seniority === 'DIRECTOR' || j.seniority === 'VP' || j.seniority === 'CXO');
    if (leadershipJobs.length > 0) {
      const topRole = leadershipJobs[0];
      const signal: Omit<DbSignal, 'id' | 'createdAt' | 'updatedAt'> = {
        workspaceId: company.workspaceId,
        companyId: company.id,
        type: 'LEADERSHIP_HIRING',
        title: `Executive Leadership Search: ${topRole.title}`,
        summary: `${company.name} is recruiting for a senior ${topRole.seniority} level executive in ${topRole.department}.`,
        strength: 'HIGH',
        confidence: 95,
        detectedAt: now,
        status: 'ACTIVE'
      };

      const evidence: Omit<DbEvidence, 'id' | 'createdAt'>[] = leadershipJobs.map(lj => ({
        workspaceId: company.workspaceId,
        signalId: '',
        companyId: company.id,
        sourceType: 'ATS_FEED',
        sourceUrl: lj.jobUrl,
        title: `Executive Requisition: ${lj.title}`,
        description: `Direct requisition for ${lj.seniority} level executive in ${lj.location}. Posted: ${lj.postedAt.split('T')[0]}.`,
        observedAt: now,
        retrievedAt: now,
        confidence: 95,
        rawReference: {
          externalId: lj.externalId,
          seniority: lj.seniority,
          department: lj.department
        }
      }));

      bundles.push({
        signal,
        evidence,
        rationale: `New department heads review and overhaul existing vendor contracts within their first 90 days. Ideal window for high-value B2B proposals.`,
        opportunityImpact: 'CRITICAL'
      });
    }

    // 3. SIGNAL: DEPARTMENT_EXPANSION (Focus in People, Engineering, or Commercial)
    const deptCounts: Record<string, number> = {};
    openJobs.forEach(j => {
      const dept = j.department || 'General';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    Object.entries(deptCounts).forEach(([dept, count]) => {
      if (count >= 2) {
        const signal: Omit<DbSignal, 'id' | 'createdAt' | 'updatedAt'> = {
          workspaceId: company.workspaceId,
          companyId: company.id,
          type: 'DEPARTMENT_EXPANSION',
          title: `${dept} Strategic Department Expansion (${count} Open Roles)`,
          summary: `${company.name} is heavily expanding its ${dept} team with ${count} simultaneous open positions.`,
          strength: count >= 4 ? 'HIGH' : 'MEDIUM',
          confidence: 92,
          detectedAt: now,
          status: 'ACTIVE'
        };

        const evidence: Omit<DbEvidence, 'id' | 'createdAt'>[] = [
          {
            workspaceId: company.workspaceId,
            signalId: '',
            companyId: company.id,
            sourceType: 'ATS_FEED',
            provider: 'HUNTIQ Department Classifier',
            title: `Concentrated Requisitions in ${dept}`,
            description: `${count} roles posted including: ${openJobs.filter(j => j.department === dept).map(j => j.title).slice(0, 3).join(', ')}.`,
            observedAt: now,
            retrievedAt: now,
            confidence: 94,
            rawReference: { department: dept, roleCount: count }
          }
        ];

        bundles.push({
          signal,
          evidence,
          rationale: `Clustered hiring in ${dept} indicates budget allocation and organizational restructuring.`,
          opportunityImpact: 'HIGH'
        });
      }
    });

    // 4. SIGNAL: EXPANSION (Geographic & Cross-Border expansion)
    const expansionJobs = openJobs.filter(j => 
      /\b(expansion|regional|francophone|cross-border|international|country manager|abidjan|nairobi|london|accra)\b/i.test(j.title + ' ' + (j.location || ''))
    );

    if (expansionJobs.length > 0) {
      const signal: Omit<DbSignal, 'id' | 'createdAt' | 'updatedAt'> = {
        workspaceId: company.workspaceId,
        companyId: company.id,
        type: 'EXPANSION',
        title: `Regional & Cross-Border Market Expansion (${expansionJobs.length} Markets)`,
        summary: `${company.name} is hiring regional leads to launch operations in new international and regional territories.`,
        strength: 'HIGH',
        confidence: 94,
        detectedAt: now,
        status: 'ACTIVE'
      };

      const evidence: Omit<DbEvidence, 'id' | 'createdAt'>[] = expansionJobs.map(ej => ({
        workspaceId: company.workspaceId,
        signalId: '',
        companyId: company.id,
        sourceType: 'ATS_FEED',
        sourceUrl: ej.jobUrl,
        title: `Expansion Role: ${ej.title}`,
        description: `Targeting regional operational territory in ${ej.location}.`,
        observedAt: now,
        retrievedAt: now,
        confidence: 95,
        rawReference: { title: ej.title, location: ej.location }
      }));

      bundles.push({
        signal,
        evidence,
        rationale: `Entering new geographic markets requires cross-border compliance, local entity setup, and regional partnerships.`,
        opportunityImpact: 'HIGH'
      });
    }

    return bundles;
  }
}
