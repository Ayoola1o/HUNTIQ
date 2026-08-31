# HUNTIQ — Prototype Live Geo Radar with MapLibre + Geoapify/OpenStreetMap

## OBJECTIVE

Implement a fully functional prototype of **Live Geo Radar** inside the existing HUNTIQ application.

The Live Geo Radar is a geographic prospecting interface that allows users to:

1. Search for any city, location, address, or business area.
2. Display that location on an interactive map.
3. Discover nearby businesses using **Geoapify Places API backed by OpenStreetMap data**.
4. Display discovered businesses as interactive custom map markers.
5. Classify prospects according to their digital opportunity/digital gap.
6. Filter prospects by digital problems.
7. Click a prospect to inspect a Digital Audit.
8. Select individual prospects or all prospects in the current map viewport.
9. Capture selected businesses as HUNTIQ Opportunities.
10. Push captured opportunities toward the existing CRM Pipeline.
11. Preserve compatibility with the existing HUNTIQ Find Prospects, Opportunities, Pipeline, Outreach, and Dashboard architecture.

This is a **prototype**, so prioritize a clean, functional, realistic implementation over production-grade external integrations.

---

# IMPORTANT DEVELOPMENT RULES

## 1. INSPECT THE EXISTING CODEBASE FIRST

Before writing code:

- Inspect the existing project structure.
- Identify the current React/Vite/TypeScript architecture.
- Locate the existing:
  - `FindProspectsPage`
  - `MapProspectingRadar`
  - `HuntiqContext`
  - `geoScraperEngine`
  - Opportunities components
  - Pipeline components
  - prospect types/interfaces
  - API routes
  - styling system
  - reusable buttons, cards, drawers, badges, modals, tabs, and inputs.
- Reuse existing components and styles wherever practical.
- Do NOT create duplicate state-management systems.
- Do NOT replace existing architecture unnecessarily.
- Do NOT break existing Find Prospects functionality.

If an existing component already performs part of this function, extend it instead of creating a competing implementation.

---

# 2. TECHNOLOGY STACK

Use:

### Frontend

- React
- TypeScript
- Vite
- Existing HUNTIQ styling system
- MapLibre GL JS

### Geographic data

- OpenStreetMap-based data
- Geoapify Places API
- Geoapify Geocoding API

### State

Use the existing HUNTIQ context/state architecture.

Do not introduce Redux, Zustand, or another state library unless the existing application already uses it.

---

# 3. MAPLIBRE IMPLEMENTATION

Install/use:

```bash
maplibre-gl
```

Create or update:

```text
src/components/prospects/MapProspectingRadar.tsx
```

The map should use MapLibre GL JS.

Do NOT use:

- Google Maps
- Google Maps JavaScript API
- Leaflet

for this prototype.

MapLibre is the map rendering layer.

Geoapify/OpenStreetMap supplies geographic/place data.

---

# 4. GEOAPIFY CONFIGURATION

Support environment variables:

```env
VITE_GEOAPIFY_API_KEY=
VITE_GEOAPIFY_MAP_STYLE=
```

Do NOT hardcode API keys into source code.

If the API key is missing, the application must NOT crash.

Instead display a useful development message:

```text
Geo Radar API configuration required.

Add VITE_GEOAPIFY_API_KEY to your environment configuration.
```

For local development, provide a safe fallback/demo mode.

---

# 5. DEMO MODE

The prototype must work even when no Geoapify API key is available.

Create:

```text
src/data/mockGeoBusinesses.ts
```

Populate it with realistic demonstration businesses across:

- Lagos
- Abuja
- Benin City
- Port Harcourt
- Nairobi
- Johannesburg
- London

Use fictional/demo businesses rather than presenting invented businesses as real companies.

Examples:

```text
Premier Health Clinic
Apex Logistics Hub
Crown Legal Advisory
Heritage Grand Hotel
Grandeur Auto Services
Metro Dental Centre
Prime Education Consult
Urban Foods Market
```

Clearly mark the application as:

```text
DEMO DATA
```

when mock data is being used.

The user should be able to prototype the entire Geo Radar experience without an API key.

---

# 6. FIND PROSPECTS INTEGRATION

The existing Find Prospects page should have these primary tabs:

