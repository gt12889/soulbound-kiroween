import React, { useEffect, useState } from 'react';
import type { Task } from '../../types';
import styles from './DiggingModal.module.css';

interface DiggingModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * DiggingModal - Displays task details in a parchment-style modal
 * Appears when user "digs up" a tombstone
 */
export const DiggingModal: React.FC<DiggingModalProps> = ({ task, isOpen, onClose }) => {
  const [soilParticles, setSoilParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Create soil particles
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 20,
      }));
      setSoilParticles(particles);

      // Remove particles after animation
      const timer = setTimeout(() => {
        setSoilParticles([]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div className={styles.diggingModal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Soil particles */}
        <div className={styles.soilParticles}>
          {soilParticles.map((particle) => (
            <div
              key={particle.id}
              className={styles.soilParticle}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.id * 0.05}s`,
              }}
            />
          ))}
        </div>

        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className={styles.modalHeader}>{task.title}</h2>

        <div className={styles.modalBody}>
          <p>{task.description || 'No description provided.'}</p>

          <div className={styles.modalMeta}>
            <div>
              <strong>Priority:</strong> {task.priority}
            </div>
            <div>
              <strong>Status:</strong> {task.completed ? 'Completed' : 'Active'}
            </div>
            <div>
              <strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}
            </div>
            {task.completedAt && (
              <div>
                <strong>Completed:</strong> {new Date(task.completedAt).toLocaleDateString()}
              </div>
            )}
            {task.dueDate && (
              <div>
                <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className={styles.modalTags}>
                {task.tags.map((tag) => (
                  <span key={tag} className={styles.modalTag}>
                    ✦ {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



