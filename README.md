# ClipNest AI - Production-Ready Clipboard & Screenshot Manager

> AI-first clipboard and screenshot manager desktop application for Windows, macOS, and Linux

## 🎯 Project Overview

ClipNest AI is a sophisticated desktop application that revolutionizes clipboard management by:

- **📋 Clipboard History**: Store up to 100 clipboard items (text, images, code, URLs)
- **📸 Screenshot Detection**: Automatically detect and organize screenshots
- **🎯 Global Shortcut**: Access overlay with `Cmd+Shift+Space` (macOS) or `Ctrl+Shift+Space` (Windows/Linux)
- **🔍 Smart Search**: Search by content or filter by type
- **⭐ Favorites**: Pin important items for quick access
- **🖼️ OCR Support**: Extract text from screenshots using Tesseract.js
- **🌙 Dark Mode**: Beautiful dark/light theme support
- **⚡ Lightweight**: Minimal overhead with efficient Electron integration

## 🏗️ Architecture

```
ClipNest AI
├── Electron Main Process (Node.js)
│   ├── Database Layer (SQLite)
│   ├── Clipboard Monitor
│   ├── Screenshot Detector
│   └── OCR Engine
├── React Frontend (UI Layer)
│   ├── Components
│   ├── Hooks
│   └── Styles (Tailwind CSS)
└── IPC Bridge (Secure Communication)
```

## 📦 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Desktop** | Electron | 25.0+ |
| **Frontend** | React | 18.2+ |
| **Styling** | Tailwind CSS | 3.3+ |
| **Database** | SQLite3 | 5.1+ |
| **OCR** | Tesseract.js | 4.1+ |
| **Runtime** | Node.js | 16+ |

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Git
- macOS 10.10+, Windows 7+, or Linux (Ubuntu 14.04+)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/clipnest-ai.git
cd clipnest-ai

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

### Development Commands

```bash
# Start Electron development environment
npm run dev

# Build React app for production
npm run build

# Run tests (if configured)
npm test

# Package for distribution
npm run dist
```

### Build for Specific OS

```bash
# macOS
npm run electron-build-mac

# Windows
npm run electron-build-win

# Linux
npm run electron-build-linux

# All platforms
npm run electron-build
```

## 📁 Project Structure

```
ClipNest-AI/
├── electron/
│   ├── main/
│   │   └── index.js              # Main Electron process
│   ├── preload/
│   │   └── preload.js            # Secure IPC bridge
│   └── services/
│       ├── clipboardService.js   # Clipboard monitoring
│       ├── screenshotService.js  # Screenshot detection
│       └── ocrService.js         # OCR functionality
├── src/
│   ├── components/
│   │   ├── App.jsx               # Root component
│   │   ├── Header.jsx            # Top header
│   │   ├── SearchBar.jsx         # Search interface
│   │   ├── ClipboardList.jsx     # Items list
│   │   └── ClipboardItem.jsx     # Individual item
│   ├── hooks/
│   │   └── useClipboard.js       # Custom hooks
│   ├── database/
│   │   ├── db.js                 # Database connection
│   │   ├── schema.js             # Database schema
│   │   └── operations.js         # CRUD operations
│   ├── styles/
│   │   └── globals.css           # Tailwind + custom CSS
│   └── index.jsx                 # React entry point
├── public/
│   └── index.html                # HTML template
├── assets/
│   └── icon.png                  # App icon
├── package.json                  # Dependencies & scripts
├── tailwind.config.js            # Tailwind configuration
└── README.md                     # This file
```

## 🔧 Core Features Explanation

### 1. Clipboard Monitoring

**File**: `electron/services/clipboardService.js`

The clipboard monitor polls the system clipboard every 1 second for changes:

```javascript
// Detects clipboard changes and saves to database
clipboardService.startMonitoring();

// Process flow:
// 1. Read clipboard content
// 2. Detect content type (text/code/image/url)
// 3. Create preview
// 4. Save to database
// 5. Emit IPC event to UI
```

**Key Methods**:
- `startMonitoring()` - Begin clipboard polling
- `stopMonitoring()` - Stop monitoring
- `copyToClipboard()` - Restore item to clipboard
- `detectContentType()` - Intelligent type detection

### 2. Screenshot Detection

**File**: `electron/services/screenshotService.js`

Watches the system screenshot folder (Desktop on macOS, Pictures/Screenshots on Windows):

```javascript
// Monitor folder for new screenshots
screenshotService.startMonitoring();

// Process flow:
// 1. Detect new image files in screenshot folder
// 2. Verify file is a screenshot (by name pattern)
// 3. Extract text using OCR
// 4. Save to database with OCR text
// 5. Allow searching by extracted text
```

**Key Methods**:
- `startMonitoring(folder)` - Start watching folder
- `isScreenshot(filename)` - Validate screenshot file
- `processScreenshot()` - Save to database

### 3. Database Layer

**Files**: `src/database/`

