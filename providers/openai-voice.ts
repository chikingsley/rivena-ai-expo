// providers/openai-voice.ts
import {
    VoiceProvider,
    VoiceProviderState,
    VoiceProviderEvents,
    VoiceProviderConfig,
    AudioChunk
} from './base/VoiceProvider';

const ai_model = process.env.EXPO_PUBLIC_OPENAI_MODEL;      
const serverMiddlewareEndpoint = process.env.EXPO_PUBLIC_MIDDLEWARE_ENDPOINT; // Your Elysia server endpoint for auth

if (!ai_model || !serverMiddlewareEndpoint) {
    throw new Error('OPENAI_MODEL and OPENAI_SERVER_MIDDLEWARE_ENDPOINT must be set');
}

export interface OpenAIVoiceConfig extends VoiceProviderConfig {
    model: typeof ai_model; 
    serverMiddlewareEndpoint: typeof serverMiddlewareEndpoint; // Your Elysia server endpoint for auth
}

export const createOpenAIVoiceProvider = (initialConfig: OpenAIVoiceConfig): VoiceProvider => {
    let ws: WebSocket | null = null;
    let state: VoiceProviderState = 'disconnected';
    let config: OpenAIVoiceConfig = {
        audioFormat: 'webm',
        reconnectAttempts: 5,
        reconnectInterval: 1000,
        ...initialConfig
    };
    let reconnectCount = 0;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    // Event listeners management
    const eventListeners: {
        [K in keyof VoiceProviderEvents]?: VoiceProviderEvents[K][];
    } = {
        message: [],
        audioOutput: [],
        error: [],
        stateChange: [],
        audioLevel: []
    };

    // Helper function to emit events
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

    // Helper to update state
    const setState = (newState: VoiceProviderState) => {
        if (state !== newState) {
            state = newState;
            emit('stateChange', newState);
        }
    };

    // Connect to OpenAI's WebSocket API
    const connect = async (): Promise<void> => {
        if (state === 'connected' || state === 'connecting') {
            return;
        }

        setState('connecting');

        try {
            // Get authenticated WebSocket URL from your middleware
            const response = await fetch(config.serverMiddlewareEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: config.model
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to get WebSocket URL: ${response.status}`);
            }

            const { url, headers, protocol } = await response.json();

            console.log('Creating WebSocket with URL:', url);
            console.log('Using headers:', headers);

            // Set up the WebSocket protocols as specified in OpenAI docs
            const protocols = [
                protocol,
                // Add the auth header as a protocol string
                `openai-insecure-api-key.${headers.Authorization.replace('Bearer ', '')}`,
                `model.${config.model}`,
                "openai-beta.realtime-v1"
            ];
            
            // Create WebSocket with correct protocols
            ws = new WebSocket(url, protocols);

            ws.onopen = () => {
                reconnectCount = 0;
                setState('connected');

                // Send initial configuration
                if (ws && ws.readyState === WebSocket.OPEN) {
                    const initEvent = {
                        type: "response.create",
                        response: {
                            modalities: ["audio", "text"],
                            instructions: "You are a helpful voice assistant."
                        }
                    };
                    ws.send(JSON.stringify(initEvent));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Handle different message types from OpenAI
                    switch (data.type) {
                        case 'text_delta':
                            // Only log a brief summary of delta updates
                            emit('message', { 
                                type: 'text_delta', 
                                content: data.delta?.text ? 'Text delta received' : 'Empty delta'
                            });
                            break;

                        case 'audio_chunk':
                            // Process audio data
                            if (data.audio && data.audio.data) {
                                const audioBlob = base64ToBlob(data.audio.data, 'audio/webm');
                                emit('audioOutput', audioBlob);
                                // Log just the size of audio data
                                emit('message', { 
                                    type: 'audio_chunk', 
                                    content: `Received audio chunk: ${audioBlob.size} bytes`
                                });
                            }
                            break;

                        case 'error':
                            // Handle errors
                            emit('error', new Error(data.error || 'Unknown WebSocket error'));
                            break;

                        case 'response.metrics':
                            // Log metrics in a cleaner format
                            emit('message', {
                                type: 'metrics',
                                content: {
                                    input_tokens: data.metrics?.input_tokens,
                                    output_tokens: data.metrics?.output_tokens
                                }
                            });
                            break;

                        default:
                            // For other messages, omit large data structures
                            const cleanContent = { ...data };
                            delete cleanContent.delta;  // Remove verbose delta content
                            delete cleanContent.audio;  // Remove binary audio data
                            emit('message', { type: data.type, content: cleanContent });
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                    emit('error', new Error('Failed to process message'));
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                emit('error', new Error('WebSocket connection error'));

                if (state !== 'error') {
                    setState('error');
                }
            };

            ws.onclose = (event) => {
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
            };

        } catch (error) {
            console.error('Connection error:', error);
            setState('error');
            emit('error', error instanceof Error ? error : new Error('Failed to connect'));
        }
    };

    // Disconnect from the WebSocket
    const disconnect = async (): Promise<void> => {
        // Clear any pending reconnect
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        if (ws) {
            // Only change state if we're actually connected
            if (state !== 'disconnected') {
                setState('disconnected');
            }

            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }

            ws = null;
        }
    };

    // Attempt to reconnect
    const reconnect = async (): Promise<void> => {
        await disconnect();
        await connect();
    };

    // Send audio data to the WebSocket
    const sendAudio = async (chunk: AudioChunk): Promise<void> => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        try {
            // Convert blob to base64
            const base64Data = await blobToBase64(chunk.data);

            // Create the audio_input message
            const audioMessage = {
                type: 'audio_input',
                data: base64Data,
                is_last_chunk: !!chunk.isLastChunk
            };

            // Send to WebSocket
            ws.send(JSON.stringify(audioMessage));
        } catch (error) {
            console.error('Error sending audio:', error);
            emit('error', error instanceof Error ? error : new Error('Failed to send audio'));
        }
    };

    // Interrupt the current response
    const interrupt = async (): Promise<void> => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return;
        }

        try {
            const interruptMessage = {
                type: 'interrupt'
            };

            ws.send(JSON.stringify(interruptMessage));
        } catch (error) {
            console.error('Error sending interrupt:', error);
        }
    };

    // Update provider configuration
    const updateConfig = (newConfig: Partial<OpenAIVoiceConfig>): void => {
        config = { ...config, ...newConfig };
    };

    // Helper function: Convert blob to base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    // Remove data URL prefix
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                } else {
                    reject(new Error('Failed to convert blob to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Helper function: Convert base64 to blob
    const base64ToBlob = (base64: string, mimeType: string): Blob => {
        const byteString = atob(base64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }

        return new Blob([arrayBuffer], { type: mimeType });
    };

    // Public interface
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