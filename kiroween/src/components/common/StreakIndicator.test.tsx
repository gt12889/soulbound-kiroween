import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StreakIndicator } from './StreakIndicator';
import * as StreakContext from '../../contexts/StreakContext';
import * as AudioHook from '../../hooks/useAudio';

// Mock the contexts and hooks
vi.mock('../../contexts/StreakContext');
vi.mock('../../hooks/useAudio');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('StreakIndicator', () => {
  const mockPlayUIClick = vi.fn();
  const mockPlayUIHover = vi.fn();
  const mockIsStreakAtRisk = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup audio mock
    vi.spyOn(AudioHook, 'useAudio').mockReturnValue({
      playUIClick: mockPlayUIClick,
      playUIHover: mockPlayUIHover,
      playUISuccess: vi.fn(),
      playUIError: vi.fn(),
      playNotification: vi.fn(),
      playAchievement: vi.fn(),
      playMilestone: vi.fn(),
      playStreakWarning: vi.fn(),
      playStreakBroken: vi.fn(),
      playStreakRecovered: vi.fn(),
      playCompanionInteraction: vi.fn(),
      playCompanionLevelUp: vi.fn(),
      playTaskComplete: vi.fn(),
      playTaskDelete: vi.fn(),
      playNoteCreate: vi.fn(),
      playNoteDelete: vi.fn(),
      playTimerStart: vi.fn(),
      playTimerComplete: vi.fn(),
      playTimerBreak: vi.fn(),
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <StreakIndicator />
      </BrowserRouter>
    );
  };

  it('should not render when loading', () => {
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: null,
      loading: true,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('should not render when no streaks exist', () => {
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: null,
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('should not render when all streaks are zero', () => {
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '2024-01-01' },
        taskStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '2024-01-01' },
        focusStreak: { current: 0, longest: 0, lastActivityDate: '', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 0, earned: 0, used: 0 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('should render with highest streak number', () => {
    mockIsStreakAtRisk.mockReturnValue(false);
    
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 1, earned: 2, used: 1 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    renderComponent();
    
    // Should show the highest streak (15)
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('should show warning badge when streak at risk', () => {
    mockIsStreakAtRisk.mockImplementation((type) => type === 'task');
    
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-04', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 1, earned: 2, used: 1 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    renderComponent();
    
    // Should show warning badge
    const warningBadges = screen.getAllByText('⚠️');
    expect(warningBadges.length).toBeGreaterThan(0);
  });

  it('should apply pulse animation class when streak at risk', () => {
    mockIsStreakAtRisk.mockImplementation((type) => type === 'task');
    
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-04', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 1, earned: 2, used: 1 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    const { container } = renderComponent();
    
    // Should apply atRisk class to indicator for pulse animation
    const indicator = screen.getByRole('button');
    expect(indicator.className).toContain('atRisk');
  });

  it('should not apply pulse animation class when no streak at risk', () => {
    mockIsStreakAtRisk.mockReturnValue(false);
    
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 1, earned: 2, used: 1 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    const { container } = renderComponent();
    
    // Should NOT apply atRisk class when no streaks at risk
    const indicator = screen.getByRole('button');
    expect(indicator.className).not.toContain('atRisk');
  });

  it('should navigate to streaks page on click', () => {
    mockIsStreakAtRisk.mockReturnValue(false);
    
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 1, earned: 2, used: 1 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    renderComponent();
    
    const indicator = screen.getByRole('button');
    fireEvent.click(indicator);
    
    expect(mockPlayUIClick).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/streaks');
  });

  it('should play hover sound on mouse enter', () => {
    mockIsStreakAtRisk.mockReturnValue(false);
    
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 1, earned: 2, used: 1 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    renderComponent();
    
    const indicator = screen.getByRole('button');
    fireEvent.mouseEnter(indicator);
    
    expect(mockPlayUIHover).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    mockIsStreakAtRisk.mockReturnValue(false);
    
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 1, earned: 2, used: 1 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    renderComponent();
    
    const indicator = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(indicator, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/streaks');
    
    mockNavigate.mockClear();
    
    // Test Space key
    fireEvent.keyDown(indicator, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith('/streaks');
  });

  it('should have proper accessibility attributes', () => {
    mockIsStreakAtRisk.mockReturnValue(false);
    
    vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
      streaks: {
        loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
        noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
        focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
        tokens: { available: 1, earned: 2, used: 1 },
        milestones: {},
        activityHistory: {},
      },
      loading: false,
      checkStreaks: vi.fn(),
      recordActivity: vi.fn(),
      useRecoveryToken: vi.fn(),
      isStreakAtRisk: mockIsStreakAtRisk,
      nextMilestone: vi.fn(),
      heatmapData: [],
      updateStreakGoals: vi.fn(),
      toggleNotifications: vi.fn(),
      streakGoals: {
        taskGoal: 1,
        focusGoal: 25,
        notificationsEnabled: true,
        notificationTime: '20:00',
      },
    });

    renderComponent();
    
    const indicator = screen.getByRole('button');
    expect(indicator).toHaveAttribute('tabIndex', '0');
    expect(indicator).toHaveAttribute('aria-label');
    expect(indicator.getAttribute('aria-label')).toContain('Current streak: 15 days');
  });

  describe('Tooltip', () => {
    it('should show tooltip on hover', () => {
      mockIsStreakAtRisk.mockReturnValue(false);
      
      vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
        streaks: {
          loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
          noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
          tokens: { available: 1, earned: 2, used: 1 },
          milestones: {},
          activityHistory: {},
        },
        loading: false,
        checkStreaks: vi.fn(),
        recordActivity: vi.fn(),
        useRecoveryToken: vi.fn(),
        isStreakAtRisk: mockIsStreakAtRisk,
        nextMilestone: vi.fn(),
        heatmapData: [],
        updateStreakGoals: vi.fn(),
        toggleNotifications: vi.fn(),
        streakGoals: {
          taskGoal: 1,
          focusGoal: 25,
          notificationsEnabled: true,
          notificationTime: '20:00',
        },
      });

      renderComponent();
      
      const indicator = screen.getByRole('button');
      
      // Tooltip should not be visible initially
      expect(screen.queryByText('Your Streaks')).not.toBeInTheDocument();
      
      // Hover over indicator
      fireEvent.mouseEnter(indicator);
      
      // Tooltip should now be visible
      expect(screen.getByText('Your Streaks')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Focus')).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', () => {
      mockIsStreakAtRisk.mockReturnValue(false);
      
      vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
        streaks: {
          loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
          noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
          tokens: { available: 1, earned: 2, used: 1 },
          milestones: {},
          activityHistory: {},
        },
        loading: false,
        checkStreaks: vi.fn(),
        recordActivity: vi.fn(),
        useRecoveryToken: vi.fn(),
        isStreakAtRisk: mockIsStreakAtRisk,
        nextMilestone: vi.fn(),
        heatmapData: [],
        updateStreakGoals: vi.fn(),
        toggleNotifications: vi.fn(),
        streakGoals: {
          taskGoal: 1,
          focusGoal: 25,
          notificationsEnabled: true,
          notificationTime: '20:00',
        },
      });

      renderComponent();
      
      const indicator = screen.getByRole('button');
      
      // Show tooltip
      fireEvent.mouseEnter(indicator);
      expect(screen.getByText('Your Streaks')).toBeInTheDocument();
      
      // Hide tooltip
      fireEvent.mouseLeave(indicator);
      expect(screen.queryByText('Your Streaks')).not.toBeInTheDocument();
    });

    it('should show tooltip on focus for keyboard users', () => {
      mockIsStreakAtRisk.mockReturnValue(false);
      
      vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
        streaks: {
          loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
          noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
          tokens: { available: 1, earned: 2, used: 1 },
          milestones: {},
          activityHistory: {},
        },
        loading: false,
        checkStreaks: vi.fn(),
        recordActivity: vi.fn(),
        useRecoveryToken: vi.fn(),
        isStreakAtRisk: mockIsStreakAtRisk,
        nextMilestone: vi.fn(),
        heatmapData: [],
        updateStreakGoals: vi.fn(),
        toggleNotifications: vi.fn(),
        streakGoals: {
          taskGoal: 1,
          focusGoal: 25,
          notificationsEnabled: true,
          notificationTime: '20:00',
        },
      });

      renderComponent();
      
      const indicator = screen.getByRole('button');
      
      // Focus on indicator
      fireEvent.focus(indicator);
      
      // Tooltip should be visible
      expect(screen.getByText('Your Streaks')).toBeInTheDocument();
    });

    it('should display all streak values correctly in tooltip', () => {
      mockIsStreakAtRisk.mockReturnValue(false);
      
      vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
        streaks: {
          loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
          noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
          tokens: { available: 1, earned: 2, used: 1 },
          milestones: {},
          activityHistory: {},
        },
        loading: false,
        checkStreaks: vi.fn(),
        recordActivity: vi.fn(),
        useRecoveryToken: vi.fn(),
        isStreakAtRisk: mockIsStreakAtRisk,
        nextMilestone: vi.fn(),
        heatmapData: [],
        updateStreakGoals: vi.fn(),
        toggleNotifications: vi.fn(),
        streakGoals: {
          taskGoal: 1,
          focusGoal: 25,
          notificationsEnabled: true,
          notificationTime: '20:00',
        },
      });

      renderComponent();
      
      const indicator = screen.getByRole('button');
      fireEvent.mouseEnter(indicator);
      
      // Check all streak values are displayed
      expect(screen.getByText('5 days')).toBeInTheDocument(); // Login
      expect(screen.getByText('15 days')).toBeInTheDocument(); // Tasks
      expect(screen.getByText('8 days')).toBeInTheDocument(); // Notes
      expect(screen.getByText('3 days')).toBeInTheDocument(); // Focus
    });

    it('should show warning indicator for at-risk streaks in tooltip', () => {
      mockIsStreakAtRisk.mockImplementation((type) => type === 'task');
      
      vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
        streaks: {
          loginStreak: { current: 5, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          taskStreak: { current: 15, longest: 20, lastActivityDate: '2024-01-04', startDate: '2024-01-01', customGoal: 1 },
          noteStreak: { current: 8, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          focusStreak: { current: 3, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
          tokens: { available: 1, earned: 2, used: 1 },
          milestones: {},
          activityHistory: {},
        },
        loading: false,
        checkStreaks: vi.fn(),
        recordActivity: vi.fn(),
        useRecoveryToken: vi.fn(),
        isStreakAtRisk: mockIsStreakAtRisk,
        nextMilestone: vi.fn(),
        heatmapData: [],
        updateStreakGoals: vi.fn(),
        toggleNotifications: vi.fn(),
        streakGoals: {
          taskGoal: 1,
          focusGoal: 25,
          notificationsEnabled: true,
          notificationTime: '20:00',
        },
      });

      renderComponent();
      
      const indicator = screen.getByRole('button');
      fireEvent.mouseEnter(indicator);
      
      // Should show warning indicators in tooltip
      const warningIcons = screen.getAllByText('⚠️');
      expect(warningIcons.length).toBeGreaterThan(0);
    });

    it('should show singular "day" for streak of 1', () => {
      mockIsStreakAtRisk.mockReturnValue(false);
      
      vi.spyOn(StreakContext, 'useStreak').mockReturnValue({
        streaks: {
          loginStreak: { current: 1, longest: 10, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          taskStreak: { current: 1, longest: 20, lastActivityDate: '2024-01-05', startDate: '2024-01-01', customGoal: 1 },
          noteStreak: { current: 1, longest: 12, lastActivityDate: '2024-01-05', startDate: '2024-01-01' },
          focusStreak: { current: 1, longest: 7, lastActivityDate: '2024-01-05', startDate: '2024-01-01', minimumMinutes: 25 },
          tokens: { available: 1, earned: 2, used: 1 },
          milestones: {},
          activityHistory: {},
        },
        loading: false,
        checkStreaks: vi.fn(),
        recordActivity: vi.fn(),
        useRecoveryToken: vi.fn(),
        isStreakAtRisk: mockIsStreakAtRisk,
        nextMilestone: vi.fn(),
        heatmapData: [],
        updateStreakGoals: vi.fn(),
        toggleNotifications: vi.fn(),
        streakGoals: {
          taskGoal: 1,
          focusGoal: 25,
          notificationsEnabled: true,
          notificationTime: '20:00',
        },
      });

      renderComponent();
      
      const indicator = screen.getByRole('button');
      fireEvent.mouseEnter(indicator);
      
      // Should show singular "day" for all streaks
      const dayTexts = screen.getAllByText('1 day');
      expect(dayTexts.length).toBe(4); // All four streaks have 1 day
    });
  });
});
