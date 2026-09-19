import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  Users, 
  Send, 
  ExternalLink, 
  Copy, 
  Check, 
  Building2, 
  Globe, 
  MapPin, 
  TrendingUp, 
  Zap, 
  Cpu, 
  AlertTriangle, 
  Target, 
  Clock, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MessageSquare
} from 'lucide-react';
import type { CompanyResearchReport } from '../../types/research';

interface ResearchReportViewProps {
  report: CompanyResearchReport;
  onBack: () => void;
  onRefresh: (reportId: string) => void;
  onNavigateToContacts?: () => void;
  onNavigateToOutreach?: () => void;
}

export const ResearchReportView: React.FC<ResearchReportViewProps> = ({
  report,
  onBack,
  onRefresh,
  onNavigateToContacts,
  onNavigateToOutreach
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'why_now' | 'company' | 'tech_competitors' | 'people' | 'outreach' | 'sources'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onRefresh(report.id);
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#f4f6fa',
      overflowY: 'auto',
      paddingBottom: '40px'
    }}>
      {/* Top Action Nav Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eaecf0',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Research</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Research'}</span>
          </button>

          <button
            onClick={onNavigateToContacts}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Users size={12} />
            <span>Find Contacts</span>
          </button>

          <button
            onClick={onNavigateToOutreach}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Send size={12} />
            <span>Generate Outreach</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div style={{
        backgroundColor: '#090d16',
        color: '#ffffff',
        padding: '24px 32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* Left Company Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: report.logoBg,
            color: report.logoColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 900,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            flexShrink: 0
          }}>
            {report.logoInitial}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                {report.companyName}
              </h1>
              <a
                href={`https://${report.domain}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  textDecoration: 'none'
                }}
              >
                <span>{report.domain}</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '11.5px', color: '#cbd5e1' }}>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                {report.industry}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={12} color="#94a3b8" />
                {report.location}
              </span>
              <span>•</span>
              <span>{report.employees} employees</span>
              <span>•</span>
              <span>Revenue: {report.revenue}</span>
            </div>
          </div>
        </div>

        {/* Right Score & Intent Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Opportunity Score Widget */}
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '8px 14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 800, textTransform: 'uppercase' }}>
              Opportunity Score
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#10b981', lineHeight: 1.1, marginTop: '2px' }}>
              {report.opportunityScore} <span style={{ fontSize: '11px', color: '#6ee7b7' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '10px', color: '#a7f3d0', fontWeight: 600 }}>
              {report.opportunityLevel}
            </div>
          </div>

          {/* Buying Intent Widget */}
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '8px 14px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', color: '#f87171', fontWeight: 800, textTransform: 'uppercase' }}>
              Buying Intent
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#ef4444', lineHeight: 1.2, marginTop: '4px' }}>
              🔥 {report.buyingIntent}
            </div>
            <div style={{ fontSize: '10px', color: '#fca5a5', fontWeight: 600 }}>
              3 Active Signals
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eaecf0',
        padding: '0 32px',
        display: 'flex',
        gap: '8px'
      }}>
        {[
          { id: 'all', label: 'Full 360° Report' },
          { id: 'why_now', label: 'Why Now? & Signals' },
          { id: 'company', label: 'Company & Business Model' },
          { id: 'tech_competitors', label: 'Tech Stack & Competitors' },
          { id: 'people', label: 'Decision Makers' },
          { id: 'outreach', label: 'Outreach & Approach' },
          { id: 'sources', label: 'Sources & Evidence' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: activeTab === tab.id ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Intelligence Body */}
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Section 1: Executive Summary */}
        {(activeTab === 'all' || activeTab === 'company') && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #eaecf0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sparkles size={16} color="#6366f1" />
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Executive Intelligence Summary
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              {report.executiveSummary}
            </p>
          </div>
        )}

        {/* Section 2: Why Contact Them Now? (Hero Reason) */}
        {(activeTab === 'all' || activeTab === 'why_now') && (
          <div style={{
            backgroundColor: '#fff7ed',
            borderRadius: '14px',
            border: '1px solid #fed7aa',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#ea580c" />
                <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#9a3412', margin: 0 }}>
                  Why Contact Them Now?
                </h3>
              </div>
              <span style={{
                backgroundColor: '#ffedd5',
                color: '#c2410c',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800
              }}>
                🔥 {report.whyNow.signalCount} High-Priority Signals
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {report.whyNow.signals.map((sigText, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid #ffedd5',
                  fontSize: '12px',
                  color: '#431407',
                  lineHeight: 1.4
                }}>
                  <strong style={{ display: 'block', color: '#ea580c', marginBottom: '3px' }}>
                    Signal #{idx + 1}
                  </strong>
                  {sigText}
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#7c2d12',
              lineHeight: 1.4,
              borderLeft: '3px solid #ea580c'
            }}>
              <strong>AI Conclusion: </strong> {report.whyNow.aiConclusion}
            </div>
          </div>
        )}

        {/* Section 3: Signals Timeline */}
        {(activeTab === 'all' || activeTab === 'why_now') && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #eaecf0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Clock size={16} color="#6366f1" />
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Recent Signal Activity Timeline
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report.signalsTimeline.map((sig) => (
                <div
                  key={sig.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    width: '60px',
                    paddingTop: '2px'
                  }}>
                    {sig.date}
                  </div>

                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: sig.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Zap size={12} color={sig.iconColor} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                      {sig.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      {sig.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Company & Business Model */}
        {(activeTab === 'all' || activeTab === 'company') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px'
          }}>
            {/* Overview */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Building2 size={16} color="#2563eb" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Company Overview
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {report.companyOverview}
              </p>

              {/* Quick Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '11.5px'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Founded: </span>
                  <strong style={{ color: '#0f172a' }}>{report.founded}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Headquarters: </span>
                  <strong style={{ color: '#0f172a' }}>{report.location}</strong>
                </div>
              </div>
            </div>

            {/* Business Model */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <TrendingUp size={16} color="#059669" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Business Model & Revenue Engine
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div>
                  <strong style={{ color: '#0f172a' }}>What they sell: </strong>
                  <span style={{ color: '#475569' }}>{report.businessModel.whatTheySell}</span>
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>How they make money: </strong>
                  <span style={{ color: '#475569' }}>{report.businessModel.howTheyMakeMoney}</span>
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Target customers: </strong>
                  <span style={{ color: '#475569' }}>{report.businessModel.targetCustomers}</span>
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Revenue model: </strong>
                  <span style={{ color: '#475569' }}>{report.businessModel.revenueModel}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Growth & Tech Stack */}
        {(activeTab === 'all' || activeTab === 'tech_competitors') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px'
          }}>
            {/* Growth Intelligence */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <TrendingUp size={16} color="#7c3aed" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Growth Intelligence
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Employee Growth</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    {report.growth.employeeGrowth}
                  </div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Active Job Listings</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                    {report.growth.hiringCount}
                  </div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Expansion Footprint</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {report.growth.expansionLocations}
                  </div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Funding Stage</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
                    {report.growth.fundingStage}
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Cpu size={16} color="#d97706" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Detected Technologies
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {report.technologies.map((tech) => (
                  <div
                    key={tech.name}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{tech.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{tech.category}</div>
                    </div>
                    <span style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      color: tech.confidence === 'Verified' ? '#047857' : '#1d4ed8',
                      backgroundColor: tech.confidence === 'Verified' ? '#ecfdf5' : '#eff6ff',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}>
                      {tech.confidence}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Potential Problems & Opportunities */}
        {(activeTab === 'all' || activeTab === 'company') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px'
          }}>
            {/* Potential Problems */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle size={16} color="#e11d48" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Potential Problems We Can Solve
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {report.potentialProblems.map((prob, idx) => (
                  <div key={idx} style={{
                    padding: '10px 12px',
                    backgroundColor: '#fff1f2',
                    borderRadius: '8px',
                    border: '1px solid #ffe4e6'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#9f1239' }}>
                      {prob.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#881337', marginTop: '2px', lineHeight: 1.3 }}>
                      {prob.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities for User */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Target size={16} color="#059669" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Services We Can Sell
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {report.potentialOpportunities.map((opp, idx) => (
                  <div key={idx} style={{
                    padding: '10px 12px',
                    backgroundColor: '#ecfdf5',
                    borderRadius: '8px',
                    border: '1px solid #d1fae5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#065f46' }}>
                        {opp.serviceName}
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#047857', backgroundColor: '#a7f3d0', padding: '1px 6px', borderRadius: '4px' }}>
                        {opp.relevance} Relevance
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#064e3b', marginTop: '2px', lineHeight: 1.3 }}>
                      {opp.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 7: Decision Makers & Best Person to Contact */}
        {(activeTab === 'all' || activeTab === 'people') && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #eaecf0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#4f46e5" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Key Decision Makers
                </h3>
              </div>

              <button
                onClick={onNavigateToContacts}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                View all in Contacts →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {report.decisionMakers.map((dm) => (
                <div
                  key={dm.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: dm.isBestContact ? '#f5f3ff' : '#f8fafc',
                    border: dm.isBestContact ? '1.5px solid #818cf8' : '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: dm.avatarBg,
                      color: dm.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 800
                    }}>
                      {dm.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {dm.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {dm.role}
                      </div>
                    </div>
                  </div>

                  {dm.isBestContact && (
                    <div style={{
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Sparkles size={11} />
                      <span>★ Best Person to Contact (94% Conf.)</span>
                    </div>
                  )}

                  {dm.reasonForContact && (
                    <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: 1.3 }}>
                      {dm.reasonForContact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 8: Recommended Tactical Approach & Outreach Scripts */}
        {(activeTab === 'all' || activeTab === 'outreach') && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #eaecf0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} color="#4f46e5" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Recommended Approach & Generated Outreach
                </h3>
              </div>

              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
                Ready to Send
              </span>
            </div>

            {/* Tactical Angle Callout */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#334155'
            }}>
              <strong style={{ color: '#4338ca', display: 'block', marginBottom: '2px' }}>
                Tactical Angle:
              </strong>
              {report.recommendedApproach.headline}
            </div>

            {/* Multi-Channel Tabs / Previews */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '16px'
            }}>
              {/* Cold Email Preview */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={13} color="#6366f1" />
                    <span>Personalized Email Script</span>
                  </span>

                  <button
                    onClick={() => handleCopy(report.outreachScripts.email.body, 'email')}
                    style={{
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedKey === 'email' ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                    <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>
                  {report.outreachScripts.email.subject}
                </div>

                <div style={{
                  fontSize: '11.5px',
                  color: '#475569',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.45,
                  backgroundColor: '#f8fafc',
                  padding: '10px',
                  borderRadius: '6px'
                }}>
                  {report.outreachScripts.email.body}
                </div>
              </div>

              {/* LinkedIn & WhatsApp Scripts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* LinkedIn */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={12} color="#0284c7" />
                      <span>LinkedIn InMail Message</span>
                    </span>

                    <button
                      onClick={() => handleCopy(report.outreachScripts.linkedIn.text, 'linkedin')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6366f1',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {copiedKey === 'linkedin' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                    {report.outreachScripts.linkedIn.text}
                  </p>
                </div>

                {/* Call Script Hook */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} color="#059669" />
                      <span>Cold Call Opener & Hook</span>
                    </span>

                    <button
                      onClick={() => handleCopy(report.outreachScripts.callScript.intro, 'call')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6366f1',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {copiedKey === 'call' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                    "{report.outreachScripts.callScript.intro}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 9: Sources & Evidence */}
        {(activeTab === 'all' || activeTab === 'sources') && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #eaecf0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#059669" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Sources, Provenance & Evidence
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Every AI claim linked to verifiable source data
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {report.sources.map((src) => (
                <div
                  key={src.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    fontSize: '11.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={13} color="#64748b" />
                    <div>
                      <strong style={{ color: '#0f172a' }}>{src.title}</strong>
                      <span style={{ color: '#94a3b8', marginLeft: '6px' }}>({src.claimReference})</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#059669', fontWeight: 700, fontSize: '11px' }}>
                      {src.confidence}% Confidence
                    </span>
                    <a
                      href={src.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#6366f1', textDecoration: 'none' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
