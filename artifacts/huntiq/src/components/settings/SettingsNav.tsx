import React from 'react';
import { 
  Building2, 
  User, 
  Users2, 
  Kanban, 
  Target, 
  Sliders, 
  Sparkles, 
  Bell, 
  ShieldCheck, 
  CreditCard 
} from 'lucide-react';
import type { SettingsSection } from '../../types/settings';

interface SettingsNavProps {
  activeSection: SettingsSection;
  onSelectSection: (section: SettingsSection) => void;
}

export const SettingsNav: React.FC<SettingsNavProps> = ({
  activeSection,
  onSelectSection
}) => {
  const groups = [
    {
      title: 'GENERAL',
      items: [
        { id: 'workspace' as SettingsSection, label: 'Workspace Info', icon: <Building2 size={15} /> },
        { id: 'profile' as SettingsSection, label: 'My Profile', icon: <User size={15} /> },
        { id: 'team' as SettingsSection, label: 'Team & Members', icon: <Users2 size={15} /> },
      ]
    },
    {
      title: 'PROSPECTING & CRM',
      items: [
        { id: 'pipeline' as SettingsSection, label: 'Pipeline Stages', icon: <Kanban size={15} /> },
        { id: 'icp' as SettingsSection, label: 'ICP Definition', icon: <Target size={15} /> },
        { id: 'scoring' as SettingsSection, label: 'Scoring Rules', icon: <Sliders size={15} /> },
      ]
    },
    {
      title: 'INTELLIGENCE & AI',
      items: [
        { id: 'ai' as SettingsSection, label: 'AI Configuration', icon: <Sparkles size={15} /> },
        { id: 'notifications' as SettingsSection, label: 'Alerts & Email', icon: <Bell size={15} /> },
      ]
    },
    {
      title: 'SECURITY & BILLING',
      items: [
        { id: 'security' as SettingsSection, label: 'Security & API Keys', icon: <ShieldCheck size={15} /> },
        { id: 'billing' as SettingsSection, label: 'Plan & Billing', icon: <CreditCard size={15} /> },
      ]
    }
  ];

  return (
    <div style={{
      width: '240px',
      minWidth: '240px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #eaecf0',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      overflowY: 'auto'
    }}>
      {groups.map((grp, idx) => (
        <div key={idx}>
          <div style={{
            fontSize: '10px',
            fontWeight: 800,
            color: '#94a3b8',
            letterSpacing: '0.6px',
            paddingLeft: '10px',
            marginBottom: '6px'
          }}>
            {grp.title}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {grp.items.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#334155',
                    textAlign: 'left',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ color: isActive ? '#2563eb' : '#64748b' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
