# Dashboard Customization Guide

## Overview

The Dark Productivity Suite now features a fully customizable widget-based dashboard that lets you create your perfect workspace by selecting and arranging features from across the application.

## Features

### Widget System

The dashboard uses a modular widget system where each feature is packaged as a self-contained widget that can be:
- **Added** - Select from 15+ available widgets
- **Removed** - Remove widgets you don't need
- **Persisted** - Your layout is saved automatically

### Available Widgets

#### Tasks (Graveyard Dashboard)
- **Task Graveyard** (Large) - Full task management interface
- **Task Archive** (Medium) - Browse completed tasks
- **Pomodoro Timer** (Medium) - Focus timer with controls
- **Pomodoro Stats** (Small) - View your focus statistics

#### Calendar & Moon Phases
- **Moon Calendar** (Medium) - Full moon phase calendar
- **Current Moon** (Small) - Current moon phase display

#### Notes (Necronomicon)
- **Recent Notes** (Medium) - Your latest notes
- **Note Search** (Small) - Quick note search
- **Tag Cloud** (Small) - Browse notes by tags

#### Writing (Ghost Writer)
- **Ghost Writer** (Large) - AI writing assistant
- **Writing Stats** (Small) - Track your writing progress

#### Tarot (Terminal Tarot)
- **Daily Tarot** (Small) - Draw a daily card
- **Tarot Spread** (Medium) - Full tarot reading

#### Quick Actions
- **Quick Capture** (Small) - Rapid task/note entry
- **Shortcuts** (Small) - Keyboard shortcuts reference

## How to Use

### Adding Widgets

1. Click the **"➕ Add Widget"** button in the dashboard header
2. Browse widgets by category (All, Tasks, Calendar, Notes, Writing, Tarot, Quick)
3. Click on any widget to add it to your dashboard
4. Widgets marked as "Active" are already on your dashboard

### Removing Widgets

1. Hover over any widget
2. Click the **✕** button in the widget header
3. The widget will be removed from your dashboard

### Widget Sizes

Widgets come in four sizes:
- **Small** - Compact, single-cell widgets (1x1)
- **Medium** - Standard widgets (1x2)
- **Large** - Wide widgets (2x2)
- **Full** - Maximum size widgets (2x3)

The dashboard automatically arranges widgets in a responsive grid that adapts to your screen size.

## Customization Tips

### Recommended Layouts

**Focus Mode**
- Pomodoro Timer
- Task Graveyard
- Current Moon

**Writing Mode**
- Ghost Writer
- Writing Stats
- Recent Notes

**Planning Mode**
- Task Graveyard
- Moon Calendar
- Tarot Spread

**Quick Dashboard**
- Quick Capture
- Pomodoro Stats
- Daily Tarot
- Shortcuts

### Mobile Optimization

On mobile devices, the dashboard automatically switches to a single-column layout for optimal viewing.

## Technical Details

### Persistence

Widget configurations are saved to `localStorage` under the key `dashboard-widgets`. Your layout persists across sessions and browser restarts.

### Performance

Widgets are rendered on-demand and only active widgets consume resources. The system is optimized for smooth performance even with many widgets active.

## Future Enhancements

Planned features for future releases:
- Drag-and-drop widget reordering
- Custom widget sizing
- Widget-specific settings
- Export/import dashboard layouts
- Multiple dashboard presets
- Widget themes

## Keyboard Shortcuts

- **Ctrl+K** - Quick Capture (works from any widget)
- **Ctrl+N** - Create new task (when Task Graveyard is active)

## Troubleshooting

**Widgets not saving?**
- Check browser localStorage is enabled
- Clear cache and reload

**Widget content not loading?**
- Ensure you're logged in
- Check network connection for cloud-synced data

**Layout looks broken?**
- Try removing and re-adding widgets
- Clear localStorage: `localStorage.removeItem('dashboard-widgets')`
- Refresh the page

## Support

For issues or feature requests, please check the main documentation or submit an issue on GitHub.