```text
AI Search
Advanced Filters
Live Geo Radar
```

If those tabs already exist, preserve them.

The Live Geo Radar tab should load:

```text
MapProspectingRadar
```

---

# 7. LIVE GEO RADAR LAYOUT

Build a professional SaaS-style interface.

Recommended structure:

```text
┌───────────────────────────────────────────────────────────────┐
│ LIVE GEO RADAR                                                │
│ Discover businesses and identify digital opportunities       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ [ Search city, area, address or postcode             ] [🔍]   │
│                                                               │
│ [All Targets] [High-Growth] [Digital Gap]                    │
│                                                               │
│ [No Website] [Google Gap] [Outdated/Insecure] [Generic Email]│
│ [No Booking] [Poor Mobile] [Low SEO]                         │
│                                                               │
├───────────────────────────────────────────────┬───────────────┤
│                                               │ PROSPECTS     │
│                                               │               │
│                                               │ 24 found      │
│                                               │               │
│                 MAP                           │ 🔴 Business A │
│                                               │ Gap: 89       │
│          🔴          🟠                        │               │
│                                               │ 🟠 Business B │
│      🟣                 🔴                    │ Gap: 67       │
│                                               │               │
│              🟢                               │ 🟣 Company C  │
│                                               │ Growth        │
│       🟠                     🟢               │               │
│                                               │               │
├───────────────────────────────────────────────┴───────────────┤
│ Selected: 4       [Capture Selected] [Capture Viewport]       │
└───────────────────────────────────────────────────────────────┘
```

The interface must be responsive.

---

# 8. LOCATION SEARCH

The user must be able to enter:

- City
- Town
- Country
- Address
- Neighborhood
- Postcode
- Landmark

Examples:

```text
Lagos
Lekki Phase 1
Abuja
Wuse 2
Benin City
Victoria Island
Nairobi
London
```

Use Geoapify Geocoding API to resolve the location.

When the location is resolved:

1. Move the map to the location.
2. Set an appropriate zoom level.
3. Store the selected coordinates in state.
4. Allow the user to run prospect discovery.

Do NOT hardcode Lagos.

Lagos should only be the initial/default demonstration location if appropriate.

---

# 9. MAP CONTROLS

Provide:

```text
Location Search
Radius
Industry
Prospecting Mode
Search This Area
```

Radius options:

```text
1 km
5 km
10 km
25 km
50 km
```

Default:

```text
10 km
```

Industry options:

```text
All Industries
Restaurants
Hotels
Healthcare
Legal
Education
Real Estate
Logistics
Automotive
Retail
Professional Services
Technology
Other
```

---

# 10. SEARCH THIS AREA

Add a button:

```text
Search This Area
```

When clicked:

1. Read the current map viewport/bounds.
2. Send the geographic bounds to the prospect discovery engine.
3. Retrieve businesses in that area.
4. Run the digital opportunity classification.
5. Render the results.

This allows the user to:

```text
Search Lagos
↓
Zoom into Lekki
↓
Move map
↓
Click Search This Area
↓
Discover businesses in current viewport
```

---

# 11. PROSPECTING MODES

Provide three modes:

```text
ALL TARGETS
HIGH-GROWTH
DIGITAL GAP
```

## ALL TARGETS

Show both:

- High-growth companies
- Digital gap businesses

## HIGH-GROWTH

Show businesses with growth indicators such as:

- Hiring surge
- Executive hiring
- Expansion
- Funding
- Growth signal

For prototype purposes, use mock growth data.

## DIGITAL GAP

Show businesses with digital weaknesses.

---

# 12. DIGITAL GAP FILTERS

Create filter chips:

```text
No Website
Unclaimed Google Profile
Outdated / Insecure
Generic Email
No Booking
No Lead Form
Poor Mobile
Low SEO
Inactive Social
```

Filters must dynamically update:

- Map markers
- Prospect list
- Prospect count
- Selected count

Multiple filters should be combinable.

---

# 13. GEO BUSINESS DATA MODEL

Create/update:

