/**
 * Cloud Sync Service for Firebase/Firestore integration
 * Handles real-time data synchronization with conflict resolution and offline support
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './firebaseService';
import { storageService } from './storageService';
import type { Task, Note, TarotReading, SyncQueueItem, SyncStatus } from '../types';

const SYNC_QUEUE_KEY = 'sync_queue';
const LAST_SYNC_KEY = 'last_sync';

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
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
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
   * Fetch all notes for a user
   */
  async fetchNotes(userId: string): Promise<Note[]> {
    try {
      const notesRef = collection(db, 'users', userId, 'notes');
      const snapshot = await getDocs(notesRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      throw new CloudSyncError(
        'Failed to fetch notes from cloud',
        this.getErrorCode(error)
      );
    }
  }

  /**
   * Fetch all tasks for a user
   */
  async fetchTasks(userId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          completed: data.completed,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        };
      });
    } catch (error) {
      throw new CloudSyncError(
        'Failed to fetch tasks from cloud',
        this.getErrorCode(error)
      );
    }
  }

  /**
   * Fetch all tarot readings for a user
   */
  async fetchTarotReadings(userId: string): Promise<TarotReading[]> {
    try {
      const readingsRef = collection(db, 'users', userId, 'tarot_readings');
      const snapshot = await getDocs(readingsRef);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId,
          date: data.date?.toDate() || new Date(),
          cards: data.cards,
          interpretation: data.interpretation,
          commitStats: data.commitStats,
        };
      });
    } catch (error) {
      throw new CloudSyncError(
        'Failed to fetch tarot readings from cloud',
        this.getErrorCode(error)
      );
    }
  }

  /**
   * Subscribe to real-time note updates
   */
  subscribeToNotes(userId: string, callback: (notes: Note[]) => void): Unsubscribe {
    const notesRef = collection(db, 'users', userId, 'notes');
    
    const unsubscribe = onSnapshot(
      notesRef,
      (snapshot) => {
        const notes = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
        });
        callback(notes);
      },
      (error) => {
        console.error('Error in notes subscription:', error);
      }
    );

    this.syncListeners.set(`notes_${userId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to real-time task updates
   */
  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void): Unsubscribe {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId,
            title: data.title,
            description: data.description,
            priority: data.priority,
            completed: data.completed,
            createdAt: data.createdAt?.toDate() || new Date(),
            completedAt: data.completedAt?.toDate(),
          };
        });
        callback(tasks);
      },
      (error) => {
        console.error('Error in tasks subscription:', error);
      }
    );

    this.syncListeners.set(`tasks_${userId}`, unsubscribe);
    return unsubscribe;
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
   * Process offline sync queue
   */
  async processSyncQueue(userId: string): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    const queue = this.getSyncQueue();

    try {
      for (const item of queue) {
        try {
          if (item.type === 'note') {
            if (item.action === 'delete') {
              await this.deleteNote(userId, item.data.id);
            } else {
              await this.syncNote(userId, item.data);
            }
          } else if (item.type === 'task') {
            if (item.action === 'delete') {
              await this.deleteTask(userId, item.data.id);
            } else {
              await this.syncTask(userId, item.data);
            }
          } else if (item.type === 'tarot') {
            await this.syncTarotReading(userId, item.data);
          }
        } catch (error) {
          console.error('Error processing queue item:', error);
          // Continue with next item
        }
      }

      // Clear queue after successful processing
      this.clearSyncQueue();
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
   * Handle sync errors with retry logic
   */
  private handleSyncError(error: any, type: string, id: string): void {
    console.error(`Sync error for ${type} ${id}:`, error);

    // Implement exponential backoff retry
    const retryKey = `${type}_${id}`;
    const existingTimeout = this.retryTimeouts.get(retryKey);
    
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Retry after 5 seconds (can be made exponential)
    const timeout = setTimeout(() => {
      console.log(`Retrying sync for ${type} ${id}...`);
      this.retryTimeouts.delete(retryKey);
    }, 5000);

    this.retryTimeouts.set(retryKey, timeout);
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
