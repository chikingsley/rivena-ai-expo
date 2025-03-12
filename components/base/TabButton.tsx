import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { GestureResponderEvent } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

// Modify the TabTriggerSlotProps interface to include our custom properties
export interface TabButtonProps {
  icon: string;
  label: string;
  isFocused?: boolean;
  onPress?: () => void;
  className?: string;
}

/**
 * Custom tab button component for the bottom navigation
 */
export function TabButton({ 
  icon, 
  label, 
  isFocused, 
  ...props 
}: TabButtonProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const handlePress = () => {
    // Provide haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Call the original onPress handler
    if (props.onPress) {
      // The TabTrigger component expects this function to be called without arguments
      props.onPress();
    }
  };

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      className={`flex-1 items-center justify-center py-2 ${isDark ? 'bg-background' : 'bg-white'}`}
    >
      <View className="items-center">
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={isFocused ? '#7C3AED' : isDark ? '#888888' : '#666666'} 
        />
        <Text 
          className={`mt-1 text-xs ${isFocused ? 'text-primary font-medium' : 'text-muted-foreground'}`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
