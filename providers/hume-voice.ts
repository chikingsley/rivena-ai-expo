import {
    VoiceProvider,
    VoiceProviderState,
    VoiceProviderEvents,
    VoiceProviderConfig,
    AudioChunk
} from './base/VoiceProvider';
import { convertBlobToBase64, convertBase64ToBlob, HumeClient } from 'hume';

// Configuration validation
const configId = process.env.EXPO_PUBLIC_HUME_CONFIG_ID;
const apiKey = process.env.EXPO_PUBLIC_HUME_API_KEY;
const secretKey = process.env.EXPO_PUBLIC_HUME_SECRET_KEY;

if (!apiKey || !secretKey) {
    throw new Error('HUME_API_KEY and HUME_SECRET_KEY must be set in environment variables');
}

export interface HumeVoiceConfig extends VoiceProviderConfig {
    configId?: string; // Optional - use env var if not provided
}

export const createHumeVoiceProvider = (initialConfig: HumeVoiceConfig): VoiceProvider => {
    let client: HumeClient | null = null;
    let socket: any = null; // Will be properly typed when connected
    let state: VoiceProviderState = 'disconnected';
    let config: HumeVoiceConfig = {
        audioFormat: 'webm',
        reconnectAttempts: 5,
        reconnectInterval: 1000,
        ...initialConfig
    };
    let reconnectCount = 0;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    // Event listeners management (same as in OpenAI provider)
    const eventListeners: {
        [K in keyof VoiceProviderEvents]?: VoiceProviderEvents[K][];
    } = {
        message: [],
        audioOutput: [],
        error: [],
        stateChange: [],
        audioLevel: []
    };

    // Helper function to emit events (same as in OpenAI provider)
    const emit = <K extends keyof VoiceProviderEvents>(
        event: K,
        ...args: Parameters<VoiceProviderEvents[K]>
    ) => {
        const listeners = eventListeners[event] || [];
        listeners.forEach(listener => {
            try {
                // @ts-ignore - This is a bit of a hack but works with our event system
                listener(...args);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        });
    };

    // Helper to update state (same as in OpenAI provider)
    const setState = (newState: VoiceProviderState) => {
        if (state !== newState) {
            state = newState;
            emit('stateChange', newState);
        }
    };

    // Connect to Hume's EVI WebSocket
    const connect = async (): Promise<void> => {
        if (state === 'connected' || state === 'connecting') {
            return;
        }

        setState('connecting');

        try {
            // Initialize Hume client
            client = new HumeClient({
                apiKey: apiKey || '',
                secretKey: secretKey || '',
            });

            // Connect to the Hume EVI WebSocket
            socket = await client.empathicVoice.chat.connect({
                configId: config.configId || configId || undefined,
                verboseTranscription: true, // Better for interruption handling
            });

            // Setup event handlers
            socket.on('open', () => {
                reconnectCount = 0;
                setState('connected');
                console.log('Connected to Hume EVI WebSocket');
            });

            socket.on('message', (message: any) => {
                try {
                    // Handle different Hume message types
                    switch (message.type) {
                        case 'user_message':
                            // Forward user message (transcription) to our components
                            emit('message', { 
                                type: 'user_message', 
                                content: {
                                    text: message.message?.content || '',
                                    prosody: message.models?.prosody?.scores || {}
                                }
                            });
                            break;

                        case 'assistant_message':
                            // Forward assistant message to our components
                            emit('message', { 
                                type: 'assistant_message', 
                                content: message.message?.content || ''
                            });
                            break;

                        case 'audio_output':
                            // Process and emit audio data
                            if (message.data) {
                                const audioBlob = convertBase64ToBlob(message.data);
                                emit('audioOutput', audioBlob);
                            }
                            break;

                        case 'error':
                            // Handle errors
                            emit('error', new Error(message.message || 'Unknown Hume error'));
                            break;

                        case 'user_interruption':
                            // Notify of user interruption
                            emit('message', { 
                                type: 'interrupt', 
                                content: 'User interrupted' 
                            });
                            break;

                        default:
                            // Forward other messages
                            emit('message', { 
                                type: message.type, 
                                content: message 
                            });
                    }
                } catch (error) {
                    console.error('Error processing Hume message:', error);
                    emit('error', new Error('Failed to process message'));
                }
            });

            socket.on('error', (error: any) => {
                console.error('Hume WebSocket error:', error);
                emit('error', new Error('WebSocket connection error'));

                if (state !== 'error') {
                    setState('error');
                }
            });

            socket.on('close', () => {
                if (state !== 'disconnected') {
                    // If not intentionally disconnected, try to reconnect
                    if (reconnectCount < (config.reconnectAttempts || 5)) {
                        setState('reconnecting');

                        // Exponential backoff for reconnect
                        const delay = Math.min(
                            (config.reconnectInterval || 1000) * Math.pow(1.5, reconnectCount),
                            30000 // Max 30 second delay
                        );

                        reconnectCount++;

                        reconnectTimeout = setTimeout(() => {
                            reconnect();
                        }, delay);
                    } else {
                        setState('error');
                        emit('error', new Error(`WebSocket closed after ${reconnectCount} reconnect attempts`));
                    }
                }
            });

        } catch (error) {
            console.error('Hume connection error:', error);
            setState('error');
            emit('error', error instanceof Error ? error : new Error('Failed to connect to Hume'));
        }
    };

    // Disconnect from the WebSocket
    const disconnect = async (): Promise<void> => {
        // Clear any pending reconnect
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        if (socket) {
            // Only change state if we're actually connected
            if (state !== 'disconnected') {
                setState('disconnected');
            }

            socket.disconnect();
            socket = null;
        }

        client = null;
    };

    // Attempt to reconnect
    const reconnect = async (): Promise<void> => {
        await disconnect();
        await connect();
    };

    // Send audio data to Hume
    const sendAudio = async (chunk: AudioChunk): Promise<void> => {
        if (!socket || state !== 'connected') {
            throw new Error('WebSocket not connected');
        }

        try {
            // Convert blob to base64
            const base64Data = await convertBlobToBase64(chunk.data);

            // Send to Hume WebSocket using their API format
            socket.sendAudioInput({ 
                data: base64Data 
            });
        } catch (error) {
            console.error('Error sending audio to Hume:', error);
            emit('error', error instanceof Error ? error : new Error('Failed to send audio'));
        }
    };

    // Interrupt the current response
    const interrupt = async (): Promise<void> => {
        if (!socket || state !== 'connected') {
            return;
        }

        try {
            // Hume has specific interruption handling - just making noise
            // is enough to cause interruption, but we can also send a specific message
            socket.sendInterruption();
        } catch (error) {
            console.error('Error sending interrupt to Hume:', error);
        }
    };

    // Update provider configuration
    const updateConfig = (newConfig: Partial<HumeVoiceConfig>): void => {
        config = { ...config, ...newConfig };
    };

    // Return the public interface (same shape as OpenAI provider)
    return {
        connect,
        disconnect,
        reconnect,
        sendAudio,
        interrupt,
        getState: () => state,
        addEventListener: <K extends keyof VoiceProviderEvents>(
            event: K,
            listener: VoiceProviderEvents[K]
        ) => {
            if (!eventListeners[event]) {
                eventListeners[event] = [];
            }
            eventListeners[event]?.push(listener);
        },
        removeEventListener: <K extends keyof VoiceProviderEvents>(
            event: K,
            listener: VoiceProviderEvents[K]
        ) => {
            const listeners = eventListeners[event];
            if (listeners) {
                eventListeners[event] = listeners.filter(l => l !== listener) as typeof listeners;
            }
        },
        updateConfig
    };
}; 