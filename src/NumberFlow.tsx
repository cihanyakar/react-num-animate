import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode
} from "react";
import {
  formatWithIntl,
  formatWithSeparators,
  inferDecimals,
  type LocaleArg
} from "./format.js";
import { useInView, type UseInViewOptions } from "./useInView.js";

type MotionPreferences = {
  /**
   * Snap to the target without animation when the OS reports
   * `prefers-reduced-motion` (defaults to true).
   */
  respectReducedMotion?: boolean;
};

type FlowMode = "digits" | "count";

export type NumberFlowProps = MotionPreferences & {
  /** The numeric value to display. */
  value: number;
  /** Animation duration in milliseconds (defaults to 600). */
  duration?: number;
  /**
   * Animation strategy.
   *
   * - `"digits"` (default): each digit position slides independently between
   *   cells of a 0-9 reel. The intermediate frames are not real numbers.
   * - `"count"`: the underlying value is tweened over `duration`, so every
   *   frame shows a valid intermediate number. Reels snap per frame.
   */
  mode?: FlowMode;
  /**
   * Digits after the decimal point. When omitted, the precision is inferred
   * from `value`, so an integer target renders only integer characters.
   */
  decimals?: number;
  /** Content rendered before the digits. Not animated. */
  prefix?: ReactNode;
  /** Content rendered after the digits. Not animated. */
  suffix?: ReactNode;
  /** Thousands separator. Ignored when `locale` or `format` is set. */
  separator?: string;
  /** Decimal separator. Ignored when `locale` or `format` is set. */
  decimalSeparator?: string;
  /**
   * Format with `Intl.NumberFormat`. Pass `true` for the runtime default
   * locale, a locale string, an options object, or `[locales, options]`.
   */
  locale?: LocaleArg;
  /** Custom formatter. Takes precedence over the other formatting props. */
  format?: (value: number) => string;
  /**
   * Defer the animation until the element first enters the viewport. Pass
   * `true` for default options or an object to customise threshold/rootMargin.
   */
  animateOnView?: boolean | UseInViewOptions;
  className?: string;
  style?: CSSProperties;
};

const REEL_DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const REEL_TIMING = "cubic-bezier(0.22, 1, 0.36, 1)";
const FADE_GRADIENT =
  "linear-gradient(to bottom, transparent 0, #000 0.18em, #000 calc(100% - 0.18em), transparent 100%)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const cellStyle: CSSProperties = {
  display: "block",
  height: "1em",
  lineHeight: 1
};

type FlowDigitProps = MotionPreferences & {
  digit: number;
  duration: number;
  isAnimated: boolean;
};

