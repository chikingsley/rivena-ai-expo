# EVI TypeScript Quickstart

A quickstart guide for implementing the Empathic Voice Interface (EVI) with TypeScript.

This tutorial provides step-by-step instructions for implementing EVI using Hume's [TypeScript SDK](https://github.com/HumeAI/hume-typescript-sdk), broken down into five key components:

1. **Authentication**: Authenticate your application with EVI using your credentials
2. **Connecting to EVI**: Set up a secure WebSocket connection to interact with EVI
3. **Capturing & recording audio**: Capture audio input and prepare it for processing
4. **Audio playback**: Play back the processed audio output to the user
5. **Interruption**: Manage and handle interruptions during the chat

To see the full implementation within a frontend web application, visit our API examples repository on GitHub: [hume-evi-typescript-example](https://github.com/HumeAI/hume-api-examples/tree/main/evi-typescript-example).

## 1. Authentication

To establish an authenticated connection, first instantiate the Hume client with your API key and Secret key. These keys can be obtained by logging into the portal and visiting the [API keys page](https://platform.hume.ai/settings/keys).

In the sample code below, the API key and Secret key have been saved to environment variables. Avoid hardcoding these values in your project to prevent them from being leaked.

```typescript
import { Hume, HumeClient } from 'hume';

// instantiate the Hume client and authenticate
const client = new HumeClient({
  apiKey: import.meta.env.HUME_API_KEY || '',
  secretKey: import.meta.env.HUME_SECRET_KEY || '',
});
```

When using our TypeScript SDK, the Access Token necessary to establish an authenticated connection with EVI is fetched and applied under the hood after the Hume client is instantiated with your credentials.

## 2. Connect

With the Hume client instantiated with our credentials, we can now establish an authenticated WebSocket connection with EVI and define our WebSocket event handlers. For now we will include placeholder event handlers to be updated in later steps.

```typescript
import { Hume, HumeClient } from 'hume';

// instantiate the Hume client and authenticate
const client = new HumeClient({
  apiKey: import.meta.env.HUME_API_KEY || '',
  secretKey: import.meta.env.HUME_SECRET_KEY || '',
});

// instantiates WebSocket and establishes an authenticated connection
const socket = await client.empathicVoice.chat.connect({
  configId: import.meta.env.HUME_CONFIG_ID || null,
});

// define handler functions and assign them to the corresponding WebSocket event handlers
socket.on('open', handleWebSocketOpenEvent);
socket.on('message', handleWebSocketMessageEvent);
socket.on('error', handleWebSocketErrorEvent);
socket.on('close', handleWebSocketCloseEvent);
```

## 3. Audio Input

To capture audio and send it through the socket as an audio input, several steps are necessary:

1. Handle user permissions to access the microphone
2. Use the Media Stream API to capture the audio
3. Use the MediaRecorder API to record the captured audio
4. Base64 encode the recording audio Blob
5. Send the encoded audio through the WebSocket using the `sendAudioInput` method

```typescript
import {
  convertBlobToBase64,
  ensureSingleValidAudioTrack,
  getAudioStream,
  getBrowserSupportedMimeType,
} from 'hume';

// the recorder responsible for recording the audio stream to be prepared as the audio input
let recorder: MediaRecorder | null = null;

// the stream of audio captured from the user's microphone
let audioStream: MediaStream | null = null;

// mime type supported by the browser the application is running in
const mimeType: MimeType = (() => {
  const result = getBrowserSupportedMimeType();
  return result.success ? result.mimeType : MimeType.WEBM;
})();

// define function for capturing audio
async function captureAudio(): Promise<void> {
  // prompts user for permission to capture audio, obtains media stream upon approval
  audioStream = await getAudioStream();
  
  // ensure there is only one audio track in the stream
  ensureSingleValidAudioTrack(audioStream);
  
  // instantiate the media recorder
  recorder = new MediaRecorder(audioStream, { mimeType });
  
  // callback for when recorded chunk is available to be processed
  recorder.ondataavailable = async ({ data }) => {
    // IF size of data is smaller than 1 byte then do nothing
    if (data.size < 1) return;
    
    // base64 encode audio data
    const encodedAudioData = await convertBlobToBase64(data);
    
    // define the audio_input message JSON
    const audioInput: Omit<Hume.empathicVoice.AudioInput, 'type'> = {
      data: encodedAudioData,
    };
    
    // send audio_input message
    socket?.sendAudioInput(audioInput);
  };
  
  // capture audio input at a rate of 100ms (recommended for web)
  const timeSlice = 100;
  recorder.start(timeSlice);
}

// define a WebSocket open event handler to capture audio
async function handleWebSocketOpenEvent(): Promise<void> {
  // place logic here which you would like invoked when the socket opens
  console.log('Web socket connection opened');
  await captureAudio();
}
```

Accepted audio formats include: `mp3`, `wav`, `aac`, `ogg`, `flac`, `webm`, `avr`, `cdda`, `cvs/vms`, `aiff`, `au`, `amr`, `mp2`, `mp4`, `ac3`, `avi`, `wmv`, `mpeg`, `ircam`.

## 4. Audio Output

The response will comprise multiple messages, detailed as follows:

1. [`user_message`](https://dev.hume.ai/reference#receive.User%20Message.type): This message encapsulates the transcription of the audio input. Additionally, it includes expression measurement predictions related to the speaker's vocal prosody.
2. [`assistant_message`](https://dev.hume.ai/reference#receive.Assistant%20Message.type): For every sentence within the response, an `AssistantMessage` is dispatched. This message not only relays the content of the response but also features predictions regarding the expressive qualities of the generated audio response.
3. [`audio_output`](https://dev.hume.ai/reference#receive.Audio%20Output.type): Accompanying each `AssistantMessage`, an `AudioOutput` message will be provided. This contains the actual audio (binary) response corresponding to an `AssistantMessage`.
4. [`assistant_end`](https://dev.hume.ai/reference#receive.Assistant%20End.type): Signifying the conclusion of the response to the audio input, an `AssistantEnd` message is delivered as the final piece of the communication.

Here we'll focus on playing the received audio output:

1. Define logic for converting the received binary to a Blob
2. Create an HTMLAudioInput to play the audio
3. Update the client's on message WebSocket event handler
4. Implement a queue and sequentially play the audio back

```typescript
// audio playback queue
const audioQueue: Blob[] = [];

// flag which denotes whether audio is currently playing or not
let isPlaying = false;

// the current audio element to be played
let currentAudio: HTMLAudioElement | null = null;

// play the audio within the playback queue, converting each Blob into playable HTMLAudioElements
function playAudio(): void {
  // IF there is nothing in the audioQueue OR audio is currently playing then do nothing
  if (!audioQueue.length || isPlaying) return;
  
  // update isPlaying state
  isPlaying = true;
  
  // pull next audio output from the queue
  const audioBlob = audioQueue.shift();
  
  // IF audioBlob is unexpectedly undefined then do nothing
  if (!audioBlob) return;
  
  // converts Blob to AudioElement for playback
  const audioUrl = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(audioUrl);
  
  // play audio
  currentAudio.play();
  
  // callback for when audio finishes playing
  currentAudio.onended = () => {
    // update isPlaying state
    isPlaying = false;
    
    // attempt to pull next audio output from queue
    if (audioQueue.length) playAudio();
  };
}

// define a WebSocket message event handler to play audio output
function handleWebSocketMessageEvent(
  message: Hume.empathicVoice.SubscribeEvent
): void {
  // place logic here which you would like to invoke when receiving a message through the socket
  switch (message.type) {
    // add received audio to the playback queue, and play next audio output
    case 'audio_output':
      // convert base64 encoded audio to a Blob
      const audioOutput = message.data;
      const blob = convertBase64ToBlob(audioOutput);
      
      // add audio Blob to audioQueue
      audioQueue.push(blob);
      
      // play the next audio output
      if (audioQueue.length === 1) playAudio();
      break;
  }
}
```

## 5. Interrupt

Interruptibility is a distinguishing feature of the Empathic Voice Interface. If an audio input is sent through the WebSocket while receiving response messages for a previous audio input:

- The response to the previous audio input will stop being sent
- The interface will send back a `user_interruption` message
- EVI will begin responding to the new audio input

```typescript
// function for stopping the audio and clearing the queue
function stopAudio(): void {
  // stop the audio playback
  currentAudio?.pause();
  currentAudio = null;
  
  // update audio playback state
  isPlaying = false;
  
  // clear the audioQueue
  audioQueue.length = 0;
}

// update WebSocket message event handler to handle interruption
function handleWebSocketMessageEvent(
  message: Hume.empathicVoice.SubscribeEvent
): void {
  // place logic here which you would like to invoke when receiving a message through the socket
  switch (message.type) {
    // add received audio to the playback queue, and play next audio output
    case 'audio_output':
      // convert base64 encoded audio to a Blob
      const audioOutput = message.data;
      const blob = convertBase64ToBlob(audioOutput);
      
      // add audio Blob to audioQueue
      audioQueue.push(blob);
      
      // play the next audio output
      if (audioQueue.length === 1) playAudio();
      break;
    
    // stop audio playback, clear audio playback queue, and update audio playback state on interrupt
    case 'user_interruption':
      stopAudio();
      break;
  }
}
```