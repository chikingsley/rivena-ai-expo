import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateAPIUrl } from '@/utils';
import { fetch as expoFetch } from 'expo/fetch';
import {
  AudioSession,
  LiveKitRoom,
  useTracks,
  useLocalParticipant,
  useRoomContext,
  registerGlobals,
} from '@livekit/react-native';
import { Track } from 'livekit-client';

// Register LiveKit globals
registerGlobals();

// Voice component with LiveKit integration
export default function VoiceScreen() {
  const insets = useSafeAreaInsets();
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [token, setToken] = useState('');
  const [wsURL, setWsURL] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Fetch LiveKit token from our API route
  useEffect(() => {
    fetchToken();
  }, []);
  
  // Calculate the width of the audio level indicator as a percentage
  const audioLevelPercentage = Math.min(100, audioLevel * 100);
  
  // LiveKit Room component
  const renderLiveKitRoom = () => {
    if (!token || !wsURL) {
      console.log('Cannot render LiveKitRoom - missing token or URL', { token, wsURL });
      return null;
    }
    
    console.log('Rendering LiveKitRoom with token:', token);
    return (
      <LiveKitRoom
        serverUrl={wsURL}
        token={token}
        connect={isConnected}
        options={{
          adaptiveStream: { pixelDensity: 'screen' },
        }}
        audio={isMicActive}
        video={false}
        onConnected={() => {
          console.log('LiveKit connected successfully');
          setIsConnected(true);
        }}
        onDisconnected={(reason) => {
          console.log('LiveKit disconnected:', reason);
          setIsConnected(false);
        }}
        onError={(error) => {
          console.error('LiveKit connection error:', error);
        }}
      >
        <AudioLevelMonitor setAudioLevel={setAudioLevel} />
      </LiveKitRoom>
    );
  };
  
  // Toggle microphone state
  const toggleMicrophone = () => {
    if (!isMicActive) {
      // Start audio session when turning on mic
      AudioSession.startAudioSession();
      
      // If we don't have a token yet, try to fetch it again
      if (!token) {
        console.log('No token available, fetching again...');
        fetchToken();
      }
      
      // Connect to LiveKit
      console.log('Connecting to LiveKit...');
      setIsConnected(true);
    } else {
      // Stop audio session when turning off mic
      AudioSession.stopAudioSession();
      
      // Disconnect from LiveKit
      console.log('Disconnecting from LiveKit...');
      setIsConnected(false);
    }
    setIsMicActive(!isMicActive);
  };
  
  // Function to fetch token - extracted for reuse
  const fetchToken = async () => {
    try {
      console.log('Fetching LiveKit token from API...');
      
      // Use the generateAPIUrl function to get the correct URL
      const apiUrl = generateAPIUrl('/api/livekit-token');
      console.log('API URL:', apiUrl);
      
      // Use expoFetch to ensure proper network requests
      const response = await expoFetch(apiUrl);
      const data = await response.json();
      
      console.log('API Response data:', JSON.stringify(data, null, 2));
      
      if (data.token && data.url) {
        console.log('Setting token:', data.token);
        setToken(data.token);
        setWsURL(data.url);
        console.log('LiveKit token fetched successfully');
        console.log('Using LiveKit URL:', data.url);
      } else {
        console.warn('LiveKit token or URL missing from response');
        // Use environment variables as fallback
        const fallbackUrl = process.env.LIVEKIT_URL || 'wss://danvisualize-jwf5wckk.livekit.cloud';
        console.log('Using fallback LiveKit URL:', fallbackUrl);
        setWsURL(fallbackUrl);
      }
    } catch (error) {
      console.error('Error fetching LiveKit token:', error);
      // For development, provide fallback values
      const fallbackUrl = process.env.LIVEKIT_URL || 'wss://danvisualize-jwf5wckk.livekit.cloud';
      console.log('Using fallback LiveKit URL due to error:', fallbackUrl);
      setWsURL(fallbackUrl);
    }
  };
  
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
          ? 'Microphone is active. The audio level indicator shows real audio levels.' 
          : 'Press the button to turn on the microphone.'}
      </Text>
      
      <Text style={styles.note}>
        {token ? 'Connected to LiveKit for real-time audio processing.' : 'Waiting to connect to LiveKit...'}
      </Text>
      
      {renderLiveKitRoom()}
    </View>
  );
}

// Component to monitor audio levels from LiveKit
const AudioLevelMonitor = ({ setAudioLevel }) => {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  
  // Monitor audio levels
  useEffect(() => {
    if (!room || !localParticipant) return;
    
    const handleAudioLevel = (audioLevel) => {
      setAudioLevel(audioLevel);
    };
    
    // Subscribe to audio level updates
    const subscription = room.on('audioLevelChanged', (levels) => {
      const localLevel = levels.get(localParticipant.sid) || 0;
      handleAudioLevel(localLevel);
    });
    
    return () => {
      subscription.dispose();
    };
  }, [room, localParticipant, setAudioLevel]);
  
  return null;
};

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