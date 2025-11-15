#!/bin/bash
# Script to push Color Blind Simulator to GitHub

cd "/Users/anon2468/Documents/Figma Plugins/Color Blind Simulator"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Color Blind Simulator Figma Plugin

- Color blindness simulation using Brettel and Machado algorithms
- Live preview with side-by-side comparison
- Support for 8 color blindness types
- Optimized image processing for fast preview"

# Set main branch
git branch -M main

# Add remote repository
git remote add origin https://github.com/timsully/color-blind-simulator-figma.git

# Push to GitHub
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "Repository: https://github.com/timsully/color-blind-simulator-figma"

