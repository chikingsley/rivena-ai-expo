import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { TabButton } from './TabButton';
import { FloatingActionButton } from './FloatingActionButton';
import { cn } from '@/lib/utils';

interface TabBarProps {
  children?: React.ReactNode;
  className?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CURVE_HEIGHT = 15;
const ACTION_BUTTON_SIZE = 56;

/**
 * Custom tab bar with a floating action button in the middle and curved edges
 */
export function TabBar({ children, className }: TabBarProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  
  // Extract left and right children
  const childrenArray = React.Children.toArray(children);
  const leftChildren = childrenArray.slice(0, Math.ceil(childrenArray.length / 2));
  const rightChildren = childrenArray.slice(Math.ceil(childrenArray.length / 2));
  
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const borderColor = isDark ? Colors.dark.border : Colors.light.border + '33'; // 20% opacity
  
  return (
    <View style={[
      styles.container,
      {
        paddingBottom: insets.bottom || 10,
        backgroundColor: 'transparent',
      }
    ]} className={className}>
      {/* Main tab bar with curved top */}
      <View style={[
        styles.tabBar,
        {
          backgroundColor,
          borderTopColor: borderColor,
        }
      ]}>
        {/* Left side of the tab bar */}
        <View style={styles.tabSide}>
          {leftChildren}
        </View>
        
        {/* Gap for the floating action button */}
        <View style={styles.tabCenter} />
        
        {/* Right side of the tab bar */}
        <View style={styles.tabSide}>
          {rightChildren}
        </View>
      </View>
      
      {/* Center floating action button */}
      <View style={styles.actionButtonContainer}>
        <FloatingActionButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // Neomorphic shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
    // Add a slight inner shadow for the neomorphic effect
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  tabSide: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabCenter: {
    width: ACTION_BUTTON_SIZE + 20, // Add some padding around the button
  },
  actionButtonContainer: {
    position: 'absolute',
    top: -ACTION_BUTTON_SIZE / 2,
    left: SCREEN_WIDTH / 2 - ACTION_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Add shadow to the action button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
});
