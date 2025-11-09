#!/bin/bash

# Installation script that handles Python 3.13 compatibility issues

echo "========================================="
echo "Network Optimizer - Backend Installation"
echo "========================================="
echo ""

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
echo "Python version: $(python3 --version)"

# Check if Python 3.13
if [[ "$PYTHON_VERSION" == "3.13" ]]; then
    echo "⚠️  Warning: Python 3.13 detected"
    echo "Some packages may not have pre-built wheels for Python 3.13"
    echo "Attempting installation with updated package versions..."
    echo ""
fi

# Upgrade pip and build tools
echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# Install numpy and pandas first (critical dependencies)
echo ""
echo "Installing numpy and pandas..."
pip install numpy pandas

# If that fails, try with --only-binary
if [ $? -ne 0 ]; then
    echo "Retrying with pre-built wheels only..."
    pip install --only-binary :all: numpy pandas
fi

# Install core dependencies
echo ""
echo "Installing core dependencies..."
pip install Flask flask-cors scikit-learn matplotlib seaborn scipy python-dateutil kagglehub

# Install Prophet (may fail on Python 3.13)
echo ""
echo "Installing Prophet (time-series forecasting)..."
pip install prophet || {
    echo "⚠️  Warning: Prophet installation failed"
    echo "The app will work but time-series predictions may be limited"
    echo "You can install it later with: pip install pystan cmdstanpy prophet"
}

echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "To verify installation, run:"
echo "  python -c \"import flask, pandas, numpy, sklearn; print('Success!')\""
echo ""

