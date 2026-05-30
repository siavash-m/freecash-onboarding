import { useEffect, useRef, useState } from 'react';

const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

interface CountUpOptions {
  duration?: number; // ms
  delay?: number;    // ms — only applied on first run
  from?: number;     // starting value (default 0)
}

/**
 * Counts a number from `from` → target on mount.
 * On subsequent target changes, smoothly increments from
 * the current displayed value (for live ticking).
 */
export function useCountUp(
  target: number,
  { duration = 1200, delay = 0, from = 0 }: CountUpOptions = {},
) {
  const [displayed, setDisplayed] = useState(from);
  const currentRef = useRef(from);   // tracks live displayed value
  const isFirstRef = useRef(true);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    const from = currentRef.current;
    // First run: full duration + delay; incremental ticks: short & instant
    const effectiveDuration = isFirstRef.current ? duration : Math.min(500, duration * 0.35);
    const effectiveDelay    = isFirstRef.current ? delay   : 0;
    isFirstRef.current = false;

    const deadline = Date.now() + effectiveDelay;

    const tick = () => {
      const now     = Date.now();
      if (now < deadline) { rafRef.current = requestAnimationFrame(tick); return; }

      const elapsed  = now - deadline;
      const progress = Math.min(elapsed / effectiveDuration, 1);
      const value    = Math.round(from + easeOutExpo(progress) * (target - from));

      currentRef.current = value;
      setDisplayed(value);

      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return displayed;
}
