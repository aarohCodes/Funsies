# How to Run the Network Optimizer Application

## 📋 Prerequisites

Before starting, ensure you have:
- **Python 3.8 or higher** installed
- **Node.js 16 or higher** and npm installed
- **Internet connection** (for downloading the dataset)

Check your versions:
```bash
python3 --version  # Should be 3.8+
node --version     # Should be 16+
npm --version      # Should be 8+
```

## 🚀 Step-by-Step Instructions

### Step 1: Set Up the Backend

#### 1.1 Navigate to Backend Directory
```bash
cd network-optimizer/backend
```

#### 1.2 Create Virtual Environment
```bash
# On Mac/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

#### 1.3 Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install:
- Flask and Flask-CORS
- pandas, numpy, scikit-learn
- Prophet (for time-series forecasting)
- kagglehub (for dataset download)
- And other required packages

**Expected time: 2-5 minutes**

#### 1.4 Verify Backend Setup
```bash
python -c "import flask, pandas, sklearn, prophet; print('All dependencies installed!')"
```

### Step 2: Set Up the Frontend

#### 2.1 Open a New Terminal Window
Keep the backend terminal open, and open a new terminal window/tab.

#### 2.2 Navigate to Frontend Directory
```bash
cd network-optimizer/frontend
```

#### 2.3 Install Dependencies
```bash
npm install
```

This will install:
- React and React DOM
- TypeScript
- Tailwind CSS
- Recharts (for charts)
- React Leaflet (for maps)
- Axios (for API calls)
- And other required packages

**Expected time: 3-5 minutes**

### Step 3: Start the Backend Server

#### 3.1 In the Backend Terminal
Make sure you're in the backend directory with virtual environment activated:

```bash
cd network-optimizer/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 3.2 Start the Server
```bash
python app.py
```

**OR use the run script:**
```bash
python run.py
```

#### 3.3 What You'll See
```
============================================================
Network Optimizer Backend Server
============================================================

Starting server...
Note: Models will be trained in the background on first run.
This may take several minutes. The API will be available immediately.

 * Serving Flask app 'app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://0.0.0.0:5000
Press CTRL+C to quit
```

#### 3.4 First Run Behavior
On the **first run**, the backend will:
1. ✅ Start the Flask server immediately (API available)
2. 🔄 Download the dataset from Kaggle (in background)
3. 🔄 Train all ML models (in background, takes 5-10 minutes)
4. 💾 Save trained models to disk

**Important**: The API is available immediately, but predictions will work better after models are trained.

#### 3.5 Verify Backend is Running
Open a new terminal and test:
```bash
curl http://localhost:5001/api/health
```

You should see:
```json
{
  "status": "healthy",
  "models_loaded": false,
  "timestamp": "2024-..."
}
```

(Note: `models_loaded` will be `false` initially, then `true` after training completes)

### Step 4: Start the Frontend Server

#### 4.1 In the Frontend Terminal
Make sure you're in the frontend directory:

```bash
cd network-optimizer/frontend
```

#### 4.2 Start the Development Server
```bash
npm start
```

#### 4.3 What You'll See
```
Compiling...
Compiled successfully!

You can now view network-optimizer-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

The browser should automatically open to `http://localhost:3000`

### Step 5: Access the Dashboard

#### 5.1 Open Your Browser
Navigate to: **http://localhost:3000**

#### 5.2 What You Should See
- ✅ Dashboard with summary cards
- ✅ Sidebar navigation with 6 menu items
- ✅ System status indicator (green = models loaded)
- ✅ No console errors

#### 5.3 Wait for Models to Train
- The sidebar will show "Loading Models..." initially
- Once training completes, it will show "Models Loaded" (green indicator)
- This takes 5-10 minutes on first run

## 🎯 Quick Reference: Running Both Servers

### Terminal 1 - Backend
```bash
cd network-optimizer/backend
source venv/bin/activate
python app.py
```

### Terminal 2 - Frontend
```bash
cd network-optimizer/frontend
npm start
```

### Browser
Open: **http://localhost:3000**

## 🔍 Verifying Everything Works

### 1. Backend Health Check
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "timestamp": "2024-..."
}
```

### 2. Test API Endpoint
```bash
curl http://localhost:5000/api/localities
```

Should return a list of localities.

### 3. Frontend Check
- Open browser console (F12)
- Check for errors
- Verify API calls are successful

### 4. Test a Feature
1. Go to "Signal Strength Predictor" in sidebar
2. Select a locality and network type
3. Click "Predict"
4. You should see predictions (after models are trained)

## ⚠️ Troubleshooting

### Backend Issues

#### Port 5001 Already in Use
```bash
# Find and kill the process
lsof -ti:5001 | xargs kill  # Mac/Linux
# OR change port in backend/config.py or use: export API_PORT=8000
```

#### Import Errors
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### Dataset Download Fails
- Check internet connection
- Verify Kaggle dataset is accessible
- Check backend console for error messages
- Dataset will be cached after first download

#### Models Not Training
- Check backend console for error messages
- Verify dataset was downloaded successfully
- Check `backend/data/` directory for dataset files
- Models train in background - check console output

### Frontend Issues

#### Port 3000 Already in Use
React will automatically ask to use port 3001. Click "Yes" or:
```bash
PORT=3001 npm start
```

#### npm install Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### API Connection Errors
- Verify backend is running on port 5001
- Check browser console for CORS errors
- Verify `frontend/src/api/apiClient.ts` has correct API URL
- Check backend console for errors

#### Blank Page or Errors
- Check browser console (F12) for errors
- Verify all dependencies are installed
- Try clearing browser cache
- Check that backend is running

### General Issues

#### Models Not Loading
- Wait 5-10 minutes for initial training
- Check backend console for training progress
- Verify models directory exists: `backend/models/`
- Check backend console for errors

#### Predictions Not Working
- Wait for models to finish training
- Check backend health endpoint: `curl http://localhost:5001/api/health`
- Verify `models_loaded` is `true`
- Check backend console for errors

## 📊 Monitoring Model Training

### Check Training Progress
Watch the backend console. You'll see:
```
[1/6] Loading dataset...
Loaded 1926 records
[2/6] Training Signal Strength Predictor...
Training model for Locality1_4G with 100 data points...
  ✓ Trained Locality1_4G: RMSE=2.34, MAE=1.89
...
[6/6] Models initialized successfully!
```

### Check Model Status
```bash
curl http://localhost:5001/api/health
```

When `models_loaded: true`, models are ready!

## 🛑 Stopping the Application

### Stop Backend
In the backend terminal, press: **CTRL+C**

### Stop Frontend
In the frontend terminal, press: **CTRL+C**

## 🔄 Restarting the Application

### Restart Backend
```bash
cd network-optimizer/backend
source venv/bin/activate
python app.py
```

### Restart Frontend
```bash
cd network-optimizer/frontend
npm start
```

## 📝 Notes

1. **First Run**: Takes 5-10 minutes for model training
2. **Subsequent Runs**: Much faster (models are cached)
3. **Dataset**: Automatically downloaded and cached
4. **Models**: Trained models are saved to `backend/models/`
5. **Data**: Processed data is cached in `backend/data/`

## 🎉 You're All Set!

Once both servers are running:
1. Backend on `http://localhost:5000`
2. Frontend on `http://localhost:3000`
3. Models trained and loaded

You can now:
- ✅ Explore the dashboard
- ✅ Use all 5 features
- ✅ Generate predictions
- ✅ Analyze network patterns
- ✅ View location heatmaps

Enjoy using the Network Optimizer! 🚀

