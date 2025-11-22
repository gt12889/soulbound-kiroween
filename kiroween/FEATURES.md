# Kiroween - Complete Feature Guide

This document provides comprehensive documentation for all features in Kiroween.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Cloud Sync](#cloud-sync)
3. [Keyboard Shortcuts](#keyboard-shortcuts)
4. [Theme System](#theme-system)
5. [Quick Capture](#quick-capture)
6. [Tag Management](#tag-management)
7. [Archive System](#archive-system)
8. [Pomodoro Timer](#pomodoro-timer)
9. [Markdown Support](#markdown-support)
10. [Import/Export System](#importexport-system)
11. [Terminal Tarot](#terminal-tarot)
12. [Ghost Writer](#ghost-writer)
13. [Necronomicon Notes](#necronomicon-notes)
14. [Graveyard Dashboard](#graveyard-dashboard)
15. [Audio System](#audio-system)

---

## Authentication System

The Dark Productivity Suite includes a secure authentication system that protects your data and enables cloud synchronization across devices.

### Features

- **Email/Password Authentication**: Create an account with email and password
- **Social Authentication**: Sign in with Google or GitHub
- **Password Reset**: Recover your account via email verification
- **Session Management**: Secure 30-day sessions with automatic renewal
- **Protected Routes**: Authenticated-only access to your data

### Getting Started

#### Registration

1. Click "Sign Up" on the landing page
2. Enter your email and create a password
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
3. Accept the terms of service
4. Click "Create Account"

The password strength indicator (styled as a mystical meter) shows your password security level.

#### Login

1. Click "Sign In" on the landing page
2. Enter your email and password
3. Click "Sign In"

Or use social authentication:
- Click "Sign in with Google"
- Click "Sign in with GitHub"

#### Password Reset

1. Click "Forgot Password?" on the login page
2. Enter your email address
3. Check your email for a verification code
4. Enter the code (styled as rune entry)
5. Create a new password
6. Click "Reset Password"

### Security Features

- **Password Hashing**: All passwords are securely hashed
- **Session Tokens**: Secure tokens with automatic expiration
- **HTTPS Only**: All authentication happens over secure connections
- **Rate Limiting**: Protection against brute force attacks

### Session Management

- Sessions last 30 days by default
- Automatic session renewal on activity
- Manual logout invalidates session immediately
- Expired sessions redirect to login page

---

## Keyboard Shortcuts

Navigate and control the application efficiently with comprehensive keyboard shortcuts.

### Default Shortcuts

#### Navigation
- `Ctrl+1` - Terminal Tarot module
- `Ctrl+2` - Ghost Writer module
- `Ctrl+3` - Necronomicon Notes module
- `Ctrl+4` - Graveyard Dashboard module
- `Ctrl+H` - Home/Landing page

#### Actions
- `Ctrl+N` - Create new note
- `Ctrl+T` - Create new task
- `Ctrl+K` - Quick capture (note or task)
- `Ctrl+F` - Search in current module
- `Ctrl+S` - Save current work
- `Ctrl+E` - Export data

#### Help
- `Ctrl+?` or `Ctrl+/` - Show keyboard shortcuts panel

### Customization

1. Press `Ctrl+?` to open the shortcuts panel
2. Click on any shortcut to customize it
3. Press your desired key combination
4. Click "Save" to apply changes

**Conflict Detection**: The system prevents duplicate shortcuts and warns you of conflicts.

### Shortcuts Panel

The keyboard shortcuts panel displays:
- All available shortcuts organized by category
- Visual key combination representations
- Customization interface for editable shortcuts
- Gothic-styled modal with mystical aesthetics

### Tips

- Shortcuts work globally across all modules
- Custom shortcuts are saved to your profile
- Shortcuts sync across devices with cloud sync enabled
- Press `Escape` to close any modal or dialog

---

## Theme System

Customize the visual atmosphere with multiple dark themes.

### Available Themes

#### Default Dark
The original gothic aesthetic with purple accents.

**Colors:**
- Background: Deep blacks (#0a0a0a, #1a1a1a)
- Accents: Dark purples (#2d1b4e, #4a2d6e)
- Text: Off-whites and grays (#e0e0e0, #b0b0b0)
- Highlights: Ethereal blues and greens (#3d5a80, #2d4a3e)

#### Blood Moon
Crimson and blood red tones for an intense atmosphere.

**Colors:**
- Background: Deep blacks with red tint (#0a0505, #1a0a0a)
- Accents: Crimson and blood red (#4a0000, #6e1a1a)
- Text: Pale reds and grays (#e0c0c0, #b08080)
- Highlights: Dark oranges and reds (#803d3d, #4a2d2d)

#### Midnight Forest
Dark greens and earth tones for a natural mystical feel.

**Colors:**
- Background: Deep blacks with green tint (#050a05, #0a1a0a)
- Accents: Dark greens and teals (#1a4a2d, #2d6e4a)
- Text: Pale greens and grays (#c0e0c0, #80b080)
- Highlights: Forest greens and blues (#2d4a3d, #3d5a4a)

### Changing Themes

1. Click the settings icon in the navigation
2. Select the "Appearance" tab
3. Click on a theme preview to select it
4. The theme applies instantly with smooth transitions

### Theme Features

- **Real-time Preview**: Hover over themes to preview colors
- **Smooth Transitions**: 500ms fade between themes
- **Persistent Selection**: Theme choice saved to your profile
- **Cloud Sync**: Theme syncs across devices
- **Consistent Application**: All modules use the selected theme

### Technical Details

Themes use CSS custom properties (variables) for dynamic color application:

```css
--bg-primary: #0a0a0a;
--bg-secondary: #1a1a1a;
--text-primary: #e0e0e0;
--accent-primary: #2d1b4e;
/* ... and more */
```

---

## Import/Export System

Migrate data, create backups, and share your productivity data.

### Export Features

#### Export Formats

1. **JSON** - Complete data with full structure
2. **Markdown** - Human-readable notes and tasks
3. **CSV** - Spreadsheet-compatible format

#### Export Options

- **Date Range Filtering**: Export data from specific time periods
- **Selective Export**: Choose which data types to include
  - Notes
  - Tasks
  - Tarot readings
  - Pomodoro sessions
  - Settings
- **Encryption**: Optional password protection for sensitive data

#### How to Export

1. Click settings icon → "Data Management" tab
2. Click "Export Data"
3. Select export format (JSON/Markdown/CSV)
4. Choose date range (optional)
5. Select data types to include
6. Enable encryption (optional)
7. Click "Download"

The file downloads with a timestamp: `dark-productivity-export-2025-11-14.json`

### Import Features

#### Supported Formats

1. **JSON** - Full data import from previous exports
2. **Plain Text** - Converts to notes automatically
3. **Markdown** - Preserves formatting

#### Import Options

- **Merge Strategy**: Choose how to handle existing data
  - **Merge**: Combine with existing data (no duplicates)
  - **Replace**: Clear existing data and import fresh
- **Data Preview**: Review data before importing
- **Validation**: Automatic format checking
- **Duplicate Detection**: Prevents duplicate entries

#### How to Import

1. Click settings icon → "Data Management" tab
2. Click "Import Data"
3. Drag and drop file or click to browse
4. Review the data preview
5. Select merge strategy
6. Click "Import"

#### Import Validation

The system validates:
- File format correctness
- Data structure integrity
- Required fields presence
- Data type compatibility

**Error Handling**: Clear error messages for invalid data with suggestions for fixes.

### Backup Best Practices

1. **Regular Exports**: Export weekly or monthly
2. **Multiple Formats**: Keep JSON for full backup, Markdown for readability
3. **Secure Storage**: Store encrypted exports for sensitive data
4. **Version Control**: Include timestamps in filenames
5. **Test Imports**: Verify backups by importing to a test account

---

## Tag Management

Organize and categorize your notes and tasks with a flexible tagging system.

### Features

- **Multi-tag Support**: Add multiple tags to any note or task
- **Autocomplete**: Suggestions based on existing tags
- **Tag Cloud**: Visual representation of all tags with usage counts
- **Advanced Filtering**: Filter by single or multiple tags
- **Mystical Styling**: Tags displayed with gothic symbols

### Adding Tags

#### To Notes
1. Open a note in Necronomicon Notes
2. Click the tag icon or press `Ctrl+Shift+T`
3. Type tag name and press Enter
4. Repeat for multiple tags

#### To Tasks
1. Click on a tombstone in Graveyard Dashboard
2. Click "Add Tag" in the task details
3. Type tag name and press Enter
4. Repeat for multiple tags

### Tag Autocomplete

As you type, the system suggests:
- Previously used tags
- Similar tags based on content
- Popular tags in your collection

Press `Tab` or click to accept a suggestion.

### Tag Cloud

The tag cloud displays all your tags with:
- **Size**: Larger text for frequently used tags
- **Color**: Category-based color coding
- **Count**: Number of items with each tag
- **Click**: Filter by tag instantly

Access the tag cloud:
- In Notes: Click "Tags" button in sidebar
- In Tasks: Click "Filter by Tags" in toolbar

### Filtering by Tags

#### Single Tag Filter
Click any tag in the tag cloud or on an item to filter by that tag.

#### Multiple Tag Filter
1. Click "Advanced Filter"
2. Select multiple tags
3. Choose filter mode:
   - **AND**: Show items with ALL selected tags
   - **OR**: Show items with ANY selected tag
4. Click "Apply Filter"

#### Clear Filters
Click "Clear Filters" or press `Escape` to show all items.

### Tag Management

#### Rename Tags
1. Right-click a tag in the tag cloud
2. Select "Rename"
3. Enter new name
4. All items update automatically

#### Delete Tags
1. Right-click a tag in the tag cloud
2. Select "Delete"
3. Confirm deletion
4. Tag removed from all items

#### Merge Tags
1. Right-click a tag
2. Select "Merge with..."
3. Choose target tag
4. All items update to use target tag

### Tag Best Practices

- **Consistent Naming**: Use lowercase for consistency
- **Specific Tags**: "project-alpha" instead of "project"
- **Category Tags**: Use prefixes like "work:", "personal:"
- **Limit Tags**: 3-5 tags per item for best organization
- **Review Regularly**: Clean up unused tags monthly

---

## Archive System

Keep your workspace clean while preserving completed task history.

### Features

- **Automatic Suggestions**: Archive tasks completed >30 days ago
- **Visual Distinction**: Weathered, moss-covered tombstones
- **Restore Capability**: Bring archived tasks back to active view
- **Permanent Deletion**: Remove tasks completely when ready
- **Search & Filter**: Find archived tasks easily

### Archiving Tasks

#### Manual Archive
1. Right-click a completed tombstone
2. Select "Archive"
3. Watch the deeper sink animation (1.5-2.0s)

#### Auto-Archive Suggestions
When tasks have been completed for 30+ days:
1. A notification appears with suggestions
2. Review the suggested tasks
3. Click "Archive All" or select individual tasks
4. Click "Dismiss" to ignore suggestions

### Archive View

Access archived tasks:
1. Click "Archive" button in Graveyard Dashboard
2. Or press `Ctrl+Shift+A`

The archive view shows:
- All archived tasks as weathered tombstones
- Moss-covered and aged appearance
- Archive date and original completion date
- Search and filter capabilities

### Restoring Tasks

1. Open Archive View
2. Click on an archived tombstone
3. Click "Restore"
4. Watch the rise animation
5. Task returns to active Graveyard

### Permanent Deletion

**Warning**: This action cannot be undone!

1. Open Archive View
2. Right-click an archived tombstone
3. Select "Delete Permanently"
4. Confirm deletion
5. Task is removed completely

### Archive Statistics

View archive insights:
- Total archived tasks
- Archive by month/year
- Most archived tags
- Completion patterns

Access via: Archive View → "Statistics" button

### Archive Best Practices

- **Regular Review**: Check archive monthly
- **Selective Archiving**: Keep recent completions visible
- **Permanent Deletion**: Only delete tasks you'll never reference
- **Export Before Deleting**: Create backup before permanent deletion

---

## Pomodoro Timer

Focus on tasks with the mystical hourglass timer using the Pomodoro Technique.

### Features

- **Hourglass Visualization**: Flowing souls/sand animation
- **Configurable Intervals**: Customize work and break durations
- **Audio Notifications**: Mystical chime on completion
- **Session Tracking**: History and statistics
- **Persistent State**: Timer survives page refreshes

### Using the Timer

#### Starting a Session

1. Click the hourglass icon in Graveyard Dashboard
2. Configure durations (optional):
   - Work interval: 15-60 minutes (default: 25)
   - Break interval: 5-20 minutes (default: 5)
3. Click "Start"
4. Watch the souls flow through the hourglass

#### During a Session

- **Pause**: Click "Pause" to temporarily stop
- **Resume**: Click "Resume" to continue
- **Reset**: Click "Reset" to start over
- **Background Work**: Timer continues if you switch modules

#### Session Completion

When a work interval completes:
1. Mystical chime plays
2. Notification appears
3. Break timer starts automatically
4. Session logged to history

### Timer Controls

- **Start/Pause/Resume**: Control timer state
- **Reset**: Return to initial state
- **Skip**: Skip to next interval
- **Configure**: Adjust durations mid-session

### Session Statistics

View your productivity metrics:
- **Total Sessions**: Completed pomodoros
- **Total Time**: Focused work time
- **Today's Sessions**: Current day progress
- **Weekly Average**: Sessions per day
- **Longest Streak**: Consecutive days with sessions

Access via: Pomodoro Timer → "Statistics" button

### Pomodoro Technique

The traditional Pomodoro Technique:
1. **Work**: 25 minutes of focused work
2. **Short Break**: 5 minutes rest
3. **Repeat**: 4 work sessions
4. **Long Break**: 15-30 minutes rest

Customize to your preference!

### Tips for Effective Use

- **Eliminate Distractions**: Close unnecessary tabs
- **Single Task Focus**: Work on one task per session
- **Honor Breaks**: Rest during break intervals
- **Track Progress**: Review statistics weekly
- **Adjust Durations**: Find your optimal work interval

### Integration with Tasks

**Optional**: Link pomodoros to specific tasks
1. Start timer from a tombstone context menu
2. Session automatically associates with that task
3. View pomodoro count per task
4. Track time spent on each task

---

## Markdown Support

Write formatted notes with full markdown syntax support.

### Features

- **Live Preview**: Real-time rendering alongside raw text
- **Split View**: Edit and preview simultaneously
- **Syntax Highlighting**: Code blocks with language support
- **Gothic Styling**: Rendered markdown matches theme
- **Toolbar Shortcuts**: Quick formatting buttons

### Markdown Syntax

#### Headers
```markdown
# Header 1
## Header 2
### Header 3
```

#### Emphasis
```markdown
*italic* or _italic_
**bold** or __bold__
***bold italic***
~~strikethrough~~
```

#### Lists
```markdown
- Unordered item
- Another item
  - Nested item

1. Ordered item
2. Another item
   1. Nested item
```

#### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](image-url.jpg)
```

#### Code
```markdown
Inline `code` with backticks

```javascript
// Code block with syntax highlighting
function example() {
  return "Hello, darkness";
}
```
```

#### Blockquotes
```markdown
> This is a quote
> Multiple lines
```

#### Tables
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Editor Modes

#### Edit Mode
- Raw markdown text
- Syntax highlighting
- Keyboard shortcuts for formatting

#### Preview Mode
- Rendered markdown
- Gothic-styled output
- Read-only view

#### Split View (Default)
- Edit on left, preview on right
- Synchronized scrolling
- Best of both worlds

Switch modes: Click mode buttons in toolbar or press `Ctrl+M`

### Formatting Toolbar

Quick formatting buttons:
- **B** - Bold (`Ctrl+B`)
- **I** - Italic (`Ctrl+I`)
- **H** - Header (`Ctrl+H`)
- **"** - Quote (`Ctrl+Q`)
- **</>** - Code (`Ctrl+Shift+C`)
- **[]** - Link (`Ctrl+L`)
- **1.** - Ordered list
- **•** - Unordered list

### Keyboard Shortcuts

- `Ctrl+B` - Bold selection
- `Ctrl+I` - Italic selection
- `Ctrl+H` - Make header
- `Ctrl+K` - Insert link
- `Ctrl+Shift+C` - Code block
- `Ctrl+Q` - Blockquote
- `Tab` - Indent list item
- `Shift+Tab` - Outdent list item

### Search in Markdown

The search function works with markdown:
- Searches both raw and rendered text
- Highlights matches in preview
- Preserves markdown formatting in results

### Export Markdown

When exporting notes:
- **Markdown format**: Preserves raw markdown
- **JSON format**: Includes markdown flag
- **Import**: Markdown syntax preserved

### Tips

- **Preview Often**: Check rendering as you write
- **Use Headers**: Organize long notes with headers
- **Code Blocks**: Specify language for syntax highlighting
- **Tables**: Great for structured data
- **Links**: Reference external resources easily

---

## Cloud Sync

Synchronize your data across devices with secure cloud storage.

### Features

- **Real-time Sync**: Changes sync within 5 seconds
- **Offline Support**: Queue changes when offline
- **Conflict Resolution**: Handles simultaneous edits
- **End-to-end Encryption**: Your data stays private
- **Sync Status**: Visual indicators of sync state

### Setup

Cloud sync requires authentication:
1. Create an account or sign in
2. Cloud sync enables automatically
3. All data syncs to your account

### How It Works

#### Automatic Sync
- Changes save locally first (instant)
- Sync to cloud within 5 seconds
- Other devices receive updates in real-time

#### Offline Mode
- All features work offline
- Changes queue locally
- Sync when connection restored
- No data loss

### Sync Status Indicator

Located in the navigation bar:

**States:**
- **Green checkmark**: Synced (shows last sync time)
- **Blue spinner**: Syncing now
- **Yellow warning**: Pending changes (offline)
- **Red error**: Sync failed (click for details)

### Manual Sync

Force an immediate sync:
1. Click the sync status indicator
2. Select "Sync Now"
3. Wait for completion

### Conflict Resolution

When the same item is edited on multiple devices:

**Automatic (Last-Write-Wins)**:
- Most recent change wins
- Other changes discarded
- Works for most cases

**Manual Resolution**:
- For important conflicts
- System prompts you to choose
- View both versions
- Select which to keep or merge manually

### Sync Settings

Configure sync behavior:
1. Settings → "Cloud Sync" tab
2. Options:
   - Enable/disable automatic sync
   - Sync frequency (instant, 5s, 30s, 1m)
   - Conflict resolution strategy
   - Bandwidth usage (full, reduced)

### What Syncs

- ✓ Notes (including markdown)
- ✓ Tasks (including archived)
- ✓ Tags
- ✓ Tarot readings
- ✓ Pomodoro sessions
- ✓ Settings (theme, shortcuts, audio)
- ✗ Audio files (too large)
- ✗ Temporary UI state

### Security

- **Encryption**: All data encrypted before upload
- **Private Keys**: Only you can decrypt your data
- **Secure Transport**: HTTPS for all communication
- **No Plain Text**: Cloud never sees unencrypted data

### Troubleshooting

#### Sync Not Working
1. Check internet connection
2. Verify you're signed in
3. Check sync status indicator for errors
4. Try manual sync
5. Sign out and sign in again

#### Conflicts Appearing
- Edit same item on one device at a time
- Wait for sync before switching devices
- Use manual conflict resolution for important data

#### Slow Sync
- Check internet speed
- Reduce sync frequency in settings
- Enable "reduced bandwidth" mode
- Large datasets take longer initially

---

## Quick Capture

Rapidly capture thoughts without interrupting your workflow.

### Features

- **Global Shortcut**: Access from anywhere (`Ctrl+K`)
- **Type Selection**: Choose note or task
- **Auto-focus**: Start typing immediately
- **Minimal Interface**: No distractions
- **Quick Save**: Confirmation and close in <500ms

### Using Quick Capture

1. Press `Ctrl+K` anywhere in the app
2. Modal appears with input field focused
3. Type your content
4. Select type (note or task) with radio buttons
5. Press `Enter` or click "Save"
6. Brief confirmation animation
7. Modal closes automatically

### Keyboard Navigation

- `Ctrl+K` - Open quick capture
- `Tab` - Switch between type options
- `Enter` - Save and close
- `Escape` - Cancel and close

### Quick Capture for Notes

Creates a new note with:
- Title: First line of content
- Content: Full text entered
- Timestamp: Current date/time
- Tags: None (add later)
- Markdown: Disabled (enable later)

### Quick Capture for Tasks

Creates a new task with:
- Title: Content entered
- Priority: Medium (default)
- Status: Not completed
- Tags: None (add later)
- Due date: None (set later)

### Tips

- **Keep It Short**: Quick capture is for brief entries
- **Refine Later**: Add details, tags, formatting later
- **Muscle Memory**: `Ctrl+K` becomes second nature
- **Anywhere Access**: Works in all modules
- **No Context Switch**: Stay in your current work

### Customization

Change the quick capture shortcut:
1. Open keyboard shortcuts panel (`Ctrl+?`)
2. Find "Quick Capture"
3. Click to edit
4. Press your preferred key combination
5. Save changes

---

## Terminal Tarot

Divine insights from your git commit history with mystical tarot readings.

### Overview

Terminal Tarot analyzes your git repository's commit history from the past 30 days and generates personalized tarot readings based on your coding patterns. Each reading provides a three-card spread with interpretations that relate your development habits to traditional tarot meanings.

### Features

- **Git Repository Analysis**: Automatically reads local git history
- **30-Day Analysis Window**: Focuses on recent patterns
- **Three-Card Spreads**: Past, present, and future positions
- **ASCII Art Cards**: Terminal-styled tarot visualizations
- **Commit Statistics**: Frequency, timing, and sentiment analysis
- **Pattern Recognition**: Maps coding habits to tarot meanings
- **Reading History**: Save and review past readings

### How It Works

1. **Navigate to Terminal Tarot** (`Ctrl+1`)
2. **Click "Generate Reading"** or press `Ctrl+R`
3. **Repository Analysis**: System reads your git commits
4. **Pattern Detection**: Analyzes commit frequency, timing, messages
5. **Card Selection**: Algorithm maps patterns to tarot cards
6. **Reveal Cards**: Click or press `Space` to reveal each card
7. **Read Interpretation**: View personalized insights

### Understanding Your Reading

#### Card Positions

- **Past (Left)**: Reflects your recent coding history
- **Present (Center)**: Represents your current development state
- **Future (Right)**: Suggests upcoming patterns or focus areas

#### Commit Patterns Analyzed

- **Frequency**: How often you commit
- **Timing**: When you code (morning, night, weekends)
- **Message Sentiment**: Tone of commit messages
- **Consistency**: Regular vs. sporadic patterns
- **Intensity**: Burst coding vs. steady pace

#### Example Interpretations

**The Hermit (Past)**
- Pattern: Late-night commits, solo work
- Meaning: Deep focus and introspection
- Insight: You've been working independently on complex problems

**The Magician (Present)**
- Pattern: Diverse commits, multiple files
- Meaning: Creativity and skill application
- Insight: You're actively building and creating

**The Star (Future)**
- Pattern: Consistent, optimistic messages
- Meaning: Hope and inspiration
- Insight: Your steady progress will lead to breakthroughs

### Commit Statistics

Each reading includes detailed statistics:

- **Total Commits**: Number of commits in 30 days
- **Average Per Day**: Daily commit frequency
- **Most Active Hour**: Peak coding time
- **Sentiment Score**: Overall message tone (-1 to +1)
- **Top Keywords**: Most common words in messages
- **Busiest Days**: Days with most activity
- **Commit Streak**: Longest consecutive days

### Reading History

Access past readings:
1. Click "History" button
2. View all previous readings
3. Click any reading to view details
4. Compare patterns over time

### Tips for Better Readings

- **Regular Commits**: More data = better insights
- **Descriptive Messages**: Sentiment analysis works better
- **Consistent Patterns**: Establish coding routines
- **30-Day Window**: Wait for sufficient commit history
- **Multiple Readings**: Compare readings monthly

### Troubleshooting

**No Git Repository Detected**
- Ensure you're in a git repository
- Check git is initialized (`git status`)
- Use demo mode for testing

**Insufficient Commits**
- Need at least 5 commits for reading
- Expand analysis window in settings
- Use demo data to explore feature

**Reading Seems Inaccurate**
- Tarot is interpretive, not predictive
- Consider it as reflection, not fact
- Patterns may be subtle
- Try again after more commits

---

## Ghost Writer

AI-powered writing assistant with spectral suggestions that appear organically within your writing flow.

### Overview

Ghost Writer provides context-aware writing suggestions that fade in and out like spectral apparitions. The AI analyzes your current sentence or paragraph and offers relevant completions, helping you overcome writer's block and enhance your prose.

### Features

- **Context-Aware Suggestions**: Analyzes current writing context
- **NEW: Agent Hooks System**: Automated sentence completion as you type
- **Spectral Effects**: Fade-in/fade-out animations (0.5-1.0s)
- **Hover Interaction**: Opacity changes from 30% to 80%
- **Click to Accept**: Insert suggestions with one click (or Tab/Arrow Right)
- **Auto-Dismiss**: Fades after 3 seconds if not accepted
- **Sound Effects**: Subtle audio on appear/disappear
- **Debounced Requests**: Efficient API usage (300ms debounce)
- **Suggestion Cache**: Faster repeated suggestions (5-minute cache)
- **Style Matching**: AI adapts to your writing style and tone

### How It Works

1. **Navigate to Ghost Writer** (`Ctrl+2`)
2. **Start Writing**: Type in the editor
3. **AI Analysis**: System analyzes your context
4. **Suggestion Appears**: Ghost text fades in near cursor
5. **Hover to Enhance**: Opacity increases on hover
6. **Accept or Dismiss**: Click to accept, or keep typing to dismiss

### Using Ghost Writer

#### Basic Writing

- Type naturally in the editor
- Suggestions appear automatically after pauses
- Continue typing to dismiss suggestions
- Click suggestions to accept them

#### Manual Suggestions

- Press `Ctrl+Space` to request suggestion
- Useful when automatic suggestions don't appear
- Works at any cursor position

#### Accepting Suggestions

- **Click**: Click the ghost text
- **Tab**: Press Tab key
- **Arrow Right**: Press right arrow at end of line

#### Dismissing Suggestions

- **Keep Typing**: Suggestion fades automatically
- **Escape**: Manually dismiss
- **Wait 3 Seconds**: Auto-dismiss timeout

### Suggestion Quality

#### What Influences Suggestions

- **Context Length**: More context = better suggestions
- **Writing Style**: AI adapts to your style
- **Topic Consistency**: Stays on topic
- **Grammar**: Maintains grammatical correctness

#### Improving Suggestions

- **Write More**: Provide more context
- **Be Specific**: Clear writing gets clear suggestions
- **Edit Suggestions**: Accepted suggestions improve future ones
- **Feedback**: Rate suggestions (coming soon)

### Settings

Configure Ghost Writer behavior:

1. **Enable/Disable**: Toggle ghost writer on/off
2. **Suggestion Delay**: Adjust pause before suggestion (0.5-3s)
3. **Opacity Levels**: Customize fade opacity (10-50%)
4. **Auto-Dismiss Time**: Change timeout (1-10s)
5. **Sound Effects**: Enable/disable audio
6. **AI Model**: Choose suggestion model (if multiple available)

### Privacy & AI

- **Local Processing**: Context analyzed locally when possible
- **API Calls**: Only sent when generating suggestions
- **No Storage**: Suggestions not stored on servers
- **Your Content**: Remains private and encrypted
- **Opt-Out**: Disable ghost writer anytime

### Tips for Best Results

- **Write First**: Get ideas down, then use suggestions
- **Context Matters**: Provide 2-3 sentences of context
- **Accept Selectively**: Not all suggestions are perfect
- **Maintain Voice**: Edit suggestions to match your style
- **Use for Inspiration**: Treat as brainstorming partner

### Troubleshooting

**No Suggestions Appearing**
- Check ghost writer is enabled
- Verify internet connection (for API)
- Ensure sufficient context (2+ sentences)
- Try manual suggestion (`Ctrl+Space`)

**Suggestions Not Relevant**
- Provide more context
- Write more clearly
- Try different phrasing
- Adjust AI model in settings

**Suggestions Too Slow**
- Check internet speed
- Reduce suggestion delay
- Use cached suggestions
- Consider local AI model

---

## Necronomicon Notes

Ancient wisdom meets modern note-taking with an immersive book-styled interface.

### Overview

Necronomicon Notes transforms note-taking into a mystical experience with parchment-styled pages, dripping ink animations, and gothic fonts. Combined with powerful features like markdown support, tagging, and full-text search, it's both beautiful and functional.

### Features

- **Ancient Book Aesthetic**: Parchment pages with torn edges
- **Dripping Ink Animation**: Continuous border effects
- **Gothic Typography**: Medieval-style fonts
- **Page-Turn Animations**: 0.8-1.2s smooth transitions
- **Full-Text Search**: Find notes instantly
- **Markdown Support**: Rich text formatting
- **Tag Organization**: Categorize and filter notes
- **Split View Editor**: Edit and preview simultaneously
- **Auto-Save**: Changes saved within 1 second
- **Cloud Sync**: Access notes from any device

### Creating Notes

#### Quick Create
- Press `Ctrl+N` from anywhere
- Or click "New Note" button
- Or use Quick Capture (`Ctrl+K`)

#### Note Structure
- **Title**: First line or explicit title
- **Content**: Main note body
- **Tags**: Categorization labels
- **Metadata**: Created/updated timestamps

### Writing in Notes

#### Plain Text Mode
- Simple text editor
- Gothic font styling
- Parchment background
- Dripping ink borders

#### Markdown Mode
- Full markdown syntax support
- Live preview
- Split view editing
- Syntax highlighting

Toggle markdown: Click "Markdown" button or press `Ctrl+M`

### Organizing Notes

#### Tags
- Add multiple tags per note
- Click tag to filter notes
- Tag autocomplete suggestions
- Tag cloud visualization

#### Search
- Press `Ctrl+F` to search
- Searches titles and content
- Highlights matches with glow effect
- Real-time results

#### Sorting
- By creation date (newest/oldest)
- By update date (recently modified)
- By title (alphabetical)
- By tag

### Page Navigation

#### Notes List
- Sidebar shows all note titles
- Click to open note
- Shows creation dates
- Indicates markdown notes

#### Page Turning
- Click next/previous buttons
- Use `Alt+Up/Down` arrows
- Smooth page-turn animation
- Page-rustling sound effect

### Note Features

#### Auto-Save
- Saves automatically while typing
- 1-second delay after last keystroke
- Visual indicator when saving
- No manual save needed

#### Version History (Coming Soon)
- View previous versions
- Restore old versions
- Compare changes
- Undo major edits

#### Note Linking (Coming Soon)
- Link between notes
- Backlinks
- Knowledge graph
- Wiki-style navigation

### Tips for Effective Note-Taking

- **Descriptive Titles**: Make notes easy to find
- **Use Tags**: Organize by topic/project
- **Markdown for Structure**: Headers, lists, emphasis
- **Regular Review**: Read old notes periodically
- **Link Related Notes**: Create connections
- **Export Regularly**: Backup important notes

---

## Graveyard Dashboard

Task management with a dark twist where tasks rise and rest as tombstones.

### Overview

Graveyard Dashboard visualizes your tasks as tombstones in a mystical graveyard. Watch tasks rise from the ground when created and sink when completed. The moon phase calendar tracks time through lunar cycles, adding to the otherworldly atmosphere.

### Features

- **Tombstone Tasks**: Visual task representations
- **Rise/Sink Animations**: 1.0-1.5s on create/complete
- **Priority Sizing**: Larger tombstones for higher priority
- **Drag & Drop**: Reorder tasks intuitively
- **Ghostly Tooltips**: Hover for task details
- **Moon Phase Calendar**: Track dates through lunar cycles
- **Pomodoro Integration**: Focus timer for tasks
- **Archive System**: Store completed tasks
- **Tag Filtering**: Organize by category
- **Cloud Sync**: Access tasks from any device

### Creating Tasks

#### Quick Create
- Press `Ctrl+T` from anywhere
- Or click "New Task" button
- Or use Quick Capture (`Ctrl+K`)

#### Task Properties
- **Title**: Task description
- **Priority**: Low, Medium, High
- **Tags**: Categorization labels
- **Due Date**: Optional deadline
- **Notes**: Additional details

### Managing Tasks

#### Completing Tasks
- Click tombstone to mark complete
- Or press `Space` on selected task
- Watch sink animation
- Weathered texture applied

#### Editing Tasks
- Click tombstone to open details
- Edit any property
- Changes save automatically
- Visual update immediate

#### Deleting Tasks
- Right-click tombstone
- Select "Delete"
- Confirm deletion
- Or press `Delete` key

### Task Priority

#### Priority Levels
- **Low**: Small tombstone, gray color
- **Medium**: Normal size, standard color
- **High**: Large tombstone, prominent color

#### Setting Priority
- Click task details
- Select priority level
- Or use `Alt+1/2/3` shortcuts
- Tombstone resizes automatically

### Task Organization

#### Drag & Drop
- Click and hold tombstone
- Drag to new position
- Release to drop
- Order saved automatically

#### Tag Filtering
- Click tag to filter
- Multiple tag selection
- AND/OR filter modes
- Clear filters anytime

#### Search
- Press `Ctrl+F`
- Search titles and notes
- Real-time results
- Highlight matches

### Moon Phase Calendar

#### Features
- Accurate lunar phase calculations
- Visual moon icons for each day
- Event indicators on moons
- Month navigation
- Date selection

#### Using the Calendar
- Click moon icon to select date
- View tasks for that date
- Add tasks to specific dates
- Navigate months with arrows

#### Moon Phases
- New Moon: 🌑
- Waxing Crescent: 🌒
- First Quarter: 🌓
- Waxing Gibbous: 🌔
- Full Moon: 🌕
- Waning Gibbous: 🌖
- Last Quarter: 🌗
- Waning Crescent: 🌘

### Integration Features

#### Pomodoro Timer
- Start timer from task
- Track time per task
- Session statistics
- Focus mode

#### Archive System
- Archive completed tasks
- Auto-archive suggestions
- Restore from archive
- Permanent deletion

### Tips for Task Management

- **Daily Review**: Check tasks each morning
- **Priority Wisely**: Not everything is high priority
- **Use Tags**: Organize by project/context
- **Set Due Dates**: For time-sensitive tasks
- **Archive Regularly**: Keep graveyard clean
- **Pomodoro Focus**: Use timer for deep work

---

## Audio System

Immersive soundscapes and effects that enhance the mystical atmosphere.

### Overview

The audio system provides ambient sounds and UI sound effects that bring the Dark Productivity Suite to life. From page-rustling sounds to mystical chimes, every interaction can have an audio component.

### Features

- **Ambient Soundscapes**: Continuous background audio
- **UI Sound Effects**: Interaction feedback
- **Volume Control**: 0-100% adjustment
- **Global Toggle**: Mute all sounds instantly
- **Persistent Settings**: Preferences saved to profile
- **Sound Categories**: Separate controls for ambient/effects
- **Audio Visualization**: Visual feedback for sounds

### Ambient Sounds

#### Available Soundscapes
- **Wind**: Gentle breeze through trees
- **Thunder**: Distant rumbling storms
- **Whispers**: Ethereal voices
- **Rain**: Soft rainfall
- **Crickets**: Night ambiance
- **Monastery**: Chanting and bells

#### Controlling Ambient Audio
1. Click audio icon in navigation
2. Select "Ambient Sounds"
3. Choose soundscape
4. Adjust volume
5. Toggle on/off

### UI Sound Effects

#### Effect Types
- **Page Turns**: Necronomicon Notes navigation
- **Tombstone Movements**: Task create/complete
- **Ghost Appearances**: Writing suggestions
- **Button Clicks**: UI interactions
- **Notifications**: Alerts and confirmations
- **Timer Chimes**: Pomodoro completions

#### Effect Settings
- Enable/disable per category
- Adjust effect volume separately
- Preview sounds before enabling
- Reset to defaults

### Audio Controls

#### Global Controls
- **Master Volume**: Controls all audio
- **Mute All**: Instant silence
- **Audio Icon**: Shows current state

#### Category Controls
- **Ambient Volume**: Background sounds
- **Effects Volume**: UI sounds
- **Independent Control**: Adjust separately

### Audio Settings

Access via Settings → Audio:

1. **Enable Audio**: Master toggle
2. **Ambient Sounds**: Choose soundscape
3. **Ambient Volume**: 0-100%
4. **UI Effects**: Enable/disable
5. **Effects Volume**: 0-100%
6. **Sound Preview**: Test before applying

### Browser Compatibility

#### Supported Browsers
- ✓ Chrome/Edge: Full support
- ✓ Firefox: Full support
- ✓ Safari: Full support (may require user interaction)
- ✓ Opera: Full support

#### Browser Restrictions
- **Autoplay Policy**: Some browsers require user interaction
- **First Interaction**: Click anywhere to enable audio
- **Background Tabs**: Audio may pause in inactive tabs

### Performance

#### Optimization
- Efficient audio loading
- Minimal CPU usage
- Cached sound files
- Smooth playback

#### Troubleshooting
- **No Sound**: Check browser permissions
- **Choppy Audio**: Reduce quality in settings
- **High CPU**: Disable ambient sounds
- **Delayed Effects**: Check system audio latency

### Tips for Best Experience

- **Headphones**: Best for ambient sounds
- **Low Volume**: Subtle is better
- **Match Mood**: Choose soundscape for your work
- **Effects Only**: Disable ambient if distracting
- **Experiment**: Try different combinations

### Accessibility

- **Visual Indicators**: Audio state shown visually
- **No Audio Required**: All features work without sound
- **Screen Reader**: Audio settings announced
- **Keyboard Control**: All audio controls accessible

---

## Getting Help

### In-App Help

- Press `Ctrl+?` for keyboard shortcuts
- Hover over icons for tooltips
- Check settings for feature toggles
- Review this documentation

### Support

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions and share ideas
- **Documentation**: Check README and guides

### Tips for New Users

1. **Start with Tutorial**: Complete the welcome tour
2. **Learn Shortcuts**: Master `Ctrl+K` and `Ctrl+?` first
3. **Customize Theme**: Find your preferred aesthetic
4. **Enable Cloud Sync**: Protect your data
5. **Explore Features**: Try each module
6. **Regular Backups**: Export data monthly

---

## Conclusion

The Dark Productivity Suite combines powerful productivity tools with an immersive gothic aesthetic. Master these features to transform your workflow into a mystical experience.

**May your productivity be ever mystical.** 🌙
