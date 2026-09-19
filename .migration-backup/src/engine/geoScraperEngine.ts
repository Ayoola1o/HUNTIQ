import { DigitalAuditEngine } from './digitalAuditEngine';
import type { DigitalAuditPackage } from '../types/digitalAudit';

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
  targetType: 'ENTERPRISE' | 'LOCAL_COMMERCIAL';
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
  digitalAudit: DigitalAuditPackage;
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
    // 1. Enterprise Scale Tech Hub
    {
      id: 'geo-1',
      placeId: 'ChIJ_823n9X_OxARy7_01',
      name: 'Paystack Payments Ltd',
      targetType: 'ENTERPRISE',
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
      digitalAudit: DigitalAuditEngine.audit({
        id: 'geo-1',
        name: 'Paystack Payments Ltd',
        category: 'Financial Technology',
        website: 'https://paystack.com',
        rating: 4.8,
        reviewCount: 342,
        district: 'Ikeja GRA',
        hasOnlineBooking: true,
        hasAdTrackingPixels: true,
        isActivelyRunningAds: true,
        hasEmailCaptureFlows: true
      }),
      decisionMakers: [
        { name: 'Shola Akinlade', role: 'Chief Executive Officer', email: 'shola@paystack.com' },
        { name: 'Amara Nwosu', role: 'Head of People Operations', email: 'amara.nwosu@paystack.com' }
      ],
      detectedSignals: ['Opening Francophone regional hubs', 'Hiring 30+ engineering roles (+240% surge)'],
      techStack: ['React', 'AWS', 'Node.js', 'PostgreSQL', 'Meta Pixel', 'Klaviyo'],
      headcountEstimate: '300-500 employees',
      scrapedAt: 'Just now'
    },

    // 2. Local Commercial: Critical Digital Gap (No Website, Generic Email, No Ads/Pixel)
    {
      id: 'geo-2',
      placeId: 'ChIJ_918b2L_OxARk9_02',
      name: 'Premier Orthopedic & Trauma Clinic',
      targetType: 'LOCAL_COMMERCIAL',
      category: 'Healthcare & Specialized Medical',
      address: '42 Admiralty Way, Lekki Phase 1, Lagos',
      district: 'Lekki Phase 1 Commercial Hub',
      lat: 6.4489,
      lng: 3.4735,
      rating: 3.4,
      reviewCount: 4,
      phone: '+234 803 411 9088',
      website: '',
      domain: 'gmail.com',
      isVerified: false,
      opportunityScore: 92,
      digitalAudit: DigitalAuditEngine.audit({
        id: 'geo-2',
        name: 'Premier Orthopedic & Trauma Clinic',
        category: 'Healthcare & Specialized Medical',
        website: '',
        rating: 3.4,
        reviewCount: 4,
        district: 'Lekki Phase 1',
        hasOnlineBooking: false,
        hasAdTrackingPixels: false,
        isActivelyRunningAds: false,
        hasEmailCaptureFlows: false
      }),
      decisionMakers: [
        { name: 'Dr. Kunle Adeleke', role: 'Medical Director / Owner', email: 'premierorthoclinic.ng@gmail.com' }
      ],
      detectedSignals: ['High local inquiry volume', 'Zero web booking portal', 'No retargeting pixel or ads', 'Unclaimed Google profile'],
      techStack: ['None (Analog Records)'],
      headcountEstimate: '25-50 employees',
      scrapedAt: 'Just now'
    },

    // 3. Local Commercial: Outdated Insecure Site, Running Google Ads without Email Retargeting
    {
      id: 'geo-3',
      placeId: 'ChIJ_554a9M_OxARr8_03',
      name: 'Apex Haulage & Inter-State Logistics',
      targetType: 'LOCAL_COMMERCIAL',
      category: 'Transportation & Commercial Logistics',
      address: '18 Commercial Ave, Yaba, Lagos',
      district: 'Yaba Tech Corridor',
      lat: 6.5142,
      lng: 3.3768,
      rating: 3.6,
      reviewCount: 12,
      phone: '+234 802 889 1234',
      website: 'http://apexhaulageng.com',
      domain: 'apexhaulageng.com',
      isVerified: false,
      opportunityScore: 89,
      digitalAudit: DigitalAuditEngine.audit({
        id: 'geo-3',
        name: 'Apex Haulage & Inter-State Logistics',
        category: 'Transportation & Freight Logistics',
        website: 'http://apexhaulageng.com',
        rating: 3.6,
        reviewCount: 12,
        district: 'Yaba Commercial',
        hasOnlineBooking: false,
        hasAdTrackingPixels: true,
        isActivelyRunningAds: true,
        hasEmailCaptureFlows: false
      }),
      decisionMakers: [
        { name: 'Alhaji Bashir Umar', role: 'Managing Partner', email: 'operations@apexhaulageng.com' }
      ],
      detectedSignals: ['Active Google Ads spend on non-secure HTTP site', 'Zero automated email follow-up', 'Missing instant booking quote calculator'],
      techStack: ['WordPress 4.9', 'PHP 7.2', 'Google Ads Tag'],
      headcountEstimate: '40-80 employees',
      scrapedAt: 'Just now'
    },

    // 4. Local Commercial: Premium Law Firm with Outdated Presence & No Email Automation
    {
      id: 'geo-4',
      placeId: 'ChIJ_772e3K_OxARw1_04',
      name: 'Crown Legal Chambers & Arbitration Partners',
      targetType: 'LOCAL_COMMERCIAL',
      category: 'Legal Services & Corporate Advisory',
      address: '9 Sanusi Fafunwa St, Victoria Island, Lagos',
      district: 'Victoria Island Financial Core',
      lat: 6.4281,
      lng: 3.4219,
      rating: 4.1,
      reviewCount: 7,
      phone: '+234 1 270 4500',
      website: 'http://crownlegalchambers.com',
      domain: 'crownlegalchambers.com',
      isVerified: true,
      opportunityScore: 86,
      digitalAudit: DigitalAuditEngine.audit({
        id: 'geo-4',
        name: 'Crown Legal Chambers & Arbitration Partners',
        category: 'Legal & Corporate Advisory',
        website: 'http://crownlegalchambers.com',
        rating: 4.1,
        reviewCount: 7,
        district: 'Victoria Island',
        hasOnlineBooking: false,
        hasAdTrackingPixels: false,
        isActivelyRunningAds: false,
        hasEmailCaptureFlows: false
      }),
      decisionMakers: [
        { name: 'Barrister Femi Coker', role: 'Senior Partner', email: 'femi.coker@crownlegalchambers.com' }
      ],
      detectedSignals: ['Unencrypted client intake portal', 'No automated email consultation scheduler', 'Zero retargeting ad campaigns'],
      techStack: ['Custom HTML', 'Apache'],
      headcountEstimate: '20-40 employees',
      scrapedAt: 'Just now'
    },

    // 5. Local Commercial: Boutique Luxury Hotel & Spa with Missing Mobile Checkout
    {
      id: 'geo-5',
      placeId: 'ChIJ_331d8V_OxARt4_05',
      name: 'Grandeur Suites & Wellness Spa',
      targetType: 'LOCAL_COMMERCIAL',
      category: 'Hospitality & Luxury Wellness',
      address: '14 Queen’s Drive, Ikoyi, Lagos',
      district: 'Ikoyi Executive District',
      lat: 6.4512,
      lng: 3.4355,
      rating: 4.6,
      reviewCount: 89,
      phone: '+234 1 461 7000',
      website: 'https://grandeursuites.ng',
      domain: 'grandeursuites.ng',
      isVerified: true,
      opportunityScore: 84,
      digitalAudit: DigitalAuditEngine.audit({
        id: 'geo-5',
        name: 'Grandeur Suites & Wellness Spa',
        category: 'Hospitality & Wellness',
        website: 'https://grandeursuites.ng',
        rating: 4.6,
        reviewCount: 89,
        district: 'Ikoyi',
        hasOnlineBooking: true,
        hasAdTrackingPixels: true,
        isActivelyRunningAds: true,
        hasEmailCaptureFlows: false
      }),
      decisionMakers: [
        { name: 'Folake Adeleke', role: 'General Manager', email: 'folake@grandeursuites.ng' }
      ],
      detectedSignals: ['Running Meta/Instagram ads', 'High booking abandonment rate', 'Static email form with no automated guest retention flows'],
      techStack: ['Wix', 'Meta Pixel', 'Stripe'],
      headcountEstimate: '50-100 employees',
      scrapedAt: 'Just now'
    },

    // 6. Enterprise Scale FinTech
    {
      id: 'geo-6',
      placeId: 'ChIJ_492a7V_OxARm2_02',
      name: 'Flutterwave Global Hub',
      targetType: 'ENTERPRISE',
      category: 'Enterprise Payments & Global Settlements',
      address: '8 Providence St, Lekki Phase 1, Lagos',
      district: 'Lekki Phase 1 Commercial Hub',
      lat: 6.4431,
      lng: 3.4812,
      rating: 4.5,
      reviewCount: 289,
      phone: '+234 1 227 0000',
      website: 'https://flutterwave.com',
      domain: 'flutterwave.com',
      isVerified: true,
      opportunityScore: 95,
      digitalAudit: DigitalAuditEngine.audit({
        id: 'geo-6',
        name: 'Flutterwave Global Hub',
        category: 'Enterprise Payments',
        website: 'https://flutterwave.com',
        rating: 4.5,
        reviewCount: 289,
        district: 'Lekki Phase 1',
        hasOnlineBooking: true,
        hasAdTrackingPixels: true,
        isActivelyRunningAds: true,
        hasEmailCaptureFlows: true
      }),
      decisionMakers: [
        { name: 'Gbenga Agboola', role: 'Chief Executive Officer', email: 'gbenga@flutterwave.com' },
        { name: 'Bolu Oladipo', role: 'VP of Commercial Strategy', email: 'bolu@flutterwave.com' }
      ],
      detectedSignals: ['Enterprise hiring surge (+180%)', 'New regional offices in North America and Europe'],
      techStack: ['Next.js', 'GCP', 'Node.js', 'Salesforce', 'Meta Pixel', 'HubSpot'],
      headcountEstimate: '500-1000 employees',
      scrapedAt: 'Just now'
    },

    // 7. Local Commercial: Auto Diagnostic Center (No Website, 0 Ads, @gmail for Invoices)
    {
      id: 'geo-7',
      placeId: 'ChIJ_228c1P_OxARq6_07',
      name: 'Heritage Precision Auto Spa & Garage',
      targetType: 'LOCAL_COMMERCIAL',
      category: 'Automotive Repairs & Fleet Maintenance',
      address: '88 Kudirat Abiola Way, Oregun, Ikeja, Lagos',
      district: 'Ikeja Commercial / Airport District',
      lat: 6.6012,
      lng: 3.3644,
      rating: 3.2,
      reviewCount: 3,
      phone: '+234 809 555 7890',
      website: '',
      domain: 'gmail.com',
      isVerified: false,
      opportunityScore: 91,
      digitalAudit: DigitalAuditEngine.audit({
        id: 'geo-7',
        name: 'Heritage Precision Auto Spa & Garage',
        category: 'Automotive Repairs & Fleet Maintenance',
        website: '',
        rating: 3.2,
        reviewCount: 3,
        district: 'Ikeja Oregun',
        hasOnlineBooking: false,
        hasAdTrackingPixels: false,
        isActivelyRunningAds: false,
        hasEmailCaptureFlows: false
      }),
      decisionMakers: [
        { name: 'Engr. Tunde Bakare', role: 'Head of Engineering & Owner', email: 'heritageprecisionauto@gmail.com' }
      ],
      detectedSignals: ['High commercial fleet demand in district', 'Zero online booking portal', 'No retargeting pixel or Google search ads', 'Unclaimed Google profile'],
      techStack: ['None (Paper Job Cards)'],
      headcountEstimate: '15-30 employees',
      scrapedAt: 'Just now'
    }
  ];

  public scrapeZone(
    _zoneId: string = 'lagos',
    district: string = 'All Districts',
    _radiusKm: number = 15,
    category: string = 'All Industries',
    targetMode: 'ALL' | 'ENTERPRISE' | 'LOCAL_COMMERCIAL' | 'DIGITAL_GAP' = 'ALL'
  ): GeoScrapedBusiness[] {
    let list = this.scrapedRecords;

    if (district && district !== 'All Districts') {
      list = list.filter(b => b.district.toLowerCase().includes(district.toLowerCase()) || district.toLowerCase().includes(b.district.toLowerCase()));
    }

    if (category && category !== 'All Industries') {
      list = list.filter(b => b.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (targetMode === 'ENTERPRISE') {
      list = list.filter(b => b.targetType === 'ENTERPRISE');
    } else if (targetMode === 'LOCAL_COMMERCIAL') {
      list = list.filter(b => b.targetType === 'LOCAL_COMMERCIAL');
    } else if (targetMode === 'DIGITAL_GAP') {
      list = list.filter(b => 
        b.digitalAudit.fixPriority === 'CRITICAL' || 
        b.digitalAudit.fixPriority === 'HIGH' ||
        b.digitalAudit.gapScore >= 50
      );
    }

    return list;
  }
}

export const geoScraperEngine = new GeoScraperEngine();
