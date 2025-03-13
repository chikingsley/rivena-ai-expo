import '@/global.css';

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { PortalHost } from '@rn-primitives/portal';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { useThemeStore, useInitializeTheme } from '@/store/themeStore';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    background: Colors.light.background,
    border: Colors.light.border,
    card: Colors.light.card,
    notification: Colors.light.destructive,
    primary: Colors.light.primary,
    text: Colors.light.foreground,
  },
};

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: {
    background: Colors.dark.background,
    border: Colors.dark.border,
    card: Colors.dark.card,
    notification: Colors.dark.destructive,
    primary: Colors.dark.primary,
    text: Colors.dark.foreground,
  },
};

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const [isThemeLoaded, setIsThemeLoaded] = React.useState(false);
  
  // Initialize theme from system preference
  useInitializeTheme();
  const { theme } = useThemeStore();
  const isDarkTheme = theme === 'dark';

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background');
    }
    setAndroidNavigationBar(isDarkTheme ? 'dark' : 'light');
    setIsThemeLoaded(true);
    hasMounted.current = true;
  }, [isDarkTheme]);

  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ConvexProvider client={convex}>
      <ThemeProvider value={isDarkTheme ? DARK_THEME : LIGHT_THEME}>
        <SafeAreaProvider>
          <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
          <Stack>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen name='(aux)' options={{ headerShown: false }} />
            <Stack.Screen name='(auth)' options={{ headerShown: false }} />
          </Stack>
          <PortalHost />
        </SafeAreaProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
