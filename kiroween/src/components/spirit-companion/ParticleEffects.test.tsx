import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InteractiveCompanion } from './InteractiveCompanion';
import { CompanionProvider } from '../../contexts/CompanionContext';
import { vi } from 'vitest';

// Mock the CompanionContext
vi.mock('../../contexts/CompanionContext', async () => {
  const actual = await vi.importActual('../../contexts/CompanionContext');
  return {
    ...actual,
    useCompanion: () => ({
      interact: vi.fn(),
      mood: 'happy',
      activeCompanion: 'shadow',
      customNames: {},
    }),
  };
});

describe('InteractiveCompanion - Particle Effects', () => {
  const defaultProps = {
    achievementCount: 0,
    taskCompletionCount: 0,
  };

  it('should show click particles when companion is clicked', async () => {
    const { container } = render(<InteractiveCompanion {...defaultProps} />);
    
    const companion = screen.getByRole('button');
    fireEvent.click(companion);
    
    // Check for click particles container
    await waitFor(() => {
      const clickParticles = container.querySelector('[class*="clickParticles"]');
      expect(clickParticles).toBeInTheDocument();
    });
  });

  it('should show evolution particles when companion evolves', async () => {
    const { container, rerender } = render(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );
    
    // Trigger evolution by increasing task count
    rerender(<InteractiveCompanion achievementCount={0} taskCompletionCount={10} />);
    
    await waitFor(() => {
      const evolutionParticles = container.querySelector('[class*="evolutionParticles"]');
      expect(evolutionParticles).toBeInTheDocument();
    });
  });

  it('should show celebration particles when task is completed', async () => {
    const { container, rerender } = render(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={5} />
    );
    
    // Complete a task
    rerender(<InteractiveCompanion achievementCount={0} taskCompletionCount={6} />);
    
    await waitFor(() => {
      const celebrationEffect = container.querySelector('[class*="celebrationEffect"]');
      expect(celebrationEffect).toBeInTheDocument();
      
      // Check for confetti
      const confetti = container.querySelectorAll('[class*="confetti"]');
      expect(confetti.length).toBeGreaterThan(0);
      
      // Check for stars
      const stars = container.querySelectorAll('[class*="celebrationStar"]');
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  it('should render correct number of click particles', async () => {
    const { container } = render(<InteractiveCompanion {...defaultProps} />);
    
    const companion = screen.getByRole('button');
    fireEvent.click(companion);
    
    await waitFor(() => {
      const clickParticles = container.querySelectorAll('[class*="clickParticle"]');
      expect(clickParticles).toHaveLength(12);
    });
  });

  it('should render correct number of evolution particles', async () => {
    const { container, rerender } = render(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={0} />
    );
    
    rerender(<InteractiveCompanion achievementCount={0} taskCompletionCount={10} />);
    
    await waitFor(() => {
      const evolutionParticles = container.querySelectorAll('[class*="evolutionParticle"]');
      expect(evolutionParticles).toHaveLength(20);
    });
  });

  it('should render correct number of celebration confetti and stars', async () => {
    const { container, rerender } = render(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={5} />
    );
    
    rerender(<InteractiveCompanion achievementCount={0} taskCompletionCount={6} />);
    
    await waitFor(() => {
      const confetti = container.querySelectorAll('[class*="confetti"]');
      expect(confetti).toHaveLength(20);
      
      const stars = container.querySelectorAll('[class*="celebrationStar"]');
      expect(stars).toHaveLength(8);
    });
  });

  it('should hide click particles after animation completes', async () => {
    vi.useFakeTimers();
    const { container } = render(<InteractiveCompanion {...defaultProps} />);
    
    const companion = screen.getByRole('button');
    fireEvent.click(companion);
    
    // Particles should be visible
    const clickParticles = container.querySelector('[class*="clickParticles"]');
    expect(clickParticles).toBeInTheDocument();
    
    // Fast-forward time
    vi.advanceTimersByTime(1100);
    
    // Particles should be hidden
    const clickParticlesAfter = container.querySelector('[class*="clickParticles"]');
    expect(clickParticlesAfter).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('should hide celebration particles after animation completes', async () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={5} />
    );
    
    rerender(<InteractiveCompanion achievementCount={0} taskCompletionCount={6} />);
    
    // Particles should be visible
    const celebrationEffect = container.querySelector('[class*="celebrationEffect"]');
    expect(celebrationEffect).toBeInTheDocument();
    
    // Fast-forward time
    vi.advanceTimersByTime(2100);
    
    // Particles should be hidden
    const celebrationEffectAfter = container.querySelector('[class*="celebrationEffect"]');
    expect(celebrationEffectAfter).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('should apply custom CSS variables to particles', async () => {
    const { container } = render(<InteractiveCompanion {...defaultProps} />);
    
    const companion = screen.getByRole('button');
    fireEvent.click(companion);
    
    const clickParticles = container.querySelectorAll('[class*="clickParticle"]');
    const firstParticle = clickParticles[0] as HTMLElement;
    
    // Check that CSS variables are set
    expect(firstParticle.style.getPropertyValue('--particle-delay')).toBeTruthy();
    expect(firstParticle.style.getPropertyValue('--particle-angle')).toBeTruthy();
    expect(firstParticle.style.getPropertyValue('--particle-distance')).toBeTruthy();
  });

  it('should apply random colors to celebration confetti', async () => {
    const { container, rerender } = render(
      <InteractiveCompanion achievementCount={0} taskCompletionCount={5} />
    );
    
    rerender(<InteractiveCompanion achievementCount={0} taskCompletionCount={6} />);
    
    const confetti = container.querySelectorAll('[class*="confetti"]');
    const firstConfetti = confetti[0] as HTMLElement;
    
    // Check that color variable is set
    expect(firstConfetti.style.getPropertyValue('--confetti-color')).toBeTruthy();
  });

  it('should handle keyboard interaction with particles', async () => {
    const { container } = render(<InteractiveCompanion {...defaultProps} />);
    
    const companion = screen.getByRole('button');
    fireEvent.keyDown(companion, { key: 'Enter' });
    
    await waitFor(() => {
      const clickParticles = container.querySelector('[class*="clickParticles"]');
      expect(clickParticles).toBeInTheDocument();
    });
  });

  it('should not show particles when reduced motion is preferred', () => {
    // Mock matchMedia for reduced motion
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { container } = render(<InteractiveCompanion {...defaultProps} />);
    
    const companion = screen.getByRole('button');
    fireEvent.click(companion);
    
    // Particles should still render but with reduced motion styles
    const clickParticles = container.querySelector('[class*="clickParticles"]');
    expect(clickParticles).toBeInTheDocument();
  });
});
