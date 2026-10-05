import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Byte from './Byte';
import Sticker from './Sticker';
import PixelButton from './PixelButton';
import PixelProgress from './PixelProgress';
import Confetti from './Confetti';
import ThemeToggle from './ThemeToggle';
import MusicToggle from './MusicToggle';
import UploadStickers from './UploadStickers';
import { uploadDocument } from '../api';
import './UploadScreen.css';

const ALLOWED_EXTS = ['.pdf', '.docx', '.pptx', '.txt', '.md'];
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

const RAG_STEPS = [
  {
    title: 'PARSING PAGES…',
    desc: 'Extracting readable text and structural headings from your document.',
  },
  {
    title: 'CHUNKING TEXT…',
    desc: 'Dividing long sections into bite-sized semantic passages.',
  },
  {
    title: 'EMBEDDING MEANING…',
    desc: 'Converting concepts into dense vectors using MiniLM embeddings.',
  },
  {
    title: 'SAVING TO MEMORY…',
    desc: 'Indexing vectors into Chroma vector database for instant retrieval.',
  },
];

export default function UploadScreen({ onUploadSuccess, theme, onToggleTheme }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fileInputRef = useRef(null);

  // Rotate illustrative RAG explanations every 1.5s while processing
  useEffect(() => {
    if (!isProcessing) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % RAG_STEPS.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const getByteMood = () => {
    if (successInfo) return 'happy';
    if (validationError) return 'confused';
    if (isProcessing) return 'thinking';
    if (isDragging) return 'happy';
    return 'idle';
  };

  const triggerValidationError = (msg) => {
    setValidationError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const validateAndProcessFile = async (file) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTS.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt) {
      triggerValidationError(
        `Invalid file type "${file.name}". Please upload PDF, DOCX, PPTX, TXT, or MD.`
      );
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      triggerValidationError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 20 MB.`
      );
      return;
    }

    setValidationError('');
    setIsProcessing(true);

    try {
      const data = await uploadDocument(file);
      setSuccessInfo(data);
      setShowConfetti(true);

      setTimeout(() => {
        onUploadSuccess(data);
      }, 1300);
    } catch (err) {
      triggerValidationError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing || successInfo) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isProcessing && !successInfo) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    if (isProcessing || successInfo) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="upload-full-scene">
      {/* Cute Pixel Stickers scattered across the upload portal */}
      <UploadStickers />

      {/* Confetti celebration burst */}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      {/* Slim Top Bar */}
      <header className="upload-topbar pixel-box">
        <div className="topbar-logo-wrap">
          <Byte mood={getByteMood()} size={28} />
          <span className="topbar-title pixel-title">PIXEL STUDY BUDDY</span>
        </div>
        <div className="topbar-actions">
          <MusicToggle />
          {theme && onToggleTheme && (
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          )}
        </div>
      </header>

      {/* Centerpiece: Main Card enclosing Hero & Cartridge Dropzone */}
      <main className={`upload-center-core ${isShaking ? 'shake' : ''}`}>
        <div className="upload-main-card pixel-box">
          <div className="upload-hero-section">
            <div className="hero-mascot">
              <Byte mood={getByteMood()} size={58} />
            </div>
            <h1 className="hero-heading pixel-title">INSERT DOCUMENT</h1>
            <p className="hero-subheading retro-label">
              Feed me a doc. Ask me anything. I only answer from what you give me.
            </p>
          </div>

          {/* Dropzone */}
          <section
            className={`cartridge-slot pixel-box ${isDragging ? 'drag-over' : ''} ${
              isProcessing ? 'processing' : ''
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={triggerBrowse}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerBrowse();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Insert document cartridge. Drag and drop file or press to browse."
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.txt,.md"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
            aria-hidden="true"
          />

          <div className="cartridge-bezel">
            <div className="cartridge-metal-pins" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="pin" />
              ))}
            </div>

            {/* View 1: Success Stamp */}
            {successInfo ? (
              <div className="upload-success-panel">
                <motion.div
                  initial={{ scale: 2.2, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: -4, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 350 }}
                >
                  <Sticker type="stamp" scale={1.3} rotation={-4} />
                </motion.div>
                <div className="success-meta">
                  <span className="success-filename pixel-title">
                    {successInfo.filename}
                  </span>
                  <span className="success-chunks retro-label">
                    {successInfo.num_chunks} chunks indexed into memory!
                  </span>
                </div>
              </div>
            ) : isProcessing ? (
              /* View 2: Processing RAG steps */
              <div className="upload-loading-panel">
                <span className="pixel-title loading-text">
                  LOADING CARTRIDGE…
                </span>

                <PixelProgress
                  value={null}
                  segments={12}
                  variant="teal"
                  size="md"
                />

                <div className="rag-step-info">
                  <div className="rag-step-title pixel-title">
                    {RAG_STEPS[currentStepIndex].title}
                  </div>
                  <div className="rag-step-desc">
                    {RAG_STEPS[currentStepIndex].desc}
                  </div>
                  <div className="rag-step-note">
                    (Illustrative simulation: backend processes atomically in one request)
                  </div>
                </div>
              </div>
            ) : (
              /* View 3: Idle Slot */
              <div className="dropzone-idle halftone-bg">
                <div className="cartridge-slot-aperture">
                  <div className="slot-line" />
                </div>

                <div className="cartridge-icon-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    className="pixel-art"
                    shapeRendering="crispEdges"
                  >
                    <rect x="4" y="2" width="16" height="20" fill="var(--paper-dark)" stroke="var(--ink)" strokeWidth="2" />
                    <rect x="8" y="6" width="8" height="2" fill="var(--ink)" />
                    <rect x="8" y="10" width="8" height="2" fill="var(--ink)" />
                    <rect x="8" y="14" width="5" height="2" fill="var(--ink)" />
                    <polygon points="12,14 16,14 14,18" fill="var(--tomato)" />
                  </svg>
                </div>

                <p className="pixel-title drop-main-text">
                  INSERT DOCUMENT CARTRIDGE
                </p>
                <p className="drop-sub-text retro-label">
                  DRAG & DROP OR CLICK TO BROWSE
                </p>
                <div className="format-chips">
                  <span className="format-chip">PDF</span>
                  <span className="format-chip">DOCX</span>
                  <span className="format-chip">PPTX</span>
                  <span className="format-chip">TXT</span>
                  <span className="format-chip">MD</span>
                  <span className="format-size">MAX 20MB</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

        {/* Validation Error Banner with ZAP! Sticker */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              className="upload-error-box pixel-box"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5 }}
            >
              <div className="error-zap-slot">
                <Sticker type="zap" scale={0.8} rotation={-6} />
              </div>
              <div className="error-text-content">
                <div className="pixel-title error-heading">CARTRIDGE ERROR</div>
                <div className="error-detail">{validationError}</div>
              </div>
              <PixelButton
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setValidationError('');
                }}
              >
                DISMISS
              </PixelButton>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
