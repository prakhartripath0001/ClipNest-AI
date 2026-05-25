/**
 * PROJECT FILE INDEX
 * ==================
 * 
 * Complete index of all files in ClipNest AI with descriptions
 */

# ClipNest AI - Complete File Index

## 📑 Quick Navigation

| Category | Files | Purpose |
|----------|-------|---------|
| **Configuration** | package.json, tailwind.config.js | Project metadata, dependencies, build config |
| **Entry Points** | index.js, src/index.jsx, public/index.html | Electron entry, React entry, HTML template |
| **Electron Main** | electron/main/index.js | App lifecycle, IPC handlers, services |
| **Preload/IPC** | electron/preload/preload.js | Secure bridge between Electron and React |
| **Services** | electron/services/* | Background services (clipboard, OCR, etc.) |
| **Database** | src/database/* | SQLite schema, connection, operations |
| **React Components** | src/components/* | UI components (App, Header, List, etc.) |
| **React Hooks** | src/hooks/* | Custom React hooks for state management |
| **Utilities** | src/utils/helpers.js | Helper functions for components |
| **Styling** | src/styles/globals.css | Tailwind CSS and custom styles |
| **Documentation** | README.md, ARCHITECTURE.md, etc. | Guides and reference docs |

---

## 🗂️ Complete File Tree

```
ClipNest-AI/
│
├── 📄 Configuration Files
│   ├── package.json                    # Dependencies, scripts, app metadata
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS plugins (autoprefixer, tailwind)
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── .eslintrc.json                 # ESLint rules and configuration
│   ├── .env                           # Environment variables (local)
│   ├── .env.example                   # Environment template
│   ├── .gitignore                     # Git ignore patterns
│   ├── index.js                       # Electron entry point
│   └── README.md                      # Main documentation
│
├── 📁 Public Assets
│   └── public/
│       └── index.html                 # React HTML template
│
├── 🔧 Electron Main Process
│   └── electron/
│       ├── main/
│       │   └── index.js               # Main Electron process (lifecycle, IPC)
│       ├── preload/
│       │   └── preload.js             # Secure IPC bridge (context isolated)
│       └── services/
│           ├── clipboardService.js    # Monitor clipboard changes
│           ├── screenshotService.js   # Detect screenshot files
│           └── ocrService.js          # Extract text from images
│
├── ⚛️ React Frontend
│   └── src/
│       ├── App.jsx                    # Root React component
│       ├── index.jsx                  # React entry point
│       ├── components/
│       │   ├── Header.jsx             # Top header with controls
│       │   ├── SearchBar.jsx          # Search + type filter interface
│       │   ├── ClipboardList.jsx      # Infinite scroll list container
│       │   └── ClipboardItem.jsx      # Individual clipboard item card
│       ├── hooks/
│       │   └── useClipboard.js        # Custom hooks for clipboard/settings
│       ├── utils/
│       │   └── helpers.js             # Utility functions (format, debounce, etc.)
│       ├── styles/
│       │   └── globals.css            # Tailwind CSS + custom styles
│       └── database/
│           ├── db.js                  # Database connection & utilities
│           ├── schema.js              # Database schema definitions
│           └── operations.js          # CRUD operations for clipboard items
│
├── 📚 Documentation
│   ├── README.md                      # Project overview & quick start
│   ├── QUICKSTART.md                  # 5-minute setup guide
│   ├── ARCHITECTURE.md                # System architecture & design patterns
│   ├── CONTRIBUTING.md                # Contribution guidelines
│   ├── TROUBLESHOOTING.md             # Debug & issue resolution
│   ├── RESUME_GUIDE.md                # Resume summary & deployment
│   └── FILE_INDEX.md                  # This file
│
└── 🎨 Assets
    └── assets/
        └── icon.png                   # App icon (placeholder)
```

---

## 📄 File Descriptions & Key Points

### Configuration Files

#### `package.json` (263 lines)
**Purpose**: Define project metadata, dependencies, and npm scripts

**Key Sections**:
- `main`: Electron entry point (index.js)
- `scripts`: npm commands (dev, build, dist, etc.)
- `dependencies`: Runtime dependencies (React, Electron, SQLite, Tesseract.js)
- `devDependencies`: Development tools (electron-builder, tailwind, etc.)
- `build`: Electron builder configuration (app ID, signing, packaging)

**Usage**:
```bash
npm install          # Install all dependencies
npm run dev          # Start development
npm run dist         # Create installer
```

#### `tailwind.config.js` (20 lines)
**Purpose**: Customize Tailwind CSS theme

**Customizations**:
- Custom colors (primary, secondary, dark, light)
- Box shadow effects
- Dark mode configuration
- Animation utilities

#### `.eslintrc.json` (28 lines)
**Purpose**: Define code style and quality rules

**Rules Enforced**:
- 2-space indentation
- Single quotes
- Semicolons required
- No unused variables (warning)

---

### Entry Points

#### `index.js` (7 lines)
**Purpose**: Tell Electron where to find the main process

**Content**:
```javascript
module.exports = require('./dist/electron/main/index.js');
```

**Note**: Points to built file in dist/, created during build

#### `src/index.jsx` (14 lines)
**Purpose**: React application entry point

**Does**:
1. Imports React and ReactDOM
2. Renders App component into #root
3. Loads global styles

#### `public/index.html` (18 lines)
**Purpose**: HTML template for React

**Important**:
- Creates `<div id="root"></div>` for React
- Sets charset, viewport, theme color
- Provides page title and meta description

---

### Electron Main Process

#### `electron/main/index.js` (380+ lines)
**Purpose**: Core Electron process managing app lifecycle and IPC

**Major Functions**:
- `createOverlayWindow()` - Create floating overlay
- `toggleOverlay()` - Show/hide window
- `app.on('ready')` - Initialize all systems
- `globalShortcut.register()` - Register keyboard shortcut
- `ipcMain.handle()` - Define IPC endpoints

**IPC Handlers** (10+ endpoints):
- `clipboard:getItems` - Fetch clipboard items
- `clipboard:copy` - Restore item to clipboard
- `clipboard:search` - Search items
- `window:close/focus/minimize` - Window control
- `settings:get/set/toggleDarkMode` - App settings

**Services Initialized**:
- Database connection
- Clipboard monitoring
- Screenshot detection
- System tray menu

---

### Preload & IPC Bridge

#### `electron/preload/preload.js` (160+ lines)
**Purpose**: Secure bridge between React and Electron

**Security Model**:
- Context isolation enabled
- Only exposes safe APIs via `window.api`
- No direct Node.js or process access from React

**Exposed APIs**:

```javascript
window.api.clipboard     // Read/write clipboard items
window.api.window        // Window control
window.api.settings      // App settings
window.api.listeners     // Subscribe to events
```

**Key Methods**:
- `invoke()` - Call main process and wait for response
- `send()` - One-way message to main
- `on()` - Listen for events from main

---

### Services

#### `electron/services/clipboardService.js` (180+ lines)
**Purpose**: Monitor system clipboard for changes

**Process**:
1. Polls clipboard every 1 second
2. Detects content type (text/code/image/url)
3. Creates preview (first 100 chars)
4. Saves to database
5. Emits IPC event to React

**Key Functions**:
- `startMonitoring()` - Begin polling
- `stopMonitoring()` - Stop polling
- `detectContentType()` - Identify content type
- `copyToClipboard()` - Restore item to clipboard

**Type Detection**:
- URL: Matches `https?://` pattern
- Code: Checks for syntax indicators
- Text: Default fallback

#### `electron/services/screenshotService.js` (160+ lines)
**Purpose**: Detect and process new screenshots

**Process**:
1. Watch screenshot folder
2. Validate file is screenshot (by name)
3. Wait for file write to complete (500ms)
4. Extract text using OCR
5. Save to database with OCR text

**Key Functions**:
- `startMonitoring()` - Start watching folder
- `isScreenshot()` - Validate screenshot file
- `processScreenshot()` - Save to database

**Platform Support**:
- macOS: ~/Desktop
- Windows: ~/Pictures/Screenshots
- Linux: ~/Pictures

#### `electron/services/ocrService.js` (130+ lines)
**Purpose**: Extract text from images using Tesseract.js

**Features**:
- Extract text from PNG/JPG
- Caches results (max 100 entries)
- Progress callbacks for long operations
- Batch processing support

**Key Functions**:
- `extractTextFromImage()` - Extract text, with caching
- `extractTextWithProgress()` - With progress callback
- `clearCache()` - Memory management

**Performance**:
- Caching prevents re-processing
- LRU removal when cache exceeds 100 entries
- Async processing doesn't block UI

---

### Database Layer

#### `src/database/db.js` (140 lines)
**Purpose**: SQLite3 connection and utilities

**Functions**:
- `init()` - Initialize database and create tables
- `query()` - Fetch multiple rows
- `queryOne()` - Fetch single row
- `run()` - Execute INSERT/UPDATE/DELETE
- `close()` - Close database connection

**Security**:
- Uses prepared statements (parameterized queries)
- Prevents SQL injection
- Foreign keys enabled

**Database Location**:
```
macOS:   ~/.config/ClipNest-AI/clipnest.db
Windows: %APPDATA%/ClipNest-AI/clipnest.db
Linux:   ~/.config/ClipNest-AI/clipnest.db
```

#### `src/database/schema.js` (60 lines)
**Purpose**: Define database table structure

**Tables**:
- `clipboard_items` - Main storage (id, type, content, timestamp, etc.)
- `tags` - Category tags
- `item_tags` - Relationship between items and tags
- `settings` - App configuration

**Indexes**:
- `idx_clipboard_created_at` - For sorting
- `idx_clipboard_type` - For filtering
- `idx_clipboard_is_favorite` - For favorites query
- `idx_clipboard_is_pinned` - For pinned items

#### `src/database/operations.js` (280+ lines)
**Purpose**: High-level CRUD operations for clipboard items

**Functions**:
- `addClipboardItem()` - Insert new item
- `getClipboardItems()` - Fetch with pagination
- `searchClipboardItems()` - Full-text search
- `deleteClipboardItem()` - Remove item
- `toggleFavorite()` - Star/unstar item
- `clearClipboardHistory()` - Bulk delete non-favorites

**Features**:
- Automatic max items enforcement (100)
- Pagination support
- Full-text search on content + preview
- Duplicate prevention

---

### React Components

#### `src/App.jsx` (130+ lines)
**Purpose**: Root React component orchestrating all features

**Structure**:
```
App
├─ Header (logo, controls)
├─ Tabs (Recent/Favorites)
├─ SearchBar (search + filters)
├─ ClipboardList (items)
└─ Footer (stats)
```

**State Management**:
- `activeTab` - Current view (recent/favorites)
- `offset` - Pagination offset
- `hasMore` - More items available flag

**Handlers**:
- `handleLoadMore()` - Load next page
- `handleSearch()` - Search and filter
- `handleClearSearch()` - Reset to default view

**Keyboard Shortcuts**:
- Escape - Close overlay
- Cmd+K - Focus search

#### `src/components/Header.jsx` (50 lines)
**Purpose**: Top header with app name and controls

**Features**:
- App branding (emoji logo + title)
- Dark mode toggle
- Settings button
- Close button

#### `src/components/SearchBar.jsx` (70 lines)
**Purpose**: Search input and type filters

**Features**:
- Real-time search
- Type filter buttons (All/Text/Code/Image/URL)
- Keyboard shortcut (Cmd+K)
- Clear button

#### `src/components/ClipboardList.jsx` (80 lines)
**Purpose**: Display list of clipboard items

**Features**:
- Infinite scroll with intersection observer
- Loading states
- Empty state message
- Error handling

#### `src/components/ClipboardItem.jsx` (120+ lines)
**Purpose**: Individual clipboard item card

**Features**:
- Type badge (emoji + label)
- Preview text (truncated)
- Timestamp (relative time)
- Copy button
- Delete button
- Favorite toggle
- Access count

---

### React Hooks

#### `src/hooks/useClipboard.js` (130+ lines)
**Purpose**: Custom hooks for state management

**Hooks Provided**:
- `useClipboard()` - Clipboard state & methods
- `useSettings()` - App settings management
- `useDarkMode()` - Dark mode state
- `useClipboardListener()` - Listen to IPC events
- `useKeyPress()` - Keyboard event handling

**Example Usage**:
```javascript
const { items, loading, search } = useClipboard();
const { isDark, toggle } = useDarkMode();
```

---

### Utilities

#### `src/utils/helpers.js` (160+ lines)
**Purpose**: Reusable utility functions

**Functions**:
- `formatFileSize()` - Human-readable file size
- `truncateText()` - Limit text length
- `getRelativeTime()` - "2 hours ago" format
- `stringToColor()` - Generate color from string
- `debounce()` - Debounce function calls
- `isValidURL()` - URL validation
- `isLikelyCode()` - Detect if text is code
- `sleep()` - Async sleep/delay
- `retry()` - Retry failed promises

---

### Styling

#### `src/styles/globals.css` (120+ lines)
**Purpose**: Tailwind CSS customization and custom styles

**Sections**:
- Custom color variables
- Scrollbar styling
- Animations (float, slide-in, fade-in)
- Component utility classes (.btn, .card, .badge)
- Input styling

---

### Documentation

#### `README.md` (450+ lines)
**Main Documentation**

**Sections**:
- Project overview & goals
- Tech stack
- Quick start guide
- Project structure
- Features explanation
- Database operations
- UI/UX design
- Security & performance
- Roadmap
- Resume summary

**Target Audience**: Users & developers

#### `ARCHITECTURE.md` (600+ lines)
**Deep Dive Documentation**

**Sections**:
- System architecture diagrams
- Component descriptions
- Data flow explanations
- Extension points
- Performance considerations
- Security audits
- Debugging guide
- Deployment strategies

**Target Audience**: Senior developers, architects

#### `QUICKSTART.md` (150+ lines)
**Getting Started Guide**

**Sections**:
- 5-minute setup
- Common issues & fixes
- Useful commands
- Next steps

**Target Audience**: New developers

#### `CONTRIBUTING.md` (100+ lines)
**Contribution Guidelines**

**Sections**:
- Code of conduct
- Development workflow
- Commit guidelines
- PR process
- Area-specific guidelines

**Target Audience**: Contributors

#### `TROUBLESHOOTING.md` (300+ lines)
**Debug & Issue Resolution**

**Sections**:
- General troubleshooting
- Database issues
- Clipboard issues
- Screenshot detection issues
- Search issues
- Keyboard shortcut issues
- UI/Display issues
- Performance issues
- Deployment issues
- Maintenance commands

**Target Audience**: Users & developers

#### `RESUME_GUIDE.md` (400+ lines)
**Resume Summary & Deployment**

**Sections**:
- Project impact & metrics
- Technical skills demonstrated
- Architecture highlights
- Production-ready features
- Security audits
- Deployment checklist
- Interview preparation
- Resume bullet points

**Target Audience**: Developers creating portfolio/resume

---

## 🎯 File Statistics

| Category | Count | Lines | Purpose |
|----------|-------|-------|---------|
| Core Configuration | 8 | 150 | Project setup & build config |
| Electron Main | 1 | 380+ | App lifecycle & IPC |
| Services | 3 | 470+ | Background processing |
| Database | 3 | 480+ | Data persistence |
| React Components | 4 | 370+ | UI rendering |
| React Hooks | 1 | 130+ | State management |
| Utilities | 2 | 280+ | Helper functions |
| Styling | 1 | 120+ | Visual styling |
| Documentation | 8 | 2500+ | Guides & references |
| **TOTAL** | **31** | **5300+** | **Complete application** |

---

## 🚀 Getting Started with Each File

### First-Time Setup
1. Read `README.md` for overview
2. Follow `QUICKSTART.md` for setup
3. Read `ARCHITECTURE.md` to understand design

### Development
1. Modify React components in `src/components/`
2. Add hooks in `src/hooks/`
3. Update database operations in `src/database/`
4. Test with `npm run dev`

### Adding Features
1. Check `ARCHITECTURE.md` for extension points
2. Add service in `electron/services/`
3. Create React component in `src/components/`
4. Update IPC handlers in `electron/main/index.js`
5. Expose API in `electron/preload/preload.js`

### Debugging Issues
1. Check `TROUBLESHOOTING.md` for your issue
2. Enable debug logs in relevant service
3. Use DevTools (F12) to inspect React
4. Check database directly with sqlite3

### Deploying
1. Follow `RESUME_GUIDE.md` deployment section
2. Sign code (macOS/Windows)
3. Create GitHub release
4. Test on target OS

---

## 📊 Dependency Map

```
package.json
├─ Electron (desktop framework)
├─ React (UI framework)
├─ Tailwind CSS (styling)
├─ SQLite3 (database)
├─ Tesseract.js (OCR)
└─ Supporting tools...

electron/main/index.js
├─ electron (app APIs)
├─ electron-is-dev (dev detection)
├─ Database layer
├─ Services
└─ Node.js core modules

src/App.jsx
├─ React (UI)
├─ Custom hooks
├─ Components
├─ Tailwind CSS
└─ IPC bridge (via preload)

electron/services/*
├─ Node.js APIs
├─ Electron clipboard/globalShortcut
├─ SQLite operations
├─ Tesseract.js (OCR only)
└─ File system (fs)
```

---

## 💾 Checklist for New Developers

- [ ] Read README.md
- [ ] Run QUICKSTART.md setup
- [ ] Successfully start `npm run dev`
- [ ] See clipboard item appear
- [ ] Review ARCHITECTURE.md
- [ ] Read through electron/main/index.js
- [ ] Read through src/App.jsx
- [ ] Explore database schema (src/database/schema.js)
- [ ] Make first code change (update emoji)
- [ ] Complete first feature or bug fix

---

**Last Updated**: May 2026
**Total Lines of Code**: 5300+
**Total Files**: 31
**Documentation**: 2500+ lines