```typescript
export interface GeoScrapedBusiness {
  id: string;

  placeId?: string;

  name: string;

  category: string;

  address: string;

  city?: string;

  country?: string;

  latitude: number;

  longitude: number;

  phone?: string;

  website?: string;

  email?: string;

  rating?: number;

  reviewCount?: number;

  source: "GEOAPIFY" | "OPENSTREETMAP" | "DEMO";

  opportunityType:
    | "HIGH_GROWTH"
    | "DIGITAL_GAP"
    | "STANDARD";

  growthScore?: number;

  digitalAudit: DigitalAuditPackage;
}
```

---

# 14. DIGITAL AUDIT MODEL

Create:

```typescript
export interface DigitalAuditPackage {
  overallScore: number;

  gapScore: number;

  fixPriority:
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW";

  issuesDetected: DigitalIssue[];

  recommendedPackage: {
    name: string;
    minValue: number;
    maxValue: number;
    currency: string;
  };

  pitchAngle: string;

  conversionProbability: number;

  recommendedNextAction:
    | "CALL"
    | "EMAIL"
    | "LINKEDIN"
    | "WHATSAPP"
    | "RESEARCH";
}
```

Create:

```typescript
export interface DigitalIssue {
  id: string;

  category:
    | "WEBSITE"
    | "LOCAL_PRESENCE"
    | "EMAIL"
    | "CONVERSION"
    | "SOCIAL"
    | "SEO";

  severity:
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW";

  title: string;

  description: string;

  businessImpact: string;

  recommendedFix: string;
}
```

---

# 15. DIGITAL GAP SCORE

Calculate a score from:

```text
0–20     Digitally Optimized
21–40    Minor Opportunity
41–60    Moderate Gap
61–80    High Digital Gap
81–100   Critical Digital Gap
```

Use these categories:

```text
Website Quality       25%
Local Presence        15%
Email Credibility     10%
Conversion Tools      20%
Social Presence       10%
Local SEO             20%
```

Calculate:

```text
Digital Gap Score = 100 - Digital Maturity Score
```

For demo data, intentionally create varied businesses.

---

# 16. MAP MARKERS

Use MapLibre custom markers.

Do NOT use default generic pins.

Marker colors:

```text
Violet = High-Growth Enterprise

Red = Critical Digital Gap

Orange = High Digital Gap

Yellow = Moderate Digital Gap

Green = Digitally Optimized
```

Markers must be visually distinct.

Recommended marker content:

```text
●
```

with a subtle glow/pulse for critical prospects.

Do not make animations excessive.

---

# 17. MARKER CLICK

When the user clicks a marker:

Open the HUNTIQ Audit Detail Drawer.

Example:

```text
PREMIER HEALTH CLINIC

Digital Gap Score
87 / 100

Priority
CRITICAL

Detected Issues

🔴 No Website
🔴 No Booking System
🟠 Generic Email
🟠 Weak Local SEO

Estimated Opportunity

$3,500 – $7,500

Conversion Probability

74%

Recommended Package

High-Converting Website
+ Local SEO
+ Online Booking

[View Full Audit]

[Capture Opportunity]

[Push to Pipeline]
```

---

# 18. AUDIT DETAIL DRAWER

Create/update:

```text
src/components/prospects/AuditDetailDrawer.tsx
```

Sections:

### Overview

- Business name
- Industry
- Location
- Digital Gap Score
- Priority
- Estimated opportunity
- Conversion probability

### Detected Issues

Show every issue with:

- Severity
- Problem
- Business impact
- Recommended fix

### Score Breakdown

Show:

```text
Website
Local Presence
Email
Conversion
Social
SEO
```

with visual progress bars.

### Recommended Package

Show:

- Package name
- Minimum estimated value
- Maximum estimated value
- Reason for recommendation

### Pitch Angle

Display generated outreach language.

---

# 19. BEFORE/AFTER DIGITAL SCORE

The audit drawer should show:

```text
CURRENT DIGITAL SCORE
22 / 100
```

and:

```text
POTENTIAL SCORE
88 / 100
```

Visualize the improvement.

This helps demonstrate why the prospect is valuable.

---

# 20. PROSPECT SIDEBAR

Create a right-hand prospect list.

Each card should show:

```text
Business Name
Industry
Location

Digital Gap: 87
Priority: Critical

Top Issue:
No Website

Estimated Value:
$3,500–$7,500

[View Audit]
```

For high-growth businesses:

