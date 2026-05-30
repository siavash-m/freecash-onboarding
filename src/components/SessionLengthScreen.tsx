import { useState, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ASSETS } from '../assets';

const RECT_265 = '/images/rect-265.svg'; // selected card corner
const RECT_266 = '/images/rect-266.svg'; // unselected card corner
const RECT_267 = '/images/rect-267.svg'; // skip button corner

// ── Spring configs ────────────────────────────────────────────────────────────
const SPRING_SLIDE  = { type: 'spring', stiffness: 340, damping: 28 } as const;
const SPRING_ENTRY  = { type: 'spring', stiffness: 480, damping: 18 } as const;
const SPRING_POP    = { type: 'spring', stiffness: 520, damping: 16 } as const;
const SPRING_ICON   = { type: 'spring', stiffness: 680, damping: 14 } as const;
const SPRING_CTA    = { type: 'spring', stiffness: 300, damping: 20 } as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type SessionId = 'quick' | 'medium' | 'long' | 'marathon';

interface SessionOption {
  id: SessionId;
  icon: string;
  sub: string;
  name: string;
}

interface Particle {
  id: string;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const OPTIONS: SessionOption[] = [
  { id: 'quick',    icon: ASSETS.acute,       sub: 'Quick win',    name: '5 – 15 min'  },
  { id: 'medium',   icon: ASSETS.timer,       sub: 'Comfortable',  name: '15 – 30 min' },
  { id: 'long',     icon: ASSETS.cardsStar,   sub: 'Deep session', name: '45 – 60 min' },
  { id: 'marathon', icon: ASSETS.rewardedAds, sub: 'Marathon',     name: '60+ min'     },
];

// ── SessionCard sub-component ─────────────────────────────────────────────────
interface SessionCardProps {
  opt: SessionOption;
  index: number;
  isSelected: boolean;
  anySelected: boolean;
  onSelect: (id: SessionId, rect: DOMRect) => void;
}

function SessionCard({ opt, index, isSelected, anySelected, onSelect }: SessionCardProps) {
  const controls = useAnimation();
  const cardRef  = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleSelect = useCallback(async () => {
    if (anySelected) return;
    const rect = cardRef.current!.getBoundingClientRect();
    onSelect(opt.id, rect);

    setParticles(
      Array.from({ length: 10 }, (_, i) => ({
        id:       `${Date.now()}-${i}`,
        angle:    (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
        distance: 28 + Math.random() * 26,
        color:    i % 3 === 0 ? '#ffffff' : '#00da6b',
        size:     3 + Math.random() * 4.5,
      })),
    );

    controls.start({
      scale:           [1, 0.88, 1.18, 0.96, 1.0],
      backgroundColor: '#00da6b',
      boxShadow:       '0px -6px 0px 0px #71ffbf, 0px 4px 0px 0px #00984c',
      transition: {
        scale:           { ...SPRING_POP, duration: 0.52 },
        backgroundColor: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
        boxShadow:       { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
      },
    });
  }, [anySelected, controls, onSelect, opt.id]);

  return (
    <motion.div
      className="relative"
      animate={anySelected && !isSelected ? { scale: 0.93, opacity: 0.60 } : { scale: 1.0, opacity: 1.0 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.button
        ref={cardRef}
        className="relative flex items-center justify-center rounded-[10px] px-[20px] py-[32px] w-full h-full cursor-pointer border-0 outline-none text-left overflow-hidden"
        style={{ backgroundColor: '#1d1e30', boxShadow: '0px -6px 0px 0px #33334d, 0px 6px 0px 0px #0f0f1a' }}
        initial={{ opacity: 0, y: 24 }}
        animate={controls}
        onViewportEnter={() =>
          controls.start({
            opacity: 1, y: 0,
            backgroundColor: '#1d1e30',
            boxShadow: '0px -6px 0px 0px #33334d, 0px 6px 0px 0px #0f0f1a',
            transition: { ...SPRING_ENTRY, delay: 0.30 + index * 0.07 },
          })
        }
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        onClick={handleSelect}
      >
        {/* Idle shimmer */}
        {!anySelected && (
          <motion.span aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[10px]"
            style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.16) 50%, transparent 65%)' }}
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ delay: 1.6 + index * 0.5, duration: 1.1, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 3.5 + index * 0.4 }}
          />
        )}

        {/* Selection shimmer */}
        {isSelected && (
          <motion.span aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[10px]"
            style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)' }}
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          />
        )}

        {/* Content */}
        <div className="flex flex-col gap-[10px] items-start justify-center flex-1 min-w-0 relative z-10">
          <motion.div className="shrink-0"
            animate={!anySelected ? { y: [0, -3, 0], scale: [1, 1.06, 1], rotate: 0 } : { y: 0, scale: 1, rotate: 0 }}
            transition={{ duration: 2.4 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
          >
            <motion.img src={opt.icon} alt=""
              style={{ width: 28, height: 28 }}
              animate={{
                filter: isSelected ? 'brightness(0)' : 'brightness(0) invert(1)',
                scale:  isSelected ? [1, 0, 1.35, 0.90, 1.0] : 1,
              }}
              transition={{
                filter: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
                scale:  { ...SPRING_ICON, delay: 0.03 },
              }}
            />
          </motion.div>

          <div className="flex flex-col items-start justify-center w-full">
            <motion.span
              className="font-poppins font-semibold text-[10px] leading-normal w-full"
              animate={{ color: isSelected ? '#1d1e30' : '#a9a9ca' }}
              transition={{ duration: 0.2 }}
            >
              {opt.sub}
            </motion.span>
            <motion.span
              className="font-poppins font-bold text-[18px] leading-normal w-full"
              animate={{ color: isSelected ? '#141523' : '#ffffff', y: isSelected ? -3 : 0 }}
              transition={{ ...SPRING_ICON, delay: 0.04 }}
            >
              {opt.name}
            </motion.span>
          </div>
        </div>

        {/* Particles */}
        {particles.map(p => (
          <motion.div key={p.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: p.size, height: p.size,
              left: '50%', top: '50%',
              marginLeft: -p.size / 2, marginTop: -p.size / 2,
              backgroundColor: p.color,
              boxShadow: p.color === '#00da6b' ? '0 0 7px rgba(0,218,107,0.95)' : '0 0 6px rgba(255,255,255,0.9)',
              zIndex: 20,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(p.angle) * p.distance, y: Math.sin(p.angle) * p.distance, opacity: 0, scale: 0.1 }}
            transition={{ duration: 0.55, ease: [0.2, 0, 0.8, 1] }}
            onAnimationComplete={() => setParticles(prev => prev.filter(pp => pp.id !== p.id))}
          />
        ))}

        {/* Corner decoration */}
        <img src={isSelected ? RECT_265 : RECT_266} alt=""
          className="absolute pointer-events-none"
          style={{ top: 4, right: 4, width: 26, height: 20, zIndex: 15 }} />
      </motion.button>
    </motion.div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface SessionLengthBodyProps {
  onSelect: (rect: DOMRect) => void;
  onSkip:   () => void;
}

// ── Body (used by QuestionFlow) ───────────────────────────────────────────────
export function SessionLengthBody({ onSelect, onSkip }: SessionLengthBodyProps) {
  const [selected, setSelected] = useState<SessionId | null>(null);
  const anySelected = selected !== null;

  const handleCardSelect = useCallback((id: SessionId, rect: DOMRect) => {
    if (anySelected) return;
    setSelected(id);
    onSelect(rect);
  }, [anySelected, onSelect]);

  return (
    <div data-body="session" className="flex flex-col flex-1 items-center justify-between px-[18px] pt-[20px] pb-[48px]">

      <motion.div
        className="flex flex-col gap-[18px] items-start px-[18px] w-full"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_SLIDE, delay: 0.05 }}
      >
        <p className="font-poppins font-bold text-[24px] text-white leading-normal w-full">
          How long do you have to play right now?
        </p>
        <div className="flex flex-col gap-[6px] w-full">
          <p className="font-poppins font-medium text-[16px] text-[#a9a9ca] leading-normal w-full">
            We'll show offers that fit your session.
          </p>
          <p className="font-poppins font-medium text-[10px] text-[#a9a9ca] leading-normal w-full">
            You can always change it later
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-[24px] w-full" style={{ height: 296 }}>
        {OPTIONS.map((opt, i) => (
          <SessionCard
            key={opt.id}
            opt={opt}
            index={i}
            isSelected={selected === opt.id}
            anySelected={anySelected}
            onSelect={handleCardSelect}
          />
        ))}
      </div>

      <motion.div
        className="flex flex-col items-start justify-end w-full"
        style={{ height: 112 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CTA, delay: 0.62 }}
      >
        <motion.button
          className="relative flex items-center justify-center rounded-[6px] px-[16px] py-[12px] w-full font-poppins font-semibold text-[16px] text-white cursor-pointer border-0 outline-none overflow-hidden"
          style={{ backgroundColor: '#525268', boxShadow: '0px -6px 0px 0px #7d7d9e, 0px 4px 0px 0px #33334d' }}
          whileHover={{ y: -2, backgroundColor: '#5e5e7a' }}
          whileTap={{ y: 1, scale: 0.97, boxShadow: '0px -2px 0px 0px #7d7d9e, 0px 1px 0px 0px #33334d', transition: { duration: 0.06 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          onClick={onSkip}
        >
          <motion.span aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)' }}
            initial={{ x: '-110%' }}
            animate={{ x: '210%' }}
            transition={{ delay: 1.4, duration: 1.0, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 3.0 }}
          />
          Skip
          <img src={RECT_267} alt=""
            className="absolute pointer-events-none"
            style={{ top: 4, right: 4, width: 26, height: 20 }} />
        </motion.button>
      </motion.div>

    </div>
  );
}
