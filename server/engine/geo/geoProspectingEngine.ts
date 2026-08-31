import { DigitalAuditEngine } from '../audit/digitalAuditEngine';
import type { DigitalAuditPackage } from '../../types/digitalAudit';

export type GeoProspectMode = 'ALL' | 'ENTERPRISE' | 'LOCAL_COMMERCIAL' | 'DIGITAL_GAP';

export interface GeoLocationCoordinates {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface GeoProspectFilterOptions {
  noWebsite?: boolean;
  unclaimedListing?: boolean;
  genericEmail?: boolean;
  missingBooking?: boolean;
  noAdsOrPixel?: boolean;
  noEmailMarketing?: boolean;
}

export interface GeoDiscoveredBusiness {
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
  discoveredAt: string;
}

export class GeoProspectingEngine {
  private baseRegistry: Array<{
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
    decisionMakers: { name: string; role: string; email: string }[];
    detectedSignals: string[];
    techStack: string[];
    headcountEstimate: string;
    hasOnlineBooking?: boolean;
    hasAdTrackingPixels?: boolean;
    isActivelyRunningAds?: boolean;
    hasEmailCaptureFlows?: boolean;
  }> = [
    // 1. Enterprise Tech
    {
      id: 'geo-ent-1',
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
      decisionMakers: [
        { name: 'Shola Akinlade', role: 'Chief Executive Officer', email: 'shola@paystack.com' },
        { name: 'Amara Nwosu', role: 'Head of People Operations', email: 'amara.nwosu@paystack.com' }
      ],
      detectedSignals: ['Opening Francophone regional hubs', 'Hiring 30+ engineering roles (+240% surge)'],
      techStack: ['React', 'AWS', 'Node.js', 'PostgreSQL', 'Meta Pixel', 'Klaviyo'],
      headcountEstimate: '300-500 employees',
      hasOnlineBooking: true,
      hasAdTrackingPixels: true,
      isActivelyRunningAds: true,
      hasEmailCaptureFlows: true
    },

    // 2. Local Commercial: Critical Digital Gap (No Website, Generic @gmail, No Ads/Pixel)
    {
      id: 'geo-loc-1',
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
      decisionMakers: [
        { name: 'Dr. Kunle Adeleke', role: 'Medical Director / Owner', email: 'premierorthoclinic.ng@gmail.com' }
      ],
      detectedSignals: ['High local inquiry volume in Lekki', 'Zero web booking portal', 'No retargeting pixel or ads', 'Unclaimed Google profile'],
      techStack: ['None (Analog Records)'],
      headcountEstimate: '25-50 employees',
      hasOnlineBooking: false,
      hasAdTrackingPixels: false,
      isActivelyRunningAds: false,
      hasEmailCaptureFlows: false
    },

    // 3. Local Commercial: Outdated Insecure Site, Running Google Ads without Email Retargeting
    {
      id: 'geo-loc-2',
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
      decisionMakers: [
        { name: 'Alhaji Bashir Umar', role: 'Managing Partner', email: 'operations@apexhaulageng.com' }
      ],
      detectedSignals: ['Active Google Ads spend on non-secure HTTP site', 'Zero automated email follow-up', 'Missing instant quote calculator'],
      techStack: ['WordPress 4.9', 'PHP 7.2', 'Google Ads Tag'],
      headcountEstimate: '40-80 employees',
      hasOnlineBooking: false,
      hasAdTrackingPixels: true,
      isActivelyRunningAds: true,
      hasEmailCaptureFlows: false
    },

    // 4. Local Commercial: Premium Law Firm with Outdated Presence & No Email Automation
    {
      id: 'geo-loc-3',
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
      decisionMakers: [
        { name: 'Barrister Femi Coker', role: 'Senior Partner', email: 'femi.coker@crownlegalchambers.com' }
      ],
      detectedSignals: ['Unencrypted client intake portal', 'No automated email consultation scheduler', 'Zero retargeting ad campaigns'],
      techStack: ['Custom HTML', 'Apache'],
      headcountEstimate: '20-40 employees',
      hasOnlineBooking: false,
      hasAdTrackingPixels: false,
      isActivelyRunningAds: false,
      hasEmailCaptureFlows: false
    },

    // 5. Local Commercial: Boutique Luxury Hotel & Spa with Missing Mobile Checkout
    {
      id: 'geo-loc-4',
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
      decisionMakers: [
        { name: 'Folake Adeleke', role: 'General Manager', email: 'folake@grandeursuites.ng' }
      ],
      detectedSignals: ['Running Meta/Instagram ads', 'High booking abandonment rate', 'Static email form with no automated guest retention flows'],
      techStack: ['Wix', 'Meta Pixel', 'Stripe'],
      headcountEstimate: '50-100 employees',
      hasOnlineBooking: true,
      hasAdTrackingPixels: true,
      isActivelyRunningAds: true,
      hasEmailCaptureFlows: false
    },

    // 6. Enterprise FinTech
    {
      id: 'geo-ent-2',
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
      decisionMakers: [
        { name: 'Gbenga Agboola', role: 'Chief Executive Officer', email: 'gbenga@flutterwave.com' },
        { name: 'Bolu Oladipo', role: 'VP of Commercial Strategy', email: 'bolu@flutterwave.com' }
      ],
      detectedSignals: ['Enterprise hiring surge (+180%)', 'New regional offices in North America and Europe'],
      techStack: ['Next.js', 'GCP', 'Node.js', 'Salesforce', 'Meta Pixel', 'HubSpot'],
      headcountEstimate: '500-1000 employees',
      hasOnlineBooking: true,
      hasAdTrackingPixels: true,
      isActivelyRunningAds: true,
      hasEmailCaptureFlows: true
    },

    // 7. Local Commercial: Auto Diagnostic Center (No Website, 0 Ads, @gmail for Invoices)
    {
      id: 'geo-loc-5',
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
      decisionMakers: [
        { name: 'Engr. Tunde Bakare', role: 'Head of Engineering & Owner', email: 'heritageprecisionauto@gmail.com' }
      ],
      detectedSignals: ['High commercial fleet demand in district', 'Zero online booking portal', 'No retargeting pixel or Google search ads', 'Unclaimed Google profile'],
      techStack: ['None (Paper Job Cards)'],
      headcountEstimate: '15-30 employees',
      hasOnlineBooking: false,
      hasAdTrackingPixels: false,
      isActivelyRunningAds: false,
      hasEmailCaptureFlows: false
    }
  ];

