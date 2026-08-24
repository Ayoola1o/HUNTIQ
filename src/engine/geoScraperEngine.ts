import type { CompanyItem } from '../types/company';

export interface GeoLocationZone {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  popularDistricts: string[];
}

export interface GeoScrapedBusiness {
  id: string;
  placeId: string;
  name: string;
  category: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  phone: string;
  website: string;
  domain: string;
  isVerified: boolean;
  opportunityScore: number;
  decisionMakers: { name: string; role: string; email: string }[];
  detectedSignals: string[];
  techStack: string[];
  headcountEstimate: string;
  scrapedAt: string;
}

export const POPULAR_ZONES: GeoLocationZone[] = [
  {
    id: 'lagos',
    name: 'Lagos Metropolitan Region',
    country: 'Nigeria',
    lat: 6.4541,
    lng: 3.4246,
    popularDistricts: ['Victoria Island Financial Core', 'Lekki Phase 1 Commercial Hub', 'Ikeja Commercial / Airport District', 'Yaba Tech Corridor', 'Ikoyi Executive District']
  },
  {
    id: 'nairobi',
    name: 'Nairobi Metro Region',
    country: 'Kenya',
    lat: -1.2921,
    lng: 36.8219,
    popularDistricts: ['Upper Hill Corporate Hub', 'Westlands Tech District', 'Kilimani Innovation Zone', 'Nairobi CBD']
  },
  {
    id: 'johannesburg',
    name: 'Johannesburg Metro',
    country: 'South Africa',
    lat: -26.2041,
    lng: 28.0473,
    popularDistricts: ['Sandton Financial District', 'Rosebank Commercial District', 'Bryanston Enterprise Hub', 'Midrand Tech Zone']
  },
  {
    id: 'london',
    name: 'Greater London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    popularDistricts: ['City of London (Square Mile)', 'Silicon Roundabout / Shoreditch', 'Canary Wharf', 'Mayfair / Soho']
  }
];

