# Import/Export Guide

Complete guide to importing and exporting data in the Dark Productivity Suite.

## Table of Contents

1. [Overview](#overview)
2. [Export System](#export-system)
3. [Import System](#import-system)
4. [Data Formats](#data-formats)
5. [Backup Strategies](#backup-strategies)
6. [Migration Guide](#migration-guide)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Dark Productivity Suite provides comprehensive import and export functionality to help you:
- Create backups of your data
- Migrate between devices
- Share data with others
- Archive old data
- Integrate with other tools

### Key Features

**Export:**
- Multiple formats (JSON, Markdown, CSV)
- Selective data export
- Date range filtering
- Encryption support
- Automatic timestamps

**Import:**
- Multiple format support
- Data validation
- Duplicate detection
- Merge strategies
- Preview before import

---

## Export System

### Accessing Export

1. **Via Settings**
   - Click settings icon
   - Navigate to "Data Management" tab
   - Click "Export Data"

2. **Via Keyboard**
   - Press `Ctrl+E` from anywhere
   - Export dialog opens

3. **Via Menu**
   - Click user menu
   - Select "Export Data"

### Export Formats

#### JSON Format

**Best For:**
- Complete backups
- Preserving all data structure
- Re-importing to Dark Productivity Suite
- Maximum data fidelity

**Includes:**
- All metadata
- Relationships between items
- Settings and preferences
- Full data structure

**Example:**
```json
{
  "version": "1.0.0",
  "exportedAt": "2025-11-14T10:30:00Z",
  "notes": [
    {
      "id": "note-123",
      "title": "My Note",
      "content": "Note content...",
      "tags": ["work", "important"],
      "markdown": true,
      "createdAt": "2025-11-01T09:00:00Z",
      "updatedAt": "2025-11-14T10:00:00Z"
    }
  ],
  "tasks": [...],
  "settings": {...}
}
```

#### Markdown Format

**Best For:**
- Human-readable backups
- Sharing with others
- Importing to other markdown tools
- Version control (git)

**Includes:**
- Notes as .md files
- Tasks as markdown lists
- Preserves formatting
- Readable structure

**Example:**
```markdown
# My Note

Created: 2025-11-01
Tags: #work #important

Note content with **formatting** and [links](https://example.com).

## Section Header

- List item 1
- List item 2
```

#### CSV Format

**Best For:**
- Spreadsheet import
- Data analysis
- Simple task lists
- Compatibility with other tools

**Includes:**
- Tabular data
- Basic fields only
- No complex formatting
- Easy to parse

**Example:**
```csv
Title,Content,Tags,Created,Updated
"My Note","Note content...","work,important","2025-11-01","2025-11-14"
"Another Note","More content...","personal","2025-11-02","2025-11-13"
```

### Export Options

#### Data Selection

Choose what to export:
- ☑ Notes
- ☑ Tasks
- ☑ Tarot Readings
- ☑ Pomodoro Sessions
- ☑ Settings
- ☑ Tags

**Select All**: Export everything
**Custom**: Choose specific data types

#### Date Range Filtering

Export data from specific time periods:
- **All Time**: Everything (default)
- **Last 7 Days**: Recent data only
- **Last 30 Days**: Past month
- **Last 90 Days**: Past quarter
- **Last Year**: Past 12 months
- **Custom Range**: Specify start and end dates

**Use Cases:**
- Archive old data
- Share recent work
- Periodic backups
- Data analysis

#### Encryption

Protect sensitive data with encryption:

1. **Enable Encryption**
   - Check "Encrypt export" option
   - Enter encryption password
   - Confirm password

2. **Password Requirements**
   - Minimum 8 characters
   - Strong password recommended
   - Store password securely

3. **Decryption**
   - Required for import
   - Password must match exactly
   - No password recovery

**When to Encrypt:**
- Sensitive personal data
- Work-related information
- Storing in cloud services
- Sharing via email

**When Not to Encrypt:**
- Personal backups on secure devices
- Quick data transfers
- Testing/development
- Public sharing (use caution)

### Export Process

#### Step-by-Step

1. **Open Export Dialog**
   - Settings → Data Management → Export
   - Or press `Ctrl+E`

2. **Select Format**
   - Choose JSON, Markdown, or CSV
   - Consider your use case

3. **Configure Options**
   - Select data types
   - Set date range (optional)
   - Enable encryption (optional)

4. **Preview (Optional)**
   - Click "Preview" to see data
   - Verify selection
   - Adjust if needed

5. **Export**
   - Click "Download" button
   - Choose save location
   - File downloads with timestamp

6. **Verify**
   - Check file size
   - Open to verify contents
   - Store securely

#### File Naming

Exports are automatically named:
```
dark-productivity-export-YYYY-MM-DD-HHmmss.{format}
```

**Examples:**
- `dark-productivity-export-2025-11-14-103045.json`
- `dark-productivity-export-2025-11-14-103045.md`
- `dark-productivity-export-2025-11-14-103045.csv`

**Custom Names:**
- Rename after download
- Include description
- Add version numbers
- Organize by purpose

### Export Best Practices

1. **Regular Exports**
   - Weekly for active use
   - Monthly for archives
   - Before major changes
   - After important work

2. **Multiple Formats**
   - JSON for complete backup
   - Markdown for readability
   - CSV for analysis

3. **Secure Storage**
   - Encrypted exports for cloud
   - Local backups on secure drives
   - Multiple backup locations
   - Test restoration periodically

4. **Version Control**
   - Include dates in filenames
   - Keep multiple versions
   - Document changes
   - Rotate old backups

---

## Import System

### Accessing Import

1. **Via Settings**
   - Click settings icon
   - Navigate to "Data Management" tab
   - Click "Import Data"

2. **Via Menu**
   - Click user menu
   - Select "Import Data"

3. **Via Drag & Drop**
   - Drag file to browser window
   - Drop to trigger import

### Supported Formats

#### JSON Import

**Supports:**
- Dark Productivity Suite exports
- Standard JSON structure
- Nested data
- Full metadata

**Requirements:**
- Valid JSON syntax
- Correct data structure
- Version compatibility

#### Markdown Import

**Supports:**
- Individual .md files
- Markdown exports
- Plain text with markdown
- Standard markdown syntax

**Conversion:**
- Automatically converts to notes
- Preserves formatting
- Extracts metadata from frontmatter
- Creates tags from headers

#### Plain Text Import

**Supports:**
- .txt files
- Simple text content
- Line-based data

**Conversion:**
- Each file becomes a note
- Filename becomes title
- Content preserved as-is
- No formatting

### Import Options

#### Merge Strategy

Choose how to handle existing data:

**Merge (Recommended)**
- Combines with existing data
- Prevents duplicates
- Preserves both old and new
- Safe for most cases

**Replace**
- Clears existing data first
- Imports fresh data
- Irreversible action
- Use with caution

**Duplicate Handling:**
- Detected by ID or content
- Skips exact duplicates
- Updates modified items
- Creates new for unique items

#### Data Preview

Review before importing:

1. **Preview Window**
   - Shows data to be imported
   - Displays item count
   - Highlights issues

2. **Validation Results**
   - ✓ Valid items
   - ⚠ Warnings
   - ✗ Errors

3. **Selective Import**
   - Uncheck items to skip
   - Fix errors before import
   - Proceed with valid items

### Import Process

#### Step-by-Step

1. **Open Import Dialog**
   - Settings → Data Management → Import
   - Or drag file to window

2. **Select File**
   - Click "Choose File"
   - Or drag and drop
   - Supports multiple files

3. **Validation**
   - Automatic format detection
   - Structure validation
   - Error checking

4. **Preview Data**
   - Review items to import
   - Check for issues
   - Verify counts

5. **Choose Strategy**
   - Select Merge or Replace
   - Understand implications
   - Confirm choice

6. **Import**
   - Click "Import" button
   - Progress indicator shows status
   - Wait for completion

7. **Verify**
   - Check imported items
   - Verify counts match
   - Test functionality

#### Encrypted Import

For encrypted exports:

1. **Select Encrypted File**
   - System detects encryption
   - Prompts for password

2. **Enter Password**
   - Type decryption password
   - Must match export password
   - No password recovery

3. **Decrypt**
   - System decrypts data
   - Validates structure
   - Proceeds with import

### Import Validation

#### Automatic Checks

**Format Validation:**
- JSON syntax
- Data structure
- Required fields
- Data types

**Content Validation:**
- Valid dates
- Proper IDs
- Tag format
- Relationships

**Compatibility:**
- Version checking
- Schema validation
- Migration if needed

#### Error Handling

**Common Errors:**

**Invalid JSON**
- Error: "Invalid JSON syntax"
- Fix: Validate JSON structure
- Tool: Use JSON validator

**Missing Fields**
- Error: "Required field missing"
- Fix: Add missing fields
- Check: Export format

**Invalid Dates**
- Error: "Invalid date format"
- Fix: Use ISO 8601 format
- Example: "2025-11-14T10:30:00Z"

**Duplicate IDs**
- Warning: "Duplicate ID detected"
- Action: System generates new ID
- Result: Both items imported

### Import Best Practices

1. **Backup First**
   - Export current data
   - Store backup securely
   - Test import on copy

2. **Validate Data**
   - Check file format
   - Review preview
   - Fix errors before import

3. **Use Merge**
   - Safer than replace
   - Preserves existing data
   - Handles duplicates

4. **Test Small**
   - Import small dataset first
   - Verify results
   - Then import full data

5. **Verify After**
   - Check item counts
   - Test functionality
   - Review imported content

---

## Data Formats

### JSON Schema

Complete JSON export structure:

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-11-14T10:30:00Z",
  "userId": "user-123",
  "notes": [
    {
      "id": "note-123",
      "userId": "user-123",
      "title": "Note Title",
      "content": "Note content...",
      "markdown": true,
      "tags": ["tag1", "tag2"],
      "createdAt": "2025-11-01T09:00:00Z",
      "updatedAt": "2025-11-14T10:00:00Z"
    }
  ],
  "tasks": [
    {
      "id": "task-123",
      "userId": "user-123",
      "title": "Task Title",
      "description": "Task description...",
      "priority": "high",
      "completed": false,
      "archived": false,
      "tags": ["tag1"],
      "createdAt": "2025-11-01T09:00:00Z",
      "completedAt": null,
      "archivedAt": null
    }
  ],
  "tarotReadings": [
    {
      "id": "reading-123",
      "userId": "user-123",
      "date": "2025-11-14T10:00:00Z",
      "cards": [...],
      "interpretation": "...",
      "commitStats": {...}
    }
  ],
  "pomodoroSessions": [
    {
      "id": "session-123",
      "userId": "user-123",
      "startTime": "2025-11-14T09:00:00Z",
      "endTime": "2025-11-14T09:25:00Z",
      "duration": 25,
      "type": "work",
      "completed": true
    }
  ],
  "settings": {
    "theme": "default-dark",
    "audioEnabled": true,
    "audioVolume": 70,
    "keyboardShortcuts": {...}
  }
}
```

### Markdown Format

Notes exported as individual .md files:

```markdown
---
title: Note Title
created: 2025-11-01T09:00:00Z
updated: 2025-11-14T10:00:00Z
tags: [tag1, tag2]
---

# Note Title

Note content with **formatting** and [links](https://example.com).

## Section

- List item 1
- List item 2

```code
Code block
```
```

Tasks exported as markdown checklist:

```markdown
# Tasks

## High Priority

- [ ] Task 1 #tag1
- [x] Task 2 #tag2 (completed: 2025-11-14)

## Medium Priority

- [ ] Task 3
- [ ] Task 4

## Low Priority

- [ ] Task 5
```

### CSV Format

Simple tabular format:

**Notes CSV:**
```csv
ID,Title,Content,Tags,Markdown,Created,Updated
note-123,"Note Title","Content...","tag1,tag2",true,2025-11-01,2025-11-14
```

**Tasks CSV:**
```csv
ID,Title,Description,Priority,Completed,Tags,Created,Completed Date
task-123,"Task Title","Description...",high,false,"tag1",2025-11-01,
```

---

## Backup Strategies

### Backup Frequency

**Daily Backups:**
- For critical data
- Active projects
- Automated if possible

**Weekly Backups:**
- General use
- Regular work
- Recommended minimum

**Monthly Backups:**
- Archives
- Long-term storage
- Compliance

### Backup Locations

**Local Storage:**
- External hard drive
- USB drive
- NAS device
- Pros: Fast, private
- Cons: Physical risk

**Cloud Storage:**
- Google Drive
- Dropbox
- OneDrive
- Pros: Accessible, redundant
- Cons: Privacy concerns

**Multiple Locations:**
- 3-2-1 Rule:
  - 3 copies of data
  - 2 different media types
  - 1 offsite backup

### Backup Rotation

**Keep Multiple Versions:**
- Daily: Last 7 days
- Weekly: Last 4 weeks
- Monthly: Last 12 months
- Yearly: Indefinite

**Naming Convention:**
```
backup-daily-2025-11-14.json
backup-weekly-2025-W46.json
backup-monthly-2025-11.json
backup-yearly-2025.json
```

### Automated Backups

**Browser Extensions:**
- Schedule automatic exports
- Save to cloud storage
- Email backups

**Scripts:**
- Use export API
- Cron jobs
- Automated uploads

**Cloud Sync:**
- Enable cloud sync
- Automatic backup
- Real-time protection

---

## Migration Guide

### From Other Apps

#### From Notion

1. Export from Notion (Markdown)
2. Import markdown files
3. System converts to notes
4. Review and organize

#### From Evernote

1. Export from Evernote (ENEX)
2. Convert ENEX to markdown (use tool)
3. Import markdown files
4. Verify formatting

#### From Todoist

1. Export from Todoist (CSV)
2. Import CSV as tasks
3. Map priority levels
4. Set up tags

#### From Google Keep

1. Export from Google Takeout
2. Convert to markdown
3. Import as notes
4. Organize with tags

### Between Devices

#### Same Account

1. Enable cloud sync
2. Sign in on new device
3. Data syncs automatically
4. No export/import needed

#### Different Accounts

1. Export from source account
2. Download export file
3. Sign in to target account
4. Import export file
5. Choose merge strategy

### Version Migration

#### Upgrading

1. Export data before upgrade
2. Update application
3. Data migrates automatically
4. Verify after upgrade

#### Downgrading

1. Export from newer version
2. Check compatibility
3. May lose new features
4. Import to older version

---

## Troubleshooting

### Export Issues

**Export Fails**
- Check browser permissions
- Verify disk space
- Try smaller date range
- Disable browser extensions

**File Too Large**
- Use date range filtering
- Export data types separately
- Compress after export
- Split into multiple exports

**Encryption Fails**
- Check password strength
- Verify password match
- Try without encryption
- Update browser

### Import Issues

**Invalid Format**
- Verify file format
- Check JSON syntax
- Validate structure
- Use format validator

**Import Fails**
- Check file size
- Verify format
- Review error messages
- Try smaller file

**Duplicates Created**
- Use merge strategy
- Check duplicate detection
- Review IDs
- Manual cleanup

**Missing Data**
- Verify export completeness
- Check date range
- Review preview
- Re-export if needed

### Data Integrity

**Verify Exports:**
```bash
# Check JSON validity
cat export.json | jq .

# Count items
cat export.json | jq '.notes | length'
```

**Verify Imports:**
- Compare item counts
- Spot-check content
- Test functionality
- Review timestamps

---

## Support

### Getting Help

**Documentation:**
- [README.md](./README.md)
- [FEATURES.md](./FEATURES.md)
- [FAQ](./FAQ.md)

**Community:**
- GitHub Issues
- GitHub Discussions
- Discord (coming soon)

**Contact:**
- Email: support@darkproductivity.app
- Include export file (if not sensitive)
- Describe issue in detail

---

**May your data be secure and portable.** 💾🌙
