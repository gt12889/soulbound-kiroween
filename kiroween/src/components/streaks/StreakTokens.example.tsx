/**
 * StreakTokens Component - Usage Examples
 * 
 * This file demonstrates various use cases for the StreakTokens component.
 */

import React from 'react';
import { StreakTokens } from './StreakTokens';

export const StreakTokensExamples: React.FC = () => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>StreakTokens Component Examples</h1>

      {/* Example 1: No tokens */}
      <section>
        <h2>No Tokens Available</h2>
        <p>User has used all tokens or hasn't earned any yet.</p>
        <StreakTokens availableTokens={0} />
      </section>

      {/* Example 2: One token */}
      <section>
        <h2>One Token Available</h2>
        <p>User has one recovery token ready to use.</p>
        <StreakTokens availableTokens={1} />
      </section>

      {/* Example 3: Two tokens */}
      <section>
        <h2>Two Tokens Available</h2>
        <p>User has two recovery tokens.</p>
        <StreakTokens availableTokens={2} />
      </section>

      {/* Example 4: Maximum tokens */}
      <section>
        <h2>Maximum Tokens (3)</h2>
        <p>User has reached the maximum token limit.</p>
        <StreakTokens availableTokens={3} />
      </section>

      {/* Example 5: With next milestone */}
      <section>
        <h2>With Next Milestone (30 days)</h2>
        <p>Shows progress toward earning the next token at 30-day milestone.</p>
        <StreakTokens 
          availableTokens={1}
          nextTokenMilestone={30}
          daysUntilNextToken={7}
        />
      </section>

      {/* Example 6: Close to 100-day milestone */}
      <section>
        <h2>Close to 100-Day Milestone</h2>
        <p>User is 3 days away from earning 2 tokens at the 100-day milestone.</p>
        <StreakTokens 
          availableTokens={2}
          nextTokenMilestone={100}
          daysUntilNextToken={3}
        />
      </section>

      {/* Example 7: One day until milestone */}
      <section>
        <h2>One Day Until Milestone</h2>
        <p>User is just one day away from earning a token!</p>
        <StreakTokens 
          availableTokens={0}
          nextTokenMilestone={30}
          daysUntilNextToken={1}
        />
      </section>

      {/* Example 8: Custom styling */}
      <section>
        <h2>Custom Styling</h2>
        <p>Component with custom CSS class applied.</p>
        <StreakTokens 
          availableTokens={2}
          className="custom-token-display"
        />
      </section>

      {/* Example 9: In a card layout */}
      <section>
        <h2>In Dashboard Card</h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1.5rem',
          maxWidth: '400px'
        }}>
          <h3 style={{ marginTop: 0 }}>Your Streak Progress</h3>
          <p>Current streak: 23 days 🔥</p>
          <StreakTokens 
            availableTokens={1}
            nextTokenMilestone={30}
            daysUntilNextToken={7}
          />
        </div>
      </section>

      {/* Example 10: Multiple tokens in a row */}
      <section>
        <h2>Multiple Token Displays</h2>
        <p>Showing different token states side by side.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <StreakTokens availableTokens={0} />
          <StreakTokens availableTokens={1} />
          <StreakTokens availableTokens={2} />
          <StreakTokens availableTokens={3} />
        </div>
      </section>

      {/* Usage Notes */}
      <section style={{
        background: 'var(--bg-tertiary)',
        padding: '1.5rem',
        borderRadius: '8px',
        marginTop: '2rem'
      }}>
        <h2>Usage Notes</h2>
        <ul>
          <li><strong>Hover</strong> over any token display to see the detailed tooltip</li>
          <li>Available tokens are shown with filled circles (●) and pulse animation</li>
          <li>Used/unavailable tokens are shown with empty circles (○)</li>
          <li>The tooltip explains how to earn tokens and shows next milestone progress</li>
          <li>On mobile, the inline milestone info is hidden to save space</li>
          <li>Component is fully accessible with ARIA labels and keyboard support</li>
        </ul>
      </section>
    </div>
  );
};

export default StreakTokensExamples;
