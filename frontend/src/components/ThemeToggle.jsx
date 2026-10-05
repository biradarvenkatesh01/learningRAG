import React from 'react';
import PixelButton from './PixelButton';

/**
 * NIGHT STUDY Toggle Button
 * Toggles and persists day/night theme with tactile pixel icon.
 */
export default function ThemeToggle({ theme, onToggle }) {
  const isNight = theme === 'night';

  return (
    <PixelButton
      variant={isNight ? 'teal' : 'secondary'}
      size="sm"
      onClick={onToggle}
      ariaLabel={isNight ? 'Switch to Day Study mode' : 'Switch to Night Study mode'}
      title={isNight ? 'Switch to Day Study mode' : 'Switch to Night Study mode'}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        {isNight ? (
          /* Pixel Moon Icon (10x10) */
          <svg
            viewBox="0 0 10 10"
            width="14"
            height="14"
            shapeRendering="crispEdges"
            style={{ imageRendering: 'pixelated' }}
            aria-hidden="true"
          >
            <rect x="2" y="1" width="4" height="1" fill="var(--mustard)" />
            <rect x="1" y="2" width="6" height="1" fill="var(--mustard)" />
            <rect x="1" y="3" width="3" height="4" fill="var(--mustard)" />
            <rect x="1" y="7" width="6" height="1" fill="var(--mustard)" />
            <rect x="2" y="8" width="4" height="1" fill="var(--mustard)" />
          </svg>
        ) : (
          /* Pixel Sun Icon (10x10) */
          <svg
            viewBox="0 0 10 10"
            width="14"
            height="14"
            shapeRendering="crispEdges"
            style={{ imageRendering: 'pixelated' }}
            aria-hidden="true"
          >
            <rect x="4" y="0" width="2" height="1" fill="var(--ink)" />
            <rect x="4" y="9" width="2" height="1" fill="var(--ink)" />
            <rect x="0" y="4" width="1" height="2" fill="var(--ink)" />
            <rect x="9" y="4" width="1" height="2" fill="var(--ink)" />
            <rect x="3" y="3" width="4" height="4" fill="var(--mustard)" />
            <rect x="2" y="2" width="6" height="6" fill="none" stroke="var(--ink)" strokeWidth="1" />
          </svg>
        )}
        <span>{isNight ? 'CRT NIGHT' : 'DAY DESK'}</span>
      </span>
    </PixelButton>
  );
}
