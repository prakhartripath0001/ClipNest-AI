/**
 * ARCHITECTURE GUIDE
 * ==================
 * 
 * Comprehensive guide explaining ClipNest AI's architecture,
 * design decisions, and how to extend it.
 */

# ClipNest AI - Architecture & Design Guide

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    System User                              │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │ System   │            │ Global  │
    │ Clipboard│            │ Hotkey  │
    │          │            │ Listener│
    └────┬─────┘            └────┬────┘
         │                        │
         └───────────┬────────────┘
                     │
         ┌───────────▼──────────────┐
         │   Electron Main          │
         │   Process (Node.js)      │
         ├──────────────────────────┤
         │ - GlobalShortcut API     │
         │ - Clipboard API          │
         │ - IPC Router             │
         │ - Service Layer          │
         └───────┬────────────┬─────┘
                 │            │
        ┌────────▼─┐   ┌──────▼────┐
        │ Services │   │ Database   │
        ├──────────┤   ├────────────┤
        │ Clipboard│   │ SQLite3    │
        │ OCR      │   │ Schema     │
        │ Screenshot   │ Operations │
        └────────────┘  └────┬───────┘
                             │
                        ┌────▼──────┐
                        │ ~/.config/ │
                        │ clipnest   │
                        │ app.db     │
                        └─────────────┘
         
         ┌──────────────────────────────────┐
         │ React Frontend (Renderer)        │
         ├──────────────────────────────────┤
         │ - Components (Hooks-based)       │
         │ - IPC Client (Preload)           │
         │ - Dark Mode Support              │
         │ - Tailwind CSS Styling           │
         └──────────────────────────────────┘
```

## 2. Core Components

### 2.1 Electron Main Process

**File**: `electron/main/index.js`

**Responsibilities**:
- App lifecycle management
- Window creation and management
- IPC request handling
- Global shortcut registration
- Service initialization

**Key Functions**:
```javascript
// Window Management
createOverlayWindow()    // Creates floating overlay
toggleOverlay()          // Show/hide overlay

// IPC Handlers
ipcMain.handle('clipboard:getItems', ...)
ipcMain.handle('clipboard:copy', ...)
ipcMain.on('window:close', ...)

// Services
clipboardService.startMonitoring()
screenshotService.startMonitoring()
```

**Lifecycle Flow**:
```
app.on('ready')
  ├─ db.init() - Initialize database
  ├─ createOverlayWindow() - Create UI
  ├─ clipboardService.startMonitoring() - Start monitoring
  ├─ screenshotService.startMonitoring() - Watch screenshots
  ├─ globalShortcut.register() - Register hotkey
  └─ createTrayMenu() - System tray

app.on('before-quit')
  ├─ globalShortcut.unregisterAll()
  ├─ clipboardService.stopMonitoring()
  ├─ screenshotService.stopMonitoring()
  └─ db.close()
```

### 2.2 Services Layer

#### Clipboard Service

**File**: `electron/services/clipboardService.js`

**Process**:
```
Every 1 second (POLLING_INTERVAL)
  │
  ├─ Read system clipboard
  │
  ├─ Detect content type
  │  ├─ URL detection (regex)
  │  ├─ Code detection (syntax)
  │  └─ Text/Image default
  │
  ├─ Create preview (truncate to 100 chars)
  │
  ├─ Save to database
  │  ├─ addClipboardItem()
  │  └─ enforceMaxItems() - Keep only 100
  │
  └─ Emit IPC event
     └─ 'clipboard:updated' (to React)
```

#### Screenshot Service

**File**: `electron/services/screenshotService.js`

**Process**:
```
Watch /Users/[user]/Desktop (macOS)
  │
  ├─ Detect new .png/.jpg files
  │
  ├─ Validate filename (contains "Screenshot")
  │
  ├─ Wait 500ms (ensure file write complete)
  │
  ├─ Extract OCR text
  │  └─ ocrService.extractTextFromImage()
  │
  ├─ Calculate file hash (duplicate detection)
  │
  └─ Save to database
     ├─ type: 'image'
     ├─ filePath: path to screenshot
     ├─ content: OCR text (for searching)
     └─ metadata: dimensions, size
```

#### OCR Service

**File**: `electron/services/ocrService.js`

**Implementation**:
```
extractTextFromImage(imagePath)
  │
  ├─ Check cache first
  │  └─ Return if cached
  │
  ├─ Load Tesseract.js model (async)
  │
  ├─ Process image
  │  ├─ Resize/normalize
  │  ├─ Run recognition
  │  └─ Extract text
  │
  ├─ Cache result (max 100 entries)
  │
  └─ Return text string
```

**Caching Strategy**:
```javascript
// Prevent re-processing same images
const ocrCache = new Map();

// Keep memory bounded
if (ocrCache.size > 100) {
  const firstKey = ocrCache.keys().next().value;
  ocrCache.delete(firstKey);
}
```

### 2.3 Database Layer

**Files**: `src/database/`

**Schema Hierarchy**:

```
clipboard_items (main table)
├─ id (UUID primary key)
├─ type (text/image/code/url)
├─ content (full content or OCR text)
├─ file_path (for image types)
├─ preview (truncated display text)
├─ source (clipboard/screenshot)
├─ created_at (timestamp)
├─ is_favorite (boolean)
├─ is_pinned (boolean)
├─ access_count (usage tracking)
└─ metadata (JSON for extensibility)

