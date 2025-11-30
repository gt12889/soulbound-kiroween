# Necronomicon Notes Modern Enhancements - Design

## Architecture Overview

### Component Hierarchy

```
NecronomiconNotes (container)
├── NotesList (sidebar)
├── NotesBook (main area)
│   └── NotePage (current implementation)
│       └── EnhancedEditor (NEW - replaces textarea)
│           ├── EditorCore (content management)
│           ├── BlockRenderer (renders content blocks)
│           ├── SlashCommandMenu (NEW)
│           ├── FloatingToolbar (NEW)
│           ├── CommandPalette (NEW)
│           ├── DragHandle (NEW)
│           └── BlockComponents (NEW)
│               ├── ParagraphBlock
│               ├── HeadingBlock
│               ├── ListBlock
│               ├── CodeBlock
│               ├── QuoteBlock
│               └── CalloutBlock
```

### Data Model

#### Block Structure

```typescript
interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  properties: BlockProperties;
  children?: ContentBlock[];
}

type BlockType = 
  | 'paragraph'
  | 'heading-1' | 'heading-2' | 'heading-3' 
  | 'heading-4' | 'heading-5' | 'heading-6'
  | 'bullet-list' | 'numbered-list' | 'checklist'
  | 'code' | 'quote' | 'callout' | 'divider' | 'table';

interface BlockProperties {
  level?: number; // for headings
  checked?: boolean; // for checklists
  language?: string; // for code blocks
  color?: string; // for callouts
  align?: 'left' | 'center' | 'right';
  formatting?: TextFormatting[];
}

interface TextFormatting {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'highlight' | 'link';
  start: number;
  end: number;
  value?: string; // for links
}
```


#### Note Structure Update

```typescript
interface Note {
  id: string;
  title: string;
  content: string; // Legacy - kept for backward compatibility
  blocks: ContentBlock[]; // NEW - structured content
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  markdown: boolean; // Keep existing markdown mode
}
```

### State Management

#### Editor State

```typescript
interface EditorState {
  blocks: ContentBlock[];
  selection: SelectionState;
  history: HistoryState;
  activeBlock: string | null;
  draggedBlock: string | null;
  showSlashMenu: boolean;
  showFloatingToolbar: boolean;
  showCommandPalette: boolean;
  slashMenuPosition: Position;
  floatingToolbarPosition: Position;
}

interface SelectionState {
  blockId: string;
  start: number;
  end: number;
  isCollapsed: boolean;
}

interface HistoryState {
  past: ContentBlock[][];
  present: ContentBlock[];
  future: ContentBlock[][];
}
```


## Feature Designs

### 1. Slash Commands

#### Trigger Detection

```typescript
// Detect "/" at start of line or after space
const detectSlashTrigger = (text: string, cursorPos: number): boolean => {
  if (cursorPos === 0) return text[0] === '/';
  const prevChar = text[cursorPos - 1];
  return text[cursorPos] === '/' && (prevChar === ' ' || prevChar === '\n');
};
```

#### Command Structure

```typescript
interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  category: 'basic' | 'advanced' | 'media' | 'embed';
  action: (editor: EditorState) => void;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'heading-1',
    name: 'Heading 1',
    description: 'Large section heading',
    icon: '📜',
    keywords: ['h1', 'title', 'heading'],
    category: 'basic',
    action: (editor) => insertBlock(editor, 'heading-1')
  },
  // ... more commands
];
```

#### Menu Component

```tsx
<SlashCommandMenu
  visible={showSlashMenu}
  position={slashMenuPosition}
  filter={slashFilter}
  onSelect={handleCommandSelect}
  onClose={handleCloseSlashMenu}
/>
```


#### Visual Design

```css
.slashMenu {
  position: absolute;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98));
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(139, 92, 246, 0.3);
  backdrop-filter: blur(10px);
  max-height: 400px;
  width: 320px;
  overflow-y: auto;
  z-index: 1000;
  animation: ghostlyAppear 0.2s ease-out;
}

.slashMenuItem {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.slashMenuItem:hover,
.slashMenuItem.selected {
  background: rgba(139, 92, 246, 0.15);
  border-left-color: var(--accent-purple);
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.1);
}

.slashMenuIcon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
}
```


### 2. Floating Toolbar

#### Position Calculation

```typescript
const calculateFloatingToolbarPosition = (
  selection: Selection,
  toolbarWidth: number,
  toolbarHeight: number
): Position => {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  return {
    x: rect.left + (rect.width / 2) - (toolbarWidth / 2),
    y: rect.top - toolbarHeight - 8, // 8px gap above selection
    fallbackY: rect.bottom + 8 // If not enough space above
  };
};
```

