import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './UploadStickers.css';

// 8-Bit Web Audio Synthesizer for Retro Game SFX
function playRetroSound(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'brick') {
      // High pitch chime for destroying a sticker
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === 'paddle') {
      // Warm bounce pop for hitting the slidable bar
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440.0, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'wall') {
      // Click for walls and central card
      osc.type = 'square';
      osc.frequency.setValueAtTime(220.0, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'lose') {
      // Descending tone for losing ball
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220.0, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75.0, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'win') {
      // Fanfare on clearing stage
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.14);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(ctx.currentTime + i * 0.08);
        o.stop(ctx.currentTime + i * 0.08 + 0.14);
      });
    }
  } catch {
    // Audio context may be restricted
  }
}

// Draw authentic pixel art sticker icon directly to Canvas with scalable factor
function drawStickerPixelArt(ctx, type, cx, cy, scale = 1.6) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const ox = -7;
  const oy = -7;

  if (type === 'cat') {
    ctx.fillStyle = '#FF8A5B';
    ctx.fillRect(ox + 1, oy + 1, 3, 3);
    ctx.fillRect(ox + 10, oy + 1, 3, 3);
    ctx.fillRect(ox + 1, oy + 4, 12, 8);
    ctx.fillStyle = '#1B1B2F';
    ctx.fillRect(ox + 3, oy + 6, 2, 2);
    ctx.fillRect(ox + 9, oy + 6, 2, 2);
    ctx.fillStyle = '#FF6584';
    ctx.fillRect(ox + 2, oy + 8, 2, 1);
    ctx.fillRect(ox + 10, oy + 8, 2, 1);
    ctx.fillRect(ox + 6, oy + 8, 2, 1);
  } else if (type === 'boba') {
    ctx.fillStyle = '#9D4EDD';
    ctx.fillRect(ox + 8, oy + 1, 2, 3);
    ctx.fillStyle = '#E0A96D';
    ctx.fillRect(ox + 3, oy + 4, 8, 9);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ox + 2, oy + 3, 10, 2);
    ctx.fillStyle = '#3D2B1F';
    ctx.fillRect(ox + 4, oy + 10, 2, 2);
    ctx.fillRect(ox + 7, oy + 10, 2, 2);
    ctx.fillRect(ox + 5, oy + 8, 2, 2);
  } else if (type === 'ghost') {
    ctx.fillStyle = '#E0FBFC';
    ctx.fillRect(ox + 3, oy + 2, 8, 10);
    ctx.fillRect(ox + 4, oy + 1, 6, 2);
    ctx.fillStyle = '#1B1B2F';
    ctx.fillRect(ox + 4, oy + 5, 2, 3);
    ctx.fillRect(ox + 8, oy + 5, 2, 3);
    ctx.clearRect(ox + 5, oy + 11, 2, 2);
    ctx.clearRect(ox + 7, oy + 11, 2, 2);
  } else if (type === 'mushroom') {
    ctx.fillStyle = '#E63946';
    ctx.fillRect(ox + 2, oy + 2, 10, 6);
    ctx.fillRect(ox + 4, oy + 1, 6, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ox + 3, oy + 3, 2, 2);
    ctx.fillRect(ox + 9, oy + 3, 2, 2);
    ctx.fillRect(ox + 6, oy + 4, 2, 2);
    ctx.fillStyle = '#FFE8D6';
    ctx.fillRect(ox + 4, oy + 8, 6, 5);
    ctx.fillStyle = '#1B1B2F';
    ctx.fillRect(ox + 5, oy + 9, 1, 2);
    ctx.fillRect(ox + 8, oy + 9, 1, 2);
  } else if (type === 'heart') {
    ctx.fillStyle = '#FF5A4E';
    ctx.fillRect(ox + 2, oy + 3, 4, 4);
    ctx.fillRect(ox + 8, oy + 3, 4, 4);
    ctx.fillRect(ox + 3, oy + 6, 8, 4);
    ctx.fillRect(ox + 5, oy + 10, 4, 3);
    ctx.fillStyle = '#FFAAA6';
    ctx.fillRect(ox + 3, oy + 4, 2, 2);
  } else if (type === 'star') {
    ctx.fillStyle = '#FFC93C';
    ctx.fillRect(ox + 6, oy + 1, 2, 3);
    ctx.fillRect(ox + 2, oy + 5, 10, 3);
    ctx.fillRect(ox + 4, oy + 3, 6, 7);
    ctx.fillRect(ox + 3, oy + 9, 3, 4);
    ctx.fillRect(ox + 8, oy + 9, 3, 4);
    ctx.fillStyle = '#B28200';
    ctx.fillRect(ox + 6, oy + 6, 2, 2);
  } else if (type === 'coffee') {
    ctx.fillStyle = '#EDE0D4';
    ctx.fillRect(ox + 3, oy + 5, 7, 7);
    ctx.fillStyle = '#7F4F24';
    ctx.fillRect(ox + 4, oy + 6, 5, 2);
    ctx.fillStyle = '#1B1B2F';
    ctx.fillRect(ox + 10, oy + 6, 2, 4);
    ctx.fillStyle = '#B08968';
    ctx.fillRect(ox + 5, oy + 2, 1, 2);
    ctx.fillRect(ox + 7, oy + 1, 1, 2);
  } else {
    ctx.fillStyle = '#2EC4B6';
    ctx.fillRect(ox + 2, oy + 4, 10, 7);
    ctx.fillStyle = '#1B1B2F';
    ctx.fillRect(ox + 4, oy + 6, 3, 1);
    ctx.fillRect(ox + 5, oy + 5, 1, 3);
    ctx.fillStyle = '#FF5A4E';
    ctx.fillRect(ox + 9, oy + 6, 1, 1);
    ctx.fillRect(ox + 8, oy + 7, 1, 1);
  }

  ctx.restore();
}

