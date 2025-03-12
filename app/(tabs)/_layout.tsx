import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import '@/polyfills';

import { HapticTab } from '@/components/HapticTab';
import { useThemeStore } from '@/store/themeStore';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const { theme } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: theme === 'light' ? '#fff' : '#1e1b2e',
        tabBarInactiveBackgroundColor: theme === 'light' ? '#fff' : '#1e1b2e',
        tabBarActiveTintColor: theme === 'light' ? 'hsl(270.7, 91%, 65.1%)' : 'hsl(270.7, 91%, 65.1%)',
        tabBarInactiveTintColor: theme === 'light' ? '#666' : '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="HomeX"
        options={{
          title: 'HomeX',
          tabBarIcon: ({ color }) => <Ionicons name="mic" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
