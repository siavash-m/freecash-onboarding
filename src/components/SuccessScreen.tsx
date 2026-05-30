import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ASSETS } from '../assets';

// ── Local image assets ────────────────────────────────────────────────────────
const GAME_BG          = '/images/game-cover-bg.png';
const GAME_ICON        = '/images/game-icon.png';
const GAME_RATING_ICON = '/images/game-rating-icon.png';
const ICON_EDITOR_CHOICE = '/images/editor-choice.svg';
const ICON_STAR        = '/images/star.svg';

// ── SVG ring geometry ─────────────────────────────────────────────────────────
const W  = 322;
const H  = 321;
const CX = W / 2;
const CY = H / 2;
const R  = 76;
const SW = 12;
const CIRC = 2 * Math.PI * R;

// ── Decorative ring layers ────────────────────────────────────────────────────
const RINGS = [
  { src: '/images/success-ring-0.svg', size: 321,     offset: 0     },
  { src: '/images/success-ring-1.svg', size: 291.445, offset: 14.78 },
  { src: '/images/success-ring-2.svg', size: 263.532, offset: 28.73 },
  { src: '/images/success-ring-3.svg', size: 235.619, offset: 42.69 },
  { src: '/images/success-ring-4.svg', size: 201.138, offset: 59.93 },
  { src: '/images/success-ring-5.svg', size: 165.015, offset: 77.99 },
];

// ── Spring / easing configs ───────────────────────────────────────────────────
const SPRING_SLIDE  = { type: 'spring', stiffness: 340, damping: 28 } as const;
const SPRING_ENTRY  = { type: 'spring', stiffness: 480, damping: 18 } as const;
const EASE_DRAW     = [0.22, 1, 0.36, 1] as const;

// ── Earning path data ─────────────────────────────────────────────────────────
function makePathSteps(earnedCents: number) {
  const earnedStr = `+ $${(earnedCents / 100).toFixed(2)}`;
  return [
    { label: 'Onboarding',      amount: earnedStr,  borderColor: '#00da6b', amountColor: '#00da6b', completed: true,  current: false },
    { label: 'Play first game', amount: '+ $10.00', borderColor: '#fee810', amountColor: '#fee810', completed: false, current: true  },
    { label: 'First cash-out',  amount: '+ $15.00', borderColor: '#525268', amountColor: '#00da6b', completed: false, current: false },
  ];
}

// ── Timeline helpers ──────────────────────────────────────────────────────────
function TimelineLine({ greened = false, greyDelay, greenDelay }: { greened?: boolean; greyDelay: number; greenDelay?: number }) {
  return (
    <div className="flex-1 relative flex justify-center" style={{ minHeight: 8 }}>
      <motion.div className="absolute inset-y-0"
        style={{ width: 2, transformOrigin: 'top center',
          backgroundImage: 'repeating-linear-gradient(to bottom,#525268 0px,#525268 5px,transparent 5px,transparent 9px)' }}
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ delay: greyDelay, duration: 0.22, ease: EASE_DRAW }} />
      {greened && greenDelay != null && (
        <motion.div className="absolute inset-y-0"
          style={{ width: 2, transformOrigin: 'top center', backgroundColor: '#00da6b', boxShadow: '0 0 6px rgba(0,218,107,0.75)' }}
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ delay: greenDelay, duration: 0.3, ease: EASE_DRAW }} />
      )}
    </div>
  );
}

function TimelineCheck({ completed, current = false, size, greyDelay, greenDelay }:
  { completed: boolean; current?: boolean; size: number; greyDelay: number; greenDelay?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <motion.img src={ASSETS.checkCircleOutline} alt="" className="absolute inset-0"
        style={{ width: size, height: size }}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: completed || current ? 0 : 1 }}
        transition={{ ...SPRING_ENTRY, delay: greyDelay }} />
      {completed && greenDelay != null && (
        <motion.img src={ASSETS.checkCircleGreen} alt="completed" className="absolute inset-0"
          style={{ width: size, height: size }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 460, damping: 14, delay: greenDelay }} />
      )}
      {current && (
        <motion.svg viewBox="0 0 16 16" width={size} height={size} className="absolute inset-0"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 460, damping: 14, delay: greyDelay + 0.3 }}>
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="#fee810" strokeWidth="2" />
          <circle cx="8" cy="8" r="2.5" fill="#fee810" />
        </motion.svg>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface SuccessScreenProps {
  onGoHome:    () => void;
  earnedCents: number;
}

