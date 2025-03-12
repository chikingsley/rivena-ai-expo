import React, { useEffect, useRef } from 'react';
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

import { Text } from './text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GLView } from 'expo-gl';

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
            {/* Custom WebGL shader animation */}
            {isRecording && (
              <GLView
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  overflow: 'hidden',
                }}
                onContextCreate={(gl) => {
                  // Log success
                  console.log('GL context created successfully');
                  
                  // Create vertex shader
                  const vertexShaderSource = `
                    attribute vec2 position;
                    varying vec2 uv;
                    
                    void main() {
                      uv = position * 0.5 + 0.5;
                      gl_Position = vec4(position, 0.0, 1.0);
                    }
                  `;
                  
                  // Create fragment shader with the user's specific code
                  const fragmentShaderSource = `
                    precision highp float;
                    varying vec2 uv;
                    
                    uniform float time;
                    uniform vec2 resolution;
                    uniform float amplitude;
                    
                    // HSV to RGB conversion function
                    vec3 hsv(float h, float s, float v) {
                      vec4 t = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
                      vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
                      return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
                    }
                    
                    void main() {
                      vec4 o = vec4(0.0, 0.0, 0.0, 1.0);
                      float t = time * 0.5;
                      float r = min(resolution.x, resolution.y);
                      vec2 FC = uv * resolution;
                      
                      float i = 0.0;
                      float e = 0.0;
                      float R = 0.0;
                      float s = 0.0;
                      vec3 q = vec3(0.0, 0.0, -1.0);
                      vec3 p = vec3(0.0);
                      vec3 d = vec3(FC.xy/r-vec2(0.6, 0.5), 0.7);
                      
                      for(q.z = -1.0; i < 99.0; i += 1.0) {
                        o.rgb += hsv(0.1, 0.2, min(e*s, 0.7-e)/35.0);
                        s = 1.0;
                        p = q += d*e*R*0.1;
                        p = vec3(log2(R=length(p))-t, exp(1.0-p.z/R), atan(p.y, p.x) + cos(t)*0.2);
                        for(e = p.y - 1.0; s < 300.0; s += s) {
                          e += sin(dot(sin(p.zxy*s)-0.5, 1.0-cos(p.yxz*s)))/s;
                        }
                      }
                      
                      // Apply amplitude to the effect and adjust colors
                      o.rgb *= amplitude * 2.0;
                      
                      // Add alpha based on distance from center
                      vec2 center = vec2(0.5, 0.5);
                      float dist = length(uv - center);
                      o.a = smoothstep(0.5, 0.4, dist); // Circular mask
                      
                      gl_FragColor = o;
                    }
                  `;
                  
                  // Create shaders
                  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
                  gl.shaderSource(vertexShader!, vertexShaderSource);
                  gl.compileShader(vertexShader!);
                  
                  if (!gl.getShaderParameter(vertexShader!, gl.COMPILE_STATUS)) {
                    console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader!));
                    return;
                  }
                  
                  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                  gl.shaderSource(fragmentShader!, fragmentShaderSource);
                  gl.compileShader(fragmentShader!);
                  
                  if (!gl.getShaderParameter(fragmentShader!, gl.COMPILE_STATUS)) {
                    console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader!));
                    return;
                  }
                  
                  // Create program
                  const program = gl.createProgram();
                  gl.attachShader(program!, vertexShader!);
                  gl.attachShader(program!, fragmentShader!);
                  gl.linkProgram(program!);
                  
                  if (!gl.getProgramParameter(program!, gl.LINK_STATUS)) {
                    console.error('Program linking failed:', gl.getProgramInfoLog(program!));
                    return;
                  }
                  
                  gl.useProgram(program!);
                  
                  // Create a full-screen quad
                  const vertices = new Float32Array([
                    -1.0, -1.0,  // bottom left
                     1.0, -1.0,  // bottom right
                    -1.0,  1.0,  // top left
                     1.0,  1.0,  // top right
                  ]);
                  
                  const vertexBuffer = gl.createBuffer();
                  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                  
                  // Get attribute location
                  const positionAttrib = gl.getAttribLocation(program!, 'position');
                  gl.enableVertexAttribArray(positionAttrib);
                  gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
                  
                  // Get uniform locations
                  const timeUniform = gl.getUniformLocation(program!, 'time');
                  const resolutionUniform = gl.getUniformLocation(program!, 'resolution');
                  const amplitudeUniform = gl.getUniformLocation(program!, 'amplitude');
                  
                  // Enable alpha blending
                  gl.enable(gl.BLEND);
                  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                  
                  // Animation state
                  let startTime = Date.now();
                  let animationFrame: number | null = null;
                  
                  // Animation function
                  const animate = () => {
                    if (!isRecording) {
                      if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                        animationFrame = null;
                      }
                      return;
                    }
                    
                    // Calculate time in seconds
                    const time = (Date.now() - startTime) / 1000;
                    
                    // Get current amplitude from Reanimated value
                    const currentAmplitude = Math.max(0.2, waveAnimValue1.value);
                    
                    // Clear the canvas
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    
                    // Set uniforms
                    gl.uniform1f(timeUniform, time);
                    gl.uniform2f(resolutionUniform, size, size);
                    gl.uniform1f(amplitudeUniform, currentAmplitude);
                    
                    // Draw the quad
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    
                    // Flush and finish
                    gl.flush();
                    gl.endFrameEXP();
                    
                    // Request next frame
                    animationFrame = requestAnimationFrame(animate);
                  };
                  
                  // Start animation
                  animationFrame = requestAnimationFrame(animate);
                  
                  // Clean up on unmount
                  return () => {
                    if (animationFrame) {
                      cancelAnimationFrame(animationFrame);
                    }
                  };
                }}
              />
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