#### Toolbar Component

```tsx
interface FloatingToolbarProps {
  visible: boolean;
  position: Position;
  selection: SelectionState;
  onFormat: (format: FormatType) => void;
  onLink: () => void;
  onClose: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  visible,
  position,
  selection,
  onFormat,
  onLink,
  onClose
}) => {
  if (!visible) return null;

  return (
    <div 
      className={styles.floatingToolbar}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
    >
      <ToolbarButton icon="B" title="Bold (Cmd+B)" onClick={() => onFormat('bold')} />
      <ToolbarButton icon="I" title="Italic (Cmd+I)" onClick={() => onFormat('italic')} />
      <ToolbarButton icon="U" title="Underline (Cmd+U)" onClick={() => onFormat('underline')} />
      <ToolbarButton icon="S" title="Strikethrough" onClick={() => onFormat('strikethrough')} />
      <ToolbarButton icon="</>" title="Code (Cmd+E)" onClick={() => onFormat('code')} />
      <ToolbarButton icon="🔗" title="Link (Cmd+K)" onClick={onLink} />
      <ToolbarButton icon="✨" title="Highlight" onClick={() => onFormat('highlight')} />
    </div>
  );
};
```


#### Visual Design

```css
.floatingToolbar {
  position: fixed;
  display: flex;
  gap: 4px;
  padding: 8px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
  border: 2px solid rgba(139, 92, 246, 0.5);
  border-radius: 10px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(139, 92, 246, 0.4);
  backdrop-filter: blur(8px);
  z-index: 1001;
  animation: floatIn 0.2s ease-out;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toolbarButton {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 600;
}

.toolbarButton:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
  transform: scale(1.05);
}

.toolbarButton:active {
  transform: scale(0.95);
}
```


### 3. Auto-Formatting Shortcuts

#### Pattern Matching

```typescript
interface AutoFormatRule {
  pattern: RegExp;
  format: FormatType | BlockType;
  replacement?: (match: RegExpMatchArray) => string;
}

const AUTO_FORMAT_RULES: AutoFormatRule[] = [
  // Inline formatting
  {
    pattern: /\*\*([^*]+)\*\*\s$/,
    format: 'bold',
    replacement: (match) => match[1]
  },
  {
    pattern: /\*([^*]+)\*\s$/,
    format: 'italic',
    replacement: (match) => match[1]
  },
  {
    pattern: /~~([^~]+)~~\s$/,
    format: 'strikethrough',
    replacement: (match) => match[1]
  },
  {
    pattern: /`([^`]+)`\s$/,
    format: 'code',
    replacement: (match) => match[1]
  },
  
  // Block formatting (at line start)
  {
    pattern: /^#{1,6}\s/,
    format: 'heading',
    replacement: (match) => {
      const level = match[0].trim().length;
      return `heading-${level}`;
    }
  },
  {
    pattern: /^[-*]\s/,
    format: 'bullet-list'
  },
  {
    pattern: /^\d+\.\s/,
    format: 'numbered-list'
  },
  {
    pattern: /^\[\s?\]\s/,
    format: 'checklist'
  },
  {
    pattern: /^>\s/,
    format: 'quote'
  },
  {
    pattern: /^---$/,
    format: 'divider'
  }
];
```


#### Auto-Format Handler

```typescript
const handleAutoFormat = (
  block: ContentBlock,
  cursorPos: number,
  lastChar: string
): ContentBlock | null => {
  // Only trigger on space or enter
  if (lastChar !== ' ' && lastChar !== '\n') return null;
  
  const text = block.content;
  
  for (const rule of AUTO_FORMAT_RULES) {
    const match = text.match(rule.pattern);
    
    if (match) {
      // Apply formatting
      if (typeof rule.format === 'string' && rule.format.includes('-')) {
        // Block-level format
        return {
          ...block,
          type: rule.format as BlockType,
          content: rule.replacement ? rule.replacement(match) : text.replace(rule.pattern, '')
        };
      } else {
        // Inline format
        const formatted = applyInlineFormat(
          block,
          match.index!,
          match.index! + match[1].length,
          rule.format as FormatType
        );
        return {
          ...formatted,
          content: rule.replacement ? rule.replacement(match) : text
        };
      }
    }
  }
  
  return null;
};
```


### 4. Drag-to-Reorder Blocks

#### Drag Handle Component

```tsx
interface DragHandleProps {
  blockId: string;
  visible: boolean;
  onDragStart: (blockId: string) => void;
  onDragEnd: () => void;
}

