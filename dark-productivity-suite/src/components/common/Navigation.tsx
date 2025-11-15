import React, { useEffect, useState } from 'react';
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
 * Requirements: 6.1, 6.3, 7.5, 8.4, 9.1, 10.5, 13.1, 17.7, 18.6
 */
const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { playUIClick, playUIHover } = useAudio();
  const { registerShortcut, unregisterShortcut } = useKeyboard();
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { settings } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);

  const navItems = [
    { path: '/necronomicon-notes', label: 'Ancient Library', icon: '📖', description: 'Deep in the woods', shortcutId: 'nav-necronomicon-notes' },
    { path: '/ghost-writer', label: 'Haunted Study', icon: '✍️', description: 'Spectral guidance', shortcutId: 'nav-ghost-writer' },
    { path: '/graveyard-dashboard', label: 'Forgotten Graveyard', icon: '⚰️', description: 'Where tasks rest', shortcutId: 'nav-graveyard-dashboard' },
    { path: '/terminal-tarot', label: 'Mystic Clearing', icon: '🔮', description: 'Seek guidance', shortcutId: 'nav-terminal-tarot' },
  ];

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

    // Register quick capture shortcut (Ctrl+K)
    // Requirement: 13.1
    registerShortcut(
      {
        id: 'quick-capture',
        action: 'open-quick-capture',
        keys: [], // Keys are defined in DEFAULT_SHORTCUTS
        description: 'Open quick capture',
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

  const handleNavClick = () => {
    playUIClick();
  };

  const handleNavHover = () => {
    playUIHover();
  };

  const handleExport = () => {
    playUIClick();
    setIsExportDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      playUIClick();
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const handleSettingsClick = () => {
    playUIClick();
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    playUIClick();
    setIsSettingsOpen(false);
  };

  const handleQuickCaptureClick = () => {
    playUIClick();
    setIsQuickCaptureOpen(true);
  };

  const handleQuickCaptureClose = () => {
    setIsQuickCaptureOpen(false);
  };

  return (
    <nav className={styles.navigation}>
      <Link 
        to="/" 
        className={styles.navHeader}
        onClick={handleNavClick}
        onMouseEnter={handleNavHover}
        title="Return to the forest entrance"
      >
        <div className={styles.forestIcon}>🌲</div>
        <h1 className={styles.title}>The Dark Forest</h1>
        <p className={styles.subtitle}>Choose Your Path</p>
      </Link>
      
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li 
            key={item.path} 
            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
          >
            <Link 
              to={item.path} 
              className={styles.navLink}
              onClick={handleNavClick}
              onMouseEnter={handleNavHover}
            >
              <span className={styles.navIcon}>{item.icon}</span>
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
        
        {/* Quick Capture Button - Requirements: 13.1 */}
        <button 
          className={styles.quickCaptureButton}
          onClick={handleQuickCaptureClick}
          onMouseEnter={handleNavHover}
          title="Quick capture (Ctrl+K)"
        >
          <span className={styles.quickCaptureIcon}>⚡</span>
          <span className={styles.quickCaptureLabel}>Quick Capture</span>
        </button>
        
        <button 
          className={styles.settingsButton}
          onClick={handleSettingsClick}
          onMouseEnter={handleNavHover}
          title="Realm settings"
        >
          <span className={styles.settingsIcon}>⚙️</span>
          <span className={styles.settingsLabel}>Settings</span>
        </button>
        
        <button 
          className={styles.exportButton}
          onClick={handleExport}
          onMouseEnter={handleNavHover}
          title="Preserve your journey"
        >
          <span className={styles.exportIcon}>📜</span>
          <span className={styles.exportLabel}>Save Journey</span>
        </button>
        
        {user && (
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
            onMouseEnter={handleNavHover}
            title="Leave the realm"
          >
            <span className={styles.logoutIcon}>🚪</span>
            <span className={styles.logoutLabel}>Depart</span>
          </button>
        )}
        
        <div className={styles.ornament}>🍂</div>
      </div>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={handleSettingsClose} />
      <ExportDialog 
        isOpen={isExportDialogOpen} 
        onClose={() => setIsExportDialogOpen(false)}
        notes={notes}
        tasks={tasks}
        settings={settings}
      />
      <QuickCapture isOpen={isQuickCaptureOpen} onClose={handleQuickCaptureClose} />
    </nav>
  );
};

export default Navigation;
