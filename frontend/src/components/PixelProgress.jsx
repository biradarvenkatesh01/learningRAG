import React from 'react';
import './PixelProgress.css';

/**
 * Chunky Segmented Pixel Progress Bar
 * Can be determinate (value 0-100) or cycling indeterminate.
 */
export default function PixelProgress({
  value = null, // null for indeterminate cycling blocks
  segments = 10,
  variant = 'teal', // 'teal' | 'mustard' | 'tomato' | 'mint'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  label = '',
}) {
  const isIndeterminate = value === null;
  const activeSegments = isIndeterminate
    ? null
    : Math.round((Math.max(0, Math.min(100, value)) / 100) * segments);

  return (
    <div className={`pixel-progress-container pixel-progress-${size} ${className}`}>
      {label && <div className="pixel-progress-label retro-label">{label}</div>}
      <div
        className={`pixel-progress-track pixel-progress-${variant} ${
          isIndeterminate ? 'indeterminate' : ''
        }`}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: segments }).map((_, index) => {
          const isActive = !isIndeterminate && index < activeSegments;
          return (
            <div
              key={index}
              className={`pixel-progress-block ${isActive ? 'filled' : ''}`}
              style={
                isIndeterminate
                  ? { animationDelay: `${index * 0.14}s` }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
