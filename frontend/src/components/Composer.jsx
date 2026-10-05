import React, { useState, useRef, useEffect } from 'react';
import PixelButton from './PixelButton';
import './Composer.css';

const MAX_CHARS = 1000;

/**
 * Chat Composer Input Box with auto-growing textarea and VT323 character counter.
 */
export default function Composer({ onSend, disabled = false }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow textarea up to 5 lines (~120px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 120);
    el.style.height = `${newHeight}px`;
  }, [text]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setText('');

    // Reset height and refocus
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charsRemaining = MAX_CHARS - text.length;
  const isNearLimit = charsRemaining <= 100;

  return (
    <form className="composer-container pixel-box" onSubmit={handleSubmit}>
      <div className="composer-input-row">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setText(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this document… (Enter to send, Shift+Enter for newline)"
          disabled={disabled}
          rows={1}
          className="composer-textarea"
          aria-label="Ask a question about this document"
        />

        <PixelButton
          type="submit"
          variant="mustard"
          size="md"
          disabled={disabled || !text.trim()}
          className="composer-send-btn"
          ariaLabel="Send question"
        >
          SEND ▶
        </PixelButton>
      </div>

      <div className="composer-footer">
        <span className="composer-hint retro-label">
          [ENTER] SEND · [SHIFT+ENTER] NEWLINE
        </span>

        <span
          className={`composer-counter retro-label ${isNearLimit ? 'counter-warning' : ''}`}
        >
          [ {text.length} / {MAX_CHARS} ]
        </span>
      </div>
    </form>
  );
}
