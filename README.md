# UAS Fleet Tracker v2.1.4

Desktop application for tracking and managing UAS (Unmanned Aircraft Systems) fleet operations, maintenance schedules, and aircraft configurations.

---

## Features

### Fleet Management
| Feature | Description |
|---------|-------------|
| Aircraft tracking | Name, type, status, flight hours |
| Maintenance scheduling | Configurable intervals per aircraft |
| System configuration | Flight controller, companion computer, firmware versions |
| Radio configuration | Primary/backup links (LTE, Starlink, RF 900MHz, RF 2.4GHz, Mesh) |
| Weight tracking | Empty weight, MTOW, payload capacity (lbs with auto kg conversion) |
| Notes | Free-form notes per aircraft |

### Status Tracking
| Status | Color | Description |
|--------|-------|-------------|
| Active | Green | Operational, available for flight |
| Maintenance | Red | Currently being serviced |
| Grounded | Gray | Out of service (awaiting parts, etc.) |

### Maintenance Alerts
| Alert Level | Condition | Display |
|-------------|-----------|---------|
| Approaching | 80-99% of interval | Yellow banner |
| DUE | Exactly at interval | Red "DUE" in table |
| OVERDUE | Past interval | Red "OVERDUE" in table + red banner |

### User Interface
- **Tab Navigation** - Fleet list / Metrics dashboard
- **Search with autocomplete** - Type to filter, dropdown shows matches
- **Quick Flight Log** - Log hours without opening full editor
- **In Maintenance panel** - Shows aircraft being serviced with "Return to Service" button
- **Expandable rows** - Click row to see full details + status timeline
- **Filter tabs** - All / Active / Maintenance / Grounded
- **Responsive table** - Horizontal scroll on small screens

### Metrics Dashboard
| Metric | Description |
|--------|-------------|
| Fleet Health | Percentage of aircraft currently active |
| Productivity Ranking | Aircraft sorted by total hours with medals |
| Availability Tracking | Per-aircraft availability with history |
| Attention Needed | Actionable alerts for maintenance, grounded, etc. |
| Summary Stats | Total hours, avg availability, overdue count |

### Status History Tracking
| Feature | Description |
|---------|-------------|
| Automatic logging | Every status change recorded with timestamp |
| Reason tracking | Required reason for each status change |
| Edit modal integration | Status changes in edit modal prompt for reason |
| Days calculation | Days in active/maintenance/grounded states |
| Availability % | Calculated from status history |
| Timeline view | Visual history in expanded aircraft row |

### Data Management
- **Auto-save** - Changes saved automatically to disk
- **JSON backup** - Native "Save As" dialog
- **JSON import** - Native "Open" dialog
- **CSV export** - Spreadsheet-compatible format
- **Reset** - Restore sample data

---

## Data Storage

### Desktop App (.exe)
Data saved to real JSON file on disk:

```
Windows: C:\Users\[YourName]\AppData\Roaming\uas-fleet-tracker\fleet-data.json
macOS:   ~/Library/Application Support/uas-fleet-tracker/fleet-data.json
Linux:   ~/.config/uas-fleet-tracker/fleet-data.json
```

**Benefits:**
- Data persists even if app reinstalled
- No size limit
- Human-readable JSON format
- Easy manual backup (just copy the file)

### Web Version
Falls back to browser localStorage if not running as Electron app.

---

## Table Columns

| Column | Description |
|--------|-------------|
| STS | Status indicator (colored dot) |
| Aircraft | Aircraft name/ID |
| Type | Airframe type (Quadcopter, Hexacopter, Fixed Wing, VTOL, etc.) |
| Radio | Primary radio link |
| To Maint. | Hours until maintenance (or DUE/OVERDUE) |
| Hours | Total flight hours |

---

## Build Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm (included with Node.js)

### Step 1: Install Dependencies

```bash
cd uas-fleet-tracker-electron
npm install
```

### Step 2: Development Mode

**Browser (for testing UI):**
```bash
npm start
```
Opens at http://localhost:3000

**Desktop app (with file storage):**
```bash
npm run electron-dev
```

### Step 3: Build Executable

