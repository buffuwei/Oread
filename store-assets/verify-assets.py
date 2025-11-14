#!/usr/bin/env python3
"""
Verify Chrome Web Store assets meet requirements
"""

import os
from PIL import Image

def check_image(filepath, expected_dimensions, max_size_mb=5):
    """Check if image meets requirements"""
    if not os.path.exists(filepath):
        return {
            'exists': False,
            'valid': False,
            'message': f'❌ File not found: {filepath}'
        }
    
    try:
        img = Image.open(filepath)
        width, height = img.size
        file_size_mb = os.path.getsize(filepath) / (1024 * 1024)
        
        issues = []
        
        # Check dimensions
        if isinstance(expected_dimensions, list):
            if (width, height) not in expected_dimensions:
                expected_str = ' or '.join([f'{w}x{h}' for w, h in expected_dimensions])
                issues.append(f'Incorrect dimensions: {width}x{height} (expected {expected_str})')
        else:
            expected_w, expected_h = expected_dimensions
            if width != expected_w or height != expected_h:
                issues.append(f'Incorrect dimensions: {width}x{height} (expected {expected_w}x{expected_h})')
        
        # Check file size
        if file_size_mb > max_size_mb:
            issues.append(f'File too large: {file_size_mb:.2f}MB (max {max_size_mb}MB)')
        
        # Check format
        if img.format != 'PNG':
            issues.append(f'Wrong format: {img.format} (expected PNG)')
        
        if issues:
            return {
                'exists': True,
                'valid': False,
                'message': f'⚠️  {filepath}\n    ' + '\n    '.join(issues)
            }
        else:
            return {
                'exists': True,
                'valid': True,
                'message': f'✓ {filepath} ({width}x{height}, {file_size_mb:.2f}MB)'
            }
    
    except Exception as e:
        return {
            'exists': True,
            'valid': False,
            'message': f'❌ Error reading {filepath}: {str(e)}'
        }

def main():
    print("=" * 60)
    print("Chrome Web Store Asset Verification")
    print("=" * 60)
    print()
    
    output_dir = 'output'
    
    # Define required assets
    assets = [
        {
            'name': 'Promotional Tile',
            'file': f'{output_dir}/promotional-tile-1280x800.png',
            'dimensions': (1280, 800)
        },
        {
            'name': 'Small Promotional Tile',
            'file': f'{output_dir}/small-promotional-tile-440x280.png',
            'dimensions': (440, 280)
        },
        {
            'name': 'Screenshot 1: Configuration',
            'file': f'{output_dir}/screenshot-1-config.png',
            'dimensions': [(1280, 800), (640, 400)]
        },
        {
            'name': 'Screenshot 2: Save Flow',
            'file': f'{output_dir}/screenshot-2-save-flow.png',
            'dimensions': [(1280, 800), (640, 400)]
        },
        {
            'name': 'Screenshot 3: Preview',
            'file': f'{output_dir}/screenshot-3-preview.png',
            'dimensions': [(1280, 800), (640, 400)]
        },
        {
            'name': 'Screenshot 4: LLM Support',
            'file': f'{output_dir}/screenshot-4-llm-support.png',
            'dimensions': [(1280, 800), (640, 400)]
        },
        {
            'name': 'Screenshot 5: Markdown',
            'file': f'{output_dir}/screenshot-5-markdown.png',
            'dimensions': [(1280, 800), (640, 400)]
        }
    ]
    
    results = []
    for asset in assets:
        print(f"Checking: {asset['name']}")
        result = check_image(asset['file'], asset['dimensions'])
        results.append(result)
        print(f"  {result['message']}")
        print()
    
    # Summary
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    
    total = len(results)
    valid = sum(1 for r in results if r['valid'])
    exists = sum(1 for r in results if r['exists'])
    missing = total - exists
    
    print(f"Total assets: {total}")
    print(f"Valid: {valid}")
    print(f"Issues: {exists - valid}")
    print(f"Missing: {missing}")
    print()
    
    if valid == total:
        print("✓ All assets are ready for Chrome Web Store upload!")
    else:
        print("⚠️  Some assets need attention before upload.")
        print()
        print("Next steps:")
        if missing > 0:
            print("1. Generate missing assets using generate-promo-images.py")
        if exists - valid > 0:
            print("2. Fix issues with existing assets")
        print("3. Replace screenshot templates with actual browser captures")
        print("4. Run this script again to verify")

if __name__ == '__main__':
    main()
