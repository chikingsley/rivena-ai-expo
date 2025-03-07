// components/ProviderTester.tsx
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { createOpenAIVoiceProvider } from '../providers/openai-voice';
import { createHumeVoiceProvider } from '../providers/hume-voice';
import type { VoiceProvider, VoiceProviderState } from '../providers/base/VoiceProvider';
import { generateAPIUrl } from '../lib/generateApiUrl';
import { Button, Card, Text } from '@/components/ui';

// Create a logger function that logs to both console and UI with better formatting
const createLogger = (setMessages: React.Dispatch<React.SetStateAction<string[]>>) => {
    // Helper to clean and truncate response text
    const cleanResponseText = (text: string, maxLength = 300): string => {
        if (!text) return 'Empty response';
        
        // Remove HTML and CSS content
        let cleaned = text
            .replace(/<style[\s\S]*?<\/style>/gi, '[CSS REMOVED]')
            .replace(/<script[\s\S]*?<\/script>/gi, '[SCRIPT REMOVED]')
            .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim();
            
        // Truncate if too long
        if (cleaned.length > maxLength) {
            cleaned = cleaned.substring(0, maxLength) + '...';
        }
        
        return cleaned;
    };
    
    // Helper to format JSON for console output
    const formatJSON = (obj: any): string => {
        try {
            if (typeof obj === 'string') {
                // Try to parse if it's a JSON string
                try {
                    const parsed = JSON.parse(obj);
                    return JSON.stringify(parsed, null, 2);
                } catch {
                    return obj;
                }
            }
            return JSON.stringify(obj, null, 2);
        } catch (error) {
            return String(obj);
        }
    };
    
    return {
        log: (message: string) => {
            console.log(`[ProviderTester] ${message}`);
            setMessages(prev => [...prev, `[ProviderTester] ${message}`]);
        },
        error: (message: string) => {
            console.error(`[ProviderTester ERROR] ${message}`);
            setMessages(prev => [...prev, `[ProviderTester ERROR] ${message}`]);
        },
        response: (title: string, content: any) => {
            let formattedContent: string;
            
            // Format content based on type
            if (typeof content === 'string') {
                formattedContent = cleanResponseText(content);
            } else {
                try {
                    // For objects, pretty print as JSON
                    formattedContent = formatJSON(content);
                } catch (e) {
                    formattedContent = String(content);
                }
            }
            
            console.log(`[ProviderTester RESPONSE] ${title}:`, content);
            setMessages(prev => [...prev, `[ProviderTester RESPONSE] ${title}: ${formattedContent}`]);
        },
        clearLogs: () => {
            setMessages([]);
        }
    };
};

// Provider Tester props
interface ProviderTesterProps {
    providerType?: 'openai' | 'hume';
    uiConfig?: {
        showSendAudioButton?: boolean;
        useToggleButton?: boolean;
    };
}

// Get connection button color based on state
const getConnectionButtonColor = (state: VoiceProviderState) => {
    if (state === 'connected') return 'bg-red-500';
    return 'bg-green-500';
};

// Get text color based on state
const getStateTextColor = (state: VoiceProviderState) => {
    switch (state) {
        case 'connected': return 'text-green-500';
        case 'error': return 'text-red-500';
        case 'connecting': return 'text-orange-500';
        default: return 'text-gray-500';
    }
};

