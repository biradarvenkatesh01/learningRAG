import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import UploadScreen from './components/UploadScreen';
import ChatScreen from './components/ChatScreen';
import { useReducedMotion } from './hooks/useReducedMotion';
import { bgmEngine } from './ambient/audioEngine';
import { endSession } from './api';
import './styles/global.css';

const THEME_STORAGE_KEY = 'pixel_study_buddy_theme_v2';

export default function App() {
  const [screen, setScreen] = useState('upload'); // 'upload' | 'chat'
  const [docInfo, setDocInfo] = useState(null);

  const reducedMotion = useReducedMotion();

  // Unlock and play background music on first user interaction anywhere
  useEffect(() => {
    const handleFirstInteraction = () => {
      bgmEngine.unlock();
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Initially default to light mode ('day')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'night' || saved === 'day') return saved;
      return 'day';
    } catch {
      return 'day';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // LocalStorage access might fail in private browsing
    }
    if (theme === 'night') {
      document.documentElement.setAttribute('data-theme', 'night');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'night' ? 'day' : 'night'));
  };

  // The document only lives for this session: delete it from the backend when the tab
  // is closed or reloaded (ejecting the cartridge deletes it in ChatScreen)
  useEffect(() => {
    if (!docInfo) return;
    const handlePageHide = () => endSession(docInfo.doc_id);
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [docInfo]);

  const handleUploadSuccess = (info) => {
    setDocInfo(info);
    setScreen('chat');
  };

  const handleEjectDocument = () => {
    setDocInfo(null);
    setScreen('upload');
  };

  // Screen transition variants
  const screenVariants = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, x: screen === 'chat' ? 40 : -40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: screen === 'chat' ? -40 : 40 },
        transition: { type: 'spring', damping: 22, stiffness: 220 },
      };

  return (
    <div className="app-root notebook-grid">
      {/* Paper Grain Overlay: Inline SVG feTurbulence Noise */}
      <svg
        className="paper-grain-overlay"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="paper-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-noise)" />
      </svg>


      {/* Screen State Machine */}
      <AnimatePresence mode="wait">
        {screen === 'upload' ? (
          <motion.div
            key="screen-upload"
            className="screen-viewport-wrapper"
            initial={screenVariants.initial}
            animate={screenVariants.animate}
            exit={screenVariants.exit}
            transition={screenVariants.transition}
          >
            <UploadScreen
              onUploadSuccess={handleUploadSuccess}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="screen-chat"
            className="screen-viewport-wrapper"
            initial={screenVariants.initial}
            animate={screenVariants.animate}
            exit={screenVariants.exit}
            transition={screenVariants.transition}
          >
            <ChatScreen
              docInfo={docInfo}
              theme={theme}
              onToggleTheme={toggleTheme}
              onEjectDocument={handleEjectDocument}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
