import React from 'react';
import Byte from './Byte';
import './TypingIndicator.css';

/**
 * Typing Indicator with Byte mascot in thinking mood and bouncing stepped pixel blocks.
 */
export default function TypingIndicator() {
  return (
    <div className="typing-indicator-wrap" aria-live="polite" aria-label="Byte is thinking">
      <div className="typing-avatar">
        <Byte mood="thinking" size={36} />
      </div>

      <div className="typing-bubble pixel-box">
        <span className="typing-text pixel-title">BYTE IS THINKING</span>
        <div className="pixel-bouncing-blocks" aria-hidden="true">
          <div className="pixel-block block-1" />
          <div className="pixel-block block-2" />
          <div className="pixel-block block-3" />
        </div>
      </div>
    </div>
  );
}
