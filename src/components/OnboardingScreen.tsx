import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CircularGoal } from './CircularGoal';
import { EarningPath } from './EarningPath';
import { ASSETS } from '../assets';
import { useCountUp } from '../hooks/useCountUp';

// Spring configs
const SPRING_UP     = { type: 'spring', stiffness: 360, damping: 30 } as const;
const SPRING_CTA    = { type: 'spring', stiffness: 300, damping: 20 } as const;

interface OnboardingScreenProps {
  onContinue?: () => void;
}

export function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  // ── Live counter: starts at 6,439,190 and ticks upward after entry ──
  const [liveAmount, setLiveAmount] = useState(6_439_190);
  const displayedAmount = useCountUp(liveAmount, { duration: 1400, delay: 200, from: 6_100_000 });

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const tick = () => {
      const delta = Math.floor(Math.random() * 620) + 110; // $110–$730 per tick
      setLiveAmount((n) => n + delta);
      tid = setTimeout(tick, 4000 + Math.random() * 3000);
    };
    // First live tick after entry + buffer (≈ 5 s)
    tid = setTimeout(tick, 5000);
    return () => clearTimeout(tid);
  }, []);

  return (
    <div
      data-screen="onboarding"
      className="flex flex-col items-center flex-1 bg-[#141523]"
    >
      <div className="flex flex-col items-center justify-between flex-1 w-full px-[18px] py-10">

        {/* ── Header ── */}
        <motion.div
          data-header
          className="flex flex-col gap-1 items-center w-full"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_UP, delay: 0.1 }}
        >
          <p className="font-poppins font-medium text-[16px] text-center w-full leading-normal">
            <span className="text-[#00d676]">
              ${displayedAmount.toLocaleString('en-US')}
            </span>
            <span className="text-[#a9a9ca]"> Paid out today</span>
          </p>

          <motion.p
            className="font-poppins font-bold text-[24px] text-white leading-normal text-center w-full"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_UP, delay: 0.28 }}
          >
            Let's earn your first $5.
          </motion.p>
        </motion.div>

        {/* ── Circular goal ── */}
        <CircularGoal />

        {/* ── Bottom section ── */}
        <motion.div
          className="flex flex-col gap-10 items-start w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01, delay: 1.28 }} // reveal container at right time
        >
          <EarningPath />

          {/* ── CTA button ── */}
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_CTA, delay: 1.85 }}
          >
            <motion.button
              data-cta
              className="relative w-full flex items-center justify-center gap-[10px] rounded-[6px] px-4 py-3 font-poppins font-semibold text-[16px] text-[#141524] whitespace-nowrap cursor-pointer border-0 outline-none overflow-hidden"
              style={{
                backgroundColor: '#00da6b',
                boxShadow: '0px 4px 0px #00984c',
              }}
              onClick={onContinue}
              whileHover={{ scale: 1.015, boxShadow: '0px 4px 0px #00984c, 0 0 24px rgba(0,218,107,0.45)' }}
              whileTap={{
                scale: 0.965,
                boxShadow: '0px 1px 0px #00984c',
                transition: { duration: 0.06 },
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              {/* Shimmer sweep — diagonal highlight that repeats every 3.5 s */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)',
                  backgroundSize: '200% 100%',
                }}
                initial={{ x: '-110%' }}
                animate={{ x: '210%' }}
                transition={{
                  delay: 2.6,
                  duration: 1.1,
                  ease: [0.4, 0, 0.2, 1],
                  repeat: Infinity,
                  repeatDelay: 2.2,
                }}
              />

              Continue earning

              {/* Arrow bounces rightward on repeat */}
              <motion.img
                src={ASSETS.arrowForward}
                alt=""
                className="shrink-0"
                style={{ width: 24, height: 24 }}
                animate={{ x: [0, 5, 0] }}
                transition={{
                  delay: 2.7,
                  duration: 0.8,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 2.2,
                }}
              />
            </motion.button>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
