/**
 * Theme interface and type definitions
 */

export interface Theme {
  id: string;
  name: string;
  colors: {
    // Background Colors
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    
    // Accent Colors
    accentPurple: string;
    accentPurpleLight: string;
    accentPurpleDark: string;
    
    // Text Colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textMuted: string;
    
    // Highlight Colors
    highlightBlue: string;
    highlightBlueLight: string;
    highlightGreen: string;
    highlightGreenLight: string;
    
    // Warning/Priority Colors
    warningRed: string;
    warningRedLight: string;
    warningRedDark: string;
    
    // Border Colors
    borderPrimary: string;
    borderSecondary: string;
    
    // Shadow Colors (rgba)
    shadowLight: string;
    shadowMedium: string;
    shadowHeavy: string;
    
    // Glow Effects (rgba)
    glowPurple: string;
    glowBlue: string;
    glowRed: string;
  };
}

export type ThemeId = 'default-dark' | 'blood-moon' | 'midnight-forest';

// Export all themes
export { defaultDark } from './defaultDark';
export { bloodMoon } from './bloodMoon';
export { midnightForest } from './midnightForest';
