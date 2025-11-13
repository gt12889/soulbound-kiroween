/**
 * Cloud Sync Service for Firebase/Firestore integration
 * Handles real-time data synchronization with conflict resolution and offline support
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './firebaseService';
import { storageService } from './storageService';
import type { Task, Note, TarotReading, SyncQueueItem } from '../types';

const SYNC_QUEUE_KEY = 'sync_queue';
const LAST_SYNC_KEY = 'last_sync';
const RETRY_DELAY_MS = 5000;
const MAX_RETRY_ATTEMPTS = 3;
const BATCH_SIZE = 10;

export class CloudSyncError extends Error {
  public readonly code: 'NETWORK_ERROR' | 'AUTH_ERROR' | 'CONFLICT' | 'UNKNOWN';

  constructor(message: string, code: 'NETWORK_ERROR' | 'AUTH_ERROR' | 'CONFLICT' | 'UNKNOWN') {
    super(message);
    this.name = 'CloudSyncError';
    this.code = code;
  }
}

class CloudSyncService {
  private syncListeners: Map<string, Unsubscribe> = new Map();
  private retryTimeouts: Map<string, number> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Sync a note to Firestore
   */
  async syncNote(userId: string, note: Note): Promise<void> {
    try {
      const noteRef = doc(db, 'users', userId, 'notes', note.id);
      await setDoc(noteRef, {
        ...note,
        userId,
        createdAt: Timestamp.fromDate(note.createdAt),
        updatedAt: Timestamp.fromDate(note.updatedAt),
        syncedAt: serverTimestamp(),
      });
      // Clear retry state on success
      this.clearRetryState('note', note.id);
    } catch (error) {
      this.handleSyncError(error, 'note', note.id);
      throw error;
    }
  }

  /**
   * Sync a task to Firestore
   */
  async syncTask(userId: string, task: Task): Promise<void> {
    try {
      const taskRef = doc(db, 'users', userId, 'tasks', task.id);
      await setDoc(taskRef, {
        ...task,
        userId,
        createdAt: Timestamp.fromDate(task.createdAt),
        completedAt: task.completedAt ? Timestamp.fromDate(task.completedAt) : null,
        syncedAt: serverTimestamp(),
      });
      // Clear retry state on success
      this.clearRetryState('task', task.id);
    } catch (error) {
      this.handleSyncError(error, 'task', task.id);
      throw error;
    }
  }

  /**
   * Sync a tarot reading to Firestore
   */
  async syncTarotReading(userId: string, reading: TarotReading): Promise<void> {
    try {
      const readingRef = doc(db, 'users', userId, 'tarot_readings', reading.id);
      await setDoc(readingRef, {
        ...reading,
        userId,
        date: Timestamp.fromDate(reading.date),
        syncedAt: serverTimestamp(),
      });
      // Clear retry state on success
      this.clearRetryState('tarot', reading.id);
    } catch (error) {
      this.handleSyncError(error, 'tarot', reading.id);
      throw error;
    }
  }

  /**
   * Delete a note from Firestore
   */
  async deleteNote(userId: string, noteId: string): Promise<void> {
    try {
      const noteRef = doc(db, 'users', userId, 'notes', noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      this.handleSyncError(error, 'note', noteId);
      throw error;
    }
  }

  /**
   * Delete a task from Firestore
   */
  async deleteTask(userId: string, taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, 'users', userId, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      this.handleSyncError(error, 'task', taskId);
      throw error;
    }
  }

  /**
   * Generic fetch method to reduce duplication
   */
  private async fetchCollection<T>(
    userId: string,
    collectionName: string,
    mapper: (docId: string, data: any) => T,
    errorMessage: string
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      return snapshot.docs.map(doc => mapper(doc.id, doc.data()));
    } catch (error) {
      throw new CloudSyncError(errorMessage, this.getErrorCode(error));
    }
  }

  /**
   * Fetch all notes for a user
   */
  async fetchNotes(userId: string): Promise<Note[]> {
    return this.fetchCollection<Note>(
      userId,
      'notes',
      (docId, data) => ({
        id: docId,
        userId,
        title: data.title || '',
        content: data.content || '',
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }),
      'Failed to fetch notes from cloud'
    );
  }

  /**
   * Fetch all tasks for a user
   */
  async fetchTasks(userId: string): Promise<Task[]> {
    return this.fetchCollection<Task>(
      userId,
      'tasks',
      (docId, data) => ({
        id: docId,
        userId,
        title: data.title || '',
        description: data.description || '',
        priority: data.priority || 'medium',
        completed: data.completed || false,
        archived: data.archived || false,
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
        archivedAt: data.archivedAt?.toDate(),
      }),
      'Failed to fetch tasks from cloud'
    );
  }

  /**
   * Fetch all tarot readings for a user
   */
  async fetchTarotReadings(userId: string): Promise<TarotReading[]> {
    return this.fetchCollection<TarotReading>(
      userId,
      'tarot_readings',
      (docId, data) => ({
        id: docId,
        userId,
        date: data.date?.toDate() || new Date(),
        cards: data.cards || [],
        interpretation: data.interpretation || '',
        commitStats: data.commitStats || {
          totalCommits: 0,
          averageCommitsPerDay: 0,
          mostActiveHour: 12,
          sentimentScore: 0,
          topKeywords: [],
        },
      }),
      'Failed to fetch tarot readings from cloud'
    );
  }

  /**
   * Generic subscription method to reduce duplication
   */
  private subscribe<T>(
    userId: string,
    collectionName: string,
    mapper: (docId: string, data: any) => T,
    callback: (items: T[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const collectionRef = collection(db, 'users', userId, collectionName);
    
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const items = snapshot.docs.map(doc => mapper(doc.id, doc.data()));
        callback(items);
      },
      (error) => {
        console.error(`Error in ${collectionName} subscription:`, error);
        if (onError) {
          onError(error);
        }
      }
    );

    this.syncListeners.set(`${collectionName}_${userId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to real-time note updates
   */
  subscribeToNotes(
    userId: string,
    callback: (notes: Note[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return this.subscribe<Note>(
      userId,
      'notes',
      (docId, data) => ({
        id: docId,
        userId,
        title: data.title || '',
        content: data.content || '',
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }),
      callback,
      onError
    );
  }

  /**
   * Subscribe to real-time task updates
   */
  subscribeToTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    return this.subscribe<Task>(
      userId,
      'tasks',
      (docId, data) => ({
        id: docId,
        userId,
        title: data.title || '',
        description: data.description || '',
        priority: data.priority || 'medium',
        completed: data.completed || false,
        archived: data.archived || false,
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
        archivedAt: data.archivedAt?.toDate(),
      }),
      callback,
      onError
    );
  }

  /**
   * Unsubscribe from all real-time updates
   */
  unsubscribeAll(): void {
    this.syncListeners.forEach(unsubscribe => unsubscribe());
    this.syncListeners.clear();
  }

  /**
   * Add item to offline sync queue
   */
  private addToSyncQueue(item: SyncQueueItem): void {
    const queue = storageService.get<SyncQueueItem[]>(SYNC_QUEUE_KEY) || [];
    queue.push(item);
    storageService.set(SYNC_QUEUE_KEY, queue);
  }

  /**
   * Get sync queue
   */
  getSyncQueue(): SyncQueueItem[] {
    return storageService.get<SyncQueueItem[]>(SYNC_QUEUE_KEY) || [];
  }

  /**
   * Clear sync queue
   */
  private clearSyncQueue(): void {
    storageService.set(SYNC_QUEUE_KEY, []);
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncItem(userId: string, item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'note':
        if (item.action === 'delete') {
          await this.deleteNote(userId, item.data.id);
        } else {
          await this.syncNote(userId, item.data);
        }
        break;
      
      case 'task':
        if (item.action === 'delete') {
          await this.deleteTask(userId, item.data.id);
        } else {
          await this.syncTask(userId, item.data);
        }
        break;
      
      case 'tarot':
        await this.syncTarotReading(userId, item.data);
        break;
      
      default:
        console.warn(`Unknown sync item type: ${(item as any).type}`);
    }
  }

  /**
   * Process offline sync queue with batching
   */
  async processSyncQueue(userId: string): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    const queue = this.getSyncQueue();
    const failedItems: SyncQueueItem[] = [];

    try {
      // Process in batches to avoid overwhelming the server
      for (let i = 0; i < queue.length; i += BATCH_SIZE) {
        const batch = queue.slice(i, i + BATCH_SIZE);
        
        // Process batch items in parallel
        const results = await Promise.allSettled(
          batch.map(item => this.processSyncItem(userId, item))
        );

        // Collect failed items for retry
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error('Error processing queue item:', result.reason);
            failedItems.push(batch[index]);
          }
        });
      }

      // Update queue with only failed items
      if (failedItems.length > 0) {
        console.warn(`${failedItems.length} items failed to sync, will retry later`);
        storageService.set(SYNC_QUEUE_KEY, failedItems);
      } else {
        this.clearSyncQueue();
      }
      
      this.updateLastSyncTime();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Queue note for sync (used when offline)
   */
  queueNoteSync(note: Note, action: 'create' | 'update' | 'delete'): void {
    this.addToSyncQueue({
      id: `note_${note.id}_${Date.now()}`,
      type: 'note',
      action,
      data: note,
      timestamp: new Date(),
    });
  }

  /**
   * Queue task for sync (used when offline)
   */
  queueTaskSync(task: Task, action: 'create' | 'update' | 'delete'): void {
    this.addToSyncQueue({
      id: `task_${task.id}_${Date.now()}`,
      type: 'task',
      action,
      data: task,
      timestamp: new Date(),
    });
  }

  /**
   * Queue tarot reading for sync (used when offline)
   */
  queueTarotSync(reading: TarotReading, action: 'create' | 'update'): void {
    this.addToSyncQueue({
      id: `tarot_${reading.id}_${Date.now()}`,
      type: 'tarot',
      action,
      data: reading,
      timestamp: new Date(),
    });
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    console.log('Connection restored, processing sync queue...');
    // Note: processSyncQueue needs userId, will be called by hook
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('Connection lost, queuing changes for later sync...');
  }

  /**
   * Check if online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return storageService.get<Date>(LAST_SYNC_KEY);
  }

  /**
   * Update last sync time
   */
  private updateLastSyncTime(): void {
    storageService.set(LAST_SYNC_KEY, new Date());
  }

  /**
   * Handle sync errors with exponential backoff retry logic
   */
  private handleSyncError(error: any, type: string, id: string): void {
    console.error(`Sync error for ${type} ${id}:`, error);

    const retryKey = `${type}_${id}`;
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;

    // Check if max retries exceeded
    if (currentAttempts >= MAX_RETRY_ATTEMPTS) {
      console.error(`Max retry attempts (${MAX_RETRY_ATTEMPTS}) exceeded for ${type} ${id}`);
      this.retryAttempts.delete(retryKey);
      this.retryTimeouts.delete(retryKey);
      return;
    }

    // Clear existing timeout if any
    const existingTimeout = this.retryTimeouts.get(retryKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Calculate exponential backoff delay: 5s, 10s, 20s
    const delay = RETRY_DELAY_MS * Math.pow(2, currentAttempts);
    
    const timeout = setTimeout(() => {
      console.log(`Retry attempt ${currentAttempts + 1} for ${type} ${id}...`);
      this.retryAttempts.set(retryKey, currentAttempts + 1);
      this.retryTimeouts.delete(retryKey);
      // Note: Actual retry logic should be implemented by the caller
    }, delay);

    this.retryTimeouts.set(retryKey, timeout);
  }

  /**
   * Clear retry state for a specific item
   */
  private clearRetryState(type: string, id: string): void {
    const retryKey = `${type}_${id}`;
    const timeout = this.retryTimeouts.get(retryKey);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(retryKey);
    }
    this.retryAttempts.delete(retryKey);
  }

  /**
   * Cleanup all retry timeouts (call on service destruction)
   */
  cleanup(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    this.retryAttempts.clear();
    this.unsubscribeAll();
  }

  /**
   * Get error code from Firebase error
   */
  private getErrorCode(error: any): 'NETWORK_ERROR' | 'AUTH_ERROR' | 'CONFLICT' | 'UNKNOWN' {
    if (error?.code === 'unavailable' || error?.code === 'failed-precondition') {
      return 'NETWORK_ERROR';
    }
    if (error?.code === 'permission-denied' || error?.code === 'unauthenticated') {
      return 'AUTH_ERROR';
    }
    return 'UNKNOWN';
  }

  /**
   * Resolve conflicts using last-write-wins strategy
   */
  async resolveConflict<T extends { updatedAt?: Date }>(
    local: T,
    remote: T
  ): Promise<T> {
    // Last-write-wins: compare timestamps
    if (!local.updatedAt) return remote;
    if (!remote.updatedAt) return local;
    
    return local.updatedAt > remote.updatedAt ? local : remote;
  }
}

// Export singleton instance
export const cloudSyncService = new CloudSyncService();
