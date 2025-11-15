import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownPreview from '../../components/necronomicon-notes/MarkdownPreview';

describe('MarkdownPreview', () => {
  it('renders markdown content with headers', () => {
    const content = '# Heading 1\n## Heading 2\n### Heading 3';
    render(<MarkdownPreview content={content} />);
    
    const preview = screen.getByTestId('markdown-preview');
    expect(preview).toBeInTheDocument();
    expect(preview.textContent).toContain('Heading 1');
    expect(preview.textContent).toContain('Heading 2');
    expect(preview.textContent).toContain('Heading 3');
  });

  it('renders lists correctly', () => {
    const content = '- Item 1\n- Item 2\n\n1. First\n2. Second';
    render(<MarkdownPreview content={content} />);
    
    const preview = screen.getByTestId('markdown-preview');
    expect(preview.textContent).toContain('Item 1');
    expect(preview.textContent).toContain('Item 2');
    expect(preview.textContent).toContain('First');
    expect(preview.textContent).toContain('Second');
  });

  it('renders links with proper attributes', () => {
    const content = '[Test Link](https://example.com)';
    render(<MarkdownPreview content={content} />);
    
    const link = screen.getByText('Test Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders code blocks', () => {
    const content = '```javascript\nconst x = 42;\n```';
    render(<MarkdownPreview content={content} />);
    
    const preview = screen.getByTestId('markdown-preview');
    expect(preview.textContent).toContain('const x = 42;');
  });

  it('renders inline code', () => {
    const content = 'This is `inline code` in text';
    render(<MarkdownPreview content={content} />);
    
    const preview = screen.getByTestId('markdown-preview');
    expect(preview.textContent).toContain('inline code');
  });

  it('renders blockquotes', () => {
    const content = '> This is a quote';
    render(<MarkdownPreview content={content} />);
    
    const preview = screen.getByTestId('markdown-preview');
    expect(preview.textContent).toContain('This is a quote');
  });

  it('handles scroll sync when enabled', () => {
    const onScroll = vi.fn();
    const content = '# Test\n\nLong content...';
    
    render(
      <MarkdownPreview 
        content={content} 
        scrollSync={true}
        onScroll={onScroll}
      />
    );
    
    const preview = screen.getByTestId('markdown-preview');
    expect(preview).toBeInTheDocument();
  });
});
