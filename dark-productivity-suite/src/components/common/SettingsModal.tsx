import React, { useState } from 'react';
import ThemeSelector from './ThemeSelector';
import AudioController from './AudioController';
import { ImportDialog } from '../import-export/ImportDialog';
import { ExportDialog } from '../import-export/ExportDialog';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useNotes } from '../../contexts/NotesContext';
import { useTasks } from '../../contexts/TasksContext';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useKeyboard } from '../../contexts/KeyboardContext';
import type { ImportData } from '../../services/importService';
import styles from './SettingsModal.module.css';

/**
 * SettingsPanel Component (formerly SettingsModal)
 * Tabbed settings interface with account, appearance, keyboard shortcuts, audio, and data management
 * Requirements: 9.4, 9.5, 10.5, 18.6
 */

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'account' | 'appearance' | 'keyboard' | 'audio' | 'data';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { notes, importNotes } = useNotes();
  const { tasks, importTasks } = useTasks();
  const { settings } = useApp();
  const { user, logout } = useAuth();
  const { setShowShortcutsPanel } = useKeyboard();
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      setIsLoggingOut(true);
      try {
        await logout();
        onClose();
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to log out. Please try again.');
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  const handleImport = (data: ImportData, mergeStrategy: 'replace' | 'merge') => {
    try {
      let notesImported = 0;
      let tasksImported = 0;
      
      // Import notes
      if (data.notes && data.notes.length > 0) {
        importNotes(data.notes, mergeStrategy);
        notesImported = data.notes.length;
      }
      
      // Import tasks
      if (data.tasks && data.tasks.length > 0) {
        importTasks(data.tasks, mergeStrategy);
        tasksImported = data.tasks.length;
      }
      
      // Build success message
      const totalItems = notesImported + tasksImported;
      let message = `Successfully imported ${totalItems} item(s)`;
      
      if (mergeStrategy === 'merge') {
        message += ' (duplicates were skipped)';
      } else {
        message += ' (existing data was replaced)';
      }
      
      const details: string[] = [];
      if (notesImported > 0) {
        details.push(`${notesImported} note(s)`);
      }
      if (tasksImported > 0) {
        details.push(`${tasksImported} task(s)`);
      }
      
      if (details.length > 0) {
        message += ': ' + details.join(', ');
      }
      
      // Show success message
      setImportMessage({ type: 'success', text: message });
      
      // Close import dialog
      setIsImportDialogOpen(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setImportMessage(null), 5000);
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportMessage({ 
        type: 'error', 
        text: `Failed to import data: ${errorMessage}. Please check the file format and try again.` 
      });
      
      // Clear error message after 7 seconds
      setTimeout(() => setImportMessage(null), 7000);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Account Settings</h3>
            {user ? (
              <div className={styles.accountInfo}>
                <div className={styles.profileSection}>
                  <div className={styles.profileIcon}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className={styles.profileImage} />
                    ) : (
                      <div className={styles.profilePlaceholder}>
                        {user.email?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className={styles.profileDetails}>
                    <p className={styles.profileEmail}>{user.email}</p>
                    {user.displayName && <p className={styles.profileName}>{user.displayName}</p>}
                    <p className={styles.profileProvider}>
                      Signed in with {user.provider === 'email' ? 'Email' : user.provider}
                    </p>
                  </div>
                </div>
                <button 
                  className={styles.logoutButton} 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
              </div>
            ) : (
              <p className={styles.notLoggedIn}>Not logged in</p>
            )}
          </section>
        );

      case 'appearance':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            <ThemeSelector />
          </section>
        );

      case 'keyboard':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Keyboard Shortcuts</h3>
            <p className={styles.sectionDescription}>
              Customize keyboard shortcuts to match your workflow. Click the button below to view and edit all shortcuts.
            </p>
            <button 
              className={styles.actionButton}
              onClick={() => {
                setShowShortcutsPanel(true);
                onClose();
              }}
            >
              <span className={styles.actionIcon}>⌨️</span>
              <span className={styles.actionText}>Manage Keyboard Shortcuts</span>
            </button>
          </section>
        );

      case 'audio':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Audio Settings</h3>
            <p className={styles.sectionDescription}>
              Control ambient sounds and audio effects throughout the application.
            </p>
            <div className={styles.audioSection}>
              <AudioController />
            </div>
          </section>
        );

      case 'data':
        return (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Data Management</h3>
            <div className={styles.syncSection}>
              <h4 className={styles.subsectionTitle}>Cloud Sync</h4>
              <SyncStatusIndicator />
            </div>
            <div className={styles.dataActions}>
              <button className={styles.actionButton} onClick={handleExport}>
                <span className={styles.actionIcon}>📥</span>
                <span className={styles.actionText}>Export Data</span>
              </button>
              <button className={styles.actionButton} onClick={() => setIsImportDialogOpen(true)}>
                <span className={styles.actionIcon}>📤</span>
                <span className={styles.actionText}>Import Data</span>
              </button>
            </div>
            <p className={styles.dataDescription}>
              Export your notes and tasks to a JSON file for backup, or import data from a previous export.
            </p>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Realm Settings</h2>
            <button className={styles.closeButton} onClick={onClose} title="Close settings">
              ✕
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'account' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <span className={styles.tabIcon}>👤</span>
              <span className={styles.tabLabel}>Account</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'appearance' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className={styles.tabIcon}>🎨</span>
              <span className={styles.tabLabel}>Appearance</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'keyboard' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('keyboard')}
            >
              <span className={styles.tabIcon}>⌨️</span>
              <span className={styles.tabLabel}>Shortcuts</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'audio' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('audio')}
            >
              <span className={styles.tabIcon}>🔊</span>
              <span className={styles.tabLabel}>Audio</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'data' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('data')}
            >
              <span className={styles.tabIcon}>💾</span>
              <span className={styles.tabLabel}>Data</span>
            </button>
          </div>
          
          <div className={styles.modalBody}>
            {/* Import Message */}
            {importMessage && (
              <div className={`${styles.importMessage} ${styles[importMessage.type]}`}>
                <span className={styles.messageIcon}>
                  {importMessage.type === 'success' ? '✓' : '⚠'}
                </span>
                <span className={styles.messageText}>{importMessage.text}</span>
                <button 
                  className={styles.messageDismiss} 
                  onClick={() => setImportMessage(null)}
                  aria-label="Dismiss message"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
        existingNotes={notes}
        existingTasks={tasks}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        notes={notes}
        tasks={tasks}
        settings={settings}
        tarotReadings={[]}
        pomodoroSessions={[]}
      />
    </>
  );
};

export default SettingsModal;
