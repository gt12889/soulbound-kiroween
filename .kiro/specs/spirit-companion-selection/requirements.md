# Spirit Companion Selection - Requirements

## Overview
Allow new users to choose their permanent Spirit Companion from 3 unique options when first visiting the Deeds & Decrees page. This choice is permanent and defines the visual evolution path of their companion throughout their productivity journey.

## User Story
**As a** new user  
**I want to** choose my Spirit Companion from multiple options  
**So that** I can personalize my gamification experience and feel more connected to my productivity journey

## Functional Requirements

### FR-1: First-Time Detection
- **FR-1.1**: System must detect when a user visits Deeds & Decrees for the first time
- **FR-1.2**: Detection must work for both authenticated and local-only users
- **FR-1.3**: Selection state must persist across sessions
- **FR-1.4**: System must check localStorage/Firebase for existing companion choice

### FR-2: Companion Selection Modal
- **FR-2.1**: Modal must appear automatically on first visit to Deeds & Decrees
- **FR-2.2**: Modal must be fullscreen or prominent overlay (not dismissible)
- **FR-2.3**: Modal must display 3 distinct companion options
- **FR-2.4**: Each option must show:
  - Companion name
  - Visual preview (egg stage)
  - Brief description/personality
  - Evolution theme preview
- **FR-2.5**: User must select exactly one companion before proceeding
- **FR-2.6**: Modal must have a "Choose Companion" confirmation button

### FR-3: Companion Options
Three distinct Halloween-themed companion types with unique evolution paths:

#### Option 1: Phantom Spirit (Default/Current)
- **Theme**: Ghostly apparitions and spectral energy
- **Personality**: Mysterious, playful, ethereal
- **Evolution Path**: 
  - Haunted Egg → Wisp → Ghost → Phantom → Wraith → Poltergeist
  - Emojis: 🥚 → ✨ → 👻 → 🌫️ → 🌙 → 💀
- **Colors**: Purple/white spectrum (#9d4edd to #e0e0e0)

#### Option 2: Bone Keeper (Skeleton)
- **Theme**: Undead, bones, graveyard guardian
- **Personality**: Loyal, determined, resilient
- **Evolution Path**:
  - Cursed Bone → Bone Pile → Skeleton → Armored Skeleton → Bone Lord → Lich King
  - Emojis: 🦴 → 💀 → ☠️ → ⚰️ → 🏴‍☠️ → 👑
- **Colors**: Bone white/gray spectrum (#f5f5f5 to #1a1a1a)

#### Option 3: Pumpkin Familiar
- **Theme**: Jack-o'-lanterns, harvest magic, autumn spirits
- **Personality**: Cheerful, mischievous, warm
- **Evolution Path**:
  - Pumpkin Seed → Vine Sprout → Jack-o'-Lantern → Scarecrow → Harvest King → Autumn Deity
  - Emojis: 🌱 → 🎃 → 🕯️ → 🌾 → 🍂 → 🌕
- **Colors**: Orange/amber spectrum (#f97316 to #92400e)

### FR-4: Selection Persistence
- **FR-4.1**: Choice must be saved immediately upon selection
- **FR-4.2**: For authenticated users: save to Firebase user profile
- **FR-4.3**: For local users: save to localStorage
- **FR-4.4**: Selection must be immutable (cannot be changed later)
- **FR-4.5**: Companion type must sync across devices for authenticated users

### FR-5: Post-Selection Behavior
- **FR-5.1**: Modal must close after successful selection
- **FR-5.2**: Selected companion must appear immediately in egg stage
- **FR-5.3**: Companion must follow selected evolution path
- **FR-5.4**: Success toast notification: "Your [Companion Name] has bonded with you!"

### FR-6: Edge Cases
- **FR-6.1**: If user navigates away during selection, modal must reappear on return
- **FR-6.2**: If selection fails to save, show error and allow retry
- **FR-6.3**: Existing users (with progress) must not see selection modal
- **FR-6.4**: Import/export must preserve companion type

## Non-Functional Requirements

### NFR-1: Performance
- Modal must load within 500ms
- Selection must save within 1 second
- No blocking operations during selection

### NFR-2: Accessibility
- Modal must be keyboard navigable
- Each option must be selectable via keyboard (Tab + Enter)
- Screen reader support for all companion descriptions
- Focus trap within modal
- ARIA labels for all interactive elements

### NFR-3: Visual Design
- Modal must match dark mystical theme
- Smooth animations for companion previews
- Hover effects on each option
- Selected option must have clear visual indicator
- Responsive design for mobile devices

### NFR-4: Data Integrity
- Companion type must be validated before saving
- Fallback to Shadow Spirit if data corruption occurs
- Migration path for existing users (default to Shadow Spirit)

## User Acceptance Criteria

### AC-1: New User Flow
```
GIVEN I am a new user
WHEN I navigate to Deeds & Decrees for the first time
THEN I see a companion selection modal
AND I can view 3 companion options
AND I can select one companion
AND my selection is saved permanently
AND the modal closes
AND my chosen companion appears in egg stage
```

### AC-2: Returning User Flow
```
GIVEN I have already selected a companion
WHEN I navigate to Deeds & Decrees
THEN I do NOT see the selection modal
AND my previously chosen companion is displayed
AND it maintains its evolution progress
```

### AC-3: Selection Interaction
```
GIVEN I am viewing the companion selection modal
WHEN I hover over a companion option
THEN I see a preview animation
AND the option highlights
WHEN I click on an option
THEN it becomes selected (visual indicator)
WHEN I click "Choose Companion"
THEN my selection is confirmed and saved
```

### AC-4: Cross-Device Sync (Authenticated Users)
```
GIVEN I am an authenticated user
AND I selected a companion on Device A
WHEN I log in on Device B
THEN my companion choice is synced
AND I see the same companion type
AND its evolution progress is maintained
```

## Technical Constraints

### TC-1: Storage
- Companion type stored as string enum: 'shadow' | 'forest' | 'ember'
- Firebase path: `users/{userId}/companion/type`
- LocalStorage key: `dark-productivity-companion-type`

### TC-2: Backward Compatibility
- Existing users default to 'shadow' type
- No breaking changes to existing companion logic
- Evolution stages remain at same thresholds

### TC-3: Dependencies
- Requires existing SpiritCompanion component
- Requires ToastContext for notifications
- Requires AppContext or new CompanionContext for state management

## Out of Scope (Future Enhancements)
- Ability to change companion after selection
- More than 3 companion options
- Companion customization (colors, accessories)
- Multiple companions per user
- Companion trading/gifting between users
- Companion abilities or special powers
- Companion naming by user

## Success Metrics
- 95%+ of new users complete companion selection
- <2% selection abandonment rate
- <1% data corruption/fallback to default
- Average selection time: 30-60 seconds
- User satisfaction: Positive feedback on personalization

## Priority
**High** - Enhances user engagement and personalization from first interaction

## Dependencies
- Existing Spirit Companion system
- User authentication system (optional)
- Local storage system
- Toast notification system

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| User closes browser during selection | Medium | Re-show modal on return, save partial state |
| Firebase save failure | High | Fallback to localStorage, retry mechanism |
| User confusion about permanence | Medium | Clear messaging about permanent choice |
| Performance on mobile | Low | Optimize animations, lazy load assets |
| Existing users see modal | High | Robust detection of existing companion data |
