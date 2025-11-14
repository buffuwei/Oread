# Quick Start Guide - Chrome Web Store Publishing

This guide will help you quickly prepare and submit the Obsidian Read Later extension to the Chrome Web Store.

## 📁 What's Been Created

### Generated Assets (in `/output` directory)
✅ All 7 required images have been generated:
- `promotional-tile-1280x800.png` - Main promotional image
- `small-promotional-tile-440x280.png` - Small promotional image  
- `screenshot-1-config.png` - Configuration interface template
- `screenshot-2-save-flow.png` - Save flow template
- `screenshot-3-preview.png` - Preview feature template
- `screenshot-4-llm-support.png` - LLM support template
- `screenshot-5-markdown.png` - Markdown output template

### Documentation (in `/store-assets` directory)
- `README.md` - Overview of assets and guidelines
- `STORE_LISTING.md` - Complete store listing text (descriptions, privacy policy, etc.)
- `UPLOAD_CHECKLIST.md` - Step-by-step upload checklist
- `screenshot-guide.html` - Interactive guide for capturing real screenshots
- `QUICK_START.md` - This file

### Scripts (in `/store-assets` directory)
- `generate-promo-images.py` - Generate promotional images
- `verify-assets.py` - Verify all assets meet requirements
- `package-for-store.sh` - Package extension for upload

## 🚀 Quick Publishing Steps

### Step 1: Replace Screenshot Templates (IMPORTANT!)

The generated screenshots are **templates only**. You need to replace them with actual browser screenshots:

1. Open `store-assets/screenshot-guide.html` in your browser
2. Follow the instructions for each screenshot
3. Capture real screenshots of the extension UI
4. Save them to the `/output` directory (replacing the templates)

**Required screenshots:**
- Configuration interface with settings filled in
- Save button clicked showing status
- Side panel with preview content
- Custom endpoint configuration for local LLM
- Obsidian showing generated Markdown file

### Step 2: Verify Assets

```bash
python3 store-assets/verify-assets.py
```

This checks that all images meet Chrome Web Store requirements.

### Step 3: Package Extension

```bash
./store-assets/package-for-store.sh
```

This creates a clean .zip file in `store-assets/packages/` ready for upload.

### Step 4: Upload to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item" and upload the .zip package
3. Fill in the store listing using text from `STORE_LISTING.md`
4. Upload images from `/output` directory
5. Submit for review

Use `UPLOAD_CHECKLIST.md` for detailed step-by-step instructions.

## 📋 Pre-Upload Checklist

Quick checklist before submitting:

- [ ] All 5 screenshots replaced with real browser captures
- [ ] Assets verified with `verify-assets.py`
- [ ] Extension packaged with `package-for-store.sh`
- [ ] Chrome Web Store developer account created ($5 fee)
- [ ] Privacy policy reviewed and ready
- [ ] Support email configured

## 🎨 Customizing Promotional Images

If you want to customize the promotional tiles:

1. Edit `store-assets/generate-promo-images.py`
2. Modify colors, text, or layout
3. Run: `python3 store-assets/generate-promo-images.py`
4. New images will be generated in `/output`

**Current design:**
- Color scheme: Purple (#7c3aed) matching Obsidian
- Dark background (#1a1a2e)
- Clean, modern typography
- Feature highlights with checkmarks

## 📝 Store Listing Text

All required text is in `STORE_LISTING.md`:
- Extension name
- Short description (132 chars)
- Detailed description
- Privacy policy
- Screenshot captions
- Keywords/tags

Just copy and paste from that file when filling out the store listing.

## ⚠️ Important Notes

### Screenshots Are Templates
The generated screenshots are **placeholders**. Chrome Web Store reviewers will reject templates. You **must** replace them with actual screenshots of the working extension.

### Privacy Policy Required
Chrome Web Store requires a privacy policy. We've provided one in `STORE_LISTING.md` that explains:
- No data collection by the extension
- Data sent to third-party LLM APIs
- Local LLM option for privacy

### Permission Justification
Be prepared to explain why each permission is needed:
- `activeTab` - Read webpage content for extraction
- `storage` - Save user configuration
- `scripting` - Inject content extraction script
- `sidePanel` - Show preview interface
- `downloads` - Save files to Obsidian vault

### Review Time
- First submission: 1-3 business days
- Updates: Few hours to 1 day
- Be patient and responsive to reviewer feedback

## 🆘 Troubleshooting

### "Images don't meet requirements"
Run `python3 store-assets/verify-assets.py` to check dimensions and file sizes.

### "Screenshots look like templates"
Replace the generated templates with actual browser screenshots. See `screenshot-guide.html`.

### "Permission justification unclear"
Add detailed explanations in the store listing description. See `STORE_LISTING.md` for examples.

### "Privacy policy missing"
Copy the privacy policy from `STORE_LISTING.md` into the store listing form.

## 📞 Need Help?

- Review the detailed `UPLOAD_CHECKLIST.md`
- Check Chrome Web Store [Developer Documentation](https://developer.chrome.com/docs/webstore/)
- Visit the [Chrome Web Store Community Forum](https://groups.google.com/a/chromium.org/g/chromium-extensions)

## 🎉 After Approval

Once approved:
1. Share the Chrome Web Store link
2. Update README.md with installation instructions
3. Announce on social media
4. Monitor user reviews and feedback
5. Plan for future updates

---

**Ready to publish? Start with Step 1 above! 🚀**
