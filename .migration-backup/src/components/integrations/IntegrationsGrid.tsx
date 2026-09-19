import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Settings, 
  Plus, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import type { IntegrationItem, IntegrationCategory, IntegrationStatus } from '../../types/integrations';

interface IntegrationsGridProps {
  integrations: IntegrationItem[];
  onConnect: (item: IntegrationItem) => void;
  onManage: (item: IntegrationItem) => void;
  onSyncNow: (itemId: string) => void;
}

export const IntegrationsGrid: React.FC<IntegrationsGridProps> = ({
  integrations,
  onConnect,
  onManage,
  onSyncNow
}) => {
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIntegrations = integrations.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const connectedList = filteredIntegrations.filter(i => i.status !== 'available');
  const availableList = filteredIntegrations.filter(i => i.status === 'available');

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
      case 'synced':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <CheckCircle2 size={11} />
            <span>Connected</span>
          </span>
        );
      case 'syncing':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <RefreshCw size={11} className="animate-spin" />
            <span>Syncing</span>
          </span>
        );
      case 'reauth_required':
      case 'error':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <AlertTriangle size={11} />
            <span>Action Required</span>
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
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <span>Available</span>
          </span>
        );
    }
  };

  return (
    <div style={{
      margin: '0 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Apps' },
            { id: 'crm', label: 'CRM & Deals' },
            { id: 'communication', label: 'Communication' },
            { id: 'calendar', label: 'Calendar' },
            { id: 'data', label: 'Data & CSV' },
            { id: 'automation', label: 'Automations & Webhooks' },
            { id: 'enrichment', label: 'Enrichment' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeCategory === tab.id ? '#ffffff' : 'transparent',
                color: activeCategory === tab.id ? '#4f46e5' : '#64748b',
                boxShadow: activeCategory === tab.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ffffff',
          border: '1px solid #eaecf0',
          borderRadius: '8px',
          padding: '6px 12px',
          width: '260px'
        }}>
          <Search size={14} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search integrations..."
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
      </div>

      {/* SECTION 1: Connected Integrations */}
      {connectedList.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Active Connected Integrations ({connectedList.length})
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Data syncing actively with your HUNTIQ workspace
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px'
          }}>
            {connectedList.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: item.status === 'reauth_required' ? '1.5px solid #fca5a5' : '1px solid #eaecf0',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(16, 24, 40, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: item.bgColor,
                        color: item.brandColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 900
                      }}>
                        {item.name[0]}
                      </div>

                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'capitalize' }}>
                          {item.category}
                        </div>
                      </div>
                    </div>

                    {getStatusBadge(item.status)}
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    {item.description}
                  </p>

                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#64748b'
                  }}>
                    {item.connectedAccount && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Account:</span>
                        <strong style={{ color: '#0f172a' }}>{item.connectedAccount}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Last sync:</span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{item.lastSync || 'Never'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <button
                    onClick={() => onSyncNow(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={11} />
                    <span>Sync now</span>
                  </button>

                  <button
                    onClick={() => onManage(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#f5f3ff',
                      border: '1px solid #ddd6fe',
                      color: '#6d28d9',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Settings size={12} />
                    <span>Manage</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Available Integrations Catalog */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Available Integrations ({availableList.length})
          </h3>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Click Connect to link accounts and configure data pipelines
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px'
        }}>
          {availableList.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #eaecf0',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(16, 24, 40, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: item.bgColor,
                    color: item.brandColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 900
                  }}>
                    {item.name[0]}
                  </div>

                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'capitalize' }}>
                      {item.category}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <button
                  onClick={() => onConnect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                  }}
                >
                  <Plus size={12} />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
