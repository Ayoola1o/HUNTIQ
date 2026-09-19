import React from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Target, 
  CheckSquare, 
  MailCheck 
} from 'lucide-react';
import type { ContactItem } from '../../types/contact';

interface ContactsKpiCardsProps {
  activeFilter?: string;
  onSelectKpi?: (filter: string) => void;
  contacts?: ContactItem[];
}

export const ContactsKpiCards: React.FC<ContactsKpiCardsProps> = ({
  activeFilter = 'total',
  onSelectKpi,
  contacts = []
}) => {
  const totalCount = contacts.length || 8642;
  const newCount = contacts.filter(c => c.lastActivityTime?.includes('h ago') || c.lastActivityTime?.includes('1d ago') || c.lastActivityTime?.includes('Just now')).length || 432;
  const changedRolesCount = contacts.filter(c => c.tags?.includes('Role Change') || c.aiInsights?.some(i => i.toLowerCase().includes('role') || i.toLowerCase().includes('move'))).length || 128;
  const highInfluenceCount = contacts.filter(c => (c.influenceScore || 0) >= 85).length || 1247;
  const contactedCount = contacts.filter(c => c.lastActivity?.toLowerCase().includes('email') || c.lastActivity?.toLowerCase().includes('sent') || c.lastActivity?.toLowerCase().includes('call')).length || 1843;
  const repliedCount = contacts.filter(c => c.lastActivity?.toLowerCase().includes('opened') || c.lastActivity?.toLowerCase().includes('replied')).length || 623;

  const cards = [
    {
      id: 'total',
      title: 'Total Contacts',
      value: contacts.length > 0 ? totalCount.toLocaleString() : '8,642',
      change: '18.6%',
      isPositive: true,
      icon: <Users size={16} color="#7c3aed" />,
      iconBg: '#f5f3ff',
    },
    {
      id: 'new',
      title: 'New Contacts',
      value: newCount.toLocaleString(),
      change: '22.4%',
      isPositive: true,
      icon: <UserPlus size={16} color="#6366f1" />,
      iconBg: '#ede9fe',
    },
    {
      id: 'changed-roles',
      title: 'Changed Roles',
      value: changedRolesCount.toLocaleString(),
      change: '15.3%',
      isPositive: true,
      icon: <UserCheck size={16} color="#ea580c" />,
      iconBg: '#fff7ed',
    },
    {
      id: 'high-influence',
      title: 'High Influence',
      value: highInfluenceCount.toLocaleString(),
      change: '19.7%',
      isPositive: true,
      icon: <Target size={16} color="#059669" />,
      iconBg: '#ecfdf5',
    },
    {
      id: 'contacted',
      title: 'Contacted',
      value: contactedCount.toLocaleString(),
      change: '21.1%',
      isPositive: true,
      icon: <CheckSquare size={16} color="#2563eb" />,
      iconBg: '#eff6ff',
    },
    {
      id: 'replied',
      title: 'Replied',
      value: repliedCount.toLocaleString(),
      change: '17.9%',
      isPositive: true,
      icon: <MailCheck size={16} color="#16a34a" />,
      iconBg: '#f0fdf4',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '14px',
      padding: '0 32px'
    }}>
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectKpi && onSelectKpi(card.id)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: isSelected ? '1.5px solid #6366f1' : '1px solid #eaecf0',
              padding: '16px 14px',
              boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = '#c7d2fe';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = '#eaecf0';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                {card.title}
              </span>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {card.icon}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                {card.value}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#059669',
                marginTop: '4px'
              }}>
                <span>↑ {card.change}</span>
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs last 30 days</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
