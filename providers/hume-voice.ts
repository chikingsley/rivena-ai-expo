import {
    VoiceProvider,
    VoiceProviderState,
    VoiceProviderEvents,
    VoiceProviderConfig,
    AudioChunk
} from './base/VoiceProvider';
import {
    HumeClient,
    convertBlobToBase64,
    convertBase64ToBlob
    // Commented out for now, will use later
    // getBrowserSupportedMimeType,
    // getAudioStream,
    // ensureSingleValidAudioTrack,
    // MimeType
} from 'hume';
import { Platform } from 'react-native';
import { getHumeAccessToken } from '../lib/getHumeAccessToken';

// For React Native audio handling
interface AudioData {
    type: string;
    base64Data: string;
}

// Configuration validation
const configId = process.env.EXPO_PUBLIC_HUME_CONFIG_ID;

export interface HumeVoiceConfig extends VoiceProviderConfig {
    configId?: string;
}

export const createHumeVoiceProvider = (initialConfig: HumeVoiceConfig): VoiceProvider => {
    let client: HumeClient | null = null;
    let socket: any = null;
    let currentState: VoiceProviderState = 'disconnected';
    let config: HumeVoiceConfig = {
        audioFormat: 'webm',
        reconnectAttempts: 5,
        reconnectInterval: 1000,
        ...initialConfig
    };
    let reconnectCount = 0;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    // Commented out for now, will use later
    // let audioStream: MediaStream | null = null;
    // let recorder: MediaRecorder | null = null;
    // const mimeType = (() => {
    //     const result = getBrowserSupportedMimeType();
    //     return result.success ? result.mimeType : MimeType.WEBM;
    // })();

    // Audio playback queue
    const audioQueue: Blob[] = [];
    let isPlaying = false;
    let currentAudio: HTMLAudioElement | null = null;

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

    const setState = (newState: VoiceProviderState) => {
        if (currentState !== newState) {
            currentState = newState;
            emit('stateChange', newState);
        }
    };

    // Audio playback functions
    const playAudio = () => {
        if (!audioQueue.length || isPlaying) return;

        isPlaying = true;
        const audioBlob = audioQueue.shift();
        if (!audioBlob) return;

        try {
            const audioUrl = URL.createObjectURL(audioBlob);
            currentAudio = new Audio(audioUrl);

            currentAudio.play().catch(error => {
                console.error('Error playing audio:', error);
                isPlaying = false;
                if (audioQueue.length) playAudio();
            });

            currentAudio.onended = () => {
                isPlaying = false;
                if (audioQueue.length) playAudio();
            };
        } catch (error) {
            console.error('Error creating audio element:', error);
            isPlaying = false;
            if (audioQueue.length) playAudio();
        }
    };

    const stopAudio = () => {
        if (currentAudio) {
            try {
                currentAudio.pause();
            } catch (error) {
                console.error('Error stopping audio:', error);
            }
            currentAudio = null;
        }
        isPlaying = false;
        audioQueue.length = 0;
    };

    // Commented out for now, will use later
    /*
    // Start recording audio
    const startRecording = async () => {
        try {
            audioStream = await getAudioStream();
            ensureSingleValidAudioTrack(audioStream);

            recorder = new MediaRecorder(audioStream, { mimeType });
            recorder.ondataavailable = async ({ data }) => {
                if (data.size < 1) return;
                
                const encodedAudioData = await convertBlobToBase64(data);
                socket?.sendAudioInput({ data: encodedAudioData });
            };

            // Capture audio input at 100ms intervals (recommended for web)
            recorder.start(100);
        } catch (error) {
            console.error('Error starting recording:', error);
            emit('error', error instanceof Error ? error : new Error('Failed to start recording'));
        }
    };

    const stopRecording = () => {
        recorder?.stop();
        audioStream?.getTracks().forEach(track => track.stop());
        recorder = null;
        audioStream = null;
    };
    */

    const connect = async (): Promise<void> => {
        if (currentState === 'connected' || currentState === 'connecting') {
            return;
        }

        setState('connecting');

        try {
            // Get access token for client-side authentication
            const accessToken = await getHumeAccessToken();

            if (!accessToken) {
                throw new Error('Failed to get Hume access token');
            }

            // Initialize Hume client with access token
            client = new HumeClient({
                accessToken
            });

            // Connect to the Hume EVI WebSocket
            socket = await client.empathicVoice.chat.connect({
                configId: config.configId || configId || undefined,
                verboseTranscription: true
            });

            socket.on('open', () => {
                reconnectCount = 0;
                setState('connected');
                console.log('Connected to Hume EVI WebSocket');

                // Send a simple text message to initialize the chat
                try {
                    // The SDK's sendUserInput method takes a simple string
                    socket.sendUserInput("Hello");

                    // Also try sending session settings separately
                    socket.sendSessionSettings({
                        type: "session_settings",
                        variables: {
                            datetime: new Date().toISOString()
                        }
                    });
                } catch (error) {
                    console.error('Error sending initial message:', error);
                }
            });

            socket.on('message', (message: any) => {
                try {
                    switch (message.type) {
                        case 'user_message':
                            emit('message', {
                                type: 'user_message',
                                content: {
                                    text: message.message?.content || '',
                                    prosody: message.models?.prosody?.scores || {}
                                }
                            });
                            break;

                        case 'assistant_message':
                            emit('message', {
                                type: 'assistant_message',
                                content: message.message?.content || ''
                            });
                            break;

                        case 'audio_output':
                            if (message.data) {
                                try {
                                    // Handle differently based on platform
                                    if (Platform.OS === 'web') {
                                        // For web, use the SDK's convertBase64ToBlob
                                        const audioBlob = convertBase64ToBlob(message.data);
                                        emit('audioOutput', audioBlob);

                                        // Add to queue for playback
                                        audioQueue.push(audioBlob);
                                        if (audioQueue.length === 1) playAudio();
                                    } else {
                                        // For React Native, just emit the base64 data
                                        // We'll handle it differently in the consumer
                                        emit('audioOutput', {
                                            type: 'audio/webm',
                                            base64Data: message.data
                                        } as unknown as Blob);
                                    }
                                } catch (error) {
                                    console.error('Error processing audio output:', error);
                                }
                            }
                            break;

                        case 'error':
                            emit('error', new Error(message.message || 'Unknown Hume error'));
                            break;

                        case 'user_interruption':
                            stopAudio();
                            emit('message', {
                                type: 'interrupt',
                                content: 'User interrupted'
                            });
                            break;

                        default:
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
                setState('error');
            });

            socket.on('close', () => {
                // Commented out for now, will use later
                // stopRecording();

                if (currentState !== 'disconnected') {
                    if (reconnectCount < (config.reconnectAttempts || 5)) {
                        setState('reconnecting');
                        const delay = Math.min(
                            (config.reconnectInterval || 1000) * Math.pow(1.5, reconnectCount),
                            30000
                        );
                        reconnectCount++;
                        reconnectTimeout = setTimeout(reconnect, delay);
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

    const disconnect = async (): Promise<void> => {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        // Commented out for now, will use later
        // stopRecording();
        stopAudio();

        if (socket) {
            if (currentState !== 'disconnected') {
                setState('disconnected');
            }

            try {
                await socket.close();
            } catch (error) {
                console.error('Error disconnecting socket:', error);
            }

            socket = null;
        }

        client = null;
    };

    const reconnect = async (): Promise<void> => {
        await disconnect();
        await connect();
    };

    const sendAudio = async (chunk: AudioChunk): Promise<void> => {
        if (!socket || currentState !== 'connected') {
            throw new Error('WebSocket not connected');
        }

        try {
            const base64Data = await convertBlobToBase64(chunk.data);
            socket.sendAudioInput({
                data: base64Data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error sending audio to Hume:', error);
            emit('error', error instanceof Error ? error : new Error('Failed to send audio'));
        }
    };

    const interrupt = async (): Promise<void> => {
        if (!socket || currentState !== 'connected') {
            return;
        }

        try {
            socket.sendInterrupt();
        } catch (error) {
            console.error('Error interrupting:', error);
        }
    };

    const updateConfig = (newConfig: Partial<HumeVoiceConfig>): void => {
        config = { ...config, ...newConfig };
    };

    const addEventListener = <K extends keyof VoiceProviderEvents>(
        event: K,
        listener: VoiceProviderEvents[K]
    ): void => {
        if (!eventListeners[event]) {
            eventListeners[event] = [];
        }
        eventListeners[event]?.push(listener);
    };

    const removeEventListener = <K extends keyof VoiceProviderEvents>(
        event: K,
        listener: VoiceProviderEvents[K]
    ): void => {
        if (!eventListeners[event]) return;
        const index = eventListeners[event]?.indexOf(listener) ?? -1;
        if (index > -1) {
            eventListeners[event]?.splice(index, 1);
        }
    };

    return {
        connect,
        disconnect,
        sendAudio,
        interrupt,
        updateConfig,
        addEventListener,
        removeEventListener,
        getState: () => currentState,
        reconnect
    };
}; 