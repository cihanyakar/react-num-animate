import { useEffect, useRef, useState } from "react";
import { easings, type Easing, type EasingName } from "./easings.js";

export interface UseAnimatedNumberOptions {
  /** Animation duration in milliseconds (defaults to 800). */
  duration?: number;
  /** Easing function or name of a built-in easing (defaults to `"easeOutCubic"`). */
  easing?: Easing | EasingName;
  /** If true, animates from 0 to the initial target on first render (defaults to false). */
  animateOnMount?: boolean;
  /** Snaps to the target when the OS reports prefers-reduced-motion (defaults to true). */
  respectReducedMotion?: boolean;
  /** Called on every animation frame with the current interpolated value. */
  onUpdate?: (value: number) => void;
  /** Called once when the animation finishes (or when value changes with no animation). */
  onComplete?: (value: number) => void;
}

const DEFAULT_DURATION = 800;
const DEFAULT_EASING: EasingName = "easeOutCubic";

function resolveEasing(value: Easing | EasingName | undefined): Easing {
  if (typeof value === "function") return value;
  return easings[value ?? DEFAULT_EASING];
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Smoothly animates a numeric value over time. Returns the current interpolated value
 * and re-renders the host component on every animation frame until the target is reached.
 *
 * The animation restarts from the currently displayed value whenever `target` changes.
 */
export function useAnimatedNumber(
  target: number,
  options: UseAnimatedNumberOptions = {},
): number {
  const {
    duration = DEFAULT_DURATION,
    easing,
    animateOnMount = false,
    respectReducedMotion = true,
    onUpdate,
    onComplete,
  } = options;

  const initial = animateOnMount ? 0 : target;
  const [value, setValue] = useState(initial);

  const valueRef = useRef(initial);
  const frameRef = useRef<number | null>(null);
  const hasMountedRef = useRef(false);

  const onUpdateRef = useRef(onUpdate);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!hasMountedRef.current && !animateOnMount) {
      hasMountedRef.current = true;
      valueRef.current = target;
      setValue(target);
      return;
    }
    hasMountedRef.current = true;

    if (!Number.isFinite(target)) {
      valueRef.current = target;
      setValue(target);
      return;
    }

    if (duration <= 0 || (respectReducedMotion && prefersReducedMotion())) {
      valueRef.current = target;
      setValue(target);
      onUpdateRef.current?.(target);
      onCompleteRef.current?.(target);
      return;
    }

    const from = valueRef.current;
    const to = target;
    const diff = to - from;

    if (diff === 0) {
      onCompleteRef.current?.(to);
      return;
    }

    const ease = resolveEasing(easing);
    const startTime =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const tick = (now: number): void => {
      const elapsed = now - startTime;
      const t = Math.min(1, Math.max(0, elapsed / duration));
      const current = from + diff * ease(t);

      valueRef.current = current;
      setValue(current);
      onUpdateRef.current?.(current);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
        valueRef.current = to;
        setValue(to);
        onCompleteRef.current?.(to);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [target, duration, easing, animateOnMount, respectReducedMotion]);

  return value;
}
