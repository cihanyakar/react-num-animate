import type {
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode
} from "react";
import {
  formatWithIntl,
  formatWithSeparators,
  inferDecimals,
  type LocaleArg
} from "./format.js";
import {
  useAnimatedNumber,
  type UseAnimatedNumberOptions
} from "./useAnimatedNumber.js";
import { useInView, type UseInViewOptions } from "./useInView.js";

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
