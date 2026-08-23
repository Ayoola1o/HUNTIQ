import React from 'react';
import { 
  ChevronDown, 
  ArrowRight, 
  Users, 
  DollarSign, 
  Briefcase, 
  MapPin, 
  Cpu 
} from 'lucide-react';

export const SignalAnalytics: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '18px',
      padding: '0 32px'
    }}>
      {/* 1. Signals by Type */}
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
            Signals by Type
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
              {/* Hiring 34% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="14" strokeDasharray="81.2 238.7" strokeDashoffset="0" />
              {/* Expansion 17% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#38bdf8" strokeWidth="14" strokeDasharray="40.6 238.7" strokeDashoffset="-81.2" />
              {/* Leadership 15% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f97316" strokeWidth="14" strokeDasharray="35.8 238.7" strokeDashoffset="-121.8" />
              {/* Funding 13% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ef4444" strokeWidth="14" strokeDasharray="31 238.7" strokeDashoffset="-157.6" />
              {/* Technology 10% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#6366f1" strokeWidth="14" strokeDasharray="23.9 238.7" strokeDashoffset="-188.6" />
              {/* News 7% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="14" strokeDasharray="16.7 238.7" strokeDashoffset="-212.5" />
              {/* Compliance 4% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="14" strokeDasharray="9.5 238.7" strokeDashoffset="-229.2" />
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
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>1,429</span>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>Total</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3px', fontSize: '11px', flex: 1 }}>
            {[
              { label: 'Hiring', count: '482', pct: '34%', color: '#3b82f6' },
              { label: 'Expansion', count: '246', pct: '17%', color: '#38bdf8' },
              { label: 'Leadership', count: '218', pct: '15%', color: '#f97316' },
              { label: 'Funding', count: '186', pct: '13%', color: '#ef4444' },
              { label: 'Technology', count: '142', pct: '10%', color: '#6366f1' },
              { label: 'News', count: '95', pct: '7%', color: '#8b5cf6' },
              { label: 'Compliance', count: '60', pct: '4%', color: '#10b981' },
              { label: 'Other', count: '0', pct: '0%', color: '#94a3b8' },
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

      {/* 2. Signal Impact Distribution */}
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
            Signal Impact Distribution
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
            {/* Low (0-24): 86 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '44px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>86</span>
              <div style={{ width: '34px', height: '38px', backgroundColor: '#94a3b8', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* Medium (25-49): 242 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '44px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706' }}>242</span>
              <div style={{ width: '34px', height: '68px', backgroundColor: '#f59e0b', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* High (50-74): 586 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '44px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>586</span>
              <div style={{ width: '34px', height: '130px', backgroundColor: '#10b981', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* Very High (75-100): 515 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '44px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48' }}>515</span>
              <div style={{ width: '34px', height: '114px', backgroundColor: '#ef4444', borderRadius: '4px 4px 0 0' }} />
            </div>
          </div>

          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px 0', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            <div style={{ width: '44px' }}>
              <div>Low</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>(0-24)</div>
            </div>
            <div style={{ width: '44px' }}>
              <div>Medium</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>(25-49)</div>
            </div>
            <div style={{ width: '44px' }}>
              <div>High</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>(50-74)</div>
            </div>
            <div style={{ width: '44px' }}>
              <div>Very High</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>(75-100)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Signal Activity */}
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
            Recent Signal Activity
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

        {/* Activity items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {[
            {
              id: '1',
              title: 'Hiring surge detected for Acme Technologies',
              sub: '38 new job postings',
              time: '2h ago',
              icon: <Users size={13} color="#059669" />,
              iconBg: '#ecfdf5'
            },
            {
              id: '2',
              title: 'FinServe Ltd raised $12M Series B',
              sub: 'Funding signal detected',
              time: '1d ago',
              icon: <DollarSign size={13} color="#16a34a" />,
              iconBg: '#f0fdf4'
            },
            {
              id: '3',
              title: 'New COO appointed at Delta Systems',
              sub: 'Leadership change detected',
              time: '1d ago',
              icon: <Briefcase size={13} color="#ea580c" />,
              iconBg: '#fff7ed'
            },
            {
              id: '4',
              title: 'Vertex Solutions opened new office',
              sub: 'Expansion signal detected',
              time: '1d ago',
              icon: <MapPin size={13} color="#2563eb" />,
              iconBg: '#eff6ff'
            },
            {
              id: '5',
              title: 'Nimbus Analytics implemented AWS',
              sub: 'Technology change detected',
              time: '2d ago',
              icon: <Cpu size={13} color="#7c3aed" />,
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
