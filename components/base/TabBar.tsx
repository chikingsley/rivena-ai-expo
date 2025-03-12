import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { TabButton } from './TabButton';
import { FloatingActionButton } from './FloatingActionButton';
import { cn } from '@/lib/utils';

interface TabBarProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Custom tab bar with a floating action button in the middle
 */
export function TabBar({ children, className }: TabBarProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className={cn(
        "flex-row items-center justify-between border-t",
        isDark ? "bg-background border-border" : "bg-white border-border/20",
        className
      )}
      style={{ 
        paddingBottom: insets.bottom || 10,
      }}
    >
      {/* Left side of the tab bar */}
      <View className="flex-1 flex-row">
        {children}
      </View>
      
      {/* Center floating action button */}
      <View className="absolute left-0 right-0 items-center">
        <FloatingActionButton />
      </View>
      
      {/* Right side of the tab bar */}
      <View className="flex-1 flex-row">
        {children}
      </View>
    </View>
  );
}
