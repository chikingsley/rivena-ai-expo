import { DeepgramClient } from './deepgram';
import { ElevenLabsClient } from './elevenlabs';
import { DEEPGRAM_CONFIG, ELEVENLABS_CONFIG } from './config';
import { generateAPIUrl } from '@/utils';

// Interface for VoiceAI options
interface VoiceAIOptions {
  deepgramApiKey?: string;
  elevenLabsApiKey?: string;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onAiResponse?: (response: string) => void;
  onError?: (error: Error) => void;
}

// Interface for conversation message
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * VoiceAI class to handle the integration of STT, LLM, and TTS
 */
export class VoiceAI {
  private deepgram: DeepgramClient | null = null;
  private elevenlabs: ElevenLabsClient | null = null;
  private isListening = false;
  private messages: Message[] = [];
  private options: VoiceAIOptions;
  private currentTranscript = '';

  constructor(options: VoiceAIOptions) {
    this.options = options;
    
    // Initialize Deepgram if API key is provided
    if (options.deepgramApiKey || DEEPGRAM_CONFIG.apiKey) {
      this.deepgram = new DeepgramClient({
        apiKey: options.deepgramApiKey || DEEPGRAM_CONFIG.apiKey,
        language: DEEPGRAM_CONFIG.language,
        model: DEEPGRAM_CONFIG.model,
        encoding: DEEPGRAM_CONFIG.encoding,
        sampleRate: DEEPGRAM_CONFIG.sampleRate,
        onTranscript: this.handleTranscript.bind(this),
        onError: this.handleError.bind(this),
      });
    }
    
    // Initialize ElevenLabs if API key is provided
    if (options.elevenLabsApiKey || ELEVENLABS_CONFIG.apiKey) {
      this.elevenlabs = new ElevenLabsClient({
        apiKey: options.elevenLabsApiKey || ELEVENLABS_CONFIG.apiKey,
        voiceId: ELEVENLABS_CONFIG.voiceId,
        model: ELEVENLABS_CONFIG.model,
        stability: ELEVENLABS_CONFIG.stability,
        similarityBoost: ELEVENLABS_CONFIG.similarityBoost,
      });
    }
  }

  /**
   * Start listening for speech
   */
  public startListening(): void {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }
    
    if (!this.deepgram) {
      this.handleError(new Error('Deepgram client is not initialized'));
      return;
    }
    
    try {
      this.deepgram.connect();
      this.isListening = true;
      this.currentTranscript = '';
      console.log('Started listening for speech');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Stop listening for speech
   */
  public stopListening(): void {
    if (!this.isListening) {
      console.warn('Not currently listening');
      return;
    }
    
    if (!this.deepgram) {
      this.handleError(new Error('Deepgram client is not initialized'));
      return;
    }
    
    try {
      this.deepgram.disconnect();
      this.isListening = false;
      console.log('Stopped listening for speech');
      
      // Process final transcript if available
      if (this.currentTranscript.trim()) {
        this.processTranscript(this.currentTranscript);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Send audio data to Deepgram
   * @param audioData Audio data as ArrayBuffer
   */
  public sendAudio(audioData: ArrayBuffer): void {
    if (!this.isListening) {
      console.warn('Cannot send audio: Not currently listening');
      return;
    }
    
    if (!this.deepgram) {
      this.handleError(new Error('Deepgram client is not initialized'));
      return;
    }
    
    try {
      this.deepgram.sendAudio(audioData);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Handle transcript from Deepgram
   * @param transcript Transcribed text
   * @param isFinal Whether this is a final transcript
   */
  private handleTranscript(transcript: string, isFinal: boolean): void {
    // Update current transcript
    this.currentTranscript = transcript;
    
    // Call onTranscript callback if provided
    if (this.options.onTranscript) {
      this.options.onTranscript(transcript, isFinal);
    }
    
    // Process final transcript
    if (isFinal && transcript.trim()) {
      this.processTranscript(transcript);
    }
  }

  /**
   * Process transcript and get AI response
   * @param transcript Transcribed text to process
   */
  private async processTranscript(transcript: string): Promise<void> {
    try {
      // Add user message to conversation
      this.messages.push({
        role: 'user',
        content: transcript,
      });
      
      // Get AI response
      const response = await this.getAiResponse();
      
      // Add assistant message to conversation
      this.messages.push({
        role: 'assistant',
        content: response,
      });
      
      // Call onAiResponse callback if provided
      if (this.options.onAiResponse) {
        this.options.onAiResponse(response);
      }
      
      // Speak response if ElevenLabs is initialized
      if (this.elevenlabs) {
        await this.elevenlabs.speak(response);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Get AI response from the language model
   * @returns AI response text
   */
  private async getAiResponse(): Promise<string> {
    try {
      // Make API request to voice-ai endpoint
      const response = await fetch(generateAPIUrl('/api/voice-ai'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: this.messages,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Get response text
      const responseText = await response.text();
      return responseText;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  }

  /**
   * Handle errors
   * @param error Error object
   */
  private handleError(error: Error): void {
    console.error('VoiceAI error:', error);
    
    if (this.options.onError) {
      this.options.onError(error);
    }
  }

  /**
   * Clear conversation history
   */
  public clearConversation(): void {
    this.messages = [];
    console.log('Conversation history cleared');
  }
}