const DragHandle: React.FC<DragHandleProps> = ({
  blockId,
  visible,
  onDragStart,
  onDragEnd
}) => {
  return (
    <div
      className={`${styles.dragHandle} ${visible ? styles.visible : ''}`}
      draggable
      onDragStart={() => onDragStart(blockId)}
      onDragEnd={onDragEnd}
      role="button"
      aria-label="Drag to reorder"
    >
      <svg width="16" height="16" viewBox="0 0 16 16">
        <circle cx="4" cy="4" r="1.5" fill="currentColor" />
        <circle cx="12" cy="4" r="1.5" fill="currentColor" />
        <circle cx="4" cy="8" r="1.5" fill="currentColor" />
        <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        <circle cx="4" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
};
```

#### Drag and Drop Logic

```typescript
const useDragAndDrop = (blocks: ContentBlock[], onReorder: (blocks: ContentBlock[]) => void) => {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  
  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId);
  };
  
  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    if (blockId !== draggedBlock) {
      setDropTarget(blockId);
    }
  };
  
  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    
    if (!draggedBlock || draggedBlock === targetBlockId) return;
    
    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock);
    const targetIndex = blocks.findIndex(b => b.id === targetBlockId);
    
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, removed);
    
    onReorder(newBlocks);
    setDraggedBlock(null);
    setDropTarget(null);
  };
  
  return { draggedBlock, dropTarget, handleDragStart, handleDragOver, handleDrop };
};
```


#### Visual Design

```css
.dragHandle {
  position: absolute;
  left: -32px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(139, 92, 246, 0.4);
  cursor: grab;
  opacity: 0;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.dragHandle:hover {
  color: rgba(139, 92, 246, 0.8);
  background: rgba(139, 92, 246, 0.1);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
}

.dragHandle.visible {
  opacity: 1;
}

.dragHandle:active {
  cursor: grabbing;
}

.blockWrapper:hover .dragHandle {
  opacity: 1;
}

.blockWrapper.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.blockWrapper.dropTarget {
  border-top: 3px solid var(--accent-purple);
  box-shadow: 0 -4px 12px rgba(139, 92, 246, 0.4);
}
```


### 5. Command Palette

#### Command Structure

```typescript
interface Command {
  id: string;
  name: string;
  description: string;
  category: 'formatting' | 'navigation' | 'view' | 'ai' | 'note';
  icon: string;
  shortcut?: string;
  action: () => void;
  keywords: string[];
}

const COMMANDS: Command[] = [
  // Formatting
  { id: 'bold', name: 'Bold', description: 'Make text bold', category: 'formatting', 
    icon: '𝐁', shortcut: 'Cmd+B', keywords: ['bold', 'strong', 'format'] },
  { id: 'italic', name: 'Italic', description: 'Make text italic', category: 'formatting',
    icon: '𝐼', shortcut: 'Cmd+I', keywords: ['italic', 'emphasis', 'format'] },
  
  // Navigation
  { id: 'search', name: 'Search Notes', description: 'Search all notes', category: 'navigation',
    icon: '🔍', shortcut: 'Cmd+F', keywords: ['search', 'find'] },
  { id: 'create-note', name: 'New Note', description: 'Create a new note', category: 'note',
    icon: '📝', shortcut: 'Cmd+N', keywords: ['new', 'create', 'note'] },
  
  // View
  { id: 'toggle-markdown', name: 'Toggle Markdown', description: 'Switch markdown mode', 
    category: 'view', icon: '📋', keywords: ['markdown', 'view', 'mode'] },
  
  // AI
  { id: 'ai-suggest', name: 'AI Suggestion', description: 'Get AI writing suggestion',
    category: 'ai', icon: '👻', keywords: ['ai', 'ghost', 'suggest'] }
];
```


#### Command Palette Component

```tsx
interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
  onExecute: (commandId: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  visible,
  onClose,
  onExecute
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const filteredCommands = useMemo(() => {
    if (!search) return COMMANDS;
    
    const query = search.toLowerCase();
    return COMMANDS.filter(cmd => 
      cmd.name.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.keywords.some(k => k.includes(query))
    );
  }, [search]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onExecute(filteredCommands[selectedIndex].id);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className={styles.commandPaletteOverlay} onClick={onClose}>
      <div className={styles.commandPalette} onClick={e => e.stopPropagation()}>
        <input
          type="text"
          className={styles.commandSearch}
          placeholder="Search commands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className={styles.commandList}>
          {filteredCommands.map((cmd, index) => (
            <CommandItem
              key={cmd.id}
              command={cmd}
              selected={index === selectedIndex}
              onClick={() => {
                onExecute(cmd.id);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```


#### Visual Design

```css
.commandPaletteOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

.commandPalette {
  width: 600px;
  max-width: 90vw;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98));
  border: 2px solid rgba(139, 92, 246, 0.5);
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.8),
    0 0 60px rgba(139, 92, 246, 0.4);
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.commandSearch {
  width: 100%;
  padding: 20px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(139, 92, 246, 0.3);
  color: #e0e0e0;
  font-size: 1.1rem;
  font-family: inherit;
  outline: none;
}

.commandSearch::placeholder {
  color: rgba(224, 224, 224, 0.4);
}

.commandList {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.commandItem {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.commandItem:hover,
.commandItem.selected {
  background: rgba(139, 92, 246, 0.15);
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.1);
}

.commandIcon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
}

.commandShortcut {
  margin-left: auto;
  padding: 4px 8px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: var(--font-mono);
}
```


### 6. Block-Based Content Structure

#### Block Renderer

```tsx
interface BlockRendererProps {
  block: ContentBlock;
  isActive: boolean;
  onUpdate: (block: ContentBlock) => void;
  onDelete: () => void;
  onMerge: () => void;
  onSplit: (position: number) => void;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isActive,
  onUpdate,
  onDelete,
  onMerge,
  onSplit
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter: Split block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const cursorPos = getCursorPosition();
      onSplit(cursorPos);
    }
    
    // Backspace at start: Merge with previous or delete
    if (e.key === 'Backspace') {
      const cursorPos = getCursorPosition();
      if (cursorPos === 0) {
        e.preventDefault();
        if (block.content.length === 0) {
          onDelete();
        } else {
          onMerge();
        }
      }
    }
  };
  
  const BlockComponent = getBlockComponent(block.type);
  
  return (
    <div 
      className={`${styles.blockWrapper} ${isActive ? styles.active : ''}`}
      data-block-id={block.id}
    >
      <DragHandle blockId={block.id} visible={isActive} />
      <BlockComponent
        block={block}
        onUpdate={onUpdate}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
```


#### Block Components

```tsx
// Paragraph Block
const ParagraphBlock: React.FC<BlockComponentProps> = ({ block, onUpdate, onKeyDown }) => {
  return (
    <div
      className={styles.paragraphBlock}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onUpdate({ ...block, content: e.currentTarget.textContent || '' })}
      onKeyDown={onKeyDown}
      dangerouslySetInnerHTML={{ __html: renderFormattedText(block) }}
    />
  );
};

// Heading Block
const HeadingBlock: React.FC<BlockComponentProps> = ({ block, onUpdate, onKeyDown }) => {
  const level = parseInt(block.type.split('-')[1]);
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag
      className={styles.headingBlock}
      data-level={level}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onUpdate({ ...block, content: e.currentTarget.textContent || '' })}
      onKeyDown={onKeyDown}
    >
      {block.content}
    </Tag>
  );
};

// List Block
const ListBlock: React.FC<BlockComponentProps> = ({ block, onUpdate, onKeyDown }) => {
  const isNumbered = block.type === 'numbered-list';
  const isChecklist = block.type === 'checklist';
  
  return (
    <div className={styles.listBlock}>
      {isChecklist && (
        <input
          type="checkbox"
          checked={block.properties.checked || false}
          onChange={(e) => onUpdate({ 
            ...block, 
            properties: { ...block.properties, checked: e.target.checked }
          })}
          className={styles.checkbox}
        />
      )}
      {isNumbered && <span className={styles.listNumber}>1.</span>}
      {!isNumbered && !isChecklist && <span className={styles.bullet}>•</span>}
      <div
        className={styles.listContent}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onUpdate({ ...block, content: e.currentTarget.textContent || '' })}
        onKeyDown={onKeyDown}
      >
        {block.content}
      </div>
    </div>
  );
};

// Code Block
const CodeBlock: React.FC<BlockComponentProps> = ({ block, onUpdate, onKeyDown }) => {
  return (
    <div className={styles.codeBlockWrapper}>
      <div className={styles.codeBlockHeader}>
        <select
          value={block.properties.language || 'plaintext'}
          onChange={(e) => onUpdate({
            ...block,
            properties: { ...block.properties, language: e.target.value }
          })}
          className={styles.languageSelect}
        >
          <option value="plaintext">Plain Text</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
        </select>
      </div>
      <pre className={styles.codeBlock}>
        <code
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onUpdate({ ...block, content: e.currentTarget.textContent || '' })}
          onKeyDown={onKeyDown}
        >
          {block.content}
        </code>
      </pre>
    </div>
  );
};

// Quote Block
const QuoteBlock: React.FC<BlockComponentProps> = ({ block, onUpdate, onKeyDown }) => {
  return (
    <blockquote
      className={styles.quoteBlock}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onUpdate({ ...block, content: e.currentTarget.textContent || '' })}
      onKeyDown={onKeyDown}
    >
      {block.content}
    </blockquote>
  );
};

