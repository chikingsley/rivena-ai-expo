import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Simple voice test component without LiveKit native modules
export default function VoiceScreen() {
  const insets = useSafeAreaInsets();
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Simulate audio level changes when microphone is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isMicActive) {
      // Simulate audio level changes with random values
      intervalId = setInterval(() => {
        // Generate random audio level between 0 and 1
        const randomLevel = Math.random() * 0.8;
        setAudioLevel(randomLevel);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMicActive]);
  
  // Toggle microphone state
  const toggleMicrophone = () => {
    setIsMicActive(!isMicActive);
  };
  
  // Calculate the width of the audio level indicator as a percentage
  const audioLevelPercentage = Math.min(100, audioLevel * 100);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Voice Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Microphone Status:</Text>
        <Text style={[
          styles.statusValue, 
          { color: isMicActive ? '#4CAF50' : '#F44336' }
        ]}>
          {isMicActive ? 'Active' : 'Inactive'}
        </Text>
      </View>
      
      {/* Audio level indicator */}
      <View style={styles.audioLevelContainer}>
        <Text style={styles.audioLevelLabel}>Audio Level:</Text>
        <View style={styles.audioLevelOuter}>
          <View 
            style={[styles.audioLevelInner, { width: `${audioLevelPercentage}%` }]}
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            { backgroundColor: isMicActive ? '#F44336' : '#4CAF50' }
          ]} 
          onPress={toggleMicrophone}
        >
          <Text style={styles.buttonText}>
            {isMicActive ? 'Turn Off Microphone' : 'Turn On Microphone'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.instructions}>
        {isMicActive 
          ? 'Microphone is active. The audio level indicator shows simulated audio levels.' 
          : 'Press the button to turn on the microphone simulation.'}
      </Text>
      
      <Text style={styles.note}>
        Note: This is a simplified demo without actual microphone access. It uses simulated audio levels.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
  },
  buttonContainer: {
    marginVertical: 20,
    alignItems: 'center',
    height: 48, // Fixed height to prevent layout shifts
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  audioLevelContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  audioLevelLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  audioLevelOuter: {
    height: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: Dimensions.get('window').width - 32, // Set the width to the screen width minus padding
  },
  audioLevelInner: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  instructions: {
    marginTop: 20,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  note: {
    marginTop: 40,
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});