Indexes (for performance)
├─ idx_clipboard_created_at
├─ idx_clipboard_type
├─ idx_clipboard_is_favorite
└─ idx_clipboard_is_pinned
```

**Query Optimization**:

```javascript
// Get 20 most recent items
SELECT * FROM clipboard_items 
ORDER BY created_at DESC 
LIMIT 20
// Uses index on created_at

// Search for code items
SELECT * FROM clipboard_items 
WHERE (content LIKE '%python%' OR preview LIKE '%python%')
  AND type = 'code'
ORDER BY created_at DESC
// Scans type, filters on created_at index

// Enforce max items
DELETE FROM clipboard_items 
WHERE id IN (
  SELECT id FROM clipboard_items 
  WHERE is_pinned = 0 
  ORDER BY access_count, accessed_at, created_at ASC 
  LIMIT ?
)
// Deletes oldest, unpinned items first
```

### 2.4 IPC Communication

**Preload Script**: `electron/preload/preload.js`

**Security Model**:
```
React App                 System
   │                        │
   ├─ No Node.js ────────────┤
   ├─ No require() ──────────┤
   ├─ No process ────────────┤
   │                        │
   └─ Preload Bridge        │
      (Context Isolated)    │
      │                     │
      ├─ Exposed APIs:      │
      │  └─ window.api      │
      │     ├─ clipboard.*  │
      │     ├─ window.*     │
      │     ├─ settings.*   │
      │     └─ listeners    │
      │                     │
      └─ IPC Channels ──────►
         ├─ invoke (call + response)
         ├─ send (one-way)
         └─ on (listen)
                             │
                    Main Process
                    (Node.js)
                    │
                    ├─ Database Access
                    ├─ File System
                    ├─ System APIs
                    └─ External Services
```

**Communication Patterns**:

```javascript
// Pattern 1: Request-Response (invoke)
// React Component
const items = await window.api.clipboard.getItems(20, 0);

// Main Process Handler
ipcMain.handle('clipboard:getItems', async (event, { limit, offset }) => {
  return await getClipboardItems(limit, offset);
});

// Pattern 2: One-Way Event (send)
// React Component
window.api.window.close();

// Main Process Handler
ipcMain.on('window:close', () => {
  overlayWindow.hide();
});

// Pattern 3: Subscription (on)
// React Component
window.api.onClipboardUpdate((data) => {
  console.log('New item:', data);
});

// Main Process Emit
overlayWindow.webContents.send('clipboard:updated', item);
```

### 2.5 React Frontend

**File**: `src/App.jsx`

**Component Tree**:
```
App (Main component)
├─ Header
│  ├─ Branding
│  ├─ DarkModeToggle
│  ├─ SettingsButton
│  └─ CloseButton
│
├─ Main Content
│  ├─ TabsBar
│  │  ├─ RecentTab
│  │  └─ FavoritesTab
│  │
│  ├─ SearchBar
│  │  ├─ TextInput
│  │  └─ TypeFilters
│  │
│  └─ ClipboardList
│     └─ ClipboardItem[] (mapped with key)
│        ├─ TypeBadge
│        ├─ Preview
│        ├─ Timestamp
│        ├─ CopyButton
│        ├─ DeleteButton
│        └─ FavoriteToggle
│
└─ Footer
   └─ Stats & Hints
```

**State Management**:
```javascript
// Using custom hooks and React hooks
const {
  items,           // Current items
  loading,         // Loading state
  error,           // Error message
  getItems,        // Fetch items
  copy,            // Copy item
  search,          // Search items
} = useClipboard();

const { isDark, toggle } = useDarkMode();

// Local state
const [activeTab, setActiveTab] = useState('recent');
const [offset, setOffset] = useState(0);
```

## 3. Data Flow

### Adding a Clipboard Item

```
1. User copies text "import React"
   │
2. Clipboard Monitor (running every 1s)
   ├─ Reads clipboard
   ├─ Compares with lastClipboardContent
   └─ Change detected!
   │
3. clipboardService.checkClipboardChange()
   ├─ detectContentType() → "code"
   ├─ createPreview() → "import React"
   └─ Calls addClipboardItem()
   │
4. Database Operation
   ├─ INSERT into clipboard_items
   │  (id, type, content, preview, created_at, ...)
   ├─ enforceMaxItems(100)
   │  └─ DELETE oldest if > 100
   └─ Return item object
   │
5. IPC Event Emission
   ├─ overlayWindow.webContents.send('clipboard:updated', item)
   │
6. React Listener
   ├─ window.api.onClipboardUpdate() receives item
   ├─ Prepends to items array
   └─ UI re-renders with new item
   │
7. User sees new item at top of list! ✅
```

### Searching Items

```
1. User types "python" in search box
   │
2. handleSearchChange() debounced
   ├─ Calls window.api.clipboard.search('python', null)
   │
