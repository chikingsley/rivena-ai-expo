// Environment variables for API keys and configuration
// These should be set in your .env file or environment variables

// LiveKit configuration
export const LIVEKIT_CONFIG = {
  // Your LiveKit server URL (from environment variables)
  serverUrl: process.env.EXPO_PUBLIC_LIVEKIT_SERVER_URL || '',
  
  // Default room name for voice AI
  defaultRoom: 'voice-ai-room',
};

// Deepgram configuration
export const DEEPGRAM_CONFIG = {
  // Your Deepgram API key (from environment variables)
  apiKey: process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY || '',
  
  // Speech recognition settings
  language: 'en-US',
  model: 'nova-2', // Deepgram's most accurate model
  encoding: 'linear16', // PCM 16-bit linear encoding
  sampleRate: 16000, // 16kHz sample rate
};

// ElevenLabs configuration
export const ELEVENLABS_CONFIG = {
  // Your ElevenLabs API key (from environment variables)
  apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '',
  
  // Voice settings
  voiceId: 'pNInz6obpgDQGcFmaJgB', // Default ElevenLabs voice (Rachel)
  model: 'eleven_monolingual_v1',
  stability: 0.5,
  similarityBoost: 0.75,
};

// LLM configuration (for Vercel AI SDK)
export const LLM_CONFIG = {
  // Model settings
  model: 'gpt-4-turbo', // Default model
  temperature: 0.7,
  maxTokens: 1000,
  
  // System prompt for the voice assistant
  systemPrompt: `You are a helpful voice assistant. 
  Keep your responses concise and conversational, as they will be spoken aloud.
  Respond to the user's questions and requests in a natural, helpful manner.`,
};
