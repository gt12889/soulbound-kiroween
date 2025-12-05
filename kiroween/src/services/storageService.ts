/**
 * Storage service for managing LocalStorage operations
 * Handles data persistence with error handling for quota exceeded scenarios
 * Supports encryption for sensitive data
 * Works with both local and cloud storage (hybrid mode)
 * Requirements: 17.1, 17.4
 */

export type StorageMode = 'local' | 'cloud' | 'hybrid';

export class StorageError extends Error {
  public readonly code: 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'UNKNOWN';
  
  constructor(message: string, code: 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'UNKNOWN') {
    super(message);
    this.name = 'StorageError';
    this.code = code;
  }
}

class StorageService {
  private readonly prefix = 'darkprod_';
  private encryptionEnabled = false;
  private cloudSyncEnabled = false;
  private migrationCompleted = false;
  private storageMode: StorageMode = 'local';
  private encryptionKey: CryptoKey | null = null;

  /**
   * Build storage key with optional user ID for data isolation
   * @param key Storage key (without prefix)
   * @param userId Optional user ID for user-specific storage
   * @returns Full storage key with prefix and optional user scope
   */
  private buildKey(key: string, userId?: string): string {
    if (userId) {
      return `${this.prefix}user_${userId}_${key}`;
    }
    return `${this.prefix}${key}`;
  }

  /**
   * Get data from LocalStorage
   * @param key Storage key (without prefix)
   * @param userId Optional user ID for user-scoped storage
   * @returns Parsed data or null if not found
   */
  get<T>(key: string, userId?: string): T | null {
    try {
      const fullKey = this.buildKey(key, userId);
      const item = localStorage.getItem(fullKey);
      
      if (item === null) {
        return null;
      }

      return this.deserialize<T>(item);
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      throw new StorageError(
        `Failed to read data from storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PARSE_ERROR'
      );
    }
  }

  /**
   * Set data in LocalStorage
   * @param key Storage key (without prefix)
   * @param value Data to store
   * @param userId Optional user ID for user-scoped storage
   */
  set<T>(key: string, value: T, userId?: string): void {
    try {
      const fullKey = this.buildKey(key, userId);
      const serialized = this.serialize(value);
      localStorage.setItem(fullKey, serialized);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        console.error('LocalStorage quota exceeded');
        throw new StorageError(
          'Storage quota exceeded. Please export your data and clear old entries.',
          'QUOTA_EXCEEDED'
        );
      }
      
      console.error(`Error writing to storage (${key}):`, error);
      throw new StorageError(
        `Failed to write data to storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN'
      );
    }
  }

