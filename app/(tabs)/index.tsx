import { generateAPIUrl } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';

import React, { useState, useRef, useEffect } from 'react';
import { Text, Button } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Platform,
  ScrollView,
  View,
  StatusBar,
  Keyboard,
  TextInput,
  LayoutAnimation,
  UIManager,
  Dimensions,
  Alert
} from 'react-native';
import { ToolInvocationRenderer } from '@/components/ToolInvocationRenderer';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// We'll use generateAPIUrl from utils instead of this function

export default function App() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Use the AI SDK's useChat hook for message management
  const { messages, error, handleInputChange, input, handleSubmit, isLoading, addToolResult } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: error => {
      console.error('Chat error:', error);
      Alert.alert(
        'API Error',
        `Failed to connect to the API. Error: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    },
    onFinish: () => {
      // Scroll to bottom when a message is complete
      setTimeout(() => scrollToBottom(), 100);
    },
    maxSteps: 5,
    // Add onToolCall handler if you want to automatically handle certain tools
    async onToolCall({ toolCall }) {
      // Example of auto-handling a tool
      if (toolCall.toolName === 'weather') {
        // You could automatically get the user's location here
        return { location: 'Auto-detected location', temperature: 72 };
      }
      // For other tools, let the UI handle them
      return undefined;
    }
  });

  // Display error message if there's an error
  if (error) return <Text style={{ padding: 20, color: 'red' }}>{error.message}</Text>;

  // UI state management
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(64); // Default input container height

  // Calculate the bottom padding to account for the tab bar
  const tabBarHeight = Platform.OS === 'ios' ? insets.bottom + 49 : 49;

  // Configure smooth layout animations
  const configureAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 0,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };

  // Keyboard listeners to adjust UI when keyboard appears/disappears
  useEffect(() => {
    const keyboardWillShowListener = Platform.OS === 'ios' ?
      Keyboard.addListener('keyboardWillShow', (event) => {
        configureAnimation();
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
        scrollToBottom();
      }) :
      Keyboard.addListener('keyboardDidShow', (event) => {
        configureAnimation();
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
        scrollToBottom();
      });

    const keyboardWillHideListener = Platform.OS === 'ios' ?
      Keyboard.addListener('keyboardWillHide', () => {
        configureAnimation();
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }) :
      Keyboard.addListener('keyboardDidHide', () => {
        configureAnimation();
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      });

    // Clean up listeners
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Function to scroll to bottom of ScrollView
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  // Calculate the content container height - leave more space for the input
  const windowHeight = Dimensions.get('window').height;
  const headerHeight = keyboardVisible ? 0 : 64; // Estimated header height
  const safeInputHeight = inputHeight + 20; // Add extra padding for safety
  const contentHeight = windowHeight - insets.top - headerHeight - (keyboardVisible ? keyboardHeight : tabBarHeight);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#FFFFFF',
    }}>
      <StatusBar barStyle="dark-content" />

      {/* Content container with safe area padding */}
      <View style={{
        flex: 1,
        paddingTop: insets.top,
        paddingHorizontal: 16,
      }}>
        {/* Header - only show when keyboard is not visible */}
        {!keyboardVisible && (
          <View style={{
            marginBottom: 20,
            height: headerHeight,
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#333333',
              textAlign: 'center'
            }}>
              Simple Chat
            </Text>
          </View>
        )}

        {/* Main content area with messages */}
        <View style={{
          height: contentHeight,
          position: 'relative',
        }}>
          {/* Messages area with ScrollView */}
          <ScrollView
            ref={scrollViewRef}
            style={{
              flex: 1,
            }}
            contentContainerStyle={{
              paddingBottom: safeInputHeight + 0, // Reduced padding to eliminate gap
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            <View>
              {messages.length === 0 ? (
                <View style={{
                  padding: 20,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  marginVertical: 10,
                  opacity: keyboardVisible ? 0.5 : 1, // Fade when keyboard is visible
                }}>
                  <Text style={{
                    color: '#666666',
                    fontSize: 16,
                    textAlign: 'center',
                  }}>
                    Send a message to start chatting
                  </Text>
                </View>
              ) : (
                messages.map((m, index) => (
                  <View
                    key={index}
                    style={{
                      marginVertical: 4, // Further reduced vertical margin
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: m.role === 'user' ? '#007AFF' : '#E5E5EA',
                      borderWidth: 1,
                      borderColor: m.role === 'user' ? '#bbdefb' : '#c8e6c9',
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                    }}
                  >
                    <Text style={{
                      color: m.role === 'user' ? '#FFFFFF' : '#333333',
                      fontWeight: m.role === 'user' ? 'normal' : 'normal',
                    }}>
                      {m.parts ? (
                        // Render message parts properly
                        <View>
                          {m.parts.map((part, partIndex) => {
                            switch (part.type) {
                              case 'text':
                                return <Text key={partIndex}>{part.text}</Text>;

                              case 'tool-invocation':
                                return (
                                  <ToolInvocationRenderer
                                    key={partIndex}
                                    toolInvocation={part.toolInvocation}
                                    addToolResult={addToolResult}
                                  />
                                );

                              default:
                                return <Text key={partIndex}>Unknown part type: {part.type}</Text>;
                            }
                          })}
                        </View>
                      ) : (
                        // Fallback for messages without parts
                        <Text>{m.content}</Text>
                      )}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>

        {/* Input area - positioned at the bottom but not fixed */}
        <View
          style={{
            position: 'absolute',
            bottom: keyboardVisible ? keyboardHeight : tabBarHeight,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#eeeeee',
            zIndex: 10, // Ensure input is above other elements
          }}
          onLayout={(event) => {
            // Update input height when it changes
            const { height } = event.nativeEvent.layout;
            if (height !== inputHeight) {
              setInputHeight(height);
            }
          }}
        >
          <View style={{
            flexDirection: 'row',
            marginVertical: 8,
            backgroundColor: '#f5f5f5',
            padding: 8,
            borderRadius: 20,
          }}>
            <TextInput
              style={{
                flex: 1,
                paddingHorizontal: 12,
                height: 40,
                backgroundColor: 'white',
                borderColor: '#dddddd',
                borderWidth: 1,
                borderRadius: 20,
                color: '#333333',
                fontSize: 16,
              }}
              placeholder="Type a message..."
              placeholderTextColor="#999999"
              value={input}
              onChangeText={(text) => handleInputChange({ target: { value: text } } as any)}
              onSubmitEditing={() => handleSubmit({} as any)}
              editable={!isLoading}
            />
            <Button
              style={{
                marginLeft: 8,
                height: 40,
                paddingHorizontal: 16,
                backgroundColor: isLoading ? '#cccccc' : '#2196f3',
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => handleSubmit({} as any)}
              disabled={!input.trim() || isLoading}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {isLoading ? 'Sending...' : 'Send'}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}