```text
Business Name

Growth Score: 88

Hiring Surge
Executive Hiring

[View Prospect]
```

---

# 21. SELECTION SYSTEM

Allow users to select individual businesses.

Each prospect card should have a checkbox.

Map markers should visually indicate selected state.

Top action bar:

```text
Selected: 6

[Capture Selected]
[Capture Viewport]
[Clear Selection]
```

---

# 22. CAPTURE VIEWPORT

When the user clicks:

```text
Capture Viewport
```

capture only the businesses currently visible inside the map viewport.

Do not capture businesses outside the current bounds.

Show confirmation:

```text
12 prospects captured successfully.
```

---

# 23. CAPTURE TO OPPORTUNITIES

Integrate with the existing HUNTIQ context.

Use:

```typescript
captureGeoBusinesses(
  businesses: GeoScrapedBusiness[]
)
```

This should:

1. Deduplicate existing businesses.
2. Create/update company records.
3. Create opportunity records.
4. Attach the Digital Audit.
5. Preserve source:

```text
GEO_RADAR
```

6. Preserve opportunity type:

```text
DIGITAL_GAP
```

or:

```text
HIGH_GROWTH
```

7. Update the Opportunities UI.

Do not create duplicate opportunities when the same business is captured twice.

---

# 24. OPPORTUNITY DATA

Captured opportunities should contain:

```typescript
{
  source: "GEO_RADAR",

  opportunityType: "DIGITAL_GAP",

  digitalGapScore: 87,

  digitalAudit: {...},

  estimatedValue: 5500,

  conversionProbability: 74
}
```

Display badges:

```text
GEO RADAR
DIGITAL GAP
CRITICAL
```

---

# 25. PUSH TO PIPELINE

Provide:

```text
Push to Pipeline
```

When clicked:

1. Create/update CRM pipeline record.
2. Set initial pipeline stage.
3. Preserve audit information.
4. Preserve estimated deal value.
5. Preserve opportunity score.
6. Show success notification.

Recommended stage mapping:

```text
Critical Digital Gap
→ Qualified Opportunity

High Digital Gap
→ New Prospect

Moderate Gap
→ Research Required

High-Growth Enterprise
→ Strategic Target
```

---

# 26. OUTREACH CONNECTION

Add:

```text
Start Outreach
```

to the audit drawer and opportunity card.

When clicked, pass the Digital Audit context to the existing Outreach system.

The generated outreach context should include:

```text
Business Name
Industry
Location
Primary Digital Gap
Business Impact
Recommended Solution
Estimated Value
Pitch Angle
```

Do not implement a completely separate outreach system if one already exists.

Reuse the existing Outreach functionality.

---

# 27. GEOAPIFY API SERVICE

Create:

```text
src/services/geoapifyService.ts
```

Functions:

```typescript
searchPlaces()
geocodeLocation()
reverseGeocode()
```

Example conceptual interface:

```typescript
export async function geocodeLocation(
  query: string
): Promise<GeoCoordinates>
```

and:

```typescript
export async function searchPlaces(
  options: GeoSearchOptions
): Promise<GeoScrapedBusiness[]>
```

Keep all API-specific logic inside the service.

Do not spread Geoapify URLs throughout React components.

---

# 28. BACKEND PROXY

If the existing HUNTIQ architecture has a backend, prefer routing Geoapify requests through the backend where appropriate.

Create/update:

```text
server/routes/prospects.ts
```

Possible endpoints:

```text
POST /api/prospects/geo/geocode
POST /api/prospects/geo/search
POST /api/prospects/geo/audit
POST /api/prospects/capture
```

The frontend should communicate with HUNTIQ's API rather than scattering external API calls throughout the UI.

---

# 29. DEMO FALLBACK

If Geoapify is unavailable:

```text
Geoapify unavailable
↓
Use demo dataset
↓
Continue showing the map
↓
Continue Digital Audit
↓
Continue Opportunities
↓
Continue Pipeline
```

The application must remain usable.

Show:

```text
Demo Geo Data
```

in the interface so the user knows the source.

---

# 30. API ERROR HANDLING

Handle:

- Invalid API key
- Rate limit
- Network error
- Empty results
- Invalid location
- No businesses found
- API timeout

Do not allow errors to crash the page.

Examples:

