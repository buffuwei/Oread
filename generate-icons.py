#!/usr/bin/env python3
"""
Icon Generator for Obsidian Read Later
Generates PNG icons in 16x16, 48x48, and 128x128 sizes using PIL/Pillow
"""

try:
    from PIL import Image, ImageDraw
    import os
except ImportError:
    print("Error: Pillow library not found.")
    print("Please install it with: pip install Pillow")
    exit(1)

def draw_icon(size):
    """Draw the Obsidian Read Later icon"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    scale = size / 128
    
    # Background circle with purple gradient (simplified as solid color)
    padding = int(2 * scale)
    circle_radius = size // 2 - padding
    
    # Draw purple circle background
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        fill=(124, 58, 237, 255),  # Purple #7C3AED
        outline=None
    )
    
    # Document/Book shape
    doc_width = int(50 * scale)
    doc_height = int(65 * scale)
    doc_x = (size - doc_width) // 2
    doc_y = (size - doc_height) // 2 + int(5 * scale)
    
    # Document background (white)
    draw.rectangle(
        [doc_x, doc_y, doc_x + doc_width, doc_y + doc_height],
        fill=(255, 255, 255, 255),
        outline=None
    )
    
    # Document lines (text representation)
    line_color = (156, 163, 175, 255)  # Gray #9CA3AF
    line_width = max(1, int(2 * scale))
    line_spacing = int(12 * scale)
    line_start_x = doc_x + int(8 * scale)
    line_end_x = doc_x + doc_width - int(8 * scale)
    
    for i in range(4):
        y = doc_y + int(15 * scale) + i * line_spacing
        draw.line(
            [(line_start_x, y), (line_end_x, y)],
            fill=line_color,
            width=line_width
        )
    
    # Bookmark ribbon (amber color)
    bookmark_width = int(12 * scale)
    bookmark_x = doc_x + doc_width - bookmark_width - int(5 * scale)
    bookmark_y = doc_y - int(5 * scale)
    bookmark_height = int(35 * scale)
    
    # Draw bookmark as a polygon
    bookmark_points = [
        (bookmark_x, bookmark_y),
        (bookmark_x + bookmark_width, bookmark_y),
        (bookmark_x + bookmark_width, bookmark_y + bookmark_height),
        (bookmark_x + bookmark_width // 2, bookmark_y + bookmark_height - int(5 * scale)),
        (bookmark_x, bookmark_y + bookmark_height)
    ]
    
    draw.polygon(
        bookmark_points,
        fill=(245, 158, 11, 255),  # Amber #F59E0B
        outline=None
    )
    
    return img

def generate_icons():
    """Generate all icon sizes"""
    sizes = [16, 48, 128]
    
    # Ensure icons directory exists
    os.makedirs('icons', exist_ok=True)
    
    print('Generating icons for Obsidian Read Later...\n')
    
    for size in sizes:
        img = draw_icon(size)
        filename = f'icons/icon{size}.png'
        img.save(filename, 'PNG')
        print(f'✓ Generated {filename} ({size}x{size})')
    
    print('\n✓ All icons generated successfully!')

if __name__ == '__main__':
    generate_icons()
