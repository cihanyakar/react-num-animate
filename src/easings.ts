export type Easing = (t: number) => number;

const { pow, sin, cos, exp, sqrt, PI } = Math;

const backC1 = 1.70158;
const backC3 = backC1 + 1;
const elasticC4 = (2 * PI) / 3;
const bounceN = 7.5625;
const bounceD = 2.75;

const springOmega = 8;
const springZeta = 0.4;
const springOmegaD = springOmega * sqrt(1 - springZeta * springZeta);

function bounceOut(t: number): number {
  if (t < 1 / bounceD) {
    return bounceN * t * t;
  }

  if (t < 2 / bounceD) {
    const a = t - 1.5 / bounceD;

    return bounceN * a * a + 0.75;
  }

  if (t < 2.5 / bounceD) {
    const a = t - 2.25 / bounceD;

    return bounceN * a * a + 0.9375;
  }

  const a = t - 2.625 / bounceD;

  return bounceN * a * a + 0.984375;
}

export const easings = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2),
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - pow(1 - t, 4),
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - pow(-2 * t + 2, 4) / 2),
  easeInExpo: (t) => (t === 0 ? 0 : pow(2, 10 * t - 10)),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) {
      return 0;
    }

    if (t === 1) {
      return 1;
    }

    return t < 0.5 ? pow(2, 20 * t - 10) / 2 : (2 - pow(2, -20 * t + 10)) / 2;
  },
  easeInBack: (t) => backC3 * t * t * t - backC1 * t * t,
  easeOutBack: (t) => 1 + backC3 * pow(t - 1, 3) + backC1 * pow(t - 1, 2),
  easeInOutBack: (t) => {
    const c2 = backC1 * 1.525;

    return t < 0.5
      ? (pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeOutElastic: (t) => {
    if (t === 0) {
      return 0;
    }

    if (t === 1) {
      return 1;
    }

    return pow(2, -10 * t) * sin((t * 10 - 0.75) * elasticC4) + 1;
  },
  easeOutBounce: bounceOut,
  spring: (t) => {
    if (t === 0) {
      return 0;
    }

    if (t === 1) {
      return 1;
    }

    return 1 - exp(-springZeta * springOmega * t) * cos(springOmegaD * t);
  }
} as const satisfies Record<string, Easing>;

export type EasingName = keyof typeof easings;
