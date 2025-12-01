import React, { useState, useEffect } from 'react';
import { MilestoneCelebration, type StreakPropertyType } from './MilestoneCelebration';
import { useStreak } from '../../contexts/StreakContext';
import { useCompanion } from '../../contexts/CompanionContext';

/**
 * Example: Integrating MilestoneCelebration with StreakContext
 * 
 * This example shows how to:
 * 1. Detect when a milestone is reached
 * 2. Show the celebration animation
 * 3. Award XP to the companion
 * 4. Trigger companion dialogue
 */
export const MilestoneCelebrationExample: React.FC = () => {
  const { streaks } = useStreak();
  const { addExperience } = useCompanion();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<{
    type: StreakPropertyType;
    day: number;
  } | null>(null);
  
  // Track previous streak values to detect milestones
  const [previousStreaks, setPreviousStreaks] = useState<Record<StreakPropertyType, number>>({
    loginStreak: 0,
    taskStreak: 0,
    noteStreak: 0,
    focusStreak: 0,
  });
  
  // Milestone days that trigger celebrations
  const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100, 365];
  
  // Check for milestone achievements
  useEffect(() => {
    if (!streaks) return;
    
    const streakTypes: StreakPropertyType[] = ['loginStreak', 'taskStreak', 'noteStreak', 'focusStreak'];
    
    for (const type of streakTypes) {
      const currentStreak = streaks[type].current;
      const previousStreak = previousStreaks[type];
      
      // Check if we just reached a milestone
      if (currentStreak > previousStreak) {
        const reachedMilestone = MILESTONE_DAYS.find(
          day => currentStreak >= day && previousStreak < day
        );
        
        if (reachedMilestone) {
          // Show celebration
          setCurrentMilestone({ type, day: reachedMilestone });
          setShowCelebration(true);
          
          // Award XP based on milestone
          const xpReward = calculateXPReward(reachedMilestone);
          addExperience(xpReward);
        }
      }
    }
    
    // Update previous streaks
    setPreviousStreaks({
      loginStreak: streaks.loginStreak.current,
      taskStreak: streaks.taskStreak.current,
      noteStreak: streaks.noteStreak.current,
      focusStreak: streaks.focusStreak.current,
    });
  }, [streaks, previousStreaks, addExperience]);
  
  // Calculate XP reward based on milestone
  const calculateXPReward = (milestoneDay: number): number => {
    const xpMap: Record<number, number> = {
      3: 50,
      7: 100,
      14: 200,
      30: 500,
      60: 1000,
      100: 2000,
      365: 5000,
    };
    return xpMap[milestoneDay] || 100;
  };
  
  // Handle celebration completion
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setCurrentMilestone(null);
  };
  
  return (
    <>
      {/* Your streak dashboard content */}
      <div>
        <h2>Streak Dashboard</h2>
        {/* ... streak cards, heatmap, etc. ... */}
      </div>
      
      {/* Milestone celebration overlay */}
      {currentMilestone && (
        <MilestoneCelebration
          streakType={currentMilestone.type}
          milestoneDay={currentMilestone.day}
          show={showCelebration}
          onComplete={handleCelebrationComplete}
          duration={3000}
        />
      )}
    </>
  );
};

/**
 * Example: Manual Milestone Celebration Trigger
 * 
 * This example shows how to manually trigger a celebration
 * (useful for testing or special events)
 */
export const ManualCelebrationExample: React.FC = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  
  const triggerCelebration = () => {
    setShowCelebration(true);
  };
  
  return (
    <div>
      <button onClick={triggerCelebration}>
        Trigger 7-Day Login Streak Celebration
      </button>
      
      <MilestoneCelebration
        streakType="loginStreak"
        milestoneDay={7}
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};

/**
 * Example: Celebration with Companion Integration
 * 
 * This example shows how to integrate the celebration with
 * companion dialogue and particle effects
 */
export const CelebrationWithCompanionExample: React.FC = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const { addExperience } = useCompanion();
  
  const handleMilestoneReached = (type: StreakPropertyType, day: number) => {
    // Show celebration
    setShowCelebration(true);
    
    // Award XP
    const xpReward = day * 10;
    addExperience(xpReward);
    
    // Companion will automatically react to XP gain
    // and show appropriate dialogue based on mood
  };
  
  return (
    <div>
      <button onClick={() => handleMilestoneReached('taskStreak', 30)}>
        Reach 30-Day Task Streak
      </button>
      
      <MilestoneCelebration
        streakType="taskStreak"
        milestoneDay={30}
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};

export default MilestoneCelebrationExample;
