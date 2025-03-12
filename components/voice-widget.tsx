import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './text';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

interface VoiceWidgetProps {
  title?: string;
  isActive?: boolean;
  onPress: () => void;
  color?: string;
  textColor?: string;
  iconColor?: string;
}

export function VoiceWidget({
  title = "Try Special Meditation",
  isActive = false,
  onPress,
  color = '#007AFF',
  textColor = 'white',
  iconColor = 'white'
}: VoiceWidgetProps) {
  const pulse = useSharedValue(1);
  
  React.useEffect(() => {
    if (isActive) {
      pulse.value = withRepeat(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [isActive]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }]
    };
  });
  
  return (
    <Pressable onPress={onPress} className="w-full">
      <Animated.View 
        style={[animatedStyle, { backgroundColor: color }]}
        className="flex-row items-center justify-between px-5 py-3 rounded-full"
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
            <Ionicons name="mic" size={16} color={iconColor} />
          </View>
          <Text className="font-medium" style={{ color: textColor }}>
            {title}
          </Text>
        </View>
        
        <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center">
          <Text className="text-xs font-bold" style={{ color: textColor }}>→</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
