import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  size?: number;
  icon?: string;
  href?: string;
  className?: string;
  onPress?: () => void;
}

/**
 * Floating action button component for the center of the tab bar
 */
export function FloatingActionButton({
  size = 56,
  icon = 'mic',
  href = '/newVoice',
  className,
  onPress,
}: FloatingActionButtonProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const router = useRouter();

  const handlePress = () => {
    // Provide haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate to the specified route
    if (href) {
      router.push(href as any);
    }
    
    // Call custom onPress handler if provided
    if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        "items-center justify-center rounded-full shadow-lg",
        isDark ? "bg-primary shadow-black/30" : "bg-primary shadow-primary/30",
        className
      )}
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ translateY: -size / 3 }],
        },
      ]}
    >
      <Ionicons name={icon as any} size={size / 2} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