**Windows:**
```bash
npm run dist:win
```

**macOS:**
```bash
npm run dist:mac
```

**Linux:**
```bash
npm run dist:linux
```

### Step 4: Find Output

```
dist/
├── UAS Fleet Tracker Setup 1.0.0.exe    # Windows installer
├── UAS Fleet Tracker 1.0.0.exe          # Windows portable
├── UAS Fleet Tracker-1.0.0.dmg          # macOS
└── UAS Fleet Tracker-1.0.0.AppImage     # Linux
```

---

## Project Structure

```
uas-fleet-tracker-electron/
├── main.js              # Electron main process
│                        #   - Window management
│                        #   - File I/O (load/save JSON)
│                        #   - Native dialogs (Save As, Open)
├── preload.js           # IPC bridge (secure API exposure)
├── package.json         # Dependencies + build config
├── tailwind.config.js   # Tailwind CSS config
├── postcss.config.js    # PostCSS config
├── public/
│   └── index.html       # HTML template
├── src/
│   ├── App.js           # Main React application
│   │                    #   - All UI components
│   │                    #   - Storage API wrapper
│   │                    #   - State management
│   ├── index.js         # React entry point
│   └── index.css        # Tailwind imports
├── assets/
│   └── icon.ico         # App icon (256x256)
└── dist/                # Built executables
```

---

## Configuration Options

### Airframe Types (Dropdown)
- Quadcopter
- Hexacopter
- Octocopter
- Fixed Wing
- VTOL
- Custom (free text)

### Flight Controllers (Dropdown)
- Pixhawk 6C
- Pixhawk 4
- Cube Orange
- Cube Black
- DJI N3
- Custom (free text)

### Companion Computers (Dropdown)
- None
- Raspberry Pi 4
- Raspberry Pi 5
- Jetson Nano
- Jetson Xavier
- Intel NUC
- Custom (free text)

### Radio Options (Dropdown)
- LTE
- RF 900MHz
- RF 2.4GHz
- Starlink
- Mesh
- None
- Custom (free text)

---

## Customization

### Change Maintenance Threshold

In `src/App.js`, find:
```javascript
// Approaching: 80% to 99%
const needsAttention = aircraft.filter(a => 
  a.totalHours >= a.maintenanceInterval * 0.8 && 
  a.totalHours < a.maintenanceInterval && 
  a.status === 'active'
);
```

Change `0.8` to desired percentage (e.g., `0.9` for 90%).

### Add New Fields

1. Add to `initialAircraft` sample data
2. Add to `openAddModal()` defaults
3. Add input in modal form section
4. Add display in expanded row details
5. Add to CSV export headers/rows

### Add New Dropdown Options

Find the options arrays near top of `src/App.js`:
```javascript
const radioOptions = ['LTE', 'RF 900MHz', ...];
const fcOptions = ['Pixhawk 6C', ...];
const companionOptions = ['None', 'Raspberry Pi 4', ...];
const airframeTypes = ['Quadcopter', 'Hexacopter', ...];
```

### Custom App Icon

1. Create 256x256 PNG
2. Convert to .ico: https://convertico.com/
3. Save as `assets/icon.ico`
4. Rebuild

---

## Troubleshooting

### Build fails on Windows
```bash
npm install --global windows-build-tools
```

### Node version error
Requires Node.js v18+:
```bash
node --version
```

### Data not saving
Check write permissions in AppData folder.

### Electron dev mode not working
Make sure React dev server is running first:
```bash
# Terminal 1
npm start

# Terminal 2
npm run electron-dev
```

---

## File Formats

### JSON Backup Format
Weights are stored in pounds (lbs). Display shows both lbs and kg.
Status history tracks all status changes with timestamps and reasons.

```json
[
  {
    "id": 1,
    "name": "RAVEN-01",
    "status": "active",
    "totalHours": 142.5,
    "maintenanceInterval": 200,
    "lastFlight": "2025-01-15",
    "airframeType": "Quadcopter",
    "weight": 27.5,
    "maxWeight": 55,
    "flightController": "Pixhawk 6C",
    "fcFirmware": "ArduCopter 4.4.0",
    "companionComputer": "Raspberry Pi 4",
    "companionOS": "Ubuntu 22.04",
    "primaryRadio": "LTE",
    "backupRadio": "RF 900MHz",
    "location": "Hangar A",
    "notes": "Primary survey aircraft",
    "statusHistory": [
      { "status": "active", "date": "2024-06-01", "reason": "Initial deployment" }
    ]
  }
]
```

