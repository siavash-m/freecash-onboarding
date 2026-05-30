import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ASSETS } from '../assets';
import { UserChip } from './UserChip';
import { useCountUp } from '../hooks/useCountUp';

// ── SVG progress ring ─────────────────────────────────────────────────────────
const CONTAINER_W = 322;
const CONTAINER_H = 321;
const ARC_CX = CONTAINER_W / 2;       // 161
const ARC_CY = CONTAINER_H / 2;       // 160.5
const ARC_R  = 76;                     // outer edge = 82 px, flush with ringInnerBorder at ≈ 82.5
const ARC_SW = 12;
const ARC_C  = 2 * Math.PI * ARC_R;   // ≈ 477.5
const ARC_END = ARC_C * (1 - 0.40);   // 60 % dashoffset → 40 % fill

// Midpoint of the filled 40 % arc — sparkle origin on tap
const ARC_MID_ANGLE    = -Math.PI / 2 + 0.20 * Math.PI * 2;
const ARC_MID_X        = ARC_CX + ARC_R * Math.cos(ARC_MID_ANGLE);
const ARC_MID_Y        = ARC_CY + ARC_R * Math.sin(ARC_MID_ANGLE);

// Arc draw endpoint — sparkle origin on entry celebration
const ARC_END_ANGLE    = -Math.PI / 2 + 0.40 * Math.PI * 2;
const ARC_END_X        = ARC_CX + ARC_R * Math.cos(ARC_END_ANGLE);
const ARC_END_Y        = ARC_CY + ARC_R * Math.sin(ARC_END_ANGLE);

// ── Twinkling star positions around the ring ─────────────────────────────────
// 8 evenly-spaced angles, each at one of three orbital radii (100 / 110 / 120)
const STAR_CFG = [0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
  const rad  = (deg - 90) * Math.PI / 180;
  const r    = 100 + (i % 3) * 10;            // 100, 110, 120
  return {
    x:            ARC_CX + r * Math.cos(rad),
    y:            ARC_CY + r * Math.sin(rad),
    isWhite:      i % 3 === 0,
    size:         2.5 + (i % 2) * 1.5,        // 2.5 or 4.0
    delay:        2.1 + i * 0.28,
    duration:     2.6 + (i % 3) * 0.85,
    repeatDelay:  1.0 + (i % 4) * 0.55,
  };
});

// ── Decorative ring layers ────────────────────────────────────────────────────
const RINGS: Array<{ src: string; size: number; offset: number; pulseClass?: string }> = [
  { src: ASSETS.ringOutermost,   size: 321,     offset: 0,     pulseClass: 'ring-pulse-a' },
  { src: ASSETS.ringOuter1,      size: 291.445, offset: 14.78, pulseClass: 'ring-pulse-b' },
  { src: ASSETS.ringMid2,        size: 263.532, offset: 28.73, pulseClass: 'ring-pulse-c' },
  { src: ASSETS.ringMid1,        size: 235.619, offset: 42.69 },
  { src: ASSETS.ringInnerFill,   size: 201.138, offset: 59.93 },
  { src: ASSETS.ringInnerBorder, size: 165.015, offset: 77.99 },
];

// ── Generated avatar config ───────────────────────────────────────────────────
const AVATAR_CFG = [
  { initial: 'A', bg: '#FF6B6B' },
  { initial: 'J', bg: '#4ECDC4' },
  { initial: 'M', bg: '#45B7D1' },
  { initial: 'S', bg: '#96CEB4' },
  { initial: 'K', bg: '#FFB347' },
  { initial: 'L', bg: '#DDA0DD' },
  { initial: 'R', bg: '#82E0AA' },
  { initial: 'T', bg: '#F7DC6F' },
  { initial: 'C', bg: '#85C1E9' },
  { initial: 'D', bg: '#F1948A' },
  { initial: 'N', bg: '#A9CCE3' },
  { initial: 'P', bg: '#F0B27A' },
];

