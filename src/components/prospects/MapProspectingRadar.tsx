import React, { useState } from 'react';
import { 
  MapPin, 
  Crosshair, 
  Phone, 
  Globe, 
  Zap, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  Send, 
  Building2, 
  Copy, 
  ArrowRight, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles,
  Key
} from 'lucide-react';
import { 
  POPULAR_ZONES, 
  geoScraperEngine, 
  type GeoScrapedBusiness 
} from '../../engine/geoScraperEngine';
import { useHuntiq } from '../../context/HuntiqContext';
import { GoogleProspectingMap } from './GoogleProspectingMap';

interface MapProspectingRadarProps {
  onSelectBusiness?: (business: GeoScrapedBusiness) => void;
  onAddToPipeline?: (business: GeoScrapedBusiness) => void;
  onNavigateToOpportunities?: () => void;
}

export const MapProspectingRadar: React.FC<MapProspectingRadarProps> = ({
  onSelectBusiness,
  onAddToPipeline,
  onNavigateToOpportunities
}) => {
  const { captureGeoBusinesses, addDealToPipeline } = useHuntiq();
  const [selectedZoneId, setSelectedZoneId] = useState('lagos');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [radiusKm, setRadiusKm] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState('All Industries');
  const [discoveryMode, setDiscoveryMode] = useState<'ALL' | 'ENTERPRISE' | 'LOCAL_COMMERCIAL' | 'DIGITAL_GAP'>('ALL');
  const [issueFilter, setIssueFilter] = useState<string>('ALL');

  // Map Engine: 'google' vs 'canvas'
  const [mapEngine, setMapEngine] = useState<'google' | 'canvas'>('google');
  const [googleApiKey, setGoogleApiKey] = useState<string>(
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [businesses, setBusinesses] = useState<GeoScrapedBusiness[]>(
    geoScraperEngine.scrapeZone('lagos', 'All Districts', 15, 'All Industries', 'ALL')
  );
  const [activePin, setActivePin] = useState<GeoScrapedBusiness | null>(businesses[0] || null);
  const [activePitchTab, setActivePitchTab] = useState<'email' | 'linkedin' | 'call'>('email');
  const [addedDealId, setAddedDealId] = useState<string | null>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [captureToast, setCaptureToast] = useState<string | null>(null);

  const activeZone = POPULAR_ZONES.find(z => z.id === selectedZoneId) || POPULAR_ZONES[0];

  const handleStartScan = (mode = discoveryMode) => {
    setIsScanning(true);
    setScanProgress(20);

    const timer1 = setTimeout(() => setScanProgress(60), 200);
    const timer2 = setTimeout(() => setScanProgress(90), 400);
    const timer3 = setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      const results = geoScraperEngine.scrapeZone(
        selectedZoneId,
        selectedDistrict,
        radiusKm,
        selectedCategory,
        mode
      );
      setBusinesses(results);
      if (results.length > 0) {
        setActivePin(results[0]);
      }
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleModeChange = (mode: 'ALL' | 'ENTERPRISE' | 'LOCAL_COMMERCIAL' | 'DIGITAL_GAP') => {
    setDiscoveryMode(mode);
    const results = geoScraperEngine.scrapeZone(
      selectedZoneId,
      selectedDistrict,
      radiusKm,
      selectedCategory,
      mode
    );
    setBusinesses(results);
    if (results.length > 0) setActivePin(results[0]);
  };

  const filteredBusinesses = businesses.filter((b) => {
    if (issueFilter === 'ALL') return true;
    if (issueFilter === 'NO_WEBSITE') return b.digitalAudit.digitalMaturity.website === 0;
    if (issueFilter === 'UNCLAIMED_MAPS') return b.digitalAudit.digitalMaturity.localPresence < 8;
    if (issueFilter === 'NO_ADS_PIXEL') return b.digitalAudit.digitalMaturity.adsAndTracking <= 5;
    if (issueFilter === 'NO_EMAIL_MARKETING') return b.digitalAudit.digitalMaturity.emailMarketing <= 5;
    if (issueFilter === 'GENERIC_GMAIL') return b.digitalAudit.digitalMaturity.emailCredibility < 5;
    return true;
  });

  const handleAddDeal = (biz: GeoScrapedBusiness) => {
    setAddedDealId(biz.id);
    const dealValue = biz.digitalAudit.recommendedPackage.estimatedValue.max;
    const stage = biz.digitalAudit.gapScore >= 80 ? 'discovery' : 'contacted';

    addDealToPipeline({
      companyName: biz.name,
      domain: biz.domain,
      dealTitle: `${biz.name} - ${biz.digitalAudit.recommendedPackage.packageName}`,
      serviceName: biz.digitalAudit.recommendedPackage.packageName,
      dealValue,
      probability: biz.digitalAudit.conversionProbability,
      opportunityScore: biz.opportunityScore,
      stage: stage as any,
      contactName: biz.decisionMakers[0]?.name || 'Business Owner',
      contactRole: biz.decisionMakers[0]?.role || 'Managing Director',
      nextAction: biz.digitalAudit.pitchAngles.salesCallOpener
    });
    onAddToPipeline?.(biz);
    setCaptureToast(`Promoted ${biz.name} ($${dealValue.toLocaleString()}) to Pipeline!`);
    setTimeout(() => setCaptureToast(null), 4000);
    setTimeout(() => setAddedDealId(null), 2500);
  };

  const handleBatchCapture = () => {
    captureGeoBusinesses(filteredBusinesses);
    setCaptureToast(`Captured ${filteredBusinesses.length} entities into Opportunities!`);
    setTimeout(() => setCaptureToast(null), 5000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const getPinVisuals = (biz: GeoScrapedBusiness) => {
    if (biz.targetType === 'ENTERPRISE') {
      return { bg: '#8b5cf6', label: 'Enterprise', border: '#c4b5fd' };
    }
    const gap = biz.digitalAudit.gapScore;
    if (gap >= 81) return { bg: '#e11d48', label: 'Critical Gap', border: '#fda4af' };
    if (gap >= 61) return { bg: '#ea580c', label: 'High Gap', border: '#fdba74' };
    if (gap >= 41) return { bg: '#eab308', label: 'Moderate Gap', border: '#fef08a' };
    return { bg: '#10b981', label: 'Optimized', border: '#a7f3d0' };
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
      {/* Top Header & Quick Actions */}
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
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
          }}>
            <Crosshair size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Live Location Radar & Google Maps Prospecting</span>
              <span style={{ fontSize: '10.5px', backgroundColor: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #c7d2fe', fontWeight: 800 }}>
                Google Maps + Places API
              </span>
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Discover commercial entities on Google Maps, evaluate 8-factor digital gaps, and generate client proposal packages.
            </p>
          </div>
        </div>

        {/* Scan, Mode & Key Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Map Engine Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            padding: '2px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setMapEngine('google')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mapEngine === 'google' ? '#ffffff' : 'transparent',
                color: mapEngine === 'google' ? '#4f46e5' : '#64748b',
                boxShadow: mapEngine === 'google' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Google Maps
            </button>
            <button
              onClick={() => setMapEngine('canvas')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mapEngine === 'canvas' ? '#ffffff' : 'transparent',
                color: mapEngine === 'canvas' ? '#4f46e5' : '#64748b',
                boxShadow: mapEngine === 'canvas' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Radar Grid
            </button>
          </div>

          <button
            onClick={() => setIsKeyModalOpen(!isKeyModalOpen)}
            title="Configure Google Maps API Key"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: googleApiKey ? '#f8fafc' : '#fee2e2',
              color: googleApiKey ? '#475569' : '#dc2626',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '7px 10px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Key size={13} />
            <span>{googleApiKey ? 'API Key Configured' : 'Set Maps Key'}</span>
          </button>

          <button
            onClick={handleBatchCapture}
            title="Promote all discovered businesses in view to Opportunities"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)'
            }}
          >
            <Zap size={14} color="#059669" fill="#059669" />
            <span>Capture Viewport ({filteredBusinesses.length})</span>
          </button>

          <button
            onClick={() => handleStartScan()}
            disabled={isScanning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isScanning ? '#6366f1' : '#090d16',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isScanning ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(9, 13, 22, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? `Scraping (${scanProgress}%)...` : 'Rescan'}</span>
          </button>
        </div>
      </div>

      {/* Google Maps API Key Drawer Banner */}
      {isKeyModalOpen && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
              Google Maps Platform API Key
            </label>
            <input
              type="password"
              placeholder="Paste your AIzaSy... API key here"
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #94a3b8',
                borderRadius: '6px',
                fontSize: '12px',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          <button
            onClick={() => {
              setIsKeyModalOpen(false);
              setCaptureToast('Google Maps API Key saved for session!');
              setTimeout(() => setCaptureToast(null), 3000);
            }}
            style={{
              marginTop: '16px',
              padding: '7px 14px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Save Key
          </button>
        </div>
      )}

      {/* Discovery Lens Toggle Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        backgroundColor: '#f1f5f9',
        padding: '6px',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleModeChange('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: discoveryMode === 'ALL' ? '#ffffff' : 'transparent',
              color: discoveryMode === 'ALL' ? '#0f172a' : '#64748b',
              boxShadow: discoveryMode === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            All Targets ({businesses.length})
          </button>

          <button
            onClick={() => handleModeChange('DIGITAL_GAP')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: discoveryMode === 'DIGITAL_GAP' ? '#ffffff' : 'transparent',
              color: discoveryMode === 'DIGITAL_GAP' ? '#dc2626' : '#64748b',
              boxShadow: discoveryMode === 'DIGITAL_GAP' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={13} color={discoveryMode === 'DIGITAL_GAP' ? '#dc2626' : '#94a3b8'} />
            <span>🔴 Digital Gap Opportunities</span>
          </button>

          <button
            onClick={() => handleModeChange('ENTERPRISE')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: discoveryMode === 'ENTERPRISE' ? '#ffffff' : 'transparent',
              color: discoveryMode === 'ENTERPRISE' ? '#4f46e5' : '#64748b',
              boxShadow: discoveryMode === 'ENTERPRISE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={13} color={discoveryMode === 'ENTERPRISE' ? '#4f46e5' : '#94a3b8'} />
            <span>🟣 High-Growth Enterprises</span>
          </button>
        </div>

        {/* Issue Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Filter by Gap:</span>
          {[
            { id: 'ALL', label: 'All Issues' },
            { id: 'NO_WEBSITE', label: 'No Website' },
            { id: 'NO_ADS_PIXEL', label: 'No Ads/Pixel' },
            { id: 'NO_EMAIL_MARKETING', label: 'No Email Drips' },
            { id: 'UNCLAIMED_MAPS', label: 'Maps Gap' },
            { id: 'GENERIC_GMAIL', label: 'Gmail Account' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setIssueFilter(chip.id)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                border: issueFilter === chip.id ? '1px solid #cbd5e1' : '1px solid transparent',
                backgroundColor: issueFilter === chip.id ? '#ffffff' : 'transparent',
                color: issueFilter === chip.id ? '#0f172a' : '#64748b'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Banner */}
      {captureToast && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #6ee7b7',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 600,
          color: '#065f46',
          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} color="#059669" />
            <span>{captureToast}</span>
          </div>
          {onNavigateToOpportunities && (
            <button
              onClick={onNavigateToOpportunities}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: '#047857',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              <span>Open Opportunities Page</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Geospatial Coordinate Selector Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1px solid #e2e8f0'
      }}>
        {/* Region */}
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

        {/* Search Radius */}
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

        {/* Category Filter */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
            Industry / Category
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
            <option value="Healthcare">Healthcare & Specialized Medical</option>
            <option value="Logistics">Transportation & Haulage</option>
            <option value="Legal">Legal & Corporate Chambers</option>
            <option value="Hospitality">Hospitality & Luxury Spa</option>
            <option value="Automotive">Automotive Repairs & Fleet</option>
            <option value="Financial Technology">FinTech & Payments</option>
          </select>
        </div>
      </div>

      {/* 3-Column Split View: Map + Scrollable Prospect List + Full Audit Deep Dive Inspector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.9fr 1.1fr',
        gap: '16px',
        minHeight: '520px'
      }}>
        {/* 1. Map Canvas (Google Maps or Fallback Radar) */}
        <div style={{
          backgroundColor: '#090d16',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8)',
          minHeight: '400px'
        }}>
          {mapEngine === 'google' ? (
            <GoogleProspectingMap
              apiKey={googleApiKey}
              center={{ lat: activeZone.lat, lng: activeZone.lng }}
              radiusKm={radiusKm}
              businesses={filteredBusinesses}
              selectedBusinessId={activePin?.id || null}
              onSelectBusiness={(biz) => {
                setActivePin(biz);
                onSelectBusiness?.(biz);
              }}
            />
          ) : (
            /* Fallback Cyber Radar View */
            <>
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

              {/* Compass Rings */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                border: '1px dashed rgba(99, 102, 241, 0.3)',
                pointerEvents: 'none'
              }} />

              {/* Map Status Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 4,
                backgroundColor: 'rgba(9, 13, 22, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '5px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={12} color="#818cf8" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  {activeZone.name} ({radiusKm}km)
                </span>
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 800 }}>
                  ● {filteredBusinesses.length} Pins
                </span>
              </div>

              {/* Interactive Map Pins */}
              <div style={{ position: 'relative', flex: 1, zIndex: 5, padding: '30px' }}>
                {filteredBusinesses.map((biz, idx) => {
                  const positions = [
                    { top: '35%', left: '38%' },
                    { top: '55%', left: '65%' },
                    { top: '68%', left: '30%' },
                    { top: '25%', left: '72%' },
                    { top: '48%', left: '22%' },
                    { top: '78%', left: '55%' },
                    { top: '32%', left: '85%' }
                  ];
                  const pos = positions[idx % positions.length];
                  const isSelected = activePin?.id === biz.id;
                  const visuals = getPinVisuals(biz);

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
                        transition: 'all 0.2s ease',
                        zIndex: isSelected ? 10 : 5
                      }}
                    >
                      <div style={{
                        width: isSelected ? '38px' : '28px',
                        height: isSelected ? '38px' : '28px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? visuals.bg : '#0f172a',
                        border: `2px solid ${visuals.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 900,
                        boxShadow: isSelected ? `0 0 20px ${visuals.bg}` : '0 0 8px rgba(0,0,0,0.6)'
                      }}>
                        {biz.opportunityScore}
                      </div>

                      <div style={{
                        marginTop: '4px',
                        backgroundColor: 'rgba(9, 13, 22, 0.9)',
                        color: '#ffffff',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '2px 5px',
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
            </>
          )}
        </div>

        {/* 2. Middle Column: Discovered Prospect List */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
          maxHeight: '620px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
              Prospects in Radius ({filteredBusinesses.length})
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Click to audit</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredBusinesses.map((biz) => {
              const isSelected = activePin?.id === biz.id;
              const visuals = getPinVisuals(biz);

              return (
                <div
                  key={biz.id}
                  onClick={() => {
                    setActivePin(biz);
                    onSelectBusiness?.(biz);
                  }}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: isSelected ? `2px solid ${visuals.bg}` : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {biz.name}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {biz.category}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: isSelected ? visuals.bg : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#334155',
                      padding: '2px 6px',
                      borderRadius: '6px'
                    }}>
                      {biz.targetType === 'ENTERPRISE' ? 'Enterprise' : `Gap: ${biz.digitalAudit.gapScore}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>
                      Est. Value: ${biz.digitalAudit.recommendedPackage.estimatedValue.max.toLocaleString()}
                    </span>
                    <ChevronRight size={14} color={isSelected ? visuals.bg : '#94a3b8'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Right Column: Deep Audit Package & Proposal Pitch Kit Inspector */}
        {activePin ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            overflowY: 'auto',
            maxHeight: '620px'
          }}>
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      {activePin.district}
                    </span>
                    <span style={{
                      fontSize: '9.5px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      backgroundColor: activePin.targetType === 'ENTERPRISE' ? '#eef2ff' : '#fee2e2',
                      color: activePin.targetType === 'ENTERPRISE' ? '#4f46e5' : '#dc2626'
                    }}>
                      {activePin.targetType === 'ENTERPRISE' ? 'Growth Signal' : `Gap Priority: ${activePin.digitalAudit.fixPriority}`}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
                    {activePin.name}
                  </h3>
                </div>

                <div style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 900
                }}>
                  {activePin.opportunityScore}/100 Fit
                </div>
              </div>

              {/* Before vs After Digital Maturity Score Board */}
              <div style={{
                backgroundColor: '#090d16',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '10px 12px',
                margin: '8px 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} />
                    <span>Digital Transformation Opportunity</span>
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>
                    Current: {activePin.digitalAudit.beforeAfterScores.current.total}/100 → Potential: {activePin.digitalAudit.beforeAfterScores.potential.total}/100
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '10px', textAlign: 'center' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>Website</span>
                    <strong>{activePin.digitalAudit.digitalMaturity.website}/25</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>Maps/SEO</span>
                    <strong>{activePin.digitalAudit.digitalMaturity.localPresence + activePin.digitalAudit.digitalMaturity.localSeo}/35</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>Conversion</span>
                    <strong>{activePin.digitalAudit.digitalMaturity.conversionTools}/20</strong>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8', display: 'block' }}>Ads/Drip</span>
                    <strong>{activePin.digitalAudit.digitalMaturity.adsAndTracking + activePin.digitalAudit.digitalMaturity.emailMarketing}/30</strong>
                  </div>
                </div>
              </div>

              {/* Detected Problems Checklist */}
              <div style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                padding: '10px',
                margin: '8px 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9f1239', fontWeight: 800, fontSize: '11.5px', marginBottom: '4px' }}>
                  <ShieldAlert size={13} />
                  <span>Detected Commercial Problems ({activePin.digitalAudit.issuesDetected.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activePin.digitalAudit.issuesDetected.slice(0, 3).map((iss: any) => (
                    <div key={iss.id} style={{ fontSize: '11px', color: '#881337' }}>
                      <strong>• {iss.title}:</strong> {iss.description}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Package Box */}
              <div style={{
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '8px',
                padding: '10px',
                margin: '8px 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9' }}>
                    {activePin.digitalAudit.recommendedPackage.packageName}
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: 900, color: '#4338ca' }}>
                    ${activePin.digitalAudit.recommendedPackage.estimatedValue.max.toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '10.5px', color: '#4c1d95', margin: '0 0 6px 0' }}>
                  {activePin.digitalAudit.recommendedPackage.description}
                </p>
              </div>

              {/* Multi-Channel Pitch Engine Tabs */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 10px',
                margin: '6px 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['email', 'linkedin', 'call'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActivePitchTab(tab)}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: activePitchTab === tab ? '#4f46e5' : '#f1f5f9',
                          color: activePitchTab === tab ? '#ffffff' : '#64748b'
                        }}
                      >
                        {tab === 'email' ? 'Email Pitch' : tab === 'linkedin' ? 'LinkedIn' : 'Cold Call'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCopyText(
                      activePitchTab === 'email' 
                        ? activePin.digitalAudit.pitchAngles.emailPitch 
                        : activePitchTab === 'linkedin' 
                        ? activePin.digitalAudit.pitchAngles.linkedInPitch 
                        : activePin.digitalAudit.pitchAngles.salesCallOpener
                    )}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366f1',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Copy size={11} />
                    <span>{copiedPitch ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '10.5px', color: '#334155', fontStyle: 'italic', margin: 0, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                  {activePitchTab === 'email' 
                    ? activePin.digitalAudit.pitchAngles.emailPitch 
                    : activePitchTab === 'linkedin' 
                    ? activePin.digitalAudit.pitchAngles.linkedInPitch 
                    : activePin.digitalAudit.pitchAngles.salesCallOpener}
                </p>
              </div>

              {/* Physical Address & Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#334155', margin: '6px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} color="#6366f1" style={{ flexShrink: 0 }} />
                  <span>{activePin.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={12} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>{activePin.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={12} color="#2563eb" style={{ flexShrink: 0 }} />
                  {activePin.website ? (
                    <a href={activePin.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                      {activePin.domain}
                    </a>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>No Website Registered</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Group */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <button
                onClick={() => handleAddDeal(activePin)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: addedDealId === activePin.id ? '#059669' : '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                {addedDealId === activePin.id ? <Check size={13} /> : <Send size={13} />}
                <span>{addedDealId === activePin.id ? 'Pushed to CRM!' : `Push to Pipeline ($${activePin.digitalAudit.recommendedPackage.estimatedValue.max.toLocaleString()})`}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
