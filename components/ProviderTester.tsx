// components/ProviderTester.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Platform } from 'react-native';
import { createOpenAIVoiceProvider } from '../providers/openai-voice';
import { createHumeVoiceProvider } from '../providers/hume-voice';
import type { VoiceProvider, VoiceProviderState } from '../providers/base/VoiceProvider';
import { generateAPIUrl } from '../lib/utils';

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
        } catch (e) {
            return String(obj);
        }
    };
    
    return {
        log: (message: string) => {
            console.log(`[ProviderTester] ${message}`);
            setMessages(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
        },
        error: (message: string) => {
            console.error(`[ProviderTester ERROR] ${message}`);
            setMessages(prev => [...prev, `[${new Date().toISOString()}] ERROR: ${message}`]);
        },
        warn: (message: string) => {
            console.warn(`[ProviderTester WARNING] ${message}`);
            setMessages(prev => [...prev, `[${new Date().toISOString()}] WARNING: ${message}`]);
        },
        debug: (message: string) => {
            console.debug(`[ProviderTester DEBUG] ${message}`);
            // Optionally add to UI if you want verbose logs
            // setMessages(prev => [...prev, `[${new Date().toISOString()}] DEBUG: ${message}`]);
        },
        // Log response data with cleaning
        response: (title: string, data: any) => {
            if (typeof data === 'string') {
                const cleaned = cleanResponseText(data);
                console.log(`[ProviderTester RESPONSE] ${title}:\n${cleaned}`);
            } else {
                try {
                    // For objects, try to stringify with formatting
                    console.log(`[ProviderTester RESPONSE] ${title}:\n${formatJSON(data)}`);
                } catch (e) {
                    console.log(`[ProviderTester RESPONSE] ${title}: [Complex data]`);
                }
            }
            setMessages(prev => [...prev, `[${new Date().toISOString()}] ${title} received`]);
        },
        clearLogs: () => {
            setMessages([]);
        }
    };
};

// Provider Tester props
interface ProviderTesterProps {
    providerType?: 'openai' | 'hume';
}

export default function ProviderTester({ providerType = 'openai' }: ProviderTesterProps) {
    const [state, setState] = useState<VoiceProviderState>('disconnected');
    const [messages, setMessages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
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

    // Handle connect button
    const handleConnect = async () => {
        if (!providerRef.current) return;
        try {
            logger.log('Connecting...');
            await providerRef.current.connect();
        } catch (e) {
            const err = e as Error;
            logger.error(`Connection failed: ${err.message}`);
        }
    };

    // Handle disconnect button
    const handleDisconnect = async () => {
        if (!providerRef.current) return;
        logger.log('Disconnect called');
        await providerRef.current.disconnect();
    };

    // Handle send test audio button
    const handleSendTestAudio = async () => {
        if (!providerRef.current) return;
        
        try {
            // Create a dummy audio chunk for testing
            const dummyAudio = new Blob([new Uint8Array(1000)], { type: 'audio/webm' });
            logger.log('Sending test audio...');
            
            await providerRef.current.sendAudio({
                data: dummyAudio,
                timestamp: Date.now(),
                isLastChunk: true
            });
        } catch (e) {
            const err = e as Error;
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
        } catch (e) {
            const err = e as Error;
            logger.error(`Server connection test failed: ${err.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{providerType === 'hume' ? 'Hume AI' : 'OpenAI'} Voice Provider Test</Text>
            <Text style={styles.state}>State: {state}</Text>
            {providerType === 'openai' && (
                <Text style={styles.apiUrl}>API URL: {openaiApiUrl}</Text>
            )}
            {error && (
                <Text style={styles.error}>{error}</Text>
            )}
            <View style={styles.buttonContainer}>
                {providerType === 'openai' && (
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Test Server Connection"
                            onPress={testServerConnection}
                        />
                    </View>
                )}

                <View style={styles.buttonWrapper}>
                    <Button
                        title="Connect"
                        onPress={handleConnect}
                        disabled={state === 'connecting' || state === 'connected'}
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <Button
                        title="Disconnect"
                        onPress={handleDisconnect}
                        disabled={state === 'disconnected'}
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <Button
                        title="Send Audio"
                        onPress={handleSendTestAudio}
                        disabled={state !== 'connected'}
                    />
                </View>
            </View>

            <Text style={styles.logsTitle}>Event Log:</Text>
            <ScrollView style={styles.logs}>
                {messages.map((msg, i) => (
                    <Text key={i} style={styles.logEntry}>{msg}</Text>
                ))}
            </ScrollView>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugInfo}>
                Provider: {providerType}{'\n'}
                Platform: {Platform.OS}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    state: {
        fontSize: 16,
        marginBottom: 4,
        textAlign: 'center',
    },
    apiUrl: {
        fontSize: 12,
        marginBottom: 12,
        textAlign: 'center',
        color: '#666',
    },
    error: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'column',
        marginVertical: 16,
    },
    buttonWrapper: {
        marginVertical: 8,
        width: '100%',
    },
    logsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    logs: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 8,
        marginTop: 8,
        borderRadius: 4,
    },
    logEntry: {
        fontSize: 12,
        marginBottom: 4,
    },
    debugTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    debugInfo: {
        marginTop: 8,
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
});