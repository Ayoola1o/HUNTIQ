import { GreenhouseJobProvider } from './greenhouse.provider';
import { jobProviderRegistry } from './provider-registry';

export const registerDefaultJobProviders = () => {
  jobProviderRegistry.register(new GreenhouseJobProvider());
};

