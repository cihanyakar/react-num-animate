export type LocaleArg =
  | true
  | string
  | Intl.NumberFormatOptions
  | [string | string[], Intl.NumberFormatOptions];

export function inferDecimals(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const str = String(value);
  const dot = str.indexOf(".");

  return dot === -1 ? 0 : str.length - dot - 1;
}

export function formatWithSeparators(
  value: number,
  decimals: number,
  separator: string | undefined,
  decimalSeparator: string | undefined
): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }

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

  if (fracPart === undefined) {
    return intFormatted;
  }

  return intFormatted + (decimalSeparator ?? ".") + fracPart;
}

export function formatWithIntl(
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
