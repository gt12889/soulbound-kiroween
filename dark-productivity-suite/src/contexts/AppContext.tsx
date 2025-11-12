import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppSettings, ModuleName } from '../types';

interface AppContextType {
  // Current module state
  currentModule: ModuleName;
  setCurrentModule: (module: ModuleName) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const defaultSettings: AppSettings = {
  audioEnabled: false,
  audioVolume: 50,
  lastModule: 'graveyard-dashboard',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component wrapping entire application
 * Manages global application state including current module, settings, and loading states
 * Requirements: 6.1, 6.2, 6.3
 */
export function AppProvider({ children }: AppProviderProps) {
  // Persist settings to LocalStorage
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', defaultSettings);
  
  // Current module state (initialized from settings)
  const [currentModule, setCurrentModuleState] = useState<ModuleName>(
    settings.lastModule as ModuleName || 'graveyard-dashboard'
  );
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Update current module and persist to settings
  const setCurrentModule = useCallback((module: ModuleName) => {
    setCurrentModuleState(module);
    setSettings(prev => ({ ...prev, lastModule: module }));
  }, [setSettings]);

  // Update settings (partial update)
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const value: AppContextType = {
    currentModule,
    setCurrentModule,
    settings,
    updateSettings,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to access AppContext
 * @throws Error if used outside AppProvider
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
