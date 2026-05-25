/**
 * TROUBLESHOOTING & DEBUGGING GUIDE
 * =================================
 * 
 * Comprehensive guide to diagnose and fix common issues in ClipNest AI
 */

# ClipNest AI - Troubleshooting Guide

## 🆘 General Troubleshooting

### Issue: App Won't Start

**Symptoms**: Application crashes on launch or doesn't open

**Diagnosis**:
```bash
# Check Node.js version
node --version  # Should be v16.0.0+

# Check for permission errors
npm run dev 2>&1 | head -20

# Check system logs
cat ~/.config/ClipNest-AI/logs/error.log 2>/dev/null || echo "No log file"
```

**Solutions**:

1. **Dependency Issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --verbose
   ```

2. **Port Conflicts**
   ```bash
   # Kill React dev server if stuck
   lsof -ti:3000 | xargs kill -9
   
   # Start fresh
   npm run dev
   ```

3. **Permission Issues (macOS)**
   ```bash
   # Grant executable permission
   chmod +x /Applications/ClipNest\ AI.app/Contents/MacOS/ClipNest\ AI
   ```

---

## 🗄️ Database Issues

### Issue: "Database is locked" Error

**Symptoms**: Random crashes or freezes related to database

**Causes**:
- Multiple instances writing simultaneously
- Corrupted database file
- File permissions issue

**Solutions**:

```bash
# Solution 1: Close other instances
pkill -f "ClipNest" 2>/dev/null
sleep 1
npm run dev

# Solution 2: Delete and recreate database
rm ~/.config/ClipNest-AI/clipnest.db
# App will recreate on next launch

# Solution 3: Check database integrity
sqlite3 ~/.config/ClipNest-AI/clipnest.db ".recover" | sqlite3 recovered.db
```

### Issue: Data Appears Corrupted

**Symptoms**: Missing items, inconsistent data, query errors

**Investigation**:
```bash
# Open database browser
sqlite3 ~/.config/ClipNest-AI/clipnest.db

# Check table structure
.schema clipboard_items

# Count items
SELECT COUNT(*) FROM clipboard_items;

# Check for NULL values
SELECT id, type FROM clipboard_items WHERE content IS NULL LIMIT 10;

# Check disk usage
.tables
.stat
```

**Recovery**:
```bash
# Backup corrupted database
cp ~/.config/ClipNest-AI/clipnest.db ~/clipnest_backup.db

# Verify database
sqlite3 ~/clipnest_backup.db "PRAGMA integrity_check;"

# Recover if needed
sqlite3 ~/clipnest_backup.db ".recover" | sqlite3 ~/.config/ClipNest-AI/clipnest.db
```

---

## 📋 Clipboard Issues

### Issue: Clipboard Monitoring Stops Working

**Symptoms**: New copies aren't detected, overlay not updating

**Causes**:
- Clipboard service crashed
- Polling interval too high
- Permission issues

**Solutions**:

```bash
# Check clipboard service in Electron logs
# Restart the app (should auto-recover)

# Verify clipboard monitoring is running
# In DevTools console:
window.api.clipboard.getItems(1, 0)
  .then(items => console.log('DB connected:', items))
  .catch(e => console.error('DB error:', e))

# Check system clipboard directly (macOS)
pbpaste | head -c 100
```

### Issue: Images Not Detected from Clipboard

**Symptoms**: Can't copy images, pasted images not saved

**Investigation**:
```bash
# Test clipboard image API (macOS)
osascript -e 'the clipboard as "png" as picture'

# Check clipboard type
# In DevTools console:
navigator.clipboard.read().then(items => {
  console.log('Clipboard items:', items.map(i => i.types));
})
```

**Solutions**:
- Verify image format is PNG/JPG (not proprietary)
- Check file permissions on screenshot folder
- Restart clipboard monitoring: `npm run dev`

---

## 🖼️ Screenshot Detection Issues

### Issue: Screenshots Not Detected

**Symptoms**: Screenshots taken but not appearing in app

**Causes**:
- Screenshot folder incorrect
- File permissions
- Filename pattern mismatch

**Investigation**:
```bash
# Check screenshot folder location
# macOS: Should be ~/Desktop by default
ls -la ~/Desktop | grep -i "screenshot"

# Check file watching
# In app console, take a screenshot and check logs