// Callout Block
const CalloutBlock: React.FC<BlockComponentProps> = ({ block, onUpdate, onKeyDown }) => {
  const color = block.properties.color || 'purple';
  
  return (
    <div className={`${styles.calloutBlock} ${styles[`callout-${color}`]}`}>
      <div className={styles.calloutIcon}>💡</div>
      <div
        className={styles.calloutContent}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onUpdate({ ...block, content: e.currentTarget.textContent || '' })}
        onKeyDown={onKeyDown}
      >
        {block.content}
      </div>
    </div>
  );
};
```


#### Block Styling

```css
.blockWrapper {
  position: relative;
  padding: 4px 0;
  margin: 4px 0;
  transition: all 0.2s ease;
}

.blockWrapper.active {
  background: rgba(139, 92, 246, 0.05);
  border-radius: 8px;
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.1);
}

.paragraphBlock {
  min-height: 1.5em;
  line-height: 1.6;
  color: #e0e0e0;
  outline: none;
}

.headingBlock {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  color: #e0e0e0;
  margin: 1em 0 0.5em;
  outline: none;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

.headingBlock[data-level="1"] { font-size: 2.5rem; }
.headingBlock[data-level="2"] { font-size: 2rem; }
.headingBlock[data-level="3"] { font-size: 1.75rem; }
.headingBlock[data-level="4"] { font-size: 1.5rem; }
.headingBlock[data-level="5"] { font-size: 1.25rem; }
.headingBlock[data-level="6"] { font-size: 1.1rem; }

.listBlock {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;
}

.checkbox {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-purple);
}

