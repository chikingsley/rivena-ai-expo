/**
 * App color definitions for light and dark themes.
 * These values match the CSS variables defined in global.css.
 */

export const Colors = {
  light: {
    // Base colors
    background: '#f2f3f3', // white
    foreground: '#11181C', // dark text

    // Card colors
    card: '#ffffff',
    cardFocus: '#ffffff',
    cardForeground: '#11181C',

    // Popover colors
    popover: '#ffffff',
    popoverForeground: '#11181C',
    shadow: '#000000', // shadow color for light theme

    // Text colors
    text: '#11181C',
    textmuted: '#a1a1aa',
    
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
    muted: '#404040', // slightly darker for better visibility on white
    mutedForeground: '#6b7280', // darker gray for better contrast
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: 'hsl(270.7, 91%, 65.1%)',
    
    // Tab navigation
    tabIconDefault: '#6b7280', // darker gray for better visibility
    tabIconSelected: 'hsl(270.7, 91%, 65.1%)',
  },
  dark: {
    // Base colors
    background: '#000000', // dark background
    foreground: '#f8f8f8', // light text

    // Text colors
    text: '#ffffff',  
    textmuted: '#a1a1aa',

    // Card colors
    card: '#121212',
    cardFocus: '#1f1f1f',
    cardForeground: '#f8f8f8',

    // Popover colors
    popover: '#27272a',
    popoverForeground: '#f8f8f8',
    shadow: '#000000', // shadow color for dark theme
    
    // Purple theme colors
    primary: 'hsl(270.7, 91%, 75%)', // dark purple
    primaryLight: 'transparent', // light purple
    primaryForeground: '#ffffff',
    
    // Gold theme colors
    accent: 'hsl(43.3, 96.4%, 56.3%)', // dark gold
    accentLight: 'hsl(48, 96.6%, 76.7%)', // light gold
    accentForeground: '#ffffff',
    
    // UI colors
    secondary: '#27272a',
    secondaryForeground: '#f8f8f8',
    muted: '#3f3f46', // slightly lighter for better visibility
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
