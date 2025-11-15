# Setting up GitHub Repository

Since git commands require Xcode Command Line Tools setup, here are the steps to create the GitHub repository:

## Option 1: Using GitHub CLI (if installed)

```bash
cd "/Users/anon2468/Documents/Figma Plugins/Color Blind Simulator"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Color Blind Simulator Figma Plugin"

# Create repository on GitHub
gh repo create color-blind-simulator-figma --public --description "A Figma plugin that simulates different types of color blindness on selected layers"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/color-blind-simulator-figma.git
git branch -M main
git push -u origin main
```

## Option 2: Using GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `color-blind-simulator-figma`
3. Description: `A Figma plugin that simulates different types of color blindness on selected layers`
4. Choose Public or Private
5. **Don't** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

Then run these commands (after fixing Xcode Command Line Tools if needed):

```bash
cd "/Users/anon2468/Documents/Figma Plugins/Color Blind Simulator"
git init
git add .
git commit -m "Initial commit: Color Blind Simulator Figma Plugin"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/color-blind-simulator-figma.git
git push -u origin main
```

## Fixing Xcode Command Line Tools

If you're getting xcrun errors, run:
```bash
xcode-select --install
```

Then restart your terminal and try again.

