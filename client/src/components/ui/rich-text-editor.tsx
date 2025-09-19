import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Note: This is a simplified rich text editor. In production, you would integrate Quill.js
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your blog...",
  className,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          break;
      }
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-card", className)}>
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-3 border-b border-border bg-muted/30">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Bold (Ctrl+B)"
          data-testid="button-bold"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Italic (Ctrl+I)"
          data-testid="button-italic"
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Underline (Ctrl+U)"
          data-testid="button-underline"
        >
          <i className="fas fa-underline"></i>
        </button>
        <div className="w-px h-6 bg-border mx-2"></div>
        <button
          type="button"
          onClick={() => formatText('formatBlock', '<h1>')}
          className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Heading 1"
          data-testid="button-heading"
        >
          <i className="fas fa-heading"></i>
        </button>
        <button
          type="button"
          onClick={() => formatText('formatBlock', '<blockquote>')}
          className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Quote"
          data-testid="button-quote"
        >
          <i className="fas fa-quote-right"></i>
        </button>
        <button
          type="button"
          onClick={() => formatText('formatBlock', '<pre>')}
          className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Code Block"
          data-testid="button-code"
        >
          <i className="fas fa-code"></i>
        </button>
        <div className="w-px h-6 bg-border mx-2"></div>
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Bulleted List"
          data-testid="button-list-ul"
        >
          <i className="fas fa-list-ul"></i>
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Numbered List"
          data-testid="button-list-ol"
        >
          <i className="fas fa-list-ol"></i>
        </button>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="min-h-[400px] p-6 focus:outline-none prose max-w-none"
        data-placeholder={placeholder}
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
        }}
        data-testid="editor-content"
        suppressContentEditableWarning={true}
      />
    </div>
  );
};
