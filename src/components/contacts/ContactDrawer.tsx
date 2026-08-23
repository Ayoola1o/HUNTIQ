import React, { useState } from 'react';
import type { ContactItem } from '../../types/contact';
import { 
  X, 
  Star, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Sparkles, 
  Plus, 
  ArrowRight
} from 'lucide-react';

interface ContactDrawerProps {
  contact: ContactItem | null;
  onClose: () => void;
  onViewCompany: (companyName: string) => void;
  onStartEmailOutreach: (contact: ContactItem) => void;
  onToggleBookmark: (contactId: string) => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  contact,
  onClose,
  onViewCompany,
  onStartEmailOutreach,
  onToggleBookmark
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'details' | 'notes' | 'files'>('overview');

  if (!contact) return null;

  const drawerTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'details', label: 'Details' },
    { id: 'notes', label: 'Notes' },
    { id: 'files', label: 'Files' },
  ];

  return (
    <div style={{
      width: '380px',
      minWidth: '380px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 12px rgba(16, 24, 40, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Drawer Top Header: Star + Close */}
      <div style={{
        padding: '14px 20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px'
      }}>
        <button
          onClick={() => onToggleBookmark(contact.id)}
          style={{ background: 'none', border: 'none', color: contact.isBookmarked ? '#4f46e5' : '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <Star size={17} fill={contact.isBookmarked ? '#4f46e5' : 'none'} />
        </button>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Profile Overview Banner */}
      <div style={{ padding: '0 20px 14px', borderBottom: '1px solid #eaecf0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={contact.avatarUrl}
              alt={contact.name}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #ffffff'
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                {contact.name}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {contact.influenceScore} Very High Influence
              </span>
            </div>

            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
              {contact.role}
            </div>

            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              {contact.companyName}
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {contact.companyLocation}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button
            onClick={() => onStartEmailOutreach(contact)}
            style={{
              flex: 1,
              height: '32px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Mail size={14} />
          </button>

          <button
            style={{
              flex: 1,
              height: '32px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a66c2',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            in
          </button>

          <button
            style={{
              flex: 1,
              height: '32px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Phone size={14} />
          </button>

          <button
            style={{
              flex: 1,
              height: '32px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Drawer Tab Headers */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #eaecf0',
        padding: '0 16px'
      }}>
        {drawerTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '10px 4px',
                border: 'none',
                background: 'none',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#4f46e5' : '#64748b',
                borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Drawer Scrollable Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {activeTab === 'overview' && (
          <>
            {/* About Section */}
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                About
              </div>
              <p style={{
                fontSize: '12px',
                color: '#475569',
                lineHeight: 1.45,
                margin: '0 0 10px 0'
              }}>
                {contact.about}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Email</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{contact.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Phone</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{contact.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Location</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{contact.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Local Time</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{contact.localTime}</span>
                </div>
              </div>
            </div>

            {/* Company Card */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Company</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {contact.companyName}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {contact.companyIndustry} • {contact.companyEmployees}
                </div>
              </div>

              <button
                onClick={() => onViewCompany(contact.companyName)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                View Company
              </button>
            </div>

            {/* AI Insights */}
            <div style={{
              backgroundColor: '#faf5ff',
              border: '1px solid #f3e8ff',
              borderRadius: '10px',
              padding: '12px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Sparkles size={14} color="#7c3aed" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#6d28d9' }}>AI Insights</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#581c87', lineHeight: 1.4 }}>
                {contact.aiInsights.map((insight, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                    <span>✦</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {contact.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
                <button
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '6px',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Opportunities */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Opportunities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {contact.opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        {opp.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {opp.value}
                      </div>
                    </div>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      border: '2px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#059669'
                    }}>
                      {opp.score}
                    </div>
                  </div>
                ))}

                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                    marginTop: '4px'
                  }}
                >
                  <span>View all opportunities</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Recent Activity Timeline</div>
            <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Email opened</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Today at 10:42 AM</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Email sent: Introduction to Peak Consulting</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Yesterday at 3:18 PM</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Added to HR Consulting Campaign</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>May 14, 2025</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Contact Metadata</div>
            <div style={{ color: '#475569' }}>Source: LinkedIn Discovery</div>
            <div style={{ color: '#475569' }}>Enriched on: May 12, 2025</div>
            <div style={{ color: '#475569' }}>Verification status: Verified via Work Domain</div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Internal Team Notes</div>
            <textarea
              rows={4}
              placeholder="Add private notes about this contact..."
              style={{
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {activeTab === 'files' && (
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            No attached files or contract briefs.
          </div>
        )}
      </div>
    </div>
  );
};
