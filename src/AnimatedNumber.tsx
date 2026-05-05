import {
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  useAnimatedNumber,
  type UseAnimatedNumberOptions,
} from "./useAnimatedNumber.js";

type LocaleArg =
  | true
  | string
  | Intl.NumberFormatOptions
  | [string | string[], Intl.NumberFormatOptions];

export interface AnimatedNumberProps extends UseAnimatedNumberOptions {
  /** The target numeric value to animate towards. */
  value: number;
  /** Number of digits after the decimal point. */
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
   * Render prop that receives the formatted string and the current numeric value.
   * When provided, `prefix` and `suffix` are ignored.
   */
  children?: (formatted: string, value: number) => ReactNode;
}

function formatWithSeparators(
  value: number,
  decimals: number | undefined,
  separator: string | undefined,
  decimalSeparator: string | undefined,
): string {
  if (!Number.isFinite(value)) return String(value);

  const fixed = decimals !== undefined ? value.toFixed(decimals) : String(value);
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

  if (fracPart === undefined) return intFormatted;
  return intFormatted + (decimalSeparator ?? ".") + fracPart;
}

function formatWithIntl(
  value: number,
  locale: LocaleArg,
  decimals: number | undefined,
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

  if (decimals !== undefined) {
    options.minimumFractionDigits = decimals;
    options.maximumFractionDigits = decimals;
  }

  return new Intl.NumberFormat(locales, options).format(value);
}

/**
 * React component that renders a numeric value with a smooth easing animation
 * whenever `value` changes. Built on top of {@link useAnimatedNumber}.
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
    onUpdate,
    onComplete,
  } = props;

  const current = useAnimatedNumber(value, {
    duration,
    easing,
    animateOnMount,
    respectReducedMotion,
    onUpdate,
    onComplete,
  });

  const formatted = format
    ? format(current)
    : locale !== undefined
      ? formatWithIntl(current, locale, decimals)
      : formatWithSeparators(current, decimals, separator, decimalSeparator);

  const Component = (as ?? "span") as ElementType;

  return (
    <Component className={className} style={style} aria-live={ariaLive}>
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
