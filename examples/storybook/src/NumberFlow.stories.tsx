import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { NumberFlow } from "react-num-animate";

const display: React.CSSProperties = {
  fontSize: 96,
  fontWeight: 800,
  fontFamily: "system-ui, -apple-system, sans-serif",
  letterSpacing: "-0.04em"
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

const meta: Meta<typeof NumberFlow> = {
  title: "NumberFlow",
  component: NumberFlow,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "number" } },
    duration: { control: { type: "number", min: 0, max: 3000, step: 50 } },
    decimals: { control: { type: "number", min: 0, max: 6, step: 1 } },
    mode: { control: { type: "radio" }, options: ["digits", "count"] },
    respectReducedMotion: { control: "boolean" }
  },
  args: {
    value: 1234,
    duration: 600,
    mode: "digits"
  },
  decorators: [
    (Story) => (
      <div style={display}>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Each digit position renders one in-flow glyph. When the value changes, a ghost holding the previous glyph is appended and animates upward (or downward, on a decrement) while the new glyph slides in from the opposite side. No clipping or fade gradient — both glyphs hit `opacity: 0` by the time they reach the slot boundary. Set `mode=\"count\"` to tween the underlying value so every frame shows a real intermediate number."
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof NumberFlow>;

export const Default: Story = {};

export const WithSeparator: Story = {
  args: {
    value: 1_234_567,
    separator: ","
  }
};

export const Currency: Story = {
  args: {
    value: 4299,
    decimals: 2,
    locale: { style: "currency", currency: "EUR" }
  }
};

export const TurkishLocale: Story = {
  args: {
    value: 125000.5,
    decimals: 2,
    locale: "tr-TR",
    suffix: " ₺"
  }
};

type PlaygroundProps = {
  mode: "digits" | "count";
  duration: number;
};

function Playground({ mode, duration }: PlaygroundProps): React.ReactElement {
  const [value, setValue] = useState(1234);

  return (
    <div style={card}>
      <NumberFlow
        value={value}
        duration={duration}
        mode={mode}
        separator=","
        style={display}
      />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          style={button}
          onClick={() => setValue(Math.floor(Math.random() * 1_000_000))}
        >
          Random
        </button>
        <button
          type="button"
          style={button}
          onClick={() => setValue((v) => v + 1)}
        >
          +1
        </button>
        <button
          type="button"
          style={button}
          onClick={() => setValue((v) => v + 100)}
        >
          +100
        </button>
        <button
          type="button"
          style={button}
          onClick={() => setValue((v) => v - 1)}
        >
          -1
        </button>
        <button
          type="button"
          style={button}
          onClick={() => setValue((v) => v - 100)}
        >
          -100
        </button>
        <button
          type="button"
          style={button}
          onClick={() => setValue((v) => v + 25_000)}
        >
          +25,000
        </button>
        <button type="button" style={button} onClick={() => setValue(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}

const playgroundArgTypes: Meta<typeof NumberFlow>["argTypes"] = {
  value: { table: { disable: true } },
  decimals: { table: { disable: true } },
  separator: { table: { disable: true } }
};

export const Interactive: Story = {
  args: {
    mode: "digits",
    duration: 600
  },
  argTypes: playgroundArgTypes,
  render: (args) => (
    <Playground mode={args.mode ?? "digits"} duration={args.duration ?? 600} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Buttons retarget the value through state. Each button click is a single transition; only the digit positions whose value changed animate. Toggle the `mode` control to compare the per-digit crossfade against the value tween in count mode."
      }
    }
  }
};

export const CountUp: Story = {
  args: {
    mode: "count",
    duration: 1500
  },
  argTypes: playgroundArgTypes,
  render: (args) => (
    <Playground mode={args.mode ?? "count"} duration={args.duration ?? 1500} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Same playground as `Interactive`, defaulting to `mode=\"count\"`. Every animation frame shows a valid intermediate number; the in-flight value is zero-padded to the target's digit count so the layout never shifts. Switch the `mode` control to `digits` to see the per-digit crossfade alternative."
      }
    }
  }
};

function ScrollRevealDemo(): React.ReactElement {
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
          background: "linear-gradient(180deg, #fafafa 0%, #e4e4e7 100%)",
          borderRadius: 16,
          color: "#71717a",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        Scroll down ↓
      </div>

      <div style={card}>
        <NumberFlow
          value={123_456}
          duration={900}
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
          Each digit slides into place when the block enters the viewport.
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

export const ScrollReveal: Story = {
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Animation gated on viewport entry through the `animateOnView` prop. While outside the viewport the digits are pinned to zero, so the layout is stable and the reveal has full headroom to play."
      }
    }
  },
  render: () => <ScrollRevealDemo />
};
