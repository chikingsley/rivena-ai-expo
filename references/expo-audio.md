# Expo Audio (expo-audio)

A library that provides an API to implement audio playback and recording in apps.

> **Note**: This page documents an upcoming version of the Audio library. Expo Audio is currently in alpha and subject to breaking changes.

`expo-audio` is a cross-platform audio library for accessing the native audio capabilities of the device.

Note that audio automatically stops if headphones/bluetooth audio devices are disconnected.

## Installation

```bash
npx expo install expo-audio
```

If you are installing this in an existing React Native app, start by installing expo in your project. Then, follow the additional instructions as mentioned by the library's README under "Installation in bare React Native projects" section.

## Configuration in app config

You can configure expo-audio using its built-in config plugin if you use config plugins in your project (EAS Build or npx expo run:[android|ios]). The plugin allows you to configure various properties that cannot be set at runtime and require building a new app binary to take effect. If your app does not use EAS Build, then you'll need to manually configure the package.

### Example app.json with config plugin

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
    ]
  }
}
```

### Configurable properties

| Name | Default | Description |
|------|---------|-------------|
| microphonePermission | "Allow $(PRODUCT_NAME) to access your microphone" | A string to set the NSMicrophoneUsageDescription permission message. (iOS only) |

## Usage

### Playing sounds

```jsx
import { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

const audioSource = require('./assets/Hello.mp3');

export default function App() {
  const player = useAudioPlayer(audioSource);

  return (
    <View style={styles.container}>
      <Button title="Play Sound" onPress={() => player.play()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});
```

### Recording sounds

```jsx
import { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import { useAudioRecorder, RecordingOptions, AudioModule, RecordingPresets } from 'expo-audio';

export default function App() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title={audioRecorder.isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={audioRecorder.isRecording ? stopRecording : record}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});
```

### Playing or recording audio in background

On iOS, audio playback and recording in background is only available in standalone apps, and it requires some extra configuration. On iOS, each background feature requires a special key in UIBackgroundModes array in your Info.plist file. In standalone apps this array is empty by default, so to use background features you will need to add appropriate keys to your app.json configuration.

See an example of app.json that enables audio playback in background:

```json
{
  "expo": {
    ...
    "ios": {
      ...
      "infoPlist": {
        ...
        "UIBackgroundModes": [
          "audio"
        ]
      }
    }
  }
}
```

### Notes on web usage

- A MediaRecorder issue on Chrome produces WebM files missing the duration metadata. See the open Chromium issue.
- MediaRecorder encoding options and other configurations are inconsistent across browsers, utilizing a Polyfill such as kbumsik/opus-media-recorder or ai/audio-recorder-polyfill in your application will improve your experience. Any options passed to prepareToRecordAsync will be passed directly to the MediaRecorder API and as such the polyfill.
- Web browsers require sites to be served securely for them to listen to a mic. See MediaDevices getUserMedia() security for more details.

## API

```jsx
import { useAudioPlayer, useAudioRecorder } from 'expo-audio';
```

### Constants

#### Audio.AUDIO_SAMPLE_UPDATE

Type: `'audioSampleUpdate'`

#### Audio.PLAYBACK_STATUS_UPDATE

Type: `'playbackStatusUpdate'`

#### Audio.RECORDING_STATUS_UPDATE

Type: `'recordingStatusUpdate'`

#### Audio.RecordingPresets

Type: `Record<string, RecordingOptions>`

Constant which contains definitions of the two preset examples of RecordingOptions, as implemented in the Audio SDK.

##### HIGH_QUALITY

```js
RecordingPresets.HIGH_QUALITY = {
  extension: '.m4a',
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 128000,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};
```

##### LOW_QUALITY

```js
RecordingPresets.LOW_QUALITY = {
  extension: '.m4a',
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 64000,
  android: {
    extension: '.3gp',
    outputFormat: '3gp',
    audioEncoder: 'amr_nb',
  },
  ios: {
    audioQuality: AudioQuality.MIN,
    outputFormat: IOSOutputFormat.MPEG4AAC,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};
```

### Hooks

#### useAudioPlayer(source, updateInterval)

| Parameter | Type | Description |
|-----------|------|-------------|
| source (optional) | `number \| AudioSource` | Audio source to play |
| updateInterval (optional) | `number` | Interval for status updates |

Returns: `AudioPlayer`

#### useAudioPlayerStatus(player)

| Parameter | Type | Description |
|-----------|------|-------------|
| player | `AudioPlayer` | Player instance |

Returns: `AudioStatus`

#### useAudioRecorder(options, statusListener)

| Parameter | Type | Description |
|-----------|------|-------------|
| options | `RecordingOptions` | Recording options |
| statusListener (optional) | `(status: RecordingStatus) => void` | Status update handler |

Returns: `AudioRecorder`

#### useAudioRecorderState(recorder, interval)

| Parameter | Type | Description |
|-----------|------|-------------|
| recorder | `AudioRecorder` | Recorder instance |
| interval (optional) | `number` | Status update interval |

Returns: `RecorderState`

#### useAudioSampleListener(player, listener)

| Parameter | Type | Description |
|-----------|------|-------------|
| player | `AudioPlayer` | Player instance |
| listener | `(data: AudioSample) => void` | Sample data handler |

Returns: `void`

### Classes

#### AudioPlayer

Type: `Class extends SharedObject<AudioEvents>`

##### AudioPlayer Properties

###### currentTime

Type: `number`
The current position through the audio item, in seconds.

###### duration

Type: `number`
The total duration of the audio in seconds.

###### id

Type: `number`
Unique identifier for the player object.

###### isAudioSamplingSupported

Type: `boolean`
Boolean value indicating whether audio sampling is supported on the platform.

###### isBuffering

Type: `boolean`
Boolean value indicating whether the player is buffering.

###### isLoaded

Type: `boolean`
Boolean value indicating whether the player is finished loading.

###### loop

Type: `boolean`
Boolean value indicating whether the player is currently looping.

###### muted

Type: `boolean`
Boolean value indicating whether the player is currently muted.

###### paused

Type: `boolean`
Boolean value indicating whether the player is currently paused.

###### playbackRate

Type: `number`
The current playback rate of the audio.

###### playing

Type: `boolean`
Boolean value indicating whether the player is currently playing.

###### shouldCorrectPitch

Type: `boolean`
A boolean describing if we are correcting the pitch for a changed rate.

###### volume

Type: `number`
The current volume of the audio.

##### AudioPlayer Methods

###### pause()

Pauses the player.

Returns: `void`

###### play()

Start playing audio.

Returns: `void`

###### remove()

Remove the player from memory to free up resources.

Returns: `void`

###### replace(source)

| Parameter | Type | Description |
|-----------|------|-------------|
| source | `AudioSource` | New audio source |

Replaces the current audio source with a new one.

Returns: `void`

###### seekTo(seconds)

| Parameter | Type | Description |
|-----------|------|-------------|
| seconds | `number` | The number of seconds to seek by |

Seeks the playback by the given number of seconds.

Returns: `Promise<void>`

###### setPlaybackRate(rate, pitchCorrectionQuality)

| Parameter | Type | Description |
|-----------|------|-------------|
| rate | `number` | The playback rate of the audio |
| pitchCorrectionQuality (optional) | `PitchCorrectionQuality` | The quality of the pitch correction |

Sets the current playback rate of the audio.

Returns: `void`

#### AudioRecorder

Type: `Class extends SharedObject<RecordingEvents>`

##### AudioRecorder Properties

###### currentTime

Type: `number`
The current length of the recording, in seconds.

###### id

Type: `number`
Unique identifier for the recorder object.

###### isRecording

Type: `boolean`
Boolean value indicating whether the recording is in progress.

###### uri

Type: `null | string`
The uri of the recording.

##### AudioRecorder Methods

###### getAvailableInputs()

Returns a list of available recording inputs. This method can only be called if the Recording has been prepared.

Returns: `RecordingInput[]`
A Promise that is fulfilled with an array of RecordingInput objects.

###### getCurrentInput()

Returns the currently-selected recording input. This method can only be called if the Recording has been prepared.

Returns: `RecordingInput`
A Promise that is fulfilled with a RecordingInput object.

###### getStatus()

Status of the current recording.

Returns: `RecorderState`

###### pause()

Pause the recording.

Returns: `void`

###### prepareToRecordAsync(options)

| Parameter | Type | Description |
|-----------|------|-------------|
| options (optional) | `Partial<RecordingOptions>` | Recording options |

Prepares the recording for recording.

Returns: `Promise<void>`

###### record()

Starts the recording.

Returns: `void`

###### recordForDuration(seconds)

| Parameter | Type | Description |
|-----------|------|-------------|
| seconds | `number` | The time in seconds to stop recording at |

Stops the recording once the specified time has elapsed.

Returns: `void`

###### setInput(inputUid)

| Parameter | Type | Description |
|-----------|------|-------------|
| inputUid | `string` | The uid of a RecordingInput |

Sets the current recording input.

Returns: `void`
A Promise that is resolved if successful or rejected if not.

###### startRecordingAtTime(seconds)

| Parameter | Type | Description |
|-----------|------|-------------|
| seconds | `number` | The time in seconds to start recording at |

Starts the recording at the given time.

Returns: `void`

###### stop()

Stop the recording.

Returns: `Promise<void>`

### Methods

#### Audio.getRecordingPermissionsAsync()

Returns: `Promise<PermissionResponse>`

#### Audio.requestRecordingPermissionsAsync()

Returns: `Promise<PermissionResponse>`

#### Audio.setAudioModeAsync(mode)

| Parameter | Type | Description |
|-----------|------|-------------|
| mode | `Partial<AudioMode>` | Audio mode configuration |

Returns: `Promise<void>`

#### Audio.setIsAudioActiveAsync(active)

| Parameter | Type | Description |
|-----------|------|-------------|
| active | `boolean` | Audio active state |

Returns: `Promise<void>`

### Event Subscriptions

#### Audio.useAudioSampleListener(player, listener)

| Parameter | Type | Description |
|-----------|------|-------------|
| player | `AudioPlayer` | Player instance |
| listener | `(data: AudioSample) => void` | Sample data handler |

Returns: `void`

### Interfaces

#### PermissionResponse

An object obtained by permissions get and request functions.

| Property | Type | Description |
|----------|------|-------------|
| canAskAgain | `boolean` | Indicates if user can be asked again for specific permission |
| expires | `PermissionExpiration` | Determines time when the permission expires |
| granted | `boolean` | A convenience boolean that indicates if the permission is granted |
| status | `PermissionStatus` | Determines the status of the permission |

### Types

#### AndroidAudioEncoder

Literal Type: `string`

Acceptable values are: `'default' | 'amr_nb' | 'amr_wb' | 'aac' | 'he_aac' | 'aac_eld'`

#### AndroidOutputFormat

Literal Type: `string`

Acceptable values are: `'default' | '3gp' | 'mpeg4' | 'amrnb' | 'amrwb' | 'aac_adts' | 'mpeg2ts' | 'webm'`

#### AudioEvents

| Property | Type | Description |
|----------|------|-------------|
| audioSampleUpdate | `(data: AudioSample) => void` | - |
| playbackStatusUpdate | `(status: AudioStatus) => void` | - |

#### AudioMode

| Property | Type | Description |
|----------|------|-------------|
| allowsRecording | `boolean` | - |
| interruptionMode | `InterruptionMode` | - |
| playsInSilentMode | `boolean` | - |
| shouldPlayInBackground | `boolean` | - |
| shouldRouteThroughEarpiece | `boolean` | - |

#### AudioSample

| Property | Type | Description |
|----------|------|-------------|
| channels | `AudioSampleChannel[]` | - |
| timestamp | `number` | - |

#### AudioSampleChannel

| Property | Type | Description |
|----------|------|-------------|
| frames | `number[]` | - |

#### AudioSource

Type: `string` or `null` or object shaped as below:

| Property | Type | Description |
|----------|------|-------------|
| headers (optional) | `Record<string, string>` | An object representing the HTTP headers to send along with the request for a remote audio source |
| uri (optional) | `string` | A string representing the resource identifier for the audio |

#### AudioStatus

| Property | Type | Description |
|----------|------|-------------|
| currentTime | `number` | - |
| duration | `number` | - |
| id | `number` | - |
| isBuffering | `boolean` | - |
| isLoaded | `boolean` | - |
| loop | `boolean` | - |
| mute | `boolean` | - |
| playbackRate | `number` | - |
| playbackState | `string` | - |
| playing | `boolean` | - |
| reasonForWaitingToPlay | `string` | - |
| shouldCorrectPitch | `boolean` | - |
| timeControlStatus | `string` | - |

#### BitRateStrategy

Literal Type: `string`

Acceptable values are: `'constant' | 'longTermAverage' | 'variableConstrained' | 'variable'`

#### InterruptionMode

Literal Type: `string`

Acceptable values are: `'mixWithOthers' | 'doNotMix' | 'duckOthers'`

#### PermissionExpiration

Literal Type: multiple types

Permission expiration time. Currently, all permissions are granted permanently.

Acceptable values are: `'never' | number`

#### PitchCorrectionQuality

Literal Type: `string`

Acceptable values are: `'low' | 'medium' | 'high'`

#### RecorderState

| Property | Type | Description |
|----------|------|-------------|
| canRecord | `boolean` | - |
| durationMillis | `number` | - |
| isRecording | `boolean` | - |
| mediaServicesDidReset | `boolean` | - |
| metering (optional) | `number` | - |
| url | `string \| null` | - |

#### RecordingEvents

| Property | Type | Description |
|----------|------|-------------|
| recordingStatusUpdate | `(status: RecordingStatus) => void` | status: RecordingStatus |

#### RecordingInput

| Property | Type | Description |
|----------|------|-------------|
| name | `string` | - |
| type | `string` | - |
| uid | `string` | - |

#### RecordingOptions

| Property | Type | Description |
|----------|------|-------------|
| android | `RecordingOptionsAndroid` | Recording options for Android platform |
| bitRate | `number` | The desired bit rate (e.g. 128000) |
| extension | `string` | The desired file extension (e.g. '.caf') |
| ios | `RecordingOptionsIos` | Recording options for iOS platform |
| numberOfChannels | `number` | The desired number of channels (e.g. 2) |
| sampleRate | `number` | The desired sample rate (e.g. 44100) |
| web (optional) | `RecordingOptionsWeb` | Recording options for Web platform |

#### RecordingOptionsAndroid

| Property | Type | Description |
|----------|------|-------------|
| audioEncoder | `AndroidAudioEncoder` | The desired audio encoder |
| extension (optional) | `string` | The desired file extension (e.g. '.caf') |
| maxFileSize (optional) | `number` | The desired maximum file size in bytes |
| outputFormat | `AndroidOutputFormat` | The desired file format |
| sampleRate (optional) | `number` | The desired sample rate (e.g. 44100) |

#### RecordingOptionsIos

| Property | Type | Description |
|----------|------|-------------|
| audioQuality | `AudioQuality \| number` | The desired audio quality |
| bitDepthHint (optional) | `number` | The desired bit depth hint (e.g. 16) |
| bitRateStrategy (optional) | `number` | The desired bit rate strategy |
| extension (optional) | `string` | The desired file extension (e.g. '.caf') |
| linearPCMBitDepth (optional) | `number` | The desired PCM bit depth (e.g. 16) |
| linearPCMIsBigEndian (optional) | `boolean` | Format PCM data in big endian |
| linearPCMIsFloat (optional) | `boolean` | Encode PCM data as float or int |
| outputFormat (optional) | `string \| IOSOutputFormat \| number` | The desired file format |
| sampleRate (optional) | `number` | The desired sample rate (e.g. 44100) |

#### RecordingOptionsWeb

| Property | Type | Description |
|----------|------|-------------|
| bitsPerSecond (optional) | `number` | - |
| mimeType (optional) | `string` | - |

#### RecordingStatus

| Property | Type | Description |
|----------|------|-------------|
| error | `string \| null` | - |
| hasError | `boolean` | - |
| id | `number` | - |
| isFinished | `boolean` | - |
| url | `string \| null` | - |

### Enums

#### AudioQuality

| Name | Value | Description |
|------|-------|-------------|
| MIN | 0 | Lowest quality |
| LOW | 32 | Low quality |
| MEDIUM | 64 | Medium quality |
| HIGH | 96 | High quality |
| MAX | 127 | Maximum quality |

#### IOSOutputFormat

| Name | Value | Description |
|------|-------|-------------|
| MPEGLAYER1 | ".mp1" | MP1 format |
| MPEGLAYER2 | ".mp2" | MP2 format |
| MPEGLAYER3 | ".mp3" | MP3 format |
| MPEG4AAC | "aac " | AAC format |
| MPEG4AAC_ELD | "aace" | AAC ELD format |
| MPEG4AAC_ELD_SBR | "aacf" | AAC ELD SBR format |
| MPEG4AAC_ELD_V2 | "aacg" | AAC ELD V2 format |
| MPEG4AAC_HE | "aach" | AAC HE format |
| MPEG4AAC_LD | "aacl" | AAC LD format |
| MPEG4AAC_HE_V2 | "aacp" | AAC HE V2 format |
| MPEG4AAC_SPATIAL | "aacs" | AAC Spatial format |
| AC3 | "ac-3" | AC3 format |
| AES3 | "aes3" | AES3 format |
| APPLELOSSLESS | "alac" | Apple Lossless format |
| ALAW | "alaw" | A-law format |
| AUDIBLE | "AUDB" | Audible format |
| 60958AC3 | "cac3" | 60958 AC3 format |
| MPEG4CELP | "celp" | MPEG4 CELP format |
| ENHANCEDAC3 | "ec-3" | Enhanced AC3 format |
| MPEG4HVXC | "hvxc" | MPEG4 HVXC format |
| ILBC | "ilbc" | ILBC format |
| APPLEIMA4 | "ima4" | Apple IMA4 format |
| LINEARPCM | "lpcm" | Linear PCM format |
| MACE3 | "MAC3" | MACE3 format |
| MACE6 | "MAC6" | MACE6 format |
| AMR | "samr" | AMR format |
| AMR_WB | "sawb" | AMR WB format |
| DVIINTELIMA | 1836253201 | DVI Intel IMA format |
| MICROSOFTGSM | 1836253233 | Microsoft GSM format |
| QUALCOMM | "Qclp" | Qualcomm format |
| QDESIGN2 | "QDM2" | QDesign2 format |
| QDESIGN | "QDMC" | QDesign format |
| MPEG4TWINVQ | "twvq" | MPEG4 TwinVQ format |
| ULAW | "ulaw" | µ-law format |

#### PermissionStatus

| Name | Value | Description |
|------|-------|-------------|
| DENIED | "denied" | User has denied the permission |
| GRANTED | "granted" | User has granted the permission |
| UNDETERMINED | "undetermined" | User hasn't granted or denied the permission yet |
