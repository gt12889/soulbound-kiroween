/**
 * ExportDialog component for exporting user data
 * Provides format selection, date range filtering, and data type selection
 * Requirements: 7.5
 */

import { useState } from 'react';
import { exportService, type ExportFormat, type ExportOptions } from '../../services/exportService';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { Note, Task, AppSettings, TarotReading, PomodoroSession } from '../../types';
import styles from './ExportDialog.module.css';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  tasks: Task[];
  settings: AppSettings;
  tarotReadings?: TarotReading[];
  pomodoroSessions?: PomodoroSession[];
}

export function ExportDialog({
  isOpen,
  onClose,
  notes,
  tasks,
  settings,
  tarotReadings = [],
  pomodoroSessions = [],
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeSettings, setIncludeSettings] = useState(true);
  const [includeTarotReadings, setIncludeTarotReadings] = useState(true);
  const [includePomodoroSessions, setIncludePomodoroSessions] = useState(true);
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [encrypt, setEncrypt] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormat('json');
    setIncludeNotes(true);
    setIncludeTasks(true);
    setIncludeSettings(true);
    setIncludeTarotReadings(true);
    setIncludePomodoroSessions(true);
    setUseDateRange(false);
    setStartDate('');
    setEndDate('');
    setEncrypt(false);
    setEncryptionPassword('');
    setError(null);
    onClose();
  };

  // Focus trap for modal - Requirements: 5.5, 5.6
  const dialogRef = useFocusTrap({
    isActive: isOpen,
    onEscape: handleClose,
    restoreFocus: true,
  });

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);

    try {
      // Validate encryption password if encryption is enabled
      if (encrypt && !encryptionPassword) {
        throw new Error('Please enter an encryption password');
      }

      // Validate date range if enabled
      if (useDateRange) {
        if (!startDate || !endDate) {
          throw new Error('Please select both start and end dates');
        }
        if (new Date(startDate) > new Date(endDate)) {
          throw new Error('Start date must be before end date');
        }
      }

      // Build export options
      const options: ExportOptions = {
        format,
        includeNotes,
        includeTasks,
        includeSettings,
        includeTarotReadings,
        includePomodoroSessions,
        encrypt,
        encryptionPassword: encrypt ? encryptionPassword : undefined,
      };

      // Add date range if enabled
      if (useDateRange && startDate && endDate) {
        options.dateRange = {
          start: new Date(startDate),
          end: new Date(endDate),
        };
      }

      // Perform export
      exportService.exportAndDownload(
        notes,
        tasks,
        settings,
        tarotReadings,
        pomodoroSessions,
        options
      );

      // Show success animation briefly before closing
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate total items to export
  const getTotalItems = () => {
    let total = 0;
    if (includeNotes) total += notes.length;
    if (includeTasks) total += tasks.length;
    if (includeTarotReadings) total += tarotReadings.length;
    if (includePomodoroSessions) total += pomodoroSessions.length;
    return total;
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} ref={dialogRef}>
        <div className={styles.header}>
          <h2 className={styles.title}>Export Data</h2>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Format Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Export Format</h3>
            <div className={styles.formatOptions}>
              <label className={`${styles.formatOption} ${format === 'json' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  className={styles.radioInput}
                />
                <div className={styles.formatContent}>
                  <div className={styles.formatIcon}>📄</div>
                  <div className={styles.formatInfo}>
                    <div className={styles.formatName}>JSON</div>
                    <div className={styles.formatDescription}>
                      Complete data with full structure
                    </div>
                  </div>
                </div>
              </label>

              <label className={`${styles.formatOption} ${format === 'markdown' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="markdown"
                  checked={format === 'markdown'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  className={styles.radioInput}
                />
                <div className={styles.formatContent}>
                  <div className={styles.formatIcon}>📝</div>
                  <div className={styles.formatInfo}>
                    <div className={styles.formatName}>Markdown</div>
                    <div className={styles.formatDescription}>
                      Human-readable formatted text
                    </div>
                  </div>
                </div>
              </label>

              <label className={`${styles.formatOption} ${format === 'csv' ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  className={styles.radioInput}
                />
                <div className={styles.formatContent}>
                  <div className={styles.formatIcon}>📊</div>
                  <div className={styles.formatInfo}>
                    <div className={styles.formatName}>CSV</div>
                    <div className={styles.formatDescription}>
                      Spreadsheet-compatible format
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Type Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Data to Export</h3>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Notes <span className={styles.count}>({notes.length})</span>
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeTasks}
                  onChange={(e) => setIncludeTasks(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Tasks <span className={styles.count}>({tasks.length})</span>
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeSettings}
                  onChange={(e) => setIncludeSettings(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Settings</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeTarotReadings}
                  onChange={(e) => setIncludeTarotReadings(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Tarot Readings <span className={styles.count}>({tarotReadings.length})</span>
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includePomodoroSessions}
                  onChange={(e) => setIncludePomodoroSessions(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Pomodoro Sessions <span className={styles.count}>({pomodoroSessions.length})</span>
                </span>
              </label>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className={styles.section}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useDateRange}
                onChange={(e) => setUseDateRange(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Filter by Date Range</span>
            </label>

            {useDateRange && (
              <div className={styles.dateRange}>
                <div className={styles.dateInput}>
                  <label className={styles.dateLabel}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.dateField}
                  />
                </div>
                <div className={styles.dateInput}>
                  <label className={styles.dateLabel}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={styles.dateField}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Encryption Option */}
          <div className={styles.section}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Encrypt Export</span>
            </label>

            {encrypt && (
              <div className={styles.encryptionSection}>
                <label className={styles.passwordLabel}>
                  Encryption Password
                  <input
                    type="password"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                    placeholder="Enter password"
                    className={styles.passwordInput}
                  />
                </label>
                <p className={styles.encryptionNote}>
                  ⚠️ Remember this password - you'll need it to decrypt the file
                </p>
              </div>
            )}
          </div>

          {/* Export Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Items:</span>
              <span className={styles.summaryValue}>{getTotalItems()}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Format:</span>
              <span className={styles.summaryValue}>{format.toUpperCase()}</span>
            </div>
            {encrypt && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Encryption:</span>
                <span className={styles.summaryValue}>Enabled</span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.error}>
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={handleClose} disabled={isExporting}>
              Cancel
            </button>
            <button
              className={`${styles.exportButton} ${isExporting ? styles.exporting : ''}`}
              onClick={handleExport}
              disabled={isExporting || getTotalItems() === 0}
            >
              {isExporting ? (
                <>
                  <span className={styles.exportingSpinner}></span>
                  Exporting...
                </>
              ) : (
                <>
                  <span className={styles.exportIcon}>⬇️</span>
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
