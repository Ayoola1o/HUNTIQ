import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Zap,
  Search,
  Building2,
  Users,
  Bookmark,
  Compass,
  Kanban,
  Send,
  Mail,
  CheckSquare,
  Calendar,
  Activity,
  BarChart3,
  Bell,
  Users2,
  Layers,
  Settings,
  ChevronDown,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';

interface DashboardSidebarProps {
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeNav,
  onSelectNav,
  onGoToOnboarding
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navSections = [
    {
      label: 'COMMAND',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { id: 'copilot', label: 'AI Copilot', icon: <Sparkles size={16} />, badge: 'New' },
        { id: 'opportunities', label: 'Opportunities', icon: <Target size={16} /> },
        { id: 'signals', label: 'Signals', icon: <Zap size={16} /> },
      ]
    },
    {
      label: 'HUNT',
      items: [
        { id: 'find-prospects', label: 'Find Prospects', icon: <Search size={16} /> },
        { id: 'companies', label: 'Companies', icon: <Building2 size={16} /> },
        { id: 'contacts', label: 'Contacts', icon: <Users size={16} /> },
        { id: 'saved-searches', label: 'Saved Searches', icon: <Bookmark size={16} /> },
        { id: 'research', label: 'Research', icon: <Compass size={16} /> },
      ]
    },
    {
      label: 'SELL',
      items: [
        { id: 'pipeline', label: 'Pipeline', icon: <Kanban size={16} /> },
        { id: 'campaigns', label: 'Campaigns', icon: <Send size={16} /> },
        { id: 'outreach', label: 'Outreach', icon: <Mail size={16} /> },
        { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} /> },
        { id: 'meetings', label: 'Meetings', icon: <Calendar size={16} /> },
      ]
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { id: 'market-intel', label: 'Market Intelligence', icon: <Activity size={16} /> },
        { id: 'reports', label: 'Reports', icon: <BarChart3 size={16} /> },
        { id: 'alerts', label: 'Alerts', icon: <Bell size={16} /> },
      ]
    },
    {
      label: 'MANAGE',
      items: [
        { id: 'team', label: 'Team', icon: <Users2 size={16} /> },
        { id: 'integrations', label: 'Integrations', icon: <Layers size={16} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
      ]
    },
  ];

  const handleItemClick = (id: string) => {
    onSelectNav(id);
    if (isMobileScreen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Floating Hamburger Trigger Button */}
      {isMobileScreen && !isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open Navigation"
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: 990,
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#090d16',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Menu size={18} color="#818cf8" />
        </button>
      )}

      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: isCollapsed && !isMobileScreen ? '68px' : '230px',
          minWidth: isCollapsed && !isMobileScreen ? '68px' : '230px',
          backgroundColor: '#090d16',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isCollapsed && !isMobileScreen ? '20px 8px' : '20px 14px',
          borderRight: '1px solid rgba(255, 255, 255, 0.07)',
          height: '100vh',
          overflowY: 'auto',
          userSelect: 'none',
          boxSizing: 'border-box'
        }}
      >
        <div>
          {/* Top Brand Logo & Hamburger Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed && !isMobileScreen ? 'center' : 'space-between',
            marginBottom: '20px',
            paddingLeft: isCollapsed && !isMobileScreen ? '0' : '6px'
          }}>
            <div 
              onClick={() => handleItemClick('dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(124, 58, 237, 0.6)',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C14.0747 21 15.9868 20.2974 17.5097 19.1171L19.2929 20.9003C19.6834 21.2908 20.3166 21.2908 20.7071 20.9003C21.0976 20.5097 21.0976 19.8766 20.7071 19.486L18.9959 17.7748C20.2474 16.1952 21 14.1873 21 12C21 7.02944 16.9706 3 12 3ZM7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12Z"
                    fill="white"
                  />
                  <circle cx="12" cy="12" r="2.2" fill="#c4b5fd" />
                </svg>
              </div>

              {(!isCollapsed || isMobileScreen) && (
                <div>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '0.4px',
                    color: '#ffffff',
                    display: 'block',
                    lineHeight: 1.1,
                    fontFamily: 'var(--font-primary)'
                  }}>
                    HUNTIQ
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#818cf8', fontWeight: 500 }}>
                    AI Client Hunting CRM
                  </span>
                </div>
              )}
            </div>

            {/* Hamburger / Collapse Button */}
            <button
              onClick={() => {
                if (isMobileScreen) {
                  setIsMobileOpen(false);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              title={isMobileScreen ? 'Close Navigation' : isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isMobileScreen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>

          {/* Dashboard Main Button */}
          <div
            onClick={() => handleItemClick('dashboard')}
            title="Dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed && !isMobileScreen ? 'center' : 'flex-start',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '9px',
              backgroundColor: activeNav === 'dashboard' ? '#4f46e5' : 'transparent',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'background-color 0.15s ease',
              boxShadow: activeNav === 'dashboard' ? '0 4px 12px rgba(79, 70, 229, 0.4)' : 'none'
            }}
          >
            <LayoutDashboard size={17} />
            {(!isCollapsed || isMobileScreen) && <span>Dashboard</span>}
          </div>

          {/* Navigation Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {navSections.map((sec) => (
              <div key={sec.label}>
                {(!isCollapsed || isMobileScreen) && (
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    color: '#64748b',
                    paddingLeft: '10px',
                    marginBottom: '4px'
                  }}>
                    {sec.label}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {sec.items.map((item) => {
                    const isActive = activeNav === item.id || (item.id === 'find-prospects' && activeNav === 'find_prospects');
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        title={item.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isCollapsed && !isMobileScreen ? 'center' : 'space-between',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#ffffff' : '#94a3b8',
                          backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.color = '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.color = '#94a3b8';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <span style={{ color: isActive ? '#818cf8' : '#64748b', display: 'flex' }}>
                            {item.icon}
                          </span>
                          {(!isCollapsed || isMobileScreen) && <span>{item.label}</span>}
                        </div>

                        {(!isCollapsed || isMobileScreen) && item.badge && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            backgroundColor: '#4338ca',
                            color: '#e0e7ff',
                            padding: '1px 6px',
                            borderRadius: '10px'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Profile Card */}
        <div style={{ marginTop: '16px', position: 'relative' }}>
          {onGoToOnboarding && (!isCollapsed || isMobileScreen) && (
            <button
              onClick={onGoToOnboarding}
              style={{
                width: '100%',
                marginBottom: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={12} />
              <span>Workspace Setup</span>
            </button>
          )}

          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed && !isMobileScreen ? 'center' : 'space-between',
              padding: '8px 10px',
              borderRadius: '10px',
              backgroundColor: '#121827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#4f46e5',
                backgroundImage: 'url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1.5px solid #818cf8',
                flexShrink: 0
              }} />
              {(!isCollapsed || isMobileScreen) && (
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>
                    Ayoola Ade
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                    Growth Plan
                  </div>
                </div>
              )}
            </div>
            {(!isCollapsed || isMobileScreen) && <ChevronDown size={14} color="#64748b" />}
          </div>
        </div>
      </aside>
    </>
  );
};
