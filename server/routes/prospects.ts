import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { prospectorEngine } from '../../src/engine/prospectorEngine';
import { geoProspectingEngine } from '../engine/geo/geoProspectingEngine';
import { DigitalAuditEngine } from '../engine/audit/digitalAuditEngine';
import { createPipelineRepository } from '../repositories/pipeline';
import { createMapsProvider } from '../providers/maps';
import type { AuthenticatedRequest } from '../middleware/auth';

export const prospectsRouter = Router();
const pipelineRepository = createPipelineRepository();

// 1. Natural Language & Filter Search
prospectsRouter.post('/prospects/search', (req: Request, res: Response) => {
  const { query, industries, locations, minScore, limit } = req.body || {};

  const results = prospectorEngine.searchProspects({
    query,
    industries,
    locations,
    minScore: minScore ? Number(minScore) : undefined,
    limit: limit ? Number(limit) : undefined
  });

  const response: ApiResponse = {
    success: true,
    data: results,
    meta: {
      total: results.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Apify Google Maps Place Discovery & Extraction Waterfall
prospectsRouter.post('/prospects/discover-maps', async (req: AuthenticatedRequest, res: Response) => {
  const { query, location, radiusKm, maxResults, category, minRating, minReviews, hasWebsite, hasPhone } = req.body || {};

  if (!query && !category && !location) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_SEARCH_QUERY',
        message: 'Search query, category, or location is required for Maps discovery.'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  try {
    const mapsProvider = createMapsProvider();
    const places = await mapsProvider.searchPlaces({
      query: query || category || 'Businesses',
      location: location || 'Lagos, Nigeria',
      radiusKm: radiusKm ? Number(radiusKm) : 15,
      maxResults: maxResults ? Number(maxResults) : 20,
      category,
      minRating: minRating ? Number(minRating) : undefined,
      minReviews: minReviews ? Number(minReviews) : undefined,
      hasWebsite: hasWebsite ? Boolean(hasWebsite) : undefined,
      hasPhone: hasPhone ? Boolean(hasPhone) : undefined
    });

    res.status(200).json({
      success: true,
      data: places,
      meta: {
        total: places.length,
        provider: process.env.APIFY_API_TOKEN ? 'APIFY_GOOGLE_MAPS' : 'APIFY_MOCK_FALLBACK',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'MAPS_DISCOVERY_ERROR',
        message: err.message || 'Failed to execute Maps discovery query.'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});

// 3. Discover Geographically Scraped Prospects & Digital Gaps (Google Places / Geo Discovery)
prospectsRouter.post(['/prospects/scrape-geo', '/prospects/discover-geo'], (req: Request, res: Response) => {
  const { zoneId, district, radiusKm, categoryFilter, category, mode, filters, location } = req.body || {};

  const scraped = geoProspectingEngine.discover({
    zoneId: zoneId || (location?.lat ? 'custom' : 'lagos'),
    district,
    radiusKm: radiusKm ? Number(radiusKm) : 15,
    category: categoryFilter || category,
    mode: mode || 'ALL',
    filters
  });

  const response: ApiResponse = {
    success: true,
    data: scraped,
    meta: {
      total: scraped.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 4. Run On-Demand Digital Audit for a Specific Entity
prospectsRouter.post('/prospects/:businessId/audit', (req: Request, res: Response) => {
  const { businessId } = req.params;
  const { name, category, website, phone, rating, reviewCount, address, district } = req.body || {};

  const auditPackage = DigitalAuditEngine.audit({
    id: businessId,
    name: name || 'Commercial Entity',
    category: category || 'Commercial Business',
    website,
    phone,
    rating,
    reviewCount,
    address,
    district
  });

  const response: ApiResponse = {
    success: true,
    data: auditPackage,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 5. Batch Capture Scraped Businesses -> Pipeline Deals via Repository
prospectsRouter.post('/prospects/capture', async (req: AuthenticatedRequest, res: Response) => {
  const { businesses, destination, pipelineStage } = req.body || {};

  if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing or empty businesses array for capture.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const uId = req.user?.id || 'user-default-001';
  const wId = req.user?.workspaceId || 'ws-default-001';
  const ownerName = req.user?.fullName || 'Ayoola Ade';

  const capturedResults = [];

  for (const b of businesses) {
    const isDigitalGap = b.targetType === 'LOCAL_COMMERCIAL' || !!b.digitalAudit;
    const dealValue = b.digitalAudit?.recommendedPackage?.estimatedValue?.max || 5000;
    const gapScore = b.digitalAudit?.gapScore || 75;

    let cleanDomain = b.domain || '';
    if (!cleanDomain && b.website) {
      cleanDomain = b.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
    if (cleanDomain.includes('company.com')) {
      cleanDomain = '';
    }

    // Pipeline promotion via Repository
    if (destination === 'PIPELINE' || destination === 'ALL') {
      const stage = pipelineStage || (gapScore >= 80 ? 'discovery' : 'contacted');

      const savedDeal = await pipelineRepository.save({
        id: `deal-geo-${b.id || Math.random().toString(36).substring(2, 9)}`,
        companyName: b.name,
        domain: cleanDomain,
        dealTitle: `${b.name} - ${b.digitalAudit?.recommendedPackage?.packageName || 'Digital Modernization'}`,
        serviceName: b.digitalAudit?.recommendedPackage?.packageName || 'Digital Modernization Suite',
        dealValue,
        probability: b.digitalAudit?.conversionProbability || 80,
        opportunityScore: b.opportunityScore || 85,
        stage: stage as any,
        stageEnteredAt: 'Just now',
        expectedCloseDate: 'Next 30 Days',
        ownerName,
        contactName: b.decisionMakers?.[0]?.name || 'Business Owner',
        contactRole: b.decisionMakers?.[0]?.role || 'Managing Director',
        contactAvatarBg: isDigitalGap ? '#fee2e2' : '#eff6ff',
        contactAvatarColor: isDigitalGap ? '#dc2626' : '#4f46e5',
        lastActivity: 'Captured via Geo Radar',
        nextAction: b.digitalAudit?.pitchAngles?.salesCallOpener || 'Reach out with custom audit brief',
        nextActionDueDate: 'Tomorrow',
        priority: gapScore >= 80 ? 'Hot' : 'High',
        activities: [
          {
            id: `act-${Date.now()}`,
            type: 'stage_change',
            title: 'Prospect Captured',
            description: `Captured from Apify / Google Places Radar into ${stage} stage.`,
            timestamp: 'Just now',
            user: ownerName
          }
        ],
        userId: uId,
        workspaceId: wId
      });

      capturedResults.push({
        id: b.id,
        name: b.name,
        capturedAs: 'DEAL',
        dealId: savedDeal.id,
        stage
      });
    } else {
      capturedResults.push({
        id: b.id,
        name: b.name,
        capturedAs: 'DISCOVERED_LEAD',
        stage: 'discovery'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      capturedCount: capturedResults.length,
      destination: destination || 'PIPELINE',
      items: capturedResults
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});
