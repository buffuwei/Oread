#!/usr/bin/env python3
"""
Generate promotional images for Chrome Web Store
Requires: pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Create output directory
os.makedirs('output', exist_ok=True)

def create_promotional_tile():
    """Create 1280x800 promotional tile"""
    img = Image.new('RGB', (1280, 800), color='#1a1a2e')
    draw = ImageDraw.Draw(img)
    
    # Try to use a nice font, fallback to default
    try:
        title_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 80)
        subtitle_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 40)
        feature_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        feature_font = ImageFont.load_default()
    
    # Title
    draw.text((640, 200), "Obsidian Read Later", fill='#7c3aed', font=title_font, anchor='mm')
    
    # Subtitle
    draw.text((640, 280), "Save Web Articles to Obsidian with AI Summaries", 
              fill='#e0e0e0', font=subtitle_font, anchor='mm')
    
    # Features
    features = [
        "✓ Smart Content Extraction",
        "✓ AI-Powered Summaries",
        "✓ Multiple LLM Support",
        "✓ Local LLM Compatible"
    ]
    
    y_pos = 400
    for feature in features:
        draw.text((640, y_pos), feature, fill='#a78bfa', font=feature_font, anchor='mm')
        y_pos += 60
    
    # Accent line
    draw.rectangle([340, 350, 940, 355], fill='#7c3aed')
    
    img.save('output/promotional-tile-1280x800.png')
    print("✓ Created promotional-tile-1280x800.png")

def create_small_promotional_tile():
    """Create 440x280 small promotional tile"""
    img = Image.new('RGB', (440, 280), color='#1a1a2e')
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 36)
        subtitle_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 18)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # Title
    draw.text((220, 100), "Obsidian", fill='#7c3aed', font=title_font, anchor='mm')
    draw.text((220, 140), "Read Later", fill='#7c3aed', font=title_font, anchor='mm')
    
    # Subtitle
    draw.text((220, 200), "AI-Powered Web Clipper", fill='#e0e0e0', font=subtitle_font, anchor='mm')
    
    # Accent
    draw.rectangle([120, 170, 320, 173], fill='#7c3aed')
    
    img.save('output/small-promotional-tile-440x280.png')
    print("✓ Created small-promotional-tile-440x280.png")

def create_screenshot_template(filename, title, description):
    """Create a screenshot template"""
    img = Image.new('RGB', (1280, 800), color='#ffffff')
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 48)
        desc_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 28)
    except:
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # Header bar
    draw.rectangle([0, 0, 1280, 100], fill='#7c3aed')
    draw.text((640, 50), title, fill='#ffffff', font=title_font, anchor='mm')
    
    # Description
    draw.text((640, 150), description, fill='#333333', font=desc_font, anchor='mm')
    
    # Placeholder for actual screenshot
    draw.rectangle([100, 220, 1180, 720], outline='#cccccc', width=2)
    draw.text((640, 470), "Replace with actual screenshot", 
              fill='#999999', font=desc_font, anchor='mm')
    
    img.save(f'output/{filename}')
    print(f"✓ Created {filename}")

if __name__ == '__main__':
    print("Generating Chrome Web Store promotional images...\n")
    
    create_promotional_tile()
    create_small_promotional_tile()
    
    # Create screenshot templates
    create_screenshot_template(
        'screenshot-1-config.png',
        'Easy Configuration',
        'Configure your Obsidian vault path and choose your preferred LLM provider'
    )
    
    create_screenshot_template(
        'screenshot-2-save-flow.png',
        'One-Click Save',
        'Save any web article with a single click - content extraction happens automatically'
    )
    
    create_screenshot_template(
        'screenshot-3-preview.png',
        'Preview & Edit',
        'Review AI-generated summaries and edit content before saving to Obsidian'
    )
    
    create_screenshot_template(
        'screenshot-4-llm-support.png',
        'Multiple LLM Support',
        'Works with OpenAI, Claude, and local LLMs like Ollama and LM Studio'
    )
    
    create_screenshot_template(
        'screenshot-5-markdown.png',
        'Perfect Markdown Output',
        'Generated files include frontmatter, AI summary, and formatted content'
    )
    
    print("\n✓ All promotional images generated in 'output' directory")
    print("\nNext steps:")
    print("1. Replace screenshot templates with actual browser screenshots")
    print("2. Use browser dev tools to capture real UI at 1280x800 or 640x400")
    print("3. Review and adjust promotional tiles as needed")
