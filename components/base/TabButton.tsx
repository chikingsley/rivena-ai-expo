import React from 'react';
import { Pressable, View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { GestureResponderEvent } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
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
 * Custom tab button component for the bottom navigation with circular highlight when selected
 */
export function TabButton({ 
  icon, 
  label, 
  isFocused, 
  ...props 
}: TabButtonProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  
  // Get colors from our centralized color system
  const primaryColor = Colors[theme].primary;
  const primaryLightColor = Colors[theme].primaryLight;
  const mutedColor = Colors[theme].mutedForeground;
  
  // Animation value for press feedback
  const [pressAnim] = React.useState(new Animated.Value(1));
  
  const handlePress = () => {
    // Animated press feedback
    Animated.sequence([
      Animated.timing(pressAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Provide haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Call the original onPress handler
    if (props.onPress) {
      props.onPress();
    }
  };

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      style={[styles.container]}
      className={props.className}
    >
      <Animated.View style={[
        styles.content,
        {
          transform: [{ scale: pressAnim }]
        }
      ]}>
        {/* Circular background when focused */}
        {isFocused && (
          <View style={[
            styles.circleHighlight,
            { backgroundColor: primaryLightColor }
          ]} />
        )}
        
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={isFocused ? primaryColor : mutedColor} 
          style={styles.icon}
        />
        
        <Text 
          className={isFocused ? 'text-primary font-medium' : 'text-muted-foreground'}
          style={styles.label}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 60,
  },
  circleHighlight: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: -1,
    // Add shadow for neomorphic effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
  }
});
