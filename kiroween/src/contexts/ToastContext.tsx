import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Toast Notification System
 * Requirements: 4.1, 4.2, 4.3, 4.6, 4.7
 * 
 * Provides a global toast notification system with queue management,
 * auto-dismiss functionality, and support for multiple toast types.
 */

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5,
  defaultDuration = 4000 // 4 seconds default (within 3-5 second requirement)
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Dismiss a specific toast
  // Requirement: 4.7 - Allow manual dismissal
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Show a new toast notification
  // Requirement: 4.1 - Implement toast notification system
  const showToast = useCallback((toast: Omit<Toast, 'id' | 'createdAt'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: new Date(),
      duration: toast.duration ?? defaultDuration,
    };

    setToasts((prev) => {
      // Limit the number of toasts displayed
      const updated = [...prev, newToast];
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts);
      }
      return updated;
    });

    return id;
  }, [maxToasts, defaultDuration]);

  // Auto-dismiss toasts after their duration
  // Requirement: 4.6 - Auto-dismiss after 3-5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    toasts.forEach((toast) => {
      const duration = toast.duration ?? defaultDuration;
      const timer = setTimeout(() => {
        dismissToast(toast.id);
      }, duration);
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, dismissToast, defaultDuration]);

  // Clear all toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    toasts,
    showToast,
    dismissToast,
    clearAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
