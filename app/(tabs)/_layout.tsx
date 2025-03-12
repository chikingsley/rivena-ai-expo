import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
          <TabTrigger name="home" href="/">
            <Text>Home</Text>
          </TabTrigger>
          <TabTrigger name="history" href="/history">
            <Text>History</Text>
          </TabTrigger>
          <TabTrigger name="new-session" href="/new-session">
            <Text>New Session</Text>
          </TabTrigger>
          <TabTrigger name="insights" href="/insights">
            <Text>Insights</Text>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile">
            <Text>Profile</Text>
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
            <View style={styles.tabItem}>
              <View style={[styles.iconContainer, { backgroundColor: Colors[theme].primaryLight }]}>
                <Ionicons name="home-outline" size={20} color={Colors[theme].primary} />
              </View>
              <Text style={[styles.tabLabel, { color: Colors[theme].primary, fontWeight: '500' }]}>Home</Text>
            </View>
          </TabTrigger>
          
          <TabTrigger name="history">
            <View style={styles.tabItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={20} color={Colors[theme].muted} />
              </View>
              <Text style={[styles.tabLabel, { color: Colors[theme].muted }]}>History</Text>
            </View>
          </TabTrigger>
          
          {/* Empty space for FAB */}
          <View style={styles.fabSpace} />
          
          <TabTrigger name="insights">
            <View style={styles.tabItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="stats-chart-outline" size={20} color={Colors[theme].muted} />
              </View>
              <Text style={[styles.tabLabel, { color: Colors[theme].muted }]}>Insights</Text>
            </View>
          </TabTrigger>
          
          <TabTrigger name="profile">
            <View style={styles.tabItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color={Colors[theme].muted} />
              </View>
              <Text style={[styles.tabLabel, { color: Colors[theme].muted }]}>Profile</Text>
            </View>
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
    width: 56, 
    height: 56, 
    borderRadius: 28, 
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
  tabItem: { 
    alignItems: 'center' 
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: { 
    fontSize: 12, 
    marginTop: 4 
  },
  fabSpace: { 
    width: 56 
  }
});