import React, { useState } from 'react';
import type { ContactItem, DecisionRole, ContactSource } from '../../types/contact';
import { 
  Star, 
  ChevronDown, 
  Search, 
  SlidersHorizontal, 
  Building2, 
  Briefcase, 
  MapPin, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  Mail,
  Globe,
  Upload,
  Plus,
  LayoutGrid
} from 'lucide-react';

interface ContactTableProps {
  contacts: ContactItem[];
  selectedContactId: string | null;
  onSelectContact: (contact: ContactItem) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onToggleBookmark?: (contactId: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  selectedContactId,
  onSelectContact,
  activeTab,
  onSelectTab,
  onToggleBookmark,
  onOpenAddModal,
  onOpenImportModal
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['cont-1']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter] = useState('All Companies');
  const [selectedRoleFilter] = useState('All Roles');
  const [selectedLocationFilter] = useState('All Locations');

  const tabs = [
    { id: 'all', label: 'All Contacts' },
    { id: 'my-contacts', label: 'My Contacts' },
    { id: 'bookmarked', label: 'Bookmarked' },
    { id: 'recent', label: 'Recent Activity' },
  ];

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
    }
  };

  const getScoreCircle = (score: number, level: string) => {
    const isVeryHigh = score >= 90;
    const isHigh = score >= 75 && score < 90;
    const isMedium = score >= 60 && score < 75;

    const borderColor = isVeryHigh ? '#10b981' : isHigh ? '#10b981' : isMedium ? '#f59e0b' : '#94a3b8';
    const textColor = isVeryHigh ? '#059669' : isHigh ? '#059669' : isMedium ? '#d97706' : '#64748b';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 800,
          color: textColor,
          flexShrink: 0
        }}>
          {score}
        </div>
        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
          {level}
        </span>
      </div>
    );
  };

  const getRoleBadge = (role: DecisionRole) => {
    if (role === 'Decision Maker') {
      return (
        <span style={{
          fontSize: '10.5px',
          fontWeight: 700,
          backgroundColor: '#f5f3ff',
          color: '#6d28d9',
          border: '1px solid #ddd6fe',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block',
          marginTop: '2px'
        }}>
          Decision Maker
        </span>
      );
    }
    return (
      <span style={{
        fontSize: '10.5px',
        fontWeight: 700,
        backgroundColor: '#fff7ed',
        color: '#c2410c',
        border: '1px solid #fed7aa',
        padding: '2px 6px',
        borderRadius: '4px',
        display: 'inline-block',
        marginTop: '2px'
      }}>
        Influencer
      </span>
    );
  };

  const getSourceIcon = (source: ContactSource) => {
    if (source === 'linkedin') {
      return (
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          backgroundColor: '#0a66c2',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 900
        }}>
          in
        </div>
      );
    }
    if (source === 'email') {
      return (
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          backgroundColor: '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Mail size={12} color="#2563eb" />
        </div>
      );
    }
    return (
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Globe size={12} color="#64748b" />
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Filter Tabs + Header Actions */}
      <div style={{
        padding: '14px 20px 0',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                style={{
                  padding: '8px 12px 14px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#4f46e5' : '#64748b',
                  borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Header Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
          <button
            onClick={onOpenImportModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Upload size={13} />
            <span>Import</span>
          </button>

          <button
            onClick={onOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Plus size={14} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Multi-Parameter Filter Toolbar */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0 10px',
            height: '34px',
            width: '200px',
            gap: '6px'
          }}>
            <Search size={13} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '12px',
                color: '#0f172a',
                width: '100%'
              }}
            />
          </div>

          {/* All Companies Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#334155',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0 10px',
            height: '34px',
            cursor: 'pointer'
          }}>
            <Building2 size={13} color="#64748b" />
            <span>{selectedCompanyFilter}</span>
            <ChevronDown size={12} color="#94a3b8" />
          </div>

          {/* All Roles Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#334155',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0 10px',
            height: '34px',
            cursor: 'pointer'
          }}>
            <Briefcase size={13} color="#64748b" />
            <span>{selectedRoleFilter}</span>
            <ChevronDown size={12} color="#94a3b8" />
          </div>

          {/* All Locations Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#334155',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0 10px',
            height: '34px',
            cursor: 'pointer'
          }}>
            <MapPin size={13} color="#64748b" />
            <span>{selectedLocationFilter}</span>
            <ChevronDown size={12} color="#94a3b8" />
          </div>

          {/* More Filters (2) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#4f46e5',
            backgroundColor: '#f5f3ff',
            border: '1px solid #c7d2fe',
            borderRadius: '8px',
            padding: '0 10px',
            height: '34px',
            cursor: 'pointer'
          }}>
            <SlidersHorizontal size={13} />
            <span>More Filters</span>
            <span style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              2
            </span>
            <ChevronDown size={12} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Saved Views */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#334155',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0 10px',
            height: '34px',
            cursor: 'pointer'
          }}>
            <Bookmark size={13} color="#64748b" />
            <span>Saved Views</span>
            <ChevronDown size={12} color="#94a3b8" />
          </div>

          {/* Columns Setting Toggle */}
          <button style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer'
          }}>
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Table Column Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 2.2fr 1.6fr 1.8fr 1.3fr 1.4fr 1.4fr 50px 30px 30px',
        padding: '10px 18px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #eaecf0',
        fontSize: '11.5px',
        fontWeight: 700,
        color: '#64748b',
        alignItems: 'center'
      }}>
        <div>
          <input
            type="checkbox"
            checked={selectedIds.length === contacts.length && contacts.length > 0}
            onChange={handleSelectAll}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div>Contact</div>
        <div>Company</div>
        <div>Role</div>
        <div>Influence ⇅</div>
        <div>Opportunity Fit ⇅</div>
        <div>Last Activity</div>
        <div>Source</div>
        <div></div>
        <div></div>
      </div>

      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {contacts.map((cont) => {
          const isSelected = selectedContactId === cont.id;
          const isChecked = selectedIds.includes(cont.id);

          return (
            <div
              key={cont.id}
              onClick={() => onSelectContact(cont)}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 2.2fr 1.6fr 1.8fr 1.3fr 1.4fr 1.4fr 50px 30px 30px',
                padding: '12px 18px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: isSelected ? '#f5f3ff' : isChecked ? '#f8fafc' : '#ffffff',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.12s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = isChecked ? '#f8fafc' : '#ffffff';
              }}
            >
              {/* Checkbox */}
              <div onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleToggleSelect(cont.id, e as any)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* Contact Avatar + Name + Email + Verified dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={cont.avatarUrl}
                    alt={cont.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    border: '1.5px solid #ffffff'
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {cont.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{cont.email}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                  {cont.companyName}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {cont.companyLocation}
                </div>
              </div>

              {/* Role + Decision Badge */}
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                  {cont.role}
                </div>
                {getRoleBadge(cont.decisionRole)}
              </div>

              {/* Influence Score */}
              <div>
                {getScoreCircle(cont.influenceScore, cont.influenceLevel)}
              </div>

              {/* Opportunity Fit */}
              <div>
                {getScoreCircle(cont.opportunityFitScore, cont.opportunityFitLevel)}
              </div>

              {/* Last Activity */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  {cont.lastActivity}
                </div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                  {cont.lastActivityTime}
                </div>
              </div>

              {/* Source */}
              <div>
                {getSourceIcon(cont.source)}
              </div>

              {/* Bookmark Star */}
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onToggleBookmark && onToggleBookmark(cont.id)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <Star
                    size={14}
                    fill={cont.isBookmarked ? '#4f46e5' : 'none'}
                    color={cont.isBookmarked ? '#4f46e5' : '#cbd5e1'}
                  />
                </button>
              </div>

              {/* Menu */}
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <MoreVertical size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <span>Showing 1 to 8 of 8,642 contacts</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <ChevronLeft size={14} />
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={page}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: page === 1 ? '1px solid #6366f1' : '1px solid #e2e8f0',
                  backgroundColor: page === 1 ? '#ede9fe' : '#ffffff',
                  color: page === 1 ? '#6d28d9' : '#475569',
                  fontSize: '12px',
                  fontWeight: page === 1 ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {page}
              </button>
            ))}

            <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>

            <button
              style={{
                width: '36px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              216
            </button>

            <button
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '11.5px',
            color: '#334155',
            marginLeft: '8px'
          }}>
            <span>20 per page</span>
            <ChevronDown size={11} />
          </div>
        </div>
      </div>
    </div>
  );
};
