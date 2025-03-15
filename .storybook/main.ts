import type { StorybookConfig } from "@storybook/experimental-nextjs-vite";

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test"
  ],
  "framework": {
    "name": "@storybook/experimental-nextjs-vite",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  viteFinal: async (config) => {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        exclude: [
          '@storybook/addon-docs',
          '@storybook/blocks',
          '@storybook/preview-api'
        ]
      }
    };
  }
};

export default config;