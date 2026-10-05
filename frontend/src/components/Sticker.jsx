import React from 'react';
import './Sticker.css';

/**
 * Comic Die-Cut Pixel Stickers
 * Types: 'pow' | 'zap' | 'nice' | 'floppy' | 'focus' | 'coffee' | 'pencil' | 'star' | 'heart' | 'stamp'
 */
export default function Sticker({
  type = 'star',
  rotation = 0,
  scale = 1,
  className = '',
  onClick,
  ariaHidden = false,
}) {
  const renderStickerContent = () => {
    switch (type) {
      case 'pow':
        return (
          <div className="comic-starburst starburst-pow halftone-bg">
            <svg viewBox="0 0 100 60" className="starburst-svg" preserveAspectRatio="none">
              <polygon
                points="10,30 0,18 18,20 22,2 38,16 52,0 64,16 80,4 82,20 100,24 88,36 98,50 82,48 76,60 58,50 48,60 36,48 20,58 22,42 4,44"
                className="burst-polygon"
                fill="var(--tomato)"
                stroke="var(--ink)"
                strokeWidth="3"
                strokeLinejoin="bevel"
              />
            </svg>
            <span className="starburst-text">POW!</span>
          </div>
        );

      case 'zap':
        return (
          <div className="comic-starburst starburst-zap halftone-bg">
            <svg viewBox="0 0 90 55" className="starburst-svg" preserveAspectRatio="none">
              <polygon
                points="8,28 0,14 16,18 20,2 36,14 50,0 60,14 74,4 76,18 90,22 80,34 88,46 74,44 68,54 52,46 42,54 32,44 18,52 20,38 4,40"
                className="burst-polygon"
                fill="var(--mustard)"
                stroke="var(--ink)"
                strokeWidth="3"
                strokeLinejoin="bevel"
              />
            </svg>
            <span className="starburst-text" style={{ color: 'var(--ink)' }}>ZAP!</span>
          </div>
        );

      case 'nice':
        return (
          <div className="comic-starburst starburst-nice halftone-bg">
            <svg viewBox="0 0 96 55" className="starburst-svg" preserveAspectRatio="none">
              <polygon
                points="10,26 2,12 18,16 22,2 38,14 52,0 64,14 78,4 80,18 94,22 84,34 92,48 78,44 72,54 56,46 44,54 34,44 20,52 22,38 6,40"
                className="burst-polygon"
                fill="var(--teal)"
                stroke="var(--ink)"
                strokeWidth="3"
                strokeLinejoin="bevel"
              />
            </svg>
            <span className="starburst-text" style={{ color: '#FFFFFF' }}>NICE!</span>
          </div>
        );

      case 'floppy':
        return (
          <div className="sticker-floppy">
            <svg viewBox="0 0 32 32" width="64" height="64" className="pixel-art" shapeRendering="crispEdges">
              {/* Outer chassis */}
              <rect x="2" y="2" width="28" height="28" fill="var(--ink)" />
              <rect x="4" y="4" width="24" height="24" fill="var(--lilac)" />
              {/* Top notch */}
              <rect x="24" y="4" width="4" height="4" fill="var(--paper)" />
              {/* Metal slider */}
              <rect x="8" y="4" width="16" height="10" fill="var(--paper-dark)" stroke="var(--ink)" strokeWidth="2" />
              <rect x="12" y="6" width="4" height="6" fill="var(--ink)" />
              {/* White paper label */}
              <rect x="6" y="16" width="20" height="11" fill="#FFFFFF" stroke="var(--ink)" strokeWidth="2" />
              {/* Red marker stripe on label */}
              <rect x="8" y="18" width="16" height="2" fill="var(--tomato)" />
            </svg>
            <div className="floppy-label-text">BRAIN.EXE</div>
          </div>
        );

      case 'focus':
        return (
          <div className="sticker-focus halftone-bg">
            <svg viewBox="0 0 16 16" width="24" height="24" className="pixel-art" shapeRendering="crispEdges">
              <polygon
                points="9,0 3,9 8,9 6,16 13,7 8,7"
                fill="var(--mustard)"
                stroke="var(--ink)"
                strokeWidth="1.5"
              />
            </svg>
            <span className="focus-text">FOCUS MODE</span>
          </div>
        );

      case 'coffee':
        return (
          <div className="sticker-coffee">
            <svg viewBox="0 0 20 20" width="48" height="48" className="pixel-art" shapeRendering="crispEdges">
              {/* Steam */}
              <rect x="6" y="1" width="1" height="2" fill="var(--muted)" />
              <rect x="10" y="0" width="1" height="3" fill="var(--muted)" />
              <rect x="8" y="2" width="1" height="2" fill="var(--muted)" />
              {/* Mug border */}
              <rect x="3" y="5" width="11" height="12" fill="var(--ink)" />
              <rect x="13" y="7" width="5" height="8" fill="var(--ink)" />
              {/* Mug handle inside */}
              <rect x="14" y="9" width="2" height="4" fill="var(--paper)" />
              {/* Mug body */}
              <rect x="5" y="6" width="8" height="10" fill="var(--mustard)" />
              {/* Coffee liquid */}
              <rect x="5" y="6" width="8" height="2" fill="#5C3D2E" />
              {/* Pixel heart on mug */}
              <rect x="8" y="10" width="2" height="2" fill="var(--tomato)" />
              <rect x="7" y="10" width="1" height="1" fill="var(--tomato)" />
              <rect x="10" y="10" width="1" height="1" fill="var(--tomato)" />
            </svg>
            <span className="coffee-xp">+1 XP</span>
          </div>
        );

      case 'pencil':
        return (
          <div className="sticker-pixel-icon">
            <svg viewBox="0 0 16 16" width="36" height="36" className="pixel-art" shapeRendering="crispEdges">
              <rect x="2" y="12" width="2" height="2" fill="var(--ink)" />
              <rect x="4" y="10" width="2" height="2" fill="#E8D9C0" />
              <rect x="6" y="8" width="6" height="6" fill="var(--mustard)" stroke="var(--ink)" strokeWidth="1" />
              <rect x="11" y="3" width="3" height="3" fill="var(--tomato)" stroke="var(--ink)" strokeWidth="1" />
              <rect x="10" y="4" width="2" height="2" fill="#D3D3D3" />
            </svg>
          </div>
        );

      case 'star':
        return (
          <div className="sticker-pixel-icon">
            <svg viewBox="0 0 16 16" width="36" height="36" className="pixel-art" shapeRendering="crispEdges">
              <rect x="7" y="1" width="2" height="14" fill="var(--mustard)" />
              <rect x="1" y="7" width="14" height="2" fill="var(--mustard)" />
              <rect x="4" y="4" width="8" height="8" fill="var(--mustard)" />
              <rect x="3" y="3" width="10" height="10" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
              <rect x="6" y="6" width="2" height="2" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'heart':
        return (
          <div className="sticker-pixel-icon">
            <svg viewBox="0 0 16 16" width="36" height="36" className="pixel-art" shapeRendering="crispEdges">
              <path
                d="M 3,4 H 7 V 6 H 9 V 4 H 13 V 8 H 11 V 10 H 9 V 12 H 7 V 10 H 5 V 8 H 3 Z"
                fill="var(--tomato)"
                stroke="var(--ink)"
                strokeWidth="1.5"
              />
              <rect x="4" y="5" width="2" height="2" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'stamp':
        return (
          <div className="rubber-stamp">
            <div className="stamp-inner">
              <div className="stamp-text">DONE!</div>
              <div className="stamp-sub">VERIFIED</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`comic-sticker-wrapper ${className}`}
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center center',
      }}
      onClick={onClick}
      aria-hidden={ariaHidden}
    >
      <div className="comic-sticker-diecut">
        {renderStickerContent()}
      </div>
    </div>
  );
}
