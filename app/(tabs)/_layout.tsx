// app/(tabs)/_layout.tsx
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabButton } from '@/components/base/TabButton';
import '@/polyfills';

import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export default function TabLayout() {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  // Define tab names as a type for type safety
  type TabName = 'home' | 'history' | 'insights' | 'profile';
  
  // Store tab measurements
  type TabMeasurement = { x: number; width: number; measured: boolean };
  const tabMeasurements = useRef<Record<TabName, TabMeasurement>>({
    home: { x: 0, width: 0, measured: false },
    history: { x: 0, width: 0, measured: false },
    insights: { x: 0, width: 0, measured: false },
    profile: { x: 0, width: 0, measured: false }
  }).current;
  
  // Animated values for the indicator
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(60); // Default width to avoid zero-width indicator
  
  // Get the current active tab name
  const getActiveTabName = (): TabName => {
    const route = pathname?.split('/')[1] || 'home';
    return (route as TabName);
  };
  
  // Measure tab positions
  const measureTab = (tabName: TabName, event: LayoutChangeEvent) => {
    if (!event?.nativeEvent) return;
    
    const { x, width } = event.nativeEvent.layout;
    
    // Store measurements
    tabMeasurements[tabName] = { x, width, measured: true };
    console.log(`Measured tab ${tabName}: x=${x}, width=${width}`);
    
    // If this is the active tab, update the indicator position immediately
    if (tabName === getActiveTabName()) {
      // Set values directly without animation for initial position
      indicatorX.value = x;
      indicatorWidth.value = width;
      console.log(`Set active tab ${tabName} indicator: x=${x}, width=${width}`);
      
      // Also trigger animation to ensure it's visible
      animateToActiveTab();
    }
  };
  
  // Animate the indicator to the active tab
  const animateToActiveTab = () => {
    const activeTabName = getActiveTabName();
    const activeTab = tabMeasurements[activeTabName];
    
    if (activeTab?.measured) {
      console.log(`Animating to tab ${activeTabName}: x=${activeTab.x}, width=${activeTab.width}`);
      
      // Use withSpring for smooth animation
      indicatorX.value = withSpring(activeTab.x, {
        damping: 20,
        stiffness: 300,
        mass: 1,
        overshootClamping: false,
      });
      
      indicatorWidth.value = withSpring(activeTab.width, {
        damping: 20,
        stiffness: 300,
        mass: 1,
        overshootClamping: false,
      });
    } else {
      console.log(`Tab ${activeTabName} not measured yet`); 
    }
  };
  
  // Update indicator when route changes
  useEffect(() => {
    console.log(`Route changed to: ${pathname}`);
    // Use a small timeout to ensure measurements are complete
    setTimeout(() => {
      animateToActiveTab();
    }, 50);
  }, [pathname]);
  
  // Run initial animation after a short delay to ensure measurements are complete
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Initial animation timeout fired');
      animateToActiveTab();
    }, 500); // Longer timeout for initial load
    
    return () => clearTimeout(timer);
  }, []);
  
  // // Animated style for the indicator
  // const indicatorStyle = useAnimatedStyle(() => {
  //   'worklet';
  //   return {
  //     position: 'absolute',
  //     left: 0,
  //     width: indicatorWidth.value,
  //     transform: [{ translateX: indicatorX.value }],
  //     height: 56, // Match the minHeight in TabButton
  //     borderRadius: 12,
  //     backgroundColor: Colors[theme].primaryLight,
  //     borderColor: Colors[theme].primary,
  //     borderWidth: 1,
  //     // Position the indicator behind the buttons
  //     top: 24, // Adjust to align with tab buttons
  //     zIndex: -1, // Ensure it stays behind the content
  //   };
  // });

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
          {/* Animated indicator that moves between tabs */}
          {/* <Animated.View style={indicatorStyle} /> */}
          <View style={styles.tabTrigger} onLayout={(e) => measureTab('home', e)}>
            <TabTrigger name="home" style={{width: '100%', height: '100%'}}>
              <View style={styles.tabItemWrapper}>
                <TabButton iconName="home" label="Home" routePath="/home" />
              </View>
            </TabTrigger>
          </View>
          
          <View style={styles.tabTrigger} onLayout={(e) => measureTab('history', e)}>
            <TabTrigger name="history" style={{width: '100%', height: '100%'}}>
              <View style={styles.tabItemWrapper}>
                <TabButton iconName="calendar" label="History" routePath="/history" />
              </View>
            </TabTrigger>
          </View>
          
          {/* Empty space for FAB */}
          <View style={styles.fabSpace} />
          
          <View style={styles.tabTrigger} onLayout={(e) => measureTab('insights', e)}>
            <TabTrigger name="insights" style={{width: '100%', height: '100%'}}>
              <View style={styles.tabItemWrapper}>
                <TabButton iconName="stats-chart" label="Insights" routePath="/insights" />
              </View>
            </TabTrigger>
          </View>
          
          <View style={styles.tabTrigger} onLayout={(e) => measureTab('profile', e)}>
            <TabTrigger name="profile" style={{width: '100%', height: '100%'}}>
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
    width: '100%',
  },
  fabSpace: { 
    width: 56 
  }
});