import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio';
import styles from './ForestHub.module.css';

/**
 * Tree section configuration interface
 */
interface TreeSection {
  id: string;
  title: string;
  icon: string;
  route: string;
  description: string;
  left: number;
  width: number;
}

/**
 * Tree sections configuration
 * Positioned at exact viewport coordinates for desktop layout
 */
const TREE_SECTIONS: readonly TreeSection[] = [
  { 
    id: 'tasks', 
    title: 'Task Graveyard', 
    icon: '🪦', 
    route: '/graveyard-dashboard', 
    description: 'Manage your dark tasks', 
    left: 100, 
    width: 210 
  },
  { 
    id: 'notes', 
    title: 'Necronomicon', 
    icon: '📖', 
    route: '/necronomicon-notes', 
    description: 'Ancient knowledge vault', 
    left: 310, 
    width: 220 
  },
  { 
    id: 'writer', 
    title: 'Ghost Writer', 
    icon: '👻', 
    route: '/ghost-writer', 
    description: 'AI writing companion', 
    left: 530, 
    width: 220 
  },
  { 
    id: 'tarot', 
    title: 'Terminal Tarot', 
    icon: '🔮', 
    route: '/terminal-tarot', 
    description: 'Divine guidance', 
    left: 750, 
    width: 210 
  },
] as const;

/**
 * ForestHub Component
 * 
 * Interactive landing page displaying the four main modules as clickable tree sections.
 * Features hover effects, audio feedback, and responsive layout.
 * 
 * Requirements: 6.1, 6.3, 6.4
 */
const ForestHub: React.FC = () => {
  const navigate = useNavigate();
  const { playUIClick, playUIHover } = useAudio();

  /**
   * Handle section click with navigation and audio feedback
   */
  const handleSectionClick = useCallback((route: string) => {
    playUIClick();
    navigate(route);
  }, [navigate, playUIClick]);

  /**
   * Handle keyboard navigation for accessibility
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent, route: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSectionClick(route);
    }
  }, [handleSectionClick]);

  return (
    <div className={styles.forestHub}>
      <div className={styles.sectionsContainer}>
        {TREE_SECTIONS.map((section) => (
          <div
            key={section.id}
            className={styles.section}
            style={{
              left: `${section.left}px`,
              width: `${section.width}px`,
            }}
            onClick={() => handleSectionClick(section.route)}
            onMouseEnter={playUIHover}
            onKeyDown={(e) => handleKeyDown(e, section.route)}
            role="button"
            tabIndex={0}
            aria-label={`Navigate to ${section.title}: ${section.description}`}
          >
            <div className={styles.iconHint}>
              <div className={styles.sectionIcon} aria-hidden="true">
                {section.icon}
              </div>
              <div className={styles.sectionTitle}>
                {section.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForestHub;
