# How to Push to GitHub

## Step-by-Step Instructions

### Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `network-optimizer` (or any name you prefer)
   - **Description**: "Cellular Network Demand Prediction and Resource Allocation"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** check "Initialize with README" (we already have files)
4. Click **"Create repository"**

### Step 2: Initialize Git (If Not Already Done)

```bash
cd network-optimizer

# Initialize git repository
git init

# Check status
git status
```

### Step 3: Add All Files

```bash
# Add all files to staging
git add .

# Verify what will be committed
git status
```

### Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Network Optimizer application with ML models and React dashboard"
```

### Step 5: Connect to GitHub Repository

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/network-optimizer.git

# Verify remote was added
git remote -v
```

### Step 6: Push to GitHub

```bash
# Push to GitHub (first time)
git branch -M main
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - Create one: GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token with `repo` scope

## Quick Command Summary

```bash
cd network-optimizer
git init
git add .
git commit -m "Initial commit: Network Optimizer application"
git remote add origin https://github.com/YOUR_USERNAME/network-optimizer.git
git branch -M main
git push -u origin main
```

## What Gets Pushed

The `.gitignore` file ensures these are **NOT** pushed:
- `node_modules/` (frontend dependencies)
- `venv/` (Python virtual environment)
- `*.pkl` (trained model files)
- `*.csv` (dataset files)
- `data/` (downloaded datasets)
- `models/` (trained models directory)
- `__pycache__/` (Python cache)
- `.DS_Store` (macOS system files)

## Important Notes

### ⚠️ What NOT to Push

1. **Virtual Environment**: `backend/venv/` - users should create their own
2. **Node Modules**: `frontend/node_modules/` - users should run `npm install`
3. **Trained Models**: `backend/models/*.pkl` - models are trained on first run
4. **Dataset Files**: `backend/data/*.csv` - dataset downloads automatically
5. **API Keys/Secrets**: Never commit sensitive information

### ✅ What IS Pushed

- All source code (`.py`, `.tsx`, `.ts` files)
- Configuration files (`package.json`, `requirements.txt`)
- Documentation (`.md` files)
- Project structure

## Updating the Repository

After making changes:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

1. **Use Personal Access Token** instead of password:
   - GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Use token as password when prompted

2. **Or use SSH** (recommended for frequent pushes):
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add SSH key to GitHub
   # Copy public key: cat ~/.ssh/id_ed25519.pub
   # Add to GitHub: Settings → SSH and GPG keys → New SSH key
   
   # Change remote URL to SSH
   git remote set-url origin git@github.com:YOUR_USERNAME/network-optimizer.git
   ```

### Large Files

If you accidentally try to push large files:

```bash
# Remove from git cache
git rm --cached large_file.pkl

# Add to .gitignore
echo "large_file.pkl" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove large file from tracking"
```

### Remote Already Exists

If you get "remote origin already exists":

```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/network-optimizer.git
```

## Repository Structure on GitHub

After pushing, your GitHub repository should have:

```
network-optimizer/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── models/
│   │   └── *.py
│   └── utils/
│       └── *.py
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── *.tsx, *.ts
├── README.md
├── .gitignore
└── Other documentation files
```

## Adding a GitHub Actions Workflow (Optional)

Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install
```

## Summary

1. **Create GitHub repository** (on GitHub.com)
2. **Initialize git**: `git init`
3. **Add files**: `git add .`
4. **Commit**: `git commit -m "Initial commit"`
5. **Add remote**: `git remote add origin https://github.com/YOUR_USERNAME/network-optimizer.git`
6. **Push**: `git push -u origin main`

That's it! Your code is now on GitHub! 🚀