### CSV Export Columns
Name, Status, Total Hours, Maintenance Interval, Last Flight, Airframe Type, Weight (lbs), Max Weight (lbs), Flight Controller, FC Firmware, Companion Computer, Companion OS, Primary Radio, Backup Radio, Notes

---

## Version History

### v2.1.4 (Current)
- **15 Visual Enhancements** - Modern UI/UX improvements
  - Larger border-radius on cards (rounded-xl → rounded-2xl)
  - Box shadows on cards and modals
  - Status pill badges with labels (OK, MAINT, WARN, DOWN)
  - Row hover highlight with blue left accent
  - Button hover/active scale animations
  - Modal slide-in animation
  - Gradient primary buttons with glow
  - Increased whitespace and padding
  - Inter font family
  - Toast notification slide-in animation
  - Focus glow on input fields
  - Zebra striping on table rows
  - Sticky table header
  - Tab underline animation
  - Progress bar gradients (green/yellow/red)

### v2.1.3
- **F12 DevTools Support** - Press F12 to open Chrome DevTools for debugging
- **Version Banner** - Console shows version and timestamp on app startup
- **Local Timezone Fix** - Dates now use local timezone instead of UTC
  - Previously: Logging flights after 7 PM (in US timezones) would record next day's date
  - Now: Dates always match your local calendar regardless of time
  - Changed `toISOString().split('T')[0]` to `toLocaleDateString('en-CA')` in 7 locations
  - No change to stored data format (still YYYY-MM-DD)

### v2.1.2
- **Edit Modal Status Fix** - Edit modal now closes properly when status change triggers reason prompt
- **Dismissible Alerts** - Click X to dismiss alert banners (session-only)
- **Empty Fleet Bug Fixed** - Empty fleet now preserved on restart
- **Async File I/O** - No more UI freezing during save/load
- **Flexible Import Validation** - Handles type variations gracefully

### v2.1
- **Metrics Dashboard Tab** - Fleet-wide analytics
  - Fleet health score (availability percentage)
  - Productivity ranking with medals
  - Availability tracking per aircraft
  - Attention needed alerts
  - Summary stats (total hours, avg availability, etc.)
- **Status History Tracking** - Full audit trail
  - Automatic logging of all status changes
  - Timestamp and reason for each change
  - Days in each status calculation
  - Availability percentage per aircraft
  - Timeline view in expanded aircraft row
- **Status Change Reason Enforcement** - All paths require reason
  - Quick status buttons prompt for reason
  - Edit modal intercepts status changes and prompts for reason
  - No generic "changed via edit" messages
- **Timeline Visualization** - In expanded aircraft view
  - Collapsible status history panel (click to expand/collapse)
  - Shows entry count and availability % when collapsed
  - Status history with color-coded timeline
  - Days active/maintenance/grounded breakdown
  - Availability progress bar
  - Scrollable list for long histories
- **Enhanced Metrics** - Real availability calculations
  - Days in each status
  - Days since last status change
  - Fleet-wide average availability

### v2.0
- Search with autocomplete dropdown
- Separate DUE vs OVERDUE maintenance states
- In Maintenance panel with Return to Service
- Column order: STS, Aircraft, Type, Radio, To Maint., Hours
- All columns visible (horizontal scroll on mobile)
- SVG icons (no emojis)
- Native file dialogs for import/export
- Improved notification system (success/warning types)
- Weight input in lbs with automatic kg conversion display
- Fixed modal closing unexpectedly during edit
- Location field added

### v1.0
- Initial release
- Basic CRUD operations
- localStorage/file storage
- CSV/JSON export

---

## Planned Enhancements (v2.2.0 Roadmap)

### FUNCTIONAL ENHANCEMENTS - Core Features

