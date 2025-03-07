// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'react', 'react-hooks'],
  ignorePatterns: ['dist/**', 'references/**', 'node_modules/**', '.tamagui/**'],
  rules: {
    'prettier/prettier': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unstable-nested-components': 'warn'
  },
};
