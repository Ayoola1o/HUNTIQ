import React, { useState } from 'react';
import { 
  MapPin, 
  Crosshair, 
  Phone, 
  Globe, 
  Star, 
  UserCheck, 
  Zap, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { 
  POPULAR_ZONES, 
  geoScraperEngine, 
  type GeoScrapedBusiness 
} from '../../engine/geoScraperEngine';

interface MapProspectingRadarProps {
  onSelectBusiness?: (business: GeoScrapedBusiness) => void;
  onAddToPipeline?: (business: GeoScrapedBusiness) => void;
}

export const MapProspectingRadar: React.FC<MapProspectingRadarProps> = ({
  onSelectBusiness,
  onAddToPipeline
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState('lagos');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [radiusKm, setRadiusKm] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState('All Industries');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [businesses, setBusinesses] = useState<GeoScrapedBusiness[]>(
    geoScraperEngine.scrapeZone('lagos')
  );
  const [activePin, setActivePin] = useState<GeoScrapedBusiness | null>(businesses[0] || null);
  const [addedDealId, setAddedDealId] = useState<string | null>(null);

  const activeZone = POPULAR_ZONES.find(z => z.id === selectedZoneId) || POPULAR_ZONES[0];

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(15);

    const timer1 = setTimeout(() => setScanProgress(50), 300);
    const timer2 = setTimeout(() => setScanProgress(85), 600);
    const timer3 = setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      const results = geoScraperEngine.scrapeZone(
        selectedZoneId,
        selectedDistrict,
        radiusKm,
        selectedCategory
      );
      setBusinesses(results);
      if (results.length > 0) {
        setActivePin(results[0]);
      }
    }, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleAddDeal = (biz: GeoScrapedBusiness) => {
    setAddedDealId(biz.id);
    onAddToPipeline?.(biz);
    setTimeout(() => setAddedDealId(null), 2500);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Top Header & Geospatial Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
          }}>
            <Crosshair size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Interactive Geo-Prospecting Radar & Map Scraper</span>
              <span style={{ fontSize: '10px', backgroundColor: '#eef2ff', color: '#4f46e5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #c7d2fe' }}>
                Satellite & Place Crawl
              </span>
            </h2>
            <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
              Drop pins, define search radius, and scrape verified businesses with coordinates, reviews, phone numbers & decision makers.
            </p>
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={handleStartScan}
          disabled={isScanning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isScanning ? '#6366f1' : '#090d16',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 18px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: isScanning ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(9, 13, 22, 0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
          <span>{isScanning ? `Scraping Area (${scanProgress}%)...` : 'Scrape Map Coordinates'}</span>
        </button>
      </div>

      {/* Geospatial Search Filter Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1px solid #e2e8f0'
      }}>
        {/* Region / City */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
            Target Metro Region
          </label>
          <select
            value={selectedZoneId}
            onChange={(e) => {
              setSelectedZoneId(e.target.value);
              setSelectedDistrict('All Districts');
            }}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '7px',
              fontSize: '12px',
              backgroundColor: '#ffffff'
            }}
          >
            {POPULAR_ZONES.map(z => (
              <option key={z.id} value={z.id}>{z.name} ({z.country})</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
            Commercial District / Hub
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '7px',
              fontSize: '12px',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="All Districts">All Districts (Metropolitan Radius)</option>
            {activeZone.popularDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Radius Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
              Search Radius
            </label>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5' }}>
              {radiusKm} km
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="50"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4f46e5' }}
          />
        </div>

        {/* Industry Filter */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
            Industry / Entity Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '7px',
              fontSize: '12px',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="All Industries">All Industries (Commercial & Tech)</option>
            <option value="Financial Technology">FinTech & Payments</option>
            <option value="Banking">Digital Banking & POS</option>
            <option value="HealthTech">HealthTech & Medical Cloud</option>
          </select>
        </div>
      </div>

      {/* Main Map + Discovered Businesses Split View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '16px',
        minHeight: '440px'
      }}>
        {/* Interactive Radar Canvas Map */}
        <div style={{
          backgroundColor: '#090d16',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8)'
        }}>
          {/* Radar Grid Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at center, rgba(99, 102, 241, 0.12) 0, rgba(99, 102, 241, 0) 70%),
              linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
            pointerEvents: 'none'
          }} />

          {/* Radar Compass Circle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            border: '1px dashed rgba(99, 102, 241, 0.3)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            pointerEvents: 'none'
          }} />

          {/* Scanning Line Animation */}
          {isScanning && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '140px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(99, 102, 241, 1), transparent)',
              transformOrigin: '0 0',
              animation: 'spin 2s linear infinite',
              zIndex: 3
            }} />
          )}

          {/* Top Map Info Overlay */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '14px',
            zIndex: 4,
            backgroundColor: 'rgba(9, 13, 22, 0.85)',
            backdropFilter: 'blur(6px)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={13} color="#818cf8" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
              {activeZone.name} ({radiusKm}km radius)
            </span>
            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 800 }}>
              ● {businesses.length} Unique Entities
            </span>
          </div>

          {/* Interactive Map Pins Container */}
          <div style={{ position: 'relative', flex: 1, zIndex: 5, padding: '40px' }}>
            {businesses.map((biz, idx) => {
              // Distribute pins across radar coordinates
              const positions = [
                { top: '35%', left: '42%' },
                { top: '55%', left: '68%' },
                { top: '65%', left: '32%' },
                { top: '25%', left: '72%' },
                { top: '48%', left: '22%' }
              ];
              const pos = positions[idx % positions.length];
              const isSelected = activePin?.id === biz.id;

              return (
                <div
                  key={biz.id}
                  onClick={() => {
                    setActivePin(biz);
                    onSelectBusiness?.(biz);
                  }}
                  style={{
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Pulsing circle */}
                  <div style={{
                    width: isSelected ? '42px' : '32px',
                    height: isSelected ? '42px' : '32px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#4f46e5' : '#1e1b4b',
                    border: `2px solid ${isSelected ? '#a5b4fc' : '#6366f1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 900,
                    boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.9)' : '0 0 10px rgba(99, 102, 241, 0.4)'
                  }}>
                    {biz.opportunityScore}
                  </div>

                  {/* Label */}
                  <div style={{
                    marginTop: '4px',
                    backgroundColor: 'rgba(9, 13, 22, 0.9)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    whiteSpace: 'nowrap'
                  }}>
                    {biz.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Entity Deep Inspector */}
        {activePin ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
            overflowY: 'auto'
          }}>
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    {activePin.district}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
                    {activePin.name}
                  </h3>
                </div>

                <div style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 900
                }}>
                  {activePin.opportunityScore}/100 Fit
                </div>
              </div>

              {/* Coordinates & Physical Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#334155', margin: '10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="#6366f1" style={{ flexShrink: 0 }} />
                  <span>{activePin.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>{activePin.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={13} color="#2563eb" style={{ flexShrink: 0 }} />
                  <a href={activePin.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                    {activePin.domain}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={13} color="#f59e0b" fill="#f59e0b" style={{ flexShrink: 0 }} />
                  <span><strong>{activePin.rating}★</strong> on Google Place Reviews ({activePin.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Discovered Decision Makers */}
              <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <UserCheck size={13} color="#4f46e5" />
                  <span>Verified Decision-Makers ({activePin.decisionMakers.length})</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activePin.decisionMakers.map((dm, idx) => (
                    <div key={idx} style={{
                      backgroundColor: '#f8fafc',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{dm.name}</strong>
                        <span style={{ fontSize: '10.5px', color: '#64748b' }}>{dm.role}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 600 }}>{dm.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Signals */}
              <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Zap size={13} color="#ea580c" />
                  <span>Geospatial Signals & Expansion</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {activePin.detectedSignals.map((sig, idx) => (
                    <span key={idx} style={{
                      fontSize: '10.5px',
                      backgroundColor: '#fff7ed',
                      color: '#c2410c',
                      border: '1px solid #ffedd5',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}>
                      ⚡ {sig}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <button
                onClick={() => handleAddDeal(activePin)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: addedDealId === activePin.id ? '#059669' : '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                }}
              >
                {addedDealId === activePin.id ? <Check size={13} /> : <Zap size={13} />}
                <span>{addedDealId === activePin.id ? 'Added to Pipeline!' : 'Add to Pipeline'}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
