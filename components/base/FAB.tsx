// components/base/FAB.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TouchableWithoutFeedback } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { useThemeStore } from '@/store/themeStore';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';

// Define the type for Ionicons names
type IconName = React.ComponentProps<typeof Ionicons>['name'];

type SessionOption = {
  title: string;
  icon: string;
  type: 'casual' | 'deep' | 'reflection';
};

type FABProps = {
  iconName: Omit<IconName, `${string}-outline`>; // Base name without -outline
  routePath?: string;
};

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FAB({ iconName }: FABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useThemeStore();
  
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  
  // Session options
  const sessionOptions: SessionOption[] = [
    { title: 'Casual Chat', icon: 'chatbubble', type: 'casual' },
    { title: 'Deep Session', icon: 'fitness', type: 'deep' },
    { title: 'Reflection Mode', icon: 'moon', type: 'reflection' },
  ];

  const handlePress = () => {
    // Toggle expanded state
    setIsExpanded(!isExpanded);
    
    // Animate rotation (0 to 45 degrees for + to x)
    rotation.value = withTiming(isExpanded ? 0 : 45, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Animate circle scale
    scale.value = withTiming(isExpanded ? 0 : 1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const handleOptionPress = (type: string) => {
    // Close the menu
    setIsExpanded(false);
    rotation.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0, { duration: 300 });
    
    // Navigate to the session with the selected type
    router.push({
      pathname: '/sessions/[id]',
      params: { id: 'new', type }
    });
  };

  // Animated styles for the icon rotation
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // Animated styles for the expanding circle
  const circleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: interpolate(scale.value, [0, 0.5, 1], [0, 0.7, 1]),
    };
  });

  return (
    <View style={styles.container}>
      {/* Background overlay when expanded */}
      {isExpanded && (
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      
      {/* Expanding circle */}
      <Animated.View 
        style={[
          styles.expandingCircle, 
          circleStyle,
          { backgroundColor: Colors[theme].background }
        ]} 
      >
        {/* Session option cards */}
        {isExpanded && (
          <View style={styles.optionsContainer}>
            {sessionOptions.map((option, index) => {
              // Calculate position and shadow based on index
              let cardStyle = {};
              let shadowStyle = {};
              
              // Left card (index 0)
              if (index === 0) {
                cardStyle = {
                  left: '20%',
                  bottom: '20%',
                  zIndex: 1,
                  transform: [{ rotate: '-5deg' }]
                };
                shadowStyle = {
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                };
              }
              // Middle card (index 1) - positioned higher
              else if (index === 1) {
                cardStyle = {
                  left: '50%',
                  bottom: '30%',
                  marginLeft: -65, // Half of card width
                  zIndex: 3,
                  transform: [{ rotate: '0deg' }]
                };
                shadowStyle = {
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8
                };
              }
              // Right card (index 2)
              else if (index === 2) {
                cardStyle = {
                  right: '20%',
                  bottom: '20%',
                  zIndex: 2,
                  transform: [{ rotate: '5deg' }]
                };
                shadowStyle = {
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 5
                };
              }
              
              return (
                <AnimatedPressable
                  key={option.type}
                  style={[
                    styles.optionCard,
                    { 
                      backgroundColor: Colors[theme].card,
                      borderColor: Colors[theme].border,
                    },
                    cardStyle,
                    shadowStyle
                  ]}
                  onPress={() => handleOptionPress(option.type)}
                >
                  <Ionicons 
                    name={option.icon as IconName} 
                    size={32} 
                    color={Colors[theme].primary} 
                  />
                  <Animated.Text 
                    style={[
                      styles.optionText,
                      { color: Colors[theme].text }
                    ]}
                  >
                    {option.title}
                  </Animated.Text>
                </AnimatedPressable>
              );
            })}
          </View>
        )}
      </Animated.View>
      
      {/* Main FAB button */}
      <Pressable
        style={[
          styles.fabContainer,
          { 
            backgroundColor: Colors[theme].FAB,
            borderColor: Colors[theme].FABBorder,
            zIndex: 10,
          }
        ]}
        onPress={handlePress}
      >
        <AnimatedIcon
          name={iconName as IconName}
          size={24}
          color={theme === 'dark' ? 'white' : 'white'}
          style={iconStyle}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  fabContainer: {
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
  expandingCircle: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  optionsContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: 130, // Fixed width for each card
    height: 150, // Fixed height for each card
    justifyContent: 'center',
    marginBottom: 200,
    position: 'absolute',
    // Shadow will be applied dynamically based on card position
  },
  optionText: {
    marginTop: 8, // Changed from marginLeft to marginTop
    fontSize: 16, // Smaller font size to fit in card
    fontWeight: '500',
    textAlign: 'center',
  }
});