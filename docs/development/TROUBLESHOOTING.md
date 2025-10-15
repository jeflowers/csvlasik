# Troubleshooting Guide

## Common Issues and Solutions

### 1. TypeError: t._onTimeout is not a function

This error typically occurs due to:
- Outdated dependencies with timer-related issues
- Node.js version compatibility problems
- Corrupted node_modules
- Vite build issues with global polyfills

**Solution:**
```bash
# Run the update script
chmod +x update-deps.sh
./update-deps.sh
```

**If the error persists:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear browser cache completely
# In DevTools: Application > Storage > Clear storage

# Restart the dev server
npm run dev
```

### 2. Deprecated Module Warnings

The warnings you see are mostly from transitive dependencies:

**Safe to ignore:**
- `npmlog`, `gauge`, `are-we-there-yet` - Internal npm dependencies
- `@npmcli/move-file` - Internal npm tooling
- `inflight`, `glob`, `rimraf` - Fixed via package overrides

**Fixed in this update:**
- Updated all major dependencies to latest stable versions
- Added package overrides to force newer versions of problematic dependencies
- Configured `.npmrc` to reduce warning noise

### 3. Server Timeout Issues

If you experience server timeouts:

**Check server logs:**
```bash
cd server
npm run dev
```

**Common causes:**
- Database connection issues
- Long-running queries
- Network connectivity problems

**Solutions:**
- Increased timeout values in server configuration
- Added proper error handling for timeouts
- Improved graceful shutdown handling

### 4. Build Issues

If the build fails:

```bash
# Clean and rebuild
npm run clean
npm run fresh-install
npm run build
```

### 5. Development Server Issues

If the dev server won't start:

```bash
# Check if ports are in use
lsof -i :5173  # Frontend
lsof -i :3001  # Backend

# Kill processes if needed
kill -9 <PID>

# Restart servers
npm run dev:full
```

### 6. Database Issues

If you encounter database errors:

```bash
cd server
npm run init-db
```

### 7. Cache Issues

Clear all caches:

```bash
# Clear npm cache
npm cache clean --force

# Clear Vite cache
rm -rf node_modules/.vite

# Clear browser cache (in DevTools)
# Application > Storage > Clear storage
```

## Maintenance Commands

### Check for Updates
```bash
npx npm-check-updates
```

### Security Audit
```bash
npm audit
npm audit fix
```

### Performance Check
```bash
npm run build
npm run preview
```

## Environment Requirements

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Browser**: Modern browsers with ES2020 support

## Getting Help

1. Check the console for specific error messages
2. Review the server logs in the terminal
3. Ensure all environment variables are set correctly
4. Verify database connectivity

## Package Update Strategy

1. **Major updates**: Test thoroughly in development
2. **Minor updates**: Generally safe to apply
3. **Patch updates**: Apply regularly for security fixes
4. **Transitive dependencies**: Use overrides when needed

## Performance Optimization

1. **Bundle analysis**: Use `npm run build` and check bundle size
2. **Memory usage**: Monitor with browser DevTools
3. **Network requests**: Minimize API calls
4. **Caching**: Leverage browser and CDN caching

## TypeError: t._onTimeout Specific Solutions

This error is often related to:

1. **Vite's global polyfills**: Fixed by updating `vite.config.ts`
2. **Timer functions in browser**: Resolved by proper global definitions
3. **Build target compatibility**: Updated to `esnext` for better compatibility
4. **Module resolution**: Improved with better chunk splitting

**Prevention:**
- Keep dependencies updated
- Use proper build targets
- Clear caches regularly
- Monitor console for early warnings