3. IPC Handler 'clipboard:search'
   ├─ Calls searchClipboardItems('python', null, 20)
   │
4. Database Query
   ├─ SELECT * FROM clipboard_items
   ├─ WHERE (content LIKE '%python%'
   │   OR preview LIKE '%python%')
   ├─ ORDER BY created_at DESC
   └─ LIMIT 20
   │
5. Query Results
   ├─ Return matching items array
   │
6. React Update
   ├─ setItems(results)
   ├─ setHasMore(false)
   └─ UI re-renders with search results
   │
7. User sees filtered items! ✅
```

## 4. Extension Points

### Adding a New Feature

**Example**: "Copy to Cloud Service" button

```javascript
// 1. Add IPC Handler (main/index.js)
ipcMain.handle('cloud:uploadItem', async (event, { id }) => {
  const item = await getClipboardItemById(id);
  const result = await uploadToCloud(item);
  return result;
});

// 2. Expose in Preload (preload/preload.js)
contextBridge.exposeInMainWorld('api', {
  // ... existing API
  cloud: {
    uploadItem: (id) => ipcRenderer.invoke('cloud:uploadItem', { id }),
  },
});

// 3. Create Cloud Service (electron/services/cloudService.js)
async function uploadToCloud(item) {
  // Implement cloud upload logic
}

// 4. Add UI Button (components/ClipboardItem.jsx)
<button onClick={() => window.api.cloud.uploadItem(item.id)}>
  ☁️ Upload
</button>
```

### Adding Database Fields

```sql
-- 1. Update schema (src/database/schema.js)
ALTER TABLE clipboard_items ADD COLUMN category TEXT;
ALTER TABLE clipboard_items ADD COLUMN tags TEXT;

-- 2. Create migration script (src/database/migrations.js)
async function migrate_v2() {
  await db.run(
    'ALTER TABLE clipboard_items ADD COLUMN category TEXT'
  );
}

-- 3. Update operations (src/database/operations.js)
async function addWithCategory(item, category) {
  // Use new field
}

-- 4. Update React component
// Use new field in display/filtering
```

### Adding Service

```javascript
// 1. Create service file (electron/services/myService.js)
async function startService() {
  // Implementation
}

// 2. Initialize in main process
app.on('ready', async () => {
  await myService.startService();
});

// 3. Expose via IPC if needed
ipcMain.handle('myService:action', async (event, data) => {
  return await myService.performAction(data);
});
```

## 5. Performance Considerations

### Database Performance

```javascript
// ✅ GOOD - Uses index on created_at
SELECT * FROM clipboard_items 
ORDER BY created_at DESC LIMIT 20

// ❌ BAD - Full table scan, no index
SELECT * FROM clipboard_items 
WHERE content LIKE '%text%'
ORDER BY RANDOM() LIMIT 20

// ✅ GOOD - Indexed search + filter
SELECT * FROM clipboard_items 
WHERE type = 'code' AND content LIKE '%python%'
ORDER BY created_at DESC
```

### Memory Management

```javascript
// Clipboard monitoring
- Polling interval: 1 second (adjustable)
- Store only last clipboard content
- Clear on app exit

// OCR caching
- Max 100 cached results
- LRU removal (oldest first)
- Clear on demand

// IPC listeners
- Remove listeners when component unmounts
- Prevent memory leaks with cleanup functions
```

### React Performance

```javascript
// Virtual scrolling for large lists
// Only render visible items

// Debounced search input
// Prevent excessive database queries

// Memoized callbacks
// Prevent unnecessary re-renders

// Code splitting
// Lazy load heavy components
```

## 6. Security Best Practices

### Applied

✅ Context isolation - Renderer can't access Node directly
✅ Sandbox - Disabled risky APIs
✅ Preload validation - Only expose safe methods
✅ Prepared statements - SQL injection prevention
✅ No sensitive data logging

### Recommendations

⚠️ Add data encryption at rest (future)
⚠️ Implement certificate pinning (for cloud sync)
⚠️ Regular security audits
⚠️ Keep dependencies updated

## 7. Debugging

### Main Process Debug

```bash
# Start with debug flag
npm run dev -- --enable-logging

# Access debug logs
~/.config/ClipNest-AI/logs/
```

### Renderer Debug

```javascript
// DevTools in development
npm run dev
// Automatically opens DevTools

// Enable remote debugging
overlayWindow.webContents.openDevTools();
```

### Database Debug

```javascript
// Enable query logging (add to db.js)
db.configure('busyTimeout', 5000);

// Profile queries
console.time('query');
const result = await query(sql, params);
console.timeEnd('query');
```

## 8. Deployment

### Building for Production

```bash
# Build React app
npm run build

# Package for distribution
npm run dist

# Platform-specific
npm run electron-build-mac
npm run electron-build-win
npm run electron-build-linux
```

### Auto-Update Setup

```javascript
// electron-updater would go here
// Implement signed updates from GitHub releases
```

---

This architecture provides a solid foundation for a production-ready desktop application. Each component has clear responsibilities, and extension points are well-defined.
