import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Sparkles, 
  PauseCircle, 
  PlayCircle, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Plus 
} from 'lucide-react';
import type { CampaignItem, CampaignStatus } from '../../types/campaign';

interface CampaignsTableProps {
  campaigns: CampaignItem[];
  selectedCampaignId: string | null;
  onSelectCampaign: (campaign: CampaignItem) => void;
  onToggleStatus: (campaignId: string) => void;
  onCreateCampaign: () => void;
}

export const CampaignsTable: React.FC<CampaignsTableProps> = ({
  campaigns,
  selectedCampaignId,
  onSelectCampaign,
  onToggleStatus,
  onCreateCampaign
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'paused' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCampaigns = campaigns.filter((camp) => {
    if (activeTab !== 'all' && camp.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        camp.name.toLowerCase().includes(q) ||
        camp.description.toLowerCase().includes(q) ||
        camp.targetAudienceName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Active</span>
          </span>
        );
      case 'paused':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <span>Paused</span>
          </span>
        );
      case 'completed':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <CheckCircle2 size={11} />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f8fafc',
            color: '#64748b',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <span>Draft</span>
          </span>
        );
    }
  };

  const getChannelBadge = (channel: CampaignItem['channel']) => {
    switch (channel) {
      case 'email':
        return { label: 'Email Sequence', icon: <Mail size={11} />, color: '#2563eb', bg: '#eff6ff' };
      case 'linkedin':
        return { label: 'LinkedIn InMail', icon: <MessageSquare size={11} />, color: '#0284c7', bg: '#f0f9ff' };
      default:
        return { label: 'Multi-Channel AI', icon: <Sparkles size={11} />, color: '#7c3aed', bg: '#f5f3ff' };
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      margin: '0 32px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Table Controls Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Campaigns', count: campaigns.length },
            { id: 'active', label: 'Active', count: campaigns.filter(c => c.status === 'active').length },
            { id: 'draft', label: 'Draft', count: campaigns.filter(c => c.status === 'draft').length },
            { id: 'paused', label: 'Paused', count: campaigns.filter(c => c.status === 'paused').length },
            { id: 'completed', label: 'Completed', count: campaigns.filter(c => c.status === 'completed').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#f5f3ff' : 'transparent',
                color: activeTab === tab.id ? '#6d28d9' : '#64748b'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '10px',
                backgroundColor: activeTab === tab.id ? '#ddd6fe' : '#f1f5f9',
                color: activeTab === tab.id ? '#5b21b6' : '#64748b',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Search & Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '5px 12px',
            width: '260px'
          }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: '#0f172a',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            onClick={onCreateCampaign}
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
            <Plus size={13} />
            <span>+ Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 20px', fontWeight: 700 }}>Campaign & Channel</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Target Audience</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Progress / Delivered</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Open & Reply Rates</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Opportunities</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.map((camp) => {
              const isSelected = selectedCampaignId === camp.id;
              const ch = getChannelBadge(camp.channel);
              const progressPct = Math.round((camp.sentCount / Math.max(1, camp.audienceCount)) * 100);

              return (
                <tr
                  key={camp.id}
                  onClick={() => onSelectCampaign(camp)}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  {/* Name & Channel */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                      {camp.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        backgroundColor: ch.bg,
                        color: ch.color,
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {ch.icon}
                        <span>{ch.label}</span>
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>• {camp.sequence.length} Steps</span>
                    </div>
                  </td>

                  {/* Target Audience */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {camp.targetAudienceName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {camp.audienceCount} targeted contacts
                    </div>
                  </td>

                  {/* Progress / Delivered */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <span>{camp.sentCount} / {camp.audienceCount} sent</span>
                      <strong>{progressPct}%</strong>
                    </div>
                    <div style={{ width: '120px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: '#4f46e5', borderRadius: '4px' }} />
                    </div>
                  </td>

                  {/* Open & Reply Rates */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Opens</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#059669' }}>
                          {camp.openRate}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Replies</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#7c3aed' }}>
                          {camp.replyRate}%
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Opportunities */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                      {camp.opportunitiesCount} Opps
                    </div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                      ${camp.expectedValue.toLocaleString()} value
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(camp.status)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(camp.id);
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {camp.status === 'active' ? <PauseCircle size={12} /> : <PlayCircle size={12} />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCampaign(camp);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#f5f3ff',
                          border: '1px solid #ddd6fe',
                          color: '#6d28d9',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <span>Sequence Details</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
