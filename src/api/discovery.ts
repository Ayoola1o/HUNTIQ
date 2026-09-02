import { apiClient } from './client';
import type {
  DiscoveredBusiness,
  DiscoveryQuery,
  DiscoverySearchResult,
  NicheTemplate
} from '../types/discovery';
import { discoveryEngine } from '../engine/discoveryEngine';

/**
 * Executes a Business & Niche Discovery search across Local, E-Commerce, or Competitor Gap modes.
 */
export async function discoverBusinesses(query: DiscoveryQuery): Promise<DiscoverySearchResult> {
  try {
    const result = await apiClient.post<DiscoverySearchResult>('/api/discovery/search', query);
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    return discoveryEngine.search(query);
  }
}

/**
 * Fetch preset niche and industry discovery templates.
 */
export async function getDiscoveryTemplates(): Promise<NicheTemplate[]> {
  try {
    const result = await apiClient.get<NicheTemplate[]>('/api/discovery/templates');
    return result;
  } catch (_err) {
    return [
      {
        id: 'dentist-lekki',
        title: 'Dental Clinics in Lekki',
        mode: 'local_business',
        industry: 'Healthcare / Dental',
        defaultLocation: 'Lekki, Lagos',
        defaultKeywords: ['dentist in lekki', 'dental clinic lekki', 'teeth whitening lekki', 'emergency dentist lekki'],
        description: 'High-margin elective & restorative dental practices in prime commercial districts.'
      },
      {
        id: 'fashion-ecom-ng',
        title: "Women's Fashion Stores in Nigeria",
        mode: 'ecommerce_niche',
        industry: 'E-Commerce / Fashion',
        defaultLocation: 'Nigeria (Nationwide E-commerce)',
        defaultKeywords: ['buy women dresses online nigeria', 'affordable stylish clothing lagos', 'modest fashion store nigeria'],
        description: 'DTC fashion brands with high product turnover competing against general marketplaces.'
      },
      {
        id: 'rest-vi-lagos',
        title: 'Fine Dining & Bistros in Victoria Island',
        mode: 'local_business',
        industry: 'Hospitality / Restaurants',
        defaultLocation: 'Victoria Island, Lagos',
        defaultKeywords: ['best restaurants in vi lagos', 'fine dining victoria island', 'brunch spots in vi'],
        description: 'Premium dining establishments losing high-intent weekend reservations to competitors on Google Maps.'
      },
      {
        id: 'running-shoes-ecom',
        title: 'Running Shoes & Footwear E-Commerce',
        mode: 'ecommerce_niche',
        industry: 'E-Commerce / Footwear',
        defaultLocation: 'Nigeria (Nationwide)',
        defaultKeywords: ['running shoes lagos', 'buy sneakers online nigeria', 'athletic gym shoes price'],
        description: 'Specialty footwear stores outranked on category pages by Jumia and regional resellers.'
      },
      {
        id: 'solar-energy-gap',
        title: 'Solar & Inverter Installers (Competitor Gap)',
        mode: 'competitor_gap',
        industry: 'Renewable Energy / Home Services',
        defaultLocation: 'Lagos & Abuja',
        defaultKeywords: ['solar installation company lagos', 'inverter system for home abuja', 'solar installer cost'],
        description: 'High commercial intent providers ranking on page 3 while top 3 competitors capture all commercial inquiries.'
      }
    ];
  }
}

/**
 * Fetch a single discovered business by ID.
 */
export async function getDiscoveredBusiness(id: string): Promise<DiscoveredBusiness> {
  try {
    return await apiClient.get<DiscoveredBusiness>(`/api/discovery/${id}`);
  } catch (_err) {
    const fallback = discoveryEngine.search({ mode: 'local_business', location: 'Lekki, Lagos', nicheOrIndustry: 'Dental Clinics' });
    const found = fallback.businesses.find(b => b.id === id);
    if (!found) throw new Error(`Discovered business ${id} not found`);
    return found;
  }
}