```text
No businesses found in this area.

Try:
• Increasing the search radius
• Changing the category
• Moving the map
```

---

# 31. EMPTY STATES

Create professional empty states.

Example:

```text
No Digital Gap Prospects Found

Try:
• Increasing the radius
• Removing a filter
• Selecting another industry
• Searching another location
```

---

# 32. LOADING STATES

When searching:

```text
Discovering businesses...
Analyzing digital presence...
Scoring opportunities...
```

Use a professional loading state.

Do not freeze the interface.

---

# 33. MAP CLUSTERING

If many businesses appear in a small area, use marker clustering.

For example:

```text
        ┌─────┐
        │  42 │
        └─────┘
```

Clicking the cluster should zoom into the businesses.

Do not render hundreds of overlapping markers without clustering.

---

# 34. LEGEND

Add a map legend:

```text
● Violet   High Growth
● Red      Critical Gap
● Orange   High Gap
● Yellow   Moderate Gap
● Green    Optimized
```

---

# 35. MAP STYLE

The map should visually match HUNTIQ's existing SaaS dashboard.

If HUNTIQ has a dark theme, use an appropriate dark map style.

If it has a light theme, use a clean light map style.

Do not introduce a completely unrelated visual language.

The map should feel like part of HUNTIQ.

---

# 36. PERFORMANCE

Do not:

- Audit every business repeatedly.
- Make duplicate API requests.
- Search every time the user slightly moves the map.
- Load unnecessary Places fields.
- Re-render all markers unnecessarily.

Use:

- Debounced location search
- Explicit "Search This Area"
- Result caching where permitted
- React memoization
- Marker clustering
- Efficient state updates

---

# 37. SECURITY

Never hardcode:

```text
API keys
secrets
private credentials
```

Use environment variables.

If a backend proxy is available, protect sensitive credentials server-side.

---

# 38. IMPORTANT DATA AND PROVIDER RULE

Do not represent demo businesses as real companies.

All demo businesses must clearly be synthetic.

For Geoapify/OpenStreetMap data:

- Respect the provider's current API terms.
- Respect OpenStreetMap attribution requirements.
- Display appropriate attribution on the map.
- Do not bypass API limits.
- Do not scrape provider pages.
- Do not build uncontrolled bulk harvesting.
- Only request the data required for the feature.

Include appropriate attribution such as:

```text
© OpenStreetMap contributors
Powered by Geoapify
```

in the map UI according to the current provider requirements.

---

# 39. FILES TO CREATE/MODIFY

First inspect whether these already exist.

Potential files:

```text
src/components/prospects/MapProspectingRadar.tsx

src/components/prospects/AuditDetailDrawer.tsx

src/components/prospects/ProspectMapSidebar.tsx

src/components/prospects/GeoFilterBar.tsx

src/services/geoapifyService.ts

src/engine/digitalAuditEngine.ts

src/engine/opportunityScoringEngine.ts

src/data/mockGeoBusinesses.ts

src/types/geo.ts

src/types/digitalAudit.ts

server/routes/prospects.ts

server/engine/geo/geoProspectingEngine.ts

server/engine/audit/digitalAuditEngine.ts
```

Do not create duplicate files if equivalent files already exist.

---

# 40. IMPLEMENTATION SEQUENCE

Implement in this exact order:

### STEP 1
Inspect the existing HUNTIQ codebase.

### STEP 2
Identify existing Find Prospects, context, opportunity and pipeline architecture.

### STEP 3
Install/configure MapLibre.

### STEP 4
Create the map component.

### STEP 5
Render a default demonstration location.

Use:

```text
Lagos, Nigeria
```

only as the initial demo location.

### STEP 6
Implement location search.

### STEP 7
Implement Geoapify geocoding.

### STEP 8
Implement Geoapify Places search.

### STEP 9
Implement mock fallback.

### STEP 10
Implement Geo Business data model.

### STEP 11
Implement Digital Audit Engine.

### STEP 12
Implement Digital Gap scoring.

### STEP 13
Implement custom map markers.

### STEP 14
Implement marker clustering.

### STEP 15
Implement filters.

### STEP 16
Implement prospect sidebar.

### STEP 17
Implement Audit Detail Drawer.

### STEP 18
Implement selection.