function makeAvatarUrl(idx: number): string {
  const { initial, bg } = AVATAR_CFG[idx % AVATAR_CFG.length];
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">',
    `<circle cx="20" cy="20" r="20" fill="${bg}"/>`,
    `<text x="20" y="26" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif"`,
    ` font-size="16" font-weight="700" fill="white">${initial}</text>`,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const AMOUNTS = [
  '+ $75', '+ $150', '+ $225', '+ $300', '+ $450', '+ $600',
  '+ $875', '+ $1,200', '+ $1,800', '+ $2,000', '+ $3,500', '+ $5,000',
];
const LABELS = [
  'Cash out', 'Withdraw', 'Survey', 'Top offer', 'Daily task',
  'Game bonus', 'Big win!', 'Play game', 'Bonus', 'Referral',
];

const REAL_AVATARS = [
  ASSETS.avatarCashout300,
  ASSETS.avatarCashout600,
  ASSETS.avatarPlaygame,
  ASSETS.avatarBonus,
];

function randomChipData(): { avatar: string; amount: string; label: string } {
  const useReal = Math.random() < 0.5;
  const avatar  = useReal
    ? REAL_AVATARS[Math.floor(Math.random() * REAL_AVATARS.length)]
    : makeAvatarUrl(Math.floor(Math.random() * AVATAR_CFG.length));
  return {
    avatar,
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    label:  LABELS [Math.floor(Math.random() * LABELS.length)],
  };
}

// ── Chip positions ────────────────────────────────────────────────────────────
// Right chips: left=196 → right edge 320px (within 322px container).
// Left chips: left=-36 → right edge 88px; screen left ≈18px with typical viewport padding.
// Vertical spacing ≥177px per side to prevent float-drift overlap.
const CHIP_POSITIONS = [
  { left: 196,  top: 28,  avatarOnLeft: true,  floatClass: 'chip-float-1', liveClass: 'chip-live-1' },
  { left: 196,  top: 205, avatarOnLeft: true,  floatClass: 'chip-float-2', liveClass: 'chip-live-2' },
  { left: -36,  top: 75,  avatarOnLeft: false, floatClass: 'chip-float-3', liveClass: 'chip-live-3' },
  { left: -20,  top: 238, avatarOnLeft: false, floatClass: 'chip-float-4', liveClass: 'chip-live-4' },
];

const CHIP_W = 124;
const CHIP_H = 41;

// ── Types ─────────────────────────────────────────────────────────────────────
interface ActiveChip {
  id: string;
  posIdx: number;
  avatar: string;
  amount: string;
  label: string;
  entryDelay: number;
  isRespawn?: boolean;
  exitType?: 'auto';
}

interface Particle {
  id: string;
  left: number;
  top: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

// ── Motion presets ────────────────────────────────────────────────────────────
const SPRING_ENTER  = { type: 'spring', stiffness: 320, damping: 26 } as const;
const SPRING_BOUNCE = { type: 'spring', stiffness: 380, damping: 14 } as const;

// ── Component ─────────────────────────────────────────────────────────────────
export function CircularGoal() {
  const goalValue         = useCountUp(5, { duration: 380, delay: 1000 });
  const celebrateControls = useAnimation();
  const celebrateRef      = useRef(celebrateControls);

  const [activeChips,  setActiveChips]  = useState<ActiveChip[]>(() => [
    { id: 'c0', posIdx: 0, ...randomChipData(), entryDelay: 1.05 },
    { id: 'c1', posIdx: 1, ...randomChipData(), entryDelay: 1.20 },
    { id: 'c2', posIdx: 2, ...randomChipData(), entryDelay: 1.10 },
    { id: 'c3', posIdx: 3, ...randomChipData(), entryDelay: 1.25 },
  ]);
  const [particles,    setParticles]    = useState<Particle[]>([]);
  const [arcSparkles,  setArcSparkles]  = useState<Particle[]>([]);

  const idRef         = useRef(10);
  const chipTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Arc tap ───────────────────────────────────────────────────────────────
  const handleArcTap = useCallback(() => {
    celebrateRef.current.start({
      scale: [1, 1.18, 0.95, 1],
      transition: { duration: 0.42, ease: 'easeOut' },
    });
    setArcSparkles(prev => [
      ...prev,
      ...Array.from({ length: 10 }, (_, i) => ({
        id:       `arc${Date.now()}-${i}`,
        left:     ARC_MID_X,
        top:      ARC_MID_Y,
        angle:    (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
        distance: 18 + Math.random() * 18,
        color:    i % 3 === 0 ? '#ffffff' : '#00da6b',
        size:     2  + Math.random() * 3,
      })),
    ]);
  }, []);

  // ── Entry celebration burst when arc finishes drawing ─────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      celebrateRef.current.start({
        scale: [1, 1.14, 0.96, 1],
        transition: { duration: 0.52, ease: 'easeOut' },
      });
      setArcSparkles(prev => [
        ...prev,
        ...Array.from({ length: 12 }, (_, i) => ({
          id:       `entry-${i}`,
          left:     ARC_END_X,
          top:      ARC_END_Y,
          angle:    (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
          distance: 16 + Math.random() * 20,
          color:    i % 3 === 0 ? '#ffffff' : '#00da6b',
          size:     2  + Math.random() * 4,
        })),
      ]);
    }, 2350); // arc draw ends at ~0.78 + 1.4 = 2.18 s; give 170 ms buffer
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-exit scheduler ───────────────────────────────────────────────────
  const scheduleAutoExit = useCallback((id: string, posIdx: number, entryWaitMs: number) => {
    const existing = chipTimersRef.current.get(id);
    if (existing) clearTimeout(existing);

    const displayMs = 9000 + Math.random() * 7000;

    const timerId = setTimeout(() => {
      chipTimersRef.current.delete(id);

      setActiveChips(cs => cs.map(c =>
        c.id === id ? { ...c, exitType: 'auto' as const } : c,
      ));

      setTimeout(() => {
        setActiveChips(cs => cs.filter(c => c.id !== id));

        // Short gap so the slot feels live — just long enough to notice the swap
        const gapMs = 150 + Math.random() * 250;
        setTimeout(() => {
          const newId = `c${idRef.current++}`;
          setActiveChips(cs => [...cs, {
            id: newId, posIdx,
            ...randomChipData(),
            entryDelay: 0, isRespawn: true,
          }]);
          scheduleAutoExit(newId, posIdx, 1000);
        }, gapMs);
      }, 16);
    }, entryWaitMs + displayMs);

    chipTimersRef.current.set(id, timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scheduleAutoExit('c0', 0, 1050);
    scheduleAutoExit('c1', 1, 1200);
    scheduleAutoExit('c2', 2, 1100);
    scheduleAutoExit('c3', 3, 1250);
    return () => {
      chipTimersRef.current.forEach(clearTimeout);
      chipTimersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tap-to-pop handler ────────────────────────────────────────────────────
  const handlePop = useCallback((id: string, posIdx: number) => {
    const t = chipTimersRef.current.get(id);
    if (t) { clearTimeout(t); chipTimersRef.current.delete(id); }

    const pos = CHIP_POSITIONS[posIdx];
    const cx  = pos.left + CHIP_W / 2;
    const cy  = pos.top  + CHIP_H / 2;
    const BURST_COLORS = ['#ffffff', '#1cf192', '#00da6b', '#fee810', '#71ffbf'];
    setParticles(prev => [
      ...prev,
      ...Array.from({ length: 16 }, (_, i) => ({
        id:       `p${Date.now()}-${i}`,
        left:     cx + (Math.random() - 0.5) * 10,
        top:      cy + (Math.random() - 0.5) * 6,
        angle:    (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
        distance: 40 + Math.random() * 50 + (i < 3 ? 30 : 0), // 3 "big" particles fly extra far
        color:    BURST_COLORS[i % BURST_COLORS.length],
        size:     i < 3 ? 8 + Math.random() * 4 : 3 + Math.random() * 4,
      })),
    ]);

    // Brief scale-pulse on the whole chart to sell the impact
    celebrateRef.current.start({
      scale: [1, 1.08, 0.96, 1],
      transition: { duration: 0.35, ease: 'easeOut' },
    });

    setActiveChips(prev => prev.filter(c => c.id !== id));

    setTimeout(() => {
      const newId = `c${idRef.current++}`;
      setActiveChips(prev => [...prev, {
        id: newId, posIdx,
        ...randomChipData(),
        entryDelay: 0, isRespawn: true,
      }]);
      scheduleAutoExit(newId, posIdx, 700);
    }, 380);
  }, [scheduleAutoExit]);

  return (
    <motion.div
      data-circular-goal
      className="relative shrink-0"
      style={{ width: CONTAINER_W, height: CONTAINER_H }}
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_BOUNCE, delay: 0.38 }}
    >
      {/* ── Decorative ring images ── */}
      {RINGS.map(({ src, size, offset, pulseClass }, i) => (
        <motion.img
          key={i}
          src={src}
          alt=""
          data-ring={i}
          className={`absolute pointer-events-none select-none ${pulseClass ?? ''}`}
          style={{ width: size, height: size, left: offset, top: offset }}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_ENTER, delay: 0.48 + i * 0.075 }}
        />
      ))}

      {/* ── Progress arc + magical SVG layer ── */}
      <motion.svg
        width={CONTAINER_W}
        height={CONTAINER_H}
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'visible' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.74 }}
      >
        <defs>
          {/* Radial glow used by energy pulse rings */}
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#00da6b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00da6b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Energy pulse rings — three staggered rings scale outward and fade ── */}
        {([0, 2.2, 4.4] as const).map((extraDelay, i) => (
          <motion.circle
            key={`pulse${i}`}
            cx={ARC_CX}
            cy={ARC_CY}
            r={84}
            stroke="rgba(0,218,107,0.55)"
            strokeWidth={1.5}
            fill="none"
            style={{ transformOrigin: `${ARC_CX}px ${ARC_CY}px` }}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ scale: [1.2, 2.05], opacity: [0.5, 0] }}
            transition={{
              delay:       3.2 + extraDelay,
              duration:    2.4,
              repeat:      Infinity,
              repeatDelay: 6.6 - extraDelay,
              ease:        [0.2, 0.8, 0.4, 1],
            }}
          />
        ))}

        {/*
          Green 40 % arc — interactive:
          • Idle breathing glow (pulses every 2.6 s after draw completes)
          • Hover: brighter + thicker
          • Tap: white flash + sparkle burst + $5 bounce
          pointer-events: auto overrides the parent SVG's pointer-events: none
        */}
        <motion.circle
          r={ARC_R}
          cx={ARC_CX}
          cy={ARC_CY}
          transform={`rotate(-90 ${ARC_CX} ${ARC_CY})`}
          stroke="#00da6b"
          strokeWidth={ARC_SW}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={ARC_C}
          initial={{ strokeDashoffset: ARC_C }}
          animate={{
            strokeDashoffset: ARC_END,
            filter: [
              'drop-shadow(0 0 8px rgba(0,218,107,0.80))',
              'drop-shadow(0 0 18px rgba(0,218,107,1.00))',
              'drop-shadow(0 0 8px rgba(0,218,107,0.80))',
            ],
          }}
          transition={{
            strokeDashoffset: { delay: 0.78, duration: 1.4, ease: [0.4, 0, 0.2, 1] },
            filter: { delay: 2.6, duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{
            filter: 'drop-shadow(0 0 22px rgba(0,218,107,1)) drop-shadow(0 0 38px rgba(0,218,107,0.5))',
            strokeWidth: ARC_SW + 2,
          }}
          whileTap={{
            filter: 'drop-shadow(0 0 32px rgba(255,255,255,0.9)) drop-shadow(0 0 48px rgba(0,218,107,1))',
          }}
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          onClick={handleArcTap}
        />
      </motion.svg>

      {/* ── Orbiting glow dots ────────────────────────────────────────────────
           Full-container pivot divs with explicit transformOrigin at center.
           CSS keyframe rotation is used for rock-solid continuous spinning in
           all FM versions. Dots fade in via CSS animation-delay.
      ─────────────────────────────────────────────────────────────────────── */}

      {/* Dot 1 — bright green, inner orbit (r ≈ 91), clockwise 9 s */}
      <div
        className="absolute pointer-events-none orbit-cw-9"
        style={{ left: 0, top: 0, width: CONTAINER_W, height: CONTAINER_H,
          transformOrigin: `${ARC_CX}px ${ARC_CY}px`, zIndex: 6 }}
      >
        <div className="dot-fade-2300" style={{
          position: 'absolute', width: 6, height: 6, borderRadius: '50%',
          backgroundColor: '#00da6b',
          boxShadow: '0 0 10px 2px rgba(0,218,107,0.95)',
          left: ARC_CX + 88 - 3, top: ARC_CY - 3,
        }} />
      </div>

      {/* Dot 2 — white, mid orbit (r ≈ 113), counter-clockwise 16 s */}
      <div
        className="absolute pointer-events-none orbit-ccw-16"
        style={{ left: 0, top: 0, width: CONTAINER_W, height: CONTAINER_H,
          transformOrigin: `${ARC_CX}px ${ARC_CY}px`, zIndex: 6 }}
      >
        <div className="dot-fade-2700" style={{
          position: 'absolute', width: 4.5, height: 4.5, borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 8px rgba(255,255,255,1)',
          left: ARC_CX + 110.75 - 2.25, top: ARC_CY - 2.25,
        }} />
      </div>

      {/* Dot 3 — dim green, outer orbit (r ≈ 128), clockwise 24 s */}
      <div
        className="absolute pointer-events-none orbit-cw-24"
        style={{ left: 0, top: 0, width: CONTAINER_W, height: CONTAINER_H,
          transformOrigin: `${ARC_CX}px ${ARC_CY}px`, zIndex: 5 }}
      >
        <div className="dot-fade-3100" style={{
          position: 'absolute', width: 3.5, height: 3.5, borderRadius: '50%',
          backgroundColor: '#00da6b',
          boxShadow: '0 0 7px rgba(0,218,107,0.8)',
          left: ARC_CX + 126.25 - 1.75, top: ARC_CY - 1.75,
        }} />
      </div>

      {/* ── Comet sweep — bright head with fading tail ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: 0, top: 0, width: CONTAINER_W, height: CONTAINER_H,
          transformOrigin: `${ARC_CX}px ${ARC_CY}px`, zIndex: 7 }}
        animate={{ rotate: [0, 360] }}
        transition={{
          delay:       4.8,
          duration:    2.2,
          repeat:      Infinity,
          repeatDelay: 6.5,
          ease:        [0.3, 0, 0.7, 1],
        }}
      >
        <motion.div
          style={{
            position: 'absolute', width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 12px 3px rgba(255,255,255,1), 0 0 24px rgba(0,218,107,0.7)',
            left: ARC_CX + 87 - 4, top: ARC_CY - 4,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ delay: 4.8, duration: 2.2, repeat: Infinity, repeatDelay: 6.5, times: [0, 0.04, 0.1, 0.9, 1] }}
        />
        <motion.div
          style={{
            position: 'absolute', width: 2, height: 30, borderRadius: 1,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,218,107,0.25) 50%, rgba(255,255,255,0.6) 100%)',
            left: ARC_CX + 90 - 1, top: ARC_CY - 4 - 30,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.9, 0.9, 0] }}
          transition={{ delay: 4.8, duration: 2.2, repeat: Infinity, repeatDelay: 6.5, times: [0, 0.04, 0.1, 0.9, 1] }}
        />
      </motion.div>

      {/* ── Twinkling micro-stars scattered around the ring atmosphere ── */}
      {STAR_CFG.map(({ x, y, isWhite, size, delay, duration, repeatDelay }, i) => (
        <motion.div
          key={`star${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            width:  size,
            height: size,
            left:   x - size / 2,
            top:    y - size / 2,
            backgroundColor: isWhite ? '#ffffff' : '#00da6b',
            boxShadow: isWhite
              ? '0 0 5px rgba(255,255,255,0.95)'
              : '0 0 6px rgba(0,218,107,0.9)',
            zIndex: 4,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0, 1, 0.35, 0.95, 0],
            scale:   [0.4, 0.4, 1.6, 0.7, 1.3, 0.4],
          }}
          transition={{
            delay,
            duration,
            repeat:      Infinity,
            repeatDelay,
            ease:        'easeInOut',
            times:       [0, 0.08, 0.28, 0.52, 0.76, 1],
          }}
        />
      ))}

      {/* ── Center text — z-index above orbiting dot layers (5, 6) ── */}
      <motion.div
        data-center-text
        className="absolute flex flex-col items-center font-poppins font-bold pointer-events-none"
        style={{ left: '50%', top: '50%', x: '-50%', y: '-50%', zIndex: 20 }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_BOUNCE, delay: 1.0 }}
      >
        {/* $5 — bounces on arc tap via celebrateControls */}
        <motion.span
          className="text-[40px] text-[#00da6b] whitespace-nowrap leading-none"
          animate={celebrateControls}
        >
          ${goalValue}
        </motion.span>
        <motion.span
          className="text-[10px] text-[#a9a9ca] text-center leading-normal mt-1 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.25, duration: 0.3 }}
        >
          First goal
        </motion.span>
      </motion.div>

      {/* ── Chip burst particles ── */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: p.size, height: p.size,
            left: p.left - p.size / 2, top: p.top - p.size / 2,
            backgroundColor: p.color,
            boxShadow: p.color === '#fee810'
              ? '0 0 9px rgba(254,232,16,0.95)'
              : p.color === '#1cf192' || p.color === '#71ffbf' || p.color === '#00da6b'
              ? '0 0 7px rgba(0,218,107,0.95)' : '0 0 6px rgba(255,255,255,0.9)',
            zIndex: 30,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(p.angle)*p.distance, y: Math.sin(p.angle)*p.distance, opacity: 0, scale: 0.1 }}
          transition={{ duration: 0.45, ease: [0.15, 0, 0.8, 1] }}
          onAnimationComplete={() => setParticles(prev => prev.filter(pp => pp.id !== p.id))}
        />
      ))}

      {/* ── Arc sparkle particles (arc tap + entry burst) ── */}
      {arcSparkles.map(p => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: p.size, height: p.size,
            left: p.left - p.size / 2, top: p.top - p.size / 2,
            backgroundColor: p.color,
            boxShadow: p.color === '#00da6b'
              ? '0 0 6px rgba(0,218,107,0.9)' : '0 0 5px rgba(255,255,255,0.85)',
            zIndex: 31,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(p.angle)*p.distance, y: Math.sin(p.angle)*p.distance, opacity: 0, scale: 0.1 }}
          transition={{ duration: 0.48, ease: [0.2, 0, 0.8, 1] }}
          onAnimationComplete={() => setArcSparkles(prev => prev.filter(pp => pp.id !== p.id))}
        />
      ))}

      {/* ── Floating chips ── */}
      <AnimatePresence>
        {activeChips.map(chip => {
          const pos = CHIP_POSITIONS[chip.posIdx];
          return (
            <motion.div
              key={chip.id}
              className="absolute"
              style={{ left: pos.left, top: pos.top, cursor: 'pointer', zIndex: 10 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={
                chip.exitType === 'auto'
                  ? {
                      scale:      [1, 1.08, 0],
                      opacity:    [1, 1,    0],
                      transition: { duration: 0.28, times: [0, 0.15, 1], ease: [0.4, 0, 0.6, 1] },
                    }
                  : {
                      scale:      [1, 1.22, 2.7],
                      opacity:    [1, 1,    0  ],
                      filter:     ['blur(0px)', 'blur(0px)', 'blur(9px)'],
                      transition: { duration: 0.26, times: [0, 0.22, 1], ease: 'easeOut' },
                    }
              }
              transition={
                chip.isRespawn
                  ? { type: 'spring', stiffness: 700, damping: 20 }
                  : { type: 'spring', stiffness: 380, damping: 22, delay: chip.entryDelay }
              }
              onTap={() => handlePop(chip.id, chip.posIdx)}
            >
              <div className={pos.floatClass} style={{ position: 'relative' }}>
                <div
                  className={`chip-glow-${chip.posIdx + 1}`}
                  style={{
                    position: 'absolute', width: 120, height: 76, borderRadius: '50%',
                    background: 'radial-gradient(ellipse at center, rgba(0,218,107,0.34) 0%, transparent 68%)',
                    left: '50%', top: '50%', marginLeft: -60, marginTop: -38,
                    pointerEvents: 'none', zIndex: 0,
                  }}
                />
                <div className={pos.liveClass} style={{ position: 'relative', zIndex: 1 }}>
                  <UserChip
                    avatar={chip.avatar}
                    amount={chip.amount}
                    label={chip.label}
                    avatarOnLeft={pos.avatarOnLeft}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
