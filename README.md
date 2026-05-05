# react-num-animate

[![npm version](https://img.shields.io/npm/v/react-num-animate.svg)](https://www.npmjs.com/package/react-num-animate)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-num-animate)](https://bundlephobia.com/package/react-num-animate)
[![types](https://img.shields.io/npm/types/react-num-animate.svg)](https://www.npmjs.com/package/react-num-animate)
[![license](https://img.shields.io/npm/l/react-num-animate.svg)](./LICENSE)

A dependency-free React component that animates numbers one digit at a time. Each digit position is rendered as a 0-9 reel; when the value changes, the column slides to expose the new digit. Built on plain CSS transforms and the native `IntersectionObserver`, no motion library required.

- Zero runtime dependencies (peer dependency on React only)
- ESM and CJS builds, full TypeScript types included
- ~2 KB minzipped, animation driven entirely by CSS transitions
- `font-variant-numeric: tabular-nums` by default so the layout never shifts
- Native `IntersectionObserver` for viewport-gated reveals
- Full `Intl.NumberFormat` support (locales, currency, percent, compact, custom formatters)
- Respects `prefers-reduced-motion`
- SSR-safe

## Installation

```bash
npm install react-num-animate
```

```bash
pnpm add react-num-animate
```

```bash
yarn add react-num-animate
```

React 19+ is supported as a peer dependency.

## Quick start

```tsx
import { useState } from "react";
import { NumberFlow } from "react-num-animate";

export function Stat() {
  const [count, setCount] = useState(1234);
  return (
    <div>
      <NumberFlow value={count} separator="," />
      <button onClick={() => setCount(Math.floor(Math.random() * 1_000_000))}>
        Roll
      </button>
    </div>
  );
}
```

## Examples

### Decimals and separators

```tsx
<NumberFlow
  value={1234567.89}
  decimals={2}
  separator=","
  decimalSeparator="."
  prefix="$"
  suffix=" USD"
/>
```

`decimals` is inferred from `value` when omitted, so an integer target renders only integer digits.

### Locale-aware formatting

```tsx
<NumberFlow value={42500.5} locale="tr-TR" decimals={2} />

<NumberFlow value={1500} locale={{ style: "currency", currency: "EUR" }} />

<NumberFlow
  value={0.873}
  locale={["en-US", { style: "percent", minimumFractionDigits: 1 }]}
/>
```

### Custom formatter

```tsx
const compact = new Intl.NumberFormat("en", { notation: "compact" });

<NumberFlow value={1_250_000} format={(n) => compact.format(n)} />
```

### Reveal on scroll

```tsx
<NumberFlow value={123_456} duration={900} separator="," animateOnView />
```

While outside the viewport the digits are pinned to zero (so the layout stays stable). When the element first scrolls into view, every column slides to its target digit. Pass an options object to tune threshold or root margin.

```tsx
<NumberFlow
  value={500}
  animateOnView={{ threshold: 0.5, rootMargin: "-50px" }}
/>
```

### Standalone `useInView` hook

```tsx
import { useInView } from "react-num-animate";

function Card() {
  const [ref, inView] = useInView({ threshold: 0.5 });

  return (
    <section ref={ref}>
      {inView ? "visible" : "hidden"}
    </section>
  );
}
```

## API

### `<NumberFlow>`

| Prop                   | Type                                                     | Description                                                                |
| ---------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `value`                | `number`                                                 | Target value. Required.                                                    |
| `duration`             | `number`                                                 | Per-digit transition duration in milliseconds (defaults to `600`).         |
| `decimals`             | `number`                                                 | Digits after the decimal point. Inferred from `value` when omitted.        |
| `prefix`               | `ReactNode`                                              | Rendered before the digits (not animated).                                 |
| `suffix`               | `ReactNode`                                              | Rendered after the digits (not animated).                                  |
| `separator`            | `string`                                                 | Thousands separator. Ignored when `locale` or `format` is set.             |
| `decimalSeparator`     | `string`                                                 | Decimal separator. Ignored when `locale` or `format` is set.               |
| `locale`               | `true \| string \| Intl.NumberFormatOptions \| [l, opts]` | Use `Intl.NumberFormat` for formatting.                                    |
| `format`               | `(value: number) => string`                              | Custom formatter. Takes precedence over the other formatting props.        |
| `animateOnView`        | `boolean \| UseInViewOptions`                            | Defer the animation until the element enters the viewport.                 |
| `respectReducedMotion` | `boolean`                                                | Snap to the target without animation when reduced motion is set (defaults to `true`). |
| `className`            | `string`                                                 | Class name for the wrapper element.                                        |
| `style`                | `CSSProperties`                                          | Inline styles merged onto the wrapper element.                             |

### `useInView(options?)`

Native `IntersectionObserver` hook returning `[ref, inView]`. Powers `animateOnView` but is also exported for general use.

```ts
function useInView<T extends Element = HTMLElement>(
  options?: UseInViewOptions,
): [RefObject<T | null>, boolean];

type UseInViewOptions = {
  rootMargin?: string;            // "0px"
  threshold?: number | number[];  // 0.1
  once?: boolean;                 // true
};
```

## How it works

Each digit position is a `position: relative; overflow: hidden` cell that is exactly `1em` tall. Inside it, a stack of `<span>0</span><span>1</span>...<span>9</span>` is translated vertically with `transform: translateY(-Nem)` where `N` is the active digit. CSS handles the transition, so retargeting `value` is just a state change in React; there is no `requestAnimationFrame` loop and no JS work per frame.

Non-digit characters (separators, currency symbols, decimal points) are rendered as plain inline-blocks; only the digits move.

## License

MIT
