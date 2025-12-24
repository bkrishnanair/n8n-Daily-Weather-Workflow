#!/bin/bash
# This script initializes the git repository, commits all files, and pushes to the remote.

# Stop on first error
set -e

echo "Initializing git repository..."
git init

# Check if remote 'origin' already exists
if git remote | grep -q 'origin'; then
    echo "Remote 'origin' already exists. Setting URL..."
    git remote set-url origin https://github.com/bkrishnanair/n8n-Daily-Weather-Workflow.git
else
    echo "Adding remote 'origin'..."
    git remote add origin https://github.com/bkrishnanair/n8n-Daily-Weather-Workflow.git
fi

echo "Staging all files..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "No changes to commit. Proceeding to push..."
else
    echo "Committing files..."
    git commit -m "feat: initial commit of n8n weather workflow"
fi

echo "Setting branch to 'main'..."
git branch -M main

echo "Pushing to origin main..."
git push -u origin main

echo "✅ Code pushed to GitHub successfully!"