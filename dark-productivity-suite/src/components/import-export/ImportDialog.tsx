/**
 * ImportDialog component for importing user data
 * Provides file upload with drag-and-drop, validation, and preview
 * Requirements: 11.3, 11.4, 11.6
 */

import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { importService, type ImportResult, type ImportData } from '../../services/importService';
import type { Note, Task } from '../../types';
import styles from './ImportDialog.module.css';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportData, mergeStrategy: 'replace' | 'merge') => void;
  existingNotes: Note[];
  existingTasks: Task[];
}

export function ImportDialog({ isOpen, onClose, onImport, existingNotes, existingTasks }: ImportDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<'replace' | 'merge'>('merge');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setImportResult(null);

    try {
      const result = await importService.parseFile(file);
      
      // Detect duplicates if merge strategy is selected
      if (result.success && result.data) {
        const duplicates = importService.detectDuplicates(
          result.data.notes || [],
          existingNotes,
          result.data.tasks || [],
          existingTasks
        );
        
        result.stats.duplicatesSkipped = duplicates.duplicateNotes.length + duplicates.duplicateTasks.length;
        
        // Add warning about duplicates
        if (result.stats.duplicatesSkipped > 0) {
          result.warnings.push(`${result.stats.duplicatesSkipped} duplicate item(s) detected`);
        }
      }
      
      setImportResult(result);
      if (result.success) {
        setShowPreview(true);
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to process file'],
        warnings: [],
        stats: {
          notesImported: 0,
          tasksImported: 0,
          tarotReadingsImported: 0,
          duplicatesSkipped: 0,
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (importResult?.success && importResult.data) {
      onImport(importResult.data, mergeStrategy);
      handleClose();
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setShowPreview(false);
    setMergeStrategy('merge');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Import Data</h2>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.content}>
          {!showPreview ? (
            <>
              {/* File Upload Area */}
              <div
                className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className={styles.uploadIcon}>📁</div>
                <p className={styles.uploadText}>
                  Drag and drop your file here
                </p>
                <p className={styles.uploadSubtext}>or</p>
                <button
                  className={styles.browseButton}
                  onClick={handleBrowseClick}
                  disabled={isProcessing}
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                />
                <p className={styles.supportedFormats}>
                  Supported formats: JSON, TXT
                </p>
              </div>

              {/* Processing State */}
              {isProcessing && (
                <div className={styles.processing}>
                  <div className={styles.spinner}></div>
                  <p>Processing file...</p>
                </div>
              )}

              {/* Errors */}
              {importResult && !importResult.success && (
                <div className={styles.errorSection}>
                  <h3 className={styles.errorTitle}>Import Failed</h3>
                  {importResult.errors.map((error, index) => (
                    <div key={index} className={styles.error}>
                      ⚠️ {error}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Preview Section */}
              <div className={styles.previewSection}>
                <h3 className={styles.previewTitle}>Import Preview</h3>
                
                {/* Stats */}
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Notes:</span>
                    <span className={styles.statValue}>{importResult?.stats.notesImported || 0}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Tasks:</span>
                    <span className={styles.statValue}>{importResult?.stats.tasksImported || 0}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Tarot Readings:</span>
                    <span className={styles.statValue}>{importResult?.stats.tarotReadingsImported || 0}</span>
                  </div>
                  {importResult && importResult.stats.duplicatesSkipped > 0 && (
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Duplicates:</span>
                      <span className={styles.statValue}>{importResult.stats.duplicatesSkipped}</span>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {importResult && importResult.warnings.length > 0 && (
                  <div className={styles.warningSection}>
                    {importResult.warnings.map((warning, index) => (
                      <div key={index} className={styles.warning}>
                        ⚠️ {warning}
                      </div>
                    ))}
                  </div>
                )}

                {/* Data Preview */}
                <div className={styles.dataPreview}>
                  {importResult?.data?.notes && importResult.data.notes.length > 0 && (
                    <div className={styles.previewGroup}>
                      <h4 className={styles.previewGroupTitle}>Notes ({importResult.data.notes.length})</h4>
                      <div className={styles.previewList}>
                        {importResult.data.notes.slice(0, 5).map((note, index) => (
                          <div key={index} className={styles.previewItem}>
                            <div className={styles.previewItemTitle}>{note.title}</div>
                            <div className={styles.previewItemContent}>
                              {note.content.substring(0, 100)}
                              {note.content.length > 100 ? '...' : ''}
                            </div>
                          </div>
                        ))}
                        {importResult.data.notes.length > 5 && (
                          <div className={styles.previewMore}>
                            +{importResult.data.notes.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {importResult?.data?.tasks && importResult.data.tasks.length > 0 && (
                    <div className={styles.previewGroup}>
                      <h4 className={styles.previewGroupTitle}>Tasks ({importResult.data.tasks.length})</h4>
                      <div className={styles.previewList}>
                        {importResult.data.tasks.slice(0, 5).map((task, index) => (
                          <div key={index} className={styles.previewItem}>
                            <div className={styles.previewItemTitle}>{task.title}</div>
                            <div className={styles.previewItemContent}>
                              {task.description.substring(0, 100)}
                              {task.description.length > 100 ? '...' : ''}
                            </div>
                          </div>
                        ))}
                        {importResult.data.tasks.length > 5 && (
                          <div className={styles.previewMore}>
                            +{importResult.data.tasks.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Merge Strategy */}
                <div className={styles.mergeStrategy}>
                  <h4 className={styles.mergeTitle}>Import Strategy</h4>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="mergeStrategy"
                        value="merge"
                        checked={mergeStrategy === 'merge'}
                        onChange={(e) => setMergeStrategy(e.target.value as 'merge')}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioText}>
                        <strong>Merge</strong> - Add imported items to existing data (skip duplicates)
                      </span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="mergeStrategy"
                        value="replace"
                        checked={mergeStrategy === 'replace'}
                        onChange={(e) => setMergeStrategy(e.target.value as 'replace')}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioText}>
                        <strong>Replace</strong> - Replace all existing data with imported data
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button className={styles.cancelButton} onClick={handleClose}>
                  Cancel
                </button>
                <button className={styles.importButton} onClick={handleImport}>
                  Import Data
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
