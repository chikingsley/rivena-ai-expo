# Audio Integration Plan for Rivena AI Expo

This document outlines a comprehensive plan for enhancing the audio processing capabilities of the Rivena AI application by standardizing audio utilities and implementing a provider registry pattern.

## Current Architecture Analysis

After examining the existing codebase, I've identified the following components:

1. **Base VoiceProvider Interface** (`/providers/base/VoiceProvider.ts`):
   - Defines the core interface for voice providers
   - Includes types for provider state, audio formats, and events
   - Provides a consistent API for audio interaction

2. **Provider Implementations**:
   - OpenAI Voice Provider (`/providers/openai-voice.ts`)
   - Hume Voice Provider (`/providers/hume-voice.ts`)
   - Both implement the VoiceProvider interface but with different internal logic

3. **Common Patterns**:
   - WebSocket management for real-time audio streaming
   - Audio encoding/decoding (base64 ↔ Blob)
   - Event handling system
   - Reconnection logic
   - Audio playback queue management

## Identified Issues and Opportunities

1. **Code Duplication**:
   - Both providers implement similar audio processing utilities
   - Playback queue logic is duplicated
   - Base64 encoding/decoding functions are repeated

2. **Provider Selection**:
   - No centralized mechanism for provider creation and selection
   - No easy way to add new providers without modifying application code

3. **Audio Processing**:
   - No standardized audio processing utilities
   - Limited audio quality control features
   - No shared implementation for echo cancellation, noise suppression, etc.

## Proposed Solutions

### 1. Audio Utilities Module

Create a shared audio utilities module to eliminate code duplication and standardize audio processing:

**File**: `/providers/utils/audio-processor.ts`

```typescript
import { AudioFormat } from '../base/VoiceProvider';

export interface AudioProcessingOptions {
  format: AudioFormat;
  sampleRate?: number;
  channels?: number;
  chunkDuration?: number; // in ms
  noiseSuppression?: boolean;
  echoCancellation?: boolean;
  autoGainControl?: boolean;
}

export class AudioProcessor {
  // Convert blob to base64 (used by both providers)
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1] || '';
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }
  
  // Convert base64 to blob (used by both providers)
  static base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  }
  
  // Create a standardized audio playback queue
  static createPlaybackQueue() {
    const audioQueue: Blob[] = [];
    let isPlaying = false;
    let currentAudio: HTMLAudioElement | null = null;
    
    return {
      enqueue: (audioBlob: Blob) => {
        audioQueue.push(audioBlob);
        if (!isPlaying) {
          playNext();
        }
      },
      
      playNext: function playNext() {
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
            if (audioQueue.length) this.playNext();
          });
          
          currentAudio.onended = () => {
            isPlaying = false;
            if (audioQueue.length) this.playNext();
          };
        } catch (error) {
          console.error('Error creating audio element:', error);
          isPlaying = false;
          if (audioQueue.length) this.playNext();
        }
      },
      
      stop: () => {
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
      }
    };
  }
  
  // Get audio constraints based on processing options
  static getAudioConstraints(options: AudioProcessingOptions): MediaStreamConstraints {
    return {
      audio: {
        echoCancellation: options.echoCancellation ?? true,
        noiseSuppression: options.noiseSuppression ?? true,
        autoGainControl: options.autoGainControl ?? true,
        sampleRate: options.sampleRate,
        channelCount: options.channels
      },
      video: false
    };
  }
  
  // Get MIME type based on audio format
  static getMimeType(format: AudioFormat): string {
    switch (format) {
      case 'webm':
        return 'audio/webm';
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      default:
        return 'audio/webm';
    }
  }
  
  // Calculate audio level (for visualization)
  static calculateAudioLevel(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += Math.abs(audioData[i]);
    }
    return sum / audioData.length;
  }
}
```

### 2. Provider Registry

Create a provider registry to centralize provider creation and management:

**File**: `/providers/index.ts`

```typescript
import { VoiceProvider, VoiceProviderConfig } from './base/VoiceProvider';
import { createOpenAIVoiceProvider, OpenAIVoiceConfig } from './openai-voice';
import { createHumeVoiceProvider, HumeVoiceConfig } from './hume-voice';

// Define all available providers
export type ProviderType = 'openai' | 'hume';

// Union type of all provider configs
export type ProviderConfig = OpenAIVoiceConfig | HumeVoiceConfig;

// Provider registry/factory
export class VoiceProviderRegistry {
  private static providers: Record<ProviderType, (config: any) => VoiceProvider> = {
    'openai': createOpenAIVoiceProvider,
    'hume': createHumeVoiceProvider
  };
  
  // Create a provider instance
  static create(type: ProviderType, config: ProviderConfig): VoiceProvider {
    const factory = this.providers[type];
    if (!factory) {
      throw new Error(`Provider type '${type}' not supported`);
    }
    return factory(config);
  }
  
  // Register a new provider type
  static register(type: string, factory: (config: any) => VoiceProvider): void {
    this.providers[type as ProviderType] = factory;
  }
  
  // Get default config for a provider
  static getDefaultConfig(type: ProviderType): ProviderConfig {
    switch(type) {
      case 'openai':
        return {
          model: process.env.EXPO_PUBLIC_OPENAI_MODEL,
          serverMiddlewareEndpoint: process.env.EXPO_PUBLIC_MIDDLEWARE_ENDPOINT,
          audioFormat: 'webm',
          reconnectAttempts: 5,
          reconnectInterval: 1000,
        } as OpenAIVoiceConfig;
      case 'hume':
        return {
          configId: process.env.EXPO_PUBLIC_HUME_CONFIG_ID,
          audioFormat: 'webm',
          reconnectAttempts: 5,
          reconnectInterval: 1000,
        } as HumeVoiceConfig;
      default:
        throw new Error(`Provider type '${type}' not supported`);
    }
  }
  
  // Get list of available providers
  static getAvailableProviders(): ProviderType[] {
    return Object.keys(this.providers) as ProviderType[];
  }
}
```

