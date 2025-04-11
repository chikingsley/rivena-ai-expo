// app/(tabs)/_layout.tsx
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB, TabButton } from '@/components/base';
import '@/polyfills';

import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      {/* Main content area */}
      <TabSlot />

      {/* Navigation bar - hidden but defines routes */}
      <TabList
        asChild
        style={{ display: 'none' }}
      >
        {/* These define the available routes but are hidden from view */}
        <View>
          <TabTrigger name="home" href="/home">
            <TabButton iconName="home" label="Home" routePath="/home" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile">
          <TabButton iconName="person" label="Profile" routePath="/profile" />
          </TabTrigger>
        </View>
      </TabList>

      {/* Custom nav bar with cutout */}
      <View style={styles.navContainer}>
        {/* Floating action button */}
        <View style={styles.fabContainer}>
          <FAB iconName="add" />
        </View>

        {/* Nav bar container */}
        <View
          style={[styles.tabBar, {
            backgroundColor: Colors[theme].background,
            paddingBottom: insets.bottom || 16,
            borderTopColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            // Neomorphic shadow effect
            shadowColor: Colors[theme].shadow,
          }]}
        >
          {/* Home Tab */}
          <View style={styles.tabTrigger}>
            <TabTrigger name="home" style={{ width: '100%', height: '100%' }}>
              <View style={styles.tabItemWrapper}>
                <TabButton iconName="home" label="Home" routePath="/home" />
              </View>
            </TabTrigger>
          </View>

          {/* Profile Tab */}
          <View style={styles.tabTrigger}>
            <TabTrigger name="profile" style={{ width: '100%', height: '100%' }}>
              <View style={styles.tabItemWrapper}>
                <TabButton iconName="person" label="Profile" routePath="/profile" />
              </View>
            </TabTrigger>
          </View>
        </View>
      </View>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabTrigger: {
    flex: 1, // This makes the buttons take equal width
  },
  tabItemWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -28,
    alignItems: 'center',
    zIndex: 1
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
    width: '100%',
  },
});