  /**
   * Remove data from LocalStorage
   * @param key Storage key (without prefix)
   * @param userId Optional user ID for user-scoped storage
   */
  remove(key: string, userId?: string): void {
    try {
      const fullKey = this.buildKey(key, userId);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Error removing from storage (${key}):`, error);
      throw new StorageError(
        `Failed to remove data from storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN'
      );
    }
  }

  /**
   * Clear all application data from LocalStorage
   * @param userId Optional user ID to clear only that user's data
   */
  clear(userId?: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (userId) {
          // Clear only user-specific keys
          if (key.startsWith(`${this.prefix}user_${userId}_`)) {
            localStorage.removeItem(key);
          }
        } else {
          // Clear all app keys
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new StorageError(
        `Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN'
      );
    }
  }

  /**
   * Serialize data for storage
   * Handles Date objects and other special types
   */
  private serialize<T>(value: T): string {
    return JSON.stringify(value, (_key, val) => {
      // Convert Date objects to ISO strings
      if (val instanceof Date) {
        return { __type: 'Date', value: val.toISOString() };
      }
      return val;
    });
  }

  /**
   * Deserialize data from storage
   * Restores Date objects and other special types
   */
  private deserialize<T>(value: string): T {
    return JSON.parse(value, (_key, val) => {
      // Restore Date objects
      if (val && typeof val === 'object' && val.__type === 'Date') {
        return new Date(val.value);
      }
      return val;
    });
  }

  /**
   * Check if error is a quota exceeded error
   */
  private isQuotaExceededError(error: unknown): boolean {
    if (error instanceof DOMException) {
      // Check for quota exceeded error codes
      return (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      );
    }
    return false;
  }

  /**
   * Enable encryption for cloud storage
   * Note: This is a basic implementation. For production, use a proper encryption library
   */
  enableEncryption(enabled: boolean): void {
    this.encryptionEnabled = enabled;
  }

  /**
   * Enable cloud sync mode
   * When enabled, storage service works in hybrid mode (local + cloud)
   * Requirements: 17.1
   */
  enableCloudSync(enabled: boolean): void {
    this.cloudSyncEnabled = enabled;
    if (enabled) {
      this.storageMode = 'hybrid';
    } else {
      this.storageMode = 'local';
    }
  }

  /**
   * Check if cloud sync is enabled
   */
  isCloudSyncEnabled(): boolean {
    return this.cloudSyncEnabled;
  }

  /**
   * Set storage mode (local, cloud, or hybrid)
   * Requirements: 17.1
   */
  setStorageMode(mode: StorageMode): void {
    this.storageMode = mode;
    this.cloudSyncEnabled = mode === 'cloud' || mode === 'hybrid';
  }

  /**
   * Get current storage mode
   */
  getStorageMode(): StorageMode {
    return this.storageMode;
  }

  /**
   * Initialize encryption with a password
   * Requirements: 17.4
   */
  async initializeEncryption(password: string): Promise<void> {
    try {
      this.encryptionKey = await this.generateEncryptionKey(password);
      this.encryptionEnabled = true;
      console.log('Encryption initialized successfully');
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw new StorageError(
        'Failed to initialize encryption',
        'UNKNOWN'
      );
    }
  }

  /**
   * Migrate data from global storage to user-scoped storage
   * This should be called once when a user first logs in
   * @param userId User ID for scoping the data
   * @returns Statistics about migrated data
   */
  migrateToUserScopedStorage(userId: string): {
    migratedKeys: string[];
    skippedKeys: string[];
  } {
    try {
      const keys = Object.keys(localStorage);
      const migratedKeys: string[] = [];
      const skippedKeys: string[] = [];

      keys.forEach(key => {
        // Only migrate keys with our prefix that aren't already user-scoped
        if (key.startsWith(this.prefix) && !key.includes(`${this.prefix}user_`)) {
          const dataKey = key.substring(this.prefix.length);
          
          // Skip migration metadata keys
          if (dataKey.startsWith('migration_') || dataKey === 'last_sync' || dataKey === 'sync_queue') {
            skippedKeys.push(dataKey);
            return;
          }

          // Check if user-scoped version already exists
          const userScopedKey = this.buildKey(dataKey, userId);
          if (localStorage.getItem(userScopedKey) === null) {
            // Copy data to user-scoped key
            const value = localStorage.getItem(key);
            if (value !== null) {
              localStorage.setItem(userScopedKey, value);
              migratedKeys.push(dataKey);
            }
          } else {
            // User-scoped data already exists, don't overwrite
            skippedKeys.push(dataKey);
          }
        }
      });

      // Store migration completion flag
      this.set(`migration_to_user_scoped_${userId}`, {
        completed: true,
        timestamp: new Date(),
        migratedKeys,
        skippedKeys
      });

      console.log(`Migrated ${migratedKeys.length} keys to user-scoped storage for user ${userId}`);
      return { migratedKeys, skippedKeys };
    } catch (error) {
      console.error('Error during user-scoped migration:', error);
      throw new StorageError(
        `Failed to migrate to user-scoped storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN'
      );
    }
  }

  /**
   * Check if user-scoped migration has been completed for a user
   * @param userId User ID to check
   * @returns true if migration was completed, false otherwise
   */
  hasUserScopedMigration(userId: string): boolean {
    try {
      const migrationData = this.get<{ completed: boolean }>(`migration_to_user_scoped_${userId}`);
      return migrationData?.completed === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Migrate existing local data for cloud sync
   * Adds userId field to all existing data items
   * Requirements: 17.4
   */
  async migrateDataForCloudSync(userId: string): Promise<{
    notes: number;
    tasks: number;
    tarotReadings: number;
    pomodoroSessions: number;
  }> {
    if (this.migrationCompleted) {
      console.log('Data migration already completed');
      return { notes: 0, tasks: 0, tarotReadings: 0, pomodoroSessions: 0 };
    }

    try {
      console.log('Starting data migration for cloud sync...');
      const migrationStats = {
        notes: 0,
        tasks: 0,
        tarotReadings: 0,
        pomodoroSessions: 0,
      };

      // Migrate notes
      const notes = this.get<any[]>('notes');
      if (notes && Array.isArray(notes)) {
        const migratedNotes = notes.map(note => ({
          ...note,
          userId: note.userId || userId,
          // Ensure dates are properly formatted
          createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt),
          updatedAt: note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt),
        }));
        this.set('notes', migratedNotes);
        migrationStats.notes = migratedNotes.length;
        console.log(`Migrated ${migratedNotes.length} notes`);
      }

      // Migrate tasks
      const tasks = this.get<any[]>('tasks');
      if (tasks && Array.isArray(tasks)) {
        const migratedTasks = tasks.map(task => ({
          ...task,
          userId: task.userId || userId,
          // Ensure dates are properly formatted
          createdAt: task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt),
          completedAt: task.completedAt ? (task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt)) : undefined,
          archivedAt: task.archivedAt ? (task.archivedAt instanceof Date ? task.archivedAt : new Date(task.archivedAt)) : undefined,
        }));
        this.set('tasks', migratedTasks);
        migrationStats.tasks = migratedTasks.length;
        console.log(`Migrated ${migratedTasks.length} tasks`);
      }

      // Migrate tarot readings
      const readings = this.get<any[]>('tarot_readings');
      if (readings && Array.isArray(readings)) {
        const migratedReadings = readings.map(reading => ({
          ...reading,
          userId: reading.userId || userId,
          // Ensure dates are properly formatted
          date: reading.date instanceof Date ? reading.date : new Date(reading.date),
        }));
        this.set('tarot_readings', migratedReadings);
        migrationStats.tarotReadings = migratedReadings.length;
        console.log(`Migrated ${migratedReadings.length} tarot readings`);
      }

      // Migrate pomodoro sessions
      const sessions = this.get<any[]>('pomodoro_sessions');
      if (sessions && Array.isArray(sessions)) {
        const migratedSessions = sessions.map(session => ({
          ...session,
          userId: session.userId || userId,
          // Ensure dates are properly formatted
          startTime: session.startTime instanceof Date ? session.startTime : new Date(session.startTime),
          endTime: session.endTime ? (session.endTime instanceof Date ? session.endTime : new Date(session.endTime)) : undefined,
        }));
        this.set('pomodoro_sessions', migratedSessions);
        migrationStats.pomodoroSessions = migratedSessions.length;
        console.log(`Migrated ${migratedSessions.length} pomodoro sessions`);
      }

      // Mark migration as completed
      this.set('migration_completed', true);
      this.set('migration_timestamp', new Date());
      this.set('migration_user_id', userId);
      this.migrationCompleted = true;
      
      console.log('Data migration completed successfully', migrationStats);
      return migrationStats;
    } catch (error) {
      console.error('Error during data migration:', error);
      throw new StorageError(
        `Failed to migrate data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN'
      );
    }
  }

  /**
   * Check if data migration has been completed
   */
  isMigrationCompleted(): boolean {
    if (this.migrationCompleted) {
      return true;
    }
    
    const completed = this.get<boolean>('migration_completed');
    if (completed) {
      this.migrationCompleted = true;
    }
    
    return this.migrationCompleted;
  }

  /**
   * Reset migration state (for testing purposes)
   * @internal
   */
  resetMigrationState(): void {
    this.migrationCompleted = false;
    this.remove('migration_completed');
    this.remove('migration_timestamp');
    this.remove('migration_user_id');
  }

  /**
   * Get all data for export or cloud sync
   * Returns all notes, tasks, tarot readings, and pomodoro sessions
   * @param userId Optional user ID for user-scoped data
   */
  getAllData(userId?: string): {
    notes: any[];
    tasks: any[];
    tarotReadings: any[];
    pomodoroSessions: any[];
    settings: any;
  } {
    return {
      notes: this.get<any[]>('notes', userId) || [],
      tasks: this.get<any[]>('tasks', userId) || [],
      tarotReadings: this.get<any[]>('tarot_readings', userId) || [],
      pomodoroSessions: this.get<any[]>('pomodoro_sessions', userId) || [],
      settings: this.get<any>('settings', userId) || {},
    };
  }

  /**
   * Set all data (used for import or cloud sync restore)
   * Supports merging with existing data
   * @param userId Optional user ID for user-scoped data
   */
  setAllData(
    data: {
      notes?: any[];
      tasks?: any[];
      tarotReadings?: any[];
      pomodoroSessions?: any[];
      settings?: any;
    },
    merge: boolean = false,
    userId?: string
  ): void {
    if (data.notes) {
      if (merge) {
        const existing = this.get<any[]>('notes', userId) || [];
        const merged = this.mergeArrays(existing, data.notes, 'id');
        this.set('notes', merged, userId);
      } else {
        this.set('notes', data.notes, userId);
      }
    }
    
    if (data.tasks) {
      if (merge) {
        const existing = this.get<any[]>('tasks', userId) || [];
        const merged = this.mergeArrays(existing, data.tasks, 'id');
        this.set('tasks', merged, userId);
      } else {
        this.set('tasks', data.tasks, userId);
      }
    }
    
    if (data.tarotReadings) {
      if (merge) {
        const existing = this.get<any[]>('tarot_readings', userId) || [];
        const merged = this.mergeArrays(existing, data.tarotReadings, 'id');
        this.set('tarot_readings', merged, userId);
      } else {
        this.set('tarot_readings', data.tarotReadings, userId);
      }
    }
    
    if (data.pomodoroSessions) {
      if (merge) {
        const existing = this.get<any[]>('pomodoro_sessions', userId) || [];
        const merged = this.mergeArrays(existing, data.pomodoroSessions, 'id');
        this.set('pomodoro_sessions', merged, userId);
      } else {
        this.set('pomodoro_sessions', data.pomodoroSessions, userId);
      }
    }
    
    if (data.settings) {
      if (merge) {
        const existing = this.get<any>('settings', userId) || {};
        this.set('settings', { ...existing, ...data.settings }, userId);
      } else {
        this.set('settings', data.settings, userId);
      }
    }
  }

  /**
   * Merge two arrays by a unique key, preferring newer items
   */
  private mergeArrays(existing: any[], incoming: any[], key: string): any[] {
    const map = new Map();
    
    // Add existing items
    existing.forEach(item => {
      map.set(item[key], item);
    });
    
    // Add or update with incoming items (prefer newer based on updatedAt or createdAt)
    incoming.forEach(item => {
      const existingItem = map.get(item[key]);
      if (!existingItem) {
        map.set(item[key], item);
      } else {
        // Compare timestamps to determine which is newer
        const existingTime = existingItem.updatedAt || existingItem.createdAt;
        const incomingTime = item.updatedAt || item.createdAt;
        
        if (incomingTime && existingTime) {
          const existingDate = existingTime instanceof Date ? existingTime : new Date(existingTime);
          const incomingDate = incomingTime instanceof Date ? incomingTime : new Date(incomingTime);
          
          if (incomingDate > existingDate) {
            map.set(item[key], item);
          }
        } else {
          // If no timestamps, prefer incoming
          map.set(item[key], item);
        }
      }
    });
    
    return Array.from(map.values());
  }

  /**
   * Encrypt data using Web Crypto API (AES-GCM)
   * Requirements: 17.4
   */
  async encryptData(data: string, key?: CryptoKey): Promise<string> {
    if (!this.encryptionEnabled) {
      return data;
    }

    const encryptionKey = key || this.encryptionKey;
    if (!encryptionKey) {
      console.warn('Encryption key not available, returning unencrypted data');
      return data;
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate a random IV (Initialization Vector)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        encryptionKey,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption error:', error);
      // Fallback to unencrypted if encryption fails
      return data;
    }
  }

  /**
   * Decrypt data using Web Crypto API (AES-GCM)
   * Requirements: 17.4
   */
  async decryptData(encryptedData: string, key?: CryptoKey): Promise<string> {
    if (!this.encryptionEnabled) {
      return encryptedData;
    }

    const decryptionKey = key || this.encryptionKey;
    if (!decryptionKey) {
      console.warn('Decryption key not available, returning data as-is');
      return encryptedData;
    }

    try {
      // Decode from base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        decryptionKey,
        data
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption error:', error);
      // Return as-is if decryption fails (might be unencrypted legacy data)
      return encryptedData;
    }
  }

  /**
   * Generate encryption key from password
   * Requirements: 17.4
   */
  async generateEncryptionKey(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive a key using PBKDF2
    const salt = encoder.encode('darkprod-salt-v1'); // In production, use a random salt per user
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt and store data for cloud sync
   * Requirements: 17.4
   * @param userId Optional user ID for user-scoped storage
   */
  async setEncryptedForCloud<T>(key: string, value: T, userId?: string): Promise<void> {
    if (!this.encryptionEnabled || !this.encryptionKey) {
      // Fall back to regular storage if encryption not available
      this.set(key, value, userId);
      return;
    }

    try {
      const serialized = this.serialize(value);
      const encrypted = await this.encryptData(serialized, this.encryptionKey);
      const fullKey = this.buildKey(key, userId);
      localStorage.setItem(fullKey, encrypted);
    } catch (error) {
      console.error(`Error encrypting data for cloud (${key}):`, error);
      // Fall back to unencrypted storage
      this.set(key, value, userId);
    }
  }

  /**
   * Decrypt and retrieve data from cloud sync
   * Requirements: 17.4
   * @param userId Optional user ID for user-scoped storage
   */
  async getEncryptedFromCloud<T>(key: string, userId?: string): Promise<T | null> {
    if (!this.encryptionEnabled || !this.encryptionKey) {
      // Fall back to regular storage if encryption not available
      return this.get<T>(key, userId);
    }

    try {
      const fullKey = this.buildKey(key, userId);
      const item = localStorage.getItem(fullKey);
      
      if (item === null) {
        return null;
      }

      const decrypted = await this.decryptData(item, this.encryptionKey);
      return this.deserialize<T>(decrypted);
    } catch (error) {
      console.error(`Error decrypting data from cloud (${key}):`, error);
      // Fall back to regular get
      return this.get<T>(key, userId);
    }
  }

  /**
   * Simple encryption for backward compatibility (synchronous)
   * This is used for non-sensitive data or when async encryption is not suitable
   */
  private encrypt(data: string): string {
    if (!this.encryptionEnabled) {
      return data;
    }
    // Basic Base64 encoding (NOT secure, just for obfuscation)
    // For sensitive data, use encryptData() instead
    return btoa(data);
  }

  /**
   * Simple decryption for backward compatibility (synchronous)
   */
  private decrypt(data: string): string {
    if (!this.encryptionEnabled) {
      return data;
    }
    // Basic Base64 decoding
    try {
      return atob(data);
    } catch {
      return data; // Return as-is if decryption fails
    }
  }

  /**
   * Get encrypted data from storage
   * @param userId Optional user ID for user-scoped storage
   */
  getEncrypted<T>(key: string, userId?: string): T | null {
    try {
      const fullKey = this.buildKey(key, userId);
      const item = localStorage.getItem(fullKey);
      
      if (item === null) {
        return null;
      }

      const decrypted = this.decrypt(item);
      return this.deserialize<T>(decrypted);
    } catch (error) {
      console.error(`Error reading encrypted data from storage (${key}):`, error);
      throw new StorageError(
        `Failed to read encrypted data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PARSE_ERROR'
      );
    }
  }

  /**
   * Set encrypted data in storage
   * @param userId Optional user ID for user-scoped storage
   */
  setEncrypted<T>(key: string, value: T, userId?: string): void {
    try {
      const fullKey = this.buildKey(key, userId);
      const serialized = this.serialize(value);
      const encrypted = this.encrypt(serialized);
      localStorage.setItem(fullKey, encrypted);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        console.error('LocalStorage quota exceeded');
        throw new StorageError(
          'Storage quota exceeded. Please export your data and clear old entries.',
          'QUOTA_EXCEEDED'
        );
      }
      
      console.error(`Error writing encrypted data to storage (${key}):`, error);
      throw new StorageError(
        `Failed to write encrypted data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN'
      );
    }
  }

  /**
   * Sync local data to cloud
   * Returns data ready for cloud upload
   * @param userId Optional user ID for user-scoped data
   */
  prepareDataForCloudSync(userId?: string): {
    notes: any[];
    tasks: any[];
    tarotReadings: any[];
    pomodoroSessions: any[];
    settings: any;
  } {
    const data = this.getAllData(userId);
    
    // Ensure all dates are properly serialized
    return {
      notes: data.notes.map(note => ({
        ...note,
        createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt),
        updatedAt: note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt),
      })),
      tasks: data.tasks.map(task => ({
        ...task,
        createdAt: task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt),
        completedAt: task.completedAt ? (task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt)) : undefined,
        archivedAt: task.archivedAt ? (task.archivedAt instanceof Date ? task.archivedAt : new Date(task.archivedAt)) : undefined,
      })),
      tarotReadings: data.tarotReadings.map(reading => ({
        ...reading,
        date: reading.date instanceof Date ? reading.date : new Date(reading.date),
      })),
      pomodoroSessions: data.pomodoroSessions.map(session => ({
        ...session,
        startTime: session.startTime instanceof Date ? session.startTime : new Date(session.startTime),
        endTime: session.endTime ? (session.endTime instanceof Date ? session.endTime : new Date(session.endTime)) : undefined,
      })),
      settings: data.settings,
    };
  }

  /**
   * Restore data from cloud sync
   * Merges cloud data with local data
   * @param userId Optional user ID for user-scoped data
   */
  async restoreFromCloudSync(cloudData: {
    notes?: any[];
    tasks?: any[];
    tarotReadings?: any[];
    pomodoroSessions?: any[];
    settings?: any;
  }, userId?: string): Promise<void> {
    try {
      console.log('Restoring data from cloud sync...');
      
      // Use merge mode to combine cloud and local data
      this.setAllData(cloudData, true, userId);
      
      console.log('Data restored from cloud successfully');
    } catch (error) {
      console.error('Error restoring data from cloud:', error);
      throw new StorageError(
        `Failed to restore data from cloud: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNKNOWN'
      );
    }
  }

  /**
   * Get storage statistics
   * @param userId Optional user ID to get stats for specific user
   */
  getStorageStats(userId?: string): {
    used: number;
    available: number;
    percentage: number;
    itemCount: number;
  } {
    let totalSize = 0;
    let itemCount = 0;
    
    // Calculate size of all items with our prefix
    const keys = Object.keys(localStorage);
    const targetPrefix = userId ? `${this.prefix}user_${userId}_` : this.prefix;
    
    keys.forEach(key => {
      if (key.startsWith(targetPrefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length * 2; // UTF-16 encoding (2 bytes per char)
          itemCount++;
        }
      }
    });

    // Most browsers have 5-10MB limit for localStorage
    const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (totalSize / estimatedLimit) * 100;

    return {
      used: totalSize,
      available: estimatedLimit - totalSize,
      percentage: Math.min(percentage, 100),
      itemCount,
    };
  }

  /**
   * Check if storage is approaching quota
   * @param userId Optional user ID to check specific user's quota
   */
  isStorageNearQuota(threshold: number = 80, userId?: string): boolean {
    const stats = this.getStorageStats(userId);
    return stats.percentage >= threshold;
  }

  /**
   * Clear old data to free up space
   * Removes items older than specified days
   * @param userId Optional user ID for user-scoped data
   */
  clearOldData(daysOld: number = 90, userId?: string): number {
    let clearedCount = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      // Clear old tarot readings
      const readings = this.get<any[]>('tarot_readings', userId) || [];
      const filteredReadings = readings.filter(reading => {
        const date = reading.date instanceof Date ? reading.date : new Date(reading.date);
        return date > cutoffDate;
      });
      if (filteredReadings.length < readings.length) {
        this.set('tarot_readings', filteredReadings, userId);
        clearedCount += readings.length - filteredReadings.length;
      }

      // Clear old completed pomodoro sessions
      const sessions = this.get<any[]>('pomodoro_sessions', userId) || [];
      const filteredSessions = sessions.filter(session => {
        const date = session.startTime instanceof Date ? session.startTime : new Date(session.startTime);
        return date > cutoffDate;
      });
      if (filteredSessions.length < sessions.length) {
        this.set('pomodoro_sessions', filteredSessions, userId);
        clearedCount += sessions.length - filteredSessions.length;
      }

      console.log(`Cleared ${clearedCount} old items`);
      return clearedCount;
    } catch (error) {
      console.error('Error clearing old data:', error);
      return clearedCount;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
