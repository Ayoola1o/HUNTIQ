import { DigitalAuditEngine } from '../engine/digitalAuditEngine';
import type { GeoScrapedBusiness } from '../engine/geoScraperEngine';

export interface GeoLocationPreset {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  zoom: number;
  districts: string[];
}

export const GEO_LOCATION_PRESETS: GeoLocationPreset[] = [
  {
    id: 'lagos',
    name: 'Lagos Metropolitan Area',
    country: 'Nigeria',
    lat: 6.4541,
    lng: 3.4246,
    zoom: 12,
    districts: ['Victoria Island Financial Core', 'Lekki Phase 1 Commercial Hub', 'Ikeja Commercial / Airport District', 'Yaba Tech Corridor', 'Ikoyi Executive District']
  },
  {
    id: 'abuja',
    name: 'Abuja Federal Capital Territory',
    country: 'Nigeria',
    lat: 9.0765,
    lng: 7.3986,
    zoom: 12,
    districts: ['Wuse 2 Commercial District', 'Maitama Diplomatic Zone', 'Garki Central Business District', 'Jabi Lake Commercial Area']
  },
  {
    id: 'benin',
    name: 'Benin City Commercial Core',
    country: 'Nigeria',
    lat: 6.3350,
    lng: 5.6037,
    zoom: 13,
    districts: ['GRA Commercial Hub', 'Ring Road Central Market', 'Sapele Road Commercial Axis', 'Airport Road District']
  },
  {
    id: 'portharcourt',
    name: 'Port Harcourt Oil & Maritime Hub',
    country: 'Nigeria',
    lat: 4.8156,
    lng: 7.0498,
    zoom: 12,
    districts: ['GRA Phase 2 Executive Hub', 'Trans-Amadi Industrial Layout', 'Aba Road Commercial Corridor', 'Old GRA']
  },
  {
    id: 'nairobi',
    name: 'Nairobi Innovation & Commercial Region',
    country: 'Kenya',
    lat: -1.2921,
    lng: 36.8219,
    zoom: 12,
    districts: ['Westlands Tech Corridor', 'Upper Hill Financial District', 'Kilimani Commercial Hub', 'Nairobi Central Business District']
  },
  {
    id: 'johannesburg',
    name: 'Johannesburg Metro',
    country: 'South Africa',
    lat: -26.2041,
    lng: 28.0473,
    zoom: 12,
    districts: ['Sandton Financial District', 'Rosebank Commercial Strip', 'Bryanston Enterprise Hub', 'Midrand Tech Zone']
  },
  {
    id: 'london',
    name: 'Greater London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    zoom: 12,
    districts: ['City of London (Square Mile)', 'Silicon Roundabout / Shoreditch', 'Canary Wharf', 'Mayfair / West End']
  }
];

