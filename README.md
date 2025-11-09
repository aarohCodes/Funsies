# Network Optimizer

A comprehensive web application for predicting cellular network demand and providing resource allocation recommendations based on historical 3G/4G/5G/LTE network data from Bihar, India.

## Features

### Tier 1 Features (All Implemented)

1. **Signal Strength Prediction by Location**
   - Time-series forecasting using Prophet
   - Predicts signal strength for next 24 hours
   - Supports all 20 localities and 4 network types
   - Displays predictions with confidence intervals

2. **Network Type Usage Analysis**
   - Statistical analysis of network usage patterns
   - Identifies dominant network type per locality
   - Trend analysis over time
   - Comparative visualization across localities

3. **Time-based Demand Patterns**
   - Temporal pattern recognition using K-means clustering
   - Identifies peak hours and demand clusters
   - Heatmap visualization (hour × day of week)
   - Analyzes throughput, signal strength, and latency patterns

4. **Location-based Demand Heatmap**
   - Composite demand scoring algorithm
   - Interactive map visualization
   - Ranks localities by resource needs
   - Identifies top 5 high-demand and bottom 5 low-demand areas

5. **Throughput Demand Forecasting**
   - Regression-based forecasting using Random Forest
   - Predicts data throughput for next 24-72 hours
   - Alerts for low throughput predictions
   - Resource allocation recommendations

## Technology Stack

### Backend
- **Python 3.8+**
- **Flask** - Web framework
- **scikit-learn** - Machine learning
- **Prophet** - Time-series forecasting
- **pandas, numpy** - Data processing
- **kagglehub** - Dataset loading

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Leaflet** - Map visualization

## Project Structure

```
network-optimizer/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── config.py                 # Configuration settings
│   ├── requirements.txt          # Python dependencies
│   ├── models/
│   │   ├── data_loader.py        # Dataset loading
│   │   ├── signal_strength_predictor.py
│   │   ├── network_usage_analyzer.py
│   │   ├── time_pattern_analyzer.py
│   │   ├── location_demand_mapper.py
│   │   └── throughput_forecaster.py
│   └── utils/
│       ├── preprocessing.py      # Data preprocessing
│       └── model_utils.py        # Model utilities
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SignalStrengthPredictor.tsx
│   │   │   ├── NetworkUsageAnalyzer.tsx
│   │   │   ├── TimePatternAnalyzer.tsx
│   │   │   ├── LocationHeatmap.tsx
│   │   │   ├── ThroughputForecaster.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── api/
│   │   │   └── apiClient.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- Kaggle account (for dataset access)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd network-optimizer/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Kaggle credentials (if needed):
   - The application uses `kagglehub` which may require Kaggle API credentials
   - Place your Kaggle API token at `~/.kaggle/kaggle.json` if needed

5. Run the backend server:
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000`

   **Note**: On first run, the application will download the dataset from Kaggle and train all ML models. This may take several minutes.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd network-optimizer/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Core Endpoints

- `GET /api/health` - Health check
- `GET /api/localities` - List all localities
- `GET /api/network-types` - List network types
- `GET /api/data/summary` - Dataset statistics

### Feature Endpoints

- `POST /api/predict/signal-strength` - Signal strength prediction
- `GET /api/analysis/network-usage` - Network usage analysis
- `GET /api/analysis/time-patterns` - Time pattern analysis
- `GET /api/analysis/location-demand` - Location demand analysis
- `POST /api/predict/throughput` - Throughput forecasting

### Model Management

- `POST /api/models/retrain` - Retrain all models
- `GET /api/models/metrics` - Get model performance metrics

## Dataset

The application uses the "Cellular Network Analysis Dataset" from Kaggle:
- **Dataset**: `suraj520/cellular-network-analysis-dataset`
- **Location**: Bihar, India
- **Time Period**: 10-minute intervals
- **Localities**: 20 locations
- **Network Types**: 3G, 4G, 5G, LTE
- **Total Records**: 1926 time periods

### Dataset Columns

- Timestamp (10-minute intervals)
- Latitude, Longitude
- Signal Strength (dBm) for 3G, 4G, 5G, LTE
- Data Throughput (Mbps)
- Latency (ms)
- Network Type
- BB60C Measurement (dBm)
- srsRAN Measurement (dBm)
- BladeRFxA9 Measurement (dBm)

**Note**: Signal Quality column is excluded from models as it contains only 0.0 values.

## Model Training

All ML models are trained automatically on application startup. The training process:

1. Loads dataset from Kaggle
2. Preprocesses data (feature engineering, normalization)
3. Trains models for each locality-network combination
4. Saves trained models to disk
5. Makes models available via API

### Model Details

- **Signal Strength Predictor**: Prophet time-series model
- **Throughput Forecaster**: Random Forest regression
- **Time Pattern Analyzer**: K-means clustering
- **Network Usage Analyzer**: Statistical analysis
- **Location Demand Mapper**: Composite scoring algorithm

## Usage

1. **Start the backend server** (see Backend Setup)
2. **Start the frontend server** (see Frontend Setup)
3. **Wait for models to train** (first run only, ~5-10 minutes)
4. **Access the dashboard** at `http://localhost:3000`
5. **Navigate through features** using the sidebar

## Dashboard Features

### Dashboard Overview
- Summary cards with key metrics
- Quick access to all features
- Dataset statistics

### Signal Strength Predictor
- Select locality and network type
- Choose prediction horizon (6h, 12h, 24h)
- View predictions with confidence intervals
- Color-coded signal quality indicators

### Network Usage Analyzer
- Filter by locality or view all
- Pie chart and bar chart visualizations
- Usage trends over time
- Detailed statistics table

### Time Pattern Analyzer
- Select metric (throughput, signal strength, latency)
- Heatmap visualization
- Peak hour identification
- Demand cluster analysis

### Location Heatmap
- Interactive map of Bihar
- Color-coded demand indicators
- Ranked locality list
- Top 5 high-demand areas

### Throughput Forecaster
- Select locality and network type
- Choose forecast horizon (6h - 72h)
- View predictions with confidence intervals
- Low throughput alerts

## Troubleshooting

### Backend Issues

1. **Dataset download fails**:
   - Ensure you have internet connection
   - Check Kaggle API credentials if required
   - Verify dataset name is correct

2. **Model training fails**:
   - Check that dataset was loaded successfully
   - Ensure sufficient memory available
   - Check error logs for specific issues

3. **Import errors**:
   - Verify all dependencies are installed
   - Check Python version (3.8+)
   - Ensure virtual environment is activated

### Frontend Issues

1. **API connection fails**:
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Verify API URL in `apiClient.ts`

2. **Charts not displaying**:
   - Check browser console for errors
   - Verify data format from API
   - Ensure Recharts is installed

3. **Map not loading**:
   - Check Leaflet CSS is loaded
   - Verify internet connection (for map tiles)
   - Check browser console for errors

## Performance Considerations

- **Model Training**: Initial training takes 5-10 minutes
- **Predictions**: Usually complete in < 1 second
- **Data Loading**: Cached after first load
- **Frontend**: Optimized for datasets with 1926+ records

## Future Enhancements

- User authentication system
- Model retraining scheduler
- Email alerts for critical predictions
- PDF report export
- Dark mode toggle
- Real-time WebSocket updates
- Advanced model ensemble methods
- Historical prediction tracking

## License

This project is provided as-is for educational and demonstration purposes.

## Contact

For issues or questions, please refer to the project repository.

# HarmoniQ
