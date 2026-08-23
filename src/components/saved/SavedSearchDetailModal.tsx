import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  PauseCircle, 
  PlayCircle, 
  Zap, 
  ChevronRight
} from 'lucide-react';
import type { SavedSearchItem, AlertFrequency } from '../../types/savedSearches';

interface SavedSearchDetailModalProps {
  search: SavedSearchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleMonitoring: (searchId: string) => void;
  onRunSearch: (searchId: string) => void;
  onInvestigateCompany: (companyName: string) => void;
}

export const SavedSearchDetailModal: React.FC<SavedSearchDetailModalProps> = ({
  search,
  isOpen,
  onClose,
  onToggleMonitoring,
  onRunSearch,
  onInvestigateCompany
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'new_matches' | 'activity' | 'criteria' | 'alerts'>('results');
  const [alertSettings, setAlertSettings] = useState(search?.alertSettings);
  const [frequency, setFrequency] = useState<AlertFrequency>(search?.alertFrequency || 'immediately');
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen || !search) return null;

  const handleRunNow = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      onRunSearch(search.id);
    }, 800);
  };

  const displayedCompanies = activeTab === 'new_matches' 
    ? search.matchedCompanies.filter(c => c.isNewMatch)
    : search.matchedCompanies;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
        width: '880px',
        maxWidth: '100%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                {search.name}
              </h2>
              {search.monitoringEnabled ? (
                <span style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span>Monitoring Active</span>
                </span>
              ) : (
                <span style={{
                  backgroundColor: '#334155',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  Monitoring Paused
                </span>
              )}
            </div>

            <p style={{ fontSize: '12px', color: '#a5b4fc', margin: '4px 0 0 0' }}>
              {search.description} • {search.totalMatches} matched companies
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onToggleMonitoring(search.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {search.monitoringEnabled ? <PauseCircle size={13} /> : <PlayCircle size={13} />}
              <span>{search.monitoringEnabled ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleRunNow}
              disabled={isRunning}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={isRunning ? 'animate-spin' : ''} />
              <span>{isRunning ? 'Running...' : 'Run Now'}</span>
            </button>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
            >
              <X size={20} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          display: 'flex',
          gap: '8px'
        }}>
          {[
            { id: 'results', label: `All Results (${search.totalMatches})` },
            { id: 'new_matches', label: `New Matches (+${search.newMatchesCount})` },
            { id: 'activity', label: 'Activity & History' },
            { id: 'criteria', label: 'Search Criteria' },
            { id: 'alerts', label: 'Alert Preferences' }
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
                borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Results Tab & New Matches Tab */}
          {(activeTab === 'results' || activeTab === 'new_matches') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedCompanies.map((comp) => (
                <div
                  key={comp.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: comp.isNewMatch ? '1.5px solid #c7d2fe' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 800
                    }}>
                      {comp.companyName[0]}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{comp.companyName}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>({comp.domain})</span>
                        {comp.isNewMatch && (
                          <span style={{
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            ★ NEW MATCH
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '11.5px', color: '#64748b' }}>
                        <span>{comp.industry}</span>
                        <span>•</span>
                        <span>{comp.location}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Score */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: comp.opportunityScore >= 90 ? '#059669' : '#2563eb' }}>
                        {comp.opportunityScore} <span style={{ fontSize: '10px', color: '#94a3b8' }}>/ 100</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {comp.opportunityLevel} Opp.
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => {
                        onClose();
                        onInvestigateCompany(comp.companyName);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#f5f3ff',
                        border: '1px solid #ddd6fe',
                        color: '#6d28d9',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>Investigate</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity & History Tab */}
          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {search.activityHistory.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    width: '75px',
                    paddingTop: '2px'
                  }}>
                    {act.timestamp}
                  </div>

                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: act.type === 'new_match' ? '#ecfdf5' : '#eff6ff',
                    color: act.type === 'new_match' ? '#059669' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Zap size={12} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      {act.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Criteria Tab */}
          {activeTab === 'criteria' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                  Target Company Parameters
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Industries:</span>
                    <strong style={{ color: '#0f172a' }}>{search.filters.industries.join(', ')}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Locations:</span>
                    <strong style={{ color: '#0f172a' }}>{search.filters.locations.join(', ')}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Company Size:</span>
                    <strong style={{ color: '#0f172a' }}>{search.filters.companySizes.join(', ')}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Target ICP:</span>
                    <strong style={{ color: '#4f46e5' }}>{search.icpName}</strong>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#9a3412', margin: '0 0 8px 0' }}>
                  Monitored Buying Signals
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {search.signalsToWatch.map((sig, i) => (
                    <span key={i} style={{
                      backgroundColor: '#ffedd5',
                      color: '#c2410c',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Alert Preferences Tab */}
          {activeTab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                  Trigger Notifications When:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'onNewMatch', label: 'New matching companies appear' },
                    { key: 'onHighOpportunity', label: 'High opportunity score (90+) detected' },
                    { key: 'onHiringSignal', label: 'Hiring spike or surge detected' },
                    { key: 'onExpansionSignal', label: 'Geographic or regional expansion announced' },
                    { key: 'onLeadershipSignal', label: 'Executive leadership change' },
                    { key: 'onFundingSignal', label: 'Venture funding or capital raise' }
                  ].map((rule) => (
                    <label key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={(alertSettings as any)?.[rule.key] ?? true}
                        onChange={(e) => {
                          setAlertSettings({
                            ...alertSettings!,
                            [rule.key]: e.target.checked
                          });
                        }}
                        style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
                      />
                      <span>{rule.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Alert Frequency */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Notification Frequency
                </h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(['immediately', 'daily', 'weekly'] as AlertFrequency[]).map((f) => (
                    <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', textTransform: 'capitalize', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="alertFrequency"
                        checked={frequency === f}
                        onChange={() => setFrequency(f)}
                        style={{ accentColor: '#4f46e5' }}
                      />
                      <span>{f} Digest</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
