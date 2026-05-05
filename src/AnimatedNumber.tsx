import type {
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode
} from "react";
import {
  useAnimatedNumber,
  type UseAnimatedNumberOptions
} from "./useAnimatedNumber.js";
import { useInView, type UseInViewOptions } from "./useInView.js";

type LocaleArg =
  | true
  | string
  | Intl.NumberFormatOptions
  | [string | string[], Intl.NumberFormatOptions];

export type AnimatedNumberProps = {
  /** The target numeric value to animate towards. */
  value: number;
  /**
   * Digits after the decimal point. When omitted, the precision is inferred
   * from `value`, so an integer target renders integer frames during the
   * animation instead of bleeding through floating-point intermediates.
   */
  decimals?: number;
  /** Content rendered before the formatted number. */
  prefix?: ReactNode;
  /** Content rendered after the formatted number. */
  suffix?: ReactNode;
  /** Thousands separator (e.g. "," or "."). Ignored when `locale` or `format` is set. */
  separator?: string;
  /** Decimal separator (e.g. "." or ","). Ignored when `locale` or `format` is set. */
  decimalSeparator?: string;
  /**
   * Format with `Intl.NumberFormat`. Pass `true` for the runtime default locale,
   * a locale string, an options object, or a `[locales, options]` tuple.
   */
  locale?: LocaleArg;
  /** Custom formatter. Takes precedence over `decimals`, `separator`, and `locale`. */
  format?: (value: number) => string;
  /** Element type to render (defaults to `"span"`). */
  as?: ElementType;
  /** Class name passed through to the rendered element. */
  className?: string;
  /** Inline styles passed through to the rendered element. */
  style?: CSSProperties;
  /** `aria-live` politeness level (defaults to `"off"`). */
  ariaLive?: "off" | "polite" | "assertive";
  /**
   * Defer the animation until the element first enters the viewport. Pass
   * `true` for default options or an object to customise threshold/rootMargin.
   * Implemented with the native `IntersectionObserver` API (no third-party
   * dependency).
   */
  animateOnView?: boolean | UseInViewOptions;
  /**
   * Render prop that receives the formatted string and the current numeric value.
   * When provided, `prefix` and `suffix` are ignored.
   */
  children?: (formatted: string, value: number) => ReactNode;
} & UseAnimatedNumberOptions;

function inferDecimals(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const str = String(value);
  const dot = str.indexOf(".");

  return dot === -1 ? 0 : str.length - dot - 1;
}

function formatWithSeparators(
  value: number,
  decimals: number,
  separator: string | undefined,
  decimalSeparator: string | undefined
): string {
  if (!Number.isFinite(value)) {return String(value);}

  const fixed = value.toFixed(decimals);
  const dotIndex = fixed.indexOf(".");
  const intPart = dotIndex === -1 ? fixed : fixed.slice(0, dotIndex);
  const fracPart = dotIndex === -1 ? undefined : fixed.slice(dotIndex + 1);

  let intFormatted = intPart;

  if (separator) {
    const negative = intPart.startsWith("-");
    const digits = negative ? intPart.slice(1) : intPart;

    intFormatted =
      (negative ? "-" : "") +
      digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  if (fracPart === undefined) {return intFormatted;}

  return intFormatted + (decimalSeparator ?? ".") + fracPart;
}

function formatWithIntl(
  value: number,
  locale: LocaleArg,
  decimals: number
): string {
  let locales: string | string[] | undefined;
  let options: Intl.NumberFormatOptions = {};

  if (locale === true) {
    // use platform defaults
  } else if (typeof locale === "string") {
    locales = locale;
  } else if (Array.isArray(locale)) {
    locales = locale[0];
    options = { ...locale[1] };
  } else {
    options = { ...locale };
  }

  options.minimumFractionDigits = decimals;
  options.maximumFractionDigits = decimals;

  return new Intl.NumberFormat(locales, options).format(value);
}

const EMPTY_VIEW_OPTIONS: UseInViewOptions = {};

/**
 * React component that renders a numeric value with a smooth easing animation
 * whenever `value` changes. Built on top of {@link useAnimatedNumber} and the
 * native `IntersectionObserver` API.
 */
export function AnimatedNumber(props: AnimatedNumberProps): ReactElement {
  const {
    value,
    decimals,
    prefix,
    suffix,
    separator,
    decimalSeparator,
    locale,
    format,
    as,
    className,
    style,
    ariaLive = "off",
    children,
    duration,
    easing,
    animateOnMount,
    respectReducedMotion,
    animateOnView,
    onUpdate,
    onComplete
  } = props;

  const inViewOptions =
    typeof animateOnView === "object" ? animateOnView : EMPTY_VIEW_OPTIONS;
  const [viewRef, inView] = useInView(inViewOptions);

  const isViewGated = Boolean(animateOnView);
  const shouldAnimate = !isViewGated || inView;
  const targetValue = shouldAnimate ? value : 0;

  const current = useAnimatedNumber(targetValue, {
    duration,
    easing,
    animateOnMount,
    respectReducedMotion,
    onUpdate,
    onComplete
  });

  const effectiveDecimals = decimals ?? inferDecimals(value);

  const formatted = format
    ? format(current)
    : locale !== undefined
      ? formatWithIntl(current, locale, effectiveDecimals)
      : formatWithSeparators(current, effectiveDecimals, separator, decimalSeparator);

  const Component = as ?? "span";

  return (
    <Component
      ref={isViewGated ? viewRef : undefined}
      className={className}
      style={style}
      aria-live={ariaLive}
    >
      {children ? children(formatted, current) : (
        <>
          {prefix}
          {formatted}
          {suffix}
        </>
      )}
    </Component>
  );
}
