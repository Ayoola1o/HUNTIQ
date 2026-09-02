import type {
  DiscoveredBusiness,
  DiscoveryQuery,
  DiscoveryKpiSummary,
  DiscoverySearchResult,
  NicheTemplate
} from '../types/discovery';

export class DiscoveryEngine {
  public static readonly PRESET_TEMPLATES: NicheTemplate[] = [
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
    },
    {
      id: 'cosmetics-beauty-ecom',
      title: 'Skincare & Cosmetics Brands',
      mode: 'ecommerce_niche',
      industry: 'E-Commerce / Beauty',
      defaultLocation: 'Lagos & Accra',
      defaultKeywords: ['skincare products online nigeria', 'best acne serum lagos', 'organic cosmetics store'],
      description: 'Organic beauty brands with strong social media followings but almost zero organic search capture.'
    }
  ];

  /**
   * Discovers and evaluates business opportunities based on mode, location, and niche.
   */
  public search(query: DiscoveryQuery): DiscoverySearchResult {
    const mode = query.mode || 'local_business';
    const loc = (query.location || 'Lekki, Lagos').trim();
    const niche = (query.nicheOrIndustry || query.query || 'Dental Clinics').trim();

    const businesses: DiscoveredBusiness[] = [];

    if (mode === 'local_business') {
      businesses.push(
        {
          id: `disc-loc-1`,
          name: 'Premier Smile & Dental Studio',
          mode: 'local_business',
          industry: 'Healthcare',
          category: 'Dental Clinic',
          location: loc,
          address: 'Admiralty Way, Lekki Phase 1, Lagos',
          website: 'https://premiersmilelagos.com',
          hasWebsite: true,
          phone: '+234 812 345 6789',
          googleRating: 4.2,
          googleReviewCount: 28,
          seoOpportunityScore: 88,
          estimatedMonthlyOpportunity: '₦450,000 – ₦850,000',
          commercialIntentKeywords: [
            'dentist in lekki',
            'dental clinic lekki',
            'teeth whitening lekki',
            'emergency dentist lekki'
          ],
          topCompetitors: [
            { name: 'Beaconhill Smile Clinic', rank: '#2 on Google', estimatedTraffic: '14,200/mo', domainAuthority: 41, referringDomains: 162 },
            { name: 'Choice Dental Lekki', rank: '#4 on Google', estimatedTraffic: '9,800/mo', domainAuthority: 36, referringDomains: 110 }
          ],
          identifiedGaps: [
            "Competitors rank #2–#4 for 'dentist in lekki' while this clinic ranks #47",
            'No dedicated treatment landing pages for Invisalign, Teeth Whitening or Implants',
            'Lacks Google Local Map Pack optimization (only 28 reviews vs 240+ competitor average)',
            'Missing MedicalBusiness Local Schema markup'
          ],
          recommendedService: 'Local SEO & Google Business Optimization Campaign',
          leadMagnetTitle: `The 2026 ${loc} Dental Search & Patient Acquisition Report`,
          leadMagnetType: 'Local SEO Opportunity Report',
          createdAt: new Date().toISOString()
        },
        {
          id: `disc-loc-2`,
          name: 'Lekki Aesthetics & Dental Care',
          mode: 'local_business',
          industry: 'Healthcare',
          category: 'Cosmetic Dentistry',
          location: loc,
          address: 'Freedom Way, Lekki, Lagos',
          hasWebsite: false,
          phone: '+234 809 111 2233',
          googleRating: 4.6,
          googleReviewCount: 19,
          seoOpportunityScore: 94,
          estimatedMonthlyOpportunity: '₦600,000 – ₦1,200,000',
          commercialIntentKeywords: [
            'cosmetic dentist lekki',
            'veneers price lagos',
            'teeth cleaning lekki'
          ],
          topCompetitors: [
            { name: 'Smile360 Lekki', rank: '#1 on Google', estimatedTraffic: '22,000/mo', domainAuthority: 48, referringDomains: 230 },
            { name: 'Beaconhill Smile Clinic', rank: '#3 on Google', estimatedTraffic: '14,200/mo', domainAuthority: 41, referringDomains: 162 }
          ],
          identifiedGaps: [
            'NO OFFICIAL WEBSITE — completely invisible in organic web search results',
            'Relying entirely on Instagram DMs and foot traffic without digital booking funnel',
            'Google Maps profile is unverified with incomplete NAP hours and services',
            'Missing out on estimated 180+ monthly patient booking inquiries'
          ],
          recommendedService: 'Website Development + Local SEO Patient Acquisition Funnel',
          leadMagnetTitle: `The ${loc} High-Value Patient Search Blueprint`,
          leadMagnetType: 'Local Business Growth Audit',
          createdAt: new Date().toISOString()
        },
        {
          id: `disc-loc-3`,
          name: 'Apex Orthodontics & Family Dental',
          mode: 'local_business',
          industry: 'Healthcare',
          category: 'Orthodontics',
          location: loc,
          address: 'Bisola Durosinmi Etti Drive, Lekki Phase 1',
          website: 'https://apexorthodonticsng.com',
          hasWebsite: true,
          phone: '+234 803 444 5566',
          googleRating: 3.9,
          googleReviewCount: 42,
          seoOpportunityScore: 82,
          estimatedMonthlyOpportunity: '₦350,000 – ₦700,000',
          commercialIntentKeywords: [
            'invisible braces lekki',
            'orthodontist in lekki',
            'braces cost in lagos'
          ],
          topCompetitors: [
            { name: 'Lekki Dental Group', rank: '#2 on Google', estimatedTraffic: '8,400/mo', domainAuthority: 34, referringDomains: 88 }
          ],
          identifiedGaps: [
            'Slow mobile load time (PageSpeed 34/100, fails Core Web Vitals LCP)',
            "Ranks #38 for 'braces cost in lagos' with zero pricing guides or transparent FAQs",
            'Unresponsive booking widget resulting in 65% drop-off rate'
          ],
          recommendedService: 'Technical SEO + Mobile Conversion & Speed Sprint',
          leadMagnetTitle: `Orthodontic Search Demand & Conversion Audit: ${loc}`,
          leadMagnetType: 'Healthcare Search Opportunity Report',
          createdAt: new Date().toISOString()
        },
        {
          id: `disc-loc-4`,
          name: 'Atlantic Coast Dental Sanctuary',
          mode: 'local_business',
          industry: 'Healthcare',
          category: 'Family Dentistry',
          location: loc,
          address: 'Chevron Drive, Lekki, Lagos',
          website: 'https://atlanticdental.ng',
          hasWebsite: true,
          phone: '+234 708 999 0011',
          googleRating: 4.8,
          googleReviewCount: 65,
          seoOpportunityScore: 78,
          estimatedMonthlyOpportunity: '₦300,000 – ₦650,000',
          commercialIntentKeywords: [
            'family dentist lekki chevron',
            'pediatric dental lagos',
            'root canal therapy lekki'
          ],
          topCompetitors: [
            { name: 'Beaconhill Smile Clinic', rank: '#1 on Google', estimatedTraffic: '14,200/mo', domainAuthority: 41, referringDomains: 162 }
          ],
          identifiedGaps: [
            'Strong customer reviews but zero geo-targeted content pages for Chevron / Lekki corridor',
            'Low domain backlink authority (DA 14 vs competitor DA 41)',
            'No blog or clinical education answering patient safety concerns'
          ],
          recommendedService: 'Authority & Local Citation Building Campaign',
          leadMagnetTitle: `Local Visibility Benchmark: ${loc} Dental Market`,
          leadMagnetType: 'Local SEO Opportunity Report',
          createdAt: new Date().toISOString()
        }
      );
    } else if (mode === 'ecommerce_niche') {
      businesses.push(
        {
          id: `disc-ecom-1`,
          name: 'Ziva Urban Apparel',
          mode: 'ecommerce_niche',
          industry: 'E-Commerce',
          category: "Women's Fashion",
          location: loc || 'Nigeria (Nationwide E-commerce)',
          website: 'https://zivaurban.com',
          hasWebsite: true,
          phone: '+234 818 222 3344',
          seoOpportunityScore: 89,
          estimatedMonthlyOpportunity: '₦850,000 – ₦2,100,000',
          commercialIntentKeywords: [
            'buy corporate dresses lagos',
            'affordable stylish jumpsuits nigeria',
            'workwear fashion online store lagos',
            'modest ready to wear dresses'
          ],
          topCompetitors: [
            { name: 'Jumia Fashion', rank: '#1', estimatedTraffic: '240,000/mo', domainAuthority: 78, referringDomains: 3400 },
            { name: 'Luxe By Dami', rank: '#3', estimatedTraffic: '38,000/mo', domainAuthority: 39, referringDomains: 280 }
          ],
          identifiedGaps: [
            'Product pages lack structured Product & Offer Schema metadata',
            'Zero category-level descriptive content on high-intent collections',
            "Competitors capture 45,000+ monthly visits on 'ready to wear lagos' while brand ranks #54",
            'No collection internal linking or automated customer reviews on product pages'
          ],
          recommendedService: 'E-Commerce SEO Growth & Category Optimization Package',
          leadMagnetTitle: `The 2026 Nigeria E-Commerce Fashion SEO Growth Audit`,
          leadMagnetType: 'E-commerce SEO Growth Report',
          createdAt: new Date().toISOString()
        },
        {
          id: `disc-ecom-2`,
          name: 'RunTech Athletics Nigeria',
          mode: 'ecommerce_niche',
          industry: 'E-Commerce',
          category: 'Footwear & Athletic Gear',
          location: loc || 'Lagos & Abuja',
          website: 'https://runtechnigeria.store',
          hasWebsite: true,
          seoOpportunityScore: 92,
          estimatedMonthlyOpportunity: '₦1,200,000 – ₦2,800,000',
          commercialIntentKeywords: [
            'running shoes lagos',
            'original nike sneakers nigeria',
            'marathon athletic trainers lagos',
            'gym workout shoes price'
          ],
          topCompetitors: [
            { name: 'Decathlon Nigeria', rank: '#1', estimatedTraffic: '110,000/mo', domainAuthority: 64, referringDomains: 1200 },
            { name: 'Nike Reseller Hub', rank: '#3', estimatedTraffic: '29,000/mo', domainAuthority: 42, referringDomains: 190 }
          ],
          identifiedGaps: [
            '37 high-commercial-intent footwear keywords completely unranked',
            'Competitors boast 8x more external referring domains and lifestyle mentions',
            '42 product pages have duplicate default meta descriptions from Shopify theme',
            'Missing size-guide schema, rich snippets and stock availability tags'
          ],
          recommendedService: 'Full Technical E-Commerce SEO + Link Building & CRO Sprint',
          leadMagnetTitle: `E-Commerce Search Dominance Roadmap: Footwear & Athletic Niche`,
          leadMagnetType: 'E-commerce SEO Growth Report',
          createdAt: new Date().toISOString()
        },
        {
          id: `disc-ecom-3`,
          name: 'Nectar Botanicals Skincare',
          mode: 'ecommerce_niche',
          industry: 'E-Commerce',
          category: 'Beauty & Skincare',
          location: loc || 'West Africa (Nigeria & Ghana)',
          website: 'https://nectarbotanicals.co',
          hasWebsite: true,
          seoOpportunityScore: 86,
          estimatedMonthlyOpportunity: '₦700,000 – ₦1,500,000',
          commercialIntentKeywords: [
            'hyperpigmentation serum nigeria',
            'best organic sunscreen lagos',
            'natural shea butter skincare store'
          ],
          topCompetitors: [
            { name: 'House of Tara Store', rank: '#2', estimatedTraffic: '44,000/mo', domainAuthority: 43, referringDomains: 210 }
          ],
          identifiedGaps: [
            'Strong Instagram following (85k fans) but website generates under 800 organic visits/month',
            'High bounce rate (71%) due to non-optimized mobile checkout flow',
            'No clinical ingredient education pages capturing informational search intent'
          ],
          recommendedService: 'SEO Content Hub & High-Intent Ingredient SEO Strategy',
          leadMagnetTitle: `Clean Beauty Organic Search Opportunity Brief: 2026`,
          leadMagnetType: 'E-commerce SEO Growth Report',
          createdAt: new Date().toISOString()
        }
      );
    } else {
      // mode === 'competitor_gap'
      businesses.push(
        {
          id: `disc-gap-1`,
          name: 'Helios Clean Energy Solutions',
          mode: 'competitor_gap',
          industry: 'Renewable Energy',
          category: 'Solar & Inverters',
          location: loc || 'Lagos & Abuja',
          website: 'https://helioscleanenergy.ng',
          hasWebsite: true,
          seoOpportunityScore: 91,
          estimatedMonthlyOpportunity: '₦1,500,000 – ₦3,500,000',
          commercialIntentKeywords: [
            'solar installation company lagos',
            '5kva solar inverter system price',
            'commercial solar developers nigeria'
          ],
          topCompetitors: [
            { name: 'Auxano Solar', rank: '#1', estimatedTraffic: '36,000/mo', domainAuthority: 46, referringDomains: 240 },
            { name: 'Weco Solar Systems', rank: '#2', estimatedTraffic: '28,000/mo', domainAuthority: 39, referringDomains: 180 }
          ],
          identifiedGaps: [
            "Competitors occupy positions 1–3 for 'solar installation company lagos' receiving 85% of clicks",
            'Helios is trapped on page 3 (#27) despite offering superior warranty SLAs',
            'Zero case studies or customer energy-savings calculators indexed by Google',
            'Commercial gap estimate: losing 12-18 enterprise installation leads every month'
          ],
          recommendedService: 'High-Intent Commercial Keyword Conquest Campaign',
          leadMagnetTitle: `Renewable Energy Commercial Search Gap Analysis`,
          leadMagnetType: 'Competitor Search Visibility Report',
          createdAt: new Date().toISOString()
        },
        {
          id: `disc-gap-2`,
          name: 'Primegate Commercial Properties',
          mode: 'competitor_gap',
          industry: 'Real Estate',
          category: 'Commercial Real Estate',
          location: loc || 'Ikoyi & Victoria Island, Lagos',
          website: 'https://primegateproperties.com',
          hasWebsite: true,
          seoOpportunityScore: 87,
          estimatedMonthlyOpportunity: '₦2,000,000 – ₦5,000,000',
          commercialIntentKeywords: [
            'grade a office space for lease ikoyi',
            'commercial real estate agents lagos',
            'warehouse for rent ikeja'
          ],
          topCompetitors: [
            { name: 'Broll Nigeria', rank: '#1', estimatedTraffic: '52,000/mo', domainAuthority: 54, referringDomains: 510 },
            { name: 'JLL Africa Hub', rank: '#2', estimatedTraffic: '41,000/mo', domainAuthority: 61, referringDomains: 890 }
          ],
          identifiedGaps: [
            'Competitors capture 90%+ of corporate tenant leasing searches',
            'Property listings are not indexed as individual searchable entities',
            'Lacks tenant decision-maker SEO landing pages'
          ],
          recommendedService: 'Enterprise Property SEO & B2B Inbound Acquisition',
          leadMagnetTitle: `Prime Commercial Real Estate Inbound Search Benchmark`,
          leadMagnetType: 'Property Search Visibility Report',
          createdAt: new Date().toISOString()
        }
      );
    }

    // Dynamic enrichment if user searched for specific query not in presets
    if (query.query && !DiscoveryEngine.PRESET_TEMPLATES.some(p => p.title.toLowerCase().includes(query.query!.toLowerCase()))) {
      const customName = query.query.replace(/(in|at|near)\s+.+$/i, '').trim();
      const capitalized = customName ? customName.charAt(0).toUpperCase() + customName.slice(1) : `${niche} Leader`;
      
      businesses.unshift({
        id: `disc-custom-${Date.now()}`,
        name: `${capitalized} Co.`,
        mode,
        industry: query.nicheOrIndustry || 'Commercial Business',
        category: niche,
        location: loc,
        hasWebsite: true,
        website: `https://${customName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'business'}.ng`,
        phone: '+234 800 123 4567',
        googleRating: 4.3,
        googleReviewCount: 22,
        seoOpportunityScore: 87,
        estimatedMonthlyOpportunity: mode === 'ecommerce_niche' ? '₦750,000 – ₦1,800,000' : '₦400,000 – ₦850,000',
        commercialIntentKeywords: [
          `best ${niche.toLowerCase()} ${loc.toLowerCase()}`,
          `${niche.toLowerCase()} price ${loc.toLowerCase()}`,
          `top rated ${niche.toLowerCase()} provider`
        ],
        topCompetitors: [
          { name: `${niche} Market Leader`, rank: '#1 on Google', estimatedTraffic: '18,500/mo', domainAuthority: 42, referringDomains: 187 }
        ],
        identifiedGaps: [
          `Competitor ranks #1 for top ${niche} commercial keywords while prospect is unranked`,
          'Under-optimized mobile experience and thin informational content',
          'Missing high-intent customer reviews and local citation consistency'
        ],
        recommendedService: mode === 'ecommerce_niche' 
          ? 'E-Commerce Category SEO & Conversion Funnel' 
          : 'Local SEO & Google Business Authority Campaign',
        leadMagnetTitle: `The 2026 ${loc} ${niche} Opportunity Report`,
        leadMagnetType: `${niche} Search Opportunity Report`,
        createdAt: new Date().toISOString()
      });
    }

    // Filter by minOpportunityScore if provided
    const filtered = query.minOpportunityScore
      ? businesses.filter(b => b.seoOpportunityScore >= (query.minOpportunityScore || 0))
      : businesses;

    const kpiSummary = this.calculateKpiSummary(filtered);

    return {
      businesses: filtered,
      kpiSummary,
      query
    };
  }

  /**
   * Aggregates live KPI indicators across discovered businesses.
   */
  public calculateKpiSummary(list: DiscoveredBusiness[]): DiscoveryKpiSummary {
    const totalDiscovered = list.length;
    const highOpportunityCount = list.filter(b => b.seoOpportunityScore >= 80).length;
    const avgOpportunityScore = totalDiscovered > 0
      ? Math.round(list.reduce((acc, curr) => acc + curr.seoOpportunityScore, 0) / totalDiscovered)
      : 0;

    return {
      totalDiscovered,
      highOpportunityCount,
      avgOpportunityScore,
      estimatedPipelineValue: `₦${(totalDiscovered * 650000).toLocaleString()}`
    };
  }
}

export const discoveryEngine = new DiscoveryEngine();
