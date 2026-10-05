import React, { useState, useEffect, useRef } from 'react';
import PixelButton from './PixelButton';
import './Pomodoro.css';

const FOCUS_TIME = 25 * 60; // 25:00
const BREAK_TIME = 5 * 60;  // 05:00

/**
 * 8-Bit Web Audio Beep (C5 -> E5 -> G5 -> C6 arpeggio)
 */
function play8BitChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24);
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.36);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {
    // Audio context may be restricted until user gesture
  }
}

/**
 * Pomodoro Focus Timer with larger rail-ready layout, tomato tallies, and 8-bit sound.
 */
export default function Pomodoro({
  onBreakChange,
  onSessionComplete,
  layout = 'rail', // 'rail' | 'compact'
  sessionsCount = 0,
}) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(sessionsCount);

  const timerRef = useRef(null);

  // Sync external session count if passed
  useEffect(() => {
    if (sessionsCount !== undefined && sessionsCount !== completedSessions) {
      setCompletedSessions(sessionsCount);
    }
  }, [sessionsCount]);

  // Track previous mode so onBreakChange only fires on actual transitions
  const prevModeRef = useRef(mode);
  const onBreakChangeRef = useRef(onBreakChange);
  useEffect(() => {
    onBreakChangeRef.current = onBreakChange;
  }, [onBreakChange]);

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
      if (onBreakChangeRef.current) {
        onBreakChangeRef.current(mode === 'break');
      }
    }
  }, [mode]);

  // Timer countdown loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            play8BitChime();
            if (mode === 'focus') {
              const newSessions = completedSessions + 1;
              setCompletedSessions(newSessions);
              if (onSessionComplete) onSessionComplete(newSessions);
              setMode('break');
              return BREAK_TIME;
            } else {
              setMode('focus');
              return FOCUS_TIME;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, completedSessions, onSessionComplete]);

  const toggleRun = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progressFraction = (totalTime - timeLeft) / totalTime;
  const totalBlocks = 10;
  const filledBlocks = Math.floor(progressFraction * totalBlocks);

  return (
    <div className={`pomodoro-widget layout-${layout}`}>
      <div className="pomodoro-header-row">
        <div className="pomodoro-title-wrap">
          <span className="pomodoro-icon" aria-hidden="true">⏱</span>
          <span className="pixel-title pomodoro-title">FOCUS TIMER</span>
        </div>
        <div className="pomodoro-mode-pills">
          <button
            type="button"
            className={`mode-pill ${mode === 'focus' ? 'active-focus' : ''}`}
            onClick={() => switchMode('focus')}
          >
            25M
          </button>
          <button
            type="button"
            className={`mode-pill ${mode === 'break' ? 'active-break' : ''}`}
            onClick={() => switchMode('break')}
          >
            5M
          </button>
        </div>
      </div>

      {/* Main Digits */}
      <div className="pomodoro-clock-area">
        <span className={`pomodoro-status-tag pixel-title ${mode}`}>
          {mode === 'focus' ? 'FOCUSING' : 'BREAK'}
        </span>
        <div className="pomodoro-digits-lg">{timeFormatted}</div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="pomodoro-segment-bar" aria-hidden="true">
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <div
            key={i}
            className={`pomodoro-block ${i < filledBlocks ? 'filled' : ''} ${mode}`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="pomodoro-actions-row">
        <PixelButton
          variant={isRunning ? 'mustard' : 'teal'}
          size="sm"
          onClick={toggleRun}
          className="pomodoro-btn-main"
          ariaLabel={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? 'PAUSE ❚❚' : 'START ▶'}
        </PixelButton>

        <PixelButton
          variant="secondary"
          size="sm"
          onClick={resetTimer}
          ariaLabel="Reset timer"
          title="Reset timer"
        >
          ↺
        </PixelButton>
      </div>

      {/* Tomato Tallies Gallery */}
      <div className="pomodoro-tomatoes-bar">
        <span className="tomatoes-label retro-label">POMODOROS:</span>
        <div className="tomatoes-collection">
          {completedSessions === 0 ? (
            <span className="no-tomatoes retro-label">None yet</span>
          ) : (
            <>
              {Array.from({ length: Math.min(completedSessions, 8) }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 10 10"
                  width="16"
                  height="16"
                  className="pixel-art tomato-icon"
                  shapeRendering="crispEdges"
                  title="Completed Pomodoro"
                >
                  <rect x="4" y="0" width="2" height="2" fill="var(--mint)" />
                  <rect x="2" y="2" width="6" height="6" fill="var(--tomato)" />
                  <rect x="1" y="3" width="8" height="4" fill="var(--tomato)" />
                  <rect x="3" y="1" width="1" height="1" fill="var(--mint)" />
                </svg>
              ))}
              {completedSessions > 8 && (
                <span className="tomato-counter pixel-title">+{completedSessions - 8}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
