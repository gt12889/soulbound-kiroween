/**
 * Companion Storage Service
 * Handles persistence of companion type selection for both authenticated and local users
 * Requirements: FR-1.3, FR-4.1, FR-4.2, FR-4.3, FR-4.4, FR-4.5, NFR-4
 */

import { storageService } from './storageService';
import { cloudSyncService } from './cloudSyncService';
import type { CompanionType } from '../types/companion';

const COMPANION_TYPE_KEY = 'dark-productivity-companion-type';
const COMPANION_SELECTION_TIMESTAMP_KEY = 'companion-selection-timestamp';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

export class CompanionStorageError extends Error {
  public readonly code: 'VALIDATION_ERROR' | 'STORAGE_ERROR' | 'SYNC_ERROR';
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: 'VALIDATION_ERROR' | 'STORAGE_ERROR' | 'SYNC_ERROR',
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'CompanionStorageError';
    this.code = code;
    this.retryable = retryable;
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay with jitter
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
function calculateRetryDelay(attempt: number): number {
  const exponentialDelay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt),
    MAX_RETRY_DELAY
  );
  // Add jitter (±25% randomness) to prevent thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param operationName - Name of operation for logging
 * @returns Result of the function
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry validation errors or non-retryable errors
      if (error instanceof CompanionStorageError && !error.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        console.error(
          `${operationName} failed after ${maxRetries + 1} attempts:`,
          error
        );
        break;
      }

      const delay = calculateRetryDelay(attempt);
      console.warn(
        `${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
        error
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Validate companion type
 * Requirements: NFR-4
 */
function validateCompanionType(type: any): type is CompanionType {
  return typeof type === 'string' && ['shadow', 'forest', 'ember'].includes(type);
}

/**
 * Save companion type to storage
 * For authenticated users: saves to both localStorage and Firebase
 * For local users: saves to localStorage only
 * Requirements: FR-4.1, FR-4.2, FR-4.3
 * 
 * @param type - The companion type to save
 * @param userId - Optional user ID for authenticated users
 * @throws CompanionStorageError if validation fails or storage operation fails
 */
export async function saveCompanionType(type: CompanionType, userId?: string): Promise<void> {
  // Validate companion type (NFR-4)
  if (!validateCompanionType(type)) {
    throw new CompanionStorageError(
      `Invalid companion type: ${type}. Must be 'shadow', 'forest', or 'ember'.`,
      'VALIDATION_ERROR',
      false // Not retryable
    );
  }

  try {
    // Save to localStorage (FR-4.3) - user-scoped for data isolation
    storageService.set(COMPANION_TYPE_KEY, type, userId);
    storageService.set(COMPANION_SELECTION_TIMESTAMP_KEY, new Date(), userId);

    // Save to Firebase for authenticated users (FR-4.2, FR-4.5)
    if (userId) {
      try {
        // Retry Firebase sync with exponential backoff
        await retryWithBackoff(
          async () => {
            await cloudSyncService.syncCompanionData(userId, {
              type,
              selectedAt: new Date().toISOString(),
            });
          },
          MAX_RETRIES,
          'Firebase companion sync'
        );
      } catch (error) {
        console.error('Failed to sync companion type to Firebase after retries:', error);
        // Don't throw - localStorage save was successful
        // Firebase sync will be retried by cloudSyncService
        throw new CompanionStorageError(
          'Failed to sync companion type to cloud after multiple attempts. Local save successful.',
          'SYNC_ERROR',
          true // Retryable
        );
      }
    }
  } catch (error) {
    if (error instanceof CompanionStorageError) {
      throw error;
    }
    
    console.error('Failed to save companion type:', error);
    throw new CompanionStorageError(
      `Failed to save companion type: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_ERROR',
      false // Not retryable for localStorage errors
    );
  }
}

/**
 * Load companion type from storage
 * For authenticated users: attempts to load from Firebase first, falls back to localStorage
 * For local users: loads from localStorage only
 * Requirements: FR-1.4, FR-4.3, FR-4.5, NFR-4
 * 
 * @param userId - Optional user ID for authenticated users
 * @returns The companion type or null if not found
 */
export async function loadCompanionType(userId?: string): Promise<CompanionType | null> {
  try {
    // For authenticated users, try Firebase first (FR-4.5)
    if (userId) {
      try {
        // Retry Firebase fetch with exponential backoff
        const companionData = await retryWithBackoff(
          async () => {
            return await cloudSyncService.fetchCompanionData(userId);
          },
          MAX_RETRIES,
          'Firebase companion fetch'
        );
        const cloudType = companionData?.type;

        // Validate cloud type (NFR-4)
        if (cloudType && validateCompanionType(cloudType)) {
          // Update localStorage with cloud data for offline access - user-scoped
          storageService.set(COMPANION_TYPE_KEY, cloudType, userId);
          
          return cloudType;
        } else if (cloudType) {
          console.warn('Invalid companion type from Firebase:', cloudType);
          // Fall through to localStorage
        }
      } catch (error) {
        console.error('Failed to load companion type from Firebase after retries, falling back to localStorage:', error);
        // Fall through to localStorage
      }
    }

    // Load from localStorage (FR-4.3) - user-scoped
    const localType = storageService.get<CompanionType>(COMPANION_TYPE_KEY, userId);

    // Validate local type (NFR-4)
    if (localType && validateCompanionType(localType)) {
      return localType;
    } else if (localType) {
      console.warn('Invalid companion type from localStorage:', localType);
      // Data corruption - clear invalid data
      storageService.remove(COMPANION_TYPE_KEY, userId);
      return null;
    }

    return null;
  } catch (error) {
    console.error('Failed to load companion type:', error);
    // Return null instead of throwing to allow app to continue
    return null;
  }
}

