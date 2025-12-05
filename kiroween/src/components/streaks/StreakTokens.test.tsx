import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StreakTokens } from './StreakTokens';

describe('StreakTokens', () => {
  describe('Token Display', () => {
    it('should render token count with correct visual representation', () => {
      render(<StreakTokens availableTokens={2} />);
      
      // Check aria-label
      const tokenDisplay = screen.getByRole('img', { name: /2 of 3 recovery tokens available/i });
      expect(tokenDisplay).toBeInTheDocument();
      
      // Check visual representation (●●○)
      expect(tokenDisplay.textContent).toBe('●●○');
    });

    it('should render all tokens as available when at maximum', () => {
      render(<StreakTokens availableTokens={3} />);
      
      const tokenDisplay = screen.getByRole('img', { name: /3 of 3 recovery tokens available/i });
      expect(tokenDisplay.textContent).toBe('●●●');
    });

    it('should render all tokens as empty when none available', () => {
      render(<StreakTokens availableTokens={0} />);
      
      const tokenDisplay = screen.getByRole('img', { name: /0 of 3 recovery tokens available/i });
      expect(tokenDisplay.textContent).toBe('○○○');
    });

    it('should clamp token count to valid range (0-3)', () => {
      const { rerender } = render(<StreakTokens availableTokens={5} />);
      
      // Should clamp to 3
      let tokenDisplay = screen.getByRole('img', { name: /3 of 3 recovery tokens available/i });
      expect(tokenDisplay.textContent).toBe('●●●');
      
      // Should clamp to 0
      rerender(<StreakTokens availableTokens={-1} />);
      tokenDisplay = screen.getByRole('img', { name: /0 of 3 recovery tokens available/i });
      expect(tokenDisplay.textContent).toBe('○○○');
    });

    it('should display token count in text format', () => {
      render(<StreakTokens availableTokens={2} />);
      
      expect(screen.getByText('(2/3)')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should render tooltip with explanation', () => {
      const { container } = render(<StreakTokens availableTokens={2} />);
      
      // Tooltip exists in DOM (even if hidden by CSS)
      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      
      // Check tooltip content
      expect(screen.getByText(/Recovery tokens allow you to restore a broken streak/i)).toBeInTheDocument();
      expect(screen.getByText(/How to Earn Tokens:/i)).toBeInTheDocument();
      expect(screen.getByText(/Reach a 30-day streak:/i)).toBeInTheDocument();
      expect(screen.getByText(/\+1 token/i)).toBeInTheDocument();
      expect(screen.getByText(/Reach a 100-day streak:/i)).toBeInTheDocument();
      expect(screen.getByText(/\+2 tokens/i)).toBeInTheDocument();
    });

    it('should show next token milestone when provided', () => {
      render(
        <StreakTokens 
          availableTokens={1} 
          nextTokenMilestone={30}
          daysUntilNextToken={7}
        />
      );
      
      // Check tooltip section
      expect(screen.getByText(/Next Token:/i)).toBeInTheDocument();
      expect(screen.getByText(/7 days/i)).toBeInTheDocument();
      expect(screen.getByText(/30-day milestone/i)).toBeInTheDocument();
      
      // Check inline milestone info
      expect(screen.getByText(/Next token in/i)).toBeInTheDocument();
      // Use getAllByText since "7" appears twice (in tooltip and inline)
      const sevenElements = screen.getAllByText(/7/);
      expect(sevenElements.length).toBeGreaterThan(0);
    });

    it('should not show milestone info when not provided', () => {
      render(<StreakTokens availableTokens={2} />);
      
      expect(screen.queryByText(/Next Token:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Next token in/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<StreakTokens availableTokens={2} />);
      
      const tokenDisplay = screen.getByRole('img');
      expect(tokenDisplay).toHaveAttribute('aria-label', '2 of 3 recovery tokens available');
    });

    it('should have tooltip role', () => {
      const { container } = render(<StreakTokens availableTokens={2} />);
      
      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });

    it('should hide decorative elements from screen readers', () => {
      const { container } = render(<StreakTokens availableTokens={2} />);
      
      // Token label emoji should be hidden
      const tokenLabel = container.querySelector('[class*="tokenLabel"]');
      expect(tokenLabel).toHaveAttribute('aria-hidden', 'true');
      
      // Individual token icons (span elements) should be hidden
      const tokenIcons = container.querySelectorAll('span[class*="tokenIcon"]');
      expect(tokenIcons.length).toBe(3);
      tokenIcons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
      
      // Token count should be hidden (redundant with aria-label)
      const tokenCount = container.querySelector('[class*="tokenCount"]');
      expect(tokenCount).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <StreakTokens availableTokens={2} className="custom-class" />
      );
      
      const tokenContainer = container.querySelector('[class*="tokenContainer"]');
      expect(tokenContainer).toHaveClass('custom-class');
    });
  });

  describe('Visual States', () => {
    it('should apply different styles to available vs empty tokens', () => {
      const { container } = render(<StreakTokens availableTokens={1} />);
      
      const tokenIcons = container.querySelectorAll('span[class*="tokenIcon"]');
      expect(tokenIcons).toHaveLength(3);
      
      // First token should be available
      expect(tokenIcons[0].className).toContain('tokenAvailable');
      expect(tokenIcons[0].className).not.toContain('tokenEmpty');
      
      // Second and third should be empty
      expect(tokenIcons[1].className).toContain('tokenEmpty');
      expect(tokenIcons[1].className).not.toContain('tokenAvailable');
      expect(tokenIcons[2].className).toContain('tokenEmpty');
      expect(tokenIcons[2].className).not.toContain('tokenAvailable');
    });
  });

  describe('Token Earning Animation', () => {
    it('should apply celebrating class when onTokenEarned is true', () => {
      const { container } = render(
        <StreakTokens availableTokens={2} onTokenEarned={true} />
      );
      
      const tokenContainer = container.querySelector('[class*="tokenContainer"]');
      expect(tokenContainer?.className).toContain('celebrating');
    });

    it('should detect when token count increases', () => {
      const { container, rerender } = render(
        <StreakTokens availableTokens={1} />
      );
      
      let tokenContainer = container.querySelector('[class*="tokenContainer"]');
      expect(tokenContainer?.className).not.toContain('celebrating');
      
      // Increase token count
      rerender(<StreakTokens availableTokens={2} />);
      
      tokenContainer = container.querySelector('[class*="tokenContainer"]');
      expect(tokenContainer?.className).toContain('celebrating');
    });

    it('should not celebrate when token count decreases', () => {
      const { container, rerender } = render(
        <StreakTokens availableTokens={2} />
      );
      
      // Decrease token count
      rerender(<StreakTokens availableTokens={1} />);
      
      const tokenContainer = container.querySelector('[class*="tokenContainer"]');
      expect(tokenContainer?.className).not.toContain('celebrating');
    });

    it('should not celebrate when token count stays the same', () => {
      const { container, rerender } = render(
        <StreakTokens availableTokens={2} />
      );
      
      // Re-render with same count
      rerender(<StreakTokens availableTokens={2} />);
      
      const tokenContainer = container.querySelector('[class*="tokenContainer"]');
      expect(tokenContainer?.className).not.toContain('celebrating');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero tokens', () => {
      render(<StreakTokens availableTokens={0} />);
      
      const tokenDisplay = screen.getByRole('img', { name: /0 of 3 recovery tokens available/i });
      expect(tokenDisplay).toBeInTheDocument();
      expect(screen.getByText('(0/3)')).toBeInTheDocument();
    });

    it('should handle maximum tokens', () => {
      render(<StreakTokens availableTokens={3} />);
      
      const tokenDisplay = screen.getByRole('img', { name: /3 of 3 recovery tokens available/i });
      expect(tokenDisplay).toBeInTheDocument();
      expect(screen.getByText('(3/3)')).toBeInTheDocument();
    });

    it('should handle milestone with 0 days remaining', () => {
      render(
        <StreakTokens 
          availableTokens={2} 
          nextTokenMilestone={30}
          daysUntilNextToken={0}
        />
      );
      
      expect(screen.getByText(/0 days/i)).toBeInTheDocument();
    });

    it('should handle milestone with 1 day remaining', () => {
      render(
        <StreakTokens 
          availableTokens={2} 
          nextTokenMilestone={100}
          daysUntilNextToken={1}
        />
      );
      
      expect(screen.getByText(/1 days/i)).toBeInTheDocument();
      expect(screen.getByText(/100-day milestone/i)).toBeInTheDocument();
    });
  });
});
