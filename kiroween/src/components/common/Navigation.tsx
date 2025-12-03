import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { useKeyboard } from '../../contexts/KeyboardContext';
import { useNotes } from '../../contexts/NotesContext';
import { useTasks } from '../../contexts/TasksContext';
import { useApp } from '../../contexts/AppContext';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import SettingsModal from './SettingsModal';
import { ExportDialog } from '../import-export/ExportDialog';
import QuickCapture from './QuickCapture';
import styles from './Navigation.module.css';

/**
 * Navigation component with UI interaction sounds, data export, logout, keyboard shortcuts, and quick capture
 * Requirements: 6.1, 6.3, 6.4, 7.5, 8.4, 9.1, 10.5, 13.1, 17.7, 18.6, 1.3
 */
const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { playUIClick, playUIHover } = useAudio();
  const { registerShortcut, unregisterShortcut } = useKeyboard();
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { settings, sidebarMode, toggleSidebar } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);

  const navItems = [
    { path: '/terminal-tarot', label: 'Mystic Clearing', icon: '🔮', description: 'Seek guidance', shortcutId: 'nav-terminal-tarot' },
    { path: '/necronomicon-notes', label: 'Ancient Library', icon: '📖', description: 'Deep in the woods', shortcutId: 'nav-necronomicon-notes' },
    { path: '/ghost-writer', label: 'Haunted Study', icon: '✍️', description: 'Spectral guidance', shortcutId: 'nav-ghost-writer' },
    { path: '/graveyard-dashboard', label: 'Forgotten Graveyard', icon: '⚰️', description: 'Where tasks rest', shortcutId: 'nav-graveyard-dashboard' },
    { path: '/cursed-calendar', label: 'Cursed Calendar', icon: '📅', description: 'Schedule your doom', shortcutId: 'nav-cursed-calendar' },
    { path: '/achievements', label: 'Deeds & Flames', icon: '🏆', description: 'Achievements & streaks', shortcutId: 'nav-achievements' },
  ];

  // Memoized event handlers to prevent unnecessary re-renders
  // Requirements: 1.3
  const handleNavClick = useCallback(() => {
    playUIClick();
  }, [playUIClick]);

  const handleNavHover = useCallback(() => {
    playUIHover();
  }, [playUIHover]);

  const handleExport = useCallback(() => {
    playUIClick();
    setIsExportDialogOpen(true);
  }, [playUIClick]);

  const handleLogout = useCallback(async () => {
    try {
      playUIClick();
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  }, [playUIClick, logout, navigate]);

  const handleSettingsClick = useCallback(() => {
    playUIClick();
    setIsSettingsOpen(true);
  }, [playUIClick]);

  const handleSettingsClose = useCallback(() => {
    playUIClick();
    setIsSettingsOpen(false);
  }, [playUIClick]);

  const handleQuickCaptureClick = useCallback(() => {
    playUIClick();
    setIsQuickCaptureOpen(true);
  }, [playUIClick]);

  const handleQuickCaptureClose = useCallback(() => {
    setIsQuickCaptureOpen(false);
  }, []);

  const handleExportDialogClose = useCallback(() => {
    setIsExportDialogOpen(false);
  }, []);

  // Register navigation shortcuts
  useEffect(() => {
    navItems.forEach((item) => {
      registerShortcut(
        {
          id: item.shortcutId,
          action: `navigate-${item.path.slice(1)}`,
          keys: [], // Keys are defined in DEFAULT_SHORTCUTS
          description: `Navigate to ${item.label}`,
          category: 'navigation',
          customizable: true,
        },
        () => {
          navigate(item.path);
          playUIClick();
        }
      );
    });

    // Register quick note shortcut (Ctrl+K)
    // Requirement: 13.1
    registerShortcut(
      {
        id: 'quick-capture',
        action: 'open-quick-capture',
        keys: [], // Keys are defined in DEFAULT_SHORTCUTS
        description: 'Open quick note',
        category: 'actions',
        customizable: true,
      },
      () => {
        setIsQuickCaptureOpen(true);
        playUIClick();
      }
    );

    return () => {
      navItems.forEach((item) => {
        unregisterShortcut(item.shortcutId);
      });
      unregisterShortcut('quick-capture');
    };
  }, [navigate, playUIClick, registerShortcut, unregisterShortcut]);

  if (sidebarMode === 'hidden') {
    return null;
  }

  return (
    <>
      <nav className={`${styles.navigation} ${sidebarMode === 'collapsed' ? styles.collapsed : ''}`}>
        <button 
          className={styles.toggleButton}
          onClick={toggleSidebar}
          onMouseEnter={handleNavHover}
          title={
            sidebarMode === 'expanded' ? 'Collapse to icons' : 
            sidebarMode === 'collapsed' ? 'Hide sidebar' : 
            'Expand sidebar'
          }
          aria-label={
            sidebarMode === 'expanded' ? 'Collapse to icons' : 
            sidebarMode === 'collapsed' ? 'Hide sidebar' : 
            'Expand sidebar'
          }
        >
          {sidebarMode === 'expanded' ? '«' : sidebarMode === 'collapsed' ? '«' : '»'}
        </button>
        <Link 
          to="/" 
          className={styles.navHeader}
          onClick={handleNavClick}
          onMouseEnter={handleNavHover}
          title="Return to the forest entrance"
          aria-label="Return to the forest entrance"
        >
          <div className={styles.forestIcon} aria-hidden="true">🌲</div>
          <h1 className={styles.title}>The Dark Forest</h1>
          <p className={styles.subtitle}>Choose Your Path</p>
        </Link>
        
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li 
              key={item.path} 
              className={`${styles.navItem} ${(location.pathname === item.path || (item.path === '/achievements' && location.pathname === '/streaks')) ? styles.active : ''}`}
            >
              <Link 
                to={item.path} 
                className={styles.navLink}
                onClick={handleNavClick}
                onMouseEnter={handleNavHover}
                aria-label={`${item.label} - ${item.description}`}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                <div className={styles.navContent}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className={styles.navFooter}>
          {/* Sync Status Indicator - Requirements: 17.7 */}
          <SyncStatusIndicator />
          
          {/* Quick Note Button - Compact icon-only design */}
          <button 
            className={styles.quickNoteButton}
            onClick={handleQuickCaptureClick}
            onMouseEnter={handleNavHover}
            title="Quick Note (Ctrl+K)"
            aria-label="Quick Note (Ctrl+K)"
          >
            <span className={styles.quickNoteIcon} aria-hidden="true">📝</span>
            {sidebarMode === 'expanded' && <span className={styles.quickNoteLabel}>Quick Note</span>}
          </button>
          
          <button 
            className={styles.settingsButton}
            onClick={handleSettingsClick}
            onMouseEnter={handleNavHover}
            title="Realm settings"
            aria-label="Open settings"
          >
            <span className={styles.settingsIcon} aria-hidden="true">⚙️</span>
            <span className={styles.settingsLabel}>Settings</span>
          </button>
          
          <button 
            className={styles.exportButton}
            onClick={handleExport}
            onMouseEnter={handleNavHover}
            title="Preserve your journey"
            aria-label="Export data"
          >
            <span className={styles.exportIcon} aria-hidden="true">📜</span>
            <span className={styles.exportLabel}>Save Journey</span>
          </button>
          
          {user && (
            <button 
              className={styles.logoutButton}
              onClick={handleLogout}
              onMouseEnter={handleNavHover}
              title="Leave the realm"
              aria-label="Logout"
            >
              <span className={styles.logoutIcon} aria-hidden="true">🚪</span>
              <span className={styles.logoutLabel}>Depart</span>
            </button>
          )}
          
          <div className={styles.ornament} aria-hidden="true">🍂</div>
        </div>
      </nav>
      
      {/* Modals rendered outside nav to avoid z-index/positioning constraints */}
      <SettingsModal isOpen={isSettingsOpen} onClose={handleSettingsClose} />
      <ExportDialog 
        isOpen={isExportDialogOpen} 
        onClose={handleExportDialogClose}
        notes={notes}
        tasks={tasks}
        settings={settings}
      />
      <QuickCapture isOpen={isQuickCaptureOpen} onClose={handleQuickCaptureClose} />
    </>
  );
};

export default Navigation;
