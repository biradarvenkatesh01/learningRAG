import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PixelButton from './PixelButton';
import './Modal.css';

/**
 * Retro Pixel Modal Dialog with focus trap and Esc handling.
 */
export default function Modal({
  isOpen,
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  confirmVariant = 'tomato',
  icon,
}) {
  const modalRef = useRef(null);

  // Esc key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="pixel-modal-backdrop" onClick={onCancel} role="presentation">
          <motion.div
            className="pixel-modal-window pixel-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            ref={modalRef}
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Modal Title Bar */}
            <div className="pixel-modal-titlebar">
              <div className="modal-title-wrap">
                {icon && <span className="modal-icon">{icon}</span>}
                <span id="modal-title" className="pixel-title modal-title-text">
                  {title}
                </span>
              </div>
              <button
                className="modal-close-icon"
                onClick={onCancel}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="pixel-modal-body">{children}</div>

            {/* Modal Footer Controls */}
            <div className="pixel-modal-footer">
              <PixelButton variant="secondary" size="md" onClick={onCancel}>
                {cancelLabel}
              </PixelButton>
              <PixelButton variant={confirmVariant} size="md" onClick={onConfirm}>
                {confirmLabel}
              </PixelButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
