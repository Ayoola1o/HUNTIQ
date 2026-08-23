import React from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

export const CompanyAnalytics: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '18px',
      padding: '0 32px'
    }}>
      {/* 1. Companies by Industry */}
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
            Companies by Industry
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
              {/* Technology 29.6% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="14" strokeDasharray="70.7 238.7" strokeDashoffset="0" />
              {/* Financial Services 21.5% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06b6d4" strokeWidth="14" strokeDasharray="51.3 238.7" strokeDashoffset="-70.7" />
              {/* IT Services 17.1% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="14" strokeDasharray="40.8 238.7" strokeDashoffset="-122" />
              {/* Healthcare 11.4% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ec4899" strokeWidth="14" strokeDasharray="27.2 238.7" strokeDashoffset="-162.8" />
              {/* Manufacturing 9.4% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="14" strokeDasharray="22.4 238.7" strokeDashoffset="-190" />
              {/* Professional Services 7.0% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="14" strokeDasharray="16.7 238.7" strokeDashoffset="-212.4" />
              {/* Other 3.9% */}
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94a3b8" strokeWidth="14" strokeDasharray="9.6 238.7" strokeDashoffset="-229.1" />
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
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>2,842</span>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>Total</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', fontSize: '11px', flex: 1 }}>
            {[
              { label: 'Technology', count: '842', pct: '29.6%', color: '#3b82f6' },
              { label: 'Financial Services', count: '612', pct: '21.5%', color: '#06b6d4' },
              { label: 'IT Services', count: '486', pct: '17.1%', color: '#f59e0b' },
              { label: 'Healthcare', count: '324', pct: '11.4%', color: '#ec4899' },
              { label: 'Manufacturing', count: '268', pct: '9.4%', color: '#10b981' },
              { label: 'Professional Services', count: '198', pct: '7.0%', color: '#8b5cf6' },
              { label: 'Other', count: '112', pct: '3.9%', color: '#94a3b8' },
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
            {/* Low (0-49): 312 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '46px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>312</span>
              <div style={{ width: '36px', height: '42px', backgroundColor: '#94a3b8', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* Medium (50-69): 864 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '46px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706' }}>864</span>
              <div style={{ width: '36px', height: '94px', backgroundColor: '#f59e0b', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* High (70-89): 1,142 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '46px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>1,142</span>
              <div style={{ width: '36px', height: '136px', backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }} />
            </div>

            {/* Very High (90-100): 524 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '46px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>524</span>
              <div style={{ width: '36px', height: '70px', backgroundColor: '#10b981', borderRadius: '4px 4px 0 0' }} />
            </div>
          </div>

          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px 0', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
            <div style={{ width: '46px' }}>
              <div>0-49</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Low</div>
            </div>
            <div style={{ width: '46px' }}>
              <div>50-69</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Medium</div>
            </div>
            <div style={{ width: '46px' }}>
              <div>70-89</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>High</div>
            </div>
            <div style={{ width: '46px' }}>
              <div>90-100</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Very High</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recently Added Companies */}
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
            Recently Added Companies
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

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {[
            {
              id: '1',
              name: 'CloudNova Solutions',
              desc: 'Cloud computing services',
              time: '2h ago',
              logoBg: '#eff6ff',
              logoColor: '#2563eb',
              initial: 'C'
            },
            {
              id: '2',
              name: 'BrightPay Financials',
              desc: 'Fintech payment solutions',
              time: '6h ago',
              logoBg: '#ecfdf5',
              logoColor: '#059669',
              initial: 'B'
            },
            {
              id: '3',
              name: 'Medix Healthcare',
              desc: 'Digital health platform',
              time: '1d ago',
              logoBg: '#fdf2f8',
              logoColor: '#db2777',
              initial: 'M'
            },
            {
              id: '4',
              name: 'GreenBuild Construction',
              desc: 'Sustainable construction',
              time: '1d ago',
              logoBg: '#f0fdf4',
              logoColor: '#16a34a',
              initial: 'G'
            },
            {
              id: '5',
              name: 'Edutech Innovations',
              desc: 'Education technology',
              time: '2d ago',
              logoBg: '#f5f3ff',
              logoColor: '#7c3aed',
              initial: 'E'
            },
          ].map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  backgroundColor: item.logoBg,
                  color: item.logoColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {item.initial}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
