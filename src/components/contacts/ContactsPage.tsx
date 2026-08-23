import React, { useState } from 'react';
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
  Users, 
  Search, 
  Sparkles, 
  Bell, 
  ChevronDown
} from 'lucide-react';

interface ContactsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('total');
  const [selectedContactId, setSelectedContactId] = useState<string | null>('cont-1');

  // Modals state
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Mock dataset matching contacts page.png
  const [contacts, setContacts] = useState<ContactItem[]>([
    {
      id: 'cont-1',
      name: 'Jane Smith',
      email: 'jane.smith@acmetech.com',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Acme Technologies',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'Technology',
      companyEmployees: '250-500 employees',
      role: 'Head of People',
      decisionRole: 'Decision Maker',
      influenceScore: 94,
      influenceLevel: 'Very High',
      opportunityFitScore: 94,
      opportunityFitLevel: 'Excellent',
      lastActivity: 'Email opened',
      lastActivityTime: '2h ago',
      source: 'linkedin',
      isBookmarked: false,
      phone: '+234 801 234 5678',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'Head of People leading HR strategy, talent management and organizational development.',
      aiInsights: [
        'Strong decision maker for HR & People initiatives',
        'High engagement with HR content',
        'Recently expanded team by 34% in 90 days',
        'Opened new office in Victoria Island, Lagos'
      ],
      tags: ['Decision Maker', 'HR', 'High Influence', 'Hiring'],
      opportunities: [
        {
          id: 'opp-1',
          title: 'HR Consulting & Training',
          value: '$25,000',
          score: 94,
          scoreLevel: 'High'
        },
        {
          id: 'opp-2',
          title: 'Leadership Development',
          value: '$15,000',
          score: 82,
          scoreLevel: 'High'
        }
      ]
    },
    {
      id: 'cont-2',
      name: 'Michael Okoro',
      email: 'michael.okoro@finserve.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'FinServe Ltd',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'Financial Services',
      companyEmployees: '200-500 employees',
      role: 'HR Director',
      decisionRole: 'Decision Maker',
      influenceScore: 88,
      influenceLevel: 'High',
      opportunityFitScore: 91,
      opportunityFitLevel: 'Excellent',
      lastActivity: 'Replied to email',
      lastActivityTime: '5h ago',
      source: 'email',
      isBookmarked: false,
      phone: '+234 802 345 6789',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'HR Director managing regional workforce across West Africa for high-growth fintech operations.',
      aiInsights: [
        'Key executive budget holder for compensation & organizational structure',
        'Actively scaling engineering and compliance teams post Series B'
      ],
      tags: ['Decision Maker', 'HR', 'Fintech', 'Executive'],
      opportunities: [
        {
          id: 'opp-3',
          title: 'Fintech Leadership Scaling Advisory',
          value: '$30,000',
          score: 91,
          scoreLevel: 'High'
        }
      ]
    },
    {
      id: 'cont-3',
      name: 'David Williams',
      email: 'david.williams@deltasys.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Delta Systems',
      companyLocation: 'Abuja, Nigeria',
      companyIndustry: 'Software',
      companyEmployees: '100-250 employees',
      role: 'Chief Operating Officer',
      decisionRole: 'Decision Maker',
      influenceScore: 87,
      influenceLevel: 'High',
      opportunityFitScore: 86,
      opportunityFitLevel: 'Very Good',
      lastActivity: 'Visited website',
      lastActivityTime: '1d ago',
      source: 'globe',
      isBookmarked: false,
      phone: '+234 803 456 7890',
      location: 'Abuja, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'COO overseeing enterprise digital transformation and internal engineering operations.',
      aiInsights: [
        'Primary sign-off on enterprise software and agile workflow consulting'
      ],
      tags: ['Decision Maker', 'COO', 'Operations'],
      opportunities: [
        {
          id: 'opp-4',
          title: 'Operational Workflow Redesign',
          value: '$18,000',
          score: 86,
          scoreLevel: 'High'
        }
      ]
    },
    {
      id: 'cont-4',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@vertex.com',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Vertex Solutions',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'IT Services',
      companyEmployees: '150-300 employees',
      role: 'Talent Acquisition Lead',
      decisionRole: 'Influencer',
      influenceScore: 74,
      influenceLevel: 'High',
      opportunityFitScore: 79,
      opportunityFitLevel: 'Good',
      lastActivity: 'Added to campaign',
      lastActivityTime: '1d ago',
      source: 'linkedin',
      isBookmarked: false,
      phone: '+234 804 567 8901',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'Talent Acquisition Lead heading technical recruiting for cybersecurity and cloud engineering.',
      aiInsights: [
        'Strong champion for structured candidate vetting frameworks'
      ],
      tags: ['Influencer', 'Recruiting', 'Talent'],
      opportunities: []
    },
    {
      id: 'cont-5',
      name: 'John Adewale',
      email: 'john.adewale@nimbus.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Nimbus Analytics',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'Data & Analytics',
      companyEmployees: '100-200 employees',
      role: 'CEO',
      decisionRole: 'Decision Maker',
      influenceScore: 79,
      influenceLevel: 'High',
      opportunityFitScore: 75,
      opportunityFitLevel: 'Good',
      lastActivity: 'Email sent',
      lastActivityTime: '2d ago',
      source: 'email',
      isBookmarked: false,
      phone: '+234 805 678 9012',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'CEO & Founder steering multi-country analytics expansion across West Africa.',
      aiInsights: [
        'Strategic visionary seeking executive alignment during regional scale'
      ],
      tags: ['Decision Maker', 'CEO', 'Founder'],
      opportunities: []
    },
    {
      id: 'cont-6',
      name: 'Fatima Bello',
      email: 'fatima.bello@zentech.com',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'ZenTech Group',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'Telecommunications',
      companyEmployees: '50-100 employees',
      role: 'Operations Director',
      decisionRole: 'Influencer',
      influenceScore: 68,
      influenceLevel: 'Medium',
      opportunityFitScore: 70,
      opportunityFitLevel: 'Good',
      lastActivity: 'No activity',
      lastActivityTime: '3d ago',
      source: 'globe',
      isBookmarked: false,
      phone: '+234 806 789 0123',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'Director of Business Operations managing internal cross-functional systems.',
      aiInsights: [
        'Coordinates departmental procurement and training approvals'
      ],
      tags: ['Influencer', 'Operations'],
      opportunities: []
    },
    {
      id: 'cont-7',
      name: 'James Chen',
      email: 'james.chen@globex.com',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Globex Corp',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'Technology',
      companyEmployees: '500-1000 employees',
      role: 'Chief Technology Officer',
      decisionRole: 'Decision Maker',
      influenceScore: 92,
      influenceLevel: 'Very High',
      opportunityFitScore: 84,
      opportunityFitLevel: 'Very Good',
      lastActivity: 'Replied to email',
      lastActivityTime: '3d ago',
      source: 'linkedin',
      isBookmarked: true,
      phone: '+234 807 890 1234',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'CTO directing infrastructure modernization, AI pipelines, and platform architecture.',
      aiInsights: [
        'High budget authority for engineering talent development and technical consulting'
      ],
      tags: ['Decision Maker', 'CTO', 'High Influence'],
      opportunities: [
        {
          id: 'opp-5',
          title: 'Technical Leadership Coaching',
          value: '$22,000',
          score: 84,
          scoreLevel: 'High'
        }
      ]
    },
    {
      id: 'cont-8',
      name: 'Blessing Udo',
      email: 'blessing.udo@infratech.com',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Infratech Ltd',
      companyLocation: 'Abuja, Nigeria',
      companyIndustry: 'Manufacturing',
      companyEmployees: '500-1000 employees',
      role: 'HR Manager',
      decisionRole: 'Influencer',
      influenceScore: 61,
      influenceLevel: 'Medium',
      opportunityFitScore: 65,
      opportunityFitLevel: 'Fair',
      lastActivity: 'Email sent',
      lastActivityTime: '4d ago',
      source: 'email',
      isBookmarked: false,
      phone: '+234 808 901 2345',
      location: 'Abuja, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'HR Manager coordinating manufacturing plant staff onboarding and compliance.',
      aiInsights: [
        'Evaluates workforce training modules before escalation to GM'
      ],
      tags: ['Influencer', 'HR', 'Manufacturing'],
      opportunities: []
    }
  ]);

  const selectedCont = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  const handleToggleBookmark = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, isBookmarked: !c.isBookmarked } : c
      )
    );
  };

  const handleAddContact = (newContact: Partial<ContactItem>) => {
    const fullContact: ContactItem = {
      id: `cont-${Date.now()}`,
      name: newContact.name || 'New Contact',
      email: newContact.email || '',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: newContact.companyName || 'Acme Technologies',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'Technology',
      companyEmployees: '250-500 employees',
      role: newContact.role || 'Leader',
      decisionRole: newContact.decisionRole || 'Decision Maker',
      influenceScore: 85,
      influenceLevel: 'High',
      opportunityFitScore: 88,
      opportunityFitLevel: 'Very Good',
      lastActivity: 'Added manually',
      lastActivityTime: 'Just now',
      source: 'manual',
      isBookmarked: false,
      phone: newContact.phone || '+234 800 000 0000',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'Newly added decision-maker prospect.',
      aiInsights: ['Recently added to workspace database'],
      tags: ['New', 'Prospect'],
      opportunities: []
    };

    setContacts((prev) => [fullContact, ...prev]);
    setSelectedContactId(fullContact.id);
  };

  const filteredContacts = contacts.filter((c) => {
    if (activeTab === 'bookmarked') return c.isBookmarked;
    if (activeTab === 'recent') return c.lastActivityTime.includes('h ago') || c.lastActivityTime.includes('1d ago');
    return true;
  });

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f4f6fa',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Left Global Navigation Sidebar */}
      <DashboardSidebar
        activeNav="contacts"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Contacts Canvas */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <header style={{
          padding: '16px 32px 14px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Title & Users Icon */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Contacts
              </h1>
              <div style={{ color: '#6366f1', display: 'flex', alignItems: 'center' }}>
                <Users size={18} />
              </div>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Discover, manage and engage the right people at target accounts.
            </p>
          </div>

          {/* Search, Copilot CTA, Date & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0 12px',
              height: '38px',
              width: '320px',
              gap: '8px'
            }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search contacts, companies, roles, emails..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  width: '100%'
                }}
              />
              <span style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#94a3b8',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '1px 4px'
              }}>
                ⌘ K
              </span>
            </div>

            {/* Ask AI Copilot Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                height: '38px',
                padding: '0 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Sparkles size={14} color="#ffffff" />
              <span>Ask AI Copilot</span>
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <Bell size={16} />
              </button>
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                borderRadius: '10px',
                padding: '1px 5px'
              }}>
                12
              </span>
            </div>

            {/* User Profile Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 4px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              cursor: 'pointer'
            }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Ayoola Ade"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  Ayoola Ade
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  Growth Plan
                </div>
              </div>
              <ChevronDown size={13} color="#64748b" />
            </div>
          </div>
        </header>

        {/* Scrollable Body Canvas */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '20px 0 36px'
        }}>
          {/* 6 Top Summary KPI Cards */}
          <ContactsKpiCards
            activeFilter={activeKpiFilter}
            onSelectKpi={(f) => setActiveKpiFilter(f)}
          />

          {/* Middle Table & Detail Preview Drawer */}
          <div style={{
            display: 'flex',
            gap: '18px',
            padding: '0 32px',
            alignItems: 'flex-start'
          }}>
            {/* Main Contact Table */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <ContactTable
                contacts={filteredContacts}
                selectedContactId={selectedContactId}
                onSelectContact={(cont) => setSelectedContactId(cont.id)}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onToggleBookmark={handleToggleBookmark}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenImportModal={() => setIsImportModalOpen(true)}
              />
            </div>

            {/* Right Contact Intelligence Drawer */}
            {selectedCont && (
              <ContactDrawer
                contact={selectedCont}
                onClose={() => setSelectedContactId(null)}
                onViewCompany={(name) => setResearchedCompany(name)}
                onStartEmailOutreach={(_c) => onNavigate('outreach')}
                onToggleBookmark={handleToggleBookmark}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContact}
      />

      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(_count) => {}}
      />

      <OpportunityFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={() => {}}
      />

      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={(comp) => setResearchedCompany(comp)}
      />

      <CompanyResearchModal
        companyName={researchedCompany}
        onClose={() => setResearchedCompany(null)}
      />
    </div>
  );
};
