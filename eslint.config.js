// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'convex/_generated/*'],
    rules: {
      // TypeScript (tsc --noEmit) resolves the @/ path aliases; the import plugin cannot.
      'import/no-unresolved': 'off',
    },
  },
]);