.bullet {
  color: var(--accent-purple);
  font-size: 1.2em;
  margin-top: 2px;
}

.listNumber {
  color: var(--accent-purple);
  font-weight: 600;
  min-width: 24px;
}

.listContent {
  flex: 1;
  outline: none;
  line-height: 1.6;
}

.codeBlockWrapper {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.codeBlockHeader {
  background: rgba(26, 26, 46, 0.8);
  padding: 8px 12px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
}

.languageSelect {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.codeBlock {
  background: rgba(0, 0, 0, 0.4);
  padding: 16px;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.codeBlock code {
  outline: none;
  color: #e0e0e0;
}

.quoteBlock {
  border-left: 4px solid var(--accent-purple);
  padding-left: 20px;
  margin: 16px 0;
  font-style: italic;
  color: rgba(224, 224, 224, 0.9);
  outline: none;
  box-shadow: -4px 0 12px rgba(139, 92, 246, 0.2);
}

.calloutBlock {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin: 16px 0;
  border-radius: 8px;
  border-left: 4px solid;
}

.callout-purple {
  background: rgba(139, 92, 246, 0.1);
  border-left-color: var(--accent-purple);
}

.callout-green {
  background: rgba(16, 185, 129, 0.1);
  border-left-color: #10b981;
}

.callout-red {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: #ef4444;
}

.calloutIcon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
}

.calloutContent {
  flex: 1;
  outline: none;
  line-height: 1.6;
}
```


### 7. Enhanced Keyboard Shortcuts

#### Shortcut Handler

```typescript
const useEditorShortcuts = (editor: EditorState, dispatch: EditorDispatch) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;
      
      // Formatting shortcuts
      if (isMod && !isShift && !isAlt) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            dispatch({ type: 'APPLY_FORMAT', format: 'bold' });
            break;
          case 'i':
            e.preventDefault();
            dispatch({ type: 'APPLY_FORMAT', format: 'italic' });
            break;
          case 'u':
            e.preventDefault();
            dispatch({ type: 'APPLY_FORMAT', format: 'underline' });
            break;
          case 'e':
            e.preventDefault();
            dispatch({ type: 'APPLY_FORMAT', format: 'code' });
            break;
          case 'k':
            e.preventDefault();
            dispatch({ type: 'SHOW_LINK_DIALOG' });
            break;
          case '/':
            e.preventDefault();
            dispatch({ type: 'TOGGLE_SLASH_MENU' });
            break;
        }
      }
      
      // Shift + Mod shortcuts
      if (isMod && isShift && !isAlt) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            dispatch({ type: 'APPLY_FORMAT', format: 'strikethrough' });
            break;
          case 'h':
            e.preventDefault();
            dispatch({ type: 'APPLY_FORMAT', format: 'highlight' });
            break;
          case 'k':
            e.preventDefault();
            dispatch({ type: 'SHOW_COMMAND_PALETTE' });
            break;
        }
      }
      
      // Alt + Mod + Number for headings
      if (isMod && isAlt && !isShift) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
          e.preventDefault();
          dispatch({ type: 'CONVERT_TO_HEADING', level: num });
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, dispatch]);
};
```


### 8. Inline Mentions and Wiki Links

#### Mention Detection

```typescript
const detectMention = (text: string, cursorPos: number): MentionTrigger | null => {
  // Look for @ or [[ before cursor
  const beforeCursor = text.substring(0, cursorPos);
  
  // @ mention
  const atMatch = beforeCursor.match(/@(\w*)$/);
  if (atMatch) {
    return {
      type: 'mention',
      trigger: '@',
      query: atMatch[1],
      start: cursorPos - atMatch[0].length
    };
  }
  
  // [[ wiki link
  const wikiMatch = beforeCursor.match(/\[\[([^\]]*?)$/);
  if (wikiMatch) {
    return {
      type: 'wiki-link',
      trigger: '[[',
      query: wikiMatch[1],
      start: cursorPos - wikiMatch[0].length
    };
  }
  
  return null;
};
```

#### Mention Menu Component

```tsx
interface MentionMenuProps {
  visible: boolean;
  position: Position;
  query: string;
  notes: Note[];
  onSelect: (noteId: string) => void;
  onClose: () => void;
}

const MentionMenu: React.FC<MentionMenuProps> = ({
  visible,
  position,
  query,
  notes,
  onSelect,
  onClose
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const filteredNotes = useMemo(() => {
    if (!query) return notes.slice(0, 10);
    
    return notes
      .filter(note => note.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }, [notes, query]);
  
  if (!visible || filteredNotes.length === 0) return null;
  
  return (
    <div 
      className={styles.mentionMenu}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {filteredNotes.map((note, index) => (
        <div
          key={note.id}
          className={`${styles.mentionItem} ${index === selectedIndex ? styles.selected : ''}`}
          onClick={() => onSelect(note.id)}
        >
          <span className={styles.mentionIcon}>📝</span>
          <span className={styles.mentionTitle}>{note.title}</span>
        </div>
      ))}
    </div>
  );
};
```


### 9. Hover Tooltips and Previews

#### Tooltip Component

```tsx
interface TooltipProps {
  content: string;
  shortcut?: string;
  visible: boolean;
  position: Position;
}

const Tooltip: React.FC<TooltipProps> = ({ content, shortcut, visible, position }) => {
  if (!visible) return null;
  
  return (
    <div 
      className={styles.tooltip}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className={styles.tooltipContent}>{content}</div>
      {shortcut && (
        <div className={styles.tooltipShortcut}>{shortcut}</div>
      )}
    </div>
  );
};
```

#### Note Preview Component

```tsx
interface NotePreviewProps {
  noteId: string;
  visible: boolean;
  position: Position;
}

const NotePreview: React.FC<NotePreviewProps> = ({ noteId, visible, position }) => {
  const { getNote } = useNotes();
  const note = getNote(noteId);
  
  if (!visible || !note) return null;
  
  const preview = note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '');
  
  return (
    <div 
      className={styles.notePreview}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className={styles.previewTitle}>{note.title}</div>
      <div className={styles.previewContent}>{preview}</div>
      <div className={styles.previewMeta}>
        {note.tags.length > 0 && (
          <div className={styles.previewTags}>
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} className={styles.previewTag}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```


#### Tooltip Styling

```css
.tooltip {
  position: fixed;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98));
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(139, 92, 246, 0.3);
  z-index: 3000;
  pointer-events: none;
  animation: tooltipFadeIn 0.15s ease-out;
  max-width: 250px;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltipContent {
  color: #e0e0e0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.tooltipShortcut {
  margin-top: 4px;
  padding: 2px 6px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: rgba(224, 224, 224, 0.8);
  display: inline-block;
}

.notePreview {
  position: fixed;
  width: 320px;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98));
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(139, 92, 246, 0.3);
  z-index: 3000;
  pointer-events: none;
  animation: previewSlideIn 0.2s ease-out;
}

@keyframes previewSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.previewTitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 8px;
  text-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
}

.previewContent {
  color: rgba(224, 224, 224, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.previewTags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.previewTag {
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.9);
}
```


## Performance Optimizations

### Virtual Scrolling for Large Notes

```typescript
const useVirtualBlocks = (blocks: ContentBlock[], containerHeight: number) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const BLOCK_HEIGHT = 40; // Average block height
  const BUFFER = 5; // Extra blocks to render above/below
  
  const handleScroll = useCallback((scrollTop: number) => {
    const start = Math.max(0, Math.floor(scrollTop / BLOCK_HEIGHT) - BUFFER);
    const end = Math.min(
      blocks.length,
      Math.ceil((scrollTop + containerHeight) / BLOCK_HEIGHT) + BUFFER
    );
    
    setVisibleRange({ start, end });
  }, [blocks.length, containerHeight]);
  
  const visibleBlocks = blocks.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * BLOCK_HEIGHT;
  
  return { visibleBlocks, offsetY, handleScroll };
};
```

### Debounced Auto-Save

```typescript
const useAutoSave = (noteId: string, blocks: ContentBlock[]) => {
  const { updateNote } = useNotes();
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      // Convert blocks to content string for backward compatibility
      const content = blocksToContent(blocks);
      updateNote(noteId, { content, blocks });
    }, 1000); // Save after 1 second of inactivity
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [noteId, blocks, updateNote]);
};
```

### Memoized Block Rendering

```typescript
const MemoizedBlock = memo(BlockRenderer, (prev, next) => {
  return (
    prev.block.id === next.block.id &&
    prev.block.content === next.block.content &&
    prev.block.type === next.block.type &&
    prev.isActive === next.isActive &&
    JSON.stringify(prev.block.properties) === JSON.stringify(next.block.properties)
  );
});
```


## Migration Strategy

### Backward Compatibility

```typescript
// Convert legacy content to blocks
const contentToBlocks = (content: string): ContentBlock[] => {
  if (!content) {
    return [{
      id: generateId(),
      type: 'paragraph',
      content: '',
      properties: {}
    }];
  }
  
  // Split by paragraphs
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map(para => ({
    id: generateId(),
    type: 'paragraph',
    content: para.trim(),
    properties: {}
  }));
};

