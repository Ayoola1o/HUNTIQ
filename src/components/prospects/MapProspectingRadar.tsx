import React, { useState } from 'react';
import { 
  Crosshair, 
  Zap, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  ChevronRight, 
  Search, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { 
  GEO_LOCATION_PRESETS,
  MOCK_GEO_BUSINESSES 
} from '../../data/mockGeoBusinesses';
import type { GeoScrapedBusiness } from '../../engine/geoScraperEngine';
import { useHuntiq } from '../../context/HuntiqContext';
import { geoapifyService } from '../../services/geoapifyService';
import { MapLibreProspectingMap } from './MapLibreProspectingMap';
import { AuditDetailDrawer } from './AuditDetailDrawer';

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

  // Location State
  const [selectedZoneId, setSelectedZoneId] = useState('lagos');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 6.4541, lng: 3.4246 });
  const [mapZoom, setMapZoom] = useState(12);
  const [currentBounds, setCurrentBounds] = useState<{ west: number; south: number; east: number; north: number } | null>(null);

  // Filters & Controls
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('All Industries');
  const [discoveryMode, setDiscoveryMode] = useState<'ALL' | 'ENTERPRISE' | 'DIGITAL_GAP'>('ALL');
  const [gapFilter, setGapFilter] = useState<string>('ALL');

  // Business Records & Selection State
  const [businesses, setBusinesses] = useState<GeoScrapedBusiness[]>(MOCK_GEO_BUSINESSES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectedBusiness, setInspectedBusiness] = useState<GeoScrapedBusiness | null>(null);

  // Status & Telemetry
  const [isSearching, setIsSearching] = useState(false);
  const [captureToast, setCaptureToast] = useState<string | null>(null);

  // 1. Initial Discovery on mount
  React.useEffect(() => {
    let isMounted = true;
    geoapifyService.discoverPlacesInBounds(null, mapCenter, radiusKm, selectedCategory, discoveryMode)
      .then(results => {
        if (isMounted) setBusinesses(results);
      });
    return () => { isMounted = false; };
  }, []);

  // 2. Handle Preset Zone Change
  const handlePresetChange = async (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const preset = GEO_LOCATION_PRESETS.find(p => p.id === zoneId);
    if (preset) {
      const newCenter = { lat: preset.lat, lng: preset.lng };
      setMapCenter(newCenter);
      setMapZoom(preset.zoom);
      setIsSearching(true);
      const results = await geoapifyService.discoverPlacesInBounds(
        null,
        newCenter,
        radiusKm,
        selectedCategory,
        discoveryMode
      );
      setBusinesses(results);
      setIsSearching(false);
    }
  };

  // 3. Handle Location Search (Geocoding)
  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const result = await geoapifyService.geocodeLocation(searchQuery);
    const newCenter = { lat: result.lat, lng: result.lng };
    setMapCenter(newCenter);
    setMapZoom(result.zoom);

    const results = await geoapifyService.discoverPlacesInBounds(
      null,
      newCenter,
      radiusKm,
      selectedCategory,
      discoveryMode
    );
    setBusinesses(results);
    setIsSearching(false);
  };

  // 4. Search This Area (Reads Viewport Bounds)
  const handleSearchThisArea = async () => {
    setIsSearching(true);
    const results = await geoapifyService.discoverPlacesInBounds(
      currentBounds,
      mapCenter,
      radiusKm,
      selectedCategory,
      discoveryMode
    );
    setBusinesses(results);
    setIsSearching(false);
  };

  // 4. Filtering Logic
  const filteredBusinesses = businesses.filter((b) => {
    // Mode Filter
    if (discoveryMode === 'ENTERPRISE' && b.targetType !== 'ENTERPRISE') return false;
    if (discoveryMode === 'DIGITAL_GAP' && b.targetType === 'ENTERPRISE' && b.digitalAudit.gapScore < 60) return false;

    // Category Filter
    if (selectedCategory !== 'All Industries' && !b.category.toLowerCase().includes(selectedCategory.toLowerCase())) return false;

    // Gap Filter Chips
    if (gapFilter === 'NO_WEBSITE') return b.digitalAudit.digitalMaturity.website === 0;
    if (gapFilter === 'GOOGLE_GAP') return b.digitalAudit.digitalMaturity.localPresence < 10;
    if (gapFilter === 'OUTDATED_HTTP') return b.digitalAudit.digitalMaturity.website > 0 && b.digitalAudit.digitalMaturity.website < 18;
    if (gapFilter === 'GENERIC_GMAIL') return b.digitalAudit.digitalMaturity.emailCredibility < 5;
    if (gapFilter === 'NO_BOOKING') return b.digitalAudit.digitalMaturity.conversionTools < 10;
    if (gapFilter === 'NO_LEAD_FORM') return b.digitalAudit.digitalMaturity.conversionTools === 0;
    if (gapFilter === 'LOW_SEO') return b.digitalAudit.digitalMaturity.localSeo < 10;
    if (gapFilter === 'NO_ADS_PIXEL') return b.digitalAudit.digitalMaturity.adsAndTracking <= 5;

    return true;
  });

  // 5. Selection Handlers
  const toggleSelectBusiness = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllInView = () => {
    const allIds = new Set(filteredBusinesses.map(b => b.id));
    setSelectedIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // 6. Capture Actions
  const handleCaptureSelected = () => {
    const selectedList = filteredBusinesses.filter(b => selectedIds.has(b.id));
    if (selectedList.length === 0) return;

    captureGeoBusinesses(selectedList);
    setCaptureToast(`Captured ${selectedList.length} selected prospects to Opportunities!`);
    setTimeout(() => setCaptureToast(null), 4500);
  };

  const handleCaptureViewport = () => {
    if (filteredBusinesses.length === 0) return;

    captureGeoBusinesses(filteredBusinesses);
    setCaptureToast(`Captured all ${filteredBusinesses.length} prospects in viewport to Opportunities!`);
    setTimeout(() => setCaptureToast(null), 4500);
  };

  const handlePushDeal = (biz: GeoScrapedBusiness) => {
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
      contactName: biz.decisionMakers[0]?.name || 'Managing Director',
      contactRole: biz.decisionMakers[0]?.role || 'Owner',
      nextAction: biz.digitalAudit.pitchAngles.salesCallOpener
    });
    onAddToPipeline?.(biz);
    setCaptureToast(`Promoted ${biz.name} ($${dealValue.toLocaleString()}) to CRM Pipeline!`);
    setTimeout(() => setCaptureToast(null), 4000);
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
      {/* Header & Title */}
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
              <span>LIVE GEO RADAR</span>
              <span style={{ fontSize: '10px', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #a7f3d0', fontWeight: 800 }}>
                MapLibre GL + OpenStreetMap
              </span>
              {geoapifyService.isLiveApiAvailable() ? (
                <span style={{ fontSize: '10px', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #a7f3d0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  LIVE DATA ACTIVE
                </span>
              ) : (
                <span style={{ fontSize: '10px', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #fde68a', fontWeight: 800 }}>
                  OFFLINE DATA
                </span>
              )}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Real-time commercial discovery powered by Geoapify & OpenStreetMap with automated digital gap auditing.
            </p>
          </div>
        </div>

        {/* Search This Area & Quick Preset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedZoneId}
            onChange={(e) => handlePresetChange(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: '#f8fafc',
              color: '#334155'
            }}
          >
            {GEO_LOCATION_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.country})</option>
            ))}
          </select>

          <button
            onClick={handleSearchThisArea}
            disabled={isSearching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#090d16',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isSearching ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            <RefreshCw size={13} className={isSearching ? 'animate-spin' : ''} />
            <span>{isSearching ? 'Scanning Area...' : 'Search This Area'}</span>
          </button>
        </div>
      </div>

      {/* Location Search Bar & Controls */}
      <form onSubmit={handleSearchLocation} style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search any city, town, address, neighborhood (e.g. Lekki Phase 1, Wuse 2, Sandton, Westlands)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '9px 18px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
          }}
        >
          Locate
        </button>
      </form>

      {/* Mode & Radius Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        backgroundColor: '#f1f5f9',
        padding: '8px 12px',
        borderRadius: '10px'
      }}>
        {/* Prospecting Mode */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'ALL', label: 'All Targets' },
            { id: 'HIGH-GROWTH', label: 'High-Growth' },
            { id: 'DIGITAL_GAP', label: 'Digital Gap' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setDiscoveryMode(m.id === 'HIGH-GROWTH' ? 'ENTERPRISE' : m.id as any)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: (discoveryMode === 'ENTERPRISE' && m.id === 'HIGH-GROWTH') || discoveryMode === m.id ? '#ffffff' : 'transparent',
                color: (discoveryMode === 'ENTERPRISE' && m.id === 'HIGH-GROWTH') || discoveryMode === m.id ? '#0f172a' : '#64748b',
                boxShadow: (discoveryMode === 'ENTERPRISE' && m.id === 'HIGH-GROWTH') || discoveryMode === m.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Radius Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>Radius:</span>
          {[1, 5, 10, 25, 50].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                border: radiusKm === r ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                backgroundColor: radiusKm === r ? '#4f46e5' : '#ffffff',
                color: radiusKm === r ? '#ffffff' : '#475569'
              }}
            >
              {r} km
            </button>
          ))}
        </div>

        {/* Industry Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>Industry:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '11.5px',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="All Industries">All Industries</option>
            <option value="Healthcare">Healthcare & Medical</option>
            <option value="Logistics">Transportation & Logistics</option>
            <option value="Legal">Legal & Advisory</option>
            <option value="Hospitality">Hotels & Spas</option>
            <option value="Automotive">Automotive & Garages</option>
            <option value="Financial Technology">FinTech</option>
          </select>
        </div>
      </div>

      {/* Digital Gap Filter Chips */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Filter by Gap:</span>
        {[
          { id: 'ALL', label: 'All Issues' },
          { id: 'NO_WEBSITE', label: 'No Website' },
          { id: 'GOOGLE_GAP', label: 'Google Gap' },
          { id: 'OUTDATED_HTTP', label: 'Outdated/Insecure' },
          { id: 'GENERIC_GMAIL', label: 'Generic Email' },
          { id: 'NO_BOOKING', label: 'No Booking' },
          { id: 'NO_LEAD_FORM', label: 'No Lead Form' },
          { id: 'LOW_SEO', label: 'Low SEO' },
          { id: 'NO_ADS_PIXEL', label: 'No Ads/Pixel' }
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setGapFilter(chip.id)}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: gapFilter === chip.id ? '1px solid #4f46e5' : '1px solid #e2e8f0',
              backgroundColor: gapFilter === chip.id ? '#eef2ff' : '#ffffff',
              color: gapFilter === chip.id ? '#4f46e5' : '#64748b'
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Notification Toast */}
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
              <span>View in Opportunities</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Selection Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        padding: '8px 14px',
        borderRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
            Selected: <strong style={{ color: '#4f46e5' }}>{selectedIds.size}</strong> of {filteredBusinesses.length}
          </span>
          <button
            onClick={handleSelectAllInView}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Select All
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleClearSelection}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Clear Selection
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCaptureSelected}
            disabled={selectedIds.size === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: selectedIds.size > 0 ? '#4f46e5' : '#e2e8f0',
              color: selectedIds.size > 0 ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '7px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            <Zap size={13} />
            <span>Capture Selected ({selectedIds.size})</span>
          </button>

          <button
            onClick={handleCaptureViewport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              borderRadius: '7px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Check size={13} />
            <span>Capture Viewport ({filteredBusinesses.length})</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout: Map + Prospect Sidebar List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '16px',
        minHeight: '520px'
      }}>
        {/* Left: MapLibre Interactive Map */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', minHeight: '500px' }}>
          <MapLibreProspectingMap
            center={mapCenter}
            zoom={mapZoom}
            radiusKm={radiusKm}
            businesses={filteredBusinesses}
            selectedBusinessId={inspectedBusiness?.id || null}
            selectedBusinessIds={selectedIds}
            onSelectBusiness={(biz) => {
              setInspectedBusiness(biz);
              onSelectBusiness?.(biz);
            }}
            onBoundsChange={(b) => setCurrentBounds(b)}
          />
        </div>

        {/* Right: Prospect Cards Sidebar */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
          maxHeight: '560px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
              Prospects ({filteredBusinesses.length})
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Click to view audit
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredBusinesses.map((biz) => {
              const isChecked = selectedIds.has(biz.id);
              const isInspected = inspectedBusiness?.id === biz.id;
              const visuals = getPinVisuals(biz);

              return (
                <div
                  key={biz.id}
                  onClick={() => {
                    setInspectedBusiness(biz);
                    onSelectBusiness?.(biz);
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: isInspected ? `2px solid ${visuals.bg}` : isChecked ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: isInspected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {/* Checkbox */}
                    <div
                      onClick={(e) => toggleSelectBusiness(biz.id, e)}
                      style={{ cursor: 'pointer', marginTop: '2px' }}
                    >
                      {isChecked ? (
                        <CheckSquare size={16} color="#4f46e5" fill="#eef2ff" />
                      ) : (
                        <Square size={16} color="#94a3b8" />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {biz.name}
                        </h4>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          backgroundColor: visuals.bg,
                          color: '#ffffff',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}>
                          {biz.targetType === 'ENTERPRISE' ? 'Growth' : `Gap: ${biz.digitalAudit.gapScore}`}
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 6px 0' }}>
                        {biz.category} • {biz.district}
                      </div>

                      {/* Top Problem / Signal */}
                      <div style={{
                        fontSize: '11px',
                        color: biz.targetType === 'ENTERPRISE' ? '#4338ca' : '#9f1239',
                        backgroundColor: biz.targetType === 'ENTERPRISE' ? '#eef2ff' : '#fff1f2',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginBottom: '6px'
                      }}>
                        <strong>{biz.targetType === 'ENTERPRISE' ? 'Growth Signal: ' : 'Top Gap: '}</strong>
                        {biz.targetType === 'ENTERPRISE' ? biz.detectedSignals[0] : biz.digitalAudit.issuesDetected[0]?.title || 'No Website'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 800 }}>
                          Est: ${biz.digitalAudit.recommendedPackage.estimatedValue.max.toLocaleString()}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4f46e5', fontSize: '11px', fontWeight: 700 }}>
                          <span>View Audit</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide-out Audit Detail Drawer */}
      <AuditDetailDrawer
        business={inspectedBusiness}
        onClose={() => setInspectedBusiness(null)}
        onCaptureOpportunity={(b) => {
          captureGeoBusinesses([b]);
          setCaptureToast(`Captured ${b.name} to Opportunities!`);
          setTimeout(() => setCaptureToast(null), 4000);
        }}
        onPushToPipeline={handlePushDeal}
      />
    </div>
  );
};