export default function ProviderTester({ 
    providerType = 'openai',
    uiConfig = {
        showSendAudioButton: true,
        useToggleButton: false
    }
}: ProviderTesterProps) {
    const [state, setState] = useState<VoiceProviderState>('disconnected');
    const [messages, setMessages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const providerRef = useRef<VoiceProvider | null>(null);
    
    // Create logger
    const logger = useRef(createLogger(setMessages)).current;
    
    // Get API URLs
    const openaiApiUrl = generateAPIUrl('/api/openai-ws-auth');
    
    // Initialize provider on component mount based on provider type
    useEffect(() => {
        // Clear previous provider
        if (providerRef.current) {
            providerRef.current.disconnect();
            providerRef.current = null;
        }
        
        logger.log(`Initializing ${providerType} provider`);
        
        let provider: VoiceProvider;
        
        if (providerType === 'hume') {
            provider = createHumeVoiceProvider({});
            logger.log('Created Hume voice provider');
        } else {
            // Default to OpenAI
            logger.log(`Using OpenAI API URL: ${openaiApiUrl}`);
            provider = createOpenAIVoiceProvider({
                model: 'gpt-4o-realtime-preview-2024-12-17',
                serverMiddlewareEndpoint: openaiApiUrl,
            });
            logger.log('Created OpenAI voice provider');
        }

        // Listen for state changes
        provider.addEventListener('stateChange', (newState) => {
            setState(newState);
            setIsLoading(false);
            logger.log(`State changed to: ${newState}`);
        });

        // Listen for messages
        provider.addEventListener('message', (message) => {
            logger.log(`Received message: ${message.type}`);
            // Log message content in a cleaner format
            if (message.content) {
                logger.response('Message content', message.content);
            }
        });

        // Listen for errors
        provider.addEventListener('error', (err) => {
            setError(err.message);
            setIsLoading(false);
            logger.error(`Error: ${err.message}`);
        });

        // Listen for audio output
        provider.addEventListener('audioOutput', (audioBlob) => {
            logger.log(`Received audio: ${audioBlob.size} bytes`);
            // For testing, we could play this audio or just log it
        });

        providerRef.current = provider;

        // Clean up on unmount
        return () => {
            provider.disconnect();
        };
    }, [providerType]);

    // Toggle connection (connect/disconnect)
    const toggleConnection = async () => {
        if (!providerRef.current) return;
        
        if (state === 'connected') {
            // Disconnect
            logger.log('Disconnecting...');
            await providerRef.current.disconnect();
        } else {
            // Connect
            try {
                setIsLoading(true);
                logger.log('Connecting...');
                await providerRef.current.connect();
            } catch (e) {
                const err = e as Error;
                setIsLoading(false);
                logger.error(`Connection failed: ${err.message}`);
            }
        }
    };

    // Handle send test audio button
    const handleSendTestAudio = async () => {
        if (!providerRef.current) return;
        
        try {
            setIsLoading(true);
            // Create a dummy audio chunk for testing
            const dummyAudio = new Blob([new Uint8Array(1000)], { type: 'audio/webm' });
            logger.log('Sending test audio...');
            
            await providerRef.current.sendAudio({
                data: dummyAudio,
                timestamp: Date.now(),
                isLastChunk: true
            });
            setIsLoading(false);
        } catch (e) {
            const err = e as Error;
            setIsLoading(false);
            logger.error(`Send audio failed: ${err.message}`);
        }
    };

    // Only show the server connection test for OpenAI
    const testServerConnection = async () => {
        if (providerType !== 'openai') {
            logger.log('Server connection test only available for OpenAI provider');
            return;
        }
        
        try {
            setIsLoading(true);
            logger.log('Testing server connection...');
            const baseUrl = generateAPIUrl('');
            logger.log(`Base URL: ${baseUrl}`);
            
            const response = await fetch(openaiApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-realtime-preview-2024-12-17'
                })
            });
            
            logger.log(`Auth response status: ${response.status}`);
            const data = await response.text();
            logger.response('Auth response', data);
            setIsLoading(false);
        } catch (e) {
            const err = e as Error;
            setIsLoading(false);
            logger.error(`Server connection test failed: ${err.message}`);
        }
    };

    // Clear logs handler
    const clearLogs = () => {
        logger.clearLogs();
    };

    // Get connection button text based on state
    const getConnectionButtonText = () => {
        if (isLoading) return 'Loading...';
        if (state === 'connected') return 'Disconnect';
        return 'Connect';
    };

    return (
        <View className="flex flex-1 flex-col">
            <Card className="p-4 mb-4">
                <View className="flex flex-col space-y-3">
                    <View className="flex flex-row items-center space-x-3">
                        <Text className="text-lg font-bold">Status:</Text>
                        <Text 
                            className={`text-lg ${getStateTextColor(state)}`}
                        >
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                        </Text>
                    </View>

                    {error && (
                        <Text className="text-base text-red-500">
                            Error: {error}
                        </Text>
                    )}

                    <View className="flex flex-row flex-wrap space-x-3">
                        {providerType === 'openai' && (
                            <Button 
                                onPress={testServerConnection}
                                disabled={isLoading}
                                className="bg-blue-500 my-1"
                            >
                                {isLoading ? <ActivityIndicator size="small" color="#ffffff" /> : 'Test Connection'}
                            </Button>
                        )}

                        <Button 
                            onPress={toggleConnection}
                            disabled={isLoading || state === 'connecting'}
                            className={`my-1 ${getConnectionButtonColor(state)}`}
                        >
                            {isLoading ? <ActivityIndicator size="small" color="#ffffff" /> : getConnectionButtonText()}
                        </Button>

                        {uiConfig.showSendAudioButton && (
                            <Button 
                                onPress={handleSendTestAudio}
                                disabled={isLoading || state !== 'connected'}
                                className="bg-purple-500 my-1"
                            >
                                {isLoading ? <ActivityIndicator size="small" color="#ffffff" /> : 'Send Test Audio'}
                            </Button>
                        )}

                        <Button 
                            onPress={clearLogs}
                            className="bg-gray-500 my-1"
                        >
                            Clear Logs
                        </Button>
                    </View>
                </View>
            </Card>

            <Card className="flex-1 p-4">
                <Text className="text-lg font-bold mb-2">
                    Event Log:
                </Text>
                <ScrollView style={{ flex: 1 }}>
                    {messages.map((msg, i) => (
                        <Text key={i} className="text-sm mb-1">
                            {msg}
                        </Text>
                    ))}
                </ScrollView>
            </Card>
        </View>
    );
}