#### Quick Wins (1-2 Hours Each)
| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | Column Sorting | Click headers to sort by name, hours, status | Planned |
| 2 | Keyboard Shortcuts | Ctrl+N, Ctrl+F, Esc to close modals | Planned |
| 3 | Duplicate Aircraft | Button to copy existing aircraft as template | Planned |
| 4 | Registration/Serial Fields | Add FAA registration and serial number fields | Planned |
| 5 | Unsaved Changes Warning | Warn if modal has unsaved changes | Planned |
| 6 | Required Field Indicators | Add red asterisk to required fields | Planned |
| 7 | Default Maintenance Setting | Store default interval in settings | Planned |
| 8 | Configurable Warning Threshold | Change 80% warning level | Planned |
| 9 | Last Backup Date Display | Show in footer when last exported | Planned |
| 10 | Focus Search on Load | Auto-focus search box option | Planned |
| 11 | Clear All Filters Button | One-click reset all filters | Planned |
| 12 | Row Count Display | Show "5 of 12 aircraft" when filtered | Planned |
| 13 | Version Number in UI | Display v2.1.3 in header/footer | Planned |
| 14 | Loading Skeleton State | Simple loading animation | Planned |
| 15 | Empty State Improvement | Better "Add your first aircraft" prompt | Planned |

#### Medium Effort (2-4 Hours Each)
| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 16 | Date-Based Maintenance | Add calendar maintenance field | Planned |
| 17 | Right-Click Context Menu | Quick actions on table rows | Planned |
| 18 | Progress Bar in Table | Visual bar showing hours until maintenance | Planned |
| 19 | Inline Edit Hours | Click total hours to quick-edit | Planned |
| 20 | Inline Edit Notes | Click notes to quick-edit | Planned |
| 21 | Multi-Filter | Filter by status AND type simultaneously | Planned |
| 22 | Date Range Filter | Filter by last flight date | Planned |
| 23 | Column Visibility Toggle | Checkboxes to show/hide columns | Planned |
| 24 | Export Selected Only | Checkbox select + export just those | Planned |
| 25 | Bulk Status Change | Select multiple, change status together | Planned |
| 26 | Recently Deleted Recovery | Store deleted items for 1 session | Planned |
| 27 | Undo Last Action | Single-level undo for delete/status change | Planned |
| 28 | Print CSS Styles | Make fleet table printable | Planned |
| 29 | Auto-Focus First Field | Focus aircraft name when modal opens | Planned |
| 30 | Tab Order Fix | Logical tab flow in edit form | Planned |
| 31 | Hours Input Validation | Prevent negative, limit decimals | Planned |
| 32 | Escape Key Closes Modals | Ensure all modals close on Esc | Planned |
| 33 | Click Outside Closes Dropdown | Search dropdown behavior | Planned |
| 34 | Duplicate Name Warning | Show warning before save, not after | Planned |
| 35 | Notes Character Counter | Show "45/500 characters" | Planned |

#### Larger Features (4-8 Hours Each)
| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 36 | Dark/Light Theme Toggle | Add theme switcher | Planned |
| 37 | Flight Log Array | Basic flight history per aircraft | Planned |
| 38 | Pilot Name Field | Simple text field for pilot tracking | Planned |
| 39 | Mission Type Field | Dropdown for flight mission category | Planned |
| 40 | Desktop Notifications | Electron notification for maintenance due | Planned |
| 41 | Bulk Delete | Select multiple + delete with confirmation | Planned |
| 42 | CSV Export Column Selection | Choose which columns to export | Planned |
| 43 | Quick View Side Panel | Click to see details without expanding row | Planned |
| 44 | Maintenance Log Array | Basic maintenance history | Planned |
| 45 | Battery Count Field | Simple number field for battery inventory | Planned |
| 46 | Unit Toggle (lbs/kg) | Display preference setting | Planned |
| 47 | Date Format Toggle | US vs International date format | Planned |
| 48 | Search History | Remember recent searches | Planned |
| 49 | Favorite/Pin Aircraft | Star to pin to top of list | Planned |
| 50 | Fleet Statistics in Header | Show key stats always visible | Planned |

---