// ── SuccessScreen ─────────────────────────────────────────────────────────────
export function SuccessScreen({ onGoHome, earnedCents }: SuccessScreenProps) {
  const PATH_STEPS = makePathSteps(earnedCents);

  const [chartHidden, setChartHidden] = useState(false);

  useEffect(() => {
    // Unmount chart section at 3s — snappier
    const t1 = setTimeout(() => setChartHidden(true), 3000);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className="relative flex flex-col bg-[#141523]" style={{ height: '100dvh' }}>

      {/* ── Two-wave entry celebration burst ── */}
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 z-50"
        style={{ background: 'radial-gradient(ellipse at center, rgba(254,232,16,0.65) 0%, rgba(254,232,16,0.22) 30%, transparent 68%)' }}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 1, 0], scale: [0.2, 1.7, 2.6] }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} />
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 z-50"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(254,232,16,0.3) 25%, transparent 60%)' }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.4, 1.2, 1.9] }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />

      <style>{`div[data-success-scroll]::-webkit-scrollbar { display: none; }`}</style>

      {/* ── Scrollable content ── */}
      <div data-success-scroll
        className="flex flex-col items-center gap-6 px-[18px] pt-[48px] pb-[24px] w-full flex-1 min-h-0 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}>

        <LayoutGroup>

          {/* ══ Title — always visible ══════════════════════════════════════ */}
          <motion.div className="flex flex-col gap-1 items-center text-center w-full"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SLIDE, delay: 0.08 }}
          >
            <p className="font-poppins font-bold text-[24px] text-[#fee810] leading-normal">You reached first goal!</p>
            <p className="font-poppins font-medium text-[16px] text-[#a9a9ca] leading-normal">Start earning more by playing first game.</p>
          </motion.div>

          {/* ══ Chart + earned amount — unmounts after 5s ═══════════════════ */}
          <AnimatePresence>
            {!chartHidden && (
              <motion.div
                key="chart-section"
                layout
                className="w-full flex flex-col items-center"
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.5 } }}
              >
                {/* Chart container */}
                <div className="relative shrink-0" style={{ width: W, height: H }}>

                  {/* Rings + arc group — playful spin-shrink exit */}
                  <motion.div className="absolute inset-0"
                    exit={{
                      scale:   [1, 1.15, 1.05, 0],
                      rotate:  [0, 8, -5, 720],
                      opacity: [1, 1, 0.6, 0],
                      transition: { duration: 0.65, ease: [0.34, 1.2, 0.64, 1], times: [0, 0.25, 0.5, 1] },
                    }}
                  >
                    {RINGS.map(({ src, size, offset }, i) => (
                      <motion.img key={i} src={src} alt=""
                        className="absolute pointer-events-none select-none"
                        style={{ width: size, height: size, left: offset, top: offset }}
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...SPRING_ENTRY, delay: 0.2 + i * 0.065 }} />
                    ))}

                    <motion.svg width={W} height={H} className="absolute inset-0 pointer-events-none"
                      style={{ overflow: 'visible' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                      <defs>
                        <filter id="yellow-glow" x="-40%" y="-40%" width="180%" height="180%">
                          <feGaussianBlur stdDeviation="4" in="SourceGraphic" result="blur" />
                          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      {([0, 0.9, 1.8] as const).map((extraDelay, i) => (
                        <motion.circle key={`pulse${i}`} cx={CX} cy={CY} r={84}
                          stroke="rgba(254,232,16,0.50)" strokeWidth={1.5} fill="none"
                          style={{ transformOrigin: `${CX}px ${CY}px` }}
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ scale: [1.1, 1.4, 2.1], opacity: [0, 0.45, 0] }}
                          transition={{ delay: 1.6 + extraDelay, duration: 2.2, repeat: Infinity,
                            repeatDelay: 1.6, times: [0, 0.12, 1], ease: [0.2, 0.8, 0.4, 1] }} />
                      ))}
                      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#33334d" strokeWidth={SW} />
                      <g transform={`rotate(-90, ${CX}, ${CY})`}>
                        <motion.circle cx={CX} cy={CY} r={R}
                          fill="none" stroke="#fee810" strokeWidth={SW} strokeLinecap="round"
                          strokeDasharray={CIRC}
                          initial={{ strokeDashoffset: CIRC }}
                          animate={{
                            strokeDashoffset: 0,
                            filter: ['drop-shadow(0 0 8px rgba(254,232,16,0.80))',
                              'drop-shadow(0 0 18px rgba(254,232,16,1.00))',
                              'drop-shadow(0 0 8px rgba(254,232,16,0.80))'],
                          }}
                          transition={{
                            strokeDashoffset: { delay: 0.55, duration: 1.35, ease: EASE_DRAW },
                            filter: { delay: 2.2, duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
                          }}
                          filter="url(#yellow-glow)" />
                      </g>
                    </motion.svg>
                  </motion.div>

                  {/* Yellow orbiting dots — same CSS-keyframe approach as CircularGoal green dots */}
                  <div className="absolute pointer-events-none orbit-cw-9"
                    style={{ left: 0, top: 0, width: W, height: H,
                      transformOrigin: `${CX}px ${CY}px`, zIndex: 6 }}>
                    <div className="dot-fade-y-1800" style={{
                      position: 'absolute', width: 5, height: 5, borderRadius: '50%',
                      backgroundColor: '#fee810',
                      boxShadow: '0 0 8px 2px rgba(254,232,16,0.9)',
                      left: CX + 95 - 2.5, top: CY - 2.5,
                    }} />
                  </div>
                  <div className="absolute pointer-events-none orbit-ccw-16"
                    style={{ left: 0, top: 0, width: W, height: H,
                      transformOrigin: `${CX}px ${CY}px`, zIndex: 6 }}>
                    <div className="dot-fade-y-2000" style={{
                      position: 'absolute', width: 3.5, height: 3.5, borderRadius: '50%',
                      backgroundColor: '#fdf055',
                      boxShadow: '0 0 7px rgba(254,232,16,1)',
                      left: CX + 115 - 1.75, top: CY - 1.75,
                    }} />
                  </div>
                  <div className="absolute pointer-events-none orbit-cw-24"
                    style={{ left: 0, top: 0, width: W, height: H,
                      transformOrigin: `${CX}px ${CY}px`, zIndex: 5 }}>
                    <div className="dot-fade-y-2200" style={{
                      position: 'absolute', width: 4, height: 4, borderRadius: '50%',
                      backgroundColor: '#fee810', opacity: 0.85,
                      boxShadow: '0 0 6px rgba(254,232,16,0.8)',
                      left: CX + 130 - 2, top: CY - 2,
                    }} />
                  </div>

                  {/* Earned amount — appears as the chart fades in */}
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    style={{ zIndex: 20 }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 16, delay: 0.4 }}
                  >
                    <span className="font-poppins font-bold text-[40px] text-[#fee810] leading-none whitespace-nowrap"
                      style={{ textShadow: '0 0 24px rgba(254,232,16,0.8)' }}>
                      ${(earnedCents / 100).toFixed(2)}
                    </span>
                    <span className="font-poppins font-medium text-[10px] text-[#a9a9ca] text-center leading-normal mt-1">Completed</span>
                  </motion.div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══ Earning path ════════════════════════════════════════════════ */}
          <motion.div layout className="flex flex-col gap-2 items-start px-6 w-full">
            <motion.p className="font-poppins font-medium text-[12px] text-[#a9a9ca] text-center w-full leading-normal"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 1.0 }}>
              Your earning path
            </motion.p>

            <div className="flex gap-2 items-stretch w-full">
              <div className="flex flex-col items-center w-[18px] self-stretch pointer-events-none select-none">
                <div className="flex flex-col items-center flex-1 min-h-0 pt-[16px]">
                  <TimelineCheck completed size={13} greyDelay={1.02} greenDelay={1.38} />
                  <TimelineLine greened greyDelay={1.06} greenDelay={1.42} />
                </div>
                <div className="flex flex-col items-center flex-1 min-h-0">
                  <TimelineLine greened greyDelay={1.10} greenDelay={1.46} />
                  <TimelineCheck current size={16} completed={false} greyDelay={1.14} />
                  <TimelineLine greened={false} greyDelay={1.18} />
                </div>
                <div className="flex flex-col items-center flex-1 min-h-0 pb-[16px]">
                  <TimelineLine greened={false} greyDelay={1.22} />
                  <TimelineCheck completed={false} size={16} greyDelay={1.26} />
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {PATH_STEPS.map((step, i) => (
                  <motion.div key={step.label}
                    className="relative flex items-center w-full rounded-[8px] px-5 py-3 gap-[10px]"
                    style={{ backgroundColor: '#141523', borderWidth: 1, borderStyle: 'solid', borderColor: '#525268' }}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      opacity: { ...SPRING_SLIDE, delay: 1.02 + i * 0.15 },
                      y:       { ...SPRING_SLIDE, delay: 1.02 + i * 0.15 },
                    }}
                  >
                    {/* Coloured border draws in top-to-bottom for green (i=0) and yellow (i=1) */}
                    {step.borderColor !== '#525268' && (
                      <motion.div
                        className="absolute inset-0 rounded-[8px] pointer-events-none"
                        style={{ border: `1px solid ${step.borderColor}` }}
                        initial={{ clipPath: 'inset(0 0 100% 0 round 8px)' }}
                        animate={{ clipPath: 'inset(0 0 0% 0 round 8px)' }}
                        transition={{ delay: 1.40 + i * 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}

                    <span className="relative z-[1] flex-1 font-poppins font-medium text-[14px] text-white leading-normal min-w-0">{step.label}</span>
                    <motion.span className="relative z-[1] font-poppins font-bold text-[14px] whitespace-nowrap leading-normal shrink-0"
                      style={{ color: step.amountColor }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 1.48 + i * 0.15, duration: 0.3 }}>
                      {step.amount}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ══ Recommended game card ═══════════════════════════════════════ */}
          <motion.div layout className="w-full mt-4"
            animate={chartHidden
              ? { scale: [1, 1.04, 0.97, 1.01, 1], y: [0, -10, 3, -4, 0] }
              : { scale: 1, y: 0 }
            }
            transition={chartHidden
              ? { duration: 0.65, ease: [0.34, 1.56, 0.64, 1], delay: 0.45 }
              : {}
            }
          >
            <motion.div className="relative w-full"
              initial={{ opacity: 0, y: 64, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.7 }}
            >
              {/* "RECOMMENDED FOR YOU" badge */}
              <div className="absolute left-[26px] top-[-12px] flex items-center gap-[6px] px-[8px] py-[4px] rounded-[14px] z-10"
                style={{ background: 'linear-gradient(-10deg, #fdf055 42%, #fee810 60%)', boxShadow: '0 0 8px rgba(254,232,16,0.70)' }}>
                <img src={ICON_EDITOR_CHOICE} alt="" style={{ width: 14, height: 14 }} />
                <span className="font-poppins font-semibold text-[10px] text-black whitespace-nowrap">RECOMMENDED FOR YOU</span>
              </div>

              {/* Game image */}
              <div className="relative overflow-hidden rounded-tl-[16px] rounded-tr-[16px]" style={{ height: 210 }}>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img src={GAME_BG} alt="" className="absolute max-w-none"
                    style={{ height: '495.35%', width: '120.06%', left: '-9.98%', top: '-152.33%' }} />
                </div>
                {/* Smooth cinema-fade gradient — no backdrop-filter to avoid abrupt edge */}
                <div className="absolute bottom-0 left-0 w-full pointer-events-none"
                  style={{
                    height: 120,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 25%, rgba(0,0,0,0.3) 55%, transparent 100%)',
                  }} />
                <div className="absolute left-[16px] top-[139px] w-[310px] flex items-end gap-[14px]">
                  <div className="relative shrink-0 overflow-hidden" style={{ width: 53, height: 53 }}>
                    <img src={GAME_ICON} alt="" className="absolute max-w-none"
                      style={{ height: '726.14%', width: '334.94%', left: '-17.05%', top: '-105.11%' }} />
                  </div>
                  <p className="font-poppins font-semibold text-[18px] text-white leading-normal w-[255px]">HomeSpaces: Match 3 Games</p>
                </div>
                <div className="absolute top-[15px] right-[14px] flex items-center gap-[1px] p-[4px] rounded-[6px]"
                  style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <img src={GAME_RATING_ICON} alt="" className="object-cover rounded-[2px]" style={{ width: 16, height: 16 }} />
                  <span className="font-poppins font-medium text-[10px] text-white whitespace-nowrap">4.6</span>
                  <img src={ICON_STAR} alt="★" style={{ width: 14, height: 14 }} />
                </div>
              </div>

              {/* Game details */}
              <div className="flex flex-col gap-[10px] px-[18px] pt-[18px] pb-[24px] rounded-bl-[16px] rounded-br-[16px]"
                style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#525268', borderTop: 'none' }}>
                <div className="flex gap-[6px] flex-wrap">
                  <div className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-[24px] bg-[#525268] shrink-0">
                    <img src={ASSETS.sportsEsports} alt="" style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
                    <span className="font-poppins text-[12px] text-white whitespace-nowrap">Casual</span>
                  </div>
                  <div className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-[24px] bg-[#525268] shrink-0">
                    <img src={ASSETS.acute} alt="" style={{ width: 14, height: 14, filter: 'brightness(0) invert(1)' }} />
                    <span className="font-poppins text-[12px] text-white whitespace-nowrap">5 min play</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-poppins font-semibold text-[18px] text-white leading-normal">Your reward:</span>
                  <span className="font-poppins font-semibold text-[24px] text-[#fee810] leading-normal whitespace-nowrap">+$10.00</span>
                </div>
                <motion.button
                  className="relative flex items-center justify-center gap-[10px] w-full rounded-[6px] px-[16px] py-[12px] font-poppins font-semibold text-[16px] text-[#141524] cursor-pointer border-0 outline-none overflow-hidden"
                  style={{ backgroundColor: '#00da6b', boxShadow: '0px 4px 0px #00984c' }}
                  whileHover={{ y: -2, backgroundColor: '#00e87a' }}
                  whileTap={{ y: 1, scale: 0.97, boxShadow: '0px 1px 0px #00984c', transition: { duration: 0.06 } }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                >
                  <motion.span aria-hidden className="pointer-events-none absolute inset-0"
                    style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)' }}
                    initial={{ x: '-110%' }} animate={{ x: '210%' }}
                    transition={{ delay: 1.8, duration: 1.1, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 3.2 }} />
                  Start first game
                  <img src={ASSETS.arrowForward} alt="" style={{ width: 24, height: 24, filter: 'brightness(0)' }} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

        </LayoutGroup>
      </div>

      {/* ══ Go to home — pinned at bottom ════════════════════════════════════ */}
      <div className="px-[18px] pt-[12px] pb-[48px] shrink-0 bg-[#141523]">
        <motion.button
          className="relative flex items-center justify-center w-full rounded-[6px] px-[16px] py-[12px] font-poppins font-semibold text-[16px] text-white cursor-pointer border-0 outline-none overflow-hidden"
          style={{ backgroundColor: '#525268', boxShadow: '0px -6px 0px 0px #7d7d9e, 0px 4px 0px 0px #33334d' }}
          whileHover={{ y: -2, backgroundColor: '#5e5e7a' }}
          whileTap={{ y: 1, scale: 0.97, boxShadow: '0px -2px 0px 0px #7d7d9e, 0px 1px 0px 0px #33334d', transition: { duration: 0.06 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          onClick={onGoHome}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.span aria-hidden className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)' }}
            initial={{ x: '-110%' }} animate={{ x: '210%' }}
            transition={{ delay: 2.2, duration: 1.0, ease: [0.4, 0, 0.2, 1], repeat: Infinity, repeatDelay: 3.0 }} />
          Go to home
        </motion.button>
      </div>

    </div>
  );
}
