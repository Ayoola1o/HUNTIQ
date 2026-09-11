# HUNTIQ System Audit: Non-Functional Elements & UI Bug Tracker

This document catalogs all non-functional buttons, unbound click handlers, empty callbacks (`() => {}`), unlinked search inputs, missing route fallbacks, and dead interface controls identified across the HUNTIQ application, organized by page and component.

---

## 1. Dashboard Page (`src/components/dashboard/DashboardPage.tsx` & Children)

### Bug 1.1: KPI Cards Clicks Are No-Ops
- **File**: [`src/components/dashboard/DashboardPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/dashboard/DashboardPage.tsx#L94)
- **Line**: 94
- **Element**: `<KpiCards onCardClick={() => {}} />`
- **Issue**: KPI summary cards have CSS hover animations and pointer cursors, but pass an empty callback `() => {}`. Clicking Total Prospects, Hot Opportunities, Buying Signals, Active Deals, Pipeline Value, Expected Revenue, or Avg Deal Size does nothing.
- **Fix**: Route `onCardClick(metricId)` to navigate to the corresponding module:
  - `prospects` -> navigate to `'find-prospects'`
  - `hot_opps` -> navigate to `'opportunities'`
  - `signals` -> navigate to `'signals'`
  - `deals`, `pipeline`, `revenue`, `avg_deal` -> navigate to `'pipeline'`

### Bug 1.2: Header Global Search Input Is a No-Op
- **File**: [`src/components/dashboard/DashboardPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/dashboard/DashboardPage.tsx#L78)
- **Line**: 78
- **Element**: `<DashboardHeader onSearch={() => {}} ... />`
- **Issue**: The search callback passed to `DashboardHeader` is an empty no-op `() => {}`. Typing a company, contact, or signal query in the top header executes nothing.
- **Fix**: Implement a search handler that navigates to the Companies or Prospects page with the pre-filled search query, or filters attention items.

### Bug 1.3: Notification Bell Button Has No Click Handler
- **File**: [`src/components/dashboard/DashboardHeader.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/dashboard/DashboardHeader.tsx#L189-L204)
- **Line**: 189-204
- **Element**: `<button><Bell size={18} /></button>`
- **Issue**: The notification bell button displays an unread counter badge ("12"), but has no `onClick` handler.
- **Fix**: Bind `onClick` to navigate to the `'signals'` stream or toggle a notification panel.

### Bug 1.4: AttentionFeed "Show More Updates" Button Has No Click Handler
- **File**: [`src/components/dashboard/AttentionFeed.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/dashboard/AttentionFeed.tsx#L372-L388)
- **Line**: 372-388
- **Element**: `<button><span>Show more updates</span><ChevronDown /></button>`
- **Issue**: Clicking "Show more updates" at the bottom of the Attention Feed has no `onClick` handler and performs no action.
- **Fix**: Bind `onClick` to toggle expanded visibility of attention records or navigate to the complete signals feed (`navigateTo('signals')`).

### Bug 1.5: AttentionFeed Action Menu Button Has No Click Handler
- **File**: [`src/components/dashboard/AttentionFeed.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/dashboard/AttentionFeed.tsx#L354-L365)
- **Line**: 354-365
- **Element**: `<button><MoreVertical size={16} /></button>`
- **Issue**: Each item row contains a 3-dots more menu button without an `onClick` handler.
- **Fix**: Bind to open action options (investigate with Copilot, research company, dismiss).

### Bug 1.6: RecentActivityCard "View All" Link Is Prevented
- **File**: [`src/components/dashboard/RecentActivityCard.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/dashboard/RecentActivityCard.tsx#L71-L85)
- **Line**: 71-85
- **Element**: `<a href="#activity" onClick={(e) => e.preventDefault()}><span>View all</span><ArrowRight /></a>`
- **Issue**: Clicking "View all" simply calls `e.preventDefault()` without navigating anywhere.
- **Fix**: Route to the signals telemetry or activity stream view via `navigateTo('signals')`.

---

## 2. Companies Page (`src/components/companies/CompaniesPage.tsx`)

### Bug 2.1: Header Search Input Is Unbound
- **File**: [`src/components/companies/CompaniesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/companies/CompaniesPage.tsx#L465-L476)
- **Line**: 465-476
- **Element**: `<input type="text" placeholder="Search companies, people, signals..." />`
- **Issue**: The input has no `value` binding and no `onChange` listener. Any text typed by the user does not filter the displayed companies list.
- **Fix**: Bind `value={searchQuery}` and `onChange={(e) => setSearchQuery(e.target.value)}` to filter `filteredCompanies`.

### Bug 2.2: Export Button Has No Click Handler
- **File**: [`src/components/companies/CompaniesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/companies/CompaniesPage.tsx#L606-L625)
- **Line**: 606-625
- **Element**: `<button>...<span>Export</span></button>`
- **Issue**: Clicking the "Export" button in the companies table toolbar has no `onClick` handler.
- **Fix**: Implement CSV export functionality that downloads the currently filtered company directory (`id, name, domain, industry, employees, score, location`).

### Bug 2.3: Date Range Selector Button Has No Click Handler
- **File**: [`src/components/companies/CompaniesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/companies/CompaniesPage.tsx#L563-L581)
- **Line**: 563-581
- **Element**: `<button>...<span>May 16, 2025 - May 30, 2025</span></button>`
- **Issue**: The button is static with hardcoded dates and no `onClick` or dropdown menu.
- **Fix**: Wire an interactive dropdown menu to select ranges (e.g. "Last 7 days", "Last 30 days", "This quarter") and update state.

### Bug 2.4: Notification Bell Has No Click Handler
- **File**: [`src/components/companies/CompaniesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/companies/CompaniesPage.tsx#L515-L543)
- **Line**: 515-543
- **Element**: `<button><Bell size={16} /></button>`
- **Issue**: No `onClick` handler bound.
- **Fix**: Route to `'signals'`.

### Bug 2.5: User Avatar Has No Click Handler
- **File**: [`src/components/companies/CompaniesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/companies/CompaniesPage.tsx#L546-L560)
- **Line**: 546-560
- **Element**: `<div>AA</div>`
- **Issue**: Missing click navigation to user profile.
- **Fix**: Add `onClick={() => onNavigate('profile')}` and pointer cursor.

### Bug 2.6: Add to List Modal Callback Is a No-Op
- **File**: [`src/components/companies/CompaniesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/companies/CompaniesPage.tsx#L745)
- **Line**: 745
- **Element**: `<AddToListModal ... onSave={(_list) => {}} />`
- **Issue**: When a user selects or creates a target list and clicks "Add to List", the `onSave` handler does nothing; the company is never saved to the list.
- **Fix**: Implement list assignment, persist to local storage/state, and display confirmation toast.

### Bug 2.7: Opportunity Filters Modal Callback Is a No-Op
- **File**: [`src/components/companies/CompaniesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/companies/CompaniesPage.tsx#L756)
- **Line**: 756
- **Element**: `<OpportunityFiltersModal ... onApply={() => {}} />`
- **Issue**: When the user configures min score, industries, locations, or signals and clicks "Apply Filters", the callback is empty `() => {}` and no filters are applied.
- **Fix**: Store active filter criteria in state and filter `companies` by score, industry, and location.

---

## 3. Opportunities Page (`src/components/opportunities/OpportunitiesPage.tsx`)

### Bug 3.1: Header Search Input Is Unbound
- **File**: [`src/components/opportunities/OpportunitiesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/opportunities/OpportunitiesPage.tsx#L280-L291)
- **Line**: 280-291
- **Element**: `<input type="text" placeholder="Search companies, people, signals..." />`
- **Issue**: Missing `value` and `onChange` bindings; does not filter opportunities.
- **Fix**: Bind `value={searchQuery}` and `onChange={(e) => setSearchQuery(e.target.value)}`.

### Bug 3.2: Notification Bell Has No Click Handler
- **File**: [`src/components/opportunities/OpportunitiesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/opportunities/OpportunitiesPage.tsx#L329)
- **Line**: 329
- **Element**: `<button><Bell size={16} /></button>`
- **Issue**: No `onClick` handler.
- **Fix**: Route to `'signals'`.

### Bug 3.3: User Avatar Has No Click Handler
- **File**: [`src/components/opportunities/OpportunitiesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/opportunities/OpportunitiesPage.tsx#L361)
- **Line**: 361
- **Element**: `<div>AA</div>`
- **Issue**: Missing `onClick` navigation to `'profile'`.
- **Fix**: Bind `onClick={() => onNavigate('profile')}`.

### Bug 3.4: Date Range Selector Has No Click Handler
- **File**: [`src/components/opportunities/OpportunitiesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/opportunities/OpportunitiesPage.tsx#L378)
- **Line**: 378
- **Element**: `<button>...<span>May 16, 2025 - May 30, 2025</span></button>`
- **Issue**: Static button with no click handler or range picker.
- **Fix**: Add interactive dropdown menu to choose timeframes.

### Bug 3.5: Opportunity Filters Modal Callback Is a No-Op
- **File**: [`src/components/opportunities/OpportunitiesPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/opportunities/OpportunitiesPage.tsx#L550)
- **Line**: 550
- **Element**: `<OpportunityFiltersModal ... onApply={() => {}} />`
- **Issue**: `onApply={() => {}}` ignores filter submissions.
- **Fix**: Apply the returned filters (score, industries, locations, signals) to the opportunities list.

---

## 4. Signals Page (`src/components/signals/SignalsPage.tsx`)

### Bug 4.1: Notification Bell Has No Click Handler
- **File**: [`src/components/signals/SignalsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/signals/SignalsPage.tsx#L206)
- **Line**: 206
- **Element**: `<button><Bell size={16} /></button>`
- **Issue**: No `onClick` handler.
- **Fix**: Bind `onClick` to refresh signals or filter by high-priority unread signals.

### Bug 4.2: User Avatar Has No Click Handler
- **File**: [`src/components/signals/SignalsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/signals/SignalsPage.tsx#L238)
- **Line**: 238
- **Element**: `<div>AA</div>`
- **Issue**: Missing navigation to `'profile'`.
- **Fix**: Bind `onClick={() => onNavigate('profile')}`.

### Bug 4.3: Date Range Selector Has No Click Handler
- **File**: [`src/components/signals/SignalsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/signals/SignalsPage.tsx#L255)
- **Line**: 255
- **Element**: `<button>...<span>May 16, 2025 - May 30, 2025</span></button>`
- **Issue**: Static button with no click handler.
- **Fix**: Implement interactive date selector dropdown.

### Bug 4.4: Opportunity Filters Modal Callback Is a No-Op
- **File**: [`src/components/signals/SignalsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/signals/SignalsPage.tsx#L355)
- **Line**: 355
- **Element**: `<OpportunityFiltersModal ... onApply={() => {}} />`
- **Issue**: Filters modal `onApply` does nothing.
- **Fix**: Filter signals by minimum impact score, industry/location keywords, and signal types.

---

## 5. Contacts Page (`src/components/contacts/ContactsPage.tsx`)

### Bug 5.1: Missing Filters Button in Toolbar
- **File**: [`src/components/contacts/ContactsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/contacts/ContactsPage.tsx#L420-L460)
- **Line**: 420-460
- **Element**: Toolbar actions
- **Issue**: `isFiltersModalOpen` is declared in state and `<OpportunityFiltersModal>` is rendered, but no button exists in the toolbar to open the filters modal.
- **Fix**: Add a "Filters" button next to "Import Contacts" that invokes `setIsFiltersModalOpen(true)`.

### Bug 5.2: Filters Modal Closes Without Applying Filters
- **File**: [`src/components/contacts/ContactsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/contacts/ContactsPage.tsx#L608)
- **Line**: 608
- **Element**: `<OpportunityFiltersModal onApply={() => setIsFiltersModalOpen(false)} />`
- **Issue**: `onApply` merely closes the modal and discards the filter parameters.
- **Fix**: Save filter criteria to state and apply them to `filteredContacts`.

---

## 6. Pipeline Page (`src/components/pipeline/PipelinePage.tsx`)

### Bug 6.1: "List" View Mode Toggle Does Not Switch View
- **File**: [`src/components/pipeline/PipelinePage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/pipeline/PipelinePage.tsx#L513-L545)
- **Line**: 513-545
- **Element**: `<button onClick={() => setViewMode('list')}>List</button>`
- **Issue**: The user can click "List", and the button highlights as active, but the page unconditionally renders `<PipelineKanbanBoard />` regardless of whether `viewMode === 'kanban'` or `'list'`. There is no table/list view rendered when in List mode.
- **Fix**: Implement an intuitive, clean deals table view when `viewMode === 'list'` with columns: Deal Title, Company, Value, Probability, Stage, Next Action, and Owner, with stage progression controls.

---

## 7. Reports Page (`src/components/reports/ReportsPage.tsx`)

### Bug 7.1: Featured Report Share Button Is a No-Op
- **File**: [`src/components/reports/ReportsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/reports/ReportsPage.tsx#L310)
- **Line**: 310
- **Element**: `<FeaturedReportCard onShareReport={() => {}} />`
- **Issue**: Clicking "Share Report" does nothing.
- **Fix**: Implement report link/summary clipboard copy with a confirmation toast.

### Bug 7.2: Reports Table Share Button Is a No-Op
- **File**: [`src/components/reports/ReportsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/reports/ReportsPage.tsx#L326)
- **Line**: 326
- **Element**: `<ReportsTable onShareReport={() => {}} />`
- **Issue**: Share button inside the reports table has an empty callback.
- **Fix**: Implement share handler to copy report access URL or trigger export.

### Bug 7.3: Schedule Report Confirmation Is a No-Op
- **File**: [`src/components/reports/ReportsPage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/reports/ReportsPage.tsx#L350)
- **Line**: 350
- **Element**: `<ScheduleReportModal onConfirmSchedule={() => {}} />`
- **Issue**: In `ScheduleReportModal`, the user configures report frequency, delivery day, and recipient emails, but submitting calls an empty `() => {}` callback.
- **Fix**: Record scheduled report cadence, persist to state, and display a scheduling confirmation toast.

---

## 8. Profile Page (`src/components/profile/ProfilePage.tsx`)

### Bug 8.1: Header Notification Bell Has No Click Handler
- **File**: [`src/components/profile/ProfilePage.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/profile/ProfilePage.tsx#L352)
- **Line**: 352
- **Element**: `<button><Bell size={15} /></button>`
- **Issue**: Button has no `onClick` handler.
- **Fix**: Switch active tab to `'notifications'` (`setActiveSection('notifications')`) or navigate to `'signals'`.

---

## 9. Global Application Routing & Sidebar Navigation (`src/App.tsx` & `src/components/dashboard/DashboardSidebar.tsx`)

### Bug 9.1: 'alerts' Navigation Target Falls Through to Onboarding
- **File**: [`src/components/dashboard/DashboardSidebar.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/dashboard/DashboardSidebar.tsx#L102) & [`src/App.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/App.tsx#L323)
- **Line**: Sidebar line 102, App.tsx line 323
- **Element**: `{ id: 'alerts', label: 'Alerts', icon: <Bell size={16} /> }`
- **Issue**: When a user clicks "Alerts" in the sidebar, `App.tsx` lacks a check for `currentView === 'alerts'`, falling through to line 323 which abruptly launches the multi-step onboarding wizard.
- **Fix**: Handle `alerts` in `App.tsx` by routing to `SignalsPage` or `SignalsPage` with priority filter.

### Bug 9.2: 'team' Navigation Target Falls Through to Onboarding
- **File**: [`src/components/dashboard/DashboardSidebar.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/components/dashboard/DashboardSidebar.tsx#L108) & [`src/App.tsx`](file:///c:/Users/ASUS/Documents/HUNTIQ/src/App.tsx#L323)
- **Line**: Sidebar line 108, App.tsx line 323
- **Element**: `{ id: 'team', label: 'Team', icon: <Users2 size={16} /> }`
- **Issue**: When a user clicks "Team" in the sidebar, `App.tsx` lacks a handler for `currentView === 'team'`, falling through to the onboarding wizard.
- **Fix**: Handle `team` in `App.tsx` by rendering `SettingsPage` with the Team tab active (`activeSection='team'`) or navigating directly to Settings.

---

## Summary Table

| ID | Component / Page | Element | Issue | Severity | Status |
|---|---|---|---|---|---|
| 1.1 | Dashboard | KpiCards | Empty `onCardClick={() => {}}` | High | Fixed |
| 1.2 | Dashboard | DashboardHeader | Empty `onSearch={() => {}}` | Medium | Fixed |
| 1.3 | Dashboard | Bell Button | Missing `onClick` | Low | Fixed |
| 1.4 | Dashboard | AttentionFeed | "Show more updates" missing `onClick` | Low | Fixed |
| 1.5 | Dashboard | AttentionFeed | MoreVertical button missing `onClick` | Low | Fixed |
| 1.6 | Dashboard | RecentActivityCard | "View all" uses `e.preventDefault()` | Low | Fixed |
| 2.1 | Companies | Search Input | No `value`/`onChange`, doesn't filter | High | Fixed |
| 2.2 | Companies | Export Button | Missing `onClick`, doesn't export | Medium | Fixed |
| 2.3 | Companies | Date Range | Missing `onClick` / dropdown | Low | Fixed |
| 2.4 | Companies | Bell Button | Missing `onClick` | Low | Fixed |
| 2.5 | Companies | User Avatar | Missing `onClick` to profile | Low | Fixed |
| 2.6 | Companies | AddToListModal | Empty `onSave={(_list) => {}}` | Medium | Fixed |
| 2.7 | Companies | Filter Modal | Empty `onApply={() => {}}` | High | Fixed |
| 3.1 | Opportunities | Search Input | No `value`/`onChange`, doesn't filter | High | Fixed |
| 3.2 | Opportunities | Bell Button | Missing `onClick` | Low | Fixed |
| 3.3 | Opportunities | User Avatar | Missing `onClick` to profile | Low | Fixed |
| 3.4 | Opportunities | Date Range | Missing `onClick` / dropdown | Low | Fixed |
| 3.5 | Opportunities | Filter Modal | Empty `onApply={() => {}}` | High | Fixed |
| 4.1 | Signals | Bell Button | Missing `onClick` | Low | Fixed |
| 4.2 | Signals | User Avatar | Missing `onClick` to profile | Low | Fixed |
| 4.3 | Signals | Date Range | Missing `onClick` / dropdown | Low | Fixed |
| 4.4 | Signals | Filter Modal | Empty `onApply={() => {}}` | High | Fixed |
| 5.1 | Contacts | Toolbar | Missing button to open Filter Modal | Medium | Fixed |
| 5.2 | Contacts | Filter Modal | `onApply` closes without applying | High | Fixed |
| 6.1 | Pipeline | View Toggle | "List" mode does not render table | High | Fixed |
| 7.1 | Reports | Featured Report | Empty `onShareReport={() => {}}` | Low | Fixed |
| 7.2 | Reports | Reports Table | Empty `onShareReport={() => {}}` | Low | Fixed |
| 7.3 | Reports | Schedule Modal | Empty `onConfirmSchedule={() => {}}` | Medium | Fixed |
| 8.1 | Profile | Bell Button | Missing `onClick` | Low | Fixed |
| 9.1 | App Routing | 'alerts' | Falls through to onboarding | Critical | Fixed |
| 9.2 | App Routing | 'team' | Falls through to onboarding | Critical | Fixed |

---

## 10. Verification & Quality Assurance Results

| Verification Phase | Command | Status | Details |
|---|---|---|---|
| **Backend Integration Suite** | `npm test` | ✅ **PASS (23/23)** | All scraper, job lifecycle, SSRF, and tenancy isolation tests passed with exit code 0. |
| **Type Check & Build** | `npm run build` | ✅ **PASS (Code 0)** | TypeScript compiled with 0 errors; Vite bundle generated 2004 modules transformed in 7.32s. |
| **Linting & Code Quality** | `npm run lint` | ✅ **PASS (Code 0)** | 0 errors across 404 files. |
| **Manual Navigation & States** | UI Walkthrough | ✅ **PASS** | Dead buttons wired, dropdown menus responsive, modal callbacks apply filters, toasts display user feedback. |

