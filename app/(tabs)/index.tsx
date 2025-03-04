import React, { useState, useRef, useEffect } from 'react';
import { YStack, Text, Button, Input, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  KeyboardAvoidingView,
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
import Constants from 'expo-constants';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Get the API URL based on the environment
const getApiUrl = () => {
  // For Expo Go, use the development server URL
  if (__DEV__) {
    // Get the Expo development server URL
    const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    const devServerUrl = Constants.expoConfig?.hostUri 
      ? Constants.expoConfig.hostUri.split(':')[0] 
      : localhost;
    
    return `http://${devServerUrl}:3000/api/chat`;
  }
  
  // For production, use the deployed URL
  return 'https://your-production-domain.com/api/chat';
};

export default function App() {
  // Get safe area insets to handle notch
  const insets = useSafeAreaInsets();
  
  // Ref for ScrollView to enable auto-scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Simple state management for a basic chat
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(64); // Default input container height
  const [isLoading, setIsLoading] = useState(false);

  // Calculate the bottom padding to account for the tab bar
  const tabBarHeight = Platform.OS === 'ios' ? insets.bottom + 49 : 49;

  // Updated send function to use the chat API
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log('Calling API at:', getApiUrl());
      
      // Call the chat API with the full URL
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let responseText = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          // Update the assistant message as chunks arrive
          setMessages(prev => {
            // Check if we already have an assistant message
            const hasAssistantMessage = prev.length > 0 && 
              prev[prev.length - 1].role === 'assistant';
            
            if (hasAssistantMessage) {
              // Update the existing assistant message
              return [
                ...prev.slice(0, -1),
                { role: 'assistant', content: responseText }
              ];
            } else {
              // Add a new assistant message
              return [...prev, { role: 'assistant', content: responseText }];
            }
          });
        }
      } else {
        // Fallback for browsers that don't support streaming
        const text = await response.text();
        setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      }
    } catch (error: any) {
      console.error('Error calling chat API:', error);
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      }]);
      
      // Show error alert with more details
      Alert.alert(
        'API Error',
        `Failed to connect to the API. Error: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      // Scroll to bottom after response
      scrollToBottom();
    }
  };

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
                messages.map((message, index) => (
                  <View 
                    key={index} 
                    style={{
                      marginVertical: 4, // Further reduced vertical margin
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: message.role === 'user' ? '#e1f5fe' : '#e8f5e9',
                      borderWidth: 1,
                      borderColor: message.role === 'user' ? '#bbdefb' : '#c8e6c9',
                      alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                    }}
                  >
                    <Text style={{ 
                      color: '#333333', 
                      fontWeight: message.role === 'user' ? 'bold' : 'normal',
                    }}>
                      {message.content}
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
              onChangeText={setInput}
              onSubmitEditing={handleSend}
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
              onPress={handleSend} 
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