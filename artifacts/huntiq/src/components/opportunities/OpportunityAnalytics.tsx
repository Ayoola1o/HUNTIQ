import React from 'react';
import { 
  ChevronDown, 
  ArrowRight, 
  Zap, 
  FileText, 
  TrendingUp, 
  PlusCircle, 
  Microscope 
} from 'lucide-react';

export const OpportunityAnalytics: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '18px',
      padding: '0 32px'
    }}>
      {/* 1. Opportunities by Stage */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #eaecf0',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Opportunities by Stage
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px',
            color: '#64748b',
            cursor: 'pointer',
            backgroundColor: '#f8fafc',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <span>This month</span>
            <ChevronDown size={12} />
          </div>
        </div>

        {/* Donut & Legend Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
          {/* SVG Donut */}
          <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              {/* Discovery 24% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="14" strokeDasharray="57.3 238.7" strokeDashoffset="0" />
              {/* Qualification 19% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="14" strokeDasharray="45.4 238.7" strokeDashoffset="-57.3" />
              {/* Proposal 15% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f97316" strokeWidth="14" strokeDasharray="35.8 238.7" strokeDashoffset="-102.7" />
              {/* Negotiation 13% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#6366f1" strokeWidth="14" strokeDasharray="31 238.7" strokeDashoffset="-138.5" />
              {/* Nurturing 18% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="14" strokeDasharray="43 238.7" strokeDashoffset="-169.5" />
              {/* Closed Won 6% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#14b8a6" strokeWidth="14" strokeDasharray="14.3 238.7" strokeDashoffset="-212.5" />
              {/* Closed Lost 6% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ef4444" strokeWidth="14" strokeDasharray="14.3 238.7" strokeDashoffset="-226.8" />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>284</span>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>Total</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', fontSize: '11px', flex: 1 }}>
            {[
              { label: 'Discovery', count: '68', pct: '24%', color: '#3b82f6' },
              { label: 'Qualification', count: '54', pct: '19%', color: '#8b5cf6' },
              { label: 'Proposal', count: '42', pct: '15%', color: '#f97316' },
              { label: 'Negotiation', count: '38', pct: '13%', color: '#6366f1' },
              { label: 'Nurturing', count: '52', pct: '18%', color: '#10b981' },
              { label: 'Closed Won', count: '14', pct: '6%', color: '#14b8a6' },
              { label: 'Closed Lost', count: '16', pct: '6%', color: '#ef4444' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ color: '#475569' }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.count} ({item.pct})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Opportunity Score Distribution */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #eaecf0',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Opportunity Score Distribution
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px',
            color: '#64748b',
            cursor: 'pointer',
            backgroundColor: '#f8fafc',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <span>This month</span>
            <ChevronDown size={12} />
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '140px',
            padding: '0 10px',
            borderBottom: '1px solid #eaecf0'
          }}>
            {/* 0-49 Low (28) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '42px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>28</span>
              <div style={{ width: '32px', height: '34px', backgroundColor: '#cbd5e1', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* 50-69 Medium (74) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '42px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706' }}>74</span>
              <div style={{ width: '32px', height: '84px', backgroundColor: '#f59e0b', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* 70-89 High (116) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '42px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>116</span>
              <div style={{ width: '32px', height: '124px', backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* 90-100 Hot (66) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '42px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>66</span>
              <div style={{ width: '32px', height: '76px', backgroundColor: '#10b981', borderRadius: '4px 4px 0 0' }} />
            </div>
          </div>

          {/* Bar Chart Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px 0', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            <div style={{ width: '42px' }}>
              <div>0–49</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Low</div>
            </div>
            <div style={{ width: '42px' }}>
              <div>50–69</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Medium</div>
            </div>
            <div style={{ width: '42px' }}>
              <div>70–89</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>High</div>
            </div>
            <div style={{ width: '42px' }}>
              <div>90–100</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Hot</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Opportunity Activity */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #eaecf0',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Recent Opportunity Activity
          </h3>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: 0
          }}>
            <span>View all</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {[
            {
              id: '1',
              title: 'New signal detected for Acme Technologies',
              sub: 'Hiring surge: 38 new job postings',
              time: '2h ago',
              icon: <Zap size={13} color="#6366f1" />,
              iconBg: '#eef2ff'
            },
            {
              id: '2',
              title: 'FinServe Ltd moved to Qualification',
              sub: 'Opportunity stage updated',
              time: '5h ago',
              icon: <FileText size={13} color="#2563eb" />,
              iconBg: '#eff6ff'
            },
            {
              id: '3',
              title: 'Delta Systems score increased to 87',
              sub: 'New intent signal detected',
              time: '1d ago',
              icon: <TrendingUp size={13} color="#059669" />,
              iconBg: '#ecfdf5'
            },
            {
              id: '4',
              title: 'Vertex Solutions added to opportunities',
              sub: 'From saved search: Tech companies in Lagos',
              time: '1d ago',
              icon: <PlusCircle size={13} color="#d97706" />,
              iconBg: '#fef3c7'
            },
            {
              id: '5',
              title: 'Nimbus Analytics research completed',
              sub: '24 data points analyzed',
              time: '2d ago',
              icon: <Microscope size={13} color="#7c3aed" />,
              iconBg: '#f5f3ff'
            },
          ].map((act) => (
            <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: act.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '1px',
                  flexShrink: 0
                }}>
                  {act.icon}
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                    {act.sub}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', flexShrink: 0 }}>
                {act.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
