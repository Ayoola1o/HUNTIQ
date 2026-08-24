import { db } from '../db/memoryStore';
import type { DbJob, DbJobSource } from '../db/types';

export class JobService {
  public async getJobsByCompany(companyId: string, workspaceId: string): Promise<DbJob[]> {
    return db.getJobsByCompany(companyId, workspaceId);
  }

  public async getJobSourcesByCompany(companyId: string, workspaceId: string): Promise<DbJobSource[]> {
    return db.jobSources.filter(s => s.companyId === companyId && s.workspaceId === workspaceId);
  }

  public async calculateHiringVelocity(companyId: string, workspaceId: string): Promise<{
    activeJobsCount: number;
    velocityScore: number;
    acceleration: 'HIGH' | 'MODERATE' | 'STABLE' | 'DECLINING';
    departments: Record<string, number>;
  }> {
    const jobs = db.getJobsByCompany(companyId, workspaceId).filter(j => j.status === 'OPEN');
    const departments: Record<string, number> = {};

    jobs.forEach(j => {
      const dept = j.department || 'General';
      departments[dept] = (departments[dept] || 0) + 1;
    });

    const activeJobsCount = jobs.length;
    let acceleration: 'HIGH' | 'MODERATE' | 'STABLE' | 'DECLINING' = 'STABLE';
    let velocityScore = 50;

    if (activeJobsCount >= 10) {
      acceleration = 'HIGH';
      velocityScore = 95;
    } else if (activeJobsCount >= 5) {
      acceleration = 'MODERATE';
      velocityScore = 80;
    } else if (activeJobsCount >= 1) {
      acceleration = 'STABLE';
      velocityScore = 65;
    }

    return {
      activeJobsCount,
      velocityScore,
      acceleration,
      departments
    };
  }
}

export const jobService = new JobService();
