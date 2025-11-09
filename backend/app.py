"""Main Flask application for network optimizer API."""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import CORS_ORIGINS, API_HOST, API_PORT, DEBUG
from models.data_loader import DataLoader
from models.signal_strength_predictor import SignalStrengthPredictor
from models.network_usage_analyzer import NetworkUsageAnalyzer
from models.time_pattern_analyzer import TimePatternAnalyzer
from models.location_demand_mapper import LocationDemandMapper
from models.throughput_forecaster import ThroughputForecaster

app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)

# Initialize components
data_loader = DataLoader()
signal_predictor = SignalStrengthPredictor()
network_analyzer = NetworkUsageAnalyzer()
time_analyzer = TimePatternAnalyzer()
location_mapper = LocationDemandMapper()
throughput_forecaster = ThroughputForecaster()

# Global state
models_loaded = False
training_in_progress = False


def initialize_models():
    """Initialize and train all ML models."""
    global models_loaded, training_in_progress
    
    if models_loaded or training_in_progress:
        return
    
    training_in_progress = True
    print("=" * 50)
    print("Initializing ML Models...")
    print("=" * 50)
    
    try:
        # Load data
        print("\n[1/6] Loading dataset...")
        df = data_loader.load_data()
        print(f"Loaded {len(df)} records")
        
        # Train models
        print("\n[2/6] Training Signal Strength Predictor...")
        signal_predictor.train(df)
        signal_predictor.load_models()
        
        print("\n[3/6] Training Throughput Forecaster...")
        throughput_forecaster.train(df)
        throughput_forecaster.load_models()
        
        print("\n[4/6] Initializing analyzers...")
        # These don't need training, just initialization
        
        print("\n[5/6] Loading saved models...")
        signal_predictor.load_models()
        throughput_forecaster.load_models()
        
        print("\n[6/6] Models initialized successfully!")
        models_loaded = True
        
    except Exception as e:
        print(f"Error initializing models: {e}")
        import traceback
        traceback.print_exc()
    finally:
        training_in_progress = False


# Initialize models on startup (non-blocking)
import threading
model_init_thread = threading.Thread(target=initialize_models, daemon=True)
model_init_thread.start()


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'models_loaded': models_loaded,
        'timestamp': datetime.now().isoformat()
    })


# Core data endpoints
@app.route('/api/localities', methods=['GET'])
def get_localities():
    """Get list of all localities."""
    try:
        df = data_loader.get_data()
        localities = data_loader.get_localities()
        
        # Get coordinates for each locality
        localities_with_coords = []
        for locality in localities:
            locality_data = data_loader.get_locality_data(locality)
            if len(locality_data) > 0:
                lat = locality_data['Latitude'].mean() if 'Latitude' in locality_data.columns else 0
                lon = locality_data['Longitude'].mean() if 'Longitude' in locality_data.columns else 0
                localities_with_coords.append({
                    'name': locality,
                    'coordinates': {
                        'latitude': float(lat),
                        'longitude': float(lon)
                    }
                })
        
        return jsonify({
            'localities': localities_with_coords,
            'total': len(localities_with_coords)
        })
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'LOCALITIES_ERROR'}), 500


@app.route('/api/network-types', methods=['GET'])
def get_network_types():
    """Get list of network types."""
    try:
        network_types = data_loader.get_network_types()
        return jsonify({
            'network_types': network_types,
            'total': len(network_types)
        })
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'NETWORK_TYPES_ERROR'}), 500


@app.route('/api/data/summary', methods=['GET'])
def get_data_summary():
    """Get overall dataset statistics."""
    try:
        df = data_loader.get_data()
        
        summary = {
            'total_records': len(df),
            'localities': len(df['Locality'].unique()) if 'Locality' in df.columns else 0,
            'network_types': len(df['Network_Type'].unique()) if 'Network_Type' in df.columns else 0,
            'date_range': {
                'start': df['Timestamp'].min().isoformat() if 'Timestamp' in df.columns else None,
                'end': df['Timestamp'].max().isoformat() if 'Timestamp' in df.columns else None,
            }
        }
        
        # Add statistics for numeric columns
        numeric_cols = ['Signal_Strength', 'Data_Throughput', 'Latency']
        for col in numeric_cols:
            if col in df.columns:
                summary[col.lower()] = {
                    'mean': float(df[col].mean()),
                    'std': float(df[col].std()),
                    'min': float(df[col].min()),
                    'max': float(df[col].max()),
                }
        
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'SUMMARY_ERROR'}), 500