### VISUAL ENHANCEMENTS - Modern UI/UX

#### Typography & Text
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 1 | Modern Font Family | Use Inter, Poppins, or SF Pro | Planned |
| 2 | Font Weight Hierarchy | Better light/regular/medium/bold usage | Planned |
| 3 | Larger Headings | More impactful header sizes | Planned |
| 4 | Letter Spacing | Tighter heading, looser body text | Planned |
| 5 | Text Gradient Effects | Gradient text for main title | Planned |
| 6 | Monospace Numbers | Tabular figures for aligned numbers | Planned |

#### Colors & Theming
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 7 | Accent Color Options | Blue, Purple, Green, Orange themes | Planned |
| 8 | Gradient Backgrounds | Subtle gradients instead of flat gray | Planned |
| 9 | Glass/Frosted Effect | Backdrop blur on modals and cards | Planned |
| 10 | Softer Shadows | Modern diffused shadows | Planned |
| 11 | Status Color Polish | Softer green/red/yellow with contrast | Planned |
| 12 | Hover State Colors | More visible hover feedback | Planned |
| 13 | Selection Highlight | Better text selection colors | Planned |
| 14 | Border Glow Effects | Subtle glow on focus states | Planned |

#### Cards & Containers
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 15 | Rounded Corners Increase | Larger border-radius (xl → 2xl) | Planned |
| 16 | Card Elevation Layers | Shadow hierarchy for depth | Planned |
| 17 | Glassmorphism Cards | Semi-transparent with blur | Planned |
| 18 | Card Hover Lift | Cards lift slightly on hover | Planned |
| 19 | Gradient Borders | Subtle gradient border accents | Planned |
| 20 | Inner Shadow Depth | Inset shadows for input fields | Planned |
| 21 | Neumorphism Option | Soft 3D pressed/raised look | Planned |

#### Buttons & Interactive Elements
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 22 | Pill-Shaped Buttons | Fully rounded button option | Planned |
| 23 | Button Hover Animation | Scale/color transition on hover | Planned |
| 24 | Button Press Effect | Scale down slightly on click | Planned |
| 25 | Icon Button Circles | Circular icon-only buttons | Planned |
| 26 | Gradient Buttons | Primary button with gradient fill | Planned |
| 27 | Outline Button Style | Ghost/outline button variants | Planned |
| 28 | Ripple Click Effect | Material Design ripple on click | Planned |
| 29 | Loading Spinner in Buttons | Spinner when saving | Planned |

#### Table & List Styling
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 30 | Zebra Striping | Alternating row backgrounds | Planned |
| 31 | Row Hover Highlight | More prominent row hover | Planned |
| 32 | Sticky Header | Table header sticks on scroll | Planned |
| 33 | Cell Padding Increase | More breathing room in cells | Planned |
| 34 | Status Pill Badges | Rounded pill instead of dot | Planned |
| 35 | Progress Bar Style | Gradient or animated progress bars | Planned |
| 36 | Row Divider Lines | Subtle dividers between rows | Planned |
| 37 | Column Separators | Optional vertical dividers | Planned |

#### Icons & Graphics
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 38 | Animated Icons | Subtle icon animations on hover | Planned |
| 39 | Icon Size Consistency | Uniform icon sizing throughout | Planned |
| 40 | Filled vs Outline Icons | Use filled for active states | Planned |
| 41 | Custom App Icon | Professional branded icon | Planned |
| 42 | Illustration Graphics | SVG illustrations for empty states | Planned |
| 43 | Status Indicator Animation | Pulse animation for active status | Planned |
| 44 | Loading Animations | Skeleton loaders, spinners | Planned |

#### Layout & Spacing
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 45 | Increased Whitespace | More padding/margins throughout | Planned |
| 46 | Grid Alignment | Consistent 8px grid system | Planned |
| 47 | Card Gap Uniformity | Consistent spacing between cards | Planned |
| 48 | Section Dividers | Visual separators between sections | Planned |
| 49 | Asymmetric Layouts | Modern offset layouts | Planned |
| 50 | Full-Width Header | Edge-to-edge header bar | Planned |

