import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  {
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "node_modules/**",
      "public/**",
      "source-assets/**",
      "cli/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "import/no-anonymous-default-export": "off",
      "react/display-name": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];
