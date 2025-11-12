import { useState, useEffect, useRef, useCallback } from 'react';
import { storageService, StorageError } from '../services/storageService';

/**
 * Custom hook for syncing state with LocalStorage
 * Automatically saves changes within 1 second
 * 
 * @param key Storage key (without prefix)
 * @param initialValue Default value if no stored value exists
 * @returns [storedValue, setValue, error]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, StorageError | null] {
  const [error, setError] = useState<StorageError | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // Initialize state from storage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storageService.get<T>(key);
      return item !== null ? item : initialValue;
    } catch (err) {
      console.error(`Error loading from storage (${key}):`, err);
      setError(err instanceof StorageError ? err : null);
      return initialValue;
    }
  });

  // Save to storage with debouncing (1 second)
  const saveToStorage = useCallback((value: T) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second
    saveTimeoutRef.current = setTimeout(() => {
      try {
        storageService.set(key, value);
        setError(null);
      } catch (err) {
        console.error(`Error saving to storage (${key}):`, err);
        setError(err instanceof StorageError ? err : null);
        
        // If quota exceeded, notify user
        if (err instanceof StorageError && err.code === 'QUOTA_EXCEEDED') {
          // Could trigger a global notification here
          console.warn('Storage quota exceeded. Consider exporting and clearing old data.');
        }
      }
    }, 1000);
  }, [key]);

  // Update stored value and trigger save
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      saveToStorage(newValue);
      return newValue;
    });
  }, [saveToStorage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const fullKey = 'darkprod_' + key;
      if (e.key === fullKey && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (err) {
          console.error(`Error parsing storage event (${key}):`, err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, error];
}
