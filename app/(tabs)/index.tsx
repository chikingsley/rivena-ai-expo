import { generateAPIUrl } from '@/utils';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { ScrollView, KeyboardAvoidingView, Platform, Keyboard, SafeAreaView, StatusBar } from 'react-native';
import { YStack, XStack, Text, Input, Button, View, styled } from 'tamagui';
import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from '@/components/ui/MessageBubble';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Create a logging utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  }
};

export default function App() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  
  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: error => {
      logger.error('Chat error:', error);
    },
    onResponse: (response) => {
      logger.info('Received response:', {
        status: response.status,
        statusText: response.statusText,
      });
    },
    onFinish: (message) => {
      logger.info('Chat completed:', { messageId: message.id, role: message.role });
      // Scroll to bottom when a new message is finished
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    maxSteps: 5,
  });

  // Setup keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (error) return <Text color="$red10">{error.message}</Text>;

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    logger.info('Sending message:', { content: input });
    handleSubmit({} as any);
    // Dismiss keyboard on iOS after sending
    if (Platform.OS === 'ios') {
      Keyboard.dismiss();
    }
  };
  
  // Calculate bottom padding to account for the tab bar and safe area
  const bottomPadding = Platform.OS === 'ios' ? insets.bottom + 60 : 60; // Add extra for tab bar

  return (
    <YStack flex={1} bg="$background">
      <StatusBar barStyle="dark-content" />
      
      {/* Main chat area */}
      <YStack flex={1} pb={bottomPadding}>
        <ScrollView
          style={{ flex: 1 }}
          ref={scrollViewRef}
          contentContainerStyle={{ paddingVertical: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$4">
            {messages.map(m => (
              <MessageBubble
                key={m.id}
                id={m.id}
                role={m.role as any}
                content={m.content || ''}
                toolInvocations={m.toolInvocations}
              />
            ))}
            {/* Add a spacer at the bottom to ensure content is above the input */}
            {messages.length > 0 && <View height={60} />}
          </YStack>
        </ScrollView>
      </YStack>

      {/* Input area fixed at bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
        }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <XStack
          width="100%"
          space="$2"
          p="$4"
          bg="$background"
          borderTopWidth={1}
          borderColor="$borderColor"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: -2 }}
          shadowOpacity={0.1}
          shadowRadius={3}
          elevation={5}
        >
          <Input
            flex={1}
            size="$4"
            borderWidth={1}
            borderColor="$borderColor"
            placeholder="Type your message..."
            value={input}
            onChangeText={(text) => handleInputChange({ target: { value: text } } as any)}
            onSubmitEditing={handleSendMessage}
            autoFocus={false}
          />
          <Button
            size="$4"
            themeInverse
            onPress={handleSendMessage}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </XStack>
      </KeyboardAvoidingView>
    </YStack>
  );
}