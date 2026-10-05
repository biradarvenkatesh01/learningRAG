import React from 'react';
import './PixelButton.css';

/**
 * Tactile Pixel Button with hard shadows and stepped active press.
 * Variants: 'primary' | 'secondary' | 'teal' | 'mustard' | 'ghost'
 */
export default function PixelButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  ariaLabel,
  title,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`pixel-btn pixel-btn-${variant} pixel-btn-${size} ${className}`}
    >
      <span className="pixel-btn-content">{children}</span>
    </button>
  );
}
