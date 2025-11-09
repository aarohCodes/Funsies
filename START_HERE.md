# 🚀 START HERE - Run the Network Optimizer

## Quick Start (2 Terminals Required)

### Terminal 1: Backend Server
```bash
# Navigate to backend
cd network-optimizer/backend

# Create and activate virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the backend server
python app.py
```

**You should see:**
```
============================================================
Network Optimizer Backend Server
============================================================
 * Running on http://0.0.0.0:5001
```

### Terminal 2: Frontend Server
```bash
# Navigate to frontend (in a NEW terminal)
cd network-optimizer/frontend

# Install dependencies (REQUIRED - first time only)
npm install

# Wait for installation to complete (3-5 minutes)
# You should see: "added X packages"

# Start the frontend server
npm start
```

**You should see:**
```
Compiled successfully!
Local: http://localhost:3000
```

### Browser
Open: **http://localhost:3000**

---

## That's It! 🎉

For detailed instructions, see [HOW_TO_RUN.md](./HOW_TO_RUN.md)

## Quick Troubleshooting

**Backend not starting?**
- Make sure virtual environment is activated: `source venv/bin/activate`
- Check Python version: `python3 --version` (needs 3.8+)
- Install dependencies: `pip install -r requirements.txt`

**Frontend not starting?**
- Check Node version: `node --version` (needs 16+)
- Install dependencies: `npm install`
- Clear cache: `rm -rf node_modules && npm install`

**Can't connect?**
- Verify backend is running on port 5000
- Verify frontend is running on port 3000
- Check browser console for errors

## First Run Notes

⏱️ **First run takes 5-10 minutes** because:
- Dataset downloads from Kaggle
- ML models are trained
- Models are saved for future use

✅ **API is available immediately** - you can use it while models train in background

🔍 **Check model status:**
```bash
curl http://localhost:5001/api/health
```

Look for `"models_loaded": true` when training is complete.

