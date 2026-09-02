import type {
  DiscoveredBusiness,
  DiscoveryQuery,
  DiscoverySearchResult,
  NicheTemplate
} from '../../src/types/discovery';
import { discoveryEngine, DiscoveryEngine } from '../../src/engine/discoveryEngine';

export class DiscoveryService {
  private cache: Map<string, DiscoveredBusiness> = new Map();

  constructor() {
    // Seed initial cache with local business and e-commerce presets
    const initialLocal = discoveryEngine.search({ mode: 'local_business', location: 'Lekki, Lagos', nicheOrIndustry: 'Dental Clinics' });
    const initialEcom = discoveryEngine.search({ mode: 'ecommerce_niche', location: 'Nigeria', nicheOrIndustry: "Women's Fashion" });
    const initialGap = discoveryEngine.search({ mode: 'competitor_gap', location: 'Lagos & Abuja', nicheOrIndustry: 'Renewable Energy' });

    [...initialLocal.businesses, ...initialEcom.businesses, ...initialGap.businesses].forEach(b => {
      this.cache.set(b.id, b);
    });
  }

  /**
   * Search and evaluate businesses according to the Phase 1 Business/Niche Discovery workflow.
   */
  public search(query: DiscoveryQuery): DiscoverySearchResult {
    const result = discoveryEngine.search(query);
    result.businesses.forEach(b => {
      this.cache.set(b.id, b);
    });
    return result;
  }

  /**
   * Get single discovered business by ID.
   */
  public getById(id: string): DiscoveredBusiness | undefined {
    return this.cache.get(id);
  }

  /**
   * Return preset niche and search templates.
   */
  public getTemplates(): NicheTemplate[] {
    return DiscoveryEngine.PRESET_TEMPLATES;
  }
}

export const discoveryService = new DiscoveryService();
