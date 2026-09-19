import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Globe, 
  ExternalLink, 
  Send, 
  TrendingUp, 
  Activity, 
  MapPin, 
  Link2, 
  Layers, 
  Sparkles, 
  Loader2 
} from 'lucide-react';
import type { SeoAuditResult, RunSeoAuditPayload } from '../../types/seoAudit';
import { analyzeSeo } from '../../api/seoAudit';

interface SeoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPayload: RunSeoAuditPayload | null;
  onNavigateToOutreach?: () => void;
}

export const SeoAuditModal: React.FC<SeoAuditModalProps> = ({
  isOpen,
  onClose,
  targetPayload,
  onNavigateToOutreach
}) => {
  const [activeTab, setActiveTab] = useState<'technical' | 'onpage' | 'local' | 'keywords' | 'backlinks'>('technical');
  const [audit, setAudit] = useState<SeoAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetPayload) {
      setIsLoading(true);
      analyzeSeo(targetPayload)
        .then(res => setAudit(res))
        .catch(err => console.error('SEO audit error:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, targetPayload]);

  if (!isOpen || !targetPayload) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '840px',
        maxWidth: '100%',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                border: '1px solid rgba(165, 180, 252, 0.3)',
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                DEEP SEO AUDIT ENGINE
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {targetPayload.niche || 'Target Niche'} • {targetPayload.location || 'Local Market'}
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
              {targetPayload.businessName}
            </h3>

            {targetPayload.domain && (
              <a
                href={targetPayload.domain}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  color: '#93c5fd',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
              >
                <Globe size={12} />
                <span>{targetPayload.domain}</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !audit ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <Loader2 size={36} color="#4f46e5" className="animate-spin" />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Auditing Technical Signals, Keyword SERPs & Backlink Gaps...
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Checking PageSpeed, Core Web Vitals, Schema markup, and Competitor positions
            </div>
          </div>
        ) : (
          <>
            {/* Top Score & Commercial Opportunity Bar (as specified in doc as.md Section 6) */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #eaecf0',
              padding: '16px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>
              {/* Overall SEO Health */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Organic SEO Health</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: audit.overallSeoScore < 50 ? '#dc2626' : '#d97706' }}>
                    {audit.overallSeoScore}/100
                  </div>
                  <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700 }}>Heavy Ranking Suppressions</div>
                </div>
                <Activity size={24} color="#dc2626" />
              </div>

              {/* Opportunity Score */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SEO Opportunity Score</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a' }}>
                    {audit.seoOpportunityScore}/100
                  </div>
                  <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>High Commercial Propensity</div>
                </div>
                <TrendingUp size={24} color="#16a34a" />
              </div>

              {/* Monthly Revenue Gap */}
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700 }}>Monthly Revenue Opportunity</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e3a8a' }}>
                    {audit.estimatedMonthlyRevenueOpportunity}
                  </div>
                  <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>15–30 Missed Inbound Leads</div>
                </div>
                <Sparkles size={24} color="#2563eb" />
              </div>
            </div>

            {/* Audit Categories Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              padding: '0 24px',
              backgroundColor: '#ffffff',
              gap: '4px'
            }}>
              {[
                { id: 'technical', label: 'Technical SEO', score: audit.technical.score, icon: <Activity size={13} /> },
                { id: 'onpage', label: 'On-Page SEO', score: audit.onPage.score, icon: <Layers size={13} /> },
                { id: 'local', label: 'Local SEO', score: audit.local.score, icon: <MapPin size={13} /> },
                { id: 'keywords', label: 'Keyword Gap', score: audit.contentAndKeywords.score, icon: <TrendingUp size={13} /> },
                { id: 'backlinks', label: 'Backlinks & Authority', score: audit.backlinks.score, icon: <Link2 size={13} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 14px',
                    border: 'none',
                    background: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent',
                    color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                    fontSize: '12.5px',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: tab.score < 50 ? '#fee2e2' : '#fef3c7',
                    color: tab.score < 50 ? '#991b1b' : '#92400e',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    {tab.score}%
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content Panels */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. Technical SEO Tab */}
              {activeTab === 'technical' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    Technical Infrastructure & Search Crawlability
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                  }}>
                    {[
                      { label: 'HTTPS Protocol', status: audit.technical.https, desc: 'SSL certificate active & valid' },
                      { label: 'Mobile Optimization', status: audit.technical.mobileOptimization, desc: 'Responsive viewport & touch targets' },
                      { label: 'XML Sitemap', status: audit.technical.xmlSitemap, desc: 'Submitted & indexed sitemap.xml' },
                      { label: 'Robots.txt', status: audit.technical.robotsTxt, desc: 'Proper crawler directives found' },
                      { label: 'Canonical Tags', status: audit.technical.canonicalTags, desc: 'Self-referencing canonicals configured' },
                      { label: 'Core Web Vitals', customStatus: audit.technical.coreWebVitals, desc: 'LCP > 4.5s (Poor performance)' }
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{item.label}</span>
                          {item.customStatus ? (
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>
                              {item.customStatus}
                            </span>
                          ) : item.status ? (
                            <CheckCircle2 size={16} color="#16a34a" />
                          ) : (
                            <XCircle size={16} color="#dc2626" />
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Page Speed & Broken Links callout */}
                  <div style={{
                    backgroundColor: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#9a3412' }}>
                        Page Speed Score: {audit.technical.pageSpeedScore}/100 &bull; {audit.technical.brokenLinksCount} Broken Links Found
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#c2410c', marginTop: '2px' }}>
                        Mobile load time delays lead to a 40%+ drop in organic form completions.
                      </div>
                    </div>
                    <AlertTriangle size={24} color="#ea580c" />
                  </div>
                </div>
              )}

              {/* 2. On-Page SEO Tab */}
              {activeTab === 'onpage' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    On-Page Content & Metadata Optimization
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Title Tag Optimization', pct: audit.onPage.titleOptimizationPct, note: '58% of pages have duplicate or non-targeted titles' },
                      { label: 'Meta Descriptions', pct: audit.onPage.metaDescriptionsPct, note: '69% of pages missing compelling conversion snippet' },
                      { label: 'Heading Structure (H1-H3)', pct: audit.onPage.headingStructurePct, note: 'Missing single H1 and hierarchical H2 tags' },
                      { label: 'Commercial Keyword Targeting', pct: audit.onPage.keywordTargetingPct, note: 'Fails to target transactional keywords' },
                      { label: 'Internal Linking Architecture', pct: audit.onPage.internalLinkingPct, note: 'Zero context links between related services' },
                      { label: 'Image Alt & Compression', pct: audit.onPage.imageOptimizationPct, note: 'Heavy uncompressed PNGs missing alt attributes' }
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{item.label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: item.pct < 40 ? '#dc2626' : '#d97706' }}>
                            {item.pct}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${item.pct}%`,
                            height: '100%',
                            backgroundColor: item.pct < 40 ? '#ef4444' : '#f59e0b',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '6px' }}>{item.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Local SEO Tab */}
              {activeTab === 'local' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    Local Search, Google Business & NAP Presence
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Google Business Profile</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                        ⭐ {audit.local.googleRating} ({audit.local.reviewCount} reviews)
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Competitor average in district is 240+ reviews. Response rate is only {audit.local.reviewResponsesPct}%.
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>NAP Directory Consistency</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>
                        {audit.local.napConsistency}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Different phone numbers and addresses found across 5 local directories.
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Local Landing Pages</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: audit.local.localLandingPages ? '#16a34a' : '#dc2626' }}>
                        {audit.local.localLandingPages ? 'Optimized' : 'Missing (0 Location Pages)'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Lacks dedicated neighborhood pages for nearby sub-districts.
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>LocalBusiness Schema Markup</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: audit.local.localSchema ? '#16a34a' : '#dc2626' }}>
                        {audit.local.localSchema ? 'Active' : 'Not Implemented'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Google cannot extract operating hours, consultation pricing, or geo-coordinates for rich snippets.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Keyword Gap Tab (Matching Section 4 Table in docs/as.md) */}
              {activeTab === 'keywords' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      High-Intent Commercial Keyword Gap Analysis
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Comparing target business rankings against page 1 competitor leaders:
                    </div>
                  </div>

                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Target Keyword</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Monthly Volume</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700, color: '#16a34a' }}>Competitor Position</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700, color: '#dc2626' }}>Prospect Position</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Commercial Intent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {audit.contentAndKeywords.missedCommercialKeywords.map((kw, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                              &ldquo;{kw.keyword}&rdquo;
                            </td>
                            <td style={{ padding: '10px 14px', color: '#475569' }}>
                              {kw.searchVolume.toLocaleString()}/mo
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 800, color: '#16a34a' }}>
                              {kw.competitorRank}
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 800, color: '#dc2626' }}>
                              {kw.prospectRank}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                backgroundColor: kw.commercialIntent === 'Very High' ? '#fef2f2' : '#eff6ff',
                                color: kw.commercialIntent === 'Very High' ? '#dc2626' : '#2563eb',
                                padding: '2px 7px',
                                borderRadius: '4px'
                              }}>
                                {kw.commercialIntent}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '11.5px',
                    color: '#1e40af'
                  }}>
                    <strong>Sales Pitch Formulation:</strong> &ldquo;Your competitors are appearing in positions #1–#4 for five high-intent search terms that your business currently doesn't rank for on Google.&rdquo;
                  </div>
                </div>
              )}

              {/* 5. Backlinks & Authority Tab (Matching Section 5 Table in docs/as.md) */}
              {activeTab === 'backlinks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      Backlinks & Domain Authority Comparison
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Why the competitor is winning in Google PageRank and trustworthiness:
                    </div>
                  </div>

                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569' }}>Metric</th>
                          <th style={{ padding: '10px 16px', fontWeight: 700, color: '#dc2626' }}>{audit.businessName}</th>
                          <th style={{ padding: '10px 16px', fontWeight: 700, color: '#16a34a' }}>Competitor Avg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { metric: 'Domain Authority (DA)', prospect: audit.backlinks.domainAuthority, comp: audit.backlinks.competitorAvgDA },
                          { metric: 'Referring Domains', prospect: audit.backlinks.referringDomains, comp: audit.backlinks.competitorAvgReferringDomains },
                          { metric: 'Total Backlinks', prospect: audit.backlinks.backlinksTotal, comp: '1,420+' },
                          { metric: 'Local Directory Citations', prospect: audit.local.localCitationsCount, comp: '84+' },
                          { metric: 'Google Reviews', prospect: audit.local.reviewCount, comp: '240+' }
                        ].map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>{row.metric}</td>
                            <td style={{ padding: '10px 16px', fontWeight: 800, color: '#dc2626' }}>{row.prospect}</td>
                            <td style={{ padding: '10px 16px', fontWeight: 800, color: '#16a34a' }}>{row.comp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #eaecf0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Recommended Service Package: </span>
                <strong style={{ fontSize: '12px', color: '#1d4ed8' }}>{audit.recommendedServicePackage}</strong>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={onClose}
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
                  Close Audit
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToOutreach) onNavigateToOutreach();
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
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                  }}
                >
                  <Send size={13} />
                  <span>Pitch SEO Opportunity</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
