import {
  useEffect,
  useLayoutEffect,
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
   * - `"digits"` (default): when a digit position changes, the old glyph
   *   slides up and fades out while the new glyph slides up from below
   *   and fades in. The intermediate frames are not real numbers.
   * - `"count"`: the underlying value is tweened over `duration`, so every
   *   frame shows a valid intermediate number. Digits snap per frame.
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

const FLOW_TIMING = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type FlowDirection = "up" | "down";

type FlowDigitProps = MotionPreferences & {
  digit: number;
  duration: number;
  direction: FlowDirection;
  isAnimated: boolean;
};

const containerStyle: CSSProperties = {
  display: "inline-block",
  position: "relative",
  verticalAlign: "top",
  lineHeight: 1
};

const currentStyle: CSSProperties = {
  display: "inline-block",
  willChange: "transform, opacity"
};

function FlowDigit(props: FlowDigitProps): ReactElement {
  const { digit, duration, direction, isAnimated, respectReducedMotion = true } = props;
  const containerRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const prevDigitRef = useRef(digit);
  const currentAnimRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const previous = prevDigitRef.current;

    if (previous === digit) {
      return;
    }

    prevDigitRef.current = digit;

    if (!isAnimated) {
      return;
    }

    if (respectReducedMotion && prefersReducedMotion()) {
      return;
    }

    const container = containerRef.current;
    const current = currentRef.current;

    if (!container || !current || typeof current.animate !== "function") {
      return;
    }

    currentAnimRef.current?.cancel();

    const ghostExitOffset = direction === "up" ? "-100%" : "100%";
    const incomingStartOffset = direction === "up" ? "100%" : "-100%";

    // Pin the new glyph to its starting position synchronously so the very
    // first paint shows it off-stage instead of momentarily centered.
    current.style.transform = `translateY(${incomingStartOffset})`;
    current.style.opacity = "0";

    const ghost = document.createElement("span");

    ghost.textContent = String(previous);
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.position = "absolute";
    ghost.style.left = "0";
    ghost.style.top = "0";
    ghost.style.right = "0";
    ghost.style.textAlign = "center";
    ghost.style.willChange = "transform, opacity";
    ghost.style.pointerEvents = "none";
    container.appendChild(ghost);

    const ghostAnimation = ghost.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: `translateY(${ghostExitOffset})`, opacity: 0 }
      ],
      { duration, easing: FLOW_TIMING, fill: "forwards" }
    );

    ghostAnimation.onfinish = () => {
      ghost.remove();
    };

    const currentAnimation = current.animate(
      [
        { transform: `translateY(${incomingStartOffset})`, opacity: 0 },
        { transform: "translateY(0)", opacity: 1 }
      ],
      { duration, easing: FLOW_TIMING, fill: "forwards" }
    );

    currentAnimRef.current = currentAnimation;

    currentAnimation.onfinish = () => {
      current.style.transform = "";
      current.style.opacity = "";

      if (currentAnimRef.current === currentAnimation) {
        currentAnimRef.current = null;
      }
    };
  }, [digit, direction, duration, isAnimated, respectReducedMotion]);

  return (
    <span ref={containerRef} style={containerStyle}>
      <span ref={currentRef} style={currentStyle}>
        {digit}
      </span>
    </span>
  );
}

type FlowReelDigitProps = {
  digitValue: number;
};

const reelContainerStyle: CSSProperties = {
  display: "inline-block",
  position: "relative",
  verticalAlign: "top",
  lineHeight: 1,
  height: "1em",
  overflow: "hidden"
};

const reelLowerStyle: CSSProperties = {
  display: "inline-block",
  height: "1em",
  lineHeight: 1
};

const reelUpperStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  right: 0,
  height: "1em",
  lineHeight: 1,
  textAlign: "center"
};

