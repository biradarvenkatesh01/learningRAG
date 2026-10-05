import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './RagTips.css';

const TIPS = [
  {
    tag: 'SEARCH TIP',
    text: 'Specific questions retrieve better chunks than broad or vague ones.',
  },
  {
    tag: 'CITATIONS',
    text: 'Lilac chips [n] link directly to the exact chunk used by the LLM.',
  },
  {
    tag: 'SCORE METRIC',
    text: 'MATCH % shows the cosine similarity between your query and the text passage.',
  },
  {
    tag: 'FALLBACKS',
    text: 'INTRO sources appear when similarity is low, scanning the document opening.',
  },
  {
    tag: 'EMBEDDINGS',
    text: 'MiniLM converts words into 384-dimensional dense semantic vectors.',
  },
  {
    tag: 'VECTOR STORE',
    text: 'ChromaDB indexes vectors locally in-memory for instant nearest-neighbor lookups.',
  },
  {
    tag: 'CHUNKING',
    text: 'Sections are broken into overlapping chunks so thoughts aren\'t cut in half.',
  },
  {
    tag: 'BOUNDARIES',
    text: 'The AI is prompted to answer strictly from the document without making things up.',
  },
];

export default function RagTips() {
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  const currentTip = TIPS[tipIndex];

  return (
    <div className="rag-tips-container">
      <div className="rag-tips-header">
        <div className="rag-tips-title-wrap">
          <span className="rag-bulb-icon" aria-hidden="true">💡</span>
          <span className="pixel-title rag-tips-title">RAG TIP</span>
        </div>
        <span className="rag-tip-counter retro-label">
          {tipIndex + 1}/{TIPS.length}
        </span>
      </div>

      <div className="rag-tip-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            className="rag-tip-content"
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <span className="rag-tip-tag pixel-title">{currentTip.tag}</span>
            <p className="rag-tip-text">{currentTip.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="rag-tips-footer">
        <button
          type="button"
          className="rag-next-btn retro-label"
          onClick={handleNextTip}
          aria-label="View next RAG tip"
        >
          NEXT TIP ▶
        </button>
      </div>
    </div>
  );
}
