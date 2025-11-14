#!/bin/bash

# Package extension for Chrome Web Store upload
# This script creates a clean .zip file ready for submission

set -e

echo "================================================"
echo "Chrome Web Store Package Builder"
echo "================================================"
echo ""

# Configuration
EXTENSION_DIR=".."
OUTPUT_DIR="./packages"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
VERSION=$(grep '"version"' ../manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
PACKAGE_NAME="obsidian-read-later-v${VERSION}-${TIMESTAMP}.zip"

echo "Extension version: $VERSION"
echo "Package name: $PACKAGE_NAME"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Files and directories to include
INCLUDE_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "icons/"
    "libs/"
    "popup/"
    "services/"
    "sidepanel/"
    "README.md"
)

# Files and directories to exclude
EXCLUDE_PATTERNS=(
    "*.git*"
    "node_modules/*"
    "__tests__/*"
    "*.test.js"
    "test-*.js"
    "jest.config.js"
    "package.json"
    "package-lock.json"
    "pnpm-lock.yaml"
    ".vscode/*"
    ".kiro/*"
    "store-assets/*"
    "*.md"
    "*.py"
    "*.sh"
    ".DS_Store"
    "*.log"
)

echo "Creating package..."
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy files to temporary directory
for item in "${INCLUDE_FILES[@]}"; do
    if [ -e "$EXTENSION_DIR/$item" ]; then
        echo "  Including: $item"
        if [ -d "$EXTENSION_DIR/$item" ]; then
            mkdir -p "$TEMP_DIR/$(dirname $item)"
            cp -r "$EXTENSION_DIR/$item" "$TEMP_DIR/$item"
        else
            mkdir -p "$TEMP_DIR/$(dirname $item)"
            cp "$EXTENSION_DIR/$item" "$TEMP_DIR/$item"
        fi
    else
        echo "  Warning: $item not found, skipping"
    fi
done

# Remove excluded files from temp directory
echo ""
echo "Removing excluded files..."
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    find "$TEMP_DIR" -path "*/$pattern" -o -name "$pattern" | while read file; do
        if [ -e "$file" ]; then
            echo "  Excluding: $(basename $file)"
            rm -rf "$file"
        fi
    done
done

# Create zip file
echo ""
echo "Creating zip archive..."
cd "$TEMP_DIR"
zip -r "$OLDPWD/$OUTPUT_DIR/$PACKAGE_NAME" . -q

# Cleanup
cd "$OLDPWD"
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)

echo ""
echo "================================================"
echo "✓ Package created successfully!"
echo "================================================"
echo ""
echo "Location: $OUTPUT_DIR/$PACKAGE_NAME"
echo "Size: $FILE_SIZE"
echo ""
echo "Next steps:"
echo "1. Verify the package by extracting and testing it"
echo "2. Go to Chrome Web Store Developer Dashboard"
echo "3. Upload $PACKAGE_NAME"
echo "4. Fill in store listing information (see STORE_LISTING.md)"
echo "5. Upload promotional images from output/ directory"
echo "6. Submit for review"
echo ""
echo "Good luck! 🚀"
