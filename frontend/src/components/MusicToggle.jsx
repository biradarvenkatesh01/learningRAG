import React, { useState, useEffect } from 'react';
import PixelButton from './PixelButton';
import { bgmEngine } from '../ambient/audioEngine';

/**
 * BGM Pixel Music Toggle Component
 * Shows cute animated pixel notes / equalizer when active, and allows one-click mute/unmute.
 */
export default function MusicToggle() {
  const [isMuted, setIsMuted] = useState(bgmEngine.isMuted);

  const toggleMusic = (e) => {
    e.stopPropagation();
    const muted = bgmEngine.toggleMute();
    setIsMuted(muted);
  };

  useEffect(() => {
    // Unlock and start audio on first user interaction anywhere on the page
    const handleFirstInteraction = () => {
      bgmEngine.unlock();
      setIsMuted(bgmEngine.isMuted);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return (
    <PixelButton
      variant={isMuted ? 'secondary' : 'mustard'}
      size="sm"
      onClick={toggleMusic}
      ariaLabel={isMuted ? 'Turn background music ON' : 'Mute background music'}
      title={isMuted ? 'Turn background music ON' : 'Mute background music'}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        {isMuted ? (
          /* Muted Pixel Speaker (12x12) */
          <svg
            viewBox="0 0 12 12"
            width="13"
            height="13"
            shapeRendering="crispEdges"
            style={{ imageRendering: 'pixelated' }}
            aria-hidden="true"
          >
            <rect x="1" y="4" width="2" height="4" fill="var(--ink)" />
            <rect x="3" y="3" width="2" height="6" fill="var(--ink)" />
            <rect x="5" y="2" width="2" height="8" fill="var(--ink)" />
            {/* Slash */}
            <rect x="8" y="3" width="1" height="2" fill="var(--tomato)" />
            <rect x="9" y="5" width="1" height="2" fill="var(--tomato)" />
            <rect x="10" y="7" width="1" height="2" fill="var(--tomato)" />
          </svg>
        ) : (
          /* Active Pixel Note with Equalizer waves (12x12) */
          <svg
            viewBox="0 0 12 12"
            width="13"
            height="13"
            shapeRendering="crispEdges"
            style={{ imageRendering: 'pixelated' }}
            aria-hidden="true"
          >
            <rect x="2" y="7" width="3" height="3" fill="var(--ink)" />
            <rect x="4" y="3" width="1" height="6" fill="var(--ink)" />
            <rect x="4" y="3" width="5" height="2" fill="var(--ink)" />
            <rect x="8" y="4" width="1" height="4" fill="var(--ink)" />
            <rect x="6" y="6" width="3" height="3" fill="var(--ink)" />
          </svg>
        )}
        <span>{isMuted ? 'BGM OFF' : 'BGM ON ♪'}</span>
      </span>
    </PixelButton>
  );
}
