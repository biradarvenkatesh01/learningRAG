import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sticker from './Sticker';
import PixelButton from './PixelButton';
import './Toast.css';

/**
 * Dismissible Comic Error Toast
 * Displays error detail, POW! sticker, and an optional RETRY button.
 */
export default function Toast({ message, onDismiss, onRetry }) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="toast-overlay"
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 18, stiffness: 280 }}
        role="alert"
        aria-live="assertive"
      >
        <div className="toast-container pixel-box">
          <div className="toast-sticker-slot">
            <Sticker type="pow" scale={0.85} rotation={-4} ariaHidden={true} />
          </div>

          <div className="toast-content">
            <div className="toast-header">
              <span className="toast-title pixel-title">SYSTEM ALERT!</span>
              <button
                className="toast-close-btn"
                onClick={onDismiss}
                aria-label="Dismiss alert"
              >
                ✕
              </button>
            </div>
            <p className="toast-message">{message}</p>
          </div>

          {onRetry && (
            <div className="toast-actions">
              <PixelButton
                variant="mustard"
                size="sm"
                onClick={() => {
                  onDismiss();
                  onRetry();
                }}
              >
                RETRY ↺
              </PixelButton>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