### 3. Provider Implementation Updates

Update the existing provider implementations to use the shared audio utilities:

**File**: `/providers/openai-voice.ts` (Partial update)

```typescript
import { AudioProcessor } from './utils/audio-processor';
// ... other imports

export const createOpenAIVoiceProvider = (initialConfig: OpenAIVoiceConfig): VoiceProvider => {
    // ... existing code
    
    // Replace with shared audio processor
    const playbackQueue = AudioProcessor.createPlaybackQueue();
    
    // ... existing code
    
    // Use shared audio utilities
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                // ... existing cases
                
                case 'audio_chunk':
                    if (data.audio && data.audio.data) {
                        const audioBlob = AudioProcessor.base64ToBlob(data.audio.data, 'audio/webm');
                        emit('audioOutput', audioBlob);
                        playbackQueue.enqueue(audioBlob);
                        // ... rest of handler
                    }
                    break;
                
                // ... other cases
            }
        } catch (error) {
            // ... error handling
        }
    };
    
    // ... existing code
    
    // Use shared audio processor for sending audio
    const sendAudio = async (chunk: AudioChunk): Promise<void> => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                const base64Data = await AudioProcessor.blobToBase64(chunk.data);
                // ... rest of method
            } catch (error) {
                // ... error handling
            }
        }
    };
    
    // ... rest of implementation
};
```

**File**: `/providers/hume-voice.ts` (Partial update)

```typescript
import { AudioProcessor } from './utils/audio-processor';
// ... other imports

export const createHumeVoiceProvider = (initialConfig: HumeVoiceConfig): VoiceProvider => {
    // ... existing code
    
    // Replace with shared audio processor
    const playbackQueue = AudioProcessor.createPlaybackQueue();
    
    // ... existing code
    
    // Use shared audio utilities for audio handling
    socket.on('audio', async (audioData: AudioData) => {
        try {
            if (audioData.base64Data) {
                const audioBlob = AudioProcessor.base64ToBlob(
                    audioData.base64Data,
                    AudioProcessor.getMimeType(config.audioFormat || 'webm')
                );
                emit('audioOutput', audioBlob);
                playbackQueue.enqueue(audioBlob);
                // ... rest of handler
            }
        } catch (error) {
            // ... error handling
        }
    });
    
    // ... existing code
    
    // Use shared audio processor for sending audio
    const sendAudio = async (chunk: AudioChunk): Promise<void> => {
        if (socket && currentState === 'connected') {
            try {
                const base64Data = await AudioProcessor.blobToBase64(chunk.data);
                socket.sendAudioInput({ data: base64Data });
                // ... rest of method
            } catch (error) {
                // ... error handling
            }
        }
    };
    
    // ... rest of implementation
};
```

## Implementation Steps

1. **Create Audio Utilities**:
   - Implement the `audio-processor.ts` file with shared utilities
   - Test basic functionality (encoding/decoding, playback queue)

2. **Create Provider Registry**:
   - Implement the provider registry in `providers/index.ts`
   - Ensure type safety for different provider configurations

3. **Update Existing Providers**:
   - Modify OpenAI provider to use shared utilities
   - Modify Hume provider to use shared utilities
   - Test both providers with the new utilities

4. **Enhance Audio Processing**:
   - Add advanced audio processing features (noise suppression, echo cancellation)
   - Implement audio visualization utilities

## References

### Documentation Sources

1. **Hume AI Documentation**:
   - [Hume AI Audio Handling](/Users/simonpeacocks/Documents/GitHub/rivena-ai-expo/references/humeai-audio.md)
   - [Hume AI WebSockets](/Users/simonpeacocks/Documents/GitHub/rivena-ai-expo/references/humeai-websockets.md)

2. **OpenAI Documentation**:
   - [OpenAI Audio](/Users/simonpeacocks/Documents/GitHub/rivena-ai-expo/references/openai-audio.md)

3. **WebSockets Reference**:
   - [Twilio WebSockets](/Users/simonpeacocks/Documents/GitHub/rivena-ai-expo/references/twilio-websockets.md)

### Web API References

1. **Web Audio API**:
   - [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
   - [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)

2. **MediaStream API**:
   - [MediaStream Recording](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API)
   - [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

3. **WebRTC**:
   - [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
   - [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)

## Expected Benefits

1. **Reduced Code Duplication**:
   - Shared audio utilities eliminate redundant code
   - Consistent audio handling across providers

2. **Improved Maintainability**:
   - Centralized provider management
   - Easier to add new providers

3. **Enhanced Audio Quality**:
   - Standardized audio processing options
   - Better noise handling and echo cancellation

4. **Simplified Usage**:
   - Consistent API for all providers
   - Easy provider switching

## Future Enhancements

1. **Additional Providers**:
   - Add support for other AI voice services (e.g., Anthropic, Eleven Labs)
   - Create adapter for local voice models

2. **Advanced Audio Features**:
   - Real-time transcription display
   - Voice activity visualization
   - Speaker diarization

3. **Performance Optimizations**:
   - WebWorker-based audio processing
   - Streaming optimization for low-latency responses

4. **Cross-Platform Support**:
   - Ensure compatibility with React Native Web
   - Native module fallbacks for platform-specific features
