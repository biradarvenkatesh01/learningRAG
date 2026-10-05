import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import Byte from './Byte';
import Sticker from './Sticker';
import SourcesDrawer from './SourcesDrawer';
import './Message.css';

/**
 * Citation Chip Component
 * Lilac pixel chip that displays tooltip on hover/focus and scrolls to source on click.
 */
function CitationChip({ index, sourceItem, onSelectSource }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const previewText = sourceItem?.text
    ? sourceItem.text.slice(0, 200) + (sourceItem.text.length > 200 ? '…' : '')
    : 'No source text available.';

  const sourceLabel = sourceItem?.source || 'document';

  return (
    <span
      className="citation-chip-wrap"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <button
        type="button"
        className="citation-chip-btn"
        onClick={(e) => {
          e.preventDefault();
          onSelectSource(index - 1);
        }}
        aria-label={`Citation [${index}]: ${sourceLabel}. Click to view source.`}
      >
        [{index}]
      </button>

      {showTooltip && (
        <span className="citation-tooltip pixel-box" role="tooltip">
          <span className="tooltip-header">
            <span className="tooltip-tag pixel-title">SOURCE [{index}]</span>
            <span className="tooltip-label retro-label">{sourceLabel}</span>
          </span>
          <span className="tooltip-snippet">{previewText}</span>
          <span className="tooltip-hint retro-label">▶ CLICK TO JUMP TO SOURCE</span>
        </span>
      )}
    </span>
  );
}

/**
 * Individual Chat Message (User Speech Bubble or AI LCD/Markdown Panel)
 */
export default function Message({ message, onSelectSource }) {
  const { id, role, content, sources = [] } = message;
  const isUser = role === 'user';
  const [highlightedSource, setHighlightedSource] = useState(null);

  // Check if AI response could not find the answer
  const isNotFound =
    !isUser &&
    (content.toLowerCase().includes("couldn't find") ||
      content.toLowerCase().includes('could not find') ||
      content.toLowerCase().includes('not found') ||
      content.toLowerCase().includes('unable to find'));

  // Pre-process citations: replace [1], [2], etc. with markdown links [1](cite:1)
  const processedContent = !isUser
    ? content.replace(/\[(\d+)\]/g, '[$1](cite:$1)')
    : content;

  const handleChipSelect = (sourceIdx) => {
    setHighlightedSource(sourceIdx);
    if (onSelectSource) {
      onSelectSource(id, sourceIdx);
    }
    // Also scroll element into view if present
    setTimeout(() => {
      const el = document.getElementById(`source-${id}-${sourceIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <motion.div
      className={`message-row ${isUser ? 'user-row' : 'ai-row'}`}
      initial={{ scale: 0.9, y: 12, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 280 }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="message-avatar-slot">
          <Byte mood={isNotFound ? 'confused' : 'happy'} size={38} />
          {isNotFound && (
            <div className="confused-sticker-badge" aria-hidden="true">
              <Sticker type="zap" scale={0.5} rotation={-8} ariaHidden={true} />
            </div>
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-ai pixel-box'}`}>
        {/* Comic Speech Tail for User */}
        {isUser && <div className="comic-bubble-tail" aria-hidden="true" />}

        {/* Content Body */}
        {isUser ? (
          <p className="user-message-text">{content}</p>
        ) : (
          <div className="ai-markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => {
                  if (href && href.startsWith('cite:')) {
                    const citIndex = parseInt(href.replace('cite:', ''), 10);
                    const sourceItem = sources[citIndex - 1];
                    return (
                      <CitationChip
                        index={citIndex}
                        sourceItem={sourceItem}
                        onSelectSource={handleChipSelect}
                      />
                    );
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pixel-link"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                code: ({ node, inline, className, children, ...props }) => {
                  if (inline) {
                    return <code className="pixel-inline-code" {...props}>{children}</code>;
                  }
                  return (
                    <div className="lcd-code-block">
                      <div className="lcd-header">
                        <span className="lcd-dot" />
                        <span className="lcd-dot" />
                        <span className="lcd-title retro-label">TERMINAL CODE</span>
                      </div>
                      <pre className="lcd-pre">
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {processedContent}
            </ReactMarkdown>

            {/* Collapsible Sources Drawer */}
            {sources && sources.length > 0 && (
              <SourcesDrawer
                sources={sources}
                highlightedSourceIndex={highlightedSource}
                messageId={id}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
