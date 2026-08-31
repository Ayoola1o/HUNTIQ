import { GreenhouseJobProvider } from './greenhouse.provider';
import { LeverJobProvider } from './lever.provider';
import { AshbyJobProvider } from './ashby.provider';
import { jobProviderRegistry } from './provider-registry';

export const registerDefaultJobProviders = () => {
  jobProviderRegistry.register(new GreenhouseJobProvider());
  jobProviderRegistry.register(new LeverJobProvider());
  jobProviderRegistry.register(new AshbyJobProvider());
};

export * from './job-provider';
export * from './provider-registry';
export * from './greenhouse.provider';
export * from './lever.provider';
export * from './ashby.provider';