#### Modals & Overlays
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 51 | Slide-In Animation | Modal slides up from bottom | Planned |
| 52 | Scale Animation | Modal scales in from center | Planned |
| 53 | Blur Background More | Heavier backdrop blur | Planned |
| 54 | Modal Shadow | Strong shadow for depth | Planned |
| 55 | Rounded Modal Corners | Larger corner radius | Planned |
| 56 | Close Button Style | X button with hover circle | Planned |

#### Micro-Interactions
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 57 | Page Transitions | Fade between views | Planned |
| 58 | List Item Stagger | Items animate in sequence | Planned |
| 59 | Expand/Collapse Animation | Smooth height transitions | Planned |
| 60 | Notification Slide-In | Toast slides from right | Planned |
| 61 | Success Checkmark Animation | Animated check on save | Planned |
| 62 | Number Count Animation | Counters animate to value | Planned |
| 63 | Tab Switch Animation | Underline slides on tab change | Planned |

#### Input Fields
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 64 | Floating Labels | Labels animate above input | Planned |
| 65 | Input Focus Glow | Colored glow on focus | Planned |
| 66 | Filled Input Style | Solid background inputs | Planned |
| 67 | Input Icon Prefix | Icons inside input fields | Planned |
| 68 | Dropdown Arrow Style | Custom select arrows | Planned |
| 69 | Checkbox/Toggle Style | Modern toggle switches | Planned |
| 70 | Date Picker Styling | Custom styled date inputs | Planned |

#### Header & Navigation
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 71 | App Logo/Branding | Professional logo in header | Planned |
| 72 | Sticky Header | Header stays on scroll | Planned |
| 73 | Header Shadow on Scroll | Shadow appears when scrolled | Planned |
| 74 | Tab Underline Animation | Active tab indicator slides | Planned |
| 75 | Breadcrumb Navigation | Show current location | Planned |
| 76 | Search Bar Expansion | Search expands on focus | Planned |

#### Footer & Status Bar
| # | Enhancement | Description | Status |
|---|-------------|-------------|--------|
| 77 | Status Bar | Bottom bar with save status, version | Planned |
| 78 | Connection Indicator | Show data sync status | Planned |
| 79 | Last Saved Timestamp | "Saved 2 min ago" | Planned |
| 80 | Keyboard Shortcut Hints | Show shortcuts in footer | Planned |

---

### Quick Visual Wins (Priority Order)

| Priority | Enhancement | Effort | Files Changed | Status |
|----------|-------------|--------|---------------|--------|
| 1 | Larger border-radius on cards | 10 min | App.js | Done |
| 2 | Add box shadows to cards | 15 min | App.js, index.css | Done |
| 3 | Status pill badges instead of dots | 30 min | App.js | Done |
| 4 | Row hover highlight improvement | 15 min | index.css | Done |
| 5 | Button hover scale animation | 20 min | index.css | Done |
| 6 | Modal slide-in animation | 30 min | index.css | Done |
| 7 | Gradient primary button | 20 min | App.js | Done |
| 8 | Increase whitespace/padding | 30 min | App.js | Done |
| 9 | Add Inter font | 20 min | index.html, index.css | Done |
| 10 | Toast notification animation | 30 min | App.js, index.css | Done |
| 11 | Focus glow on inputs | 15 min | index.css | Done |
| 12 | Zebra striping on table | 15 min | App.js | Done |
| 13 | Sticky table header | 30 min | App.js, index.css | Done |
| 14 | Tab underline animation | 30 min | App.js, index.css | Done |
| 15 | Progress bar gradient | 20 min | App.js | Done |

---

### Implementation Notes

#### Backup Location
```
BACKUP_BEFORE_VISUAL_UPDATE/
├── App.js
├── index.css
├── main.js
├── package.json
├── preload.js
└── tailwind.config.js
```

#### Testing Checklist
- [ ] App launches without errors
- [ ] All buttons work correctly
- [ ] Modals open and close properly
- [ ] Data saves and loads correctly
- [ ] Search and filter work
- [ ] Status changes work
- [ ] Export/Import work
- [ ] No console errors

---

## License

MIT License - Free to use and modify.
