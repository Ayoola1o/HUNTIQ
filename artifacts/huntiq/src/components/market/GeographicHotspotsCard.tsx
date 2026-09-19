import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import type { GeographicHotspot } from '../../types/market';

interface GeographicHotspotsCardProps {
  onSelectHotspot?: (hotspot: GeographicHotspot) => void;
}

export const GeographicHotspotsCard: React.FC<GeographicHotspotsCardProps> = ({
  onSelectHotspot
}) => {
  const hotspots: GeographicHotspot[] = [
    {
      id: 'lagos',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria',
      intensity: 'High',
      signalCount: 1240,
      icpFit: 91,
      highIntentCount: 284,
      opportunityIndex: 94,
      topIndustry: 'Financial Services',
      growth: '+38%'
    },
    {
      id: 'joburg',
      city: 'Johannesburg',
      state: 'Gauteng',
      country: 'South Africa',
      intensity: 'High',
      signalCount: 1050,
      icpFit: 86,
      highIntentCount: 240,
      opportunityIndex: 91,
      topIndustry: 'Enterprise Tech',
      growth: '+29%'
    },
    {
      id: 'nairobi',
      city: 'Nairobi',
      state: 'Nairobi County',
      country: 'Kenya',
      intensity: 'High',
      signalCount: 890,
      icpFit: 88,
      highIntentCount: 195,
      opportunityIndex: 89,
      topIndustry: 'FinTech & AgriTech',
      growth: '+31%'
    },
    {
      id: 'abuja',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
      intensity: 'Medium',
      signalCount: 612,
      icpFit: 84,
      highIntentCount: 118,
      opportunityIndex: 81,
      topIndustry: 'GovTech & Healthcare',
      growth: '+22%'
    },
    {
      id: 'accra',
      city: 'Accra',
      state: 'Greater Accra',
      country: 'Ghana',
      intensity: 'Medium',
      signalCount: 380,
      icpFit: 76,
      highIntentCount: 72,
      opportunityIndex: 72,
      topIndustry: 'Retail & LogiTech',
      growth: '+17%'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '18px 20px',
      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      flex: 1.1,
      minWidth: 0
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            backgroundColor: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={14} color="#059669" />
          </div>
          <div>
            <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Geographic Hotspots
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Where signal activity & buying density are highest
            </span>
          </div>
        </div>

        <div style={{
          fontSize: '11px',
          color: '#059669',
          fontWeight: 700,
          backgroundColor: '#ecfdf5',
          padding: '3px 8px',
          borderRadius: '6px'
        }}>
          5 Active Hubs
        </div>
      </div>

      {/* Interactive Map / Radar summary card */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        padding: '12px 14px',
        color: '#ffffff',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle grid pattern background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
          opacity: 0.6,
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
              Primary Concentration
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              Lagos & West Africa Corridor
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            border: '1px solid rgba(129, 140, 248, 0.4)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#c7d2fe',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Compass size={12} />
            <span>Top Hub (Index: 94)</span>
          </div>
        </div>

        {/* Mini stats bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Total Signals</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>4,172</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>High Intent Leads</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399' }}>909 accounts</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Avg. ICP Match</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#818cf8' }}>88.2%</div>
          </div>
        </div>
      </div>

      {/* Hotspots List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {hotspots.map((spot) => (
          <div
            key={spot.id}
            onClick={() => onSelectHotspot && onSelectHotspot(spot)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#f1f5f9';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: spot.intensity === 'High' ? '#10b981' : '#f59e0b'
              }} />

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  {spot.city}, {spot.country}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {spot.topIndustry} • {spot.highIntentCount} high-intent
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a' }}>
                  {spot.signalCount.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#059669' }}>
                  {spot.growth}
                </div>
              </div>

              <div style={{
                backgroundColor: '#ede9fe',
                color: '#6366f1',
                fontWeight: 800,
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '6px'
              }}>
                {spot.opportunityIndex}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
