import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './FloatCard.css';

/**
 * Reusable FloatCard for scattered desk cards and rails.
 * Features:
 * - Pixel corners & 3px ink border
 * - Optional mustard tape strip
 * - Gentle idle float & hover straighten
 * - Desktop draggable with double-click reset
 */
export default function FloatCard({
  children,
  rotation = 0,
  hasTape = false,
  tapePosition = 'center', // 'left' | 'center' | 'right'
  isFloating = true,
  isDraggable = true,
  fill = 'paper', // 'paper' | 'paper-dark' | 'halftone'
  className = '',
  style = {},
  dragConstraintsRef,
}) {
  const reducedMotion = useReducedMotion();
  const [resetKey, setResetKey] = useState(0);

  const canDrag = isDraggable && !reducedMotion;
  const canFloat = isFloating && !reducedMotion;

  // Double-click resets drag offset
  const handleDoubleClick = () => {
    if (canDrag) {
      setResetKey((prev) => prev + 1);
    }
  };

  const floatVariants = canFloat
    ? {
        y: [-4, 4, -4],
        transition: {
          duration: 5 + Math.abs(rotation) * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }
    : {};

  return (
    <motion.div
      key={resetKey}
      drag={canDrag}
      dragConstraints={dragConstraintsRef || { left: -300, right: 300, top: -200, bottom: 200 }}
      dragElastic={0.15}
      dragMomentum={false}
      onDoubleClick={handleDoubleClick}
      className={`float-card-wrapper ${canDrag ? 'is-draggable' : ''} ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      animate={floatVariants}
      whileHover={
        reducedMotion
          ? {}
          : {
              rotate: 0,
              scale: 1.02,
              y: -4,
              boxShadow: '8px 8px 0 var(--ink)',
              zIndex: 30,
            }
      }
    >
      {/* Optional Mustard Sticky Tape Strip */}
      {hasTape && (
        <div className={`card-tape-strip tape-${tapePosition}`} aria-hidden="true" />
      )}

      {/* Card Content Container */}
      <div className={`float-card-inner pixel-box fill-${fill}`}>
        {children}
      </div>
    </motion.div>
  );
}
