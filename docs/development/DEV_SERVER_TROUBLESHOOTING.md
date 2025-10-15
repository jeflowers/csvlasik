# 🔧 Development Server Troubleshooting

Common issues and solutions for the Vite development server.

---

## Issue: "t._onTimeout is not a function" Error

### Symptoms
```
TypeError: t._onTimeout is not a function
fatal error: too many writes on closed pipe
```

This error typically occurs when:
1. Running in a cloud IDE (StaticBlitz, CodeSandbox, StackBlitz)
2. HMR (Hot Module Replacement) connection issues
3. Environment variables change while server is running
4. Port conflicts or networking issues

---

## 🔧 Solutions

### Solution 1: Clean Restart (Most Common Fix)

```bash
# Stop the dev server (Ctrl+C)

# Clear caches
rm -rf node_modules/.vite
rm -rf dist

# Restart
npm run dev
```

### Solution 2: Use Local Development

If you're in a cloud IDE, try running locally:

```bash
# On your local machine
git clone [your-repo]
cd [project-directory]
npm install
npm run dev
```

### Solution 3: Disable HMR Overlay (If error persists)

The Vite config has been updated with improved HMR settings:
- Increased timeout to 30 seconds
- Better watch configuration
- Proper client port settings

If issues continue, you can temporarily disable HMR:

```typescript
// vite.config.ts
server: {
  hmr: false  // Temporarily disable HMR
}
```

### Solution 4: Environment Variable Changes

The error often occurs when `.env` changes while server is running.

**Best Practice:**
1. Stop dev server before editing `.env`
2. Make changes
3. Restart dev server

**Or use:**
```bash
# Instead of editing .env while running
npm run dev -- --force
```

### Solution 5: Port Conflicts

Check if port 5173 is already in use:

```bash
# Check what's using port 5173
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill the process or use different port
npm run dev -- --port 5174
```

### Solution 6: Clear Node Modules (Nuclear Option)

```bash
# Stop server
# Clean everything
rm -rf node_modules
rm -rf package-lock.json
rm -rf node_modules/.vite
rm -rf dist

# Reinstall
npm install

# Start fresh
npm run dev
```

---

## 🚨 Cloud IDE Specific Issues

### StaticBlitz / StackBlitz

These environments can have issues with:
- WebSocket connections
- File watching
- HMR hot reloading

**Workarounds:**

1. **Use Preview Mode Instead of Dev Server:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Disable File Watching:**
   ```typescript
   // vite.config.ts
   server: {
     watch: {
       usePolling: true,  // Use polling instead of native watching
       interval: 1000
     }
   }
   ```

3. **Use Production Build for Testing:**
   ```bash
   npm run build && npm run preview
   ```

### CodeSandbox

CodeSandbox has better support, but if issues occur:

1. Restart sandbox
2. Clear cache in sandbox settings
3. Use "Restart Server" option in terminal

---

## ✅ Verification Steps

After applying fixes:

1. **Server starts without errors:**
   ```bash
   npm run dev
   # Should see: ➜  Local:   http://localhost:5173/
   ```

2. **Page loads in browser:**
   - Navigate to http://localhost:5173
   - Page should load without console errors

3. **HMR works (if enabled):**
   - Edit a file (e.g., src/App.tsx)
   - Save
   - Page should update without full reload

4. **No console errors:**
   - Open browser DevTools (F12)
   - Console should be clear of errors

---

## 🔍 Debugging Tips

### Check Vite Logs

Look for these in the terminal:
```
✓ optimized dependencies changed. reloading  ← Good
✗ Error: Cannot find module                  ← Bad
```

### Browser Console

Check for:
- WebSocket connection errors
- CORS errors
- Module loading errors
- React errors

### Network Tab

Monitor:
- HMR WebSocket connection (ws://localhost:5173)
- Failed asset loads
- 404 errors

---

## 🛠️ Configuration Changes Made

The following improvements have been made to `vite.config.ts`:

### HMR Configuration
```typescript
hmr: {
  overlay: true,
  protocol: 'ws',
  host: 'localhost',
  timeout: 30000,        // Increased timeout
  clientPort: 5173       // Explicit client port
}
```

### Watch Configuration
```typescript
watch: {
  usePolling: false,     // Native file watching
  ignored: [
    '**/node_modules/**',
    '**/dist/**'
  ]
}
```

### Optimized Dependencies
All critical dependencies now pre-bundled:
- react, react-dom
- react-router-dom
- i18next family
- @supabase/supabase-js
- lucide-react
- js-cookie

---

## 📊 Alternative: Use Production Build

If dev server issues persist, use production build for testing:

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Opens at: http://localhost:4173
```

**Benefits:**
- No HMR issues
- True production behavior
- Faster page loads
- More stable

**Drawbacks:**
- Need to rebuild after changes
- No hot reload
- Longer feedback loop

---

## 🔄 Recommended Development Workflow

### For Cloud IDEs:
1. Use `npm run build && npm run preview` for testing
2. Or use local development environment
3. Or use CodeSandbox (better support)

### For Local Development:
1. Use `npm run dev` normally
2. Restart server after .env changes
3. Clear cache if issues occur

---

## 📞 Still Having Issues?

### Check These:

1. **Node Version:**
   ```bash
   node --version
   # Should be >= 20.0.0
   ```

2. **NPM Version:**
   ```bash
   npm --version
   # Should be >= 9.0.0
   ```

3. **Clean Install:**
   ```bash
   npm run clean
   npm install
   ```

4. **Build Works:**
   ```bash
   npm run build
   # Should complete without errors
   ```

### Get Help:

If none of these solutions work:

1. Note your environment:
   - OS (Windows/macOS/Linux/Cloud IDE)
   - Node version
   - npm version
   - Cloud IDE name (if applicable)

2. Check error logs:
   - Full terminal output
   - Browser console errors
   - Network tab errors

3. Try minimal reproduction:
   ```bash
   # Fresh install
   git clone [repo]
   cd [project]
   npm install
   npm run dev
   ```

---

## 🎯 Quick Reference

| Issue | Solution |
|-------|----------|
| HMR error on startup | Clear cache, restart |
| Error after .env change | Restart server |
| Port already in use | Use different port or kill process |
| Cloud IDE issues | Use preview mode instead |
| Persistent errors | Clean install (rm -rf node_modules) |
| Can't fix dev server | Use production preview |

---

**Last Updated:** October 11, 2025
**Vite Version:** 6.0.5
**Node Version:** 20+ required
