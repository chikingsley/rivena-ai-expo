// components/base/TabButton.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useThemeStore } from '@/store/themeStore';
import { usePathname } from 'expo-router';

// Define the type for Ionicons names
type IconName = React.ComponentProps<typeof Ionicons>['name'];

type TabButtonProps = {
  iconName: Omit<IconName, `${string}-outline`>; // Base name without -outline
  label: string;
  routePath?: string; // The route path this tab navigates to
  isFocused?: boolean; // Optional override for testing
};

export function TabButton({ iconName, label, routePath, isFocused: forcedFocus }: TabButtonProps) {
  const pathname = usePathname();
  // Determine if this tab is focused based on the current path
  // Use forcedFocus if provided (for testing), otherwise check the route
  const isFocused = forcedFocus !== undefined ? forcedFocus : 
    routePath ? pathname === routePath || pathname.startsWith(routePath + '/') : false;
  const { theme } = useThemeStore();

  // Properly type the icon name with TypeScript
  const outlineName = `${iconName}-outline` as IconName;
  const filledName = iconName as IconName;

  return (
    <View style={styles.tabItem}>
      <View style={[
        styles.buttonContainer,
        { 
          backgroundColor: isFocused ? Colors[theme].primaryLight : 'transparent',
          borderColor: isFocused ? Colors[theme].primary : 'transparent',
          borderWidth: isFocused ? 1 : 0,
          // Ensure the button is properly sized
          width: '100%',
        }
      ]}>
        <Ionicons
          name={isFocused ? filledName : outlineName}
          size={20}
          color={isFocused ? Colors[theme].primary : Colors[theme].muted}
          style={styles.icon}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? Colors[theme].primary : Colors[theme].muted,
              fontWeight: isFocused ? '500' : 'normal'
            }
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
    minHeight: 48,
  },
  icon: {
    marginBottom: 4
  },
  tabLabel: {
    fontSize: 12
  }
});