# Feature 1: Signal Strength Prediction
@app.route('/api/predict/signal-strength', methods=['POST'])
def predict_signal_strength():
    """Predict signal strength for a locality and network type."""
    try:
        data = request.get_json()
        locality = data.get('locality')
        network_type = data.get('network_type', '4G')
        hours_ahead = int(data.get('hours_ahead', 24))
        
        if not locality:
            return jsonify({'error': 'locality is required', 'code': 'MISSING_LOCALITY'}), 400
        
        if not models_loaded:
            initialize_models()
        
        result = signal_predictor.predict(locality, network_type, hours_ahead)
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({'error': str(e), 'code': 'PREDICTION_ERROR'}), 400
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'PREDICTION_ERROR'}), 500


# Feature 2: Network Usage Analysis
@app.route('/api/analysis/network-usage', methods=['GET'])
def analyze_network_usage():
    """Analyze network type usage."""
    try:
        locality = request.args.get('locality')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        df = data_loader.get_data()
        
        # Parse dates
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        
        result = network_analyzer.analyze(df, locality=locality, 
                                         start_date=start_dt, end_date=end_dt)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'ANALYSIS_ERROR'}), 500


# Feature 3: Time Patterns
@app.route('/api/analysis/time-patterns', methods=['GET'])
def analyze_time_patterns():
    """Analyze time-based demand patterns."""
    try:
        locality = request.args.get('locality')
        metric = request.args.get('metric', 'throughput')
        
        df = data_loader.get_data()
        
        result = time_analyzer.analyze(df, locality=locality, metric=metric)
        heatmap_data = time_analyzer.get_heatmap_data(df, locality=locality, metric=metric)
        result.update(heatmap_data)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'ANALYSIS_ERROR'}), 500


# Feature 4: Location Demand
@app.route('/api/analysis/location-demand', methods=['GET'])
def analyze_location_demand():
    """Analyze location-based demand."""
    try:
        metric = request.args.get('metric', 'composite')
        time_range = request.args.get('time_range', 'current')
        
        df = data_loader.get_data()
        
        result = location_mapper.analyze(df, metric=metric, time_range=time_range)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'ANALYSIS_ERROR'}), 500


# Feature 5: Throughput Forecasting
@app.route('/api/predict/throughput', methods=['POST'])
def predict_throughput():
    """Predict throughput for a locality and network type."""
    try:
        data = request.get_json()
        locality = data.get('locality')
        network_type = data.get('network_type', '4G')
        hours_ahead = int(data.get('hours_ahead', 24))
        
        if not locality:
            return jsonify({'error': 'locality is required', 'code': 'MISSING_LOCALITY'}), 400
        
        if not models_loaded:
            initialize_models()
        
        df = data_loader.get_data()
        result = throughput_forecaster.predict(locality, network_type, df, hours_ahead)
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({'error': str(e), 'code': 'PREDICTION_ERROR'}), 400
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'PREDICTION_ERROR'}), 500


# Model management endpoints
@app.route('/api/models/retrain', methods=['POST'])
def retrain_models():
    """Trigger model retraining."""
    global models_loaded, training_in_progress
    
    if training_in_progress:
        return jsonify({'error': 'Training already in progress', 'code': 'TRAINING_IN_PROGRESS'}), 409
    
    try:
        models_loaded = False
        initialize_models()
        return jsonify({
            'status': 'success',
            'message': 'Models retraining initiated',
            'models_loaded': models_loaded
        })
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'RETRAIN_ERROR'}), 500


@app.route('/api/models/metrics', methods=['GET'])
def get_model_metrics():
    """Get current model performance metrics."""
    try:
        metrics = {
            'signal_strength': {},
            'throughput': {},
        }
        
        # Collect metrics from models
        for key, model_data in signal_predictor.models.items():
            metrics['signal_strength'][key] = model_data.get('metrics', {})
        
        for key, model_data in throughput_forecaster.models.items():
            metrics['throughput'][key] = model_data.get('metrics', {})
        
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'METRICS_ERROR'}), 500


if __name__ == '__main__':
    print("Starting Network Optimizer API...")
    print("Initializing models (this may take a few minutes)...")
    initialize_models()
    app.run(host=API_HOST, port=API_PORT, debug=DEBUG)

