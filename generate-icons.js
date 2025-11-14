#!/usr/bin/env node

/**
 * Icon Generator for Obsidian Read Later
 * Generates PNG icons in 16x16, 48x48, and 128x128 sizes
 * 
 * This script creates simple canvas-based icons without external dependencies.
 * The icon design features a book/document with a bookmark, representing "read later".
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

// Icon design: A document/book with a bookmark
function drawIcon(ctx, size) {
  const scale = size / 128; // Base design on 128x128
  
  // Clear canvas
  ctx.clearRect(0, 0, size, size);
  
  // Background circle with gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#7C3AED'); // Purple
  gradient.addColorStop(1, '#5B21B6'); // Darker purple
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Document/Book shape
  const docWidth = 50 * scale;
  const docHeight = 65 * scale;
  const docX = (size - docWidth) / 2;
  const docY = (size - docHeight) / 2 + 5 * scale;
  
  // Document background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(docX, docY, docWidth, docHeight);
  
  // Document lines (text representation)
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 2 * scale;
  
  const lineSpacing = 12 * scale;
  const lineStartX = docX + 8 * scale;
  const lineEndX = docX + docWidth - 8 * scale;
  
  for (let i = 0; i < 4; i++) {
    const y = docY + 15 * scale + i * lineSpacing;
    ctx.beginPath();
    ctx.moveTo(lineStartX, y);
    ctx.lineTo(lineEndX, y);
    ctx.stroke();
  }
  
  // Bookmark ribbon
  const bookmarkWidth = 12 * scale;
  const bookmarkX = docX + docWidth - bookmarkWidth - 5 * scale;
  const bookmarkY = docY - 5 * scale;
  const bookmarkHeight = 35 * scale;
  
  ctx.fillStyle = '#F59E0B'; // Amber color for bookmark
  ctx.beginPath();
  ctx.moveTo(bookmarkX, bookmarkY);
  ctx.lineTo(bookmarkX + bookmarkWidth, bookmarkY);
  ctx.lineTo(bookmarkX + bookmarkWidth, bookmarkY + bookmarkHeight);
  ctx.lineTo(bookmarkX + bookmarkWidth / 2, bookmarkY + bookmarkHeight - 5 * scale);
  ctx.lineTo(bookmarkX, bookmarkY + bookmarkHeight);
  ctx.closePath();
  ctx.fill();
}

async function generateIcons() {
  const sizes = [16, 48, 128];
  
  console.log('Generating icons for Obsidian Read Later...\n');
  
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw the icon
    drawIcon(ctx, size);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    const filename = `icons/icon${size}.png`;
    
    fs.writeFileSync(filename, buffer);
    console.log(`✓ Generated ${filename} (${size}x${size})`);
  }
  
  console.log('\n✓ All icons generated successfully!');
}

// Check if canvas module is available
try {
  require.resolve('canvas');
  generateIcons().catch(err => {
    console.error('Error generating icons:', err);
    process.exit(1);
  });
} catch (e) {
  console.error('Error: "canvas" module not found.');
  console.error('Please install it with: npm install canvas');
  console.error('\nAlternatively, you can use the fallback SVG method.');
  process.exit(1);
}
