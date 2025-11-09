"""Configuration settings for the network optimizer application."""

import os
from pathlib import Path

# Base directory (backend directory)
BASE_DIR = Path(__file__).parent

# Data directory
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Models directory
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)

# Dataset configuration
DATASET_NAME = "suraj520/cellular-network-analysis-dataset"

# Model configuration
MODEL_VERSION = "1.0.0"
TRAIN_TEST_SPLIT = 0.8

# API configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "5001"))  # Changed to 5001 to avoid AirPlay conflict on macOS
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# CORS configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Signal strength thresholds (dBm)
SIGNAL_STRENGTH_GOOD = -70
SIGNAL_STRENGTH_FAIR = -90

# Throughput threshold (Mbps)
THROUGHPUT_THRESHOLD = 5.0

# Demand score weights
DEMAND_WEIGHTS = {
    "throughput": 0.4,
    "signal_strength": 0.3,
    "latency": 0.3,
}

# Network types
NETWORK_TYPES = ["3G", "4G", "5G", "LTE"]

# Time intervals
TIME_INTERVAL_MINUTES = 10

