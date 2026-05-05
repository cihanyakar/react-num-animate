import {
  useEffect,
  useRef,
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

export type NumberFlowProps = MotionPreferences & {
  /** The numeric value to display. Each digit animates when this prop changes. */
  value: number;
  /** Per-digit animation duration in milliseconds (defaults to 500). */
  duration?: number;
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

const FLOW_TIMING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type FlowCharProps = MotionPreferences & {
  char: string;
  duration: number;
};

function FlowChar(props: FlowCharProps): ReactElement {
  const { char, duration, respectReducedMotion = true } = props;
  const elementRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const prevCharRef = useRef(char);

  useEffect(() => {
    const previous = prevCharRef.current;

    if (previous === char) {
      return;
    }

    prevCharRef.current = char;

    if (respectReducedMotion && prefersReducedMotion()) {
      return;
    }

    const current = elementRef.current;
    const container = containerRef.current;

    if (!current || !container || typeof current.animate !== "function") {
      return;
    }

    const ghost = document.createElement("span");

    ghost.textContent = previous;
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.position = "absolute";
    ghost.style.left = "0";
    ghost.style.top = "0";
    ghost.style.right = "0";
    ghost.style.display = "inline-block";
    ghost.style.willChange = "transform, opacity";
    container.appendChild(ghost);

    const ghostAnimation = ghost.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: "translateY(-100%)", opacity: 0 }
      ],
      { duration, easing: FLOW_TIMING, fill: "forwards" }
    );

    ghostAnimation.onfinish = () => {
      ghost.remove();
    };

    current.animate(
      [
        { transform: "translateY(100%)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 }
      ],
      { duration, easing: FLOW_TIMING }
    );
  }, [char, duration, respectReducedMotion]);

  const isDigit = char >= "0" && char <= "9";

  const containerStyle: CSSProperties = {
    position: "relative",
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "top",
    minWidth: isDigit ? "0.6em" : undefined,
    textAlign: "center"
  };

  return (
    <span ref={containerRef} style={containerStyle}>
      <span
        ref={elementRef}
        style={{ display: "inline-block", willChange: "transform, opacity" }}
      >
        {char}
      </span>
    </span>
  );
}

const EMPTY_VIEW_OPTIONS: UseInViewOptions = {};

/**
 * Animates each digit of a number independently with a vertical fade
 * transition. Old digits slide up and fade out while new digits slide
 * up from below and fade in. Uses only the Web Animations API and the
 * native `IntersectionObserver`, no third-party motion library.
 */
export function NumberFlow(props: NumberFlowProps): ReactElement {
  const {
    value,
    duration = 500,
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

  const effectiveDecimals = decimals ?? inferDecimals(value);

  const targetFormatted = format
    ? format(value)
    : locale !== undefined
      ? formatWithIntl(value, locale, effectiveDecimals)
      : formatWithSeparators(value, effectiveDecimals, separator, decimalSeparator);

  const formatted = shouldDisplay
    ? targetFormatted
    : targetFormatted.replace(/\d/g, "0");

  return (
    <span
      ref={isViewGated ? viewRef : undefined}
      className={className}
      style={style}
    >
      {prefix}
      {/* eslint-disable-next-line @typescript-eslint/no-misused-spread -- formatted output is digits and ASCII separators only, no surrogate pairs */}
      {[...formatted].map((char, index) => (
        <FlowChar
          // eslint-disable-next-line react/no-array-index-key -- digit position is the stable identity
          key={index}
          char={char}
          duration={duration}
          respectReducedMotion={respectReducedMotion}
        />
      ))}
      {suffix}
    </span>
  );
}
