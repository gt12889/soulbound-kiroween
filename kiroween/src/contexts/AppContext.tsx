import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { cloudSyncService } from '../services/cloudSyncService';
import type { AppSettings, ModuleName } from '../types';

export type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

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

  // Session state
  hasBootupAnimationPlayed: boolean;
  setHasBootupAnimationPlayed: (played: boolean) => void;

  // Sidebar state
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleSidebar: () => void;
  // Backward compatibility
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
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
  const { user, isAuthenticated } = useAuth();
  
  // Persist settings to LocalStorage
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', defaultSettings);
  
  // Current module state (initialized from settings)
  const [currentModule, setCurrentModuleState] = useState<ModuleName>(
    settings.lastModule as ModuleName || 'graveyard-dashboard'
  );
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Session state for bootup animation
  const [hasBootupAnimationPlayed, setHasBootupAnimationPlayed] = useState(false);

  // Sidebar state, persisted to local storage
  const [sidebarMode, setSidebarMode] = useLocalStorage<SidebarMode>('sidebarMode', 'expanded');
  
  // Backward compatibility: isSidebarOpen is true when not hidden
  const isSidebarOpen = sidebarMode !== 'hidden';
  const setIsSidebarOpen = useCallback((isOpen: boolean) => {
    setSidebarMode(isOpen ? 'expanded' : 'hidden');
  }, [setSidebarMode]);

  // Toggle through sidebar modes: expanded -> collapsed -> hidden -> expanded
  const toggleSidebar = useCallback(() => {
    setSidebarMode(prev => {
      if (prev === 'expanded') return 'collapsed';
      if (prev === 'collapsed') return 'hidden';
      return 'expanded';
    });
  }, [setSidebarMode]);

  // Load settings from cloud when user logs in (Requirement 10.3, 17.3)
  useEffect(() => {
    const loadSettingsFromCloud = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const cloudSettings = await cloudSyncService.fetchSettings(user.id);
        if (cloudSettings) {
          // Merge cloud settings with local settings, preferring cloud data
          setSettings(prev => ({
            ...prev,
            ...cloudSettings,
            // Ensure we have valid values
            audioEnabled: cloudSettings.audioEnabled ?? prev.audioEnabled,
            audioVolume: cloudSettings.audioVolume ?? prev.audioVolume,
            lastModule: cloudSettings.lastModule ?? prev.lastModule,
          }));
          console.log('Settings loaded from cloud successfully');
        }
      } catch (error) {
        console.error('Failed to load settings from cloud:', error);
      }
    };

    loadSettingsFromCloud();
  }, [isAuthenticated, user, setSettings]);

  // Sync settings to cloud when they change (Requirement 10.3, 17.3)
  useEffect(() => {
    const syncSettingsToCloud = async () => {
      if (!isAuthenticated || !user) return;

      try {
        await cloudSyncService.syncSettings(user.id, {
          audioEnabled: settings.audioEnabled,
          audioVolume: settings.audioVolume,
          lastModule: settings.lastModule,
        });
        console.log('Settings synced to cloud successfully');
      } catch (error) {
        console.error('Failed to sync settings to cloud:', error);
      }
    };

    // Debounce sync to avoid excessive writes
    const timeoutId = setTimeout(syncSettingsToCloud, 1000);
    return () => clearTimeout(timeoutId);
  }, [settings, isAuthenticated, user]);

  // Update current module and persist to settings
  const setCurrentModule = useCallback((module: ModuleName) => {
    setCurrentModuleState(module);
    setSettings(prev => ({ ...prev, lastModule: module }));
  }, [setSettings]);

  // Update settings (partial update)
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const value = useMemo(() => ({
    currentModule,
    setCurrentModule,
    settings,
    updateSettings,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    hasBootupAnimationPlayed,
    setHasBootupAnimationPlayed,
    sidebarMode,
    setSidebarMode,
    toggleSidebar,
    isSidebarOpen,
    setIsSidebarOpen,
  }), [currentModule, settings, isLoading, loadingMessage, hasBootupAnimationPlayed, sidebarMode, toggleSidebar, isSidebarOpen, setIsSidebarOpen]);

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