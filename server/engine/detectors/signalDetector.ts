import type { DbJob, DbSignal, DbEvidence, DbCompany } from '../../db/types';

export interface DetectedSignalBundle {
  signal: Omit<DbSignal, 'id' | 'createdAt' | 'updatedAt'>;
  evidence: Omit<DbEvidence, 'id' | 'createdAt'>[];
}

export class SignalDetector {
  public static detectFromJobs(company: DbCompany, jobs: DbJob[]): DetectedSignalBundle[] {
    const bundles: DetectedSignalBundle[] = [];
    const openJobs = jobs.filter(j => j.status === 'OPEN');

    if (openJobs.length === 0) return bundles;

    // 1. HIRING ACCELERATION DETECTION
    if (openJobs.length >= 2) {
      const now = new Date().toISOString();
      const signal: Omit<DbSignal, 'id' | 'createdAt' | 'updatedAt'> = {
        workspaceId: company.workspaceId,
        companyId: company.id,
        type: 'HIRING_ACCELERATION',
        title: `Hiring Surge Detected (${openJobs.length} Open Roles)`,
        summary: `${company.name} is accelerating hiring with ${openJobs.length} open strategic positions across ${Array.from(new Set(openJobs.map(j => j.department))).join(', ')}.`,
        strength: openJobs.length >= 5 ? 'HIGH' : 'MEDIUM',
        confidence: Math.min(95, 75 + openJobs.length * 4),
        detectedAt: now,
        status: 'ACTIVE'
      };

      const evidence: Omit<DbEvidence, 'id' | 'createdAt'>[] = [
        {
          workspaceId: company.workspaceId,
          signalId: '', // populated upon insertion
          companyId: company.id,
          sourceType: 'ATS_FEED',
          provider: 'HUNTIQ Ingestion Radar',
          title: `${openJobs.length} Live Job Postings Verified`,
          description: `Discovered active requisitions across key operational departments: ${openJobs.map(j => j.title).slice(0, 3).join('; ')}.`,
          observedAt: now,
          retrievedAt: now,
          confidence: 96,
          rawReference: { jobCount: openJobs.length, jobIds: openJobs.map(j => j.id) }
        }
      ];

      bundles.push({ signal, evidence });
    }

    // 2. LEADERSHIP HIRING DETECTION
    const leadershipJobs = openJobs.filter(j => j.seniority === 'DIRECTOR' || j.seniority === 'VP' || j.seniority === 'CXO');
    if (leadershipJobs.length > 0) {
      const now = new Date().toISOString();
      const topRole = leadershipJobs[0];

      const signal: Omit<DbSignal, 'id' | 'createdAt' | 'updatedAt'> = {
        workspaceId: company.workspaceId,
        companyId: company.id,
        type: 'LEADERSHIP_HIRING',
        title: `Executive Leadership Search: ${topRole.title}`,
        summary: `${company.name} is seeking a senior leader (${topRole.title}) in ${topRole.department}, indicating organizational expansion and high demand for executive advisory.`,
        strength: 'HIGH',
        confidence: 94,
        detectedAt: now,
        status: 'ACTIVE'
      };

      const evidence: Omit<DbEvidence, 'id' | 'createdAt'>[] = [
        {
          workspaceId: company.workspaceId,
          signalId: '',
          companyId: company.id,
          sourceType: 'ATS_FEED',
          sourceUrl: topRole.jobUrl,
          title: `Executive Position Requisition: ${topRole.title}`,
          description: `Direct requisition for ${topRole.seniority} level executive in ${topRole.location}.`,
          observedAt: now,
          retrievedAt: now,
          confidence: 95,
          rawReference: { externalId: topRole.externalId, seniority: topRole.seniority }
        }
      ];

      bundles.push({ signal, evidence });
    }

    return bundles;
  }
}
