/**
 * App color definitions for light and dark themes.
 * These values match the CSS variables defined in global.css.
 */

export const Colors = {
  light: {
    // Base colors
    background: '#ffffff', // white
    foreground: '#11181C', // dark text
    card: '#ffffff',
    cardForeground: '#11181C',
    popover: '#ffffff',
    popoverForeground: '#11181C',
    
    // Purple theme colors
    primary: 'hsl(270.7, 91%, 65.1%)', // dark purple
    primaryLight: 'hsl(268.6, 100%, 91.8%)', // light purple
    primaryForeground: '#ffffff',
    
    // Gold theme colors
    accent: 'hsl(43.3, 96.4%, 56.3%)', // dark gold
    accentLight: 'hsl(48, 96.6%, 76.7%)', // light gold
    accentForeground: '#ffffff',
    
    // UI colors
    secondary: '#f4f4f5',
    secondaryForeground: '#18181b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: 'hsl(270.7, 91%, 65.1%)',
    
    // Tab navigation
    tabIconDefault: '#71717a',
    tabIconSelected: 'hsl(270.7, 91%, 65.1%)',
  },
  dark: {
    // Base colors
    background: 'hsl(260, 15%, 10%)', // dark background
    foreground: '#f8f8f8', // light text
    card: '#27272a',
    cardForeground: '#f8f8f8',
    popover: '#27272a',
    popoverForeground: '#f8f8f8',
    
    // Purple theme colors
    primary: 'hsl(270.7, 91%, 65.1%)', // dark purple
    primaryLight: 'hsl(268.6, 100%, 91.8%)', // light purple
    primaryForeground: '#ffffff',
    
    // Gold theme colors
    accent: 'hsl(43.3, 96.4%, 56.3%)', // dark gold
    accentLight: 'hsl(48, 96.6%, 76.7%)', // light gold
    accentForeground: '#ffffff',
    
    // UI colors
    secondary: '#27272a',
    secondaryForeground: '#f8f8f8',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    destructive: '#ef4444',
    destructiveForeground: '#f8f8f8',
    border: '#27272a',
    input: '#27272a',
    ring: 'hsl(270.7, 91%, 65.1%)',
    
    // Tab navigation
    tabIconDefault: '#a1a1aa',
    tabIconSelected: 'hsl(270.7, 91%, 65.1%)',
  },
};