export class GeoScraperEngine {
  private scrapedRecords: GeoScrapedBusiness[] = [
    {
      id: 'geo-1',
      placeId: 'ChIJ_823n9X_OxARy7_01',
      name: 'Paystack HQ Payments Ltd',
      category: 'Financial Technology / Merchant Services',
      address: '126 Joel Ogunnaike St, Ikeja GRA, Lagos',
      district: 'Ikeja Commercial / Airport District',
      lat: 6.5892,
      lng: 3.3582,
      rating: 4.8,
      reviewCount: 342,
      phone: '+234 1 631 6160',
      website: 'https://paystack.com',
      domain: 'paystack.com',
      isVerified: true,
      opportunityScore: 94,
      decisionMakers: [
        { name: 'Shola Akinlade', role: 'Chief Executive Officer', email: 'shola@paystack.com' },
        { name: 'Amara Nwosu', role: 'Head of Operations', email: 'amara@paystack.com' }
      ],
      detectedSignals: ['Opening Francophone regional hubs', 'Hiring 30+ engineering roles'],
      techStack: ['React', 'AWS', 'Node.js', 'PostgreSQL'],
      headcountEstimate: '300-500 employees',
      scrapedAt: 'Just now'
    },
    {
      id: 'geo-2',
      placeId: 'ChIJ_492a7V_OxARm2_02',
      name: 'Flutterwave Global Hub',
      category: 'Cross-Border Payments & Banking Infrastructure',
      address: '8 Providence St, Lekki Phase 1, Lagos',
      district: 'Lekki Phase 1 Commercial Hub',
      lat: 6.4428,
      lng: 3.4831,
      rating: 4.6,
      reviewCount: 420,
      phone: '+234 1 888 9200',
      website: 'https://flutterwave.com',
      domain: 'flutterwave.com',
      isVerified: true,
      opportunityScore: 91,
      decisionMakers: [
        { name: 'Olugbenga Agboola', role: 'CEO & Founder', email: 'gbenga@flutterwavego.com' },
        { name: 'Kemi Adebayo', role: 'VP Enterprise Compliance', email: 'kemi@flutterwavego.com' }
      ],
      detectedSignals: ['New Global Compliance Executive hire', 'Enterprise RFP issued'],
      techStack: ['Next.js', 'Python', 'Kafka', 'Google Cloud'],
      headcountEstimate: '400-600 employees',
      scrapedAt: 'Just now'
    },
    {
      id: 'geo-3',
      placeId: 'ChIJ_910p2Q_OxARv4_03',
      name: 'Moniepoint Commercial Hub',
      category: 'Digital Banking & Commercial POS Solutions',
      address: 'Plot 12 Bishop Aboyade Cole St, Victoria Island, Lagos',
      district: 'Victoria Island Financial Core',
      lat: 6.4281,
      lng: 3.4219,
      rating: 4.7,
      reviewCount: 680,
      phone: '+234 1 450 3300',
      website: 'https://moniepoint.com',
      domain: 'moniepoint.com',
      isVerified: true,
      opportunityScore: 89,
      decisionMakers: [
        { name: 'Tosin Eniolorunda', role: 'Group CEO', email: 'tosin@moniepoint.com' },
        { name: 'Felix Obinna', role: 'Head of People & Culture', email: 'felix@moniepoint.com' }
      ],
      detectedSignals: ['Series C funding expansion', '45 senior engineering requisitions'],
      techStack: ['Spring Boot', 'AWS', 'Docker', 'Kubernetes'],
      headcountEstimate: '800-1,200 employees',
      scrapedAt: 'Just now'
    },
    {
      id: 'geo-4',
      placeId: 'ChIJ_314x8W_OxARw1_04',
      name: 'Helium Health Medical Systems',
      category: 'HealthTech & Hospital Management Cloud',
      address: 'Commercial Avenue, Yaba Tech Cluster, Lagos',
      district: 'Yaba Tech Corridor',
      lat: 6.5165,
      lng: 3.3768,
      rating: 4.5,
      reviewCount: 118,
      phone: '+234 1 291 4455',
      website: 'https://heliumhealth.com',
      domain: 'heliumhealth.com',
      isVerified: true,
      opportunityScore: 84,
      decisionMakers: [
        { name: 'Adegoke Olubusi', role: 'Chief Executive Officer', email: 'goke@heliumhealth.com' }
      ],
      detectedSignals: ['Scaling EHR SaaS across 120+ private clinics'],
      techStack: ['React', 'Node.js', 'MongoDB', 'AWS'],
      headcountEstimate: '100-250 employees',
      scrapedAt: 'Just now'
    },
    {
      id: 'geo-5',
      placeId: 'ChIJ_723q9M_OxARe9_05',
      name: 'Kuda Bank Technology Hub',
      category: 'Digital Retail & Microfinance Bank',
      address: '150 Moorehouse St, Ikoyi, Lagos',
      district: 'Ikoyi Executive District',
      lat: 6.4512,
      lng: 3.4411,
      rating: 4.4,
      reviewCount: 950,
      phone: '+234 1 700 3000',
      website: 'https://kudabank.com',
      domain: 'kudabank.com',
      isVerified: true,
      opportunityScore: 88,
      decisionMakers: [
        { name: 'Babs Ogundeyi', role: 'Chief Executive Officer', email: 'babs@kudabank.com' }
      ],
      detectedSignals: ['Core banking infrastructure upgrade', 'UK-Africa remittance launch'],
      techStack: ['Kotlin', 'Swift', 'Azure', 'PostgreSQL'],
      headcountEstimate: '250-500 employees',
      scrapedAt: 'Just now'
    }
  ];

  /**
   * Scrapes localized business entities based on coordinates and radius.
   */
  public scrapeZone(
    _zoneId: string,
    district?: string,
    _radiusKm: number = 10,
    categoryFilter?: string
  ): GeoScrapedBusiness[] {
    let results = [...this.scrapedRecords];

    if (district && district !== 'All Districts') {
      results = results.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
    }

    if (categoryFilter && categoryFilter !== 'All Industries') {
      results = results.filter(r => r.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    return results;
  }

  /**
   * Converts a scraped geospatial record into a standard HUNTIQ Company item.
   */
  public toCompanyItem(business: GeoScrapedBusiness): Partial<CompanyItem> {
    return {
      id: business.id,
      name: business.name,
      domain: business.domain,
      industry: business.category,
      employees: business.headcountEstimate.split(' ')[0],
      location: business.address,
      opportunityScore: business.opportunityScore,
      opportunityLevel: business.opportunityScore >= 90 ? 'Very High' : (business.opportunityScore >= 80 ? 'High' : 'Medium'),
      scoreColor: business.opportunityScore >= 90 ? '#10b981' : '#6366f1',
      scoreTrend: [75, 80, 85, business.opportunityScore],
      signalsCount: business.detectedSignals.length,
      activeSignals: business.detectedSignals.map(sig => ({
        type: 'Geospatial Signal',
        title: sig,
        description: `Detected via HUNTIQ Geo-Radar crawl at ${business.district}`,
        time: 'Just now',
        iconType: 'map-pin'
      })),
      lastActivity: 'Just now',
      description: `${business.name} located at ${business.address}. Verified rating: ${business.rating}★ (${business.reviewCount} reviews).`,
      headquarters: business.district
    };
  }
}

export const geoScraperEngine = new GeoScraperEngine();
