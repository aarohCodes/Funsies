# Frontend Setup Fix

## Problem: `react-scripts: command not found`

This error means the npm dependencies haven't been installed yet.

## Solution: Install Dependencies

### Step 1: Navigate to Frontend Directory

```bash
cd network-optimizer/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all dependencies including:
- react-scripts
- react and react-dom
- TypeScript
- Tailwind CSS
- Recharts
- React Leaflet
- And all other required packages

**Expected time: 3-5 minutes**

### Step 3: Verify Installation

Check that node_modules exists:

```bash
ls node_modules | head -10
```

You should see folders like:
- react
- react-scripts
- typescript
- etc.

### Step 4: Start the Frontend

```bash
npm start
```

The frontend should now start successfully!

## Troubleshooting

### npm install Fails

If `npm install` fails:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

3. **Reinstall:**
   ```bash
   npm install
   ```

### Port 3000 Already in Use

If port 3000 is in use, React will ask to use port 3001. Click "Yes" or:

```bash
PORT=3001 npm start
```

### Permission Errors

If you get permission errors:

```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

### Node Version Issues

Make sure you have Node.js 16+:

```bash
node --version  # Should be 16 or higher
npm --version   # Should be 8 or higher
```

If not, update Node.js:
```bash
# Using Homebrew (macOS)
brew install node

# Or download from nodejs.org
```

## Quick Fix Command

```bash
cd network-optimizer/frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## Expected Output

After `npm install`, you should see:
```
added 1234 packages, and audited 1235 packages in 2m
```

After `npm start`, you should see:
```
Compiled successfully!

You can now view network-optimizer-frontend in the browser.

  Local:            http://localhost:3000
```

## Next Steps

1. Frontend will open automatically in your browser
2. If backend is running, you'll see the dashboard
3. If backend is not running, you'll see connection errors in the console

