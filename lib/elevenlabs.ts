import { Audio } from 'expo-av';

// Interface for ElevenLabs API options
interface ElevenLabsOptions {
  apiKey: string;
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

// Interface for text-to-speech request
interface TTSRequest {
  text: string;
  voiceId?: string;
  model?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    speaker_boost?: boolean;
  };
}

/**
 * ElevenLabs client for text-to-speech functionality
 */
export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private defaultVoiceId: string;
  private defaultModel: string;
  private defaultSettings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    speaker_boost?: boolean;
  };

  constructor(options: ElevenLabsOptions) {
    this.apiKey = options.apiKey;
    this.defaultVoiceId = options.voiceId || 'pNInz6obpgDQGcFmaJgB'; // Default ElevenLabs voice
    this.defaultModel = options.model || 'eleven_monolingual_v1';
    this.defaultSettings = {
      stability: options.stability || 0.5,
      similarity_boost: options.similarityBoost || 0.75,
      style: options.style,
      speaker_boost: options.speakerBoost,
    };
  }

  /**
   * Convert text to speech using ElevenLabs API
   * @param text Text to convert to speech
   * @param voiceId Optional voice ID (defaults to constructor value)
   * @returns Audio sound object
   */
  public async textToSpeech(
    text: string,
    voiceId?: string
  ): Promise<Audio.Sound> {
    try {
      const requestBody: TTSRequest = {
        text,
        model: this.defaultModel,
        voiceId: voiceId || this.defaultVoiceId,
        voice_settings: this.defaultSettings,
      };

      // Make API request to ElevenLabs
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${requestBody.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: requestBody.text,
            model_id: requestBody.model,
            voice_settings: requestBody.voice_settings,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      // Get audio data as blob
      const audioBlob = await response.blob();
      
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Create and load sound object
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: base64Audio });
      
      return sound;
    } catch (error) {
      console.error('Error in text-to-speech conversion:', error);
      throw error;
    }
  }

  /**
   * Play text as speech
   * @param text Text to speak
   * @param voiceId Optional voice ID
   * @returns Promise that resolves when audio finishes playing
   */
  public async speak(text: string, voiceId?: string): Promise<void> {
    try {
      const sound = await this.textToSpeech(text, voiceId);
      await sound.playAsync();
      
      // Return a promise that resolves when audio finishes
      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync().then(() => resolve());
          }
        });
      });
    } catch (error) {
      console.error('Error speaking text:', error);
      throw error;
    }
  }

  /**
   * Convert a Blob to base64 data URI
   * @param blob Audio blob
   * @returns Base64 data URI
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
