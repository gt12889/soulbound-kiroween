# Frequently Asked Questions (FAQ)

Common questions and answers about the Dark Productivity Suite.

## Table of Contents

1. [General Questions](#general-questions)
2. [Authentication & Accounts](#authentication--accounts)
3. [Cloud Sync](#cloud-sync)
4. [Data & Privacy](#data--privacy)
5. [Features](#features)
6. [Troubleshooting](#troubleshooting)
7. [Technical Questions](#technical-questions)

---

## General Questions

### What is the Dark Productivity Suite?

The Dark Productivity Suite is a web application that combines productivity tools with a haunting, mystical aesthetic. It includes note-taking, task management, AI writing assistance, and git-based tarot readings, all wrapped in a gothic, immersive interface.

### Is it free to use?

Yes! The Dark Productivity Suite is completely free and open-source under the MIT License. You can use it, modify it, and even deploy your own version.

### Do I need to create an account?

No, you can use the app without an account. However, creating an account enables:
- Cloud synchronization across devices
- Data backup and recovery
- Access from anywhere
- Theme and settings sync

### What browsers are supported?

The app works on all modern browsers:
- ✓ Chrome/Edge (recommended)
- ✓ Firefox
- ✓ Safari
- ✓ Opera
- ✗ Internet Explorer (not supported)

### Is there a mobile app?

Not yet, but the web app is mobile-responsive. Native iOS and Android apps are planned for future releases.

### Can I use it offline?

Yes! The app works fully offline. If you're signed in, changes will sync when you reconnect to the internet.

---

## Authentication & Accounts

### How do I create an account?

1. Click "Sign Up" on the landing page
2. Enter your email and create a password
3. Or use "Sign in with Google/GitHub"
4. Accept the terms of service
5. Start using the app

### What are the password requirements?

Passwords must have:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

We recommend 12+ characters with special characters for better security.

### I forgot my password. What do I do?

1. Click "Forgot Password?" on the login page
2. Enter your email address
3. Check your email for a verification code
4. Enter the code in the app
5. Create a new password

### Can I change my email address?

Yes, in Settings → Account → Email. You'll need to verify the new email address.

### How do I delete my account?

1. Go to Settings → Account
2. Scroll to "Danger Zone"
3. Click "Delete Account"
4. Enter your password to confirm
5. Type "DELETE" to confirm
6. Click "Permanently Delete Account"

**Warning**: This action cannot be undone. Export your data first!

### Can I use multiple accounts?

Yes, but you'll need to sign out and sign in with different credentials. Each account has separate data.

---

## Cloud Sync

### How does cloud sync work?

When you're signed in:
1. Changes save locally first (instant)
2. Changes sync to cloud within 5 seconds
3. Other devices receive updates in real-time
4. Offline changes queue and sync when reconnected

### What data syncs to the cloud?

Everything syncs:
- ✓ Notes (including markdown)
- ✓ Tasks (including archived)
- ✓ Tags
- ✓ Tarot readings
- ✓ Pomodoro sessions
- ✓ Settings (theme, shortcuts, audio)

### Is my data encrypted?

Yes! All data is encrypted:
- End-to-end encryption before upload
- Secure transmission over HTTPS
- Only you can decrypt your data
- Cloud provider cannot read your content

### How do I disable cloud sync?

You can't disable sync while signed in, but you can:
- Use the app without signing in (local only)
- Sign out to stop syncing
- Export data and use locally

### What happens if I have conflicts?

If the same item is edited on multiple devices:
- **Automatic**: Last-write-wins (most recent change)
- **Manual**: System prompts you to choose
- You can view both versions and decide

### Can I sync between different accounts?

No, each account has separate data. To transfer data:
1. Export from source account
2. Sign in to target account
3. Import the exported data

---

## Data & Privacy

### Where is my data stored?

**Without Account:**
- Locally in your browser (LocalStorage)
- Never leaves your device

**With Account:**
- Locally in your browser (instant access)
- Encrypted in Firebase cloud (backup/sync)

### Who can see my data?

Only you! Your data is:
- Encrypted before cloud storage
- Private to your account
- Not accessible by us or Firebase
- Not sold or shared with anyone

### What data do you collect?

**We Collect:**
- Email address (for account)
- Anonymous usage statistics
- Error reports (for debugging)

**We Don't Collect:**
- Note/task content (encrypted)
- Personal information beyond profile
- Browsing history
- Data from other services

### Can I export my data?

Yes! You can export all your data anytime:
1. Settings → Data Management → Export
2. Choose format (JSON, Markdown, CSV)
3. Select what to export
4. Download the file

See [IMPORT_EXPORT_GUIDE.md](./IMPORT_EXPORT_GUIDE.md) for details.

### How do I backup my data?

**Automatic**: Enable cloud sync (data backed up automatically)

**Manual**:
1. Export data regularly (weekly recommended)
2. Store exports in multiple locations
3. Keep multiple versions
4. Test restoration periodically

### Can I delete my data?

Yes:
- **Delete Account**: Removes all cloud data
- **Clear Local**: Clear browser storage
- **Selective**: Delete individual notes/tasks

### Is my data GDPR compliant?

Yes, we follow GDPR principles:
- You control your data
- Right to access (export)
- Right to deletion (account deletion)
- Data portability (export formats)
- Transparent data usage

---

## Features

### How do I use keyboard shortcuts?

Press `Ctrl+?` to see all shortcuts. You can customize any shortcut in Settings → Keyboard Shortcuts.

See [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) for complete reference.

### How do I change themes?

1. Click settings icon
2. Go to Appearance tab
3. Click a theme to apply it
4. Or use theme selector in navigation

See [THEME_GUIDE.md](./THEME_GUIDE.md) for details.

### What is Quick Capture?

Quick Capture lets you create notes or tasks instantly:
- Press `Ctrl+K` from anywhere
- Type your content
- Select note or task
- Press Enter to save

### How do I use markdown in notes?

1. Create or open a note
2. Click "Markdown" button or press `Ctrl+M`
3. Write using markdown syntax
4. See live preview in split view

See [FEATURES.md](./FEATURES.md#markdown-support) for syntax guide.

### How does the Pomodoro timer work?

1. Click hourglass icon in Graveyard Dashboard
2. Configure work/break durations (optional)
3. Click "Start"
4. Work until timer completes
5. Take break when prompted
6. Repeat!

### What is Terminal Tarot?

Terminal Tarot analyzes your git commit history and generates tarot readings based on your coding patterns. It's a creative way to reflect on your development habits.

### How does Ghost Writer work?

Ghost Writer provides AI-powered writing suggestions:
- Type in the editor
- Suggestions appear automatically
- Hover to see better
- Click to accept
- Keep typing to dismiss

### Can I organize notes with tags?

Yes! Add tags to notes and tasks:
- Click tag icon or press `Ctrl+Shift+T`
- Type tag name and press Enter
- Click tags to filter
- Use tag cloud for overview

### What is the Archive system?

Archive stores completed tasks:
- Right-click task → Archive
- Or auto-archive after 30 days
- View in Archive View
- Restore or permanently delete

---

## Troubleshooting

### The app won't load

**Try:**
1. Refresh the page (Ctrl+R)
2. Clear browser cache
3. Try incognito/private mode
4. Try different browser
5. Check internet connection

### I can't sign in

**Check:**
1. Email spelling
2. Password (case-sensitive)
3. Caps Lock key
4. Internet connection
5. Browser cookies enabled

**Try:**
1. Password reset
2. Different browser
3. Clear browser cache
4. Disable browser extensions

### My data isn't syncing

**Check:**
1. Signed in status
2. Internet connection
3. Sync status indicator
4. Browser console for errors

**Try:**
1. Manual sync (click sync icon)
2. Sign out and sign in
3. Check Firebase status
4. Clear browser cache

### Keyboard shortcuts don't work

**Check:**
1. Correct element has focus
2. No browser extension conflicts
3. Shortcuts panel for conflicts
4. Platform (Ctrl vs Cmd)

**Try:**
1. Click in the module first
2. Disable browser extensions
3. Reset shortcuts to default
4. Try different browser

### Audio isn't playing

**Check:**
1. Audio enabled in settings
2. Volume not at 0%
3. Browser audio permissions
4. System volume

**Try:**
1. Click anywhere (browser autoplay policy)
2. Check browser permissions
3. Try different browser
4. Restart browser

### Export/Import fails

**Check:**
1. File format correct
2. File not corrupted
3. Sufficient disk space
4. Browser permissions

**Try:**
1. Smaller date range
2. Different format
3. Validate file structure
4. Try different browser

### Theme won't change

**Check:**
1. Settings saved
2. Browser cache
3. JavaScript enabled
4. CSS loaded

**Try:**
1. Refresh page
2. Clear browser cache
3. Reset to default theme
4. Try different browser

---

## Technical Questions

### What technologies are used?

**Frontend:**
- React 19.2
- TypeScript 5.9
- Vite 6.0
- React Router 7.9
- CSS Modules

**Backend:**
- Firebase Authentication
- Firebase Firestore
- Firebase Storage

**Other:**
- isomorphic-git (git operations)
- Web Audio API (sounds)
- LocalStorage API (local data)

### Can I self-host it?

Yes! The app is open-source:
1. Clone the repository
2. Install dependencies (`npm install`)
3. Configure Firebase (optional)
4. Build (`npm run build`)
5. Deploy to your server

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

### Can I contribute?

Yes! We welcome contributions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (`npm test`)
5. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Is there an API?

Not yet, but it's planned for future releases. This would allow:
- Third-party integrations
- Browser extensions
- Mobile apps
- Automation tools

### Can I customize the code?

Yes! It's open-source under MIT License:
- Modify for personal use
- Create custom features
- Deploy your own version
- Share modifications (optional)

### How do I report bugs?

1. Check if it's a known issue
2. Try to reproduce it
3. Open a GitHub issue
4. Include:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if relevant

### How do I request features?

1. Check if it's already requested
2. Open a GitHub discussion
3. Describe the feature
4. Explain the use case
5. Discuss with community

### Where can I get help?

**Documentation:**
- [README.md](./README.md)
- [FEATURES.md](./FEATURES.md)
- [FAQ.md](./FAQ.md) (this file)

**Community:**
- GitHub Issues (bugs)
- GitHub Discussions (questions)
- Discord (coming soon)

**Contact:**
- Email: support@darkproductivity.app
- Response time: 24-48 hours

---

## Still Have Questions?

If your question isn't answered here:

1. **Check Documentation**: Browse other docs in the repository
2. **Search Issues**: Someone may have asked before
3. **Ask Community**: Open a GitHub discussion
4. **Contact Support**: Email support@darkproductivity.app

---

**May your questions be answered and your productivity mystical.** ❓🌙
