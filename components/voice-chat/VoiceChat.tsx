import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { VoiceProvider, AudioChunk } from '../../providers/base/VoiceProvider';
import { voiceProviderRegistry } from '../../providers';
import { AudioProcessor } from '../../providers/utils/audio-processor';

// Component props
interface VoiceChatProps {
  initialProviderId?: string;
}

// Audio recording state
interface RecordingState {
  isRecording: boolean;
  audioData: AudioChunk[];
  uri: string | null;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ initialProviderId = 'openai' }) => {
  // State for provider and messages
  const [currentProviderId, setCurrentProviderId] = useState<string>(initialProviderId);
  const [provider, setProvider] = useState<VoiceProvider | null>(null);
  const [providerState, setProviderState] = useState<string>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    audioData: [],
    uri: null,
  });

  // Use the expo-audio hook for recording with status listener
  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY,
    (status) => {
      // Handle recording status updates
      if (status.isFinished && status.url) {
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          uri: status.url
        }));
        
        // Log the recording completion
        addMessage(`Recording finished: ${status.url}`);
      }
      
      // Handle recording errors
      if (status.hasError && status.error) {
        addMessage(`Recording error: ${status.error}`);
      }
    }
  );
  
  // Refs for audio visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize provider on mount
  useEffect(() => {
    // Request microphone permissions
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
    
    initializeProvider(currentProviderId);
    
    // Clean up on unmount
    return () => {
      disconnectProvider();
      stopAudioVisualization();
    };
  }, []);

  // Initialize the selected provider
  const initializeProvider = async (providerId: string) => {
    try {
      // Disconnect existing provider if any
      if (provider) {
        await provider.disconnect();
      }

      // Create a new provider from environment variables
      let newProvider: VoiceProvider;
      
      if (providerId === 'openai') {
        newProvider = voiceProviderRegistry.createProviderFromEnv('openai', providerId);
      } else if (providerId === 'hume') {
        newProvider = voiceProviderRegistry.createProviderFromEnv('hume', providerId);
      } else {
        throw new Error(`Unsupported provider: ${providerId}`);
      }

      // Set up event listeners
      setupEventListeners(newProvider);
      
      // Connect to the provider
      await newProvider.connect();
      
      // Update state
      setProvider(newProvider);
      setCurrentProviderId(providerId);
      addMessage(`Connected to ${providerId} provider`);
    } catch (error) {
      console.error('Error initializing provider:', error);
      addMessage(`Error: ${error instanceof Error ? error.message : 'Failed to initialize provider'}`);
    }
  };

  // Set up event listeners for the provider
  const setupEventListeners = (newProvider: VoiceProvider) => {
    // State change listener
    newProvider.addEventListener('stateChange', (state) => {
      setProviderState(state);
      addMessage(`Provider state changed to: ${state}`);
    });

    // Audio output listener
    newProvider.addEventListener('audioOutput', (audioBlob) => {
      if (Platform.OS === 'web') {
        // For web, play the audio directly
        playAudio(audioBlob);
      } else {
        // For React Native, handle differently
        // This depends on how your providers emit audio for React Native
        // You might need to use expo-av to play the audio
      }
    });

    // Message listener
    newProvider.addEventListener('message', (message) => {
      addMessage(`${message.type}: ${typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}`);
    });

    // Error listener
    newProvider.addEventListener('error', (error) => {
      addMessage(`Error: ${error.message}`);
    });

    // Audio level listener
    newProvider.addEventListener('audioLevel', (level) => {
      setAudioLevel(level);
    });
  };

  // Disconnect the current provider
  const disconnectProvider = async () => {
    if (provider) {
      try {
        await provider.disconnect();
        addMessage('Disconnected from provider');
      } catch (error) {
        console.error('Error disconnecting provider:', error);
      }
    }
  };

  // Switch to a different provider
  const switchProvider = async (providerId: string) => {
    if (providerId === currentProviderId) return;
    
    addMessage(`Switching to ${providerId} provider...`);
    await initializeProvider(providerId);
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        await startWebRecording();
      } else {
        await startNativeRecording();
      }
      
      setRecordingState({
        ...recordingState,
        isRecording: true,
        audioData: [],
        uri: null,
      });
      
      addMessage('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      addMessage(`Error: ${error instanceof Error ? error.message : 'Failed to start recording'}`);
    }
  };

  // Start recording on web
  const startWebRecording = async () => {
    if (!navigator.mediaDevices) {
      throw new Error('Media devices not supported in this browser');
    }

    try {
      // Prepare to record using expo-audio
      await audioRecorder.prepareToRecordAsync({
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        }
      });
      
      // For web, we'll use a different approach for audio visualization
      if (Platform.OS === 'web') {
        try {
          // We can't directly access mediaRecorder, so let's use navigator.mediaDevices
          // to get a stream for visualization
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
            video: false
          });
          
          // Set up audio visualization with this stream
          setupAudioVisualization(stream);
          
          // We'll rely on the recorder's status updates for chunks
          // The actual audio data will be available when we stop recording
        } catch (error) {
          console.error('Error setting up audio visualization:', error);
        }
      }
      
      // Start recording
      audioRecorder.record();
    } catch (error) {
      console.error('Error starting web recording:', error);
      throw error;
    }
  };

  // Start recording on native (React Native)
  const startNativeRecording = async () => {
    try {
      // Prepare to record with high quality settings
      await audioRecorder.prepareToRecordAsync({
        isMeteringEnabled: true, // Enable metering for audio level visualization
        android: {
          audioEncoder: 'aac',
          outputFormat: 'mpeg4',
        },
        ios: {
          audioQuality: 0x7f, // AudioQuality.MAX
        }
      });
      
      // Start recording
      audioRecorder.record();
      
      // Set up a timer to check audio levels for visualization
      const meteringInterval = setInterval(() => {
        const state = audioRecorder.getStatus();
        if (state.metering !== undefined) {
          // Convert metering value (usually in dB) to a normalized level (0-1)
          const normalizedLevel = Math.min(1, Math.max(0, (state.metering + 160) / 160));
          setAudioLevel(normalizedLevel);
        }
      }, 100);
      
      // Store the interval ID for cleanup
      animationFrameRef.current = meteringInterval as unknown as number;
    } catch (error) {
      console.error('Error starting native recording:', error);
      throw error;
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        await stopWebRecording();
      } else {
        await stopNativeRecording();
      }
      
      setRecordingState({
        ...recordingState,
        isRecording: false,
      });
      
      addMessage('Recording stopped');
    } catch (error) {
      console.error('Error stopping recording:', error);
      addMessage(`Error: ${error instanceof Error ? error.message : 'Failed to stop recording'}`);
    }
  };

  // Stop recording on web
  const stopWebRecording = async () => {
    try {
      // Stop the recorder
      await audioRecorder.stop();
      
      // Get the recording URI
      const uri = audioRecorder.uri;
      if (uri) {
        setRecordingState({
          ...recordingState,
          uri,
        });
        
        // For web, fetch the blob and send it to the provider
        if (provider && providerState === 'connected') {
          try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const chunk: AudioChunk = {
              data: blob,
              timestamp: Date.now(),
            };
            await provider.sendAudio(chunk);
            addMessage('Sent audio to provider');
          } catch (error) {
            console.error('Error sending web audio to provider:', error);
            addMessage(`Error sending audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      stopAudioVisualization();
    } catch (error) {
      console.error('Error stopping web recording:', error);
      throw error;
    }
  };

  // Stop recording on native
  const stopNativeRecording = async () => {
    try {
      // Clear any metering intervals
      if (typeof animationFrameRef.current === 'number') {
        clearInterval(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Stop the recording
      await audioRecorder.stop();
      
      // Get the recording URI
      const uri = audioRecorder.uri;
      if (!uri) {
        throw new Error('No recording URI available');
      }
      
      setRecordingState({
        ...recordingState,
        uri,
      });
      
      // Send the recording to the provider if connected
      if (provider && providerState === 'connected') {
        try {
          // For native platforms, we need to convert the file to a format the provider can use
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            // Read the file and convert it to a blob
            const response = await fetch(uri);
            const blob = await response.blob();
            
            // Create an AudioChunk to send to the provider
            const chunk: AudioChunk = {
              data: blob,
              timestamp: Date.now(),
            };
            
            // Send the audio to the provider
            await provider.sendAudio(chunk);
            addMessage('Sent audio to provider');
          }
        } catch (error) {
          console.error('Error sending audio to provider:', error);
          addMessage(`Error sending audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error stopping native recording:', error);
      throw error;
    }
  };

  // Set up audio visualization
  const setupAudioVisualization = (stream: MediaStream) => {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    
    // Create audio context
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // Connect the stream to the analyser
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    // Store refs
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    
    // Start visualization loop
    updateVisualization();
  };

  // Update visualization in animation frame
  const updateVisualization = () => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Float32Array(analyser.fftSize);
    
    // Get audio data
    analyser.getFloatTimeDomainData(dataArray);
    
    // Calculate audio level using our AudioProcessor
    const level = AudioProcessor.calculateAudioLevel(dataArray);
    setAudioLevel(level);
    
    // Continue the loop
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  };

  // Stop audio visualization
  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
  };

  // Play audio blob
  const playAudio = (audioBlob: Blob) => {
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
    
    audio.play().catch(console.error);
  };

  // Add a message to the messages list
  const addMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Interrupt the current response
  const interruptResponse = async () => {
    if (provider) {
      try {
        await provider.interrupt();
        addMessage('Interrupted response');
      } catch (error) {
        console.error('Error interrupting response:', error);
        addMessage(`Error: ${error instanceof Error ? error.message : 'Failed to interrupt'}`);
      }
    }
  };

  // Render audio level visualization
  const renderAudioLevel = () => {
    const height = Math.max(4, Math.floor(audioLevel * 50));
    
    return (
      <View style={styles.audioLevelContainer}>
        <View style={[styles.audioLevelBar, { height }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Chat</Text>
        <Text style={styles.subtitle}>
          Provider: {currentProviderId} ({providerState})
        </Text>
      </View>

      <View style={styles.providerSelector}>
        <TouchableOpacity
          style={[
            styles.providerButton,
            currentProviderId === 'openai' && styles.activeProvider,
          ]}
          onPress={() => switchProvider('openai')}
        >
          <Text style={styles.providerButtonText}>OpenAI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.providerButton,
            currentProviderId === 'hume' && styles.activeProvider,
          ]}
          onPress={() => switchProvider('hume')}
        >
          <Text style={styles.providerButtonText}>Hume</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <Text key={index} style={styles.message}>
            {message}
          </Text>
        ))}
      </View>

      <View style={styles.controls}>
        {renderAudioLevel()}
        
        <TouchableOpacity
          style={[
            styles.controlButton,
            (recordingState.isRecording || audioRecorder.isRecording) && styles.activeButton,
          ]}
          onPress={(recordingState.isRecording || audioRecorder.isRecording) ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {(recordingState.isRecording || audioRecorder.isRecording) ? 'Stop' : 'Record'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={interruptResponse}
        >
          <Text style={styles.buttonText}>Interrupt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  providerSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  providerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
  },
  activeProvider: {
    backgroundColor: '#007bff',
  },
  providerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioLevelContainer: {
    width: 20,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginRight: 16,
    justifyContent: 'flex-end',
  },
  audioLevelBar: {
    width: '100%',
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default VoiceChat;