  /**
   * Discovers and enriches businesses in a geographic region with full Digital Audit Packages.
   */
  public discover(params: {
    zoneId?: string;
    district?: string;
    radiusKm?: number;
    category?: string;
    mode?: GeoProspectMode;
    filters?: GeoProspectFilterOptions;
  }): GeoDiscoveredBusiness[] {
    const mode = params.mode || 'ALL';
    let records = this.baseRegistry;

    // Filter by district
    if (params.district && params.district !== 'All Districts') {
      records = records.filter(
        b => b.district.toLowerCase().includes(params.district!.toLowerCase()) || 
             params.district!.toLowerCase().includes(b.district.toLowerCase())
      );
    }

    // Filter by category
    if (params.category && params.category !== 'All Industries') {
      records = records.filter(b => b.category.toLowerCase().includes(params.category!.toLowerCase()));
    }

    // Filter by mode
    if (mode === 'ENTERPRISE') {
      records = records.filter(b => b.targetType === 'ENTERPRISE');
    } else if (mode === 'LOCAL_COMMERCIAL') {
      records = records.filter(b => b.targetType === 'LOCAL_COMMERCIAL');
    }

    // Run deep digital audit for every business
    const enriched: GeoDiscoveredBusiness[] = records.map((b) => {
      const auditPackage = DigitalAuditEngine.audit({
        id: b.id,
        name: b.name,
        category: b.category,
        website: b.website,
        phone: b.phone,
        rating: b.rating,
        reviewCount: b.reviewCount,
        address: b.address,
        district: b.district,
        hasOnlineBooking: b.hasOnlineBooking,
        hasAdTrackingPixels: b.hasAdTrackingPixels,
        isActivelyRunningAds: b.isActivelyRunningAds,
        hasEmailCaptureFlows: b.hasEmailCaptureFlows
      });

      return {
        id: b.id,
        placeId: b.placeId,
        name: b.name,
        targetType: b.targetType,
        category: b.category,
        address: b.address,
        district: b.district,
        lat: b.lat,
        lng: b.lng,
        rating: b.rating,
        reviewCount: b.reviewCount,
        phone: b.phone,
        website: b.website,
        domain: b.domain,
        isVerified: b.isVerified,
        opportunityScore: b.opportunityScore,
        digitalAudit: auditPackage,
        decisionMakers: b.decisionMakers,
        detectedSignals: b.detectedSignals,
        techStack: b.techStack,
        headcountEstimate: b.headcountEstimate,
        discoveredAt: new Date().toISOString()
      };
    });

    // Apply digital gap filters if specified
    if (mode === 'DIGITAL_GAP') {
      return enriched.filter(b => 
        b.digitalAudit.fixPriority === 'CRITICAL' || 
        b.digitalAudit.fixPriority === 'HIGH' ||
        b.digitalAudit.gapScore >= 50
      );
    }

    if (params.filters) {
      return enriched.filter(b => {
        if (params.filters?.noWebsite && b.digitalAudit.digitalMaturity.website > 0) return false;
        if (params.filters?.unclaimedListing && b.digitalAudit.digitalMaturity.localPresence >= 10) return false;
        if (params.filters?.genericEmail && b.digitalAudit.digitalMaturity.emailCredibility >= 8) return false;
        if (params.filters?.missingBooking && b.digitalAudit.digitalMaturity.conversionTools >= 15) return false;
        if (params.filters?.noAdsOrPixel && b.digitalAudit.digitalMaturity.adsAndTracking > 5) return false;
        if (params.filters?.noEmailMarketing && b.digitalAudit.digitalMaturity.emailMarketing > 5) return false;
        return true;
      });
    }

    return enriched;
  }
}

export const geoProspectingEngine = new GeoProspectingEngine();
