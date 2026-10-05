import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Byte from './Byte';
import Sticker from './Sticker';
import PixelButton from './PixelButton';
import ThemeToggle from './ThemeToggle';
import MusicToggle from './MusicToggle';
import Pomodoro from './Pomodoro';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import Composer from './Composer';
import Modal from './Modal';
import Toast from './Toast';
import FloatCard from './FloatCard';
import RagTips from './RagTips';
import PixelProgress from './PixelProgress';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { sendChat, deleteDocument } from '../api';
import './ChatScreen.css';

const STARTER_QUESTIONS = [
  'What is this document about?',
  'Summarize the key points',
  'Explain the hardest concept simply',
  'Quiz me with 3 questions',
];

// Pixel Hamburger Icon (☰)
function PixelMenuIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" className="pixel-art" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="3" width="12" height="2" fill="var(--ink)" />
      <rect x="2" y="7" width="12" height="2" fill="var(--ink)" />
      <rect x="2" y="11" width="12" height="2" fill="var(--ink)" />
    </svg>
  );
}

// Pixel Scroll Icon (📜)
function PixelSourcesIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" className="pixel-art" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="10" height="2" fill="var(--ink)" />
      <rect x="1" y="3" width="12" height="9" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="3" y="5" width="8" height="1" fill="var(--ink)" />
      <rect x="3" y="7" width="8" height="1" fill="var(--ink)" />
      <rect x="3" y="9" width="5" height="1" fill="var(--ink)" />
      <rect x="4" y="12" width="10" height="2" fill="var(--ink)" />
    </svg>
  );
}