/**
 * Check if user has made a companion selection
 * Requirements: FR-1.4
 * 
 * @param userId - Optional user ID for user-scoped storage
 * @returns true if companion type exists in storage, false otherwise
 */
export function hasCompanionSelection(userId?: string): boolean {
  try {
    const type = storageService.get<CompanionType>(COMPANION_TYPE_KEY, userId);
    return type !== null && validateCompanionType(type);
  } catch (error) {
    console.error('Error checking companion selection:', error);
    return false;
  }
}

/**
 * Get companion selection timestamp
 * Requirements: FR-4.1
 * 
 * @param userId - Optional user ID for user-scoped storage
 * @returns The date when companion was selected, or null if not found
 */
export function getCompanionSelectionTimestamp(userId?: string): Date | null {
  try {
    return storageService.get<Date>(COMPANION_SELECTION_TIMESTAMP_KEY, userId);
  } catch (error) {
    console.error('Error getting companion selection timestamp:', error);
    return null;
  }
}

/**
 * Clear companion selection (for testing/debugging only)
 * This should NOT be exposed to users as selection is permanent (FR-4.4)
 * @internal
 * @param userId - Optional user ID for user-scoped storage
 */
export function clearCompanionSelection(userId?: string): void {
  try {
    storageService.remove(COMPANION_TYPE_KEY, userId);
    storageService.remove(COMPANION_SELECTION_TIMESTAMP_KEY, userId);
  } catch (error) {
    console.error('Error clearing companion selection:', error);
  }
}

/**
 * Sync companion type between localStorage and Firebase
 * Resolves conflicts by preferring Firebase data for authenticated users
 * Requirements: FR-4.5
 * 
 * @param userId - User ID for authenticated users
 * @returns The resolved companion type
 */
export async function syncCompanionType(userId: string): Promise<CompanionType | null> {
  try {
    // Get local type - user-scoped
    const localType = storageService.get<CompanionType>(COMPANION_TYPE_KEY, userId);
    
    // Get cloud type with retry
    let cloudType: CompanionType | null = null;
    try {
      const companionData = await retryWithBackoff(
        async () => {
          return await cloudSyncService.fetchCompanionData(userId);
        },
        MAX_RETRIES,
        'Firebase companion fetch for sync'
      );
      cloudType = companionData?.type || null;
    } catch (error) {
      console.error('Failed to fetch companion type from Firebase after retries:', error);
    }

    // Validate types
    const isValidLocal = localType && validateCompanionType(localType);
    const isValidCloud = cloudType && validateCompanionType(cloudType);

    // Sync logic
    if (isValidCloud && isValidLocal) {
      // Both exist - prefer cloud as source of truth
      if (cloudType !== localType) {
        storageService.set(COMPANION_TYPE_KEY, cloudType, userId);
      }
      return cloudType;
    } else if (isValidCloud && !isValidLocal) {
      // Cloud has data, local doesn't - sync from cloud to local
      storageService.set(COMPANION_TYPE_KEY, cloudType, userId);
      return cloudType;
    } else if (!isValidCloud && isValidLocal) {
      // Local has data, cloud doesn't - sync from local to cloud with retry
      await retryWithBackoff(
        async () => {
          await cloudSyncService.syncCompanionData(userId, {
            type: localType,
            selectedAt: new Date().toISOString(),
          });
        },
        MAX_RETRIES,
        'Firebase companion sync from local'
      );
      return localType;
    } else if (cloudType && !isValidCloud) {
      // Invalid cloud type - log warning
      console.warn('Invalid companion type from cloud:', cloudType);
    } else if (localType && !isValidLocal) {
      // Invalid local type - clear it
      console.warn('Invalid companion type from local storage:', localType);
      storageService.remove(COMPANION_TYPE_KEY, userId);
    }

    return null;
  } catch (error) {
    console.error('Failed to sync companion type:', error);
    throw new CompanionStorageError(
      `Failed to sync companion type: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'SYNC_ERROR',
      true // Retryable
    );
  }
}

/**
 * Migrate existing users to default companion type
 * Sets 'shadow' type for users with existing data but no companion selection
 * Requirements: FR-6.3, NFR-4
 * 
 * @param userId - Optional user ID for authenticated users
 * @returns true if migration was performed, false if not needed
 */
export async function migrateExistingUser(userId?: string): Promise<boolean> {
  try {
    // Check if user already has a companion selection - user-scoped
    if (hasCompanionSelection(userId)) {
      return false;
    }

    // Check if user has any existing data - user-scoped
    const hasExistingData = 
      storageService.get('tasks', userId) !== null ||
      storageService.get('notes', userId) !== null ||
      storageService.get('settings', userId) !== null ||
      storageService.get('tarot_readings', userId) !== null;

    if (hasExistingData) {
      // Use retry logic for migration save
      await retryWithBackoff(
        async () => {
          await saveCompanionType('shadow', userId);
        },
        MAX_RETRIES,
        'User migration'
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to migrate existing user after retries:', error);
    return false;
  }
}
