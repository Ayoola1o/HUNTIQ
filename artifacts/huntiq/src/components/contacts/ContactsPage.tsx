import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { ContactsKpiCards } from './ContactsKpiCards';
import { ContactTable } from './ContactTable';
import { ContactDrawer } from './ContactDrawer';
import { AddContactModal } from './AddContactModal';
import { ImportContactsModal } from './ImportContactsModal';
import { OpportunityFiltersModal } from '../opportunities/OpportunityFiltersModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import type { ContactItem } from '../../types/contact';
import {
  fetchContacts,
  createContact as apiCreateContact,
  updateContact as apiUpdateContact,
  importContacts as apiImportContacts
} from '../../api';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { 
  Users, 
  Search, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  FolderOpen,
  SlidersHorizontal
} from 'lucide-react';

interface ContactsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('total');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Filters state
  const [appliedFilters, setAppliedFilters] = useState<{
    minScore: number;
    selectedIndustries: string[];
    selectedLocations: string[];
    selectedSignals: string[];
  } | null>(null);

  // Modals state
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyFilters = (filters: {
    minScore: number;
    selectedIndustries: string[];
    selectedLocations: string[];
    selectedSignals: string[];
  }) => {
    setAppliedFilters(filters);
    setIsFiltersModalOpen(false);
  };

  // Load Contacts from Live Backend API
  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const response = await fetchContacts({
        tab: activeTab !== 'all' ? activeTab : undefined,
        search: searchQuery.trim() ? searchQuery : undefined
      });

      const list = response.contacts || [];
      setContacts(list);

      if (list.length > 0 && !selectedContactId) {
        setSelectedContactId(list[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load contacts from API:', err);
      setIsError(true);
      setErrorMessage(err?.message || 'Unable to connect to live backend API');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, selectedContactId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Selected contact object
  const selectedContact = useMemo(() => {
    return contacts.find(c => c.id === selectedContactId) || contacts[0] || null;
  }, [contacts, selectedContactId]);

  // Filtered contacts based on search, KPI Filter, and applied modal filters
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (activeKpiFilter === 'high_influence' && c.influenceScore < 85) return false;
      if (activeKpiFilter === 'contacted' && !c.lastActivity.toLowerCase().includes('sent') && !c.lastActivity.toLowerCase().includes('opened')) return false;
      if (activeKpiFilter === 'replied' && !c.lastActivity.toLowerCase().includes('replied')) return false;

      // Applied Modal Filters
      if (appliedFilters) {
        if (c.influenceScore < appliedFilters.minScore) return false;
        if (
          appliedFilters.selectedIndustries.length > 0 &&
          !appliedFilters.selectedIndustries.some(ind =>
            c.companyIndustry.toLowerCase().includes(ind.toLowerCase())
          )
        ) {
          return false;
        }
        if (
          appliedFilters.selectedLocations.length > 0 &&
          !appliedFilters.selectedLocations.some(loc =>
            c.location.toLowerCase().includes(loc.toLowerCase()) ||
            c.companyLocation.toLowerCase().includes(loc.toLowerCase())
          )
        ) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.companyName.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [contacts, activeKpiFilter, searchQuery, appliedFilters]);

  // Toggle Save / Bookmark via API
  const handleToggleSave = async (contactId: string) => {
    const target = contacts.find(c => c.id === contactId);
    if (!target) return;

    const nextBookmarked = !target.isBookmarked;

    // Optimistic update
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isBookmarked: nextBookmarked } : c));
    showToast(nextBookmarked ? 'Contact saved to bookmarks' : 'Contact removed from bookmarks');

    try {
      await apiUpdateContact(contactId, { isBookmarked: nextBookmarked });
    } catch (err) {
      console.warn('Failed to update bookmark on backend:', err);
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isBookmarked: !nextBookmarked } : c));
      showToast('Failed to update bookmark on backend');
    }
  };

  // Add Contact via API
  const handleAddContact = async (contactData: Partial<ContactItem>) => {
    try {
      const created = await apiCreateContact(contactData);
      setContacts(prev => [created, ...prev]);
      setSelectedContactId(created.id);
      showToast(`Contact "${created.name}" created successfully`);
    } catch (err: any) {
      console.error('Failed to create contact via API:', err);
      showToast(err?.message || 'Failed to create contact');
    }
  };

  // Import Contacts via API
  const handleImportContacts = async (_count: number) => {
    try {
      const sampleImports: Partial<ContactItem>[] = [
        {
          name: 'Chinedu Eze',
          email: 'chinedu.eze@kuda.com',
          companyName: 'Kuda Bank',
          role: 'Chief Technology Officer',
          decisionRole: 'Decision Maker',
          influenceScore: 95,
          location: 'Lagos, Nigeria'
        },
        {
          name: 'Amina Bello',
          email: 'amina.bello@moniepoint.com',
          companyName: 'Moniepoint',
          role: 'Head of Compliance',
          decisionRole: 'Decision Maker',
          influenceScore: 91,
          location: 'Lagos, Nigeria'
        }
      ];

      const res = await apiImportContacts(sampleImports);
      if (res.contacts && res.contacts.length > 0) {
        setContacts(prev => [...res.contacts, ...prev]);
        showToast(`Imported ${res.contacts.length} verified contacts`);
      }
    } catch (err: any) {
      console.warn('Import API error:', err);
      showToast(err?.message || 'Failed to import contacts');
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f4f6fa',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Sidebar Navigation */}
      <DashboardSidebar
        activeNav="contacts"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <header 
          className="mobile-header-pad"
          style={{
            minHeight: '62px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #eaecf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '12px 24px',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dbeafe',
              flexShrink: 0
            }}>
              <Users size={16} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Decision Makers & Key Contacts
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Enriched decision makers, verified corporate emails, and influence scoring
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Sync Button */}
            <button
              onClick={loadContacts}
              disabled={isLoading}
              title="Sync live contacts from API"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Syncing...' : 'Sync API'}</span>
            </button>

            <button
              onClick={() => setIsCopilotOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                color: '#6d28d9',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={13} />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {isError && (
          <div style={{
            margin: '12px 32px 0 32px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '12px' }}>
              <AlertCircle size={15} />
              <span>{errorMessage || 'Live backend connection error. Showing cached contacts.'}</span>
            </div>
            <button
              onClick={loadContacts}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Scrollable Center View */}
        <div 
          className="mobile-bottom-pad"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* KPI Metrics Summary Row */}
          <div style={{ margin: '18px 0 14px 0' }}>
            <ContactsKpiCards
              contacts={contacts}
              activeFilter={activeKpiFilter}
              onSelectKpi={(f: string) => setActiveKpiFilter(activeKpiFilter === f ? 'total' : f)}
            />
          </div>

          {/* Action & Filter Bar matching Design */}
          <div style={{
            margin: '0 32px 14px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Left Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[
                { id: 'all', label: 'All Contacts', count: contacts.length },
                { id: 'decision_makers', label: 'Decision Makers', count: contacts.filter(c => c.decisionRole === 'Decision Maker').length },
                { id: 'champions', label: 'Champions', count: contacts.filter(c => c.decisionRole === 'Champion').length },
                { id: 'influencers', label: 'Influencers', count: contacts.filter(c => c.decisionRole === 'Influencer').length },
                { id: 'saved', label: 'Saved / Bookmarked', count: contacts.filter(c => c.isBookmarked).length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveKpiFilter('total');
                  }}
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
                    backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                    color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                    boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '10.5px',
                    backgroundColor: activeTab === tab.id ? '#eff6ff' : '#eaecf0',
                    color: activeTab === tab.id ? '#2563eb' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Search Input & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #eaecf0',
                borderRadius: '8px',
                padding: '6px 12px',
                width: '240px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <Search size={14} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search contacts, roles, emails..."
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
                onClick={() => setIsFiltersModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: appliedFilters ? '#f5f3ff' : '#ffffff',
                  border: appliedFilters ? '1px solid #c7d2fe' : '1px solid #cbd5e1',
                  color: appliedFilters ? '#4f46e5' : '#334155',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <SlidersHorizontal size={13} color={appliedFilters ? '#4f46e5' : '#64748b'} />
                <span>Filters {appliedFilters ? '(Active)' : ''}</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>Import</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
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
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
                }}
              >
                <span>+ Add Contact</span>
              </button>
            </div>
          </div>

          {/* Master-Detail Workspace: Table + Inspection Drawer */}
          <div style={{
            flex: 1,
            display: 'flex',
            padding: '0 32px 32px 32px',
            gap: '16px',
            minHeight: '400px'
          }}>
            {/* Main Contacts Table */}
            <div style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #eaecf0',
              overflow: 'hidden',
              boxShadow: '0 4px 20px -2px rgba(16, 24, 40, 0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {isLoading && contacts.length === 0 ? (
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ height: '48px', backgroundColor: '#f8fafc', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                  ))}
                </div>
              ) : filteredContacts.length === 0 ? (
                <div style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb'
                  }}>
                    <FolderOpen size={22} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {searchQuery ? 'No contacts match your search' : 'No contacts in this view'}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', maxWidth: '380px', margin: 0 }}>
                    {searchQuery ? `No contacts found for "${searchQuery}".` : 'Add or import key decision makers to begin tracking engagement.'}
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    style={{
                      marginTop: '6px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Add New Contact
                  </button>
                </div>
              ) : (
                <ContactTable
                  contacts={filteredContacts}
                  selectedContactId={selectedContactId}
                  onSelectContact={(c) => setSelectedContactId(c.id)}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  onToggleBookmark={handleToggleSave}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  onOpenFilters={() => setIsFiltersModalOpen(true)}
                />
              )}
            </div>

            {/* Right Detail Inspection Drawer */}
            {selectedContact && (
              <ContactDrawer
                contact={selectedContact}
                onClose={() => setSelectedContactId(null)}
                onViewCompany={(companyName: string) => setResearchedCompany(companyName)}
                onStartEmailOutreach={() => onNavigate('campaigns')}
                onToggleBookmark={handleToggleSave}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContact}
      />

      {/* Import Contacts Modal */}
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportContacts}
      />

      {/* Opportunity Filters Modal */}
      <OpportunityFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleApplyFilters}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={(companyName: string) => {
          setIsCopilotOpen(false);
          setResearchedCompany(companyName);
        }}
      />

      {/* Company Research Dossier Modal */}
      {researchedCompany && (
        <CompanyResearchModal
          companyName={researchedCompany}
          onClose={() => setResearchedCompany(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile One-Thumb Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