// Convert blocks to legacy content
const blocksToContent = (blocks: ContentBlock[]): string => {
  return blocks
    .map(block => {
      switch (block.type) {
        case 'heading-1':
        case 'heading-2':
        case 'heading-3':
        case 'heading-4':
        case 'heading-5':
        case 'heading-6':
          const level = parseInt(block.type.split('-')[1]);
          return '#'.repeat(level) + ' ' + block.content;
        case 'bullet-list':
          return '- ' + block.content;
        case 'numbered-list':
          return '1. ' + block.content;
        case 'quote':
          return '> ' + block.content;
        case 'code':
          return '```\n' + block.content + '\n```';
        default:
          return block.content;
      }
    })
    .join('\n\n');
};
```

### Progressive Enhancement

```typescript
// Feature detection
const useEnhancedEditor = () => {
  const [supported, setSupported] = useState(false);
  
  useEffect(() => {
    // Check for required features
    const hasContentEditable = 'contentEditable' in document.createElement('div');
    const hasDragAndDrop = 'draggable' in document.createElement('div');
    const hasSelection = typeof window.getSelection === 'function';
    
    setSupported(hasContentEditable && hasDragAndDrop && hasSelection);
  }, []);
  
  return supported;
};

// Fallback to simple textarea if enhanced editor not supported
const NotePage: React.FC<NotePageProps> = ({ noteId }) => {
  const enhancedSupported = useEnhancedEditor();
  
  if (!enhancedSupported) {
    return <LegacyNotePage noteId={noteId} />;
  }
  
  return <EnhancedNotePage noteId={noteId} />;
};
```


## Testing Strategy

### Unit Tests

```typescript
// Block operations
describe('Block Operations', () => {
  test('should split block at cursor position', () => {
    const block = { id: '1', type: 'paragraph', content: 'Hello World', properties: {} };
    const [before, after] = splitBlock(block, 5);
    
    expect(before.content).toBe('Hello');
    expect(after.content).toBe(' World');
  });
  
  test('should merge blocks', () => {
    const block1 = { id: '1', type: 'paragraph', content: 'Hello', properties: {} };
    const block2 = { id: '2', type: 'paragraph', content: 'World', properties: {} };
    const merged = mergeBlocks(block1, block2);
    
    expect(merged.content).toBe('HelloWorld');
  });
});

