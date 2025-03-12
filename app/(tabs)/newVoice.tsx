import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
  runOnJS
} from 'react-native-reanimated';

export default function NewVoiceScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState('idle'); // 'idle', 'userSpeaking', 'aiSpeaking'
  const [voiceIntensity, setVoiceIntensity] = useState(1);
  
  // Base size for the main circle (in pixels)
  const baseSize = 128;
  
  // Animation values
  const mainScale = useSharedValue(1);
  const ring1Scale = useSharedValue(1.1);
  const ring2Scale = useSharedValue(1.2);
  // Removed ring3Scale
  const solid1Scale = useSharedValue(1.15);
  
  // Opacity values for AI speaking animations
  const ring1Opacity = useSharedValue(0);
  const ring2Opacity = useSharedValue(0);
  // Removed ring3Opacity
  const solid1Opacity = useSharedValue(0);
  
  // Reference for voice simulation timer
  const voiceSimulationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to cycle through states
  const cycleState = () => {
    setState(prevState => {
      if (prevState === 'idle') return 'userSpeaking';
      if (prevState === 'userSpeaking') return 'aiSpeaking';
      return 'idle';
    });
  };
  
  // Update animations based on state
  useEffect(() => {
    // Cancel any ongoing animations
    cancelAnimation(mainScale);
    
    if (state === 'idle') {
      // Reset main circle
      mainScale.value = withTiming(1, { duration: 300 });
      
      // Hide AI speaking effects
      ring1Opacity.value = withTiming(0, { duration: 300 });
      ring2Opacity.value = withTiming(0, { duration: 300 });
      solid1Opacity.value = withTiming(0, { duration: 300 });
      
      // Clear any voice simulation timers
      if (voiceSimulationRef.current) {
        clearTimeout(voiceSimulationRef.current);
      }
    } 
    else if (state === 'userSpeaking') {
      // Start with normal scale
      mainScale.value = 1;
      
      // Hide AI speaking effects
      ring1Opacity.value = withTiming(0, { duration: 300 });
      ring2Opacity.value = withTiming(0, { duration: 300 });
      solid1Opacity.value = withTiming(0, { duration: 300 });
      
      // Start voice simulation
      simulateVoice();
    } 
    else if (state === 'aiSpeaking') {
      // Reset main circle
      mainScale.value = withTiming(1, { duration: 300 });
      
      // Show and animate AI speaking effects
      ring1Opacity.value = withTiming(0.75, { duration: 300 });
      ring2Opacity.value = withTiming(0.5, { duration: 300 });
      solid1Opacity.value = withTiming(0.3, { duration: 300 });
      
      // Animate rings
      ring1Scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 0 }),
          withTiming(1.25, { duration: 750 }),
          withTiming(1.1, { duration: 750 })
        ),
        -1, // Infinite repeat
        false // Don't reverse
      );
      
      ring2Scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 0 }),
          withTiming(1.4, { duration: 1100 }),
          withTiming(1.2, { duration: 1100 })
        ),
        -1,
        false
      );
      
      // Animate solid circle
      solid1Scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 0 }),
          withTiming(1.3, { duration: 900 }),
          withTiming(1.15, { duration: 900 })
        ),
        -1,
        false
      );
      
      // Clear any voice simulation timers
      if (voiceSimulationRef.current) {
        clearTimeout(voiceSimulationRef.current);
      }
    }
    
    // Cleanup function
    return () => {
      if (voiceSimulationRef.current) {
        clearTimeout(voiceSimulationRef.current);
      }
    };
  }, [state]);
  
  // Simulate voice intensity changes
  const simulateVoice = () => {
    // Create a more natural voice pattern
    // Generate a pseudo-random sequence that mimics natural speech patterns
    const intensityPatterns = [
      // Short bursts (like single words)
      [0.3, 0.5, 0.8, 1.2, 0.7, 0.4],
      // Medium phrase
      [0.4, 0.5, 0.6, 0.8, 0.9, 1.1, 1.2, 1.0, 0.8, 0.6],
      // Longer sentence with emphasis
      [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.1, 1.3, 1.2, 0.9, 0.7, 0.5, 0.4],
      // Excited speech
      [0.6, 0.8, 1.0, 1.2, 1.4, 1.3, 1.1, 1.2, 1.4, 1.3, 1.1, 0.9],
      // Quiet speech
      [0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.5, 0.6, 0.5, 0.3]
    ];
    
    // Pick a random pattern
    const pattern = [...intensityPatterns[Math.floor(Math.random() * intensityPatterns.length)]];
    
    let currentIndex = 0;
    
    // Function to update intensity from the pattern
    const updateIntensity = () => {
      if (currentIndex >= pattern.length) {
        // Start a new pattern with a small pause
        voiceSimulationRef.current = setTimeout(() => {
          simulateVoice();
        }, Math.random() * 300 + 200);
        return;
      }
      
      const newIntensity = pattern[currentIndex];
      setVoiceIntensity(newIntensity);
      
      // Update animation
      mainScale.value = withTiming(1 + (newIntensity * 0.3), { duration: 100, easing: Easing.out(Easing.ease) });
      
      currentIndex++;
      
      // Schedule next update with varying timing to simulate natural speech rhythm
      voiceSimulationRef.current = setTimeout(updateIntensity, Math.random() * 100 + 80);
    };
    
    // Start the simulation
    updateIntensity();
  };
  
  // Animated styles
  const mainCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainScale.value }]
  }));
  
  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value
  }));
  
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value
  }));
  
  const solid1Style = useAnimatedStyle(() => ({
    transform: [{ scale: solid1Scale.value }],
    opacity: solid1Opacity.value
  }));
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Voice Animation</Text>
      <Text style={styles.subtitle}>Current State: {state}</Text>
      {state === 'userSpeaking' && (
        <Text style={styles.intensityText}>Voice Intensity: {voiceIntensity.toFixed(2)}</Text>
      )}
      
      <View style={styles.circleContainer}>
        {/* AI speaking effects - behind the main circle */}
        <Animated.View style={[styles.ring, { width: baseSize * 1.1, height: baseSize * 1.1 }, ring1Style]} />
        <Animated.View style={[styles.ring, { width: baseSize * 1.2, height: baseSize * 1.2 }, ring2Style]} />
        <Animated.View style={[styles.solid, { width: baseSize * 1.15, height: baseSize * 1.15 }, solid1Style]} />
        
        {/* Main circle - always visible */}
        <Pressable onPress={cycleState}>
          <Animated.View style={[styles.mainCircle, { width: baseSize, height: baseSize }, mainCircleStyle]} />
        </Pressable>
      </View>
      
      <Pressable style={styles.button} onPress={cycleState}>
        <Text style={styles.buttonText}>Change State</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  intensityText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },
  circleContainer: {
    position: 'relative',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  mainCircle: {
    backgroundColor: '#3b82f6', // blue-500
    borderRadius: 999,
    zIndex: 10,
  },
  ring: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#93c5fd', // blue-300
    borderRadius: 999,
  },
  solid: {
    position: 'absolute',
    backgroundColor: '#bfdbfe', // blue-200
    borderRadius: 999,
  },
  wave: {
    position: 'absolute',
    backgroundColor: '#dbeafe', // blue-100
    borderRadius: 999,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});