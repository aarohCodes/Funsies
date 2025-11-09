# Fixing Backend Installation Errors

## Problem: pandas Build Error on Python 3.13

You're seeing this error because:
- **Python 3.13.7** is very new
- Older pandas/numpy versions don't have pre-built wheels for Python 3.13
- pip is trying to build from source and failing

## ✅ Quick Fix (Recommended)

### Option 1: Use the Installation Script

```bash
cd network-optimizer/backend
source venv/bin/activate  # If venv is already created
chmod +x install.sh
./install.sh
```

### Option 2: Install Step-by-Step

```bash
cd network-optimizer/backend
source venv/bin/activate

# Upgrade pip first
pip install --upgrade pip setuptools wheel

# Install numpy and pandas (they should have Python 3.13 wheels now)
pip install numpy pandas

# Install the rest
pip install Flask flask-cors scikit-learn matplotlib seaborn scipy python-dateutil kagglehub

# Try Prophet (may work, may not)
pip install prophet
```

### Option 3: Use Updated Requirements

The requirements.txt has been updated to use newer versions. Try:

```bash
cd network-optimizer/backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 🔧 Alternative: Use Python 3.11 or 3.12 (Most Stable)

If the above doesn't work, use Python 3.11 or 3.12 which have better package support:

```bash
# Install Python 3.12 (if using Homebrew)
brew install python@3.12

# Create new venv with Python 3.12
cd network-optimizer/backend
rm -rf venv  # Remove old venv
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 📦 What's Been Updated

The `requirements.txt` has been updated to:
- Use newer pandas (>=2.2.0) which has Python 3.13 support
- Use newer numpy (>=1.26.0) which has Python 3.13 support
- More flexible version constraints
- Added Prophet dependencies explicitly

## 🧪 Verify Installation

After installation, test it:

```bash
python -c "import flask, pandas, numpy, sklearn, matplotlib; print('✅ All packages installed!')"
```

## ⚠️ If Prophet Fails

Prophet can be tricky. If it fails to install:

1. **The app will still work** - other features don't depend on it
2. **Signal strength predictions** will use alternative methods
3. **You can install it later:**
   ```bash
   pip install pystan cmdstanpy
   pip install prophet
   ```

## 🐛 Still Having Issues?

1. **Clear pip cache:**
   ```bash
   pip cache purge
   ```

2. **Try installing from wheel files only:**
   ```bash
   pip install --only-binary :all: numpy pandas
   ```

3. **Check for conflicting packages:**
   ```bash
   pip list
   ```

4. **Create fresh virtual environment:**
   ```bash
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

## 📝 Summary

**Quickest fix:**
```bash
cd network-optimizer/backend
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install numpy pandas Flask flask-cors scikit-learn matplotlib seaborn scipy python-dateutil kagglehub
pip install prophet  # Optional, may fail on Python 3.13
```

**Best long-term solution:**
Use Python 3.11 or 3.12 for better package compatibility.

