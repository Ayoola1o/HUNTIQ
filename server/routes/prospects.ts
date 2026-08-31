import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { prospectorEngine } from '../../src/engine/prospectorEngine';
import { geoProspectingEngine } from '../engine/geo/geoProspectingEngine';
import { DigitalAuditEngine } from '../engine/audit/digitalAuditEngine';
import { pipelineDealsDb } from './pipeline';

export const prospectsRouter = Router();

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

// 2. Discover Geographically Scraped Prospects & Digital Gaps (Google Places / Geo Discovery)
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

// 3. Run On-Demand Digital Audit for a Specific Entity
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

// 4. Batch Capture Scraped Businesses -> Companies, Leads, Opportunities & Pipeline
prospectsRouter.post('/prospects/capture', (req: Request, res: Response) => {
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

  const capturedResults = businesses.map((b: any) => {
    const isDigitalGap = b.targetType === 'LOCAL_COMMERCIAL' || !!b.digitalAudit;
    const dealValue = b.digitalAudit?.recommendedPackage?.estimatedValue?.max || 5000;
    const gapScore = b.digitalAudit?.gapScore || 75;

    // Optional pipeline promotion
    if (destination === 'PIPELINE' || destination === 'ALL') {
      const stage = pipelineStage || (gapScore >= 80 ? 'discovery' : 'contacted');
      pipelineDealsDb.unshift({
        id: `deal-geo-${b.id || Math.random().toString(36).substring(2, 9)}`,
        companyName: b.name,
        domain: b.domain || 'company.com',
        dealTitle: `${b.name} - ${b.digitalAudit?.recommendedPackage?.packageName || 'Digital Modernization'}`,
        serviceName: b.digitalAudit?.recommendedPackage?.packageName || 'Digital Modernization Suite',
        dealValue,
        probability: b.digitalAudit?.conversionProbability || 80,
        opportunityScore: b.opportunityScore || 85,
        stage: stage as any,
        stageEnteredAt: 'Just now',
        expectedCloseDate: 'Next 30 Days',
        ownerName: 'Ayoola Ade',
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
            description: `Captured from Geo Radar with gap score ${gapScore}/100.`,
            timestamp: 'Just now',
            user: 'HUNTIQ Radar'
          }
        ]
      });
    }

    return {
      id: b.id,
      name: b.name,
      captured: true,
      destination: destination || 'OPPORTUNITIES',
      gapScore,
      dealValue
    };
  });

  const response: ApiResponse = {
    success: true,
    data: {
      totalCaptured: capturedResults.length,
      records: capturedResults
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});