// Auto-formatting
describe('Auto-Formatting', () => {
  test('should convert **text** to bold', () => {
    const result = applyAutoFormat('**bold** ', 8);
    expect(result.formatting).toContainEqual({ type: 'bold', start: 0, end: 4 });
  });
  
  test('should convert # to heading-1', () => {
    const result = applyAutoFormat('# Heading', 0);
    expect(result.type).toBe('heading-1');
  });
});
```

### Integration Tests

```typescript
describe('Enhanced Editor Integration', () => {
  test('should handle slash command workflow', async () => {
    const { getByRole, getByText } = render(<EnhancedEditor />);
    
    // Type slash
    const editor = getByRole('textbox');
    fireEvent.input(editor, { target: { textContent: '/' } });
    
    // Menu should appear
    await waitFor(() => {
      expect(getByText('Heading 1')).toBeInTheDocument();
    });
    
    // Select command
    fireEvent.click(getByText('Heading 1'));
    
    // Block should be converted
    expect(editor.querySelector('[data-block-type="heading-1"]')).toBeInTheDocument();
  });
  
  test('should handle drag and drop reordering', async () => {
    const blocks = [
      { id: '1', type: 'paragraph', content: 'First', properties: {} },
      { id: '2', type: 'paragraph', content: 'Second', properties: {} }
    ];
    
    const { container } = render(<EnhancedEditor blocks={blocks} />);
    
    const firstBlock = container.querySelector('[data-block-id="1"]');
    const secondBlock = container.querySelector('[data-block-id="2"]');
    
    // Simulate drag and drop
    fireEvent.dragStart(firstBlock!);
    fireEvent.dragOver(secondBlock!);
    fireEvent.drop(secondBlock!);
    
    // Order should be reversed
    const reorderedBlocks = container.querySelectorAll('[data-block-id]');
    expect(reorderedBlocks[0].getAttribute('data-block-id')).toBe('2');
    expect(reorderedBlocks[1].getAttribute('data-block-id')).toBe('1');
  });
});
```


## Accessibility Considerations

### ARIA Labels and Roles

```tsx
// Enhanced editor with proper ARIA
<div
  role="textbox"
  aria-label="Note content editor"
  aria-multiline="true"
  aria-describedby="editor-help"
  contentEditable
