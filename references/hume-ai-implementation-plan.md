# Hume AI Implementation Plan

## Architecture Overview

The Hume AI implementation will use a three-tier architecture:

1. **Client-Side (Expo/React Native)**: Connects to Hume's Empathic Voice Interface (EVI) via WebSocket
2. **Hume EVI**: Processes audio, handles transcription, and communicates with our CLM
3. **Custom Language Model (CLM)**: Connects to our preferred LLM (can be added later)

## Phase 1: Basic Hume EVI Integration (Without CLM)

In this phase, we'll set up the client-side integration with Hume EVI using their built-in language models before adding our own CLM.

### 1. Setup and Authentication

```typescript
import { Hume, HumeClient } from 'hume';

// Create Hume client with API keys
const client = new HumeClient({
  apiKey: process.env.HUME_API_KEY || '',
  secretKey: process.env.HUME_SECRET_KEY || '',
});

// Connect to EVI WebSocket
const socket = await client.empathicVoice.chat.connect({
  configId: process.env.HUME_CONFIG_ID || null,
  verbose_transcription: true, // For better interruption handling
});
```

### 2. Audio Input Implementation

```typescript
// Set up audio recording similar to OpenAI implementation
// But use Hume's recommended helpers
import {
  convertBlobToBase64,
  ensureSingleValidAudioTrack,
  getAudioStream,
  getBrowserSupportedMimeType,
} from 'hume';

// Get appropriate MIME type for browser
const mimeType = getBrowserSupportedMimeType().success 
  ? getBrowserSupportedMimeType().mimeType 
  : MimeType.WEBM;

// Start recording with echo cancellation, etc.
let audioStream = await getAudioStream();
ensureSingleValidAudioTrack(audioStream);

// Record and send audio
let recorder = new MediaRecorder(audioStream, { mimeType });
recorder.ondataavailable = async ({ data }) => {
  if (data.size < 1) return;
  const encodedAudioData = await convertBlobToBase64(data);
  socket.sendAudioInput({ data: encodedAudioData });
};
recorder.start(100); // Capture at 100ms intervals
```

### 3. Message Handling

```typescript
// Setup message handlers for different Hume message types
socket.on('message', (message) => {
  switch (message.type) {
    case 'user_message':
      // Handle transcribed user speech
      handleUserMessage(message);
      break;
      
    case 'assistant_message':
      // Handle assistant text response
      handleAssistantMessage(message);
      break;
      
    case 'audio_output':
      // Handle assistant audio output
      handleAudioOutput(message);
      break;
      
    case 'user_interruption':
      // Handle interruptions
      stopAudio();
      break;
      
    case 'assistant_end':
      // Handle end of assistant's turn
      handleAssistantEnd();
      break;
  }
});
```

### 4. Audio Output Handling

```typescript
// Audio queue and playback system
const audioQueue: Blob[] = [];
let isPlaying = false;
let currentAudio: HTMLAudioElement | null = null;

function handleAudioOutput(message) {
  // Convert base64 audio to blob
  const blob = convertBase64ToBlob(message.data);
  
  // Add to queue and play if not already playing
  audioQueue.push(blob);
  if (!isPlaying) playAudio();
}

function playAudio() {
  if (!audioQueue.length || isPlaying) return;
  
  isPlaying = true;
  const audioBlob = audioQueue.shift();
  if (!audioBlob) return;
  
  const audioUrl = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(audioUrl);
  currentAudio.play();
  
  currentAudio.onended = () => {
    isPlaying = false;
    if (audioQueue.length) playAudio();
  };
}

function stopAudio() {
  currentAudio?.pause();
  currentAudio = null;
  isPlaying = false;
  audioQueue.length = 0; // Clear queue
}
```

## Phase 2: Custom Language Model (CLM) Integration

For Phase 2, we'll create a server-side CLM that:
1. Receives requests from Hume EVI
2. Forwards them to our preferred LLM (OpenAI, etc.)
3. Returns responses in Hume's expected format

### Server-Side CLM (Using SSE)

```typescript
// Express server with SSE endpoint
app.post('/chat/completions', async (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  
  // Get messages from Hume
  const { messages } = req.body;
  
  // Format for OpenAI (or other LLM)
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));
  
  // Call OpenAI with streaming
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: formattedMessages,
    stream: true
  });
  
  // Stream responses back to Hume
  for await (const chunk of completion) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
});
```

## Configuration Requirements

1. Create Hume EVI configuration in their web dashboard
2. Generate API keys from Hume platform
3. Set environment variables:
   - HUME_API_KEY
   - HUME_SECRET_KEY
   - HUME_CONFIG_ID

## Implementation Differences vs OpenAI

1. **Authentication**: Hume uses API key + Secret key vs OpenAI's token-based auth
2. **Message Structure**: Hume has more message types and a different format
3. **Emotion Analysis**: Hume provides prosody scores with transcriptions
4. **Architecture**: Three-tier vs two-tier architecture 