export default function ChatScreen({
  docInfo,
  theme,
  onToggleTheme,
  onEjectDocument,
  onSparkleTrigger,
}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [isEjectModalOpen, setIsEjectModalOpen] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [celebrationSticker, setCelebrationSticker] = useState(null);
  const celebrationTimerRef = useRef(null);

  const showCelebration = useCallback((type, duration = 2400) => {
    setCelebrationSticker(type);
    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
    }
    celebrationTimerRef.current = setTimeout(() => {
      setCelebrationSticker(null);
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  // In-memory Session Stats
  const [questionsCount, setQuestionsCount] = useState(0);
  const [citationsCount, setCitationsCount] = useState(0);
  const [notFoundCount, setNotFoundCount] = useState(0);
  const [pomodorosDone, setPomodorosDone] = useState(0);

  // Mobile / Tablet Drawer states
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Synchronized citation highlight in right rail
  const [highlightedSourceIdx, setHighlightedSourceIdx] = useState(null);

  // Upload timestamp formatted
  const uploadTimeStr = useMemo(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const { containerRef, showNewPill, scrollToBottom, handleScroll } =
    useAutoScroll(messages.length + (isLoading ? 1 : 0));

  // Determine Byte's mood for the header
  const getHeaderByteMood = () => {
    if (isBreakTime) return 'sleeping';
    if (isLoading) return 'thinking';
    if (errorMessage) return 'confused';
    return 'idle';
  };

  // Find most recent AI answer's sources
  const latestAiMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.role === 'assistant');
  }, [messages]);

  const latestSources = latestAiMessage?.sources || [];

  const handleSendQuestion = async (questionText) => {
    if (!questionText || isLoading) return;

    const userMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: questionText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLastQuestion(questionText);
    setErrorMessage('');
    setIsLoading(true);
    setQuestionsCount((prev) => prev + 1);

    try {
      const data = await sendChat(docInfo.doc_id, questionText, messages);

      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update in-memory stats
      if (data.sources && data.sources.length > 0) {
        setCitationsCount((prev) => prev + 1);
      }
      const lowerAns = (data.answer || '').toLowerCase();
      if (
        lowerAns.includes("couldn't find") ||
        lowerAns.includes('could not find') ||
        lowerAns.includes('not found') ||
        lowerAns.includes('unable to find')
      ) {
        setNotFoundCount((prev) => prev + 1);
      }

      // Sparkle ambient stars & celebration sticker
      if (onSparkleTrigger) onSparkleTrigger();
      showCelebration('nice', 2200);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to get answer. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuestion) {
      handleSendQuestion(lastQuestion);
    }
  };

  const confirmEjectCartridge = async () => {
    setIsEjectModalOpen(false);
    try {
      await deleteDocument(docInfo.doc_id);
    } catch {
      // Local state reset regardless of network
    }
    onEjectDocument();
  };

  const handleCitationChipSelect = (msgId, sourceIdx) => {
    setHighlightedSourceIdx(sourceIdx);
    // If screen is smaller than 1200px, open right rail so user sees the source
    if (window.innerWidth < 1200) {
      setIsRightDrawerOpen(true);
    }
    setTimeout(() => {
      const el = document.getElementById(`rail-source-${sourceIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 150);
  };

  return (
    <div className="chat-v2-fullscreen">
      {/* CRT Scanlines for Night Study Mode */}
      <div className="crt-scanlines" aria-hidden="true" />

      {/* Floating Celebration Sticker */}
      <AnimatePresence>
        {celebrationSticker && (
          <motion.div
            className="floating-celebration"
            initial={{ scale: 0, rotate: -20, y: 20, opacity: 0 }}
            animate={{ scale: 1.1, rotate: 6, y: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 14 }}
            onClick={() => setCelebrationSticker(null)}
            title="Click to dismiss"
            aria-label="Celebration sticker. Click to dismiss."
          >
            <Sticker type={celebrationSticker} scale={1.2} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* === SLIM FULL-WIDTH TOP BAR === */}
      <header className="chat-topbar pixel-box">
        <div className="topbar-left">
          {/* Mobile Left Rail Drawer Toggle Button */}
          <button
            type="button"
            className="mobile-rail-btn left-rail-toggle"
            onClick={() => setIsLeftDrawerOpen(true)}
            aria-label="Open Session Sidebar"
          >
            <PixelMenuIcon />
            <span className="pixel-title mobile-btn-text">STATS</span>
          </button>

          <div className="topbar-logo-brand">
            <Byte mood={getHeaderByteMood()} size={30} />
            <span className="topbar-brand-name pixel-title">
              PIXEL STUDY BUDDY
            </span>
          </div>

          <div className="topbar-doc-label" title={docInfo.filename}>
            <span className="doc-indicator">▶</span>
            <span className="doc-name pixel-title">{docInfo.filename}</span>
          </div>
        </div>

        <div className="topbar-right">
          {/* Mobile Right Rail Drawer Toggle Button */}
          <button
            type="button"
            className="mobile-rail-btn right-rail-toggle"
            onClick={() => setIsRightDrawerOpen(true)}
            aria-label="Open Sources & Tips"
          >
            <PixelSourcesIcon />
            <span className="pixel-title mobile-btn-text">SOURCES</span>
          </button>

          <MusicToggle />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <PixelButton
            variant="tomato"
            size="sm"
            onClick={() => setIsEjectModalOpen(true)}
            ariaLabel="Eject cartridge and start new session"
          >
            NEW DOC ⏏
          </PixelButton>
        </div>
      </header>

      {/* === 3-COLUMN FULL-SCREEN MAIN BODY === */}
      <div className="chat-3col-body">
        {/* ========================================================
            LEFT RAIL (~280px): Cartridge Card, Pomodoro, Session Stats
           ======================================================== */}
        <aside className={`rail-column left-rail ${isLeftDrawerOpen ? 'drawer-open' : ''}`}>
          <div className="rail-drawer-header mobile-only">
            <span className="pixel-title drawer-title">SESSION INFO</span>
            <button
              className="drawer-close-btn"
              onClick={() => setIsLeftDrawerOpen(false)}
              aria-label="Close session sidebar"
            >
              ✕
            </button>
          </div>

          <div className="rail-scroll-content">
            {/* 1. CARTRIDGE Card */}
            <FloatCard
              rotation={0}
              isFloating={false}
              isDraggable={false}
              hasTape={true}
              tapePosition="left"
              fill="paper"
              className="rail-card"
            >
              <div className="cartridge-card-body">
                <div className="rail-card-title-bar">
                  <span className="rail-card-icon">💾</span>
                  <span className="pixel-title rail-card-title">CARTRIDGE</span>
                </div>

                <div className="cartridge-detail-rows">
                  <div className="detail-row">
                    <span className="retro-label detail-key">FILE:</span>
                    <span className="detail-val filename-val" title={docInfo.filename}>
                      {docInfo.filename}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="retro-label detail-key">CHUNKS:</span>
                    <span className="detail-val highlight-val">{docInfo.num_chunks}</span>
                  </div>
                  <div className="detail-row">
                    <span className="retro-label detail-key">SECTIONS:</span>
                    <span className="detail-val">{docInfo.num_sections || 1}</span>
                  </div>
                  <div className="detail-row">
                    <span className="retro-label detail-key">LOADED:</span>
                    <span className="detail-val">{uploadTimeStr}</span>
                  </div>
                </div>
              </div>
            </FloatCard>

            {/* 2. POMODORO Card */}
            <FloatCard
              rotation={0}
              isFloating={false}
              isDraggable={false}
              hasTape={false}
              fill="paper-dark"
              className="rail-card"
            >
              <Pomodoro
                layout="rail"
                sessionsCount={pomodorosDone}
                onBreakChange={(onBreak) => {
                  setIsBreakTime(onBreak);
                  if (onBreak) {
                    showCelebration('coffee', 2600);
                  }
                }}
                onSessionComplete={(newCount) => setPomodorosDone(newCount)}
              />
            </FloatCard>

            {/* 3. SESSION STATS Card */}
            <FloatCard
              rotation={0}
              isFloating={false}
              isDraggable={false}
              hasTape={true}
              tapePosition="right"
              fill="paper"
              className="rail-card"
            >
              <div className="session-stats-body">
                <div className="rail-card-title-bar">
                  <span className="rail-card-icon">📊</span>
                  <span className="pixel-title rail-card-title">SESSION STATS</span>
                </div>

                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-number pixel-title">{questionsCount}</span>
                    <span className="stat-label retro-label">QUESTIONS</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number pixel-title text-teal">{citationsCount}</span>
                    <span className="stat-label retro-label">WITH CITATIONS</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number pixel-title text-tomato">{notFoundCount}</span>
                    <span className="stat-label retro-label">NOT FOUND</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number pixel-title text-mustard">{pomodorosDone}</span>
                    <span className="stat-label retro-label">POMODOROS</span>
                  </div>
                </div>
              </div>
            </FloatCard>
          </div>
        </aside>

        {/* Overlay backdrop for mobile left drawer */}
        {isLeftDrawerOpen && (
          <div
            className="rail-drawer-backdrop"
            onClick={() => setIsLeftDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ========================================================
            CENTER COLUMN (flex): Full-height chat + pinned composer
           ======================================================== */}
        <main className="chat-center-column">
          {/* Scrollable Messages Area */}
          <div
            className="center-messages-scroll"
            ref={containerRef}
            onScroll={handleScroll}
            aria-live="polite"
          >
            {/* Empty State */}
            {messages.length === 0 && !isLoading && (
              <div className="chat-empty-state">
                <div className="empty-mascot-wrap">
                  <Byte mood="happy" size={72} />
                </div>

                <h2 className="empty-title pixel-title">
                  ASK ME ANYTHING ABOUT THIS DOC
                </h2>

                <p className="empty-subtitle retro-label">
                  Pick a starter question or type your prompt into the console below.
                </p>

                <div className="starter-questions-grid">
                  {STARTER_QUESTIONS.map((question, idx) => (
                    <button
                      key={idx}
                      className="starter-chip pixel-box"
                      onClick={() => handleSendQuestion(question)}
                    >
                      <span className="starter-chip-arrow">▶</span>
                      <span className="starter-chip-text">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Feed */}
            {messages.map((msg) => (
              <Message
                key={msg.id}
                message={msg}
                onSelectSource={handleCitationChipSelect}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}
          </div>

          {/* New Messages Pill */}
          <AnimatePresence>
            {showNewPill && (
              <motion.div
                className="new-messages-pill-wrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                <button
                  className="new-messages-pill pixel-box"
                  onClick={() => scrollToBottom('smooth')}
                >
                  ▼ NEW MESSAGES
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pinned Composer at the bottom */}
          <footer className="center-composer-footer">
            <Composer onSend={handleSendQuestion} disabled={isLoading} />
          </footer>
        </main>

        {/* ========================================================
            RIGHT RAIL (~300px): Last Sources Card + RAG Tip Card
           ======================================================== */}
        <aside className={`rail-column right-rail ${isRightDrawerOpen ? 'drawer-open' : ''}`}>
          <div className="rail-drawer-header mobile-only">
            <span className="pixel-title drawer-title">SOURCES & TIPS</span>
            <button
              className="drawer-close-btn"
              onClick={() => setIsRightDrawerOpen(false)}
              aria-label="Close sources & tips sidebar"
            >
              ✕
            </button>
          </div>

          <div className="rail-scroll-content">
            {/* 1. LAST SOURCES Card */}
            <FloatCard
              rotation={0}
              isFloating={false}
              isDraggable={false}
              hasTape={true}
              tapePosition="center"
              fill="paper"
              className="rail-card"
            >
              <div className="last-sources-container">
                <div className="rail-card-title-bar">
                  <span className="rail-card-icon">📜</span>
                  <span className="pixel-title rail-card-title">LAST SOURCES</span>
                  {latestSources.length > 0 && (
                    <span className="retro-label sources-count-pill">
                      ({latestSources.length})
                    </span>
                  )}
                </div>

                {latestSources.length === 0 ? (
                  <div className="sources-empty-box">
                    <p className="sources-empty-text retro-label">
                      Passages cited by the AI will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="rail-sources-list">
                    {latestSources.map((item, idx) => {
                      const isHighlighted = highlightedSourceIdx === idx;
                      const scorePercent =
                        item.score !== null && item.score !== undefined
                          ? Math.round(item.score * 100)
                          : null;

                      return (
                        <div
                          key={idx}
                          id={`rail-source-${idx}`}
                          className={`rail-source-item pixel-box ${
                            isHighlighted ? 'rail-source-highlighted' : ''
                          }`}
                        >
                          <div className="rail-source-header">
                            <span className="rail-source-badge pixel-title">
                              [{idx + 1}] {item.source || 'document'}
                            </span>
                            {scorePercent !== null ? (
                              <span className="rail-score-tag retro-label">
                                MATCH {scorePercent}%
                              </span>
                            ) : (
                              <span className="rail-intro-tag pixel-title">INTRO</span>
                            )}
                          </div>
                          <p className="rail-source-snippet">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </FloatCard>

            {/* 2. RAG TIP Card */}
            <FloatCard
              rotation={0}
              isFloating={false}
              isDraggable={false}
              hasTape={true}
              tapePosition="right"
              fill="paper-dark"
              className="rail-card"
            >
              <RagTips />
            </FloatCard>
          </div>
        </aside>

        {/* Overlay backdrop for mobile right drawer */}
        {isRightDrawerOpen && (
          <div
            className="rail-drawer-backdrop"
            onClick={() => setIsRightDrawerOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Confirmation Modal: EJECT CARTRIDGE? */}
      <Modal
        isOpen={isEjectModalOpen}
        title="EJECT CARTRIDGE?"
        confirmLabel="EJECT ⏏"
        cancelLabel="KEEP STUDYING"
        confirmVariant="tomato"
        onConfirm={confirmEjectCartridge}
        onCancel={() => setIsEjectModalOpen(false)}
      >
        <p style={{ marginBottom: '12px' }}>
          Are you sure you want to eject <strong>{docInfo.filename}</strong>?
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          This will delete the vector index from memory and return to the document upload screen.
        </p>
      </Modal>

      {/* Error Toast with Retry */}
      <Toast
        message={errorMessage}
        onDismiss={() => setErrorMessage('')}
        onRetry={handleRetry}
      />
    </div>
  );
}
