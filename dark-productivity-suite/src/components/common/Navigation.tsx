import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio';
import { useNotes } from '../../contexts/NotesContext';
import { useTasks } from '../../contexts/TasksContext';
import { useApp } from '../../contexts/AppContext';
import { exportService } from '../../services/exportService';
import styles from './Navigation.module.css';

/**
 * Navigation component with UI interaction sounds and data export
 * Requirements: 6.1, 6.3, 7.5, 8.4
 */
const Navigation: React.FC = () => {
  const location = useLocation();
  const { playUIClick, playUIHover } = useAudio();
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { settings } = useApp();

  const navItems = [
    { path: '/terminal-tarot', label: 'Terminal Tarot', icon: '🔮', description: 'Divine your code' },
    { path: '/ghost-writer', label: 'Ghost Writer', icon: '👻', description: 'Spectral suggestions' },
    { path: '/necronomicon-notes', label: 'Necronomicon Notes', icon: '📖', description: 'Ancient wisdom' },
    { path: '/graveyard-dashboard', label: 'Graveyard Dashboard', icon: '⚰️', description: 'Rest your tasks' },
  ];

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

  return (
    <nav className={styles.navigation}>
      <div className={styles.navHeader}>
        <h1 className={styles.title}>Dark Productivity</h1>
        <p className={styles.subtitle}>Suite</p>
      </div>
      
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
          title="Export all data"
        >
          <span className={styles.exportIcon}>💾</span>
          <span className={styles.exportLabel}>Export Data</span>
        </button>
        <div className={styles.ornament}>✦</div>
      </div>
    </nav>
  );
};

export default Navigation;
