import { AudioFormat } from '../base/VoiceProvider';

/**
 * Enum representing the supported MIME types for audio recording.
 */
export enum MimeType {
  WEBM = "audio/webm",
  MP4 = "audio/mp4",
  WAV = "audio/wav",
}

/**
 * Represents a successful result where a compatible MIME type was found.
 */
type MimeTypeSuccessResult = { 
  success: true; 
  mimeType: MimeType 
};

/**
 * Represents a failure result when no compatible MIME type is supported or an error occurs.
 */
type MimeTypeFailureResult = { 
  success: false; 
  error: Error 
};

/**
 * Union type representing the possible outcomes of checking for a supported MIME type.
 */
type MimeTypeResult = MimeTypeSuccessResult | MimeTypeFailureResult;

/**
 * Interface for audio processing options
 */
export interface AudioProcessingOptions {
  format: AudioFormat;
  sampleRate?: number;
  channels?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

/**
 * AudioProcessor class provides utilities for audio processing, conversion,
 * and format handling across different voice providers.
 */
export class AudioProcessor {
  /**
   * Converts a Blob object into a base64-encoded string.
   * 
   * @param {Blob} blob - The Blob object to convert to base64.
   * @returns {Promise<string>} A promise that resolves to a base64-encoded string.
   */
  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64Data = reader.result.split(",")[1];
          if (base64Data) {
            resolve(base64Data);
          } else {
            reject(new Error("Failed to extract Base64 data"));
          }
        } else {
          reject(new Error("FileReader result is null or not a string"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Error reading blob: ${reader.error?.message}`));
      };
      
      reader.readAsDataURL(blob);
    });
  }
  
  /**
   * Converts a base64-encoded string into a Blob object with the specified content type.
   * 
   * @param {string} base64 - The base64-encoded string representing binary data.
   * @param {string} contentType - The MIME type to assign to the resulting Blob.
   * @returns {Blob} A Blob object containing the binary data from the base64 string.
   */
  static base64ToBlob(base64: string, contentType?: string): Blob {
    const binaryString = atob(base64);
    const byteArray = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    
    return new Blob([byteArray], { type: contentType });
  }
  
  /**
   * Converts Float32Array of amplitude data to ArrayBuffer in Int16Array format.
   * 
   * @param {Float32Array} float32Array - The float audio data to convert.
   * @returns {ArrayBuffer} An ArrayBuffer containing the audio data in 16-bit PCM format.
   */
  static floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    
    return buffer;
  }
  
  /**
   * Converts a Float32Array to base64-encoded PCM16 data.
   * 
   * @param {Float32Array} float32Array - The float audio data to convert.
   * @returns {string} A base64-encoded string representing the audio data.
   */
  static float32ArrayToBase64(float32Array: Float32Array): string {
    const buffer = this.floatTo16BitPCM(float32Array);
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // 32KB chunks for better performance
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }
  
  /**
   * Converts a base64 string to an ArrayBuffer.
   * 
   * @param {string} base64 - The base64-encoded string to convert.
   * @returns {ArrayBuffer} An ArrayBuffer containing the binary data.
   */
  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }
  
  /**
   * Checks whether the MediaRecorder API is supported in the current environment.
   * 
   * @returns {boolean} Returns true if the MediaRecorder API is supported, otherwise false.
   */
  static isMediaRecorderSupported(): boolean {
    return typeof MediaRecorder !== "undefined";
  }
  
  /**
   * Finds and returns the first MIME type from the given array that is supported by the MediaRecorder.
   * 
   * @param {MimeType[]} mimeTypes - An array of MIME types to check for compatibility.
   * @returns {MimeType | null} The first supported MIME type or null if none are supported.
   */
  static getSupportedMimeType(mimeTypes: MimeType[]): MimeType | null {
    return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || null;
  }
  
  /**
   * Determines if the current browser supports any of the predefined audio MIME types
   * (WEBM, MP4, WAV, or OGG) via the MediaRecorder API.
   * 
   * @returns {MimeTypeResult} An object containing the success status and either a supported MIME type or an error.
   */
  static getBrowserSupportedMimeType(): MimeTypeResult {
    // Check if the MediaRecorder API is supported in the current environment
    if (!this.isMediaRecorderSupported()) {
      return {
        success: false,
        error: new Error("MediaRecorder is not supported"),
      };
    }
    
    const COMPATIBLE_MIME_TYPES = [MimeType.WEBM, MimeType.MP4, MimeType.WAV];
    
    // Find the first compatible MIME type that the browser's MediaRecorder supports
    const supportedMimeType = this.getSupportedMimeType(COMPATIBLE_MIME_TYPES);
    
    // If no compatible MIME type is found, return a failure result
    if (!supportedMimeType) {
      return {
        success: false,
        error: new Error("Browser does not support any compatible mime types"),
      };
    }
    
    // If a compatible MIME type is found, return a success result
    return {
      success: true,
      mimeType: supportedMimeType,
    };
  }
  
  /**
   * Get MIME type based on audio format.
   * 
   * @param {AudioFormat} format - The audio format to get the MIME type for.
   * @returns {string} The MIME type corresponding to the format.
   */
  static getMimeTypeFromFormat(format: AudioFormat): string {
    switch (format) {
      case 'webm':
        return MimeType.WEBM;
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return MimeType.WAV;
      default:
        // Try to get browser supported MIME type as fallback
        const result = this.getBrowserSupportedMimeType();
        if (result.success) {
          return result.mimeType;
        }
        return MimeType.WEBM; // Default fallback
    }
  }
  
  /**
   * Creates an audio playback queue for managing sequential audio playback.
   * 
   * @returns An object with methods to manage the audio queue.
   */
  static createPlaybackQueue() {
    const audioQueue: Blob[] = [];
    let isPlaying = false;
    let currentAudio: HTMLAudioElement | null = null;
    
    const playbackQueue = {
      /**
       * Add an audio blob to the playback queue.
       * 
       * @param {Blob} audioBlob - The audio blob to add to the queue.
       */
      enqueue: (audioBlob: Blob) => {
        audioQueue.push(audioBlob);
        if (!isPlaying) {
          playbackQueue.playNext();
        }
      },
      
      /**
       * Play the next audio blob in the queue.
       */
      playNext: function() {
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
            URL.revokeObjectURL(audioUrl); // Clean up
            isPlaying = false;
            if (audioQueue.length) this.playNext();
          };
        } catch (error) {
          console.error('Error creating audio element:', error);
          isPlaying = false;
          if (audioQueue.length) this.playNext();
        }
      },
      
      /**
       * Stop playback and clear the queue.
       */
      stop: () => {
        if (currentAudio) {
          try {
            currentAudio.pause();
            currentAudio = null;
          } catch (error) {
            console.error('Error stopping audio:', error);
          }
        }
        isPlaying = false;
        audioQueue.length = 0;
      },
      
      /**
       * Get the current length of the audio queue.
       * 
       * @returns {number} The number of items in the queue.
       */
      getQueueLength: () => audioQueue.length
    };
    
    return playbackQueue;
  }
  
  /**
   * Get audio constraints for getUserMedia.
   * 
   * @param {AudioProcessingOptions} options - Options for audio processing.
   * @returns {MediaStreamConstraints} Constraints object for getUserMedia.
   */
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
  
  /**
   * Calculate audio levels for visualization.
   * 
   * @param {Float32Array} audioData - The audio data to analyze.
   * @returns {number} A value between 0 and 1 representing the audio level.
   */
  static calculateAudioLevel(audioData: Float32Array): number {
    // Calculate RMS (Root Mean Square) of the audio data
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    
    // Convert to a value between 0 and 1
    // Typical speech is around -30dB to -10dB, which is 0.03 to 0.3 in linear scale
    // We'll scale this up to make it more useful for visualization
    return Math.min(1, rms * 3);
  }
}
