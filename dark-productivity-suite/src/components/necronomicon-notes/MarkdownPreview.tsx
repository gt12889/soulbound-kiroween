import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import styles from './MarkdownPreview.module.css';
import 'highlight.js/styles/github-dark.css';

interface MarkdownPreviewProps {
  content: string;
  scrollSync?: boolean;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
}

/**
 * MarkdownPreview component - Renders markdown with gothic styling
 * Requirements: 16.1, 16.3
 */
const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ 
  content, 
  scrollSync = false,
  onScroll 
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle scroll events for sync
  useEffect(() => {
    if (!scrollSync || !onScroll || !previewRef.current) return;

    const handleScroll = () => {
      if (previewRef.current) {
        onScroll(
          previewRef.current.scrollTop,
          previewRef.current.scrollHeight
        );
      }
    };

    const element = previewRef.current;
    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [scrollSync, onScroll]);

  return (
    <div 
      ref={previewRef}
      className={styles.markdownPreview}
      data-testid="markdown-preview"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom renderers for gothic styling
          h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
          h4: ({ children }) => <h4 className={styles.h4}>{children}</h4>,
          h5: ({ children }) => <h5 className={styles.h5}>{children}</h5>,
          h6: ({ children }) => <h6 className={styles.h6}>{children}</h6>,
          p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className={styles.unorderedList}>{children}</ul>,
          ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
          li: ({ children }) => <li className={styles.listItem}>{children}</li>,
          blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
          code: ({ children, className, ...props }) => {
            const inline = !className?.includes('language-');
            if (inline) {
              return <code className={styles.inlineCode} {...props}>{children}</code>;
            }
            return <code className={`${styles.codeBlock} ${className || ''}`} {...props}>{children}</code>;
          },
          pre: ({ children }) => <pre className={styles.pre}>{children}</pre>,
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className={styles.image} loading="lazy" />
          ),
          hr: () => <hr className={styles.horizontalRule} />,
          table: ({ children }) => <table className={styles.table}>{children}</table>,
          thead: ({ children }) => <thead className={styles.thead}>{children}</thead>,
          tbody: ({ children }) => <tbody className={styles.tbody}>{children}</tbody>,
          tr: ({ children }) => <tr className={styles.tr}>{children}</tr>,
          th: ({ children }) => <th className={styles.th}>{children}</th>,
          td: ({ children }) => <td className={styles.td}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
