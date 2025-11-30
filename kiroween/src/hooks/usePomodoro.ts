import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { PomodoroSession, PomodoroState } from '../types';

/**
 * Custom hook for managing pomodoro timer
 * Implements configurable work/break durations with start, pause, resume, reset functions
 * Tracks completed sessions and persists timer state across refreshes
 * Requirements: 12.2, 12.3, 12.7
 */
export function usePomodoro() {
  // Persist sessions to LocalStorage
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>('pomodoro_sessions', []);
  
  // Persist timer state to LocalStorage
  const [pomodoroState, setPomodoroState] = useLocalStorage<PomodoroState>('pomodoro_state', {
    isRunning: false,
    isPaused: false,
    currentType: 'work',
    timeRemaining: 25 * 60, // 25 minutes in seconds
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    currentSessionId: null,
  });

  const [state, setState] = useState<PomodoroState>(pomodoroState);
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Sync state to localStorage when it changes
  useEffect(() => {
    setPomodoroState(state);
  }, [state, setPomodoroState]);

  // Timer tick logic
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        lastTickRef.current = now;

        setState(prev => {
          const newTimeRemaining = Math.max(0, prev.timeRemaining - elapsed);
          
          // Timer completed
          if (newTimeRemaining === 0) {
            // Complete current session
            if (prev.currentSessionId) {
              completeSession(prev.currentSessionId);
            }
            
            return {
              ...prev,
              isRunning: false,
              isPaused: false,
              timeRemaining: 0,
              currentSessionId: null,
            };
          }

          return {
            ...prev,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.isRunning, state.isPaused]);

  // Complete a session
  const completeSession = useCallback((sessionId: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId
          ? { ...session, endTime: new Date(), completed: true }
          : session
      )
    );
  }, [setSessions]);

  // Start timer
  const start = useCallback(() => {
    const sessionId = `session_${Date.now()}`;
    const newSession: PomodoroSession = {
      id: sessionId,
      startTime: new Date(),
      duration: state.currentType === 'work' ? state.workDuration : state.breakDuration,
      type: state.currentType,
      completed: false,
    };

    setSessions(prev => [...prev, newSession]);
    lastTickRef.current = Date.now();

    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      currentSessionId: sessionId,
      timeRemaining: prev.currentType === 'work' ? prev.workDuration : prev.breakDuration,
    }));
  }, [state.currentType, state.workDuration, state.breakDuration, setSessions]);

  // Pause timer
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  // Resume timer
  const resume = useCallback(() => {
    lastTickRef.current = Date.now();
    setState(prev => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  // Reset timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: prev.currentType === 'work' ? prev.workDuration : prev.breakDuration,
      currentSessionId: null,
    }));
  }, []);

  // Switch between work and break
  const switchType = useCallback((type: 'work' | 'break') => {
    setState(prev => ({
      ...prev,
      currentType: type,
      timeRemaining: type === 'work' ? prev.workDuration : prev.breakDuration,
      isRunning: false,
      isPaused: false,
      currentSessionId: null,
    }));
  }, []);

  // Configure durations (in minutes)
  const setWorkDuration = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setState(prev => ({
      ...prev,
      workDuration: seconds,
      timeRemaining: prev.currentType === 'work' && !prev.isRunning ? seconds : prev.timeRemaining,
    }));
  }, []);

  const setBreakDuration = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setState(prev => ({
      ...prev,
      breakDuration: seconds,
      timeRemaining: prev.currentType === 'break' && !prev.isRunning ? seconds : prev.timeRemaining,
    }));
  }, []);

  // Get completed sessions
  const getCompletedSessions = useCallback(() => {
    return sessions.filter(s => s.completed);
  }, [sessions]);

  // Get sessions for today
  const getTodaySessions = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime() && s.completed;
    });
  }, [sessions]);

  // Get statistics
  const getStatistics = useCallback(() => {
    const completed = getCompletedSessions();
    const today = getTodaySessions();
    
    return {
      totalSessions: completed.length,
      todaySessions: today.length,
      totalWorkTime: completed
        .filter(s => s.type === 'work')
        .reduce((sum, s) => sum + s.duration, 0),
      totalBreakTime: completed
        .filter(s => s.type === 'break')
        .reduce((sum, s) => sum + s.duration, 0),
    };
  }, [getCompletedSessions, getTodaySessions]);

  return {
    // State
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    currentType: state.currentType,
    timeRemaining: state.timeRemaining,
    workDuration: state.workDuration,
    breakDuration: state.breakDuration,
    
    // Actions
    start,
    pause,
    resume,
    reset,
    switchType,
    setWorkDuration,
    setBreakDuration,
    
    // Data
    sessions,
    getCompletedSessions,
    getTodaySessions,
    getStatistics,
  };
}
