import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import React from 'react';

/**
 * Theme store for managing app theme settings
 */
interface ThemeState {
  // State
  theme: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
  useSystemTheme: boolean;
  
  // Methods
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setUseSystemTheme: (use: boolean) => void;
  updateSystemPreference: (preference: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  // Initial state
  theme: 'light',
  systemPreference: 'light',
  useSystemTheme: true,
  
  // Methods
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  setUseSystemTheme: (use: boolean) => set((state) => ({
    useSystemTheme: use,
    // If enabling system theme, update theme to match system preference
    ...(use && { theme: state.systemPreference })
  })),
  
  updateSystemPreference: (preference: 'light' | 'dark') => set((state) => ({
    systemPreference: preference,
    // Only update theme if using system theme
    ...(state.useSystemTheme && { theme: preference })
  })),
}));

/**
 * Hook to initialize and sync system theme preference
 */
export const useInitializeTheme = () => {
  const colorScheme = useColorScheme();
  const { updateSystemPreference } = useThemeStore();
  
  // Update system preference when color scheme changes
  React.useEffect(() => {
    if (colorScheme) {
      updateSystemPreference(colorScheme);
    }
  }, [colorScheme, updateSystemPreference]);
};
