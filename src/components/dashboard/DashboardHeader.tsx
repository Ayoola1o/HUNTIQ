import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Bell, 
  Calendar, 
  Users, 
  ChevronDown 
} from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

interface DashboardHeaderProps {
  onOpenCopilot: () => void;
  dateRange: string;
  onChangeDateRange: (range: string) => void;
  selectedTeam: string;
  onChangeTeam: (team: string) => void;
  onSearch: (query: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenCopilot,
  dateRange,
  onChangeDateRange,
  selectedTeam,
  onChangeTeam,
  onSearch
}) => {
  const { isLiveBackend } = useHuntiq();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const dateOptions = [
    'May 16, 2025',
    'Today',
    'Last 7 days',
    'Last 30 days',
    'Last 90 days',
    'This quarter'
  ];

  const teamOptions = [
    'All Teams',
    'Enterprise Outbound',
    'Growth & SDRs',
    'Mid-Market Hunters'
  ];

  return (
    <header style={{
      padding: '16px 24px 14px',
      backgroundColor: '#f4f6fa',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Top Main Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Left Greeting */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 3px 0',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-primary)'
            }}>
              {getGreeting()}, Ayoola 👋
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: isLiveBackend ? '#ecfdf5' : '#f8fafc',
              border: `1px solid ${isLiveBackend ? '#a7f3d0' : '#e2e8f0'}`,
              fontSize: '11px',
              fontWeight: 600,
              color: isLiveBackend ? '#059669' : '#64748b'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isLiveBackend ? '#10b981' : '#94a3b8'
              }} />
              {isLiveBackend ? 'Live Data Feed Active' : 'Intelligence Engine Active'}
            </div>
          </div>
          <p style={{
            fontSize: '13.5px',
            color: '#64748b',
            margin: 0,
            fontWeight: 400
          }}>
            Here's what changed across your market.
          </p>
        </div>

        {/* Right Search, Copilot, Notifications, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0 12px',
            width: '280px',
            height: '38px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <Search size={16} color="#94a3b8" style={{ marginRight: '8px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search companies, people, signals..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#0f172a',
                width: '100%',
                backgroundColor: 'transparent'
              }}
            />
            <kbd style={{
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              padding: '2px 6px',
              borderRadius: '5px',
              border: '1px solid #cbd5e1',
              flexShrink: 0
            }}>
              ⌘ K
            </kbd>
          </div>

          {/* Ask AI Copilot Button */}
          <button
            onClick={onOpenCopilot}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0b0f19',
              color: '#ffffff',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '10px',
              padding: '0 16px',
              height: '38px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(11, 15, 25, 0.3)',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#161e31')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0b0f19')}
          >
            <Sparkles size={15} color="#a5b4fc" />
            <span>Ask AI Copilot</span>
          </button>

          {/* Notifications Button */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              <Bell size={18} />
            </button>
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #f4f6fa'
            }}>
              12
            </span>
          </div>

          {/* User Initials Avatar */}
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#e0e7ff',
            color: '#4338ca',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #c7d2fe'
          }}>
            AA
          </div>
        </div>
      </div>

      {/* Global Filter Bar (Dates & Teams) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        {/* Date Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDateOpen(!isDateOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Calendar size={14} color="#64748b" />
            <span>{dateRange}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {isDateOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 30,
              minWidth: '150px',
              overflow: 'hidden'
            }}>
              {dateOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChangeDateRange(opt);
                    setIsDateOpen(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    fontWeight: dateRange === opt ? 700 : 500,
                    color: dateRange === opt ? '#4f46e5' : '#334155',
                    backgroundColor: dateRange === opt ? '#f5f3ff' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Scope Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsTeamOpen(!isTeamOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Users size={14} color="#64748b" />
            <span>{selectedTeam}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {isTeamOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 30,
              minWidth: '160px',
              overflow: 'hidden'
            }}>
              {teamOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChangeTeam(opt);
                    setIsTeamOpen(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    fontWeight: selectedTeam === opt ? 700 : 500,
                    color: selectedTeam === opt ? '#4f46e5' : '#334155',
                    backgroundColor: selectedTeam === opt ? '#f5f3ff' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
