import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  TrendingUp, 
  Sparkles, 
  X, 
  FileText, 
  Send, 
  Globe, 
  Star, 
  ArrowUpRight, 
  Loader2, 
  SlidersHorizontal 
} from 'lucide-react';
import type { 
  DiscoveredBusiness, 
  DiscoveryMode, 
  DiscoveryQuery, 
  DiscoveryKpiSummary, 
  NicheTemplate 
} from '../../types/discovery';
import { discoverBusinesses, getDiscoveryTemplates } from '../../api/discovery';
import { SeoAuditModal } from './SeoAuditModal';
import { CompetitorAnalysisModal } from './CompetitorAnalysisModal';
import { OpportunityScoreModal } from './OpportunityScoreModal';

interface BusinessNicheDiscoveryProps {
  onNavigate: (nav: string) => void;
  onSelectBusinessForAudit?: (biz: DiscoveredBusiness) => void;
}

export const BusinessNicheDiscovery: React.FC<BusinessNicheDiscoveryProps> = ({
  onNavigate,
  onSelectBusinessForAudit
}) => {
  const [mode, setMode] = useState<DiscoveryMode>('local_business');
  const [locationInput, setLocationInput] = useState('Lekki, Lagos');
  const [nicheInput, setNicheInput] = useState('Dental Clinics');
  const [radiusKm, setRadiusKm] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<DiscoveredBusiness[]>([]);
  const [templates, setTemplates] = useState<NicheTemplate[]>([]);
  const [kpiSummary, setKpiSummary] = useState<DiscoveryKpiSummary>({
    totalDiscovered: 0,
    highOpportunityCount: 0,
    avgOpportunityScore: 0,
    estimatedPipelineValue: '₦0'
  });

  // Selected lead magnet preview modal
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState<DiscoveredBusiness | null>(null);
  // Selected SEO Audit modal
  const [selectedAuditBusiness, setSelectedAuditBusiness] = useState<DiscoveredBusiness | null>(null);
  // Selected Competitor Analysis modal
  const [selectedCompetitorBusiness, setSelectedCompetitorBusiness] = useState<DiscoveredBusiness | null>(null);
  // Selected Opportunity Scoring modal
  const [selectedScoringBusiness, setSelectedScoringBusiness] = useState<DiscoveredBusiness | null>(null);

  const handleExecuteSearch = useCallback(async (
    targetMode: DiscoveryMode = mode,
    targetLocation: string = locationInput,
    targetNiche: string = nicheInput
  ) => {
    setIsLoading(true);
    try {
      const query: DiscoveryQuery = {
        mode: targetMode,
        location: targetLocation,
        nicheOrIndustry: targetNiche,
        radiusKm: targetMode === 'local_business' ? radiusKm : undefined,
        query: `${targetNiche} in ${targetLocation}`
      };

      const result = await discoverBusinesses(query);
      setBusinesses(result.businesses || []);
      setKpiSummary(result.kpiSummary);
    } catch (err) {
      console.error('Failed to discover businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [mode, locationInput, nicheInput, radiusKm]);

  // Initial load
  useEffect(() => {
    getDiscoveryTemplates().then(t => setTemplates(t)).catch(() => {});
    const timer = setTimeout(() => {
      handleExecuteSearch('local_business', 'Lekki, Lagos', 'Dental Clinics');
    }, 0);
    return () => clearTimeout(timer);
  }, [handleExecuteSearch]);


  const handleApplyTemplate = (tmpl: NicheTemplate) => {
    setMode(tmpl.mode);
    setLocationInput(tmpl.defaultLocation);
    setNicheInput(tmpl.industry);
    handleExecuteSearch(tmpl.mode, tmpl.defaultLocation, tmpl.industry);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Critical Gap' };
    if (score >= 80) return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', label: 'High Opportunity' };
    return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', label: 'Moderate' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px' }}>
      {/* Top Banner & Strategy Description */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              color: '#a5b4fc',
              border: '1px solid rgba(165, 180, 252, 0.3)',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              letterSpacing: '0.5px'
            }}>
              AI SEO OPPORTUNITY FINDER
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Phase 1: Business & Niche Discovery</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
            Find High-Value Businesses With Search & Revenue Gaps
          </h2>
          <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Discover local businesses and e-commerce stores being outranked by competitors for commercial keywords.
            Translate visibility gaps into estimated monthly revenue opportunities.
          </p>
        </div>

        {/* Discovery Mode Switcher Pills */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '4px',
          display: 'flex',
          gap: '4px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          {[
            { id: 'local_business', label: 'Local Business', icon: <MapPin size={13} /> },
            { id: 'ecommerce_niche', label: 'E-commerce Niche', icon: <ShoppingBag size={13} /> },
            { id: 'competitor_gap', label: 'Competitor Gap', icon: <TrendingUp size={13} /> }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as DiscoveryMode);
                if (m.id === 'local_business') {
                  setLocationInput('Lekki, Lagos');
                  setNicheInput('Dental Clinics');
                  handleExecuteSearch('local_business', 'Lekki, Lagos', 'Dental Clinics');
                } else if (m.id === 'ecommerce_niche') {
                  setLocationInput('Nigeria (Nationwide E-commerce)');
                  setNicheInput("Women's Fashion");
                  handleExecuteSearch('ecommerce_niche', 'Nigeria (Nationwide E-commerce)', "Women's Fashion");
                } else {
                  setLocationInput('Lagos & Abuja');
                  setNicheInput('Renewable Energy');
                  handleExecuteSearch('competitor_gap', 'Lagos & Abuja', 'Renewable Energy');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mode === m.id ? '#4f46e5' : 'transparent',
                color: mode === m.id ? '#ffffff' : '#cbd5e1',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Search Form & Quick Presets */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #eaecf0',
        padding: '20px 24px',
        boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)'
      }}>
        {/* Form Inputs Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mode === 'local_business' ? '1.5fr 1.5fr 1fr auto' : '1.8fr 1.8fr auto',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          {/* Location / Market */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              {mode === 'ecommerce_niche' ? 'Target Market / Country' : 'Location / District'}
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <MapPin size={15} color="#64748b" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder={mode === 'ecommerce_niche' ? 'e.g. Nigeria, Ghana, South Africa' : 'e.g. Lekki, Lagos or Victoria Island'}
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '12.5px',
                  width: '100%',
                  color: '#0f172a',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Industry / Niche */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              {mode === 'ecommerce_niche' ? 'E-commerce Niche / Category' : 'Industry / Business Type'}
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              {mode === 'ecommerce_niche' ? <ShoppingBag size={15} color="#64748b" /> : <Search size={15} color="#64748b" />}
              <input
                type="text"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                placeholder={mode === 'ecommerce_niche' ? "e.g. Women's Fashion, Footwear, Skincare" : 'e.g. Dental Clinics, Restaurants, Legal'}
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '12.5px',
                  width: '100%',
                  color: '#0f172a',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Radius (Local only) */}
          {mode === 'local_business' && (
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Radius (km)
              </label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value={5}>5 km radius</option>
                <option value={10}>10 km radius</option>
                <option value={25}>25 km radius</option>
                <option value={50}>50 km cluster</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => handleExecuteSearch()}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 20px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>Find SEO Opportunities</span>
          </button>
        </div>

        {/* Preset Suggestions Chips */}
        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SlidersHorizontal size={12} />
            Quick Presets:
          </span>
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => handleApplyTemplate(t)}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#93c5fd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
      }}>
        {[
          { label: 'Discovered Businesses', value: kpiSummary.totalDiscovered, sub: 'In target geographic/niche market' },
          { label: 'High Opportunity (>80)', value: kpiSummary.highOpportunityCount, sub: 'Prime sales targets with revenue gap' },
          { label: 'Avg Opportunity Score', value: `${kpiSummary.avgOpportunityScore}/100`, sub: 'Calculated via 6 commercial factors' },
          { label: 'Est. Pipeline Revenue', value: kpiSummary.estimatedPipelineValue, sub: 'Projected annual service value' }
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #eaecf0',
              padding: '16px 20px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>{card.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>{card.value}</div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Discovered Businesses Results */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Discovered Opportunities ({businesses.length})
          </h3>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Ranked by SEO Opportunity Score & Commercial Potential
          </span>
        </div>

        {isLoading ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Loader2 size={32} color="#4f46e5" className="animate-spin" />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Scanning Search Engine Results & Competitor Benchmarks...
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Auditing organic positions, local map pack presence, and calculating commercial intent gaps
            </div>
          </div>
        ) : businesses.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            No businesses found matching this criteria. Try selecting one of the quick presets above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {businesses.map((biz) => {
              const scoreColor = getScoreColor(biz.seoOpportunityScore);

              return (
                <div
                  key={biz.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #eaecf0',
                    padding: '20px',
                    boxShadow: '0 2px 5px rgba(16, 24, 40, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Top Row: Business Identity & Score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {biz.name}
                        </h4>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {biz.category}
                        </span>

                        {biz.hasWebsite ? (
                          <a
                            href={biz.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '11px',
                              color: '#2563eb',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 600
                            }}
                          >
                            <Globe size={11} />
                            <span>{biz.website?.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            NO WEBSITE DETECTED
                          </span>
                        )}

                        {biz.googleRating && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#854d0e', fontWeight: 700 }}>
                            <Star size={12} fill="#eab308" color="#eab308" />
                            <span>{biz.googleRating}</span>
                            <span style={{ color: '#94a3b8', fontWeight: 500 }}>({biz.googleReviewCount} reviews)</span>
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                        {biz.address || biz.location} {biz.phone && `• ${biz.phone}`}
                      </div>
                    </div>

                    {/* SEO Opportunity Score Pill */}
                    <div 
                      onClick={() => setSelectedScoringBusiness(biz)}
                      title="Click to view Opportunity Score Formula & Commercial Valuation"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: scoreColor.bg,
                        border: `1px solid ${scoreColor.border}`,
                        borderRadius: '12px',
                        padding: '8px 16px',
                        flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: scoreColor.text, fontWeight: 800, textTransform: 'uppercase' }}>
                          {scoreColor.label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                          Est. Value: <strong>{biz.estimatedMonthlyOpportunity}</strong>
                        </div>
                      </div>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: `2px solid ${scoreColor.text}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 900,
                        color: scoreColor.text
                      }}>
                        {biz.seoOpportunityScore}
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Commercial Keywords & Gaps */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.8fr',
                    gap: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    border: '1px solid #f1f5f9'
                  }}>
                    {/* Left: High-Intent Keywords & Competitor Ranks */}
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                        High-Intent Search Terms Missed:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {biz.commercialIntentKeywords.map((kw, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: '11px',
                              color: '#1e293b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: '#ffffff',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>&ldquo;{kw}&rdquo;</span>
                            <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>Outranked</span>
                          </div>
                        ))}
                      </div>

                      {/* Top Competitor Anchor */}
                      {biz.topCompetitors?.[0] && (
                        <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                          Top Competitor: <strong style={{ color: '#0f172a' }}>{biz.topCompetitors[0].name}</strong>{' '}
                          ({biz.topCompetitors[0].rank})
                        </div>
                      )}
                    </div>

                    {/* Right: Specific Identified Commercial Gaps */}
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                        Why Competitors Are Winning:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {biz.identifiedGaps.map((gap, i) => (
                          <div key={i} style={{ fontSize: '11.5px', color: '#475569', display: 'flex', gap: '6px', lineHeight: 1.35 }}>
                            <span style={{ color: '#ef4444', fontWeight: 800 }}>•</span>
                            <span>{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Recommended Offer:</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe'
                      }}>
                        {biz.recommendedService}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedLeadMagnet(biz)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#f5f3ff',
                          color: '#6d28d9',
                          border: '1px solid #ddd6fe',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={13} />
                        <span>Generate Lead Magnet</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectBusinessForAudit) onSelectBusinessForAudit(biz);
                          setSelectedAuditBusiness(biz);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <ArrowUpRight size={13} />
                        <span>Audit SEO Gap</span>
                      </button>

                      <button
                        onClick={() => setSelectedCompetitorBusiness(biz)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <TrendingUp size={13} color="#4f46e5" />
                        <span>Competitor Gap</span>
                      </button>

                      <button
                        onClick={() => onNavigate('outreach')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#4f46e5',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                        }}
                      >
                        <Send size={13} />
                        <span>Pitch Prospect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lead Magnet Preview Modal (as specified in doc as.md Sections 9, 10, 14) */}
      {selectedLeadMagnet && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '680px',
            maxWidth: '100%',
            maxHeight: '90vh',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.5px' }}>
                  HUNTIQ LEAD MAGNET GENERATOR
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff' }}>
                  {selectedLeadMagnet.leadMagnetTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeadMagnet(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Report Preview */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #eaecf0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Prepared For:</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{selectedLeadMagnet.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedLeadMagnet.location}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Current Organic Visibility</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626' }}>
                    {selectedLeadMagnet.seoOpportunityScore}/100 Gap
                  </div>
                </div>
              </div>

              {/* 1. Keyword Opportunities */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  1. High-Intent Commercial Keyword Targets
                </h4>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {selectedLeadMagnet.commercialIntentKeywords.map((kw, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        borderBottom: i < selectedLeadMagnet.commercialIntentKeywords.length - 1 ? '1px solid #f1f5f9' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{kw}</span>
                      <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '11px' }}>Competitor Page 1 / You: Unranked</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Top Competitor Comparison */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  2. Competitor Advantage Analysis
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedLeadMagnet.topCompetitors.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{c.name}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Estimated Traffic: {c.estimatedTraffic}</div>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {c.rank}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Recommended 90-Day Plan */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  3. Tailored 90-Day Implementation Roadmap
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1' }}>MONTH 1</div>
                    <div style={{ fontSize: '11px', color: '#0c4a6e', marginTop: '4px', lineHeight: 1.35 }}>
                      Technical SEO fix, Google Business verification, Core Web Vitals audit.
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f5f3ff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9' }}>MONTH 2</div>
                    <div style={{ fontSize: '11px', color: '#4c1d95', marginTop: '4px', lineHeight: 1.35 }}>
                      Target treatment landing pages, keyword clustering, local citations.
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>MONTH 3</div>
                    <div style={{ fontSize: '11px', color: '#064e3b', marginTop: '4px', lineHeight: 1.35 }}>
                      High-authority link acquisition, review collection funnel, conversion tracking.
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Revenue Estimate Banner */}
              <div style={{
                padding: '14px 16px',
                backgroundColor: '#eff6ff',
                borderRadius: '10px',
                border: '1px solid #bfdbfe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>Projected Client Growth:</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>
                    12–28 Additional Qualified Inbound Leads / Month
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10.5px', color: '#1e40af' }}>Monthly Opportunity Value:</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#1d4ed8' }}>
                    {selectedLeadMagnet.estimatedMonthlyOpportunity}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #eaecf0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                Lead magnet formatted as a consultative audit.
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSelectedLeadMagnet(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setSelectedLeadMagnet(null);
                    onNavigate('outreach');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Send size={13} />
                  <span>Attach to Outreach Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deep SEO Audit Modal (docs/as.md Section 2, 3, 4, 5) */}
      {selectedAuditBusiness && (
        <SeoAuditModal
          isOpen={!!selectedAuditBusiness}
          onClose={() => setSelectedAuditBusiness(null)}
          targetPayload={{
            businessId: selectedAuditBusiness.id,
            businessName: selectedAuditBusiness.name,
            domain: selectedAuditBusiness.website,
            location: selectedAuditBusiness.location,
            niche: selectedAuditBusiness.category || selectedAuditBusiness.industry
          }}
          onNavigateToOutreach={() => onNavigate('outreach')}
        />
      )}

      {/* Head-to-Head Competitor Analysis Modal (docs/as.md Section 5) */}
      {selectedCompetitorBusiness && (
        <CompetitorAnalysisModal
          isOpen={!!selectedCompetitorBusiness}
          onClose={() => setSelectedCompetitorBusiness(null)}
          targetPayload={{
            prospectId: selectedCompetitorBusiness.id,
            prospectName: selectedCompetitorBusiness.name,
            domain: selectedCompetitorBusiness.website,
            location: selectedCompetitorBusiness.location,
            niche: selectedCompetitorBusiness.category || selectedCompetitorBusiness.industry
          }}
          onNavigateToOutreach={() => onNavigate('outreach')}
        />
      )}

      {/* Multi-Factor SEO Opportunity Score Modal (docs/as.md Section 6, 7, 13) */}
      {selectedScoringBusiness && (
        <OpportunityScoreModal
          isOpen={!!selectedScoringBusiness}
          onClose={() => setSelectedScoringBusiness(null)}
          targetPayload={{
            prospectId: selectedScoringBusiness.id,
            prospectName: selectedScoringBusiness.name,
            domain: selectedScoringBusiness.website,
            location: selectedScoringBusiness.location,
            niche: selectedScoringBusiness.category || selectedScoringBusiness.industry,
            hasWebsite: selectedScoringBusiness.hasWebsite
          }}
          onNavigateToOutreach={() => onNavigate('outreach')}
        />
      )}
    </div>
  );
};
