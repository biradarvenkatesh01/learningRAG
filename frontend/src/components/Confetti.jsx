import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const PALETTE = ['#FF5A4E', '#FFC93C', '#2EC4B6', '#9B8CFF', '#8FE3B0', '#1B1B2F'];

/**
 * Pixel Confetti Burst
 * 36 small pixel squares that burst upward and fall with gravity.
 */
export default function Confetti({ onComplete }) {
  const reducedMotion = useReducedMotion();

  const particles = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const angle = (i / 36) * 360 + (Math.random() * 20 - 10);
      const rad = (angle * Math.PI) / 180;
      const speed = 120 + Math.random() * 220;
      const destX = Math.cos(rad) * speed;
      const destY = Math.sin(rad) * speed + 80; // gravity bias downward
      const size = 6 + Math.floor(Math.random() * 5); // 6-10px
      const color = PALETTE[i % PALETTE.length];
      const rotate = (Math.random() - 0.5) * 720;

      return {
        id: i,
        destX,
        destY,
        size,
        color,
        rotate,
      };
    });
  }, []);

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{
            x: p.destX,
            y: p.destY,
            scale: [0, 1.2, 1, 0.4],
            rotate: p.rotate,
          }}
          transition={{
            duration: 1.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: '1px 1px 0 #1B1B2F',
            left: -p.size / 2,
            top: -p.size / 2,
          }}
        />
      ))}
    </div>
  );
}
