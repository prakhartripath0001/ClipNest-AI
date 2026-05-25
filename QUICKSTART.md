/**
 * QUICK START GUIDE
 * =================
 * 
 * Get ClipNest AI up and running in 5 minutes!
 */

# ClipNest AI - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Prerequisites Check

```bash
# Verify Node.js is installed (v16 or higher)
node --version  # Should be v16.0.0 or higher
npm --version   # Should be v7.0.0 or higher
```

### Step 2: Clone & Install

```bash
# Navigate to parent directory
cd ~/Documents/src

# Clone/enter the project
cd ClipNest-AI

# Install dependencies (takes ~2-3 minutes)
npm install
```

### Step 3: Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit if needed (defaults should work)
nano .env
```

### Step 4: Start Development

```bash
# Start both React dev server and Electron
npm run dev

# You'll see:
# - React dev server on http://localhost:3000
# - Electron window opens with DevTools
```

### Step 5: Test It!

```
1. DevTools opens automatically
2. Copy some text anywhere on your computer
3. Press Cmd+Shift+Space (macOS) or Ctrl+Shift+Space (Windows/Linux)
4. The overlay should appear with your clipboard!
5. Click "Copy" to copy an item
6. Close with Esc key
```

## 🎯 First-Time Developer Tasks

### 1. Verify Everything Works

```bash
# In the running app:
1. Copy: "Hello, ClipNest!"
2. Press Cmd+Shift+Space
3. See your text in the overlay
4. Click Copy button
5. Paste somewhere - should see "Hello, ClipNest!"
```

### 2. Explore the Code

```bash
# Read these files first:
electron/main/index.js          # How Electron starts
src/App.jsx                     # Main React component
electron/services/clipboardService.js  # How clipboard monitoring works
src/database/db.js              # Database connection

# Then explore:
src/database/operations.js      # Database queries
src/components/                 # UI components
electron/preload/preload.js    # IPC communication
```

### 3. Make Your First Change

Try this simple modification:

```javascript
// File: src/components/Header.jsx
// Change the emoji in the title from 📋 to 🎯

// Before:
<span className="text-2xl">📋</span>

// After:
<span className="text-2xl">🎯</span>

// Save the file - React will hot-reload!
```

## 📦 Production Build

### Build for Your OS

```bash
# For macOS
npm run electron-build-mac

# For Windows
npm run electron-build-win

# For Linux
npm run electron-build-linux

# For all platforms
npm run electron-build
```

### Output Location

```
dist/
├── ClipNest\ AI-1.0.0.dmg    # macOS installer
├── ClipNest\ AI\ Setup.exe    # Windows installer
└── clipnest-ai-1.0.0.AppImage # Linux executable
```

## 🐛 Common Issues & Fixes

### Issue: "Module not found" error

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Port 3000 already in use

```bash
# Solution: Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in package.json scripts
```

### Issue: Global shortcut not working

```bash
# On macOS, app might need accessibility permissions:
1. System Preferences → Security & Privacy
2. Accessibility → Add ClipNest AI
3. Restart the app
```

### Issue: Database lock error

```bash
# Solution: Close other instances
# If still locked, delete the database file:
rm ~/.config/ClipNest-AI/clipnest.db
# App will recreate on next start
```

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start dev environment
npm run react-start      # Start React only (port 3000)
npm run build            # Build React for production

# Building
npm run electron-build   # Build Electron app
npm run dist            # Build + package

# Cleanup
npm run clean           # Remove build artifacts
npm run uninstall       # Remove app from system
```

## 📊 Project Structure Quick Reference

```
Important files:
├── package.json              # Dependencies and scripts
├── electron/main/index.js    # Electron entry point
├── src/App.jsx              # React root component
├── src/database/            # All database code
└── electron/services/       # Background services
```

## 🎓 Next Steps

1. **Understand Architecture**
   - Read [ARCHITECTURE.md](./ARCHITECTURE.md)
   - Understand data flow
   - Learn IPC patterns

2. **Add a Feature**
   - Try adding a new filter type
   - Add a new keyboard shortcut
   - Implement a new service

3. **Deploy**
   - Follow production build steps above
   - Sign code for distribution
   - Create GitHub release

## 📖 Documentation

- **Full README**: [README.md](./README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

## 💡 Pro Tips

1. **Use DevTools** - F12 to debug React
2. **Check Console** - Both Electron and React have logs
3. **Hot Reload** - Changes to React files auto-reload
4. **Database Browser** - Use any SQLite browser to inspect `.db` file
5. **Clear Cache** - Delete `clipnest.db` to reset database

## 🆘 Need Help?

1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanations
2. Read code comments - they explain the "why"
3. Open an issue on GitHub
4. Check GitHub Discussions for similar problems

---

Happy coding! 🚀
