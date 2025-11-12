import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { useNotes } from '../../contexts/NotesContext';
import { useTasks } from '../../contexts/TasksContext';
import { useApp } from '../../contexts/AppContext';
import { useKeyboard } from '../../contexts/KeyboardContext';
import { exportService } from '../../services/exportService';
import styles from './Navigation.module.css';

/**
 * Navigation component with UI interaction sounds, data export, logout, and keyboard shortcuts
 * Requirements: 6.1, 6.3, 7.5, 8.4, 9.1, 18.6
 */
const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { playUIClick, playUIHover } = useAudio();
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { settings } = useApp();
  const { registerShortcut, unregisterShortcut } = useKeyboard();

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

    return () => {
      navItems.forEach((item) => {
        unregisterShortcut(item.shortcutId);
      });
    };
  }, [navigate, playUIClick, registerShortcut, unregisterShortcut]);

  const handleNavClick = () => {
    playUIClick();
  };

  const handleNavHover = () => {
    playUIHover();
  };

  const handleExport = () => {
    try {
      playUIClick();
      exportService.exportAndDownload(notes, tasks, settings);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
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
    </nav>
  );
};

export default Navigation;
