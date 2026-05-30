import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ASSETS } from '../assets';
import { useCountUp } from '../hooks/useCountUp';

const GROUP_836 = '/images/group-836.svg';
import { PaymentMethodBody } from './PaymentMethodScreen';
import { GameGenreBody }     from './GameGenreScreen';
import { SessionLengthBody } from './SessionLengthScreen';

// ── Spring configs ────────────────────────────────────────────────────────────
const SPRING_SLIDE  = { type: 'spring', stiffness: 340, damping: 28 } as const;
const SPRING_POP    = { type: 'spring', stiffness: 520, damping: 16 } as const;

// ── Filling-step bump (scaleY pop fires on the segment as it fills green) ────
const FILL_BUMP = {
  scaleY: [1, 1.45, 0.88, 1.10, 1] as number[],
  transition: { duration: 0.50, ease: [0.34, 1.56, 0.64, 1] as number[], times: [0, 0.32, 0.58, 0.80, 1] },
};

// ── Bar state: 0 = grey, 1 = green, 2 = white ─────────────────────────────────
// Driven by React state → Framer's direct animate prop (reliable in FM 12).
const GREY  = 0;
const GREEN = 1;
const WHITE = 2;

// ── Types ─────────────────────────────────────────────────────────────────────
type QuestionStep = 2 | 3 | 4;

type Pt = { x: number; y: number };
interface FlyCoin {
  id: string;
  src: Pt; dst: Pt;
  delay: number;
  arcH: number;
  xDrift: number;
  rotations: number;
}
interface FlyLabel { src: Pt; dst: Pt }

// ── Body slide variants ───────────────────────────────────────────────────────
const bodyVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 52 : -52, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 320, damping: 28 } as const,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -52 : 52,
    opacity: 0,
    transition: { duration: 0.20, ease: [0.4, 0, 0.2, 1] } as const,
  }),
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface QuestionFlowProps {
  onBackToStart: () => void;
  onDone:        () => void;
}