Uses SQLite3 for persistent local storage with this schema:

```sql
-- Main clipboard items table
CREATE TABLE clipboard_items (
  id TEXT PRIMARY KEY,
  type TEXT,              -- text/image/code/url
  content TEXT,           -- Main content
  file_path TEXT,         -- For images
  preview TEXT,           -- Truncated display
  source TEXT,            -- clipboard/screenshot
  created_at DATETIME,
  is_favorite BOOLEAN,    -- Starred items
  is_pinned BOOLEAN,      -- Always visible
  access_count INTEGER    -- Usage tracking
);

-- Tags for categorization
CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  color TEXT
);

-- Item-tag relationships
CREATE TABLE item_tags (
  item_id TEXT,
  tag_id INTEGER,
  PRIMARY KEY (item_id, tag_id)
);
```

**CRUD Operations** (`src/database/operations.js`):
- `addClipboardItem()` - Save new item
- `getClipboardItems()` - Fetch with pagination
- `searchClipboardItems()` - Full-text search
- `updateClipboardItem()` - Update item
- `deleteClipboardItem()` - Remove item

### 4. OCR Integration

**File**: `electron/services/ocrService.js`

Uses Tesseract.js for cross-platform text extraction:

```javascript
// Extract text from screenshot
const text = await extractTextFromImage('./screenshot.png');

// Features:
// - Caches results to avoid re-processing
// - Supports multiple languages
// - Progress callbacks for long operations
// - Batch processing support
```

### 5. IPC Communication

**Preload Script**: `electron/preload/preload.js`

Secure bridge between React and Electron main process:

```javascript
// From React component
const item = await window.api.clipboard.getItem(id);
await window.api.clipboard.copy(id);

// Event listener
window.api.onClipboardUpdate((newItem) => {
  console.log('New item:', newItem);
});
```

**Security Features**:
- Context isolation enabled
- Sandbox enabled
- Node integration disabled
- Only safe APIs exposed

### 6. Global Keyboard Shortcut

**File**: `electron/main/index.js`

Registers global shortcut accessible from anywhere:

```javascript
// Platform-specific shortcuts
const shortcut = process.platform === 'darwin' 
  ? 'Cmd+Shift+Space'      // macOS
  : 'Ctrl+Shift+Space';     // Windows/Linux

globalShortcut.register(shortcut, () => {
  toggleOverlay();  // Show/hide overlay window
});
```

## 💾 Database Operations

### Adding an Item

```javascript
// From service layer
const item = await addClipboardItem({
  type: 'text',
  content: 'copied text',
  preview: 'copied text',  // First 100 chars
  source: 'clipboard',
  metadata: { detectedType: 'text' }
});
```

### Searching Items

```javascript
// Full-text search
const results = await searchClipboardItems(
  'python',           // Search term
  'code',             // Filter by type (optional)
  20                  // Result limit
);
```

### Favorites

```javascript
// Toggle favorite
const item = await toggleFavorite(itemId);

// Get all favorites
const favorites = await getFavoriteItems(20);
```

## 🎨 UI/UX Design

### Color Scheme

```
Primary: #6366f1 (Indigo)
Secondary: #8b5cf6 (Purple)
Dark Mode: #0f172a (Slate)
Light Mode: #f1f5f9 (Light Slate)
```

### Component Hierarchy

```
App
├── Header
│   ├── Branding
│   ├── Dark Mode Toggle
│   ├── Settings
│   └── Close Button
├── SearchBar
│   ├── Text Input
│   └── Type Filters
├── Tabs
│   ├── Recent Items
│   └── Favorites
├── ClipboardList
│   └── ClipboardItem[] (infinite scroll)
│       ├── Type Badge
│       ├── Preview
│       ├── Timestamp
│       ├── Copy Button
│       ├── Delete Button
│       └── Favorite Toggle
└── Footer
    └── Stats & Shortcuts
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+Shift+Space` | Show/hide overlay |
| `Cmd/Ctrl+K` | Focus search |
| `Escape` | Close overlay |
| `Enter` | Copy item (when focused) |
| `Delete` | Delete item |

## 🔒 Security Considerations

### Implemented

✅ Context isolation in Electron
✅ Sandbox enabled for renderer
✅ Node integration disabled
✅ Only safe APIs exposed via preload
✅ Prepared statements in database queries
✅ No sensitive data in logs
✅ Local-only storage (no cloud sync by default)

### Best Practices

⚠️ Future: Add data encryption at rest
⚠️ Future: Implement clipboard data encryption
⚠️ Future: Add authentication for multi-device sync
⚠️ Future: Regular security audits

## 📊 Performance Optimization

### Database

- **Indexing**: Queries on `created_at`, `type`, `is_favorite`
- **Pagination**: Prevents loading all items at once
- **Cleanup**: Enforces max 100 items, deletes oldest first
- **Caching**: OCR results cached in memory

### UI

