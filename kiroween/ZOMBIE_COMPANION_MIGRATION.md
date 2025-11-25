# Zombie Companion Migration

## Summary
Successfully migrated the "Forest Familiar" companion to "Zombie Companion" throughout the codebase.

## Files Changed

### 1. `src/types/companion.ts`
- Updated `CompanionType` from `'shadow' | 'forest' | 'ember'` to `'shadow' | 'zombie' | 'ember'`
- Renamed companion from "Forest Familiar" to "Zombie Companion"
- Updated personality: "Loyal and persistent, never giving up no matter the challenge"
- Updated theme: "Undead Resilience"
- Updated colors to green theme:
  - Primary: `#22c55e` (green)
  - Secondary: `#14532d` (dark green)
- Updated all 6 evolution stages:
  - Buried Corpse ⚰️ (0 pts)
  - Rising Dead 🧟 (5 pts)
  - Shambling Walker 🧟‍♂️ (20 pts)
  - Undead Guardian 💀 (50 pts)
  - Lich Companion 👑 (100 pts)
  - Death Lord ☠️ (200 pts)

### 2. `src/components/spirit-companion/InteractiveCompanion.tsx`
- Added zombie video support alongside shadow/ghost video
- Video source: `/zombie_idle.mp4` (to be placed in public folder)
- Updated emoji hiding logic to hide for both shadow and zombie companions
- Zombie video uses ref for potential positioning adjustments

### 3. `src/components/spirit-companion/InteractiveCompanion.module.css`
- Added `.zombieVideo` class for zombie companion video styling
- Positioned at center (50%, 50%) with transform
- Set to 120% width/height for proper coverage
- Uses same z-index and pointer-events as ghost video

### 4. `src/components/spirit-companion/CompanionSelectionModal.tsx`
- Updated hardcoded companion types array from `['shadow', 'forest', 'ember']` to `['shadow', 'zombie', 'ember']`

## Video Asset Required

Place the zombie companion video file at:
```
kiroween/public/zombie_idle.mp4
```

The video will:
- Auto-play and loop
- Be muted
- Display when zombie companion is selected
- Replace the emoji display for zombie companion

## Testing Checklist

- [ ] Verify zombie companion appears in selection modal
- [ ] Verify zombie companion can be selected
- [ ] Verify zombie video plays when zombie is active companion
- [ ] Verify zombie evolution stages display correctly
- [ ] Verify zombie theme colors apply correctly
- [ ] Verify zombie companion persists after page reload
- [ ] Verify all zombie stage names and emojis display properly

## Notes

- All companion data is now dynamically pulled from `COMPANION_TYPES` constant
- No hardcoded references to "forest" remain in the codebase
- The zombie companion maintains the same progression system (6 stages, same XP requirements)
- Video positioning may need adjustment once actual zombie video is added
