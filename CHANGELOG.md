# Changelog

All notable changes to UAS Fleet Tracker.

## [2.1.8] - 2025-12-27

### Added
- **PDF Export for Fleet** - Export fleet data as a formatted PDF report
  - Summary section with total aircraft, status counts, and total hours
  - Aircraft table with name, status, hours, maintenance due, airframe, and location
  - Color-coded status indicators and maintenance warnings
  - Clean layout with alternating row backgrounds
- **PDF Export for Metrics** - Export metrics dashboard as a PDF report
  - Respects date range filter (filtered data or all time)
  - Fleet Health score with visual bar
  - Productivity Ranking with hours bars by aircraft
  - Flight Hours by Month chart
  - Availability Summary with percentage bars
  - Date range shown in header and filename

---

## [2.1.3] - 2025-12-22

### Added
- **F12 DevTools Support** - Press F12 to open Chrome DevTools for debugging
- **Version Banner** - Console shows version and timestamp on startup
- **Logging System** - Console logging for debugging (partial in current build)

### Fixed
- **Local Timezone Date Fix** - Dates now use local timezone instead of UTC
  - Before: `new Date().toISOString().split('T')[0]` - used UTC, caused wrong date after 7 PM in US timezones
  - After: `new Date().toLocaleDateString('en-CA')` - uses local calendar date
  - Affected: Quick Log date, Last Flight date, Status History dates
  - No change to stored format (still YYYY-MM-DD)

---

## [2.1.2] - 2025-01-20

### Fixed
- **Edit Modal Status Change Bug** - When editing an aircraft and changing its status, the Edit modal now properly closes before the Status Reason modal appears
  - Before: Both modals visible at same time (Edit modal stuck behind Status modal)
  - After: Edit modal closes, only Status Reason modal shows, then returns to main screen
  - Data is preserved in pendingEditSave during the status reason prompt

---

## [2.1.1] - 2025-01-20

### Added
- **Dismissible Alerts** - Click X to dismiss any alert banner
  - Toast notifications (top-right) - click X to close immediately
  - Yellow "Approaching Maintenance" banner - dismiss for session
  - Red "Due/Overdue" banner - dismiss for session
  - Red "In Maintenance" section - dismiss for session
  - All alerts reset on app restart (so you don't forget)

### Fixed
- **Empty Fleet Reset Bug** - Previously if you deleted all aircraft and restarted, sample data would reload. Now empty fleet is preserved correctly.
  - Before: `if (saved && saved.length > 0)` - failed on empty array
  - After: `if (saved !== null)` - preserves empty fleet

- **Sync File I/O Blocking** - File operations now use async methods to prevent UI freezing
  - Before: `fs.readFileSync()`, `fs.writeFileSync()` - blocked UI
  - After: `fs.promises.readFile()`, `fs.promises.writeFile()` - non-blocking

- **Import Validation Too Strict** - Import now handles type variations gracefully
  - Before: `typeof a.totalHours !== 'number'` - failed on "142.5" string
  - After: `Number(a.totalHours)` - coerces strings to numbers
  - Provides sensible defaults for missing fields
  - Returns normalized/cleaned data

- **Version Mismatch** - package.json now matches README version

### Removed
- Dead code: Unused `Icons.Database` and `Icons.HardDrive` components

---

## [2.1.0] - Previous Release

### Features
- Metrics Dashboard tab with fleet analytics
- Status history tracking with audit trail
- Timeline visualization in expanded rows
- Status change reason enforcement

---

## [2.0.0] - Initial Release

### Features
- Fleet management with CRUD operations
- Maintenance scheduling and alerts
- Search with autocomplete
- JSON/CSV export/import
- Native file dialogs
- Auto-save to AppData folder

---

## Data File Location

```
Windows: %AppData%\uas-fleet-tracker\fleet-data.json
```

## Technical Notes

### Import Validation
The import function now:
1. Accepts strings for numeric fields (e.g., "142.5" becomes 142.5)
2. Provides defaults: status="active", maintenanceInterval=200, weight=0
3. Ensures statusHistory is always an array
4. Returns normalized data with correct types

### File I/O
All main file operations use async fs.promises API:
- `fs.promises.access()` - check file exists
- `fs.promises.readFile()` - load data
- `fs.promises.writeFile()` - save data
- `fs.promises.mkdir()` - create directory

This prevents the UI from freezing during disk operations.

### System Architecture (v2.1.8)

#### Core Data Structure
```javascript
{
  id, name, status ('active'|'maintenance'|'grounded'),
  totalHours, maintenanceInterval,
  lastFlight: 'YYYY-MM-DD', dateAdded: 'YYYY-MM-DD',
  statusHistory: [{ status, date, reason }],
  flightLog: [{ date, hours }],
  airframeType, weight, maxWeight, flightController, fcFirmware,
  companionComputer, companionOS, primaryRadio, backupRadio, location, notes
}
```

#### Helper Function Dependency Chain
```
daysBetween(date1, date2) <- FOUNDATION - all date calculations depend on this
|
+-> calculateStatusDays(aircraft)
|   +-> calculateAvailability(aircraft)
|       +-- Fleet: Status Timeline % bar
|       +-- Metrics: Availability Tracking
|       +-- Metrics: Avg Availability stat
|
+-> daysSinceStatusChange(aircraft)
|   +-- Fleet: "in current status for X days"
|   +-- Metrics: Attention Needed durations
|
+-> getDaysInFleet(aircraft) <- via getAddedDate
|   +-> getUtilizationRate(aircraft)
|       +-- Metrics: Utilization Rate section
|
+-> getDowntimeStats(aircraftList)
    +-- Metrics: Downtime Analysis
```

#### Date Format Flow
- Storage: `"2025-12-27"` (YYYY-MM-DD string)
- Today: `new Date().toLocaleDateString('en-CA')` -> `"2025-12-27"`
- Display: `formatDate("2025-12-27")` -> `"27 Dec 2025"`
- Calculation: `daysBetween(date1, date2)` -> days difference

#### Key Calculations
- **Maintenance Status**: `remaining = maintenanceInterval - totalHours`
  - `< 0` = OVERDUE (red), `= 0` = DUE (red), `<= 20` = WARN (yellow), else OK (green)
- **Availability %**: `(days.active / totalDays) * 100` via calculateStatusDays
- **Fleet Health**: `(activeCount / aircraft.length) * 100`
- **Utilization Rate**: `totalHours / daysInFleet` (hours per day)

#### Input -> Output Chains
1. **Quick Flight Log**: Updates totalHours, lastFlight, flightLog -> affects Hours column, To Maint, all Metrics charts
2. **Status Change**: Updates status, statusHistory -> affects badges, stats cards, alerts, all availability metrics
3. **Date Range Filter**: Filters flightLog entries -> recalculates filteredHours for all Metrics sections

#### Known Dead Code
- Line 2188: `totalFilteredEntries` - calculated but never used
