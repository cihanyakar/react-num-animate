import type {
  CSSProperties,
  ReactElement,
  ReactNode
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
  /** Per-digit transition duration in milliseconds (defaults to 600). */
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

const REEL_DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const REEL_TIMING = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type FlowDigitProps = MotionPreferences & {
  digit: number;
  duration: number;
};

const cellStyle: CSSProperties = {
  display: "block",
  height: "1em",
  lineHeight: 1
};

function FlowDigit(props: FlowDigitProps): ReactElement {
  const { digit, duration, respectReducedMotion = true } = props;
  const reduced = respectReducedMotion && prefersReducedMotion();

  const reelStyle: CSSProperties = {
    display: "block",
    transform: `translateY(${-digit}em)`,
    transition: reduced ? "none" : `transform ${duration}ms ${REEL_TIMING}`,
    willChange: "transform"
  };

  return (
    <span
      style={{
        display: "inline-block",
        height: "1em",
        lineHeight: 1,
        overflow: "hidden",
        verticalAlign: "top"
      }}
    >
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

const EMPTY_VIEW_OPTIONS: UseInViewOptions = {};

/**
 * Renders a number where each digit independently slides between cells of a
 * 0-9 reel when `value` changes. Pure CSS transforms drive the motion, with
 * the layout pinned by `font-variant-numeric: tabular-nums` so digits never
 * shift sideways. No third-party motion library, just React + CSS.
 */
export function NumberFlow(props: NumberFlowProps): ReactElement {
  const {
    value,
    duration = 600,
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