const STICKER_TYPES = [
  { id: 'cat', label: 'MEOW!', bg: '#FFE5D9', fg: '#E63946' },
  { id: 'boba', label: 'BOBA', bg: '#F8EDEB', fg: '#9D4EDD' },
  { id: 'ghost', label: 'BOO!', bg: '#E8F8F5', fg: '#1F1B24' },
  { id: 'mushroom', label: '1-UP', bg: '#FFDDD2', fg: '#E63946' },
  { id: 'heart', label: 'LOVE', bg: '#FFE5EC', fg: '#D90429' },
  { id: 'star', label: 'STAR', bg: '#FFF3B0', fg: '#7A5C00' },
  { id: 'coffee', label: '+XP', bg: '#EDE0D4', fg: '#7F4F24' },
  { id: 'gamepad', label: 'PLAY', bg: '#E2ECE9', fg: '#006D77' },
];

export default function UploadStickers() {
  const reducedMotion = useReducedMotion();

  // Score & Game State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStageClear, setIsStageClear] = useState(false);

  // References for Animation & Game Loop
  const canvasRef = useRef(null);
  const keysPressed = useRef({ left: false, right: false });

  const gameRef = useRef({
    paddle: { x: 300, y: 0, w: 144, h: 20, targetX: 300, vx: 0 },
    ball: { x: 360, y: 300, size: 16, vx: 4.2, vy: -5.0, active: true, trail: [] },
    bricks: [],
    particles: [],
    centerCardRect: null,
  });

  // Build the Brick Matrix across the top half of the screen (excluding the central card)
  const buildBrickMatrix = useCallback(() => {
    const wWidth = window.innerWidth;
    const wHeight = window.innerHeight;
    const halfHeight = Math.floor(wHeight * 0.48); // Cover top half of screen

    const centerCard = document.querySelector('.upload-main-card') || document.querySelector('.upload-center-core');
    const cRect = centerCard ? centerCard.getBoundingClientRect() : null;
    gameRef.current.centerCardRect = cRect;

    const pad = 16; // Clearance buffer around central card

    const bricks = [];
    let brickId = 0;
    const startY = 72;
    const rowHeight = 54; // Larger chunky retro sticker boxes
    const gapY = 10;
    const gapX = 10;
    const totalRows = Math.max(2, Math.floor((halfHeight - startY) / (rowHeight + gapY)));

    for (let row = 0; row < totalRows; row++) {
      const curY = startY + row * (rowHeight + gapY);
      let curX = 20;

      while (curX < wWidth - 70) {
        const isRect = (brickId + row) % 2 === 0;
        const bW = isRect ? 98 : 64;
        const bH = rowHeight;

        // Skip brick if it would be placed behind or collide with the middle center rectangle
        let overlapsCenter = false;
        if (cRect) {
          if (
            curX + bW >= cRect.left - pad &&
            curX <= cRect.right + pad &&
            curY + bH >= cRect.top - pad &&
            curY <= cRect.bottom + pad
          ) {
            overlapsCenter = true;
          }
        }

        if (!overlapsCenter) {
          const typeInfo = STICKER_TYPES[brickId % STICKER_TYPES.length];
          bricks.push({
            id: brickId++,
            x: curX,
            y: curY,
            w: bW,
            h: bH,
            alive: true,
            type: typeInfo.id,
            label: typeInfo.label,
            bg: typeInfo.bg,
            fg: typeInfo.fg,
            shape: isRect ? 'rect' : 'square',
          });
        }

        curX += bW + gapX;
      }
    }

    gameRef.current.bricks = bricks;

    // Paddle setup at bottom
    const paddleW = Math.min(144, Math.max(96, wWidth * 0.15));
    const paddleX = (wWidth - paddleW) / 2;
    const paddleY = wHeight - 34;

    gameRef.current.paddle.w = paddleW;
    gameRef.current.paddle.y = paddleY;
    gameRef.current.paddle.h = 20;
    gameRef.current.paddle.x = paddleX;
    gameRef.current.paddle.targetX = paddleX;

    // Pixel ball initially active and ready
    const ball = gameRef.current.ball;
    ball.size = 16;
    ball.x = paddleX + paddleW / 2 - 8;
    ball.y = paddleY - 26;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * (3.8 + Math.random() * 0.8);
    ball.vy = -5.0;
    ball.active = true;
    ball.trail = [];
  }, []);

  // Spawn Particle burst on brick kill
  const spawnExplosion = (x, y, color) => {
    const newParticles = [];
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI * 2 * i) / 9 + Math.random() * 0.4;
      const speed = 2.5 + Math.random() * 3.5;
      newParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: color || '#FFC93C',
        alpha: 1,
        life: 0,
      });
    }
    gameRef.current.particles.push(...newParticles);
  };

  // Reset entire game
  const resetGame = () => {
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsStageClear(false);
    buildBrickMatrix();
  };

  useEffect(() => {
    if (reducedMotion) return;

    buildBrickMatrix();

    // Fast, zero-lag pointer tracking
    const handlePointerMove = (e) => {
      const g = gameRef.current;
      const wWidth = window.innerWidth;
      const clampedX = Math.max(12, Math.min(wWidth - g.paddle.w - 12, e.clientX - g.paddle.w / 2));
      g.paddle.targetX = clampedX;
      // Direct fast response
      g.paddle.x = clampedX;
    };

    // Smooth keyboard controls
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = false;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', buildBrickMatrix);

    let animId;
    let lastTime = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Run 60/120 FPS High-Precision Game Loop
    const loop = (currentTime) => {
      const g = gameRef.current;
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Delta time normalization
      const dt = Math.min((currentTime - lastTime) / 16.666, 2.0);
      lastTime = currentTime;

      // Handle High-DPI canvas backing
      if (canvas.width !== Math.floor(wWidth * dpr) || canvas.height !== Math.floor(wHeight * dpr)) {
        canvas.width = Math.floor(wWidth * dpr);
        canvas.height = Math.floor(wHeight * dpr);
        canvas.style.width = wWidth + 'px';
        canvas.style.height = wHeight + 'px';
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, wWidth, wHeight);

      // Fast, ultra-smooth keyboard paddle sliding
      if (keysPressed.current.left) {
        g.paddle.targetX = Math.max(12, g.paddle.targetX - 18 * dt);
        g.paddle.x = g.paddle.targetX;
      } else if (keysPressed.current.right) {
        g.paddle.targetX = Math.min(wWidth - g.paddle.w - 12, g.paddle.targetX + 18 * dt);
        g.paddle.x = g.paddle.targetX;
      } else {
        // Smooth lerp to mouse position
        g.paddle.x += (g.paddle.targetX - g.paddle.x) * 0.85;
      }
      g.paddle.y = wHeight - 34;

      // 1. Update and Render Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.14 * dt; // Gravity
        p.vx *= 0.98;
        p.alpha -= 0.026 * dt;
        p.life += 1;

        if (p.alpha <= 0 || p.life > 40) {
          g.particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.restore();
        }
      }

      // 2. Render Sticker Bricks Matrix (with actual pixel sticker art!)
      let aliveCount = 0;
      g.bricks.forEach((b) => {
        if (!b.alive) return;
        aliveCount++;

        ctx.save();
        // 3D Drop Shadow
        ctx.fillStyle = '#1B1B2F';
        ctx.fillRect(b.x + 4, b.y + 4, b.w, b.h);

        // Brick Body
        ctx.fillStyle = b.bg;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        // Outer Pixel Border
        ctx.strokeStyle = '#1B1B2F';
        ctx.lineWidth = 3;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        // Inset highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(b.x + 3, b.y + 3, b.w - 6, b.h - 6);

        if (b.shape === 'rect') {
          // Large Rectangle brick: 1.6x sticker icon on left, bold label on right
          drawStickerPixelArt(ctx, b.type, b.x + 24, b.y + b.h / 2, 1.6);

          ctx.fillStyle = b.fg;
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.label, b.x + b.w - 32, b.y + b.h / 2);
        } else {
          // Large Square brick: 1.6x sticker icon centered, cute micro label underneath
          drawStickerPixelArt(ctx, b.type, b.x + b.w / 2, b.y + b.h / 2 - 5, 1.6);

          ctx.fillStyle = b.fg;
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h - 9);
        }

        ctx.restore();
      });

      // 3. Multi-Step Physics Simulation for Buttery Smooth Collisions
      const ball = g.ball;
      const paddle = g.paddle;
      const cCard = g.centerCardRect;
      const topLimit = 64;

      if (ball.active) {
        // Record position for motion trail
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 5) ball.trail.shift();

        // 2 Sub-steps to eliminate tunneling and jitter
        const subSteps = 2;
        const subDt = dt / subSteps;

        for (let step = 0; step < subSteps; step++) {
          if (!ball.active) break;

          ball.x += ball.vx * subDt;
          ball.y += ball.vy * subDt;

          // Screen Borders
          if (ball.x <= 8) {
            ball.x = 8;
            ball.vx = Math.abs(ball.vx);
            playRetroSound('wall');
          }
          if (ball.x + ball.size >= wWidth - 8) {
            ball.x = wWidth - 8 - ball.size;
            ball.vx = -Math.abs(ball.vx);
            playRetroSound('wall');
          }
          if (ball.y <= topLimit) {
            ball.y = topLimit;
            ball.vy = Math.abs(ball.vy);
            playRetroSound('wall');
          }

          // Center Card Collision (exact edge clamping)
          if (cCard) {
            const pad = 2;
            if (
              ball.x + ball.size >= cCard.left - pad &&
              ball.x <= cCard.right + pad &&
              ball.y + ball.size >= cCard.top - pad &&
              ball.y <= cCard.bottom + pad
            ) {
              const overlapLeft = (ball.x + ball.size) - (cCard.left - pad);
              const overlapRight = (cCard.right + pad) - ball.x;
              const overlapTop = (ball.y + ball.size) - (cCard.top - pad);
              const overlapBottom = (cCard.bottom + pad) - ball.y;
              const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

              if (minOverlap === overlapLeft) {
                ball.x = cCard.left - pad - ball.size;
                ball.vx = -Math.abs(ball.vx);
              } else if (minOverlap === overlapRight) {
                ball.x = cCard.right + pad;
                ball.vx = Math.abs(ball.vx);
              } else if (minOverlap === overlapTop) {
                ball.y = cCard.top - pad - ball.size;
                ball.vy = -Math.abs(ball.vy);
              } else {
                ball.y = cCard.bottom + pad;
                ball.vy = Math.abs(ball.vy);
              }
              playRetroSound('wall');
            }
          }

          // Slidable Bar (Paddle) Collision: Natural angle curve
          if (
            ball.y + ball.size >= paddle.y &&
            ball.y <= paddle.y + paddle.h &&
            ball.x + ball.size >= paddle.x - 4 &&
            ball.x <= paddle.x + paddle.w + 4 &&
            ball.vy > 0
          ) {
            ball.y = paddle.y - ball.size;
            const paddleCenter = paddle.x + paddle.w / 2;
            const ballCenter = ball.x + ball.size / 2;
            const hitPos = Math.max(-0.95, Math.min(0.95, (ballCenter - paddleCenter) / (paddle.w / 2)));
            const speed = Math.max(6.0, Math.hypot(ball.vx, ball.vy));
            const angle = hitPos * (Math.PI / 3.2); // Up to ~56 degrees

            ball.vx = speed * Math.sin(angle);
            ball.vy = -speed * Math.cos(angle);

            playRetroSound('paddle');
          }

          // Sticker Brick Collisions
          for (let i = 0; i < g.bricks.length; i++) {
            const b = g.bricks[i];
            if (!b.alive) continue;

            if (
              ball.x + ball.size >= b.x &&
              ball.x <= b.x + b.w &&
              ball.y + ball.size >= b.y &&
              ball.y <= b.y + b.h
            ) {
              b.alive = false;
              setScore((prev) => prev + 25);
              spawnExplosion(b.x + b.w / 2, b.y + b.h / 2, b.fg);
              playRetroSound('brick');

              const oLeft = (ball.x + ball.size) - b.x;
              const oRight = (b.x + b.w) - ball.x;
              const oTop = (ball.y + ball.size) - b.y;
              const oBottom = (b.y + b.h) - ball.y;
              const minO = Math.min(oLeft, oRight, oTop, oBottom);

              if (minO === oLeft) {
                ball.x = b.x - ball.size;
                ball.vx = -Math.abs(ball.vx);
              } else if (minO === oRight) {
                ball.x = b.x + b.w;
                ball.vx = Math.abs(ball.vx);
              } else if (minO === oTop) {
                ball.y = b.y - ball.size;
                ball.vy = -Math.abs(ball.vy);
              } else {
                ball.y = b.y + b.h;
                ball.vy = Math.abs(ball.vy);
              }
              break;
            }
          }
        }

        // Ball Falls Below Paddle
        if (ball.y > wHeight + 10) {
          playRetroSound('lose');
          setLives((prev) => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              setIsGameOver(true);
              ball.active = false;
            } else {
              // Smooth respawn on paddle
              ball.x = paddle.x + paddle.w / 2 - 8;
              ball.y = paddle.y - 28;
              ball.vx = (Math.random() > 0.5 ? 1 : -1) * (3.8 + Math.random() * 0.8);
              ball.vy = -5.0;
              ball.trail = [];
            }
            return nextLives;
          });
        }

        // Check Stage Clear (All bricks killed)
        if (aliveCount === 0 && g.bricks.length > 0) {
          playRetroSound('win');
          setIsStageClear(true);
          ball.active = false;
          setTimeout(() => {
            setIsStageClear(false);
            buildBrickMatrix();
          }, 2400);
        }
      }

      // 4. Render Slidable Paddle Bar
      const p = g.paddle;
      ctx.save();
      // Drop Shadow
      ctx.fillStyle = '#1B1B2F';
      ctx.fillRect(p.x + 3, p.y + 3, p.w, p.h);

      // Paddle Body
      ctx.fillStyle = '#FFC93C'; // Mustard retro arcade paddle
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Outer Border
      ctx.strokeStyle = '#1B1B2F';
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x, p.y, p.w, p.h);

      // Red rubber grips on sides
      ctx.fillStyle = '#FF5A4E';
      ctx.fillRect(p.x + 4, p.y + 2, 9, p.h - 4);
      ctx.fillRect(p.x + p.w - 13, p.y + 2, 9, p.h - 4);

      // Center sensor strip
      ctx.fillStyle = '#2EC4B6';
      ctx.fillRect(p.x + p.w / 2 - 14, p.y + 4, 28, p.h - 8);

      ctx.restore();

      // 5. Render Pixel Ball with Smooth Motion Trail
      if (ball.active) {
        // Render Smooth Trail
        if (ball.trail && ball.trail.length > 0) {
          ball.trail.forEach((t, idx) => {
            const alpha = ((idx + 1) / ball.trail.length) * 0.35;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FF5A4E';
            ctx.fillRect(t.x, t.y, ball.size, ball.size);
            ctx.restore();
          });
        }

        ctx.save();
        // Shadow
        ctx.fillStyle = 'rgba(27, 27, 47, 0.45)';
        ctx.fillRect(ball.x + 2, ball.y + 3, ball.size, ball.size);

        // Pixel Ball Body
        ctx.fillStyle = '#FF5A4E';
        ctx.fillRect(ball.x, ball.y, ball.size, ball.size);

        // Dark Pixel Border
        ctx.strokeStyle = '#1B1B2F';
        ctx.lineWidth = 2;
        ctx.strokeRect(ball.x, ball.y, ball.size, ball.size);

        // Core Highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ball.x + 2, ball.y + 2, 3, 3);

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', buildBrickMatrix);
    };
  }, [buildBrickMatrix, reducedMotion]);

  return (
    <div className="breakout-game-layer">
      {/* Background Interactive Canvas for 60FPS Breakout Physics */}
      <canvas ref={canvasRef} className="breakout-canvas" />

      {/* Retro Arcade Game Scoreboard: Positioned Top-Right Below the Navbar */}
      <div className="breakout-arcade-hud pixel-box">
        <div className="hud-metric">
          <span className="hud-label retro-label">SCORE:</span>
          <span className="hud-val pixel-title">{score}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-label retro-label">BALLS:</span>
          <span className="hud-val-lives">
            {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
              <span key={i} className="hud-heart">♥</span>
            ))}
          </span>
        </div>
        <button
          type="button"
          className="hud-reset-btn"
          onClick={resetGame}
          title="Restart Brick Breaker"
        >
          ⟲ RESTART
        </button>
      </div>

      {/* Stage Clear Banner */}
      {isStageClear && (
        <div className="game-overlay-banner pixel-box victory-banner">
          <h2 className="pixel-title overlay-heading">STAGE CLEAR!</h2>
          <p className="retro-label overlay-sub">ALL STICKERS DESTROYED! +500 XP</p>
        </div>
      )}

      {/* Game Over Banner */}
      {isGameOver && (
        <div className="game-overlay-banner pixel-box gameover-banner">
          <h2 className="pixel-title overlay-heading">GAME OVER</h2>
          <p className="retro-label overlay-sub">FINAL SCORE: {score}</p>
          <button type="button" className="arcade-respawn-btn pixel-box" onClick={resetGame}>
            PLAY AGAIN ⟲
          </button>
        </div>
      )}
    </div>
  );
}
