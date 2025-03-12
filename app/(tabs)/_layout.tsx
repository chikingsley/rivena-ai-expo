import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import '@/polyfills';

import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { TabBar } from '@/components/base/TabBar';
import { TabButton } from '@/components/base/TabButton';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const { theme } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 80,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: Colors[theme].background,
          // Neomorphic shadow effect
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 16,
          // Add a slight inner shadow for the neomorphic effect
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderTopWidth: 0,
          paddingTop: 10,
          paddingHorizontal: 10
        },
        tabBarActiveTintColor: Colors[theme].primary,
        tabBarInactiveTintColor: Colors[theme].mutedForeground,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
