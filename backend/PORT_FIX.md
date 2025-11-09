# Port 5000 Conflict Fix

## Problem
Port 5000 is in use by another program (often AirPlay Receiver on macOS).

## Solution 1: Use Port 5001 (Already Fixed)

The application has been updated to use port **5001** by default instead of 5000.

**No action needed** - just run the app as usual:

```bash
cd network-optimizer/backend
source venv/bin/activate
python app.py
```

The backend will now run on `http://localhost:5001`

## Solution 2: Use Custom Port

You can set a custom port using environment variable:

```bash
export API_PORT=8000
python app.py
```

## Solution 3: Disable AirPlay Receiver (macOS)

If you want to use port 5000:

1. Open **System Preferences** (or **System Settings** on newer macOS)
2. Go to **General** → **AirDrop & Handoff**
3. Turn off **AirPlay Receiver**
4. Restart your terminal
5. Change port back to 5000 in `config.py` if desired

## Solution 4: Kill Process Using Port 5000

Find and kill the process using port 5000:

```bash
# Find the process
lsof -ti:5000

# Kill it
lsof -ti:5000 | xargs kill

# Or force kill
lsof -ti:5000 | xargs kill -9
```

## Verify Port Change

After changing the port, make sure:

1. **Backend** runs on the new port (check console output)
2. **Frontend** `apiClient.ts` points to the new port
3. **Frontend** `package.json` proxy points to the new port

## Current Configuration

- **Backend**: `http://localhost:5001` (default)
- **Frontend**: `http://localhost:3000`
- **API URL**: `http://localhost:5001/api`

## Testing

Test the backend:
```bash
curl http://localhost:5001/api/health
```

You should see:
```json
{
  "status": "healthy",
  "models_loaded": false,
  "timestamp": "..."
}
```

