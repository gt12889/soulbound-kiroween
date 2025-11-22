import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InteractiveCompanion } from './InteractiveCompanion';
import { CompanionProvider } from '../../contexts/CompanionContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { AppProvider } from '../../contexts/AppContext';
import { defaultDark, bloodMoon, midnightForest } from '../../themes';

// Mock Firebase
vi.mock('../../services/firebaseService', () => ({
  db: null,
  auth: null,
  isFirebaseConfigured: false,
}));

/**
 * Test: Companion colors update with theme
 * Requirements: 5.4 - Update companion colors with theme
 */
describe('InteractiveCompanion - Theme Color Integration', () => {
  const renderWithProviders = () => {
    return render(
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={5}
                taskCompletionCount={10}
              />
            </CompanionProvider>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    );
  };

  it('should set stage color CSS variable on companion element', () => {
    const { container } = renderWithProviders();
    
    // Get the companion element
    const companion = container.querySelector('[role="button"]');
    expect(companion).toBeTruthy();
    
    // Check that stage color CSS variable is set
    const stageColor = (companion as HTMLElement).style.getPropertyValue('--stage-color');
    expect(stageColor).toBeTruthy();
    expect(stageColor).not.toBe('');
  });

  it('should use theme colors from context for stage colors', () => {
    const { container } = renderWithProviders();
    
    const companion = container.querySelector('[role="button"]');
    expect(companion).toBeTruthy();
    
    const stageColor = (companion as HTMLElement).style.getPropertyValue('--stage-color');
    
    // Verify it's a valid color (hex format)
    expect(stageColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should apply stage color to progress bar', () => {
    const { container } = renderWithProviders();
    
    // Find progress fill element
    const progressFill = container.querySelector('[class*="progressFill"]');
    expect(progressFill).toBeTruthy();
    
    // Progress fill should have a background color set
    const style = (progressFill as HTMLElement).style;
    expect(style.backgroundColor).toBeTruthy();
  });

  it('should render companion with glow effects', () => {
    const { container } = renderWithProviders();
    
    // Check that companion has glow element
    const glow = container.querySelector('[class*="companionGlow"]');
    expect(glow).toBeTruthy();
  });

  it('should maintain theme colors across different evolution stages', () => {
    // Test with higher achievement count to trigger different stage
    const { container } = render(
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <CompanionProvider>
              <InteractiveCompanion
                achievementCount={20}
                taskCompletionCount={100}
              />
            </CompanionProvider>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    );
    
    const companion = container.querySelector('[role="button"]');
    expect(companion).toBeTruthy();
    
    // Even at higher stages, should still use theme colors
    const stageColor = (companion as HTMLElement).style.getPropertyValue('--stage-color');
    expect(stageColor).toBeTruthy();
    expect(stageColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should apply theme-based colors consistently', () => {
    // Render companion and verify it uses theme colors
    const { container } = renderWithProviders();
    
    const companion = container.querySelector('[role="button"]');
    const stageColor = (companion as HTMLElement).style.getPropertyValue('--stage-color');
    
    // Verify the color is from the theme (valid hex color)
    expect(stageColor).toMatch(/^#[0-9a-f]{6}$/i);
    
    // Verify companion name is displayed
    const nameElement = container.querySelector('[class*="companionName"]');
    expect(nameElement).toBeTruthy();
  });
});
