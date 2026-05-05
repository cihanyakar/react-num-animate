# react-num-animate

[![npm version](https://img.shields.io/npm/v/react-num-animate.svg)](https://www.npmjs.com/package/react-num-animate)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-num-animate)](https://bundlephobia.com/package/react-num-animate)
[![types](https://img.shields.io/npm/types/react-num-animate.svg)](https://www.npmjs.com/package/react-num-animate)
[![license](https://img.shields.io/npm/l/react-num-animate.svg)](./LICENSE)

A lightweight, dependency-free React component and hook for smoothly animating numeric values. Comes with built-in easings, full `Intl.NumberFormat` support, custom formatters, render props, and respect for `prefers-reduced-motion`.

- Zero runtime dependencies (peer dependency on React only)
- ESM and CJS builds, full TypeScript types included
- ~2 KB minzipped
- Built on `requestAnimationFrame`, no timers
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
import { AnimatedNumber } from "react-num-animate";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <AnimatedNumber value={count} duration={1200} />
      <button onClick={() => setCount((c) => c + 1000)}>+1000</button>
    </div>
  );
}
```

## Examples

### Decimals, separators, prefix and suffix

```tsx
<AnimatedNumber
  value={1234567.89}
  decimals={2}
  separator=","
  decimalSeparator="."
  prefix="$"
  suffix=" USD"
/>
```

### Locale-aware formatting with `Intl.NumberFormat`

```tsx
<AnimatedNumber
  value={42500.5}
  locale="tr-TR"
  decimals={2}
/>

<AnimatedNumber
  value={1500}
  locale={{ style: "currency", currency: "EUR" }}
/>

<AnimatedNumber
  value={0.873}
  locale={["en-US", { style: "percent", minimumFractionDigits: 1 }]}
/>
```

### Custom formatter

```tsx
const compact = new Intl.NumberFormat("en", { notation: "compact" });

<AnimatedNumber
  value={1_250_000}
  format={(n) => compact.format(n)}
/>
```

### Render prop for custom markup

```tsx
<AnimatedNumber value={count}>
  {(formatted, raw) => (
    <span aria-label={`Total ${raw}`}>{formatted}</span>
  )}
</AnimatedNumber>
```

### Easing functions

```tsx
import { AnimatedNumber, easings } from "react-num-animate";

<AnimatedNumber value={value} easing="easeInOutCubic" />

<AnimatedNumber
  value={value}
  easing={(t) => 1 - Math.pow(1 - t, 5)}
/>
```

Built-in easings include `linear`, `easeIn/Out/InOutQuad`, `easeIn/Out/InOutCubic`, `easeIn/Out/InOutQuart`, `easeIn/Out/InOutExpo`.

### Hook for full control

```tsx
import { useAnimatedNumber } from "react-num-animate";

function Speedometer({ rpm }: { rpm: number }) {
  const animated = useAnimatedNumber(rpm, {
    duration: 600,
    easing: "easeOutQuart",
  });
  return <Gauge angle={animated * 0.36} />;
}
```

## API

### `<AnimatedNumber>`

| Prop                   | Type                                                     | Description                                                                |
| ---------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `value`                | `number`                                                 | Target value to animate towards. Required.                                 |
| `duration`             | `number`                                                 | Animation duration in milliseconds (defaults to `800`).                    |
| `easing`               | `EasingName \| (t: number) => number`                    | Easing function or built-in easing name (defaults to `"easeOutCubic"`).    |
| `animateOnMount`       | `boolean`                                                | Animate from `0` to the initial value on first render (defaults to false). |
| `respectReducedMotion` | `boolean`                                                | Snap to the target when reduced motion is requested (defaults to true).    |
| `decimals`             | `number`                                                 | Number of digits after the decimal point.                                  |
| `prefix`               | `ReactNode`                                              | Rendered before the formatted number.                                      |
| `suffix`               | `ReactNode`                                              | Rendered after the formatted number.                                       |
| `separator`            | `string`                                                 | Thousands separator. Ignored when `locale` or `format` is set.             |
| `decimalSeparator`     | `string`                                                 | Decimal separator. Ignored when `locale` or `format` is set.               |
| `locale`               | `true \| string \| Intl.NumberFormatOptions \| [l, opts]` | Use `Intl.NumberFormat` for formatting.                                    |
| `format`               | `(value: number) => string`                              | Custom formatter. Takes precedence over the other formatting props.        |
| `as`                   | `ElementType`                                            | Element type to render (defaults to `"span"`).                             |
| `className`            | `string`                                                 | Class name for the rendered element.                                       |
| `style`                | `CSSProperties`                                          | Inline styles for the rendered element.                                    |
| `ariaLive`             | `"off" \| "polite" \| "assertive"`                       | `aria-live` politeness (defaults to `"off"`).                              |
| `children`             | `(formatted, value) => ReactNode`                        | Render prop. When provided, `prefix` and `suffix` are ignored.             |
| `onUpdate`             | `(value: number) => void`                                | Called on every animation frame.                                           |
| `onComplete`           | `(value: number) => void`                                | Called when the animation reaches its target.                              |

### `useAnimatedNumber(target, options?)`

The hook that powers `<AnimatedNumber>`. Returns the current interpolated value.

```ts
function useAnimatedNumber(
  target: number,
  options?: UseAnimatedNumberOptions,
): number;
```

`UseAnimatedNumberOptions` includes `duration`, `easing`, `animateOnMount`, `respectReducedMotion`, `onUpdate`, and `onComplete` with the same semantics as the component props.

### `easings`

A record of built-in easing functions you can pass directly or by name.

```ts
import { easings } from "react-num-animate";

easings.easeInOutCubic(0.5); // 0.5
```

## Behavior

- When `value` changes during an animation, the new animation starts from the currently displayed value, so transitions stay smooth.
- Non-finite values (`NaN`, `Infinity`) are rendered as-is and skip the animation step.
- During SSR, the component renders the initial value with no animation.
- When `prefers-reduced-motion: reduce` is set and `respectReducedMotion` is `true`, transitions snap to the target value.

## License

MIT
