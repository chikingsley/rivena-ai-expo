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
  withDelay,
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
  const isExpanded = useSharedValue(false);
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
    isExpanded.value = !isExpanded.value;

    // Animate rotation (0 to 45 degrees for + to x)
    rotation.value = withTiming(isExpanded.value ? 0 : 45, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // Animate circle scale
    scale.value = withTiming(isExpanded.value ? 0 : 1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const handleOptionPress = (type: string) => {
    // Close the menu
    isExpanded.value = false;
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

  // Add this with your other animated styles
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isExpanded.value ? 1 : 0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      // Make it non-interactive when hidden
      pointerEvents: isExpanded.value ? 'auto' : 'none',
    };
  });

  // Create a function to generate card animated styles
  const createCardAnimatedStyle = (index: number, rotationDeg: string) => {
    return useAnimatedStyle(() => {
      const delay = index * 50;

      return {
        transform: [
          {
            scale: withDelay(
              delay,
              withTiming(isExpanded.value ? 1 : 0, {
                duration: 300,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              })
            )
          },
          { rotate: rotationDeg }
        ],
      };
    });
  };

  return (
    <View style={styles.container}>
      {/* Background overlay */}
      <Animated.View
        style={[styles.overlay, overlayStyle]}
      >
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Session option cards */}
      <View style={styles.optionsContainer}>
        {sessionOptions.map((option, index) => {
          // Calculate position and shadow based on index
          let cardStyle = {};
          let shadowStyle = {};
          let cardAnimatedStyle;

          // Left card (index 0)
          if (index === 0) {
            cardStyle = {
              left: '12%',
              bottom: '90%', // Position directly above FAB
              zIndex: 1,
            };
            shadowStyle = {
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            };
            // Get animated style for this card with rotation
            cardAnimatedStyle = createCardAnimatedStyle(index, '5deg');
          }
          // Middle card (index 1) - positioned higher
          else if (index === 1) {
            cardStyle = {
              bottom: '100%', // Position directly above FAB, slightly higher
              marginLeft: -65, // Half of card width
              zIndex: 3,
            };
            shadowStyle = {
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            };
            // Get animated style for this card with rotation
            cardAnimatedStyle = createCardAnimatedStyle(index, '0deg');
          }
          // Right card (index 2)
          else if (index === 2) {
            cardStyle = {
              right: '12%',
              bottom: '90%', // Position directly above FAB
              zIndex: 2,
            };
            shadowStyle = {
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 5
            };
            // Get animated style for this card with rotation
            cardAnimatedStyle = createCardAnimatedStyle(index, '-5deg');
          }

          return (
            <AnimatedPressable
              key={option.type}
              style={[
                styles.optionCard,
                {
                  backgroundColor: Colors[theme].card,
                  borderColor: Colors[theme].border,
                  opacity: 1, // Ensure cards are fully opaque
                },
                cardStyle,
                shadowStyle,
                cardAnimatedStyle
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
  overlayTouchable: {
    width: '100%',
    height: '100%',
  },
  fabContainer: {
    width: 66,
    height: 66,
    bottom: 70,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
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
    width: 115, // Fixed width for each card
    height: 150, // Slightly reduced height for better positioning
    justifyContent: 'center',
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