>
  {blocks.map(block => (
    <div
      key={block.id}
      role="article"
      aria-label={`${block.type} block`}
      data-block-id={block.id}
    >
      <BlockRenderer block={block} />
    </div>
  ))}
</div>

// Slash menu with keyboard navigation
<div
  role="menu"
  aria-label="Insert content menu"
  aria-activedescendant={`command-${selectedIndex}`}
>
  {commands.map((cmd, index) => (
    <div
      key={cmd.id}
      id={`command-${index}`}
      role="menuitem"
      aria-label={`${cmd.name}: ${cmd.description}`}
    >
      {cmd.name}
    </div>
  ))}
</div>
```

### Screen Reader Announcements

```typescript
const useScreenReaderAnnouncements = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);
  
  return { announce };
};

// Usage
const { announce } = useScreenReaderAnnouncements();

// When block is converted
announce('Converted to heading level 1');

// When formatting is applied
announce('Bold formatting applied');

// When block is reordered
announce('Block moved up');
```

### Focus Management

```typescript
const useFocusManagement = (blocks: ContentBlock[]) => {
  const focusBlock = useCallback((blockId: string) => {
    const element = document.querySelector(`[data-block-id="${blockId}"]`);
    if (element instanceof HTMLElement) {
      element.focus();
      
      // Move cursor to end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, []);
  
  return { focusBlock };
};
```


## Summary

This design provides a comprehensive architecture for modernizing the Necronomicon Notes with:

1. **Block-based content structure** - Flexible, manipulable content units
2. **Slash commands** - Quick content insertion via "/" trigger
3. **Floating toolbar** - Context-sensitive formatting on text selection
4. **Auto-formatting** - Markdown-style shortcuts that format as you type
5. **Drag-and-drop** - Visual reordering of content blocks
6. **Command palette** - Keyboard-first workflow with Cmd/Ctrl+K
7. **Enhanced shortcuts** - Comprehensive keyboard support
8. **Mentions & links** - @ mentions and [[ wiki-style links
9. **Tooltips & previews** - Helpful hover information
10. **Accessibility** - Full ARIA support and screen reader compatibility

### Key Technical Decisions

- **ContentEditable over textarea** - Richer formatting capabilities
- **Block-based architecture** - Inspired by Notion's data model
- **Backward compatibility** - Legacy content automatically migrated
- **Progressive enhancement** - Fallback to simple editor if features unsupported
- **Performance optimizations** - Virtual scrolling, memoization, debounced saves
- **Gothic aesthetic preserved** - Purple glows, ghostly animations, mystical theme

### Implementation Phases

1. **Phase 1**: Block-based structure and core editor
2. **Phase 2**: Slash commands and auto-formatting
3. **Phase 3**: Floating toolbar and keyboard shortcuts
4. **Phase 4**: Drag-and-drop reordering
5. **Phase 5**: Command palette
6. **Phase 6**: Mentions, links, and tooltips
7. **Phase 7**: Polish, accessibility, and testing

This design maintains all existing features while dramatically improving the writing experience with modern interactions.
