// components/base/TabButton.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useThemeStore } from '@/store/themeStore';

// Define the type for Ionicons names
type IconName = React.ComponentProps<typeof Ionicons>['name'];

type TabButtonProps = {
  iconName: Omit<IconName, `${string}-outline`>; // Base name without -outline
  label: string;
  isFocused?: boolean;
};

export function TabButton({ iconName, label, isFocused = false }: TabButtonProps) {
  const { theme } = useThemeStore();

  // Properly type the icon name with TypeScript
  const outlineName = `${iconName}-outline` as IconName;
  const filledName = iconName as IconName;

  return (
    <View style={styles.tabItem}>
      <View style={[
        styles.iconContainer,
        { backgroundColor: isFocused ? Colors[theme].primary : 'transparent' }
      ]}>
        <Ionicons
          name={isFocused ? filledName : outlineName}
          size={20}
          color={isFocused ? Colors[theme].primary : Colors[theme].muted}
        />
      </View>
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
  );
}

const styles = StyleSheet.create({
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
  }
});