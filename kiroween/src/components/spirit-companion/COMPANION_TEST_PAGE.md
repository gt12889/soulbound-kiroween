# Companion Selection Test Page

## How to Access

A dedicated test page has been created to test the companion selection modal as a new player would experience it.

### Steps to Test:

1. **Start the development server** (if not already running):
   ```bash
   cd kiroween
   npm run dev
   ```

2. **Navigate to the test page**:
   - Open your browser to: `http://localhost:5173/companion-test`
   - Or click the link in the dev server output

3. **Test the companion selection**:
   - Click "Test New Player Experience" button
   - The companion selection modal will appear fullscreen
   - Select a companion and confirm your choice
   - Use "Reset Selection" to test again

## What to Test

### Visual Features
- ✅ Modal appears fullscreen and cannot be dismissed
- ✅ All 3 companions displayed with complete information
- ✅ Hover effects on companion cards
- ✅ Selection state (visual indicator when selected)
- ✅ Confirm button disabled until companion selected
- ✅ Loading state during confirmation ("Bonding...")
- ✅ Success state after selection

### Keyboard Navigation
- ✅ **Tab** - Navigate between focusable elements
- ✅ **Shift+Tab** - Navigate backwards
- ✅ **Arrow Left/Right** - Navigate between companions
- ✅ **Enter** or **Space** - Select companion or confirm
- ✅ Focus trap (Tab stays within modal)
- ✅ Initial focus on first companion

### Accessibility
- ✅ ARIA labels for screen readers
- ✅ Proper role attributes (dialog, radiogroup, radio)
- ✅ Keyboard-only navigation works perfectly
- ✅ Focus indicators visible
- ✅ Semantic HTML structure

### Responsive Design
- ✅ Works on desktop (1920x1080, 1366x768)
- ✅ Works on tablet (768x1024)
- ✅ Works on mobile (375x667, 414x896)

## Test Page Features

The test page (`CompanionSelectionDemo.tsx`) includes:

1. **Current Status Card** - Shows selected companion with full details
2. **Action Buttons** - Test and reset functionality
3. **Selection History** - Tracks all selections made during testing
4. **Instructions** - Step-by-step testing guide
5. **Features Checklist** - All features to verify

## Files

- **Demo Component**: `src/components/spirit-companion/CompanionSelectionDemo.tsx`
- **Demo Styles**: `src/components/spirit-companion/CompanionSelectionDemo.module.css`
- **Route**: Added to `src/App.tsx` at `/companion-test`

## Integration Notes

This is a **standalone test page**. To integrate the modal into the actual app:

1. Import `CompanionSelectionModal` in `AchievementsPage.tsx`
2. Check if user has selected a companion on mount
3. Show modal if no selection exists
4. Handle selection and save to AppContext
5. See Task 3.1 in `.kiro/specs/spirit-companion-selection/tasks.md`

## Quick Test Checklist

- [ ] Modal opens when clicking test button
- [ ] Can select each of the 3 companions
- [ ] Confirm button enables after selection
- [ ] Loading state appears during save
- [ ] Modal closes after successful selection
- [ ] Selected companion info displays correctly
- [ ] Can reset and test again
- [ ] Keyboard navigation works (Tab, Arrow keys, Enter)
- [ ] Focus stays trapped in modal
- [ ] Works on mobile screen size

## Troubleshooting

**Modal doesn't appear:**
- Check browser console for errors
- Ensure all dependencies are installed (`npm install`)
- Try refreshing the page

**Keyboard navigation not working:**
- Click inside the modal first to set focus
- Check that no other modals or overlays are interfering

**Styles look broken:**
- Clear browser cache
- Check that CSS module is loading correctly
- Verify no conflicting global styles

## Next Steps

Once testing is complete and everything works as expected:
1. Integrate modal into AchievementsPage (Task 3.1)
2. Add first-time user detection logic
3. Connect to AppContext for persistence
4. Deploy to production

---

**Test URL**: http://localhost:5173/companion-test