function FlowReelDigit(props: FlowReelDigitProps): ReactElement {
  const safeValue = Number.isFinite(props.digitValue) ? props.digitValue : 0;
  const lower = Math.floor(safeValue);
  const frac = safeValue - lower;
  const upper = (lower + 1) % 10;

  return (
    <span style={reelContainerStyle}>
      <span
        style={{
          ...reelLowerStyle,
          transform: `translateY(${(-frac * 100).toFixed(2)}%)`,
          opacity: 1 - frac
        }}
      >
        {lower}
      </span>
      {frac > 0 ? (
        <span
          style={{
            ...reelUpperStyle,
            transform: `translateY(${((1 - frac) * 100).toFixed(2)}%)`,
            opacity: frac
          }}
        >
          {upper}
        </span>
      ) : null}
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

    // Count mode only animates forward; decrements snap to the new target.
    if (target < valueRef.current) {
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

const EMPTY_VIEW_OPTIONS: UseInViewOptions = {};

const separatorSpanStyle: CSSProperties = { display: "inline-block" };

function renderReelChars(
  formatted: string,
  renderValue: number,
  effectiveDecimals: number
): ReactElement[] {
  const matches = formatted.match(/\d/g);
  const totalDigits = matches ? matches.length : 0;
  let digitIndex = 0;

  // eslint-disable-next-line @typescript-eslint/no-misused-spread -- formatted output is digits and ASCII separators only, no surrogate pairs
  return [...formatted].map((char, index) => {
    if (char >= "0" && char <= "9") {
      const place = totalDigits - digitIndex - 1 - effectiveDecimals;
      const positional = (Math.abs(renderValue) / Math.pow(10, place)) % 10;

      digitIndex++;

      return (
        <FlowReelDigit
          // eslint-disable-next-line react/no-array-index-key -- digit position is the stable identity
          key={index}
          digitValue={positional}
        />
      );
    }

    return (
      <span
        // eslint-disable-next-line react/no-array-index-key -- separator position is the stable identity
        key={index}
        style={separatorSpanStyle}
      >
        {char}
      </span>
    );
  });
}

function renderCrossfadeChars(
  formatted: string,
  duration: number,
  direction: FlowDirection,
  respectReducedMotion: boolean
): ReactElement[] {
  // eslint-disable-next-line @typescript-eslint/no-misused-spread -- formatted output is digits and ASCII separators only, no surrogate pairs
  return [...formatted].map((char, index) => {
    if (char >= "0" && char <= "9") {
      return (
        <FlowDigit
          // eslint-disable-next-line react/no-array-index-key -- digit position is the stable identity
          key={index}
          digit={Number(char)}
          duration={duration}
          direction={direction}
          isAnimated
          respectReducedMotion={respectReducedMotion}
        />
      );
    }

    return (
      <span
        // eslint-disable-next-line react/no-array-index-key -- separator position is the stable identity
        key={index}
        style={separatorSpanStyle}
      >
        {char}
      </span>
    );
  });
}

/**
 * Renders a number where each digit position is rendered in its own slot.
 * When a digit changes, the previous glyph slides upward and fades out while
 * the new glyph slides up from below and fades in. The slot has no overflow
 * clipping or mask gradient — the fading opacity hides the digits before
 * they reach the slot boundary.
 *
 * Set `mode="count"` to tween the underlying value over `duration` so every
 * animation frame shows a valid intermediate number; in that mode the per-
 * digit animation is disabled and only the value updates each frame.
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

  const previousTargetRef = useRef(effectiveTarget);
  const direction: FlowDirection =
    effectiveTarget < previousTargetRef.current ? "down" : "up";

  useEffect(() => {
    previousTargetRef.current = effectiveTarget;
  }, [effectiveTarget]);

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
  const formatted =
    isViewGated && !inView ? targetFormatted.replace(/\d/g, "0") : targetFormatted;

  const wrapperStyle: CSSProperties = {
    fontVariantNumeric: "tabular-nums",
    ...style
  };

  const children = isCountMode
    ? renderReelChars(formatted, renderValue, effectiveDecimals)
    : renderCrossfadeChars(formatted, duration, direction, respectReducedMotion);

  return (
    <span
      ref={isViewGated ? viewRef : undefined}
      className={className}
      style={wrapperStyle}
    >
      {prefix}
      {children}
      {suffix}
    </span>
  );
}
