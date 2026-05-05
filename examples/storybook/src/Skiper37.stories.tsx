import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { AnimatedNumber } from "react-num-animate";

const display: React.CSSProperties = {
  fontSize: 96,
  fontWeight: 800,
  fontFamily: "system-ui, -apple-system, sans-serif",
  letterSpacing: "-0.04em",
  fontVariantNumeric: "tabular-nums"
};

const button: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: 14,
  fontFamily: "system-ui, sans-serif",
  border: "1px solid #d4d4d8",
  borderRadius: 8,
  background: "white",
  cursor: "pointer"
};

const card: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 24,
  padding: 32,
  borderRadius: 16,
  background: "#fafafa"
};

const meta: Meta = {
  title: "Skiper UI / Variant 37",
  parameters: {
    docs: {
      description: {
        component:
          "Equivalents of the four AnimatedNumber variants from skiper-ui/v1/skiper37, " +
          "rebuilt without framer-motion, @number-flow/react, or react-intersection-observer. " +
          "All animation, spring physics, and viewport detection use only React + the native " +
          "Web Animations and IntersectionObserver APIs."
      }
    }
  }
};

export default meta;

type Story = StoryObj;

function CountdownDemo(): React.ReactElement {
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running || seconds <= 0) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [running, seconds]);

  return (
    <div style={card}>
      <AnimatedNumber
        value={seconds}
        duration={400}
        easing="easeOutQuart"
        decimals={0}
        suffix="s"
        style={{ ...display, color: seconds <= 5 ? "#dc2626" : "#0a0a0a" }}
      />
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" style={button} onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          style={button}
          onClick={() => {
            setSeconds(60);
            setRunning(true);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export const Variant1Countdown: Story = {
  name: "001 — Countdown",
  render: () => <CountdownDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Replaces the framer-motion countdown with `setTimeout` plus the lib's easing-driven render. Pause/Resume controls the timer; the number itself is animated by react-num-animate."
      }
    }
  }
};

function SpringDemo(): React.ReactElement {
  const [target, setTarget] = useState(0);

  return (
    <div style={card}>
      <AnimatedNumber
        value={target}
        duration={1800}
        easing="spring"
        style={display}
      />
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          style={button}
          onClick={() => setTarget(Math.floor(Math.random() * 9000) + 1000)}
        >
          Animate
        </button>
        <button type="button" style={button} onClick={() => setTarget(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}

export const Variant2Spring: Story = {
  name: "002 — Spring",
  render: () => <SpringDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Spring-style overshoot from a simple under-damped easing function. No framer-motion, no spring solver — just `1 - e^(-ζωt) · cos(ω_d t)` evaluated per frame."
      }
    }
  }
};

function RandomDemo(): React.ReactElement {
  const [value, setValue] = useState(0);

  return (
    <div style={card}>
      <AnimatedNumber
        value={value}
        duration={1000}
        easing="easeOutCubic"
        separator=","
        style={display}
      />
      <button
        type="button"
        style={button}
        onClick={() => setValue(Math.floor(Math.random() * 1_000_000))}
      >
        Roll random
      </button>
    </div>
  );
}

export const Variant3Random: Story = {
  name: "003 — Random",
  render: () => <RandomDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Each click sets a new random target between 0 and 1,000,000. The animation always restarts smoothly from the currently displayed value, and integer targets render integer frames (no fractional bleed-through)."
      }
    }
  }
};

function ViewportDemo(): React.ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
        paddingBottom: 100
      }}
    >
      <div
        style={{
          height: 480,
          width: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #fafafa 0%, #e4e4e7 100%)",
          borderRadius: 16,
          color: "#71717a",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        Scroll down ↓
      </div>

      <div style={card}>
        <AnimatedNumber
          value={123_456}
          duration={2200}
          easing="easeOutExpo"
          separator=","
          animateOnView
          style={display}
        />
        <div
          style={{
            color: "#71717a",
            fontFamily: "system-ui, sans-serif",
            fontSize: 14
          }}
        >
          Counts up the first time it scrolls into view.
        </div>
      </div>

      <div
        style={{
          height: 200,
          width: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a1a1aa",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        end
      </div>
    </div>
  );
}

export const Variant4OnView: Story = {
  name: "004 — Animate on view",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Animation is gated on viewport entry via the native `IntersectionObserver` API exposed through the lib's `useInView` hook. Replaces both `react-intersection-observer` and `@number-flow/react` from the original demo."
      }
    }
  },
  render: () => <ViewportDemo />
};
