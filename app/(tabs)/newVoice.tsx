import React, { useState, useEffect, useRef } from 'react';
import { View, StatusBar, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { generateAPIUrl } from '@/lib/generateApiUrl';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';

// UI Components
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceCircle } from '@/components/ui/voice-circle';
import { VoiceWidget } from '@/components/ui/voice-widget';
import { SessionComplete } from '@/components/ui/session-complete';

export default function VoiceScreen() {
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use the AI SDK's useChat hook for message management
  const { messages, error, isLoading } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: error => {
      console.error('Voice AI error:', error);
      Alert.alert(
        'AI Error',
        `Failed to connect to the AI service. Error: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  });

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Handle voice recording toggle
  const handleVoiceToggle = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      
      // If recording was longer than 3 seconds, show session complete
      if (recordingTime > 3) {
        setSessionComplete(true);
      }
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      setSessionComplete(false);
    }
  };
  
  // Handle new session
  const handleNewSession = () => {
    setSessionComplete(false);
    setRecordingTime(0);
  };
  
  // Handle save session
  const handleSaveSession = () => {
    Alert.alert('Success', 'Session saved successfully!');
    setSessionComplete(false);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      
      {/* Main content */}
      <View 
        className="flex-1 px-4"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {sessionComplete ? (
          <SessionComplete 
            duration={formatTime(recordingTime)}
            onSaveSession={handleSaveSession}
            onNewSession={handleNewSession}
          />
        ) : (
          <Animated.View 
            entering={FadeIn.duration(500)}
            className="flex-1 justify-between py-6"
          >
            {/* Header */}
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground mb-2">Voice AI</Text>
              <Text className="text-base text-muted-foreground text-center px-6">
                Tap the microphone to start or stop recording your voice
              </Text>
            </View>
            
            {/* Voice Circle */}
            <View className="flex-1 justify-center items-center">
              <VoiceCircle 
                isRecording={isRecording}
                onPress={handleVoiceToggle}
                size={120}
                timerSeconds={recordingTime}
              />
            </View>
            
            {/* Transcription Card (only show if there are messages) */}
            {messages.length > 0 && (
              <View className="w-full mb-6">
                <Card className="w-full bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Last Transcription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollView 
                      className="max-h-24"
                      showsVerticalScrollIndicator={false}
                    >
                      <Text className="text-foreground">
                        {messages[messages.length - 1]?.content || 'No transcription available'}
                      </Text>
                    </ScrollView>
                  </CardContent>
                </Card>
              </View>
            )}
            
            {/* Voice Widget */}
            <View className="w-full mb-4">
              <VoiceWidget 
                title="Try Special Meditation"
                onPress={() => Alert.alert('Special Meditation', 'Starting special meditation session...')}
                isActive={!isRecording}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}