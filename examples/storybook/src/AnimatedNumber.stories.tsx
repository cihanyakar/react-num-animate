import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { AnimatedNumber, easings } from "react-num-animate";

const meta: Meta<typeof AnimatedNumber> = {
  title: "AnimatedNumber",
  component: AnimatedNumber,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "number" } },
    duration: { control: { type: "number", min: 0, max: 5000, step: 100 } },
    decimals: { control: { type: "number", min: 0, max: 6, step: 1 } },
    easing: {
      control: { type: "select" },
      options: Object.keys(easings)
    },
    animateOnMount: { control: "boolean" },
    respectReducedMotion: { control: "boolean" }
  },
  args: {
    value: 1234,
    duration: 1200,
    easing: "easeOutCubic",
    animateOnMount: true,
    respectReducedMotion: true
  },
  decorators: [
    (Story) => (
      <div style={{ fontSize: 64, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof AnimatedNumber>;

export const Default: Story = {};

export const WithDecimals: Story = {
  args: {
    value: 1234567.89,
    decimals: 2,
    separator: ",",
    decimalSeparator: ".",
    prefix: "$",
    suffix: " USD"
  }
};

export const TurkishLocale: Story = {
  args: {
    value: 42500.5,
    decimals: 2,
    locale: "tr-TR",
    suffix: " ₺"
  }
};

export const EuroCurrency: Story = {
  args: {
    value: 1500,
    locale: { style: "currency", currency: "EUR" }
  }
};

export const Percentage: Story = {
  args: {
    value: 0.873,
    duration: 1500,
    locale: ["en-US", { style: "percent", minimumFractionDigits: 1 }]
  }
};

export const CompactNotation: Story = {
  args: {
    value: 1_250_000,
    duration: 1800,
    format: (n) => new Intl.NumberFormat("en", { notation: "compact" }).format(n)
  }
};

export const FastEaseInOutExpo: Story = {
  args: {
    value: 9999,
    duration: 1500,
    easing: "easeInOutExpo"
  }
};

export const RenderProp: Story = {
  args: {
    value: 4242
  },
  render: (args) => (
    <AnimatedNumber {...args}>
      {(formatted, raw) => (
        <span aria-label={`Total ${raw}`} style={{ color: "#1d4ed8" }}>
          [{formatted}]
        </span>
      )}
    </AnimatedNumber>
  )
};

function CounterDemo(): React.ReactElement {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <AnimatedNumber value={count} duration={1000} separator="," />
      <div style={{ display: "flex", gap: 12, fontSize: 16 }}>
        <button onClick={() => setCount((c) => c + 100)}>+100</button>
        <button onClick={() => setCount((c) => c + 1000)}>+1000</button>
        <button onClick={() => setCount((c) => c + 25000)}>+25000</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
    </div>
  );
}

export const InteractiveCounter: Story = {
  render: () => <CounterDemo />,
  parameters: {
    docs: {
      description: {
        story: "Click the buttons to retarget the animation. Each click restarts from the currently displayed value, so transitions stay smooth even when retargeting mid-animation."
      }
    }
  }
};

function LiveTickerDemo(): React.ReactElement {
  const [price, setPrice] = useState(98765.43);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPrice((p) => p + (Math.random() - 0.5) * 1000);
    }, 1500);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  return (
    <AnimatedNumber
      value={price}
      duration={1200}
      decimals={2}
      locale="en-US"
      prefix="$"
      easing="easeOutQuart"
    />
  );
}

export const LiveTicker: Story = {
  render: () => <LiveTickerDemo />,
  parameters: {
    docs: {
      description: {
        story: "Simulates a live price feed updating every 1.5 seconds. The animation duration is shorter than the update interval, so each value reaches its target before the next change."
      }
    }
  }
};
