# Quick Start Guide

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **Internet connection** (for downloading dataset and dependencies)

## Quick Setup (5 minutes)

### Option 1: Automated Setup (Linux/Mac)

```bash
cd network-optimizer
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd network-optimizer/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend Setup

```bash
cd network-optimizer/frontend
npm install
```

## Running the Application

### Step 1: Start Backend Server

```bash
cd network-optimizer/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

The backend will start on `http://localhost:5001`

**Note**: On first run, the application will:
- Download the dataset from Kaggle (automatic via kagglehub)
- Train all ML models (takes 5-10 minutes)
- Models train in background, API is available immediately

### Step 2: Start Frontend Server

In a new terminal:

```bash
cd network-optimizer/frontend
npm start
```

The frontend will start on `http://localhost:3000`

### Step 3: Access Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

## First-Time Dataset Download

The application uses `kagglehub` to automatically download the dataset. If you encounter issues:

1. **Kaggle Authentication** (usually not required for public datasets):
   - Create a Kaggle account at https://www.kaggle.com
   - Download your API token from Account Settings
   - Place it at `~/.kaggle/kaggle.json`

2. **Manual Dataset Download** (if kagglehub fails):
   - Visit: https://www.kaggle.com/datasets/suraj520/cellular-network-analysis-dataset
   - Download the dataset
   - Extract to `backend/data/` directory

## Troubleshooting

### Backend Issues

**Import Errors**:
```bash
# Make sure you're in the backend directory and virtual environment is activated
cd network-optimizer/backend
source venv/bin/activate
pip install -r requirements.txt
```

**Port Already in Use**:
```bash
# Change port in backend/config.py or kill the process using port 5001
lsof -ti:5001 | xargs kill  # Mac/Linux
# Or use a different port: export API_PORT=8000
```

**Dataset Download Fails**:
- Check internet connection
- Verify dataset name is correct
- Try manual download (see above)

### Frontend Issues

**Port Already in Use**:
```bash
# React will prompt to use a different port, or:
# Change port: PORT=3001 npm start
```

**API Connection Fails**:
- Verify backend is running on port 5001
- Check `frontend/src/api/apiClient.ts` for correct API URL
- Check browser console for CORS errors

**Build Errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Verifying Installation

### Backend Health Check

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "timestamp": "..."
}
```

### Frontend Check

Open `http://localhost:3000` in browser. You should see:
- Dashboard with summary cards
- Sidebar with navigation
- No console errors

## Next Steps

1. **Explore Features**:
   - Signal Strength Predictor
   - Network Usage Analysis
   - Time Patterns
   - Location Heatmap
   - Throughput Forecasting

2. **Check Model Training**:
   - Models train automatically on first run
   - Check backend console for training progress
   - Use `/api/models/metrics` endpoint to view model performance

3. **Customize**:
   - Modify thresholds in `backend/config.py`
   - Adjust model parameters in model files
   - Customize UI in frontend components

## Production Deployment

For production deployment:

1. **Backend**:
   - Use a production WSGI server (e.g., Gunicorn)
   - Set up environment variables
   - Configure proper CORS origins

2. **Frontend**:
   - Build production bundle: `npm run build`
   - Serve with a web server (e.g., Nginx)
   - Configure API URL in environment variables

## Support

For issues or questions:
1. Check the main README.md
2. Review error logs in console
3. Verify all dependencies are installed
4. Check that dataset downloaded successfully

## Common Commands

```bash
# Backend
cd backend
source venv/bin/activate
python app.py

# Frontend
cd frontend
npm start

# Install dependencies
pip install -r requirements.txt  # Backend
npm install  # Frontend

# Check health
curl http://localhost:5001/api/health
```

