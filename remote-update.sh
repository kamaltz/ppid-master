#!/bin/bash

# PPID Master Remote Update Script
# Can be executed directly from GitHub using curl

set -e

REPO_URL="https://raw.githubusercontent.com/your-username/ppid-master/main"

echo "🚀 PPID Master Remote Update"
echo "📡 Downloading update script from GitHub..."

# Download and execute update script
curl -fsSL "$REPO_URL/update-container.sh" | bash

echo "✅ Remote update completed!"