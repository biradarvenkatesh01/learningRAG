import React, { useState } from 'react';
import PixelProgress from './PixelProgress';
import './SourcesDrawer.css';

/**
 * Pixel Scroll Icon (hand-crafted 16x16 SVG)
 */
function PixelScrollIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      className="pixel-art"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="2" y="1" width="10" height="2" fill="var(--ink)" />
      <rect x="2" y="2" width="10" height="1" fill="var(--paper)" />
      <rect x="1" y="3" width="12" height="10" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="3" y="5" width="8" height="1" fill="var(--ink)" />
      <rect x="3" y="7" width="8" height="1" fill="var(--ink)" />
      <rect x="3" y="9" width="5" height="1" fill="var(--ink)" />
      <rect x="4" y="13" width="10" height="2" fill="var(--ink)" />
      <rect x="4" y="13" width="10" height="1" fill="var(--paper-dark)" />
    </svg>
  );
}

/**
 * SourcesDrawer: collapsible drawer showing RAG sources with scores, XP bars, or INTRO tags.
 */
export default function SourcesDrawer({
  sources = [],
  highlightedSourceIndex = null,
  messageId,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

  if (!sources || sources.length === 0) return null;

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const toggleSourceExpand = (index) => {
    setExpandedSources((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="sources-drawer-wrapper">
      <button
        className="sources-toggle-btn"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={`sources-list-${messageId}`}
      >
        <PixelScrollIcon />
        <span className="pixel-title sources-btn-text">
          SOURCES ({sources.length})
        </span>
        <span className="sources-caret" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div id={`sources-list-${messageId}`} className="sources-content-list" role="region">
          {sources.map((item, idx) => {
            const isHighlighted = highlightedSourceIndex === idx;
            const isLong = item.text && item.text.length > 220;
            const isExpanded = !!expandedSources[idx];
            const displayText = isLong && !isExpanded
              ? `${item.text.slice(0, 220)}…`
              : item.text;

            const scorePercent =
              item.score !== null && item.score !== undefined
                ? Math.round(item.score * 100)
                : null;

            return (
              <div
                key={idx}
                id={`source-${messageId}-${idx}`}
                className={`source-card pixel-box ${isHighlighted ? 'highlighted' : ''}`}
              >
                {/* Header: Citation index, Source label & XP / INTRO */}
                <div className="source-card-header">
                  <div className="source-badge-wrap">
                    <span className="source-num-badge pixel-title">
                      [{idx + 1}]
                    </span>
                    <span className="source-label retro-label">
                      {item.source || 'document'}
                    </span>
                  </div>

                  <div className="source-metric">
                    {scorePercent !== null ? (
                      <div className="source-score-block">
                        <span className="source-score-text retro-label">
                          MATCH {scorePercent}%
                        </span>
                        <div className="source-mini-bar" aria-hidden="true">
                          <PixelProgress
                            value={scorePercent}
                            segments={6}
                            variant="mustard"
                            size="sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="intro-badge pixel-title">INTRO</span>
                    )}
                  </div>
                </div>

                {/* Body: Extracted Chunk Text */}
                <p className="source-snippet-text">{displayText}</p>

                {isLong && (
                  <button
                    className="source-expand-toggle retro-label"
                    onClick={() => toggleSourceExpand(idx)}
                  >
                    {isExpanded ? '[-] SHOW LESS' : '[+] SHOW MORE'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
