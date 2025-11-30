import type { Theme } from './index';

/**
 * Default Dark Theme - Original purple/black aesthetic
 * Requirement 10.1: Provide at least three theme options
 */
export const defaultDark: Theme = {
  id: 'default-dark',
  name: 'Default Dark',
  colors: {
    // Background Colors
    bgPrimary: '#0a0a0a',
    bgSecondary: '#1a1a1a',
    bgTertiary: '#242424',
    
    // Accent Colors - Purples
    accentPurple: '#2d1b4e',
    accentPurpleLight: '#4a2d6e',
    accentPurpleDark: '#1a0f2e',
    
    // Text Colors
    textPrimary: '#e0e0e0',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    textMuted: '#606060',
    
    // Highlight Colors
    highlightBlue: '#3d5a80',
    highlightBlueLight: '#5a7fa0',
    highlightGreen: '#2d4a3e',
    highlightGreenLight: '#4a6e5e',
    
    // Warning/Priority Colors
    warningRed: '#4a1a1a',
    warningRedLight: '#6e2d2d',
    warningRedDark: '#2a0a0a',
    
    // Border Colors
    borderPrimary: '#2d1b4e',
    borderSecondary: '#1a1a1a',
    
    // Shadow Colors
    shadowLight: 'rgba(45, 27, 78, 0.3)',
    shadowMedium: 'rgba(45, 27, 78, 0.5)',
    shadowHeavy: 'rgba(10, 10, 10, 0.8)',
    
    // Glow Effects
    glowPurple: 'rgba(74, 45, 110, 0.6)',
    glowBlue: 'rgba(61, 90, 128, 0.6)',
    glowRed: 'rgba(110, 45, 45, 0.6)',
  },
};
