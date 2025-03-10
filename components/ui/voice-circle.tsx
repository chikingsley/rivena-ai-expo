import React, { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  Easing,
  interpolate,
  cancelAnimation,
  useDerivedValue
} from 'react-native-reanimated';
import { Canvas, Path, Skia, BlurMask, useClock } from '@shopify/react-native-skia';
import { Text } from './text';
import Ionicons from '@expo/vector-icons/Ionicons'; 

interface VoiceCircleProps {
  isRecording: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  size?: number;
  pulseColor?: string;
  innerColor?: string;
  outerColor?: string;
  iconColor?: string;
  timerSeconds?: number;
}

export function VoiceCircle({
  isRecording,
  onPress,
  onLongPress,
  size = 120,
  pulseColor = 'rgba(0, 122, 255, 0.2)',
  innerColor = 'white',
  outerColor = '#007AFF',
  iconColor = '#007AFF',
  timerSeconds = 0
}: VoiceCircleProps) {
  const pulse = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Animation values for the wave effect
  const clock = useClock();
  const waveAnimValue1 = useSharedValue(0);
  const waveAnimValue2 = useSharedValue(0);
  const waveAnimValue3 = useSharedValue(0);
  const waveAnimValue4 = useSharedValue(0);
  const colorPhase = useSharedValue(0);
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRecording) {
      pulse.value = 0;
      pulse.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      );
      
      scale.value = withTiming(0.95, { duration: 200 });
      
      // Start wave animations with different speeds and phases
      waveAnimValue1.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      waveAnimValue2.value = withRepeat(
        withTiming(1, { duration: 2300, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      waveAnimValue3.value = withRepeat(
        withTiming(1, { duration: 4100, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      waveAnimValue4.value = withRepeat(
        withTiming(1, { duration: 3700, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      
      // Color transition animation
      colorPhase.value = withRepeat(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 200 });
      
      // Stop wave animations
      cancelAnimation(waveAnimValue1);
      cancelAnimation(waveAnimValue2);
      cancelAnimation(waveAnimValue3);
      cancelAnimation(waveAnimValue4);
      cancelAnimation(colorPhase);
      waveAnimValue1.value = withTiming(0, { duration: 300 });
      waveAnimValue2.value = withTiming(0, { duration: 300 });
      waveAnimValue3.value = withTiming(0, { duration: 300 });
      waveAnimValue4.value = withTiming(0, { duration: 300 });
      colorPhase.value = withTiming(0, { duration: 300 });
    }
    
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(scale);
      cancelAnimation(waveAnimValue1);
      cancelAnimation(waveAnimValue2);
      cancelAnimation(waveAnimValue3);
      cancelAnimation(waveAnimValue4);
      cancelAnimation(colorPhase);
    };
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pulse.value, [0, 0.5, 1], [0, 0.7, 0]),
      transform: [
        { scale: interpolate(pulse.value, [0, 1], [1, 1.5]) }
      ]
    };
  });

  const circleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  // Create the wave path for the animation
  const createWavePath = (centerX: number, centerY: number, radius: number, amplitude: number, frequency: number, phase: number, distortion = 0) => {
    const path = Skia.Path.Make();
    const step = (2 * Math.PI) / 60; // Increased number of points for smoother waves
    
    // Add some randomness to the first point
    const startX = centerX + radius * Math.cos(0);
    const startY = centerY + radius * Math.sin(0) + amplitude * Math.sin(frequency * 0 + phase);
    path.moveTo(startX, startY);
    
    for (let angle = step; angle <= 2 * Math.PI; angle += step) {
      // Add a subtle distortion effect based on angle
      const distortionFactor = distortion * Math.sin(angle * 3 + phase * 0.5);
      
      const x = centerX + radius * Math.cos(angle) * (1 + distortionFactor * 0.05);
      const y = centerY + radius * Math.sin(angle) + 
                amplitude * Math.sin(frequency * angle + phase) + 
                amplitude * 0.3 * Math.sin(frequency * 2 * angle - phase * 0.7); // Add harmonic
      
      path.lineTo(x, y);
    }
    
    path.close();
    return path;
  };
  
  // Get color based on phase
  const getColorWithPhase = (baseColor: string, alpha: number, phase: number) => {
    // This creates a subtle color shift effect based on the phase
    const hueShift = Math.sin(phase * Math.PI * 2) * 20; // Shift hue by +/- 20 degrees
    return `hsla(${210 + hueShift}, 100%, 50%, ${alpha})`;
  };
  
  // Animated wave paths
  const wave1 = useDerivedValue(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.85;
    const amplitude = 8 * waveAnimValue1.value;
    const frequency = 6;
    const phase = clock.value / 400;
    const distortion = waveAnimValue1.value * 0.8;
    
    return createWavePath(centerX, centerY, radius, amplitude, frequency, phase, distortion);
  }, [clock, waveAnimValue1]);
  
  const wave2 = useDerivedValue(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.75;
    const amplitude = 6 * waveAnimValue2.value;
    const frequency = 8;
    const phase = -clock.value / 500;
    const distortion = waveAnimValue2.value * 0.6;
    
    return createWavePath(centerX, centerY, radius, amplitude, frequency, phase, distortion);
  }, [clock, waveAnimValue2]);
  
  const wave3 = useDerivedValue(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.65;
    const amplitude = 5 * waveAnimValue3.value;
    const frequency = 7;
    const phase = clock.value / 600;
    const distortion = waveAnimValue3.value * 0.4;
    
    return createWavePath(centerX, centerY, radius, amplitude, frequency, phase, distortion);
  }, [clock, waveAnimValue3]);
  
  const wave4 = useDerivedValue(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.55;
    const amplitude = 4 * waveAnimValue4.value;
    const frequency = 9;
    const phase = -clock.value / 700;
    const distortion = waveAnimValue4.value * 0.3;
    
    return createWavePath(centerX, centerY, radius, amplitude, frequency, phase, distortion);
  }, [clock, waveAnimValue4]);
  
  // Color animations
  const color1 = useDerivedValue(() => {
    return getColorWithPhase(outerColor, 0.1, colorPhase.value);
  }, [colorPhase, outerColor]);
  
  const color2 = useDerivedValue(() => {
    return getColorWithPhase(outerColor, 0.15, colorPhase.value + 0.25);
  }, [colorPhase, outerColor]);
  
  const color3 = useDerivedValue(() => {
    return getColorWithPhase(outerColor, 0.2, colorPhase.value + 0.5);
  }, [colorPhase, outerColor]);
  
  const color4 = useDerivedValue(() => {
    return getColorWithPhase(outerColor, 0.25, colorPhase.value + 0.75);
  }, [colorPhase, outerColor]);

  return (
    <View className="items-center justify-center">
      <View style={{ width: size * 1.5, height: size * 1.5, alignItems: 'center', justifyContent: 'center' }}>
        {isRecording && (
          <Animated.View 
            style={[
              { 
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: pulseColor,
              },
              pulseStyle
            ]} 
          />
        )}
        
        <Pressable 
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={500}
        >
          <Animated.View 
            style={[
              { 
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: innerColor,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderWidth: 2,
                borderColor: outerColor,
                overflow: 'hidden'
              },
              circleStyle
            ]}
          >
            {/* Wave animation using Skia */}
            {isRecording && (
              <Canvas style={{ position: 'absolute', width: size, height: size }}>
                <Path 
                  path={wave1}
                  color={color1}
                >
                  <BlurMask blur={4} style="solid" />
                </Path>
                <Path 
                  path={wave2}
                  color={color2}
                >
                  <BlurMask blur={3} style="solid" />
                </Path>
                <Path 
                  path={wave3}
                  color={color3}
                >
                  <BlurMask blur={2} style="solid" />
                </Path>
                <Path 
                  path={wave4}
                  color={color4}
                >
                  <BlurMask blur={1} style="solid" />
                </Path>
              </Canvas>
            )}
            
            {isRecording ? (
              <Ionicons name="mic" size={size * 0.4} color={iconColor} />
            ) : (
              <Ionicons name="mic-outline" size={size * 0.4} color={iconColor} />
            )}
          </Animated.View>
        </Pressable>
      </View>
      
      {isRecording && timerSeconds > 0 && (
        <Text className="text-lg font-medium mt-4 text-foreground">
          {formatTime(timerSeconds)}
        </Text>
      )}
    </View>
  );
}
