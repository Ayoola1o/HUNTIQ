import React from 'react';
import {
  LayoutDashboard,
  Target,
  Zap,
  Kanban,
  Menu
} from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, navigateTo, isMobileSidebarOpen, toggleMobileSidebar } = useHuntiq();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: currentView === 'dashboard' && !isMobileSidebarOpen,
      onClick: () => navigateTo('dashboard')
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Target,
      isActive: currentView === 'opportunities' && !isMobileSidebarOpen,
      onClick: () => navigateTo('opportunities')
    },
    {
      id: 'signals',
      label: 'Signals',
      icon: Zap,
      isActive: currentView === 'signals' && !isMobileSidebarOpen,
      onClick: () => navigateTo('signals')
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: Kanban,
      isActive: currentView === 'pipeline' && !isMobileSidebarOpen,
      onClick: () => navigateTo('pipeline')
    },
    {
      id: 'menu',
      label: 'More',
      icon: Menu,
      isActive: isMobileSidebarOpen,
      onClick: () => toggleMobileSidebar()
    }
  ];

  return (
    <nav className="mobile-bottom-nav-container" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 4px',
              color: item.isActive ? '#818cf8' : '#94a3b8',
              transition: 'all 0.18s ease',
              position: 'relative'
            }}
          >
            {item.isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  width: '16px',
                  height: '3px',
                  borderRadius: '3px',
                  background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                  boxShadow: '0 0 8px rgba(129, 140, 248, 0.8)'
                }}
              />
            )}
            <Icon
              size={19}
              strokeWidth={item.isActive ? 2.3 : 1.8}
              style={{
                marginBottom: '3px',
                transform: item.isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.15s ease'
              }}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: item.isActive ? 700 : 500,
                letterSpacing: '-0.01em',
                lineHeight: 1
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
