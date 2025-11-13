import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { Theme, ThemeId } from '../../themes';
import styles from './ThemeSelector.module.css';

/**
 * ThemeSelector Component
 * Requirements: 10.1, 10.2, 10.5
 * 
 * Displays theme options with visual previews and color swatches.
 * Implements smooth transitions and real-time preview on hover.
 */
const ThemeSelector: React.FC = () => {
  const { themeId, availableThemes, switchTheme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  const handleThemeClick = (newThemeId: ThemeId) => {
    switchTheme(newThemeId);
    setPreviewTheme(null);
  };

  const handleThemeHover = (theme: Theme) => {
    // Real-time preview on hover (Requirement 10.5)
    setPreviewTheme(theme);
  };

  const handleThemeLeave = () => {
    setPreviewTheme(null);
  };

  return (
    <div className={styles.themeSelectorContainer}>
      <h3 className={styles.title}>Choose Your Realm</h3>
      <p className={styles.subtitle}>Select a theme to transform your experience</p>
      
      <div className={styles.themesGrid}>
        {availableThemes.map((theme) => {
          const isActive = theme.id === themeId;
          const isPreview = previewTheme?.id === theme.id;
          
          return (
            <div
              key={theme.id}
              className={`${styles.themeCard} ${isActive ? styles.active : ''} ${isPreview ? styles.preview : ''}`}
              onClick={() => handleThemeClick(theme.id as ThemeId)}
              onMouseEnter={() => handleThemeHover(theme)}
              onMouseLeave={handleThemeLeave}
            >
              <div className={styles.themePreview}>
                {/* Color swatches (Requirement 10.1) */}
                <div className={styles.colorSwatches}>
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: theme.colors.bgPrimary }}
                    title="Background"
                  />
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: theme.colors.accentPurple }}
                    title="Accent"
                  />
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: theme.colors.textPrimary }}
                    title="Text"
                  />
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: theme.colors.highlightBlue }}
                    title="Highlight"
                  />
                  <div
                    className={styles.swatch}
                    style={{ backgroundColor: theme.colors.warningRed }}
                    title="Warning"
                  />
                </div>
                
                {/* Theme preview mockup */}
                <div
                  className={styles.mockup}
                  style={{
                    backgroundColor: theme.colors.bgSecondary,
                    borderColor: theme.colors.borderPrimary,
                  }}
                >
                  <div
                    className={styles.mockupHeader}
                    style={{ backgroundColor: theme.colors.accentPurple }}
                  />
                  <div className={styles.mockupContent}>
                    <div
                      className={styles.mockupText}
                      style={{ backgroundColor: theme.colors.textPrimary }}
                    />
                    <div
                      className={styles.mockupText}
                      style={{ backgroundColor: theme.colors.textSecondary }}
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.themeInfo}>
                <h4 className={styles.themeName}>{theme.name}</h4>
                {isActive && <span className={styles.activeIndicator}>Active</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
