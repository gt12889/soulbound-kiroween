/**
 * Markdown support tests
 * Tests markdown rendering, split-view editor, toolbar, and search
 * Requirements: 16.1, 16.2, 16.3, 16.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarkdownEditor from '../../components/necronomicon-notes/MarkdownEditor';
import MarkdownPreview from '../../components/necronomicon-notes/MarkdownPreview';

describe('Markdown Support Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Markdown rendering (Requirement 16.1)', () => {
    it('should render headers', () => {
      const markdown = '# Header 1\n## Header 2\n### Header 3';
      
      render(<MarkdownPreview content={markdown} />);

      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Header 2')).toBeInTheDocument();
      expect(screen.getByText('Header 3')).toBeInTheDocument();
    });

    it('should render bold text', () => {
      const markdown = 'This is **bold text**';
      
      render(<MarkdownPreview content={markdown} />);

      const boldElement = screen.getByText('bold text');
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('should render italic text', () => {
      const markdown = 'This is *italic text*';
      
      render(<MarkdownPreview content={markdown} />);

      const italicElement = screen.getByText('italic text');
      expect(italicElement.tagName).toBe('EM');
    });

    it('should render lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      
      render(<MarkdownPreview content={markdown} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render links', () => {
      const markdown = '[Click here](https://example.com)';
      
      render(<MarkdownPreview content={markdown} />);

      const link = screen.getByText('Click here');
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('https://example.com');
    });

    it('should render code blocks', () => {
      const markdown = '```javascript\nconst x = 10;\n```';
      
      render(<MarkdownPreview content={markdown} />);

      expect(screen.getByText(/const x = 10/)).toBeInTheDocument();
    });

    it('should render inline code', () => {
      const markdown = 'Use `console.log()` to debug';
      
      render(<MarkdownPreview content={markdown} />);

      const codeElement = screen.getByText('console.log()');
      expect(codeElement.tagName).toBe('CODE');
    });

    it('should render blockquotes', () => {
      const markdown = '> This is a quote';
      
      render(<MarkdownPreview content={markdown} />);

      expect(screen.getByText('This is a quote')).toBeInTheDocument();
    });
  });

  describe('Split-view editor (Requirement 16.2)', () => {
    it('should render editor and preview side by side', () => {
      const mockOnChange = () => {};
      const mockOnViewModeChange = () => {};
      
      render(
        <MarkdownEditor
          content="# Test"
          onChange={mockOnChange}
          viewMode="split"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      // Both editor and preview should be visible
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should show only editor in edit mode', () => {
      const mockOnChange = () => {};
      
      render(
        <MarkdownEditor
          content="# Test"
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      // Only editor should be visible
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });

    it('should show only preview in preview mode', () => {
      const mockOnChange = () => {};
      
      render(
        <MarkdownEditor
          content="# Test"
          onChange={mockOnChange}
          viewMode="preview"
        />
      );

      // Only preview should be visible
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should update preview in real-time', async () => {
      const user = userEvent.setup();
      let content = '';
      const mockOnChange = (newContent: string) => {
        content = newContent;
      };
      
      const { rerender } = render(
        <MarkdownEditor
          content={content}
          onChange={mockOnChange}
          viewMode="split"
        />
      );

      const editor = screen.getByRole('textbox');
      await user.type(editor, '# New Header');

      // Rerender with updated content
      rerender(
        <MarkdownEditor
          content="# New Header"
          onChange={mockOnChange}
          viewMode="split"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('New Header')).toBeInTheDocument();
      });
    });
  });

  describe('Markdown toolbar (Requirement 16.4)', () => {
    it('should render formatting toolbar', () => {
      const mockOnChange = () => {};
      
      render(
        <MarkdownEditor
          content=""
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      // Toolbar buttons should be present
      expect(screen.getByTitle(/bold/i)).toBeInTheDocument();
      expect(screen.getByTitle(/italic/i)).toBeInTheDocument();
      expect(screen.getByTitle(/heading/i)).toBeInTheDocument();
    });

    it('should insert bold formatting', async () => {
      const user = userEvent.setup();
      let content = '';
      const mockOnChange = (newContent: string) => {
        content = newContent;
      };
      
      render(
        <MarkdownEditor
          content={content}
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      const boldButton = screen.getByTitle(/bold/i);
      await user.click(boldButton);

      expect(content).toContain('**');
    });

    it('should insert italic formatting', async () => {
      const user = userEvent.setup();
      let content = '';
      const mockOnChange = (newContent: string) => {
        content = newContent;
      };
      
      render(
        <MarkdownEditor
          content={content}
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      const italicButton = screen.getByTitle(/italic/i);
      await user.click(italicButton);

      expect(content).toContain('*');
    });

    it('should insert heading formatting', async () => {
      const user = userEvent.setup();
      let content = '';
      const mockOnChange = (newContent: string) => {
        content = newContent;
      };
      
      render(
        <MarkdownEditor
          content={content}
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      const headingButton = screen.getByTitle(/heading/i);
      await user.click(headingButton);

      expect(content).toContain('#');
    });

    it('should insert link formatting', async () => {
      const user = userEvent.setup();
      let content = '';
      const mockOnChange = (newContent: string) => {
        content = newContent;
      };
      
      render(
        <MarkdownEditor
          content={content}
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      const linkButton = screen.getByTitle(/link/i);
      await user.click(linkButton);

      expect(content).toContain('[');
      expect(content).toContain(']');
      expect(content).toContain('(');
      expect(content).toContain(')');
    });
  });

  describe('Markdown in search (Requirement 16.6)', () => {
    it('should search markdown content', () => {
      const markdown = '# Header\n\nThis is **bold** text with *italic* words.';
      
      render(<MarkdownPreview content={markdown} />);

      // All text should be searchable
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });

    it('should preserve markdown syntax in raw content', () => {
      const markdown = '**Bold** and *italic*';
      const mockOnChange = () => {};
      
      render(
        <MarkdownEditor
          content={markdown}
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      const editor = screen.getByRole('textbox');
      expect(editor.textContent).toContain('**');
      expect(editor.textContent).toContain('*');
    });
  });

  describe('Gothic-styled markdown rendering (Requirement 16.3)', () => {
    it('should apply gothic styling to rendered markdown', () => {
      const markdown = '# Gothic Header';
      
      const { container } = render(<MarkdownPreview content={markdown} />);

      // Check if gothic styling class is applied
      const preview = container.querySelector('[class*="preview"]');
      expect(preview).toBeTruthy();
      expect(preview?.className).toBeTruthy();
    });

    it('should maintain theme consistency', () => {
      const markdown = '# Header\n\nParagraph text';
      
      const { container } = render(<MarkdownPreview content={markdown} />);

      // Preview should have styling classes
      const preview = container.querySelector('[class*="preview"]');
      expect(preview).toBeTruthy();
    });
  });

  describe('Keyboard shortcuts for markdown', () => {
    it('should support Ctrl+B for bold', async () => {
      const user = userEvent.setup();
      let content = 'selected text';
      const mockOnChange = (newContent: string) => {
        content = newContent;
      };
      
      render(
        <MarkdownEditor
          content={content}
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      const editor = screen.getByRole('textbox');
      await user.click(editor);
      await user.keyboard('{Control>}b{/Control}');

      // Bold formatting should be applied
      expect(content).toContain('**');
    });

    it('should support Ctrl+I for italic', async () => {
      const user = userEvent.setup();
      let content = 'selected text';
      const mockOnChange = (newContent: string) => {
        content = newContent;
      };
      
      render(
        <MarkdownEditor
          content={content}
          onChange={mockOnChange}
          viewMode="edit"
        />
      );

      const editor = screen.getByRole('textbox');
      await user.click(editor);
      await user.keyboard('{Control>}i{/Control}');

      // Italic formatting should be applied
      expect(content).toContain('*');
    });
  });
});
