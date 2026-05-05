import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeAlias } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const aliasPath = path.resolve(dirname, "../../../src/index.ts");

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  typescript: {
    reactDocgen: "react-docgen-typescript"
  },
  async viteFinal(viteConfig) {
    const resolve = viteConfig.resolve ?? {};
    const alias = mergeAlias(resolve.alias, { "react-num-animate": aliasPath });

    return { ...viteConfig, resolve: { ...resolve, alias } };
  }
};

export default config;
