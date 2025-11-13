import type { Theme } from './index';

/**
 * Blood Moon Theme - Deep reds and crimson tones
 * Requirement 10.1: Provide at least three theme options
 */
export const bloodMoon: Theme = {
  id: 'blood-moon',
  name: 'Blood Moon',
  colors: {
    // Background Colors - Deep blacks with red tint
    bgPrimary: '#0a0505',
    bgSecondary: '#1a0a0a',
    bgTertiary: '#241414',
    
    // Accent Colors - Crimson and blood red
    accentPurple: '#4a0000',
    accentPurpleLight: '#6e1a1a',
    accentPurpleDark: '#2a0000',
    
    // Text Colors - Pale reds and grays
    textPrimary: '#e0c0c0',
    textSecondary: '#b08080',
    textTertiary: '#806060',
    textMuted: '#604040',
    
    // Highlight Colors - Dark oranges and reds
    highlightBlue: '#803d3d',
    highlightBlueLight: '#a05a5a',
    highlightGreen: '#4a2d2d',
    highlightGreenLight: '#6e4a4a',
    
    // Warning/Priority Colors - Bright reds
    warningRed: '#8a0000',
    warningRedLight: '#a01a1a',
    warningRedDark: '#4a0000',
    
    // Border Colors
    borderPrimary: '#4a0000',
    borderSecondary: '#1a0a0a',
    
    // Shadow Colors
    shadowLight: 'rgba(74, 0, 0, 0.3)',
    shadowMedium: 'rgba(74, 0, 0, 0.5)',
    shadowHeavy: 'rgba(10, 5, 5, 0.8)',
    
    // Glow Effects
    glowPurple: 'rgba(110, 26, 26, 0.6)',
    glowBlue: 'rgba(128, 61, 61, 0.6)',
    glowRed: 'rgba(160, 26, 26, 0.6)',
  },
};
