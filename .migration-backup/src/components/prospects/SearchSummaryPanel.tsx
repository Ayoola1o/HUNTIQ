import React from 'react';
import type { SearchCriteria, SearchEstimation } from '../../types/prospectHunter';
import { 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  Briefcase, 
  Star, 
  Sparkles, 
  Flame, 
  Clock, 
  Layers 
} from 'lucide-react';

interface SearchSummaryPanelProps {
  criteria: SearchCriteria;
  estimation: SearchEstimation;
}

export const SearchSummaryPanel: React.FC<SearchSummaryPanelProps> = ({
  criteria,
  estimation
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '340px',
      minWidth: '340px'
    }}>
      {/* 1. Search Summary Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #eaecf0',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Search Summary
          </h3>
          <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Based on your criteria, HUNTIQ will search for companies with the following profile.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
          {/* Industries */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Briefcase size={13} />
              <span>Industries</span>
            </div>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {criteria.industries.length > 0 ? criteria.industries.join(', ') : 'Technology, Software'}
            </span>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <MapPin size={13} />
              <span>Location</span>
            </div>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {criteria.locations.length > 0 ? criteria.locations.join(', ') : 'Lagos, Nigeria'}
            </span>
          </div>

          {/* Company Size */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Users size={13} />
              <span>Company Size</span>
            </div>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {criteria.companySize}
            </span>
          </div>

          {/* Revenue */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <DollarSign size={13} />
              <span>Revenue</span>
            </div>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {criteria.revenue}
            </span>
          </div>

          {/* Business Type */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Building2 size={13} />
              <span>Business Type</span>
            </div>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {criteria.businessType}
            </span>
          </div>

          {/* Top Signals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Star size={13} />
              <span>Top Signals</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', maxWidth: '180px' }}>
              {criteria.signals.slice(0, 4).map((sig) => (
                <span
                  key={sig}
                  style={{
                    fontSize: '10px',
                    backgroundColor: '#ede9fe',
                    color: '#6d28d9',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}
                >
                  {sig.split(' ')[0]}
                </span>
              ))}
              {criteria.signals.length > 4 && (
                <span style={{ fontSize: '10px', color: '#94a3b8', padding: '2px' }}>
                  +{criteria.signals.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. What you'll get Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #eaecf0',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            What you'll get
          </h3>
          <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            We'll find and rank companies based on opportunity score and buying intent.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Building2 size={13} color="#4f46e5" />
              <span>Estimated Companies</span>
            </div>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>{estimation.estimatedCompanies}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Flame size={13} color="#e11d48" />
              <span>High Opportunity Matches</span>
            </div>
            <span style={{ fontWeight: 800, color: '#059669' }}>{estimation.highOpportunityMatches}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Star size={13} color="#d97706" />
              <span>Average Opportunity Score</span>
            </div>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>{estimation.averageScore}/100</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Layers size={13} color="#2563eb" />
              <span>Research Sources</span>
            </div>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{estimation.researchSources}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Clock size={13} color="#059669" />
              <span>Data Freshness</span>
            </div>
            <span style={{ fontWeight: 700, color: '#059669' }}>{estimation.dataFreshness}</span>
          </div>
        </div>
      </div>

      {/* 3. AI-Powered Search Explainer Card */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        borderRadius: '16px',
        border: '1.5px solid #ddd6fe',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={15} />
          </div>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#5b21b6' }}>
            AI-Powered Search
          </span>
        </div>

        <p style={{ fontSize: '11.5px', color: '#6d28d9', lineHeight: 1.45, margin: 0 }}>
          Our AI analyzes millions of data points, company signals, news, and market intelligence to find your best prospects.
        </p>
      </div>
    </div>
  );
};
