# Voice Chat Component

This component demonstrates how to use the voice provider registry and audio processor utilities in your Rivena AI application.

## Features

- Switch between OpenAI and Hume voice providers
- Record and send audio to the selected provider
- Display audio visualization using the AudioProcessor
- Handle provider events (messages, audio output, errors)
- Support for both web and React Native platforms

## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import VoiceChat from '../components/voice-chat/VoiceChat';

const TherapyScreen = () => {
  return (
    <View style={styles.container}>
      {/* Pass the initial provider ID (optional) */}
      <VoiceChat initialProviderId="openai" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TherapyScreen;
```

## Environment Variables

Make sure you have the following environment variables set up:

```
# For OpenAI voice provider
EXPO_PUBLIC_OPENAI_MODEL=gpt-4o
EXPO_PUBLIC_MIDDLEWARE_ENDPOINT=https://your-middleware-endpoint.com/openai

# For Hume voice provider
EXPO_PUBLIC_HUME_CONFIG_ID=your-hume-config-id
```

## Provider Registry

The component uses the voice provider registry to create and manage providers:

```tsx
// Create a provider from environment variables
const provider = voiceProviderRegistry.createProviderFromEnv('openai', 'my-provider-id');

// Or create with explicit configuration
const provider = voiceProviderRegistry.createProvider({
  type: 'openai',
  model: 'gpt-4o',
  serverMiddlewareEndpoint: 'https://your-middleware-endpoint.com/openai'
}, 'my-provider-id');

// Switch providers
const newProvider = voiceProviderRegistry.getProvider('another-provider-id');
```

## Audio Processor

The component uses the AudioProcessor utilities for:

1. Converting between blob and base64 formats
2. Calculating audio levels for visualization
3. Managing audio playback queue
4. Detecting MIME types

```tsx
// Convert blob to base64
const base64Data = await AudioProcessor.blobToBase64(audioBlob);

// Calculate audio level
const level = AudioProcessor.calculateAudioLevel(audioData);

// Create a playback queue
const queue = AudioProcessor.createPlaybackQueue();
queue.enqueue(audioBlob);
```