### STEP 19
Implement Capture Selected.

### STEP 20
Implement Capture Viewport.

### STEP 21
Connect capture to Opportunities.

### STEP 22
Connect Opportunities to Pipeline.

### STEP 23
Connect audit context to Outreach.

### STEP 24
Run build and fix all TypeScript errors.

---

# 41. ACCEPTANCE CRITERIA

The implementation is successful only when all of the following work.

## Map

- [ ] Map renders successfully.
- [ ] Map is interactive.
- [ ] Zoom works.
- [ ] Pan works.
- [ ] Map attribution is present.
- [ ] Markers render.
- [ ] Marker clustering works.

## Location

- [ ] Lagos can be searched.
- [ ] Abuja can be searched.
- [ ] Benin City can be searched.
- [ ] Nairobi can be searched.
- [ ] London can be searched.
- [ ] Arbitrary locations can be searched.
- [ ] User can search the current map area.

## Prospect Discovery

- [ ] All Targets works.
- [ ] High-Growth works.
- [ ] Digital Gap works.
- [ ] Industry filtering works.
- [ ] Radius filtering works.
- [ ] Digital Gap filters work.

## Digital Audit

- [ ] Digital Gap Score appears.
- [ ] Issues appear.
- [ ] Severity appears.
- [ ] Recommended package appears.
- [ ] Estimated value appears.
- [ ] Conversion probability appears.
- [ ] Pitch angle appears.
- [ ] Before/after score appears.

## Capture

- [ ] Individual prospect can be captured.
- [ ] Multiple prospects can be selected.
- [ ] Selected prospects can be captured.
- [ ] Current viewport can be captured.
- [ ] Duplicate prospects are prevented.

## Opportunities

- [ ] Captured prospects appear in Opportunities.
- [ ] Digital Gap information is retained.
- [ ] Audit can be opened.
- [ ] Estimated value is retained.
- [ ] Source is shown as GEO RADAR.

## Pipeline

- [ ] Opportunity can be pushed to Pipeline.
- [ ] Pipeline stage is assigned.
- [ ] Digital audit remains attached.

## Outreach

- [ ] Start Outreach action exists.
- [ ] Digital Audit context is passed into Outreach.

## Reliability

- [ ] Missing API key does not crash the app.
- [ ] Mock data works.
- [ ] API failures are handled.
- [ ] Empty results are handled.
- [ ] `npm run build` succeeds.
- [ ] No TypeScript errors.
- [ ] Existing HUNTIQ functionality remains intact.

---

# 42. FINAL UI EXPERIENCE

The finished feature should feel like a serious AI sales intelligence tool, not simply a Google/OSM map.

The core experience should be:

```text
SEARCH LOCATION
       ↓
DISCOVER BUSINESSES
       ↓
ANALYZE DIGITAL PRESENCE
       ↓
IDENTIFY DIGITAL GAPS
       ↓
SCORE OPPORTUNITY
       ↓
SHOW ON LIVE MAP
       ↓
INSPECT AUDIT
       ↓
CAPTURE PROSPECT
       ↓
OPPORTUNITY
       ↓
CRM PIPELINE
       ↓
OUTREACH
```

The key product concept is:

> **HUNTIQ does not merely show where businesses are. It identifies which businesses are commercially interesting, explains why they are interesting, estimates what the opportunity could be worth, and turns them into actionable CRM opportunities.**

---

# FINAL DEVELOPMENT INSTRUCTION

Do not stop after creating a visual mockup.

Implement the feature end-to-end using the existing HUNTIQ architecture.

First inspect the existing files and understand how the current application works. Then make the smallest architectural changes necessary to introduce the Live Geo Radar.

Prioritize:

1. Functional MapLibre map
2. Dynamic location search
3. Geoapify/OpenStreetMap discovery
4. Demo fallback
5. Digital Gap scoring
6. Interactive markers
7. Audit drawer
8. Prospect selection
9. Capture to Opportunities
10. Push to Pipeline
11. Outreach integration
12. Build verification

At the end, run:

```bash
npm run build
```

and resolve all errors before considering the implementation complete.

Also provide a concise implementation summary listing:

- Files created
- Files modified
- APIs integrated
- Environment variables required
- New user flows
- Build/test result
- Any remaining limitations