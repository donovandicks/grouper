export default {
  "**/*.ts?(x)": () => [
    "bun x prettier --check",
    "bun x eslint",
    "tsc -p tsconfig.json --noEmit",
  ]
};