// ── QuestionFlow ──────────────────────────────────────────────────────────────
export function QuestionFlow({ onBackToStart, onDone }: QuestionFlowProps) {
  const [step,      setStep]      = useState<QuestionStep>(2);
  const [direction, setDirection] = useState(1);
  const prevStepRef  = useRef<QuestionStep | null>(null);
  const navTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Balance ──
  const balanceRef  = useRef<HTMLDivElement>(null);
  const [balanceCents, setBalanceCents] = useState(200);
  const displayCents = useCountUp(balanceCents, { duration: 1200, from: 200 });
  const badge = useAnimation();

  // ── Flying reward ──
  const [coins, setCoins] = useState<FlyCoin[]>([]);
  const [label, setLabel] = useState<FlyLabel | null>(null);

  // ── Stepper bar states ────────────────────────────────────────────────────
  // [bar0, bar1, bar2, bar3, bar4] — each is GREY | GREEN | WHITE
  const [bars, setBars] = useState<number[]>([GREY, GREY, GREY, GREY, GREY]);
  // Flag so we know whether a spring bounce (user completed a step) or ease wipe is appropriate
  const initialEntryDoneRef = useRef(false);
  // Per-bar bump controls — one instance per segment so they never cross-fire
  const bump0 = useAnimation(); const bump1 = useAnimation();
  const bump2 = useAnimation(); const bump3 = useAnimation();
  const bump4 = useAnimation();
  const bumpArr = [bump0, bump1, bump2, bump3, bump4];

  const setBar = (i: number, v: number) =>
    setBars(prev => { const n = [...prev]; n[i] = v; return n; });

  // ── Initial entry: bars 0,1 wipe green (with bump), then bar 2 turns white ──
  useEffect(() => {
    const t1 = setTimeout(() => { setBar(0, GREEN); bump0.start(FILL_BUMP); }, 500);
    const t2 = setTimeout(() => { setBar(1, GREEN); bump1.start(FILL_BUMP); }, 780);
    const t3 = setTimeout(() => {
      setBar(2, WHITE);
      initialEntryDoneRef.current = true;
    }, 1240);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step delta transitions ─────────────────────────────────────────────
  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = step;
    if (prev === null) return; // initial entry handled above

    if (transTimerRef.current) clearTimeout(transTimerRef.current);

    if (step > prev) {
      // Forward: prev bar white→green (gentle wipe + bump), then new bar grey→white
      setBar(prev, GREEN);
      bumpArr[prev].start(FILL_BUMP);
      transTimerRef.current = setTimeout(() => setBar(step, WHITE), 320);
    } else {
      // Backward: prev bar white→grey; going-back bar green peels off→white
      setBars(b => { const n = [...b]; n[prev] = GREY; n[step] = GREY; return n; });
      transTimerRef.current = setTimeout(() => setBar(step, WHITE), 80);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Card selection handler ────────────────────────────────────────────────
  const handleSelect = useCallback((rect: DOMRect) => {
    const b = balanceRef.current!.getBoundingClientRect();
    const src: Pt = { x: rect.left + rect.width  / 2, y: rect.top  + rect.height / 2 };
    const dst: Pt = { x: b.left   + b.width  / 2,    y: b.top   + b.height / 2 };

    setCoins(Array.from({ length: 6 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      src, dst,
      delay:     i * 0.065,
      arcH:      80 + Math.random() * 65,
      xDrift:    (Math.random() - 0.5) * 64,
      rotations: 180 + Math.random() * 270,
    })));
    setLabel({ src, dst });

    setTimeout(() => {
      setBalanceCents(prev => prev + 100);
      badge.start({
        scale:     [1, 1.28, 0.94, 1.06, 1.0],
        boxShadow: ['0 0 0 rgba(0,214,118,0)', '0 0 26px rgba(0,214,118,0.85)', '0 0 12px rgba(0,214,118,0.35)'],
        transition: {
          scale:     { ...SPRING_POP, duration: 0.6 },
          boxShadow: { duration: 0.6, times: [0, 0.4, 1] },
        },
      });
    }, 560);

    navTimerRef.current = setTimeout(() => {
      setDirection(1);
      setStep(s => {
        if (s < 4) return (s + 1) as QuestionStep;
        onDone();
        return s;
      });
    }, 1500);
  }, [badge, onDone]);

  const handleSkip = useCallback(() => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    if (step === 4) { onDone(); return; }
    setDirection(1);
    setStep(s => (s < 4 ? (s + 1) as QuestionStep : 4));
  }, [step, onDone]);

  const handleBack = useCallback(() => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    if (step === 2) { onBackToStart(); return; }
    setDirection(-1);
    setStep(s => (s > 2 ? (s - 1) as QuestionStep : 2));
  }, [step, onBackToStart]);

  return (
    <div className="flex flex-col flex-1 bg-[#141523]">

      {/* ══ Persistent header (never remounts across steps 2–4) ═════════════ */}
      <motion.div
        className="flex flex-col gap-[14px] items-center bg-[#1d1e30] px-[24px] pt-[48px] pb-[24px] shrink-0 w-full"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING_SLIDE, delay: 0.05 }}
      >
        {/* Back · Balance · Spacer */}
        <div className="flex gap-[10px] items-center justify-center w-full">

          <div className="flex flex-1 items-center min-w-0">
            {step > 2 && (
              <motion.button
                className="flex items-center justify-center rounded-[6px] p-[4px] h-[32px] w-[32px] cursor-pointer border-0 outline-none shrink-0"
                style={{ backgroundColor: '#525268', boxShadow: '0px 4px 0px #33334d' }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93, boxShadow: '0px 1px 0px #33334d', transition: { duration: 0.07 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                onClick={handleBack}
              >
                <img src={ASSETS.arrowForward} alt="Back" className="block"
                  style={{ width: 24, height: 24, transform: 'rotate(180deg)', filter: 'brightness(0) invert(1)' }} />
              </motion.button>
            )}
          </div>

          {/* Balance badge */}
          <motion.div
            ref={balanceRef}
            animate={badge}
            className="flex gap-[8px] items-center pl-[14px] pr-[20px] py-[4px] rounded-[40px] shrink-0"
            style={{ backgroundColor: '#00403c', filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.25))' }}
          >
            <motion.div
              className="flex items-center justify-center shrink-0"
              style={{ width: 43, height: 34 }}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 10.03, opacity: 1 }}
              transition={{ ...SPRING_POP, delay: 0.18 }}
            >
              <img src={GROUP_836} alt="" style={{ width: 39, height: 28 }} />
            </motion.div>
            <div className="flex flex-col items-start leading-normal">
              <span className="font-poppins font-black text-[10px] text-[#71ffbf] uppercase whitespace-nowrap"
                style={{ textShadow: '0px 0.8px 0px black' }}>
                Balance
              </span>
              <span className="font-poppins font-black text-[14px] text-white whitespace-nowrap tracking-[0.42px]"
                style={{ textShadow: '0px 1px 0px black' }}>
                $ {(displayCents / 100).toFixed(2)}
              </span>
            </div>
          </motion.div>

          <div className="flex flex-1 min-w-0" />
        </div>

        {/* Progress bar — state-driven, no full reset between steps */}
        <div className="flex flex-col gap-[2px] w-full">
          <div className="flex items-center justify-between w-full">
            <span className="font-poppins font-black text-[14px] text-white tracking-[0.42px]"
              style={{ textShadow: '0px 1px 0px black' }}>$0</span>
            <span className="font-poppins font-black text-[14px] text-[#00da6b] tracking-[0.42px]"
              style={{ textShadow: '0px 1px 0px black' }}>$5</span>
          </div>
          <motion.div
            className="flex gap-[6px] h-[10px] items-center w-full"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.20, duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
          >
            {bars.map((barState, i) => (
              <motion.div key={i} className="flex-1 h-full min-w-0 relative"
                style={{ transformOrigin: 'center' }}
                animate={bumpArr[i]}>

                {/* Base: dark grey pill (unvisited) */}
                <div className="absolute inset-0 rounded-[100px]" style={{ backgroundColor: '#33334d' }} />

                {/* Green 3-layer pill — scaleX wipe from left */}
                <motion.div
                  className="absolute inset-0"
                  style={{ transformOrigin: 'left center' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: barState === GREEN ? 1 : 0 }}
                  transition={
                    barState === GREEN && initialEntryDoneRef.current
                      ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                      : barState === GREEN
                      ? { duration: 0.36, ease: [0.4, 0, 0.2, 1] }
                      : { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
                  }
                >
                  <div className="absolute inset-0 rounded-[100px]"
                    style={{ backgroundColor: '#00d676', boxShadow: '0px 0px 12px 0px rgba(0,214,118,0.8)' }} />
                  <div className="absolute"
                    style={{ left: 2, right: 2, top: 4.55, bottom: 1.45, backgroundColor: '#03bf66',
                      borderRadius: '50px 50px 300px 300px' }} />
                  <div className="absolute"
                    style={{ left: 2, right: 2, top: 1.55, bottom: 4.45, backgroundColor: '#1cf192',
                      borderRadius: '300px 300px 50px 50px' }} />
                </motion.div>

                {/* Grey/white 3-layer pill — current step indicator */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: barState === WHITE ? 1 : 0 }}
                  transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="absolute inset-0 rounded-[100px]" style={{ backgroundColor: '#cbcbde' }} />
                  <div className="absolute"
                    style={{ left: 2, right: 2, top: 4.55, bottom: 1.45, backgroundColor: '#bfc1c5',
                      borderRadius: '50px 50px 300px 300px' }} />
                  <div className="absolute"
                    style={{ left: 2, right: 2, top: 1.55, bottom: 4.45, backgroundColor: '#ffffff',
                      borderRadius: '300px 300px 50px 50px' }} />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ══ Sliding body ════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <AnimatePresence mode="sync" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={bodyVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col"
          >
            {step === 2 && <PaymentMethodBody onSelect={handleSelect} onSkip={handleSkip} />}
            {step === 3 && <GameGenreBody     onSelect={handleSelect} onSkip={handleSkip} />}
            {step === 4 && <SessionLengthBody onSelect={handleSelect} onSkip={handleSkip} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══ Flying reward overlay ════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-[60]">

        {coins.map(c => (
          <motion.img key={c.id} src={ASSETS.paidIcon} alt="" className="absolute"
            style={{ width: 26, height: 26, left: 0, top: 0 }}
            initial={{ x: c.src.x - 13, y: c.src.y - 13, scale: 0.45, opacity: 0 }}
            animate={{
              x:       [c.src.x - 13, c.src.x - 13 + c.xDrift, c.dst.x - 13],
              y:       [c.src.y - 13, c.src.y - c.arcH - 13,   c.dst.y - 13],
              scale:   [0.45, 1.15, 0.40],
              opacity: [0, 1, 1, 0],
              rotate:  [0, c.rotations * 0.65, c.rotations],
            }}
            transition={{
              duration: 0.88,
              delay:    c.delay,
              times:    [0, 0.38, 1],
              ease:     ['easeOut', 'easeIn'],
              opacity:  { times: [0, 0.10, 0.68, 1], duration: 0.88, delay: c.delay, ease: 'linear' },
            }}
            onAnimationComplete={() => setCoins(p => p.filter(x => x.id !== c.id))}
          />
        ))}

        {label && (
          <motion.span
            className="absolute font-poppins font-bold text-[20px] text-[#00d676]"
            style={{ left: 0, top: 0, textShadow: '0 0 18px rgba(0,218,107,0.9), 0 0 7px rgba(0,218,107,0.55)' }}
            initial={{ x: label.src.x - 24, y: label.src.y - 12, scale: 0.50, opacity: 0 }}
            animate={{
              x:       [label.src.x - 24, label.src.x - 24, label.dst.x - 24],
              y:       [label.src.y - 12, label.src.y - 68, label.dst.y - 12],
              scale:   [0.50, 1.22, 0.88],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 0.96,
              times:    [0, 0.36, 1],
              ease:     ['easeOut', 'easeIn'],
              opacity:  { times: [0, 0.14, 0.74, 1], duration: 0.96, ease: 'linear' },
            }}
            onAnimationComplete={() => setLabel(null)}
          >+$1.00</motion.span>
        )}

      </div>
    </div>
  );
}