# Verify file permissions
stat ~/Desktop
```

**Solutions**:

1. **Wrong Screenshot Folder**
   ```bash
   # Check system screenshot location
   # macOS: System Preferences → Screenshots → Save to
   
   # Update in .env if needed
   SCREENSHOT_FOLDER=/path/to/screenshots
   ```

2. **Permission Issues**
   ```bash
   # Grant folder access (macOS)
   chmod 755 ~/Desktop
   chmod -R 755 ~/Desktop
   ```

3. **Filename Pattern**
   ```bash
   # Ensure screenshots have standard names:
   # - Screenshot_YYYY-MM-DD at HH.MM.SS.png (macOS)
   # - Screenshot (N).png (Windows)
   ```

---

## 🔍 Search & Filter Issues

### Issue: Search Results Empty

**Symptoms**: Searching returns no results even when items exist

**Investigation**:
```javascript
// In DevTools console:
window.api.clipboard.search('python', null)
  .then(results => console.log('Search results:', results))
  .catch(e => console.error('Search error:', e))

// Check database directly:
sqlite3 ~/.config/ClipNest-AI/clipnest.db
SELECT * FROM clipboard_items WHERE content LIKE '%python%' LIMIT 5;
```

**Solutions**:

1. **Case Sensitivity**
   ```javascript
   // Search is case-insensitive in SQLite by default
   // If having issues, check COLLATE settings
   PRAGMA table_info(clipboard_items);
   ```

2. **Special Characters**
   ```javascript
   // SQLite LIKE uses % and _ as wildcards
   // Escape if searching for literal %:
   LIKE '%\%25%' ESCAPE '\'
   ```

3. **Empty Content**
   ```bash
   # Check for NULL or empty content
   sqlite3 ~/.config/ClipNest-AI/clipnest.db
   SELECT COUNT(*) FROM clipboard_items WHERE content IS NULL OR content = '';
   ```

---

## ⌨️ Keyboard Shortcut Issues

### Issue: Global Shortcut Not Working

**Symptoms**: Cmd+Shift+Space (or Ctrl+Shift+Space) doesn't open overlay

**Causes**:
- Shortcut already registered by another app
- Permission issue (macOS accessibility)
- Shortcut code incorrect for platform

**Investigation**:
```bash
# macOS: Check accessibility permissions
# System Preferences → Security & Privacy → Accessibility

# Windows: Check if shortcut conflicts
# Settings → Devices → Keyboard

# Linux: Check keyboard shortcuts
gsettings list-schemas | grep -i keyboard
```

**Solutions**:

1. **macOS Accessibility Permission**
   ```bash
   # Grant accessibility permission
   sudo tccutil reset Accessibility
   
   # Then re-grant in:
   # System Preferences → Security & Privacy → Accessibility
   ```

2. **Shortcut Conflict**
   ```bash
   # Check what's using Cmd+Shift+Space (macOS)
   defaults read com.apple.symbolichotkeys | grep -A 20 "65"
   
   # Change shortcut in .env or code:
   GLOBAL_SHORTCUT=Cmd+Shift+V  # Alternative shortcut
   ```

3. **Platform-Specific Issues**
   ```javascript
   // Verify shortcut registration in main process
   console.log('Shortcut registered:', globalShortcut.isRegistered(shortcut));
   ```

---

## 🎨 UI/Display Issues

### Issue: Dark Mode Not Working

**Symptoms**: Dark mode toggle doesn't change theme

**Investigation**:
```javascript
// Check dark mode state
window.api.settings.get('darkMode', true)
  .then(isDark => console.log('Dark mode:', isDark))

// Check DOM classes
console.log(document.documentElement.classList.contains('dark'))
```

**Solutions**:

```bash
# Clear browser cache
# DevTools → Application → Clear site data

# Check Tailwind configuration
cat tailwind.config.js | grep darkMode

# Verify CSS loaded
# Inspect element → Computed styles
```

### Issue: Overlay Window Appears Small or Misaligned

**Symptoms**: Window cuts off content, wrong position

**Solutions**:

```javascript
// In main process (electron/main/index.js):
overlayWindow = new BrowserWindow({
  width: 500,    // Adjust width
  height: 600,   // Adjust height
  x: 100,        // X position
  y: 100,        // Y position
});

// Or use center position
overlayWindow.center();
```

---

## 🐛 React Component Issues

### Issue: Component Not Rendering

**Symptoms**: Blank screen, missing content

**Investigation**:
```javascript
// Check console for errors
// DevTools → Console tab

