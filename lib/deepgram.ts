import { Buffer } from 'buffer';

// Interface for Deepgram WebSocket message
interface DeepgramResponse {
  type: string;
  channel?: {
    alternatives?: Array<{
      transcript?: string;
    }>;
  };
  is_final?: boolean;
}

// Interface for Deepgram client options
interface DeepgramClientOptions {
  apiKey: string;
  language?: string;
  model?: string;
  encoding?: string;
  sampleRate?: number;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

/**
 * Creates a Deepgram WebSocket client for real-time speech-to-text
 */
export class DeepgramClient {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private options: DeepgramClientOptions;

  constructor(options: DeepgramClientOptions) {
    this.options = {
      language: 'en-US',
      model: 'nova-2',
      encoding: 'linear16',
      sampleRate: 16000,
      ...options,
    };
  }

  /**
   * Connect to Deepgram WebSocket API
   */
  public connect(): void {
    if (this.isConnected) {
      console.warn('Deepgram WebSocket is already connected');
      return;
    }

    try {
      // Create URL with query parameters
      const params = new URLSearchParams({
        language: this.options.language!,
        model: this.options.model!,
        encoding: this.options.encoding!,
        sample_rate: this.options.sampleRate!.toString(),
        interim_results: 'true',
      });

      // Create WebSocket connection
      this.socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?${params.toString()}`,
        ['token', this.options.apiKey]
      );

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
    } catch (error) {
      this.handleError(error as Event);
    }
  }

  /**
   * Disconnect from Deepgram WebSocket API
   */
  public disconnect(): void {
    if (!this.isConnected || !this.socket) {
      console.warn('Deepgram WebSocket is not connected');
      return;
    }

    try {
      this.socket.close();
    } catch (error) {
      console.error('Error closing Deepgram WebSocket:', error);
    }
  }

  /**
   * Send audio data to Deepgram
   * @param audioData Audio data as ArrayBuffer
   */
  public sendAudio(audioData: ArrayBuffer): void {
    if (!this.isConnected || !this.socket) {
      console.warn('Cannot send audio: Deepgram WebSocket is not connected');
      return;
    }

    try {
      this.socket.send(audioData);
    } catch (error) {
      console.error('Error sending audio data to Deepgram:', error);
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.isConnected = true;
    console.log('Connected to Deepgram WebSocket API');
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as DeepgramResponse;
      
      // Extract transcript if available
      if (data.type === 'Results' && data.channel?.alternatives?.[0]?.transcript) {
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final || false;
        
        // Call the onTranscript callback if provided
        if (this.options.onTranscript && transcript.trim()) {
          this.options.onTranscript(transcript, isFinal);
        }
      }
    } catch (error) {
      console.error('Error parsing Deepgram message:', error);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('Deepgram WebSocket error:', event);
    
    if (this.options.onError) {
      this.options.onError(new Error('Deepgram WebSocket error'));
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(): void {
    this.isConnected = false;
    console.log('Disconnected from Deepgram WebSocket API');
    
    if (this.options.onClose) {
      this.options.onClose();
    }
  }
}

/**
 * Helper function to convert audio data for Deepgram
 * @param audioData Raw audio data
 * @returns Processed audio data ready for Deepgram
 */
export function processAudioForDeepgram(audioData: ArrayBuffer): ArrayBuffer {
  // In a real implementation, you might need to convert the audio format
  // For now, we'll just return the original data
  return audioData;
}