function FlowDigit(props: FlowDigitProps): ReactElement {
  const { digit, duration, isAnimated, respectReducedMotion = true } = props;
  const reduced = respectReducedMotion && prefersReducedMotion();
  const useTransition = isAnimated && !reduced;

  const reelStyle: CSSProperties = {
    display: "block",
    transform: `translateY(${-digit}em)`,
    transition: useTransition ? `transform ${duration}ms ${REEL_TIMING}` : "none",
    willChange: useTransition ? "transform" : undefined
  };

  const cellWrapperStyle: CSSProperties = {
    display: "inline-block",
    height: "1em",
    lineHeight: 1,
    overflow: "hidden",
    verticalAlign: "top",
    WebkitMaskImage: FADE_GRADIENT,
    maskImage: FADE_GRADIENT
  };

  return (
    <span style={cellWrapperStyle}>
      <span style={reelStyle}>
        {REEL_DIGITS.map((d) => (
          <span key={d} style={cellStyle}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

function useCountedValue(
  target: number,
  duration: number,
  enabled: boolean,
  respect: boolean
): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);

  useEffect(() => {
    if (!enabled) {
      valueRef.current = target;
      setValue(target);

      return;
    }

    if (respect && prefersReducedMotion()) {
      valueRef.current = target;
      setValue(target);

      return;
    }

    if (!Number.isFinite(target) || valueRef.current === target) {
      valueRef.current = target;
      setValue(target);

      return;
    }

    const from = valueRef.current;
    const to = target;
    const diff = to - from;
    const startTime =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    let rafId = 0;

    const tick = (now: number): void => {
      const t = Math.min(1, Math.max(0, (now - startTime) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + diff * eased;

      valueRef.current = current;
      setValue(current);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        valueRef.current = to;
        setValue(to);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [target, duration, enabled, respect]);

  return enabled ? value : target;
}

function alignDigits(
  targetFormatted: string,
  currentValue: number,
  decimals: number
): string {
  const matches = targetFormatted.match(/\d/g);

  if (!matches || matches.length === 0 || !Number.isFinite(currentValue)) {
    return targetFormatted;
  }

  const targetCount = matches.length;
  const factor = Math.pow(10, decimals);
  const scaled = Math.round(Math.abs(currentValue) * factor);
  const digitsStr = String(scaled)
    .padStart(targetCount, "0")
    .slice(-targetCount);

  let i = 0;

  return targetFormatted.replace(/\d/g, () => digitsStr[i++] ?? "0");
}

const EMPTY_VIEW_OPTIONS: UseInViewOptions = {};

/**
 * Renders a number where each digit independently slides between cells of a
 * 0-9 reel when `value` changes. Pure CSS transforms drive the motion, with
 * the layout pinned by `font-variant-numeric: tabular-nums` so digits never
 * shift sideways. The reel cells are masked with a vertical gradient so the
 * digits fade in and out at the edges instead of being hard-clipped.
 *
 * Set `mode="count"` to tween the underlying value over `duration` so that
 * every animation frame shows a valid intermediate number; the reels snap
 * per frame and the layout is preserved by zero-padding.
 */
export function NumberFlow(props: NumberFlowProps): ReactElement {
  const {
    value,
    duration = 600,
    mode = "digits",
    decimals,
    prefix,
    suffix,
    separator,
    decimalSeparator,
    locale,
    format,
    animateOnView,
    respectReducedMotion = true,
    className,
    style
  } = props;

  const inViewOptions =
    typeof animateOnView === "object" ? animateOnView : EMPTY_VIEW_OPTIONS;
  const [viewRef, inView] = useInView(inViewOptions);

  const isViewGated = Boolean(animateOnView);
  const shouldDisplay = !isViewGated || inView;
  const isCountMode = mode === "count";

  const effectiveDecimals = decimals ?? inferDecimals(value);
  const effectiveTarget = shouldDisplay ? value : 0;

  const counted = useCountedValue(
    effectiveTarget,
    duration,
    isCountMode,
    respectReducedMotion
  );
  const renderValue = isCountMode ? counted : effectiveTarget;

  const formatValue = (v: number): string => {
    if (format) {
      return format(v);
    }

    if (locale !== undefined) {
      return formatWithIntl(v, locale, effectiveDecimals);
    }

    return formatWithSeparators(v, effectiveDecimals, separator, decimalSeparator);
  };

  const targetFormatted = formatValue(value);

  let formatted: string;

  if (isViewGated && !inView) {
    formatted = targetFormatted.replace(/\d/g, "0");
  } else if (isCountMode) {
    formatted = alignDigits(targetFormatted, renderValue, effectiveDecimals);
  } else {
    formatted = targetFormatted;
  }

  const wrapperStyle: CSSProperties = {
    fontVariantNumeric: "tabular-nums",
    ...style
  };

  return (
    <span
      ref={isViewGated ? viewRef : undefined}
      className={className}
      style={wrapperStyle}
    >
      {prefix}
      {/* eslint-disable-next-line @typescript-eslint/no-misused-spread -- formatted output is digits and ASCII separators only, no surrogate pairs */}
      {[...formatted].map((char, index) => {
        if (char >= "0" && char <= "9") {
          return (
            <FlowDigit
              // eslint-disable-next-line react/no-array-index-key -- digit position is the stable identity
              key={index}
              digit={Number(char)}
              duration={duration}
              isAnimated={!isCountMode}
              respectReducedMotion={respectReducedMotion}
            />
          );
        }

        return (
          <span
            // eslint-disable-next-line react/no-array-index-key -- separator position is the stable identity
            key={index}
            style={{ display: "inline-block" }}
          >
            {char}
          </span>
        );
      })}
      {suffix}
    </span>
  );
}
