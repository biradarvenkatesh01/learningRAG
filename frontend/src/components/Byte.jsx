import React, { useState, useEffect } from 'react';
import './Byte.css';

/**
 * BYTE: Original pixel-art study robot companion (16x16 SVG grid).
 * Moods: 'idle' | 'thinking' | 'happy' | 'confused' | 'sleeping'
 */
export default function Byte({ mood = 'idle', size = 48, className = '' }) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Stepped random blink interval for idle mood
  useEffect(() => {
    if (mood !== 'idle') return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [mood]);

  return (
    <div
      className={`byte-mascot mood-${mood} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Byte mascot feeling ${mood}`}
    >
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        className="byte-svg"
        shapeRendering="crispEdges"
      >
        {/* === ACCESSORIES / SURROUNDINGS BASED ON MOOD === */}
        {mood === 'thinking' && (
          /* Thought bubble dots */
          <g className="thought-dots">
            <rect x="1" y="2" width="1" height="1" fill="var(--ink)" />
            <rect x="2" y="1" width="1" height="1" fill="var(--mustard)" />
            <rect x="0" y="0" width="2" height="1" fill="var(--ink)" />
          </g>
        )}

        {mood === 'confused' && (
          /* Floating Question Mark */
          <g className="confused-mark">
            <rect x="1" y="0" width="3" height="1" fill="var(--tomato)" />
            <rect x="3" y="1" width="1" height="1" fill="var(--tomato)" />
            <rect x="2" y="2" width="1" height="1" fill="var(--tomato)" />
            <rect x="2" y="4" width="1" height="1" fill="var(--tomato)" />
          </g>
        )}

        {mood === 'sleeping' && (
          /* Floating Zzz */
          <g className="sleep-zzz">
            <rect x="1" y="0" width="2" height="1" fill="var(--lilac)" />
            <rect x="2" y="1" width="1" height="1" fill="var(--lilac)" />
            <rect x="1" y="2" width="2" height="1" fill="var(--lilac)" />
          </g>
        )}

        {/* === ANTENNA === */}
        {/* Antenna rod */}
        <rect x="7" y="2" width="2" height="2" fill="var(--ink)" />
        {/* Antenna light bulb */}
        <rect
          x="7"
          y="0"
          width="2"
          height="2"
          className="antenna-bulb"
          fill={
            mood === 'thinking'
              ? 'var(--mustard)'
              : mood === 'happy'
              ? 'var(--mint)'
              : mood === 'confused'
              ? 'var(--tomato)'
              : mood === 'sleeping'
              ? 'var(--muted)'
              : 'var(--teal)'
          }
        />

        {/* === GRADUATION CAP === */}
        {/* Mortarboard skull base */}
        <rect x="5" y="3" width="6" height="1" fill="var(--ink)" />
        {/* Mortarboard flat top */}
        <rect x="3" y="2" width="10" height="1" fill="var(--ink)" />
        {/* Tassel cord and bead */}
        <rect x="12" y="3" width="1" height="2" fill="var(--mustard)" />
        <rect x="13" y="4" width="1" height="1" fill="var(--mustard)" />

        {/* === ROBOT HEAD CHASSIS (Teal & Ink) === */}
        {/* Outer head outline */}
        <rect x="2" y="4" width="12" height="10" fill="var(--ink)" />
        {/* Head chassis body */}
        <rect x="3" y="5" width="10" height="8" fill="var(--teal)" />
        {/* Ear bolts */}
        <rect x="1" y="7" width="1" height="2" fill="var(--mustard)" />
        <rect x="14" y="7" width="1" height="2" fill="var(--mustard)" />

        {/* === SCREEN (Dark LCD display) === */}
        <rect x="4" y="6" width="8" height="6" fill="#14121F" />
        {/* Screen inner glow / bezel highlight */}
        <rect x="4" y="6" width="8" height="1" fill="rgba(255,255,255,0.15)" />

        {/* === FACIAL EXPRESSIONS (Inside LCD 4x6 to 11x11) === */}

        {/* IDLE MOOD */}
        {mood === 'idle' && (
          <>
            {isBlinking ? (
              /* Eyes closed blink */
              <>
                <rect x="5" y="8" width="2" height="1" fill="var(--mint)" />
                <rect x="9" y="8" width="2" height="1" fill="var(--mint)" />
              </>
            ) : (
              /* Eyes open */
              <>
                <rect x="5" y="7" width="2" height="2" fill="var(--mint)" />
                <rect x="9" y="7" width="2" height="2" fill="var(--mint)" />
                {/* Pupils */}
                <rect x="6" y="8" width="1" height="1" fill="#14121F" />
                <rect x="10" y="8" width="1" height="1" fill="#14121F" />
              </>
            )}
            {/* Friendly mouth */}
            <rect x="7" y="10" width="2" height="1" fill="var(--mint)" />
          </>
        )}

        {/* THINKING MOOD */}
        {mood === 'thinking' && (
          <>
            {/* Eyes looking up right */}
            <rect x="5" y="6" width="2" height="2" fill="var(--mustard)" />
            <rect x="9" y="6" width="2" height="2" fill="var(--mustard)" />
            <rect x="6" y="6" width="1" height="1" fill="#14121F" />
            <rect x="10" y="6" width="1" height="1" fill="#14121F" />
            {/* Small 'o' mouth */}
            <rect x="7" y="10" width="2" height="1" fill="var(--mustard)" />
          </>
        )}

        {/* HAPPY MOOD */}
        {mood === 'happy' && (
          <>
            {/* Joyful crescent eyes ^^ */}
            <rect x="5" y="8" width="1" height="1" fill="var(--mint)" />
            <rect x="6" y="7" width="1" height="1" fill="var(--mint)" />
            <rect x="9" y="8" width="1" height="1" fill="var(--mint)" />
            <rect x="10" y="7" width="1" height="1" fill="var(--mint)" />
            {/* Pink blush cheeks */}
            <rect x="4" y="9" width="1" height="1" fill="var(--tomato)" />
            <rect x="11" y="9" width="1" height="1" fill="var(--tomato)" />
            {/* Big open smile */}
            <rect x="6" y="10" width="4" height="1" fill="var(--mint)" />
            <rect x="7" y="11" width="2" height="1" fill="var(--tomato)" />
          </>
        )}

        {/* CONFUSED MOOD */}
        {mood === 'confused' && (
          <>
            {/* One big eye, one squinted eye */}
            <rect x="5" y="7" width="2" height="2" fill="var(--mustard)" />
            <rect x="9" y="8" width="2" height="1" fill="var(--mustard)" />
            {/* Squiggly mouth */}
            <rect x="6" y="10" width="2" height="1" fill="var(--tomato)" />
            <rect x="8" y="11" width="2" height="1" fill="var(--tomato)" />
          </>
        )}

        {/* SLEEPING MOOD */}
        {mood === 'sleeping' && (
          <>
            {/* Closed peaceful eye lines */}
            <rect x="5" y="8" width="2" height="1" fill="var(--lilac)" />
            <rect x="9" y="8" width="2" height="1" fill="var(--lilac)" />
            {/* Quiet mouth */}
            <rect x="7" y="10" width="2" height="1" fill="var(--lilac)" />
          </>
        )}

        {/* === NECK & TIE === */}
        <rect x="7" y="14" width="2" height="1" fill="var(--ink)" />
        <rect x="6" y="15" width="4" height="1" fill="var(--tomato)" />
      </svg>
    </div>
  );
}