export const MOCK_GEO_BUSINESSES: GeoScrapedBusiness[] = [
  // LAGOS - 1. High Growth Tech Enterprise
  {
    id: 'biz-lagos-1',
    placeId: 'geo-lagos-01',
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
      id: 'biz-lagos-1',
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

  // LAGOS - 2. Local Commercial: Critical Digital Gap (No Website, Generic Email)
  {
    id: 'biz-lagos-2',
    placeId: 'geo-lagos-02',
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
      id: 'biz-lagos-2',
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
    detectedSignals: ['High local patient demand in Lekki', 'Zero web booking portal', 'No retargeting pixel or ads', 'Unclaimed Google profile'],
    techStack: ['None (Paper Patient Records)'],
    headcountEstimate: '25-50 employees',
    scrapedAt: 'Just now'
  },

  // LAGOS - 3. Local Commercial: Outdated Insecure Site, Running Google Ads without Email Retargeting
  {
    id: 'biz-lagos-3',
    placeId: 'geo-lagos-03',
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
      id: 'biz-lagos-3',
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

  // LAGOS - 4. Premium Law Firm with Outdated Presence
  {
    id: 'biz-lagos-4',
    placeId: 'geo-lagos-04',
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
      id: 'biz-lagos-4',
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
    detectedSignals: ['Unencrypted client intake portal', 'No automated consultation scheduler', 'Zero retargeting ad campaigns'],
    techStack: ['Custom HTML', 'Apache'],
    headcountEstimate: '20-40 employees',
    scrapedAt: 'Just now'
  },

  // LAGOS - 5. Boutique Luxury Hotel & Spa with Missing Mobile Checkout
  {
    id: 'biz-lagos-5',
    placeId: 'geo-lagos-05',
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
      id: 'biz-lagos-5',
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

  // ABUJA - 1. High-End Diagnostic Dental Centre (No Website, Generic Yahoo Email)
  {
    id: 'biz-abuja-1',
    placeId: 'geo-abuja-01',
    name: 'Metro Dental Centre & Maxillofacial Clinic',
    targetType: 'LOCAL_COMMERCIAL',
    category: 'Healthcare & Specialized Medical',
    address: '14 Adetokunbo Ademola Cres, Wuse 2, Abuja',
    district: 'Wuse 2 Commercial District',
    lat: 9.0833,
    lng: 7.4833,
    rating: 3.5,
    reviewCount: 6,
    phone: '+234 9 291 4455',
    website: '',
    domain: 'yahoo.com',
    isVerified: false,
    opportunityScore: 91,
    digitalAudit: DigitalAuditEngine.audit({
      id: 'biz-abuja-1',
      name: 'Metro Dental Centre & Maxillofacial Clinic',
      category: 'Healthcare & Specialized Medical',
      website: '',
      rating: 3.5,
      reviewCount: 6,
      district: 'Wuse 2 Abuja',
      hasOnlineBooking: false,
      hasAdTrackingPixels: false,
      isActivelyRunningAds: false,
      hasEmailCaptureFlows: false
    }),
    decisionMakers: [
      { name: 'Dr. Tariq Bello', role: 'Lead Dental Surgeon', email: 'metrodentalabuja@yahoo.com' }
    ],
    detectedSignals: ['Prime Wuse 2 location with high footfall', 'Zero online booking portal', 'Unclaimed Google profile', 'Generic email on storefront banner'],
    techStack: ['None (Manual Appointment Book)'],
    headcountEstimate: '15-30 employees',
    scrapedAt: 'Just now'
  },

  // ABUJA - 2. Government & Diplomatic Advisory Firm
  {
    id: 'biz-abuja-2',
    placeId: 'geo-abuja-02',
    name: 'Capital Governance & Public Policy Advisory',
    targetType: 'LOCAL_COMMERCIAL',
    category: 'Legal Services & Corporate Advisory',
    address: '22 Aguiyi Ironsi St, Maitama, Abuja',
    district: 'Maitama Diplomatic Zone',
    lat: 9.0882,
    lng: 7.4981,
    rating: 4.2,
    reviewCount: 8,
    phone: '+234 9 461 9000',
    website: 'http://capitalpolicyng.org',
    domain: 'capitalpolicyng.org',
    isVerified: true,
    opportunityScore: 85,
    digitalAudit: DigitalAuditEngine.audit({
      id: 'biz-abuja-2',
      name: 'Capital Governance & Public Policy Advisory',
      category: 'Legal & Corporate Advisory',
      website: 'http://capitalpolicyng.org',
      rating: 4.2,
      reviewCount: 8,
      district: 'Maitama Abuja',
      hasOnlineBooking: false,
      hasAdTrackingPixels: false,
      isActivelyRunningAds: false,
      hasEmailCaptureFlows: false
    }),
    decisionMakers: [
      { name: 'Dr. Halima Danjuma', role: 'Principal Director', email: 'halima@capitalpolicyng.org' }
    ],
    detectedSignals: ['Non-secure HTTP site with broken SSL', 'No lead capture system', 'Zero automated follow-up sequences'],
    techStack: ['Joomla', 'Apache'],
    headcountEstimate: '20-40 employees',
    scrapedAt: 'Just now'
  },

  // BENIN CITY - 1. Diagnostic Hospital & Maternity (Critical Gap)
  {
    id: 'biz-benin-1',
    placeId: 'geo-benin-01',
    name: 'Heritage Specialist Hospital & Diagnostic Centre',
    targetType: 'LOCAL_COMMERCIAL',
    category: 'Healthcare & Specialized Medical',
    address: '84 Boundary Road, GRA, Benin City, Edo',
    district: 'GRA Commercial Hub',
    lat: 6.3211,
    lng: 5.6124,
    rating: 3.1,
    reviewCount: 3,
    phone: '+234 52 250 889',
    website: '',
    domain: 'gmail.com',
    isVerified: false,
    opportunityScore: 93,
    digitalAudit: DigitalAuditEngine.audit({
      id: 'biz-benin-1',
      name: 'Heritage Specialist Hospital & Diagnostic Centre',
      category: 'Healthcare & Specialized Medical',
      website: '',
      rating: 3.1,
      reviewCount: 3,
      district: 'GRA Benin City',
      hasOnlineBooking: false,
      hasAdTrackingPixels: false,
      isActivelyRunningAds: false,
      hasEmailCaptureFlows: false
    }),
    decisionMakers: [
      { name: 'Dr. Osaro Iyamu', role: 'Medical Director', email: 'heritagespecialisthospital@gmail.com' }
    ],
    detectedSignals: ['High emergency patient influx', 'Zero web presence or appointment booking', 'Unclaimed Google Maps profile'],
    techStack: ['None (Analog Folders)'],
    headcountEstimate: '30-60 employees',
    scrapedAt: 'Just now'
  },

  // PORT HARCOURT - 1. Maritime & Industrial Engineering
  {
    id: 'biz-ph-1',
    placeId: 'geo-ph-01',
    name: 'Delta Marine & Offshore Logistics Services',
    targetType: 'LOCAL_COMMERCIAL',
    category: 'Transportation & Commercial Logistics',
    address: '15 Trans-Amadi Industrial Layout, Port Harcourt',
    district: 'Trans-Amadi Industrial Layout',
    lat: 4.8021,
    lng: 7.0345,
    rating: 3.8,
    reviewCount: 11,
    phone: '+234 84 461 200',
    website: 'http://deltamarineoffshore.com',
    domain: 'deltamarineoffshore.com',
    isVerified: true,
    opportunityScore: 88,
    digitalAudit: DigitalAuditEngine.audit({
      id: 'biz-ph-1',
      name: 'Delta Marine & Offshore Logistics Services',
      category: 'Maritime & Logistics',
      website: 'http://deltamarineoffshore.com',
      rating: 3.8,
      reviewCount: 11,
      district: 'Trans-Amadi Port Harcourt',
      hasOnlineBooking: false,
      hasAdTrackingPixels: false,
      isActivelyRunningAds: false,
      hasEmailCaptureFlows: false
    }),
    decisionMakers: [
      { name: 'Engr. Kenneth Briggs', role: 'Operations Director', email: 'kbriggs@deltamarineoffshore.com' }
    ],
    detectedSignals: ['Serving oil & gas multinational clients with outdated unencrypted site', 'No instant freight quote portal'],
    techStack: ['HTML4', 'Apache'],
    headcountEstimate: '50-100 employees',
    scrapedAt: 'Just now'
  },

  // NAIROBI - 1. FinTech Scaleup (Enterprise)
  {
    id: 'biz-nairobi-1',
    placeId: 'geo-nairobi-01',
    name: 'Kopo Kopo Merchant Solutions',
    targetType: 'ENTERPRISE',
    category: 'Financial Technology / Merchant Services',
    address: 'The Promenade, General Mathenge Dr, Westlands, Nairobi',
    district: 'Westlands Tech Corridor',
    lat: -1.2612,
    lng: 36.8045,
    rating: 4.7,
    reviewCount: 184,
    phone: '+254 20 760 0000',
    website: 'https://kopokopo.co.ke',
    domain: 'kopokopo.co.ke',
    isVerified: true,
    opportunityScore: 92,
    digitalAudit: DigitalAuditEngine.audit({
      id: 'biz-nairobi-1',
      name: 'Kopo Kopo Merchant Solutions',
      category: 'Financial Technology',
      website: 'https://kopokopo.co.ke',
      rating: 4.7,
      reviewCount: 184,
      district: 'Westlands Nairobi',
      hasOnlineBooking: true,
      hasAdTrackingPixels: true,
      isActivelyRunningAds: true,
      hasEmailCaptureFlows: true
    }),
    decisionMakers: [
      { name: 'Ken Njoroge', role: 'Executive Chairman', email: 'ken@kopokopo.co.ke' },
      { name: 'Wanjiku Mwangi', role: 'Head of Growth', email: 'wanjiku@kopokopo.co.ke' }
    ],
    detectedSignals: ['Expanding merchant credit lines across East Africa', 'Hiring 20+ engineering and sales roles (+190% surge)'],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'HubSpot', 'Meta Pixel'],
    headcountEstimate: '100-250 employees',
    scrapedAt: 'Just now'
  },

  // LONDON - 1. High Growth Tech Enterprise
  {
    id: 'biz-london-1',
    placeId: 'geo-london-01',
    name: 'GoCardless Global Payments',
    targetType: 'ENTERPRISE',
    category: 'Financial Technology / Merchant Services',
    address: '65 Clifton St, Shoreditch, London EC2A 4JE',
    district: 'Silicon Roundabout / Shoreditch',
    lat: 51.5231,
    lng: -0.0841,
    rating: 4.6,
    reviewCount: 520,
    phone: '+44 20 7183 8674',
    website: 'https://gocardless.com',
    domain: 'gocardless.com',
    isVerified: true,
    opportunityScore: 96,
    digitalAudit: DigitalAuditEngine.audit({
      id: 'biz-london-1',
      name: 'GoCardless Global Payments',
      category: 'Financial Technology',
      website: 'https://gocardless.com',
      rating: 4.6,
      reviewCount: 520,
      district: 'Shoreditch London',
      hasOnlineBooking: true,
      hasAdTrackingPixels: true,
      isActivelyRunningAds: true,
      hasEmailCaptureFlows: true
    }),
    decisionMakers: [
      { name: 'Hiroki Takeuchi', role: 'Chief Executive Officer', email: 'hiroki@gocardless.com' }
    ],
    detectedSignals: ['Bank payment authorization surge', 'Opening European and APAC offices', 'Series G funding expansion'],
    techStack: ['React', 'Ruby on Rails', 'GCP', 'Marketo', 'Meta Pixel', 'Salesforce'],
    headcountEstimate: '500-1000 employees',
    scrapedAt: 'Just now'
  }
];
