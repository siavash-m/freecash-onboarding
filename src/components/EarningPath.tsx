import { motion } from 'framer-motion';
import { ASSETS } from '../assets';

// ── Timing (seconds) ──────────────────────────────────────────────────────────
const G           = 1.32;
const GREEN_CHECK1 = 1.72;
const GREEN_LINE1  = 1.90;
const GREEN_LINE2A = 1.95;
const GREEN_CHECK2 = 2.15;

const EASE_DRAW   = [0.22, 1, 0.36, 1] as const;
const SPRING_GREY  = { type: 'spring', stiffness: 350, damping: 22 } as const;
const SPRING_GREEN = { type: 'spring', stiffness: 460, damping: 14 } as const;
const SPRING_STEP  = { type: 'spring', stiffness: 340, damping: 28 } as const;

// ── Timeline line ──────────────────────────────────────────────────────────────
// Grey segment: dashed. Green segment: solid with glow.
function TimelineLine({
  greened = false,
  greyDelay,
  greenDelay,
}: {
  greened?: boolean;
  greyDelay: number;
  greenDelay?: number;
}) {
  return (
    <div className="flex-1 relative flex justify-center" style={{ minHeight: 8 }}>
      {/* grey dashed base */}
      <motion.div
        className="absolute inset-y-0"
        style={{
          width: 2,
          transformOrigin: 'top center',
          backgroundImage:
            'repeating-linear-gradient(to bottom,#525268 0px,#525268 5px,transparent 5px,transparent 9px)',
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: greyDelay, duration: 0.22, ease: EASE_DRAW }}
      />
      {/* solid green overlay with glow, draws top → bottom */}
      {greened && greenDelay != null && (
        <motion.div
          className="absolute inset-y-0"
          style={{
            width: 2,
            transformOrigin: 'top center',
            backgroundColor: '#00da6b',
            boxShadow: '0 0 6px rgba(0,218,107,0.75)',
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: greenDelay, duration: 0.3, ease: EASE_DRAW }}
        />
      )}
    </div>
  );
}

// ── Timeline check ─────────────────────────────────────────────────────────────
function TimelineCheck({
  completed,
  size,
  greyDelay,
  greenDelay,
}: {
  completed: boolean;
  size: number;
  greyDelay: number;
  greenDelay?: number;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <motion.img
        src={ASSETS.checkCircleOutline}
        alt=""
        className="absolute inset-0"
        style={{ width: size, height: size }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING_GREY, delay: greyDelay }}
      />
      {completed && greenDelay != null && (
        <motion.img
          src={ASSETS.checkCircleGreen}
          alt="completed"
          className="absolute inset-0"
          style={{ width: size, height: size }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...SPRING_GREEN, delay: greenDelay }}
        />
      )}
    </div>
  );
}

// ── Step row ──────────────────────────────────────────────────────────────────
interface StepProps {
  label: string;
  amount: string;
  completed: boolean;
  /** entry delay (bottom-to-top stagger) */
  delay: number;
  /** when border transitions grey → green (completed steps only) */
  greenBorderDelay?: number;
}

function EarningStep({ label, amount, completed, delay, greenBorderDelay }: StepProps) {
  return (
    <motion.div
      data-step
      data-completed={completed}
      className="flex items-center w-full rounded-[8px] px-5 py-3 gap-[10px] cursor-default"
      style={{ backgroundColor: '#141523', borderWidth: 1, borderStyle: 'solid' }}
      initial={{ opacity: 0, y: -14, borderColor: '#525268' }}
      animate={{ opacity: 1, y: 0, borderColor: completed ? '#00da6b' : '#525268' }}
      transition={{
        opacity:     { ...SPRING_STEP, delay },
        y:           { ...SPRING_STEP, delay },
        borderColor: completed && greenBorderDelay != null
          ? { delay: greenBorderDelay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0 },
      }}
    >
      <span className="flex-1 font-poppins font-medium text-[14px] text-white leading-normal min-w-0">
        {label}
      </span>
      <span className="font-poppins font-bold text-[14px] text-[#00da6b] whitespace-nowrap leading-normal shrink-0">
        {amount}
      </span>
    </motion.div>
  );
}

// ── Steps data — top item appears first (top-to-bottom stagger) ──────────────
const STEPS: StepProps[] = [
  { label: 'Create account',      amount: '+ $1.00', completed: true,  delay: 1.34, greenBorderDelay: 1.85 },
  { label: 'Add to home screen',  amount: '+ $1.00', completed: true,  delay: 1.48, greenBorderDelay: 2.28 },
  { label: 'Personalize profile', amount: '+ $3.00', completed: false, delay: 1.62 },
];

// ── Main component ────────────────────────────────────────────────────────────
export function EarningPath() {
  return (
    <div data-earning-path className="flex flex-col gap-2 items-start px-6 w-full">
      <motion.p
        className="font-poppins font-medium text-[12px] text-[#a9a9ca] text-center w-full leading-normal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 1.28 }}
      >
        Your earning path
      </motion.p>

      <div className="flex gap-2 items-stretch w-full">

        {/* ── Left column: icons + lines — decorative, not interactive ── */}
        <div className="flex flex-col items-center w-[18px] self-stretch pointer-events-none select-none">

          <div className="flex flex-col items-center flex-1 min-h-0 pt-[16px]">
            <TimelineCheck completed size={13.333} greyDelay={G} greenDelay={GREEN_CHECK1} />
            <TimelineLine greened greyDelay={G + 0.04} greenDelay={GREEN_LINE1} />
          </div>

          <div className="flex flex-col items-center flex-1 min-h-0">
            <TimelineLine greened greyDelay={G + 0.08} greenDelay={GREEN_LINE2A} />
            <TimelineCheck completed size={13.333} greyDelay={G + 0.12} greenDelay={GREEN_CHECK2} />
            <TimelineLine greened={false} greyDelay={G + 0.16} />
          </div>

          <div className="flex flex-col items-center flex-1 min-h-0 pb-[16px]">
            <TimelineLine greened={false} greyDelay={G + 0.2} />
            <TimelineCheck completed={false} size={16} greyDelay={G + 0.24} />
          </div>

        </div>

        {/* ── Right column: step rows ── */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {STEPS.map((step) => (
            <EarningStep key={step.label} {...step} />
          ))}
        </div>

      </div>
    </div>
  );
}
