import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/terminal-tarot', label: 'Terminal Tarot', icon: '🔮', description: 'Divine your code' },
    { path: '/ghost-writer', label: 'Ghost Writer', icon: '👻', description: 'Spectral suggestions' },
    { path: '/necronomicon-notes', label: 'Necronomicon Notes', icon: '📖', description: 'Ancient wisdom' },
    { path: '/graveyard-dashboard', label: 'Graveyard Dashboard', icon: '⚰️', description: 'Rest your tasks' },
  ];

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
            <Link to={item.path} className={styles.navLink}>
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
        <div className={styles.ornament}>✦</div>
      </div>
    </nav>
  );
};

export default Navigation;
