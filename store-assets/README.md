# Chrome Web Store Assets

This directory contains promotional materials for publishing the Obsidian Read Later extension to the Chrome Web Store.

## Required Assets

### Promotional Images

1. **Promotional Tile** (1280x800)
   - Main promotional image shown in the Chrome Web Store
   - Features extension name, tagline, and key features
   - File: `output/promotional-tile-1280x800.png`

2. **Small Promotional Tile** (440x280)
   - Smaller version for compact displays
   - File: `output/small-promotional-tile-440x280.png`

### Screenshots (5 required)

All screenshots should be 1280x800 or 640x400 pixels:

1. **Configuration Interface** (`screenshot-1-config.png`)
   - Shows the popup with configuration options
   - Highlights: Vault path, LLM provider selection, API key input
   - Demonstrates ease of setup

2. **Save Flow** (`screenshot-2-save-flow.png`)
   - Shows the "Save Current Page" button and status messages
   - Demonstrates the one-click save experience
   - Shows progress indicators

3. **Preview Feature** (`screenshot-3-preview.png`)
   - Shows the Side Panel with preview and edit functionality
   - Highlights the AI-generated summary
   - Shows edit capabilities

4. **LLM Support** (`screenshot-4-llm-support.png`)
   - Shows configuration with different LLM providers
   - Highlights OpenAI, Claude, and custom endpoint options
   - Demonstrates local LLM support (Ollama example)

5. **Generated Markdown** (`screenshot-5-markdown.png`)
   - Shows the final Markdown file in Obsidian
   - Highlights frontmatter, AI summary, and formatted content
   - Demonstrates the quality of output

## Generating Assets

### Step 1: Generate Base Images

```bash
cd store-assets
python3 generate-promo-images.py
```

This creates promotional tiles and screenshot templates in the `output` directory.

### Step 2: Capture Real Screenshots

1. Load the extension in Chrome (Developer mode)
2. Set browser window to 1280x800 resolution
3. Capture screenshots of actual UI:
   - Use Chrome DevTools Device Toolbar for consistent sizing
   - Use screenshot tools like macOS Screenshot (Cmd+Shift+4) or browser extensions
   - Ensure high quality (PNG format, no compression)

#### Screenshot Checklist

- [ ] Configuration interface with all fields visible
- [ ] Save button clicked with status message showing
- [ ] Side Panel open with preview content
- [ ] Configuration showing custom endpoint for local LLM
- [ ] Obsidian with generated Markdown file open

### Step 3: Edit and Polish

Use image editing software to:
- Add annotations or highlights if needed
- Ensure consistent styling across screenshots
- Crop to exact dimensions (1280x800 or 640x400)
- Optimize file size (PNG, < 5MB each)

## Design Guidelines

### Color Scheme

- Primary: `#7c3aed` (Purple - matches Obsidian branding)
- Background: `#1a1a2e` (Dark blue-gray)
- Text: `#e0e0e0` (Light gray)
- Accent: `#a78bfa` (Light purple)

### Typography

- Title: Large, bold, centered
- Subtitle: Medium, regular weight
- Features: Bullet points with checkmarks
- Keep text minimal and impactful

### Best Practices

1. **Show, Don't Tell**: Use actual UI screenshots rather than mockups
2. **Highlight Key Features**: Use arrows or highlights to draw attention
3. **Consistent Branding**: Use the same color scheme across all assets
4. **High Quality**: Use high-resolution images, avoid pixelation
5. **Clear Context**: Each screenshot should tell a story

## File Naming Convention

- Promotional tiles: `promotional-tile-{width}x{height}.png`
- Screenshots: `screenshot-{number}-{description}.png`

## Upload Checklist

Before uploading to Chrome Web Store:

- [ ] All images are correct dimensions
- [ ] File sizes are under 5MB each
- [ ] Images are PNG format
- [ ] Screenshots show actual extension UI
- [ ] No sensitive information visible (API keys, personal data)
- [ ] Text is readable at thumbnail size
- [ ] Colors are consistent with branding

## Additional Resources

- [Chrome Web Store Image Guidelines](https://developer.chrome.com/docs/webstore/images/)
- [Chrome Web Store Best Practices](https://developer.chrome.com/docs/webstore/best_practices/)
