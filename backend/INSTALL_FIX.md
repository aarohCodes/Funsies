# Fixing Installation Issues

## Problem: pandas/numpy Build Errors on Python 3.13

If you're getting build errors when installing requirements, it's likely because:
1. Python 3.13 is very new and some packages don't have pre-built wheels yet
2. Building from source requires Cython and build tools

## Solution Options

### Option 1: Use Python 3.11 or 3.12 (Recommended)

Python 3.11 or 3.12 have better package support. Use pyenv or create a new venv:

```bash
# Install Python 3.12 using Homebrew
brew install python@3.12

# Create venv with Python 3.12
cd network-optimizer/backend
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Option 2: Update to Latest Package Versions

Use the updated requirements with more flexible versions:

```bash
cd network-optimizer/backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

If that still fails, try:

```bash
pip install -r requirements-fix.txt
```

### Option 3: Install Build Tools (For Building from Source)

If you want to build from source, install build dependencies:

```bash
# Install Xcode command line tools (macOS)
xcode-select --install

# Install build dependencies
brew install pkg-config

# Then try installing again
pip install --upgrade pip
pip install -r requirements.txt
```

### Option 4: Install Packages One by One

Sometimes installing packages individually helps identify the problematic package:

```bash
pip install Flask flask-cors
pip install numpy
pip install pandas
pip install scikit-learn
pip install matplotlib seaborn
pip install scipy
pip install kagglehub
pip install prophet  # This one might be tricky
```

### Option 5: Use Conda (Alternative)

If pip continues to fail, consider using conda:

```bash
# Install Miniconda first, then:
conda create -n network-optimizer python=3.11
conda activate network-optimizer
conda install pandas numpy scikit-learn matplotlib seaborn scipy
pip install Flask flask-cors kagglehub prophet
```

## Prophet Installation Issues

Prophet can be tricky to install. If it fails:

1. **Try installing dependencies first:**
   ```bash
   pip install pystan cmdstanpy
   pip install prophet
   ```

2. **Or use alternative:**
   - Comment out Prophet in the code
   - Use simpler forecasting methods (ARIMA, Linear Regression)
   - The code has fallback mechanisms

## Quick Fix for Python 3.13

If you must use Python 3.13, try:

```bash
# Upgrade pip first
pip install --upgrade pip setuptools wheel

# Install numpy and pandas from pre-built wheels
pip install numpy pandas --only-binary :all:

# Then install the rest
pip install Flask flask-cors scikit-learn matplotlib seaborn scipy kagglehub
pip install prophet  # May still have issues
```

## Verify Installation

After installation, verify:

```bash
python -c "import flask, pandas, numpy, sklearn, matplotlib; print('All packages installed!')"
```

## Still Having Issues?

1. Check Python version: `python3 --version`
2. Check pip version: `pip --version`
3. Try creating a fresh virtual environment
4. Check for conflicting packages
5. Consider using Python 3.11 or 3.12 instead

## Recommended Python Version

For best compatibility, use:
- **Python 3.11** (most stable, best package support)
- **Python 3.12** (also good support)
- **Python 3.13** (newest, but some packages may not have wheels yet)

