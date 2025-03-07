// providers/base/VoiceProvider.ts
export type VoiceProviderState = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting'
  | 'error';

export type AudioFormat = 'webm' | 'mp3' | 'wav';

export interface VoiceProviderConfig {
  endpoint?: string;
  audioFormat?: AudioFormat;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  serverMiddlewareEndpoint?: string;
}

export interface AudioChunk {
  data: Blob;
  timestamp: number;
  isLastChunk?: boolean;
}

export interface VoiceProviderEvents {
  message: (message: { type: string; content: any }) => void;
  audioOutput: (audio: Blob) => void;
  error: (error: Error) => void;
  stateChange: (state: VoiceProviderState) => void;
  audioLevel: (level: number) => void;
}

export interface VoiceProvider {
  // Core connection methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
  
  // Audio interaction
  sendAudio(chunk: AudioChunk): Promise<void>;
  interrupt(): Promise<void>;
  
  // State management
  getState(): VoiceProviderState;
  
  // Event handling
  addEventListener<K extends keyof VoiceProviderEvents>(
    event: K, 
    listener: VoiceProviderEvents[K]
  ): void;
  removeEventListener<K extends keyof VoiceProviderEvents>(
    event: K, 
    listener: VoiceProviderEvents[K]
  ): void;
  
  // Configuration
  updateConfig(config: Partial<VoiceProviderConfig>): void;
}