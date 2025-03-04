# Tamagui Style Properties Guide

## Current Issues in MessageBubble.tsx

There are several type errors in the MessageBubble component related to style properties:

1. XStack Property Issues:
   - `jc` (justifyContent)
   - `ai` (alignItems)
   - `fd` (flexDirection)

2. Color/Background Issues:
   - Invalid token format for backgroundColor using template literals
   - Invalid token format for borderColor (bc)

## Correct Usage According to Documentation

### Style Shorthands

Tamagui supports style shorthands, but they must be:
1. Explicitly defined in the `createTamagui` configuration
2. Declared with `as const` to ensure proper typing

Example of proper shorthand configuration:
```typescript
const shorthands = {
  ai: 'alignItems',
  jc: 'justifyContent',
  fd: 'flexDirection',
  bc: 'borderColor',
} as const
```

### Token Usage

When using tokens in Tamagui:

1. Direct Values:
   - Use `$` prefix for token values
   - Example: `backgroundColor="$blue2"` (not `` `$${themeColor}2` ``)

2. Theme Values:
   - Use `$` prefix for theme values
   - Example: `backgroundColor="$background"`

### Correct Property Format

Instead of:
```typescript
<XStack jc="flex-end" ai="flex-start" fd="row-reverse">
```

Should be:
```typescript
<XStack justifyContent="flex-end" alignItems="flex-start" flexDirection="row-reverse">
```

Or with properly configured shorthands:
```typescript
<XStack jc="flex-end" ai="flex-start" fd="row-reverse">
```

## Recommendations for MessageBubble.tsx

1. Either:
   - Use full property names instead of shorthands
   - Or ensure shorthands are properly configured in your Tamagui config

2. Fix token usage:
   - Replace dynamic template literals with proper token references
   - Use theme values where appropriate

3. For colors:
   - Use direct theme tokens: `backgroundColor="$background"`
   - Or use specific color tokens: `backgroundColor="$blue2"`

4. For layout properties:
   - Use full names unless shorthands are configured
   - Ensure values match expected token or valid CSS values

## Best Practices

1. Consistency:
   - Choose either shorthands or full names and stick to them
   - Document your choice in team style guide

2. Theme Usage:
   - Prefer theme tokens over direct color values
   - Use semantic naming for better maintainability

3. Configuration:
   - Keep a central source of truth for shorthands
   - Document any custom tokens or themes

4. Type Safety:
   - Use TypeScript's type checking to catch issues early
   - Configure `allowedStyleValues` in Tamagui config for stricter checking 