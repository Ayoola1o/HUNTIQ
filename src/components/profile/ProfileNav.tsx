import React from 'react';
import { 
  Building, 
  User, 
  Sliders, 
  Bell, 
  ShieldCheck, 
  Laptop, 
  Key, 
  Mail 
} from 'lucide-react';

export type ProfileNavSection = 
  | 'workspace' 
  | 'profile' 
  | 'preferences' 
  | 'notifications' 
  | 'security' 
  | 'sessions' 
  | 'api-keys' 
  | 'email-settings';

interface ProfileNavProps {
  activeSection: ProfileNavSection;
  onSelectSection: (section: ProfileNavSection) => void;
  onNavigateToSettings?: () => void;
}

export const ProfileNav: React.FC<ProfileNavProps> = ({
  activeSection,
  onSelectSection,
  onNavigateToSettings
}) => {
  const navItems: { id: ProfileNavSection; label: string; icon: React.ReactNode; isWorkspace?: boolean }[] = [
    { id: 'workspace', label: 'Workspace', icon: <Building size={15} />, isWorkspace: true },
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'preferences', label: 'Preferences', icon: <Sliders size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={15} /> },
    { id: 'sessions', label: 'Sessions', icon: <Laptop size={15} /> },
    { id: 'api-keys', label: 'API Keys', icon: <Key size={15} /> },
    { id: 'email-settings', label: 'Email Settings', icon: <Mail size={15} /> }
  ];

  return (
    <nav style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      width: '190px',
      minWidth: '190px'
    }}>
      {navItems.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.isWorkspace && onNavigateToSettings) {
                onNavigateToSettings();
              } else {
                onSelectSection(item.id);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
              backgroundColor: isActive ? '#f5f3ff' : 'transparent',
              color: isActive ? '#4f46e5' : '#475569',
              fontSize: '12.5px',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ color: isActive ? '#4f46e5' : '#64748b' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
