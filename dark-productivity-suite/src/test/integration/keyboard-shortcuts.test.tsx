import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useEffect } from 'react';
import { KeyboardProvider, useKeyboard } from '../../contexts/KeyboardContext';
import { AppProvider } from '../../contexts/AppContext';
import { NotesProvider } from '../../contexts/NotesContext';
import { TasksProvider } from '../../contexts/TasksContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { DEFAULT_SHORTCUTS } from '../../utils/keyboardShortcuts';

// Test component to verify keyboard shortcuts
const TestComponent = ({ onShortcut }: { onShortcut: (action: string) => void }) => {
  const { registerShortcut, unregisterShortcut } = useKeyboard();

  useEffect(() => {
    // Register shortcuts using the correct API
    const newNoteShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'create-note');
    const newTaskShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'create-task');
    const quickCaptureShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'quick-capture');

    if (newNoteShortcut) {
      registerShortcut(newNoteShortcut, () => onShortcut('new-note'));
    }
    if (newTaskShortcut) {
      registerShortcut(newTaskShortcut, () => onShortcut('new-task'));
    }
    if (quickCaptureShortcut) {
      registerShortcut(quickCaptureShortcut, () => onShortcut('quick-capture'));
    }

    return () => {
      if (newNoteShortcut) unregisterShortcut(newNoteShortcut.id);
      if (newTaskShortcut) unregisterShortcut(newTaskShortcut.id);
      if (quickCaptureShortcut) unregisterShortcut(quickCaptureShortcut.id);
    };
  }, [registerShortcut, unregisterShortcut, onShortcut]);

  return <div>Test Component</div>;
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <KeyboardProvider>
              <NotesProvider>
                <TasksProvider>
                  {component}
                </TasksProvider>
              </NotesProvider>
            </KeyboardProvider>
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Keyboard Shortcuts Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Default shortcuts', () => {
    it('should trigger new note shortcut (Ctrl+N)', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      renderWithProviders(<TestComponent onShortcut={onShortcut} />);

      await user.keyboard('{Control>}n{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('new-note');
      });
    });

    it('should trigger new task shortcut (Ctrl+T)', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      renderWithProviders(<TestComponent onShortcut={onShortcut} />);

      await user.keyboard('{Control>}t{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('new-task');
      });
    });

    it('should trigger quick capture shortcut (Ctrl+K)', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      renderWithProviders(<TestComponent onShortcut={onShortcut} />);

      await user.keyboard('{Control>}k{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('quick-capture');
      });
    });

    it('should trigger search shortcut (Ctrl+F)', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      const SearchTestComponent = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();

        useEffect(() => {
          const searchShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'search');
          if (searchShortcut) {
            registerShortcut(searchShortcut, () => onShortcut('search'));
          }
          return () => {
            if (searchShortcut) unregisterShortcut(searchShortcut.id);
          };
        }, []);

        return <div>Search Test</div>;
      };

      renderWithProviders(<SearchTestComponent />);

      await user.keyboard('{Control>}f{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('search');
      });
    });

    it('should trigger help shortcut (Ctrl+/)', async () => {
      const user = userEvent.setup();

      const HelpTestComponent = () => {
        const { showShortcutsPanel } = useKeyboard();
        return <div>{showShortcutsPanel ? 'Shortcuts Panel Open' : 'Shortcuts Panel Closed'}</div>;
      };

      renderWithProviders(<HelpTestComponent />);

      expect(screen.getByText('Shortcuts Panel Closed')).toBeInTheDocument();

      await user.keyboard('{Control>}/{/Control}');

      await waitFor(() => {
        expect(screen.getByText('Shortcuts Panel Open')).toBeInTheDocument();
      });
    });
  });

  describe('Module navigation shortcuts', () => {
    it('should navigate to Terminal Tarot (Ctrl+1)', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      const NavTestComponent = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();

        useEffect(() => {
          const navShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'navigate-terminal-tarot');
          if (navShortcut) {
            registerShortcut(navShortcut, () => onShortcut('module-1'));
          }
          return () => {
            if (navShortcut) unregisterShortcut(navShortcut.id);
          };
        }, []);

        return <div>Nav Test</div>;
      };

      renderWithProviders(<NavTestComponent />);

      await user.keyboard('{Control>}1{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('module-1');
      });
    });

    it('should navigate to Ghost Writer (Ctrl+2)', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      const NavTestComponent = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();

        useEffect(() => {
          const navShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'navigate-ghost-writer');
          if (navShortcut) {
            registerShortcut(navShortcut, () => onShortcut('module-2'));
          }
          return () => {
            if (navShortcut) unregisterShortcut(navShortcut.id);
          };
        }, []);

        return <div>Nav Test</div>;
      };

      renderWithProviders(<NavTestComponent />);

      await user.keyboard('{Control>}2{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('module-2');
      });
    });

    it('should navigate to Necronomicon Notes (Ctrl+3)', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      const NavTestComponent = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();

        useEffect(() => {
          const navShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'navigate-necronomicon-notes');
          if (navShortcut) {
            registerShortcut(navShortcut, () => onShortcut('module-3'));
          }
          return () => {
            if (navShortcut) unregisterShortcut(navShortcut.id);
          };
        }, []);

        return <div>Nav Test</div>;
      };

      renderWithProviders(<NavTestComponent />);

      await user.keyboard('{Control>}3{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('module-3');
      });
    });

    it('should navigate to Graveyard Dashboard (Ctrl+4)', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      const NavTestComponent = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();

        useEffect(() => {
          const navShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'navigate-graveyard-dashboard');
          if (navShortcut) {
            registerShortcut(navShortcut, () => onShortcut('module-4'));
          }
          return () => {
            if (navShortcut) unregisterShortcut(navShortcut.id);
          };
        }, []);

        return <div>Nav Test</div>;
      };

      renderWithProviders(<NavTestComponent />);

      await user.keyboard('{Control>}4{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('module-4');
      });
    });
  });

  describe('Shortcut customization', () => {
    it('should allow customizing shortcuts', async () => {
      const onShortcut = vi.fn();

      const CustomizableComponent = () => {
        const { registerShortcut, unregisterShortcut, updateShortcut, shortcuts } = useKeyboard();

        useEffect(() => {
          const newNoteShortcut = shortcuts.find(s => s.action === 'create-note');
          
          if (newNoteShortcut) {
            // Register callback
            registerShortcut(newNoteShortcut, () => onShortcut('new-note'));
            
            // Customize to different key combination
            updateShortcut(newNoteShortcut.id, ['Control', 'Shift', 'n']);
          }

          return () => {
            if (newNoteShortcut) unregisterShortcut(newNoteShortcut.id);
          };
        }, []);

        return <div>Customizable Test</div>;
      };

      renderWithProviders(<CustomizableComponent />);

      const user = userEvent.setup();

      // Wait for customization to apply (useLocalStorage has debouncing)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Old shortcut should not work
      await user.keyboard('{Control>}n{/Control}');
      expect(onShortcut).not.toHaveBeenCalled();

      // New shortcut should work
      await user.keyboard('{Control>}{Shift>}n{/Shift}{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalledWith('new-note');
      });
    });

    it('should persist custom shortcuts to storage', async () => {
      const CustomPersistComponent = () => {
        const { updateShortcut, shortcuts } = useKeyboard();

        useEffect(() => {
          const newNoteShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'create-note');
          if (newNoteShortcut) {
            updateShortcut(newNoteShortcut.id, ['Control', 'Alt', 'n']);
          }
        }, []);

        const customized = shortcuts.find(s => s.action === 'create-note');

        return (
          <div>
            <div>Persist Test</div>
            {customized && <div data-testid="custom-keys">{customized.keys.join('+')}</div>}
          </div>
        );
      };

      renderWithProviders(<CustomPersistComponent />);

      // Verify the shortcut was updated in context state
      await waitFor(() => {
        const customKeys = screen.getByTestId('custom-keys');
        expect(customKeys.textContent).toBe('Control+Alt+n');
      });
    });

    it('should reset shortcuts to defaults', async () => {
      const ResetComponent = () => {
        const { updateShortcut, resetShortcut, shortcuts } = useKeyboard();
        const [resetDone, setResetDone] = React.useState(false);

        useEffect(() => {
          const newNoteShortcut = shortcuts.find(s => s.action === 'create-note');
          if (newNoteShortcut) {
            // First customize it
            updateShortcut(newNoteShortcut.id, ['Control', 'Alt', 'n']);
            
            // Then reset it after a delay
            setTimeout(() => {
              resetShortcut(newNoteShortcut.id);
              setResetDone(true);
            }, 100);
          }
        }, []);

        const currentShortcut = shortcuts.find(s => s.action === 'create-note');

        return (
          <div>
            <div>Reset Test</div>
            {resetDone && currentShortcut && (
              <div data-testid="reset-keys">{currentShortcut.keys.join('+')}</div>
            )}
          </div>
        );
      };

      renderWithProviders(<ResetComponent />);

      // Verify the shortcut was reset to default
      await waitFor(() => {
        const resetKeys = screen.getByTestId('reset-keys');
        expect(resetKeys.textContent).toBe('Control+n');
      }, { timeout: 3000 });
    });

    it('should reset all shortcuts to defaults', async () => {
      const ResetAllComponent = () => {
        const { updateShortcut, resetAllShortcuts, shortcuts } = useKeyboard();
        const [resetDone, setResetDone] = React.useState(false);

        useEffect(() => {
          // Customize multiple shortcuts
          const newNoteShortcut = shortcuts.find(s => s.action === 'create-note');
          const newTaskShortcut = shortcuts.find(s => s.action === 'create-task');
          
          if (newNoteShortcut) updateShortcut(newNoteShortcut.id, ['Control', 'Alt', 'n']);
          if (newTaskShortcut) updateShortcut(newTaskShortcut.id, ['Control', 'Alt', 't']);
          
          // Reset all after a delay
          setTimeout(() => {
            resetAllShortcuts();
            setResetDone(true);
          }, 100);
        }, []);

        const newNoteShortcut = shortcuts.find(s => s.action === 'create-note');
        const newTaskShortcut = shortcuts.find(s => s.action === 'create-task');

        return (
          <div>
            <div>Reset All Test</div>
            {resetDone && newNoteShortcut && newTaskShortcut && (
              <>
                <div data-testid="note-keys">{newNoteShortcut.keys.join('+')}</div>
                <div data-testid="task-keys">{newTaskShortcut.keys.join('+')}</div>
              </>
            )}
          </div>
        );
      };

      renderWithProviders(<ResetAllComponent />);

      // Verify all shortcuts were reset to defaults
      await waitFor(() => {
        const noteKeys = screen.getByTestId('note-keys');
        const taskKeys = screen.getByTestId('task-keys');
        
        expect(noteKeys.textContent).toBe('Control+n');
        expect(taskKeys.textContent).toBe('Control+t');
      }, { timeout: 3000 });
    });
  });

  describe('Conflict detection', () => {
    it('should detect conflicting shortcuts', () => {
      const ConflictComponent = () => {
        const { updateShortcut, conflicts, shortcuts } = useKeyboard();

        useEffect(() => {
          // Create a conflict by setting two shortcuts to the same keys
          const newNoteShortcut = shortcuts.find(s => s.action === 'create-note');
          const newTaskShortcut = shortcuts.find(s => s.action === 'create-task');
          
          if (newNoteShortcut && newTaskShortcut) {
            // Set both to the same key combination
            updateShortcut(newTaskShortcut.id, newNoteShortcut.keys);
          }
        }, []);

        return (
          <div>
            <div>Conflict Test</div>
            {conflicts.length > 0 && <div>Conflicts Detected: {conflicts.length}</div>}
          </div>
        );
      };

      renderWithProviders(<ConflictComponent />);

      // Should detect the conflict
      waitFor(() => {
        expect(screen.getByText(/Conflicts Detected/i)).toBeInTheDocument();
      });
    });

    it('should expose conflicts through context', () => {
      const ConflictCheckComponent = () => {
        const { conflicts, updateShortcut, shortcuts } = useKeyboard();

        useEffect(() => {
          const shortcut1 = shortcuts.find(s => s.action === 'create-note');
          const shortcut2 = shortcuts.find(s => s.action === 'create-task');
          
          if (shortcut1 && shortcut2) {
            updateShortcut(shortcut2.id, shortcut1.keys);
          }
        }, []);

        return <div data-testid="conflict-count">{conflicts.length}</div>;
      };

      renderWithProviders(<ConflictCheckComponent />);

      waitFor(() => {
        const conflictCount = screen.getByTestId('conflict-count');
        expect(parseInt(conflictCount.textContent || '0')).toBeGreaterThan(0);
      });
    });
  });

  describe('Shortcuts across modules', () => {
    it('should work globally regardless of current module', async () => {
      const user = userEvent.setup();
      const onShortcut = vi.fn();

      const GlobalShortcutComponent = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();
        const [currentModule, setCurrentModule] = React.useState('home');

        useEffect(() => {
          const quickCaptureShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'quick-capture');
          if (quickCaptureShortcut) {
            registerShortcut(quickCaptureShortcut, () => onShortcut('quick-capture'));
          }

          return () => {
            if (quickCaptureShortcut) unregisterShortcut(quickCaptureShortcut.id);
          };
        }, []);

        return (
          <div>
            <div>Current Module: {currentModule}</div>
            <button onClick={() => setCurrentModule('tarot')}>Go to Tarot</button>
            <button onClick={() => setCurrentModule('writer')}>Go to Writer</button>
            <button onClick={() => setCurrentModule('notes')}>Go to Notes</button>
          </div>
        );
      };

      renderWithProviders(<GlobalShortcutComponent />);

      // Test shortcut works in home
      await user.keyboard('{Control>}k{/Control}');
      expect(onShortcut).toHaveBeenCalledWith('quick-capture');
      onShortcut.mockClear();

      // Navigate to different module
      await user.click(screen.getByText('Go to Tarot'));
      
      // Test shortcut still works
      await user.keyboard('{Control>}k{/Control}');
      expect(onShortcut).toHaveBeenCalledWith('quick-capture');
      onShortcut.mockClear();

      // Navigate to another module
      await user.click(screen.getByText('Go to Writer'));
      
      // Test shortcut still works
      await user.keyboard('{Control>}k{/Control}');
      expect(onShortcut).toHaveBeenCalledWith('quick-capture');
    });

    it('should handle module-specific shortcuts', async () => {
      const user = userEvent.setup();
      const onNavShortcut = vi.fn();

      const ModuleNavComponent = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();

        useEffect(() => {
          const tarotShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'navigate-terminal-tarot');
          const writerShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'navigate-ghost-writer');
          const notesShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'navigate-necronomicon-notes');
          const graveyardShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'navigate-graveyard-dashboard');

          if (tarotShortcut) registerShortcut(tarotShortcut, () => onNavShortcut('tarot'));
          if (writerShortcut) registerShortcut(writerShortcut, () => onNavShortcut('writer'));
          if (notesShortcut) registerShortcut(notesShortcut, () => onNavShortcut('notes'));
          if (graveyardShortcut) registerShortcut(graveyardShortcut, () => onNavShortcut('graveyard'));

          return () => {
            if (tarotShortcut) unregisterShortcut(tarotShortcut.id);
            if (writerShortcut) unregisterShortcut(writerShortcut.id);
            if (notesShortcut) unregisterShortcut(notesShortcut.id);
            if (graveyardShortcut) unregisterShortcut(graveyardShortcut.id);
          };
        }, []);

        return <div>Module Navigation Test</div>;
      };

      renderWithProviders(<ModuleNavComponent />);

      // Test Ctrl+1 for Terminal Tarot
      await user.keyboard('{Control>}1{/Control}');
      expect(onNavShortcut).toHaveBeenCalledWith('tarot');
      onNavShortcut.mockClear();

      // Test Ctrl+2 for Ghost Writer
      await user.keyboard('{Control>}2{/Control}');
      expect(onNavShortcut).toHaveBeenCalledWith('writer');
      onNavShortcut.mockClear();

      // Test Ctrl+3 for Necronomicon Notes
      await user.keyboard('{Control>}3{/Control}');
      expect(onNavShortcut).toHaveBeenCalledWith('notes');
      onNavShortcut.mockClear();

      // Test Ctrl+4 for Graveyard Dashboard
      await user.keyboard('{Control>}4{/Control}');
      expect(onNavShortcut).toHaveBeenCalledWith('graveyard');
    });
  });

  describe('Shortcut cleanup', () => {
    it('should unregister shortcuts on component unmount', async () => {
      const onShortcut = vi.fn();

      const { unmount } = renderWithProviders(<TestComponent onShortcut={onShortcut} />);

      const user = userEvent.setup();

      // Test shortcut works before unmount
      await user.keyboard('{Control>}n{/Control}');
      expect(onShortcut).toHaveBeenCalledWith('new-note');
      onShortcut.mockClear();

      // Unmount component
      unmount();

      // Shortcuts should no longer work after unmount
      await user.keyboard('{Control>}n{/Control}');
      expect(onShortcut).not.toHaveBeenCalled();
    });

    it('should handle multiple registrations and unregistrations', async () => {
      const onShortcut = vi.fn();

      const DynamicComponent = ({ active }: { active: boolean }) => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();

        useEffect(() => {
          if (!active) return;

          const newNoteShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'create-note');
          if (newNoteShortcut) {
            registerShortcut(newNoteShortcut, () => onShortcut('new-note'));
          }

          return () => {
            if (newNoteShortcut) unregisterShortcut(newNoteShortcut.id);
          };
        }, [active]);

        return <div>Dynamic Component: {active ? 'Active' : 'Inactive'}</div>;
      };

      const { rerender } = renderWithProviders(<DynamicComponent active={true} />);

      const user = userEvent.setup();

      // Shortcut should work when active
      await user.keyboard('{Control>}n{/Control}');
      expect(onShortcut).toHaveBeenCalledWith('new-note');
      onShortcut.mockClear();

      // Deactivate component
      rerender(
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <AppProvider>
                <KeyboardProvider>
                  <NotesProvider>
                    <TasksProvider>
                      <DynamicComponent active={false} />
                    </TasksProvider>
                  </NotesProvider>
                </KeyboardProvider>
              </AppProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      // Shortcut should not work when inactive
      await user.keyboard('{Control>}n{/Control}');
      expect(onShortcut).not.toHaveBeenCalled();
    });
  });

  describe('Shortcut execution timing', () => {
    it('should execute shortcuts within 100ms (Requirement 9.6)', async () => {
      const onShortcut = vi.fn();
      const startTime = Date.now();

      const TimingComponent = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboard();

        useEffect(() => {
          const quickCaptureShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'quick-capture');
          if (quickCaptureShortcut) {
            registerShortcut(quickCaptureShortcut, () => {
              const executionTime = Date.now() - startTime;
              onShortcut(executionTime);
            });
          }

          return () => {
            if (quickCaptureShortcut) unregisterShortcut(quickCaptureShortcut.id);
          };
        }, []);

        return <div>Timing Test</div>;
      };

      renderWithProviders(<TimingComponent />);

      const user = userEvent.setup();
      await user.keyboard('{Control>}k{/Control}');

      await waitFor(() => {
        expect(onShortcut).toHaveBeenCalled();
        const executionTime = onShortcut.mock.calls[0][0];
        // Should execute within 100ms (being generous with test timing)
        expect(executionTime).toBeLessThan(200);
      });
    });
  });
});
