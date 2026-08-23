import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Eye
} from 'lucide-react';
import type { SavedSearchItem, SavedSearchType } from '../../types/savedSearches';

interface CreateSavedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSearch: (newSearch: SavedSearchItem) => void;
}

export const CreateSavedSearchModal: React.FC<CreateSavedSearchModalProps> = ({
  isOpen,
  onClose,
  onCreateSearch
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchType] = useState<SavedSearchType>('ai_search');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [companySize, setCompanySize] = useState('50 – 500');
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [signals] = useState<string[]>(['Hiring Surge', 'Regional Expansion']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const item: SavedSearchItem = {
      id: `ss-${Date.now()}`,
      name,
      description: description || `Targeting ${industry} companies in ${location} with ${companySize} employees.`,
      searchType,
      status: 'active',
      monitoringEnabled,
      alertFrequency: 'immediately',
      createdAt: 'Just now',
      lastRunAt: 'Just now',
      lastUpdated: 'Just now',
      filters: {
        industries: [industry],
        locations: [location],
        companySizes: [companySize]
      },
      signalsToWatch: signals,
      icpName: 'Peak Consulting ICP',
      totalMatches: 42,
      newMatchesCount: 5,
      highOpportunityCount: 18,
      activeSignalsCount: 8,
      unreadAlertsCount: 2,
      alertSettings: {
        onNewMatch: true,
        onHighOpportunity: true,
        onHiringSignal: true,
        onExpansionSignal: true,
        onLeadershipSignal: true,
        onFundingSignal: false,
        onTechMigration: false
      },
      matchedCompanies: [
        {
          id: 'mc-1',
          companyName: 'Terragon Group',
          domain: 'terragongroup.com',
          industry: 'Technology & SaaS',
          location: 'Lagos, Nigeria',
          opportunityScore: 92,
          opportunityLevel: 'Very High',
          buyingIntent: 'Very High',
          matchedDate: 'Just now',
          isNewMatch: true,
          signals: ['Hiring Surge', 'Regional Expansion']
        },
        {
          id: 'mc-2',
          companyName: 'SeamlessHR',
          domain: 'seamlesshr.com',
          industry: 'Enterprise Software',
          location: 'Lagos, Nigeria',
          opportunityScore: 89,
          opportunityLevel: 'High',
          buyingIntent: 'High',
          matchedDate: '1h ago',
          isNewMatch: false,
          signals: ['New COO Appointed']
        }
      ],
      activityHistory: [
        {
          id: 'act-1',
          timestamp: 'Just now',
          type: 'new_match',
          title: 'Search created & 42 companies indexed',
          detail: 'Monitoring Agent initiated autonomous background tracking.'
        }
      ]
    };

    onCreateSearch(item);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '600px',
        maxWidth: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Create Monitored Saved Search
              </h3>
              <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0 0' }}>
                HUNTIQ will continuously watch for new matching companies and buying signals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={18} color="#ffffff" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Search Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Lagos Tech Scaleups, Pan-African FinTechs, Abuja Series A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <input
              type="text"
              placeholder="Brief summary of target criteria and business rationale..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Quick Filters Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Technology & SaaS">Technology & SaaS</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Healthcare & HealthTech">Healthcare</option>
                <option value="Logistics & Supply Chain">Logistics</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Lagos, Nigeria">Lagos, Nigeria</option>
                <option value="Abuja, Nigeria">Abuja, Nigeria</option>
                <option value="Accra, Ghana">Accra, Ghana</option>
                <option value="Nairobi, Kenya">Nairobi, Kenya</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Company Size
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="10 – 50">10 – 50</option>
                <option value="50 – 500">50 – 500</option>
                <option value="500 – 1,000">500 – 1,000</option>
                <option value="1,000+">1,000+</option>
              </select>
            </div>
          </div>

          {/* Monitoring Toggle Card */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} color="#059669" />
                <span>Enable Autonomous Monitoring</span>
              </strong>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                Automatically scan for new matching companies and send alert notifications
              </p>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px' }}>
              <input
                type="checkbox"
                checked={monitoringEnabled}
                onChange={(e) => setMonitoringEnabled(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                inset: 0,
                backgroundColor: monitoringEnabled ? '#4f46e5' : '#cbd5e1',
                borderRadius: '20px',
                transition: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '14px',
                  width: '14px',
                  left: monitoringEnabled ? '20px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.2s'
                }} />
              </span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Sparkles size={14} />
              <span>Save & Monitor Search</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
