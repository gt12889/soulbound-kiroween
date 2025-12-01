import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme, ThemeId } from '../themes';
import { defaultDark, bloodMoon, midnightForest } from '../themes';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('[Theme]');

/**
 * ThemeContext - Manages theme state and switching
 * Requirements: 10.3, 10.4
 */

interface ThemeContextType {
  currentTheme: Theme;
  themeId: ThemeId;
  availableThemes: Theme[];
  switchTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Map of all available themes
const themes: Record<ThemeId, Theme> = {
  'default-dark': defaultDark,
  'blood-moon': bloodMoon,
  'midnight-forest': midnightForest,
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Persist theme selection to local storage (Requirement 10.3)
  const [themeId, setThemeId] = useLocalStorage<ThemeId>('darkprod_theme', 'default-dark');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[themeId]);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);

  // Load theme from cloud when user logs in (Requirement 10.4)
  useEffect(() => {
    const loadThemeFromCloud = async () => {
      if (!isAuthenticated || !user || !db) { // Null check for db
        setCloudSyncEnabled(false);
        return;
      }

      try {
        const settingsRef = doc(db, 'users', user.id, 'settings', 'preferences');
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.theme && themes[data.theme as ThemeId]) {
            setThemeId(data.theme as ThemeId);
          }
        }
        
        setCloudSyncEnabled(true);
      } catch (error) {
        logger.error('Failed to load theme from cloud:', error);
        setCloudSyncEnabled(false);
      }
    };

    loadThemeFromCloud();
  }, [isAuthenticated, user, setThemeId]);

  // Apply theme by injecting CSS variables (Requirement 10.2)
  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[themeId];
    
    // Inject CSS variables for theme colors
    root.style.setProperty('--bg-primary', theme.colors.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.colors.bgSecondary);
    root.style.setProperty('--bg-tertiary', theme.colors.bgTertiary);
    
    root.style.setProperty('--accent-purple', theme.colors.accentPurple);
    root.style.setProperty('--accent-purple-light', theme.colors.accentPurpleLight);
    root.style.setProperty('--accent-purple-dark', theme.colors.accentPurpleDark);
    
    root.style.setProperty('--text-primary', theme.colors.textPrimary);
    root.style.setProperty('--text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--text-tertiary', theme.colors.textTertiary);
    root.style.setProperty('--text-muted', theme.colors.textMuted);
    
    root.style.setProperty('--highlight-blue', theme.colors.highlightBlue);
    root.style.setProperty('--highlight-blue-light', theme.colors.highlightBlueLight);
    root.style.setProperty('--highlight-green', theme.colors.highlightGreen);
    root.style.setProperty('--highlight-green-light', theme.colors.highlightGreenLight);
    
    root.style.setProperty('--warning-red', theme.colors.warningRed);
    root.style.setProperty('--warning-red-light', theme.colors.warningRedLight);
    root.style.setProperty('--warning-red-dark', theme.colors.warningRedDark);
    
    root.style.setProperty('--border-primary', theme.colors.borderPrimary);
    root.style.setProperty('--border-secondary', theme.colors.borderSecondary);
    
    root.style.setProperty('--shadow-light', theme.colors.shadowLight);
    root.style.setProperty('--shadow-medium', theme.colors.shadowMedium);
    root.style.setProperty('--shadow-heavy', theme.colors.shadowHeavy);
    
    root.style.setProperty('--glow-purple', theme.colors.glowPurple);
    root.style.setProperty('--glow-blue', theme.colors.glowBlue);
    root.style.setProperty('--glow-red', theme.colors.glowRed);
    
    setCurrentTheme(theme);
  }, [themeId]);

  // Sync theme to cloud when it changes (Requirement 10.4)
  useEffect(() => {
    const syncThemeToCloud = async () => {
      if (!cloudSyncEnabled || !isAuthenticated || !user || !db) { // Null check for db
        return;
      }

      try {
        const settingsRef = doc(db, 'users', user.id, 'settings', 'preferences');
        await setDoc(settingsRef, {
          theme: themeId,
          updatedAt: new Date(),
        }, { merge: true });
      } catch (error) {
        console.error('Failed to sync theme to cloud:', error);
      }
    };

    // Debounce sync to avoid excessive writes
    const timeoutId = setTimeout(syncThemeToCloud, 500);
    return () => clearTimeout(timeoutId);
  }, [themeId, cloudSyncEnabled, isAuthenticated, user]);

  // Switch theme function
  const switchTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    // Theme is persisted to local storage via useLocalStorage hook (Requirement 10.3)
    // Cloud sync is handled by the useEffect above (Requirement 10.4)
  };

  const value: ThemeContextType = {
    currentTheme,
    themeId,
    availableThemes: Object.values(themes),
    switchTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
