import type { JobProvider, JobProviderName } from './job-provider';

export class JobProviderRegistry {
  private readonly providers = new Map<JobProviderName, JobProvider>();

  register(provider: JobProvider): void {
    this.providers.set(provider.provider, provider);
  }

  get(providerName: JobProviderName): JobProvider | undefined {
    return this.providers.get(providerName);
  }

  has(providerName: JobProviderName): boolean {
    return this.providers.has(providerName);
  }
}

export const jobProviderRegistry = new JobProviderRegistry();
