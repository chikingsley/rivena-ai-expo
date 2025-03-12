// app/(tabs)/_layout.tsx
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabButton } from '@/components/base/TabButton';
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
      
      {/* Navigation bar */}
      <TabList 
        asChild 
        style={{ display: 'none' }}
      >
        {/* These define the available routes but are hidden from view */}
        <View>
          <TabTrigger name="home" href="/home">
            <TabButton iconName="home" label="Home" routePath="/home" />
          </TabTrigger>
          <TabTrigger name="history" href="/history">
            <TabButton iconName="calendar" label="History" routePath="/history" />
          </TabTrigger>
          {/* <TabTrigger name="new-session" href="/new-session">
            <TabButton iconName="add" label="New Session" routePath="/new-session" />
          </TabTrigger> */}
          <TabTrigger name="insights" href="/insights">
            <TabButton iconName="stats-chart" label="Insights" routePath="/insights" />
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
          <TabTrigger name="new-session">
            <View 
              style={[styles.fab, { 
                backgroundColor: Colors[theme].primary,
                // Neomorphic shadow effect
                shadowColor: Colors[theme].shadow,
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
              }]}
            >
              <Ionicons name="add" size={24} color={Colors[theme].background} />
            </View>
          </TabTrigger>
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
          <TabTrigger name="home">
            <TabButton iconName="home" label="Home" routePath="/home" />
          </TabTrigger>
          
          <TabTrigger name="history">
            <TabButton iconName="calendar" label="History" routePath="/history" />
          </TabTrigger>
          
          {/* Empty space for FAB */}
          <View style={styles.fabSpace} />
          
          <TabTrigger name="insights">
            <TabButton iconName="stats-chart" label="Insights" routePath="/insights" />
          </TabTrigger>
          
          <TabTrigger name="profile">
            <TabButton iconName="person" label="Profile" routePath="/profile" />
          </TabTrigger>
        </View>
      </View>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navContainer: { 
    position: 'relative' 
  },
  fabContainer: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    top: -28, 
    alignItems: 'center', 
    zIndex: 1 
  },
  fab: { 
    width: 66, 
    height: 66, 
    borderRadius: 33, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
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
  },
  fabSpace: { 
    width: 56 
  }
});