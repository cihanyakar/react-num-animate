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
    respectReducedMotion: { control: "boolean" }
  },
  args: {
    value: 1234,
    duration: 600
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
          "Each digit position is rendered as a 0-9 reel; the visible digit slides through the column when the value changes. Pure CSS transforms, `font-variant-numeric: tabular-nums` for stable layout, native `IntersectionObserver` for viewport gating. No motion library."
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

function Playground(): React.ReactElement {
  const [value, setValue] = useState(1234);

  return (
    <div style={card}>
      <NumberFlow value={value} duration={600} separator="," style={display} />
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

export const Interactive: Story = {
  render: () => <Playground />,
  parameters: {
    docs: {
      description: {
        story:
          "Retarget the value with the buttons below. Only digit positions whose value changed move; everything else is static. `+1` shows that just the trailing digit slides — the rest of the columns stay put."
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
          Each digit reels into place when the block enters the viewport.
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
          "Animation gated on viewport entry through the `animateOnView` prop. While outside the viewport the digits are pinned to zero, so the layout is stable and the reveal animation has full headroom to play."
      }
    }
  },
  render: () => <ScrollRevealDemo />
};
