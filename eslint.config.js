// Simple flat config that just handles ignores
// We'll rely on .eslintrc.js for the main configuration
export default [
    {
        ignores: ["**/references/**", "**/node_modules/**", "**/dist/**", "**/.tamagui/**"],
    }
];