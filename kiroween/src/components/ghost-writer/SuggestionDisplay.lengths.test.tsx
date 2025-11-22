import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuggestionDisplay from './SuggestionDisplay';
import type { GhostSuggestion } from '../../types';

/**
 * Test suite for SuggestionDisplay with various suggestion lengths
 * 
 * This tests the component's ability to handle:
 * - Very short suggestions (single word)
 * - Short suggestions (one sentence)
 * - Medium suggestions (paragraph)
 * - Long suggestions (multiple paragraphs)
 * - Very long suggestions (requiring scrolling)
 * - Edge cases (empty, special characters, unicode)
 */
describe('SuggestionDisplay - Various Lengths', () => {
  // Helper to create suggestion with specific text
  const createSuggestion = (text: string): GhostSuggestion => ({
    id: `test-${Date.now()}`,
    text,
    position: 0,
    confidence: 0.8,
  });

  describe('Very Short Suggestions', () => {
    it('handles single word suggestion', () => {
      const suggestion = createSuggestion('Hello');
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('handles two word suggestion', () => {
      const suggestion = createSuggestion('Hello world');
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('handles empty suggestion', () => {
      const suggestion = createSuggestion('');
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Component should still render structure
      const region = screen.getByRole('region', { name: /AI writing suggestion/i });
      expect(region).toBeInTheDocument();
      
      // Text container should exist but be empty
      const textContainer = container.querySelector('[class*="textContainer"]');
      expect(textContainer).toBeInTheDocument();
    });
  });

  describe('Short Suggestions (One Sentence)', () => {
    it('handles short sentence (< 50 chars)', () => {
      const suggestion = createSuggestion('The spirits whisper ancient secrets.');
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText('The spirits whisper ancient secrets.')).toBeInTheDocument();
    });

    it('handles medium sentence (50-100 chars)', () => {
      const text = 'In the depths of the haunted forest, shadows dance between the twisted trees.';
      const suggestion = createSuggestion(text);
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('handles long sentence (100-150 chars)', () => {
      const text = 'The ghostly apparition materialized before them, its ethereal form shimmering in the moonlight as it beckoned them forward into the darkness.';
      const suggestion = createSuggestion(text);
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  describe('Medium Suggestions (Paragraph)', () => {
    it('handles single paragraph (200-300 chars)', () => {
      const text = 'The ancient tome lay open on the dusty table, its yellowed pages revealing secrets long forgotten. Strange symbols danced across the parchment, seeming to shift and change in the flickering candlelight. A chill ran down her spine as she began to read the incantation.';
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText(text)).toBeInTheDocument();
      
      // Should not trigger scrolling yet
      const textContainer = container.querySelector('[class*="textContainer"]');
      const styles = window.getComputedStyle(textContainer!);
      expect(styles.maxHeight).toBe('300px');
    });

    it('handles two paragraphs (400-500 chars)', () => {
      const text = `The wind howled through the abandoned mansion, rattling the broken windows and sending dust swirling through the empty halls. Shadows seemed to move of their own accord, creeping along the walls like living things.

She clutched the lantern tighter, its feeble light barely pushing back the darkness. Every creak of the floorboards, every whisper of the wind, sent her heart racing. But she had come too far to turn back now.`;
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Use a more flexible matcher that handles whitespace
      const suggestionText = container.querySelector('[class*="suggestionText"]');
      expect(suggestionText?.textContent?.trim()).toBe(text.trim());
    });
  });

  describe('Long Suggestions (Multiple Paragraphs)', () => {
    it('handles three paragraphs (600-800 chars)', () => {
      const text = `The cemetery stretched out before them, a sea of weathered headstones and crumbling monuments. Mist clung to the ground, swirling around their ankles as they walked the narrow path between the graves.

"Are you sure about this?" whispered Marcus, his voice barely audible over the rustling leaves. "The locals say this place is cursed."

Elena didn't respond. Her eyes were fixed on the mausoleum at the center of the graveyard, its marble facade gleaming pale in the moonlight. According to the journal, that's where they would find what they were looking for. She just hoped the price wouldn't be too high.`;
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Use a more flexible matcher that handles whitespace
      const suggestionText = container.querySelector('[class*="suggestionText"]');
      expect(suggestionText?.textContent?.trim()).toBe(text.trim());
      
      // Should have scrollable container
      const textContainer = container.querySelector('[class*="textContainer"]');
      expect(textContainer).toBeInTheDocument();
      const styles = window.getComputedStyle(textContainer!);
      expect(styles.overflowY).toBe('auto');
    });

    it('handles four paragraphs (900-1000 chars)', () => {
      const text = `The ritual circle was complete. Thirteen candles flickered at precise intervals around its perimeter, their flames casting dancing shadows on the stone walls. In the center, the ancient grimoire lay open to the summoning spell.

"Once we begin, there's no turning back," warned the old woman, her gnarled fingers tracing the symbols in the air. "The veil between worlds is thin tonight, but what we call forth may not be what we expect."

The others nodded solemnly, taking their positions around the circle. They had prepared for this moment for months, gathering the necessary components, learning the words of power, steeling themselves for what was to come.

As the clock struck midnight, they began to chant. The air grew thick and heavy, charged with an otherworldly energy. The candle flames bent inward, drawn toward the center of the circle as if by an invisible force. Something was coming.`;
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Use a more flexible matcher that handles whitespace
      const suggestionText = container.querySelector('[class*="suggestionText"]');
      expect(suggestionText?.textContent?.trim()).toBe(text.trim());
    });
  });

  describe('Very Long Suggestions (Requiring Scrolling)', () => {
    it('handles very long text (1500+ chars) with scrolling', () => {
      const text = `The mansion had stood empty for decades, its windows dark and lifeless, its gardens overgrown with thorns and weeds. Local children dared each other to approach its rusted gates, but none had ever ventured inside. Until tonight.

Sarah pushed open the heavy oak door, its hinges screaming in protest. The sound echoed through the empty halls, announcing their arrival to whatever might be waiting within. Behind her, Tom and Lisa exchanged nervous glances, but they followed her inside.

The entrance hall was vast, with a grand staircase sweeping up to the second floor. Portraits lined the walls, their subjects' eyes seeming to follow the intruders as they moved deeper into the house. Dust covered everything, thick as snow, undisturbed for years.

"The diary said the study was on the second floor," Sarah whispered, consulting the leather-bound journal they'd found in the town archives. "That's where he performed his experiments."

They climbed the stairs carefully, testing each step before putting their full weight on it. The wood groaned beneath them, but held. At the top, a long corridor stretched into darkness, doors lining both sides like silent sentinels.

The third door on the right stood slightly ajar. Through the gap, they could see the faint outline of a desk, bookshelves, and something else—something that glowed with a sickly green light. Sarah's hand trembled as she reached for the doorknob.

"Maybe we should leave," Lisa suggested, her voice tight with fear. "This doesn't feel right."

But Sarah was already pushing the door open, drawn forward by a curiosity stronger than her fear. The study was exactly as described in the diary: cluttered with strange instruments, walls covered in arcane symbols, and in the center of the room, a glass case containing what appeared to be a human heart, still beating, still glowing with that eerie green light.`;
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Use a more flexible matcher that handles whitespace
      const suggestionText = container.querySelector('[class*="suggestionText"]');
      expect(suggestionText?.textContent?.trim()).toBe(text.trim());
      
      // Should definitely have scrolling enabled
      const textContainer = container.querySelector('[class*="textContainer"]');
      const styles = window.getComputedStyle(textContainer!);
      expect(styles.maxHeight).toBe('300px');
      expect(styles.overflowY).toBe('auto');
      
      // Check for custom scrollbar styling (if supported by browser)
      // scrollbarWidth may not be available in all test environments
      if (styles.scrollbarWidth !== undefined) {
        expect(styles.scrollbarWidth).toBe('thin');
      }
    });

    it('handles extremely long text (3000+ chars)', () => {
      // Create a very long suggestion by repeating paragraphs
      const paragraph = `The ancient library was a labyrinth of towering shelves, each one packed with books that hadn't been touched in centuries. The air was thick with the smell of old paper and leather, mixed with something else—something that made the hair on the back of her neck stand up. `;
      const text = paragraph.repeat(15); // ~1800 chars
      
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Should render but be truncated in view
      const textContainer = container.querySelector('[class*="textContainer"]');
      expect(textContainer).toBeInTheDocument();
      
      // Verify scrolling is enabled
      const styles = window.getComputedStyle(textContainer!);
      expect(styles.maxHeight).toBe('300px');
      expect(styles.overflowY).toBe('auto');
    });
  });

  describe('Edge Cases', () => {
    it('handles text with special characters', () => {
      const text = 'The spell required: "Eye of newt, toe of frog, wool of bat & tongue of dog." Strange symbols: ∞ ∆ ∑ ∏ ∫';
      const suggestion = createSuggestion(text);
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('handles text with unicode characters', () => {
      const text = 'The ancient runes read: "𝕿𝖍𝖊 𝖘𝖕𝖎𝖗𝖎𝖙𝖘 𝖆𝖜𝖆𝖐𝖊𝖓" with emojis: 👻 🌙 ⚡ 🔮';
      const suggestion = createSuggestion(text);
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('handles text with line breaks', () => {
      const text = 'Line one\nLine two\nLine three';
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Check that the text is rendered (line breaks are preserved in textContent)
      const suggestionText = container.querySelector('[class*="suggestionText"]');
      expect(suggestionText?.textContent?.trim()).toBe(text.trim());
    });

    it('handles text with multiple spaces', () => {
      const text = 'Words    with    multiple    spaces';
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Check that the text is rendered (multiple spaces are preserved in textContent)
      const suggestionText = container.querySelector('[class*="suggestionText"]');
      expect(suggestionText?.textContent?.trim()).toBe(text.trim());
    });

    it('handles text with HTML-like content (should not render as HTML)', () => {
      const text = '<script>alert("test")</script> <b>Bold text</b>';
      const suggestion = createSuggestion(text);
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Should render as plain text, not execute or render HTML
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('handles very long single word (no spaces)', () => {
      const text = 'Supercalifragilisticexpialidocious'.repeat(10);
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      expect(screen.getByText(text)).toBeInTheDocument();
      
      // Should have word-wrap enabled
      const suggestionText = container.querySelector('[class*="suggestionText"]');
      const styles = window.getComputedStyle(suggestionText!);
      expect(styles.wordWrap).toBe('break-word');
      expect(styles.overflowWrap).toBe('break-word');
    });

    it('handles text with only whitespace', () => {
      const text = '     ';
      const suggestion = createSuggestion(text);
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Component should still render
      const region = screen.getByRole('region', { name: /AI writing suggestion/i });
      expect(region).toBeInTheDocument();
    });
  });

  describe('Layout and Styling with Different Lengths', () => {
    it('maintains consistent width for short suggestions', () => {
      const suggestion = createSuggestion('Short text');
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      const display = container.querySelector('[class*="suggestionDisplay"]');
      const styles = window.getComputedStyle(display!);
      
      // Should have min-width of 300px
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(300);
    });

    it('maintains max-width for very long suggestions', () => {
      const text = 'Very long text '.repeat(100);
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      const display = container.querySelector('[class*="suggestionDisplay"]');
      const styles = window.getComputedStyle(display!);
      
      // Should have max-width of 600px
      expect(parseInt(styles.maxWidth)).toBeLessThanOrEqual(600);
    });

    it('applies italic styling regardless of length', () => {
      const suggestions = [
        createSuggestion('Short'),
        createSuggestion('Medium length suggestion text here'),
        createSuggestion('Very long suggestion text '.repeat(20)),
      ];
      
      suggestions.forEach(suggestion => {
        const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
        const text = container.querySelector('[class*="suggestionText"]');
        const styles = window.getComputedStyle(text!);
        expect(styles.fontStyle).toBe('italic');
      });
    });

    it('maintains purple tint background for all lengths', () => {
      const suggestions = [
        createSuggestion('Short'),
        createSuggestion('Medium length suggestion text here'),
        createSuggestion('Very long suggestion text '.repeat(20)),
      ];
      
      suggestions.forEach(suggestion => {
        const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
        const display = container.querySelector('[class*="suggestionDisplay"]');
        const styles = window.getComputedStyle(display!);
        
        // Should have rgba background
        expect(styles.background).toContain('rgba');
      });
    });
  });

  describe('Scrolling Behavior', () => {
    it('does not show scrollbar for short text', () => {
      const text = 'This is a short suggestion that should not require scrolling.';
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      const textContainer = container.querySelector('[class*="textContainer"]');
      const styles = window.getComputedStyle(textContainer!);
      
      // Should have overflow-y: auto (scrollbar appears only when needed)
      expect(styles.overflowY).toBe('auto');
    });

    it('enables scrolling for text exceeding max-height', () => {
      // Create text that will definitely exceed 300px height
      const text = 'This is a line of text that will be repeated many times.\n'.repeat(50);
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      const textContainer = container.querySelector('[class*="textContainer"]');
      const styles = window.getComputedStyle(textContainer!);
      
      expect(styles.maxHeight).toBe('300px');
      expect(styles.overflowY).toBe('auto');
    });

    it('hides horizontal scrollbar', () => {
      const text = 'Very long single line without breaks '.repeat(50);
      const suggestion = createSuggestion(text);
      const { container } = render(<SuggestionDisplay suggestion={suggestion} />);
      
      const textContainer = container.querySelector('[class*="textContainer"]');
      const styles = window.getComputedStyle(textContainer!);
      
      // Should hide horizontal overflow (text wraps instead)
      expect(styles.overflowX).toBe('hidden');
    });
  });

  describe('Performance with Large Suggestions', () => {
    it('renders large suggestion without crashing', () => {
      // Create a very large suggestion (10000+ chars)
      const text = 'The spirits whisper through the darkness. '.repeat(250);
      const suggestion = createSuggestion(text);
      
      expect(() => {
        render(<SuggestionDisplay suggestion={suggestion} />);
      }).not.toThrow();
    });

    it('maintains accessibility with large suggestions', () => {
      const text = 'Large text content. '.repeat(200);
      const suggestion = createSuggestion(text);
      render(<SuggestionDisplay suggestion={suggestion} />);
      
      // Should still have proper ARIA attributes
      const region = screen.getByRole('region', { name: /AI writing suggestion/i });
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-live', 'polite');
    });
  });
});
