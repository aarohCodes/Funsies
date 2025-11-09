#!/usr/bin/env python
"""Run script for the backend server."""

import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app import app, initialize_models
import threading

if __name__ == '__main__':
    print("=" * 60)
    print("Network Optimizer Backend Server")
    print("=" * 60)
    print("\nStarting server...")
    print("Note: Models will be trained in the background on first run.")
    print("This may take several minutes. The API will be available immediately.\n")
    
    # Initialize models in background thread
    model_thread = threading.Thread(target=initialize_models, daemon=True)
    model_thread.start()
    
    # Run Flask app
    from config import API_PORT
    app.run(host='0.0.0.0', port=API_PORT, debug=False)

