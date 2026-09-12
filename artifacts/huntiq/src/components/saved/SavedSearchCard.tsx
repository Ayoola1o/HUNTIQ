import React from 'react';
import { 
  Sparkles, 
  Search, 
  Zap, 
  Users, 
  MapPin, 
  Building2, 
  Clock, 
  PauseCircle, 
  PlayCircle, 
  RefreshCw, 
  Trash2, 
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import type { SavedSearchItem } from '../../types/savedSearches';

interface SavedSearchCardProps {
  search: SavedSearchItem;
  onViewResults: (search: SavedSearchItem) => void;
  onToggleMonitoring: (searchId: string) => void;
  onRunSearch: (searchId: string) => void;
  onDelete: (searchId: string) => void;
}

export const SavedSearchCard: React.FC<SavedSearchCardProps> = ({
  search,
  onViewResults,
  onToggleMonitoring,
  onRunSearch,
  onDelete
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);

  const handleRun = async () => {
    setIsScanning(true);
    try {
      await onRunSearch(search.id);
    } finally {
      setTimeout(() => setIsScanning(false), 600);
    }
  };

  const getTypeBadge = (type: SavedSearchItem['searchType']) => {
    switch (type) {
      case 'ai_search':
        return { label: 'AI Search', bg: '#f5f3ff', color: '#6d28d9', icon: <Sparkles size={11} /> };
      case 'signal_search':
        return { label: 'Signal Search', bg: '#fff7ed', color: '#c2410c', icon: <Zap size={11} /> };
      default:
        return { label: 'Advanced Search', bg: '#eff6ff', color: '#1d4ed8', icon: <Search size={11} /> };
    }
  };

  const badge = getTypeBadge(search.searchType);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: search.newMatchesCount > 0 ? '1.5px solid #818cf8' : '1px solid #eaecf0',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      transition: 'all 0.15s ease'
    }}>
      {/* Top Header: Title + Type + Actions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {search.name}
              </h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: badge.bg,
                color: badge.color,
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {badge.icon}
                <span>{badge.label}</span>
              </span>

              {search.monitoringEnabled ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span>Monitoring Active</span>
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                  <span>Paused</span>
                </span>
              )}
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.4 }}>
              {search.description}
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '4px',
                borderRadius: '6px'
              }}
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '24px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                zIndex: 30,
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column',
                padding: '4px 0'
              }}>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onToggleMonitoring(search.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {search.monitoringEnabled ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                  <span>{search.monitoringEnabled ? 'Pause Monitoring' : 'Resume Monitoring'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleRun();
                  }}
                  disabled={isScanning}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
                  <span>{isScanning ? 'Running Scan...' : 'Run Search Now'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(search.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: '#dc2626',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Search</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Criteria Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
          {search.filters.industries.map((ind, i) => (
            <span key={i} style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Building2 size={10} color="#64748b" />
              {ind}
            </span>
          ))}

          {search.filters.locations.map((loc, i) => (
            <span key={i} style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <MapPin size={10} color="#64748b" />
              {loc}
            </span>
          ))}

          {search.filters.companySizes.map((size, i) => (
            <span key={i} style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Users size={10} color="#64748b" />
              {size}
            </span>
          ))}
        </div>

        {/* Signals to Watch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Watching:</span>
          {search.signalsToWatch.map((sig, i) => (
            <span key={i} style={{
              backgroundColor: '#fff7ed',
              color: '#c2410c',
              border: '1px solid #ffedd5',
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px'
            }}>
              {sig}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics Row & Action Footer */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>Current Matches</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>
              {search.totalMatches} companies
            </div>
          </div>

          <div style={{ backgroundColor: search.newMatchesCount > 0 ? '#ede9fe' : '#f8fafc', padding: '8px 10px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10.5px', color: search.newMatchesCount > 0 ? '#5b21b6' : '#64748b' }}>New This Week</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: search.newMatchesCount > 0 ? '#6d28d9' : '#0f172a', marginTop: '1px' }}>
              +{search.newMatchesCount} new
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>High Opportunity</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginTop: '1px' }}>
              {search.highOpportunityCount} high-fit
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8' }}>
            <Clock size={12} />
            <span>Updated {search.lastUpdated}</span>
          </div>

          <button
            onClick={() => onViewResults(search)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
            }}
          >
            <span>View Results</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
