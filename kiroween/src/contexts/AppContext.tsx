import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { cloudSyncService } from '../services/cloudSyncService';
import type { AppSettings, ModuleName } from '../types';
import type { CompanionType } from '../types/companion';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('[AppContext]');

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

  // Companion state
  companionType: CompanionType | null;
  setCompanionType: (type: CompanionType) => Promise<void>;
  hasSelectedCompanion: boolean;
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
 * Requirements: 6.1, 6.2, 6.3, FR-1.3, FR-4.2, FR-4.3, FR-4.5
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

  // Companion type state, persisted to local storage (FR-1.3, FR-4.3)
  const [companionType, setCompanionTypeState] = useLocalStorage<CompanionType | null>(
    'dark-productivity-companion-type',
    null
  );
  
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

  // Set companion type with Firebase sync (FR-4.1, FR-4.2, FR-4.3, FR-4.5)
  const setCompanionType = useCallback(async (type: CompanionType) => {
    // Validate companion type
    if (!['shadow', 'forest', 'ember'].includes(type)) {
      console.error('Invalid companion type:', type);
      throw new Error('Invalid companion type');
    }

    // Update local state immediately
    setCompanionTypeState(type);

    // Sync to Firebase for authenticated users (FR-4.2, FR-4.5)
    if (isAuthenticated && user) {
      try {
        await cloudSyncService.syncCompanionData(user.id, {
          type,
          selectedAt: new Date().toISOString(),
        });
        console.log('Companion type synced to Firebase:', type);
      } catch (error) {
        console.error('Failed to sync companion type to Firebase:', error);
        // Don't throw - local storage is already updated
      }
    }
  }, [setCompanionTypeState, isAuthenticated, user]);

  // Computed property for companion selection status (FR-1.4)
  const hasSelectedCompanion = useMemo(() => {
    return companionType !== null;
  }, [companionType]);

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
        }
      } catch (error) {
        logger.error('Failed to load settings from cloud:', error);
      }
    };

    loadSettingsFromCloud();
  }, [isAuthenticated, user, setSettings]);

  // Sync companion type between localStorage and Firebase (FR-4.2, FR-4.5)
  useEffect(() => {
    const syncCompanionType = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // Fetch companion type from Firebase
        const companionData = await cloudSyncService.fetchCompanionData(user.id);
        const cloudType = companionData?.type;
        
        // Validate cloud type
        const isValidCloudType = cloudType && ['shadow', 'forest', 'ember'].includes(cloudType);
        
        // Get local type from localStorage
        const localType = companionType;
        
        // Sync logic: Resolve conflicts
        if (isValidCloudType && localType) {
          // Both exist - use cloud as source of truth for authenticated users
          if (cloudType !== localType) {
            console.log(`Syncing companion type from cloud (${cloudType}) to local (${localType})`);
            setCompanionTypeState(cloudType);
          }
        } else if (isValidCloudType && !localType) {
          // Cloud has data, local doesn't - sync from cloud to local
          console.log('Syncing companion type from cloud to local:', cloudType);
          setCompanionTypeState(cloudType);
        } else if (!isValidCloudType && localType) {
          // Local has data, cloud doesn't - sync from local to cloud
          console.log('Syncing companion type from local to cloud:', localType);
          await cloudSyncService.syncCompanionData(user.id, {
            type: localType,
            selectedAt: new Date().toISOString(),
          });
        } else if (isValidCloudType === false && cloudType) {
          // Invalid cloud type - log warning
          logger.warn('Invalid companion type from cloud:', cloudType);
        }
        // If both are null, no action needed
      } catch (error) {
        logger.error('Failed to sync companion type:', error);
      }
    };

    syncCompanionType();
  }, [isAuthenticated, user, companionType, setCompanionTypeState]);

  // Real-time sync: Subscribe to Firebase changes and update localStorage (FR-4.5)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Subscribe to real-time companion data updates from Firebase
    const unsubscribe = cloudSyncService.subscribeToCompanionData(
      user.id,
      (companionData) => {
        if (companionData?.type) {
          const cloudType = companionData.type;
          
          // Validate the type from Firebase
          if (['shadow', 'forest', 'ember'].includes(cloudType)) {
            // Only update if different from current local state
            if (cloudType !== companionType) {
              setCompanionTypeState(cloudType);
            }
          } else {
            logger.warn('Invalid companion type from real-time update:', cloudType);
          }
        }
      },
      (error) => {
        logger.error('Error in companion data real-time sync:', error);
      }
    );

    // Cleanup subscription on unmount or when user changes
    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, user, companionType, setCompanionTypeState]);

  // Migration: Default existing users to 'shadow' type (FR-6.3, NFR-4)
  useEffect(() => {
    const migrateExistingUsers = async () => {
      // Only run migration if no companion type is set
      if (companionType !== null) return;

      // Check if user has any existing data (tasks, notes, etc.)
      // For now, we'll check localStorage for any existing data
      const hasExistingData = 
        localStorage.getItem('tasks') !== null ||
        localStorage.getItem('notes') !== null ||
        localStorage.getItem('settings') !== null;

      if (hasExistingData) {
        await setCompanionType('shadow');
      }
    };

    migrateExistingUsers();
  }, [companionType, setCompanionType]);

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
      } catch (error) {
        logger.error('Failed to sync settings to cloud:', error);
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
    companionType,
    setCompanionType,
    hasSelectedCompanion,
  }), [
    currentModule,
    settings,
    isLoading,
    loadingMessage,
    hasBootupAnimationPlayed,
    sidebarMode,
    toggleSidebar,
    isSidebarOpen,
    setIsSidebarOpen,
    companionType,
    setCompanionType,
    hasSelectedCompanion,
  ]);

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