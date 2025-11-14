# Chrome Web Store Upload Checklist

Use this checklist when uploading the extension to the Chrome Web Store.

## Pre-Upload Preparation

### Code & Build
- [ ] Extension is fully tested and working
- [ ] Version number updated in `manifest.json`
- [ ] All console.log statements removed or disabled
- [ ] Production build created (if applicable)
- [ ] Extension packaged as .zip file

### Assets Ready
- [ ] Promotional tile (1280x800) - `output/promotional-tile-1280x800.png`
- [ ] Small promotional tile (440x280) - `output/small-promotional-tile-440x280.png`
- [ ] Screenshot 1: Configuration interface
- [ ] Screenshot 2: Save flow demonstration
- [ ] Screenshot 3: Preview feature
- [ ] Screenshot 4: LLM support options
- [ ] Screenshot 5: Generated Markdown in Obsidian
- [ ] All images verified with `verify-assets.py`

### Documentation
- [ ] README.md is complete and up-to-date
- [ ] CONFIGURATION.md exists with setup instructions
- [ ] Privacy policy prepared
- [ ] Support email/website configured

## Chrome Web Store Developer Dashboard

### Account Setup
- [ ] Chrome Web Store developer account created ($5 one-time fee)
- [ ] Payment information verified
- [ ] Developer account verified

### Store Listing - Basic Info
- [ ] Extension name: **Obsidian Read Later**
- [ ] Short description (132 chars max) - see STORE_LISTING.md
- [ ] Detailed description - see STORE_LISTING.md
- [ ] Category: **Productivity**
- [ ] Language: **English**

### Store Listing - Graphics
- [ ] Icon 128x128 (from `icons/icon128.png`)
- [ ] Small promotional tile (440x280)
- [ ] Promotional tile (1280x800) - optional but recommended
- [ ] Screenshot 1 uploaded with caption
- [ ] Screenshot 2 uploaded with caption
- [ ] Screenshot 3 uploaded with caption
- [ ] Screenshot 4 uploaded with caption
- [ ] Screenshot 5 uploaded with caption
- [ ] Screenshots arranged in correct order

### Store Listing - Additional Fields
- [ ] Official URL (website or GitHub repo)
- [ ] Support email address
- [ ] Privacy policy URL or text

### Distribution
- [ ] Visibility: **Public** (or Unlisted for testing)
- [ ] Regions: **All regions** (or specific countries)
- [ ] Pricing: **Free**

### Privacy Practices
- [ ] Declare that extension does NOT collect user data
- [ ] Explain data sent to third-party LLM APIs
- [ ] Mention local LLM option for privacy
- [ ] List all permissions and their purposes:
  - [ ] activeTab - Read webpage content
  - [ ] storage - Save configuration
  - [ ] scripting - Inject content extraction
  - [ ] sidePanel - Show preview interface
  - [ ] downloads - Save files to vault

### Package Upload
- [ ] .zip file uploaded (max 100MB)
- [ ] Manifest V3 verified
- [ ] No errors in automated review
- [ ] All warnings addressed or documented

### Single Purpose
- [ ] Single purpose description: "Save web articles to Obsidian with AI-generated summaries"
- [ ] Justification for permissions provided
- [ ] No unrelated functionality included

## Post-Upload

### Review Process
- [ ] Submitted for review
- [ ] Review status checked (typically 1-3 days)
- [ ] Any review feedback addressed

### After Approval
- [ ] Extension is live on Chrome Web Store
- [ ] Store listing URL saved
- [ ] Link added to README.md
- [ ] Announcement prepared (social media, blog, etc.)

### Monitoring
- [ ] Check user reviews regularly
- [ ] Monitor crash reports
- [ ] Track installation statistics
- [ ] Respond to user feedback

## Common Review Issues to Avoid

### Permission Justification
- [ ] Each permission has clear justification in description
- [ ] No unnecessary permissions requested
- [ ] Host permissions explained (`<all_urls>` for content extraction)

### Privacy Policy
- [ ] Privacy policy is clear and complete
- [ ] Explains what data is accessed
- [ ] Explains what happens to user data
- [ ] Mentions third-party services (LLM APIs)

### Functionality
- [ ] Extension works as described
- [ ] No broken features
- [ ] No misleading claims
- [ ] Screenshots accurately represent functionality

### Content Policy
- [ ] No prohibited content
- [ ] No trademark violations
- [ ] No misleading metadata
- [ ] Appropriate content rating

## Helpful Links

- Chrome Web Store Developer Dashboard: https://chrome.google.com/webstore/devconsole
- Developer Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Branding Guidelines: https://developer.chrome.com/docs/webstore/branding/
- Review Process: https://developer.chrome.com/docs/webstore/review-process/

## Notes

- First review typically takes 1-3 business days
- Updates to published extensions are usually faster (few hours to 1 day)
- Keep the .zip file for future updates
- Version numbers must increment with each update
- Major changes may trigger additional review

## Emergency Contacts

If your extension is rejected:
1. Read the rejection reason carefully
2. Address all issues mentioned
3. Update and resubmit
4. If unclear, use the Chrome Web Store support forum

---

**Good luck with your submission! 🚀**
