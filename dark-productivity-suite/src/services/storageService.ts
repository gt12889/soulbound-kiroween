/**
 * Storage service for managing LocalStorage operations
 * Handles data persistence with error handling for quota exceeded scenarios
 */

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

  /**
   * Get data from LocalStorage
   * @param key Storage key (without prefix)
   * @returns Parsed data or null if not found
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = this.prefix + key;
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
   */
  set<T>(key: string, value: T): void {
    try {
      const fullKey = this.prefix + key;
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
   */
  remove(key: string): void {
    try {
      const fullKey = this.prefix + key;
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
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
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
        error.code === 22 || // QUOTA_EXCEEDED_ERR
        error.code === 1014 || // NS_ERROR_DOM_QUOTA_REACHED (Firefox)
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      );
    }
    return false;
  }
}

// Export singleton instance
export const storageService = new StorageService();