- **Virtual Scrolling**: Only renders visible items
- **Debounced Search**: Prevents excessive DB queries
- **Code Splitting**: React components lazy loaded
- **Production Build**: Minified and optimized

### Electron

- **Preload Size**: Minimized to < 50KB
- **Memory Management**: Clean IPC listeners
- **File Watching**: Efficient fs.watch for screenshots

## 🧪 Testing Strategy

### Unit Tests (Future)

```javascript
// Test database operations
test('should add clipboard item', async () => {
  const item = await addClipboardItem({
    type: 'text',
    content: 'test'
  });
  expect(item.id).toBeDefined();
});
```

### Integration Tests (Future)

```javascript
// Test IPC communication
test('should fetch items via IPC', async () => {
  const items = await window.api.clipboard.getItems(10, 0);
  expect(items).toBeArray();
});
```

### E2E Tests (Future)

```javascript
// Test complete workflow
test('should copy item to clipboard', async () => {
  // 1. Add item to DB
  // 2. Click copy button
  // 3. Verify system clipboard content
});
```

## 🚀 Production Deployment

### Build Process

```bash
# 1. Install dependencies
npm install

# 2. Build React app
npm run build

# 3. Create installer
npm run dist

# 4. Upload to releases
```

### Code Signing (macOS)

```bash
# Sign executable
codesign -s - dist/ClipNest\ AI.app

# Create DMG with signature
create-dmg dist/ClipNest\ AI.app dist/
```

### Notarization (macOS)

```bash
# Required for macOS 10.15+
xcrun altool --notarize-app -f dist/ClipNest\ AI.dmg \
  -u apple-id@example.com \
  -p app-specific-password
```

## 🔮 Future Roadmap

### Phase 1: MVP ✅

- [x] Clipboard monitoring
- [x] Screenshot detection
- [x] Basic UI
- [x] Search functionality
- [x] Dark mode

### Phase 2: Enhanced Features 🚧

- [ ] API Integration:
  - [ ] OpenAI integration (send to ChatGPT)
  - [ ] Google Gemini integration
  - [ ] Claude integration
- [ ] OCR improvements (multiple languages)
- [ ] Keyboard macro support
- [ ] Customizable hotkeys

### Phase 3: Advanced 📋

- [ ] Cloud synchronization
- [ ] Multi-device sync
- [ ] AI categorization
- [ ] Smart suggestions
- [ ] Webhook integrations
- [ ] Plugin system

### Phase 4: Enterprise

- [ ] End-to-end encryption
- [ ] Team collaboration
- [ ] Audit logs
- [ ] Admin dashboard

## 📚 Learning Resources

### Electron

- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
- [IPC Communication](https://www.electronjs.org/docs/api/ipc-renderer)
- [Best Practices](https://www.electronjs.org/docs/tutorial/electron-security)

### React

- [React Hooks](https://react.dev/reference/react)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Context API](https://react.dev/reference/react/useContext)

### SQLite

- [SQLite3 Node.js](https://github.com/mapbox/node-sqlite3)
- [Query Optimization](https://www.sqlite.org/queryplanner.html)
- [PRAGMA Statements](https://www.sqlite.org/pragma.html)

### Tesseract OCR

- [Tesseract.js](https://github.com/naptha/tesseract.js)
- [Supported Languages](https://github.com/naptha/tesseract.js-core/blob/master/README.md)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/clipnest-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/clipnest-ai/discussions)
- **Email**: support@clipnest.ai

## 📝 Resume Summary

**ClipNest AI** is a full-stack Electron + React desktop application demonstrating:

### Technical Skills

✅ **Frontend**: React 18, Hooks, State Management
✅ **Desktop**: Electron, IPC Communication, Native APIs
✅ **Backend**: Node.js, SQLite3, Database Design
✅ **Styling**: Tailwind CSS, Dark Mode, Responsive UI
✅ **APIs**: Global Shortcuts, Clipboard, File System Watching
✅ **Security**: Context Isolation, Sandbox, Secure IPC
✅ **DevOps**: Build Optimization, Code Signing, Distribution

### Architecture Patterns

✅ **Clean Architecture**: Separated concerns (UI, Services, Database)
✅ **Service Layer**: Modular clipboard, screenshot, OCR services
✅ **IPC Bridge**: Secure electron main ↔ renderer communication
✅ **Custom Hooks**: Reusable React logic (useClipboard, useDarkMode)
✅ **Database Abstraction**: Query builder pattern
✅ **Event-Driven**: Real-time clipboard updates via IPC events

### Production Features

✅ **Dark Mode**: System preference detection + manual toggle
✅ **Performance**: Database indexing, pagination, caching
✅ **UX**: Keyboard shortcuts, search, filtering, infinite scroll
✅ **Reliability**: Error handling, cleanup on exit
✅ **Accessibility**: Keyboard navigation, semantic HTML

---

**Built with ❤️ by [Your Name]**

Last Updated: May 2026
