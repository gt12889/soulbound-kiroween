import type { Theme } from './index';

/**
 * Midnight Forest Theme - Dark greens and earth tones
 * Requirement 10.1: Provide at least three theme options
 */
export const midnightForest: Theme = {
  id: 'midnight-forest',
  name: 'Midnight Forest',
  colors: {
    // Background Colors - Deep blacks with green tint
    bgPrimary: '#050a05',
    bgSecondary: '#0a1a0a',
    bgTertiary: '#142414',
    
    // Accent Colors - Dark greens and teals
    accentPurple: '#1a4a2d',
    accentPurpleLight: '#2d6e4a',
    accentPurpleDark: '#0f2a1a',
    
    // Text Colors - Pale greens and grays
    textPrimary: '#c0e0c0',
    textSecondary: '#80b080',
    textTertiary: '#608060',
    textMuted: '#406040',
    
    // Highlight Colors - Forest greens and blues
    highlightBlue: '#2d4a3d',
    highlightBlueLight: '#4a6e5a',
    highlightGreen: '#3d5a4a',
    highlightGreenLight: '#5a7f6a',
    
    // Warning/Priority Colors - Amber and gold
    warningRed: '#4a3a1a',
    warningRedLight: '#6e5a2d',
    warningRedDark: '#2a1a0a',
    
    // Border Colors
    borderPrimary: '#1a4a2d',
    borderSecondary: '#0a1a0a',
    
    // Shadow Colors
    shadowLight: 'rgba(26, 74, 45, 0.3)',
    shadowMedium: 'rgba(26, 74, 45, 0.5)',
    shadowHeavy: 'rgba(5, 10, 5, 0.8)',
    
    // Glow Effects
    glowPurple: 'rgba(45, 110, 74, 0.6)',
    glowBlue: 'rgba(45, 74, 61, 0.6)',
    glowRed: 'rgba(110, 90, 45, 0.6)',
  },
};