// Verify component mounting
console.log('App mounted');

// Check state
// Add console.log in render:
console.log('Items:', items, 'Loading:', loading);
```

**Solutions**:

```javascript
// Add error boundary
// In src/App.jsx:
try {
  // Render component
} catch (error) {
  console.error('Render error:', error);
  return <ErrorFallback error={error} />;
}
```

### Issue: State Not Updating

**Symptoms**: Data changes but UI doesn't reflect it

**Investigation**:
```javascript
// Check useState hook usage
const [items, setItems] = useState([]);

// Verify state change is triggered
console.log('State before:', items);
setItems(newItems);
console.log('State after:', items); // Will still be old value (async)

// Use effect to verify
useEffect(() => {
  console.log('Items updated:', items);
}, [items]);
```

**Solutions**:

```javascript
// Ensure state updates are immutable
// ❌ Wrong
items.push(newItem);
setItems(items);

// ✅ Correct
setItems([newItem, ...items]);
```

---

## ⚡ Performance Issues

### Issue: App Slow or Freezing

**Symptoms**: Lag when typing search, freezes when selecting items

**Investigation**:
```javascript
// Check Electron DevTools
// DevTools → Performance tab → Record

// Check React profiler
// DevTools → React DevTools → Profiler

// Check database query time
// In db.js, add timing:
console.time('query');
const results = await query(sql, params);
console.timeEnd('query');
```

**Solutions**:

1. **Database Performance**
   ```bash
   # Check indexes exist
   sqlite3 ~/.config/ClipNest-AI/clipnest.db ".indices"
   
   # Analyze query plan
   EXPLAIN QUERY PLAN 
   SELECT * FROM clipboard_items 
   WHERE type = 'code' 
   ORDER BY created_at DESC;
   ```

2. **React Performance**
   ```javascript
   // Use React.memo for list items
   export const ClipboardItem = React.memo(({ item }) => (
     // Component
   ));
   
   // Debounce search input
   const handleSearch = debounce(search, 300);
   ```

3. **Electron Performance**
   ```javascript
   // Check memory usage
   console.log('Memory:', process.memoryUsage());
   
   // Profile main process
   // Chrome DevTools on node-inspector port
   ```

---

## 🚀 Deployment Issues

### Issue: Build Fails

**Symptoms**: `npm run build` or `npm run dist` errors

**Solutions**:

```bash
# 1. Clean build
rm -rf build dist node_modules
npm install
npm run build

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Check for ESLint errors
npm run lint

# 4. Build with verbose output
npm run build -- --verbose 2>&1 | tee build.log
```

### Issue: App Won't Start After Build

**Investigation**:
```bash
# Check packaged app
~/path/to/ClipNest\ AI.app/Contents/Resources/app/dist/index.js

# Run with debug flag
ClipNest\ AI --debug 2>&1 | tee debug.log
```

---

## 📞 Getting Help

### Debug Information to Collect

When reporting issues, include:

```
- OS and version: `uname -a`
- Node version: `node --version`
- npm version: `npm --version`
- App version: Look in About
- Error logs: `~/.config/ClipNest-AI/logs/`
- Database status: `sqlite3 ~/.config/ClipNest-AI/clipnest.db "PRAGMA integrity_check;"`
- Screenshot of issue
- Steps to reproduce
```

### Resources

- **GitHub Issues**: [clipnest-ai/issues](https://github.com/yourusername/clipnest-ai/issues)
- **GitHub Discussions**: [clipnest-ai/discussions](https://github.com/yourusername/clipnest-ai/discussions)
- **Electron Docs**: [electronjs.org/docs](https://www.electronjs.org/docs)
- **React Docs**: [react.dev](https://react.dev)
- **SQLite Docs**: [sqlite.org/docs.html](https://www.sqlite.org/docs.html)

---

## 🧹 Maintenance Commands

```bash
# Clear all data (factory reset)
rm -rf ~/.config/ClipNest-AI/

# Reset database only
rm ~/.config/ClipNest-AI/clipnest.db

# Clear cache
rm -rf ~/.config/ClipNest-AI/Cache/

# Check disk usage
du -sh ~/.config/ClipNest-AI/

# View app logs (macOS)
log stream --predicate 'process == "ClipNest AI"'

# View app logs (Linux)
journalctl --user-unit=clipnest-ai
```

---

Happy debugging! 🔧
