Camera & microphone
Publish realtime audio and video from any device.
Overview
LiveKit includes a simple and consistent method to publish the user's camera and microphone, regardless of the device or browser they are using. In all cases, LiveKit displays the correct indicators when recording is active and acquires the necessary permissions from the user.
// Enables the camera and publishes it to a new video track
room.localParticipant.setCameraEnabled(true);

// Enables the microphone and publishes it to a new audio track
room.localParticipant.setMicrophoneEnabled(true);

Device permissions
In native and mobile apps, you typically need to acquire consent from the user to access the microphone or camera. LiveKit integrates with the system privacy settings to record permission and display the correct indicators when audio or video capture is active.
For web browsers, the user is automatically prompted to grant camera and microphone permissions the first time your app attempts to access them and no additional configuration is required.

REACT NATIVEFor iOS, add to Info.plist:
<key>NSCameraUsageDescription</key>
<string>$(PRODUCT_NAME) uses your camera</string>
<key>NSMicrophoneUsageDescription</key>
<string>$(PRODUCT_NAME) uses your microphone</string>
Copy
For Android, add to AndroidManifest.xml:
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
Copy
You'll need to request permissions at runtime using a permissions library like react-native-permissions.
Mute and unmute
You can mute any track to stop it from sending data to the server. When a track is muted, LiveKit will trigger a TrackMuted event on all participants in the room. You can use this event to update your app's UI and reflect the correct state to all users in the room.
Mute/unmute a track using its corresponding LocalTrackPublication object.
Track permissions
By default, any published track can be subscribed to by all participants. However, publishers can restrict who can subscribe to their tracks using Track Subscription Permissions:
JAVASCRIPT
localParticipant.setTrackSubscriptionPermissions(false, [
  {
    participantIdentity: 'allowed-identity',
    allowAll: true,
  },
]);

Publishing from backend
You may also publish audio/video tracks from a backend process, which can be consumed just like any camera or microphone track. The LiveKit Agents framework makes it easy to add a programmable participant to any room, and publish media such as synthesized speech or video.
LiveKit also includes complete SDKs for server environments in Go

, Rust

, Python

, and Node.js

.
You can also publish media using the LiveKit CLI

.
Audio and video synchronization

Note
AVSynchronizer is currently only available in Python.
While WebRTC handles A/V sync natively, some scenarios require manual synchronization - for example, when synchronizing generated video with voice output.
The 
AVSynchronizer
 utility helps maintain sync by aligning the first audio and video frames. Subsequent frames are automatically synchronized based on configured video FPS and audio sample rate.
For implementation examples, see the video stream examples

 in our GitHub repository.

Subscribing to tracks
Play and render realtime media tracks in your application.
Overview
While connected to a room, a participant can receive and render any tracks published to the room. When autoSubscribe is enabled (default), the server automatically delivers new tracks to participants, making them ready for rendering.
Track subscription
Rendering media tracks starts with a subscription to receive the track data from the server.
As mentioned in the guide on rooms, participants, and tracks, LiveKit models tracks with two constructs: TrackPublication and Track. Think of a TrackPublication as metadata for a track registered with the server and Track as the raw media stream. Track publications are always available to the client, even when the track is not subscribed to.
Track subscription callbacks provide your app with both the Track and TrackPublication objects.
Subscribed callback will be fired on both Room and RemoteParticipant objects.

JAVASCRIPT
import { connect, RoomEvent } from 'livekit-client';

room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

function handleTrackSubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant,
) {
  /* Do things with track, publication or participant */
}

REACT
import { useTracks } from '@livekit/components-react';

export const MyPage = () => {
  return (
    <LiveKitRoom ...>
      <MyComponent />
    </LiveKitRoom>
  )
}

export const MyComponent = () => {
  const cameraTracks = useTracks([Track.Source.Camera], {onlySubscribed: true});
  return (
    <>
      {cameraTracks.map((trackReference) => {
        return (
          <VideoTrack {...trackReference} />
        )
      })}
    </>
  )
}

Note
This guide is focused on frontend applications. To consume media in your backend, use the LiveKit Agents framework or SDKs for Go

, Rust

, Python

, or Node.js

.
Media playback
Once subscribed to an audio or video track, it's ready to be played in your application

Audio playback will begin automatically after track subscription. Video playback requires the VideoTrack component:
export const MyComponent = ({ videoTrack }) => {
  return <VideoTrack trackRef={videoTrack} />;
};

Active speaker identification
LiveKit can automatically detect participants who are actively speaking and send updates when their speaking status changes. Speaker updates are sent for both local and remote participants. These events fire on both Room and Participant objects, allowing you to identify active speakers in your UI.

REACT NATIVE
export const MyComponent = ({ participant }) => {
  const { isSpeaking } = useParticipant(participant);

  return <Text>{isSpeaking ? 'speaking' : 'not speaking'}</Text>;
};

Selective subscription
Disable autoSubscribe to take manual control over which tracks the participant should subscribe to. This is appropriate for spatial applications and/or applications that require precise control over what each participant receives.
Both LiveKit's SDKs and server APIs have controls for selective subscription. Once configured, only explicitly subscribed tracks are delivered to the participant.
From frontend

let room = await room.connect(url, token, {
  autoSubscribe: false,
});

room.on(RoomEvent.TrackPublished, (publication, participant) => {
  publication.setSubscribed(true);
});

// Also subscribe to tracks published before participant joined
room.remoteParticipants.forEach((participant) => {
  participant.trackPublications.forEach((publication) => {
    publication.setSubscribed(true);
  });
});

From server API
These controls are also available with the server APIs.
NODE.JS
import { RoomServiceClient } from 'livekit-server-sdk';

const roomServiceClient = new RoomServiceClient('myhost', 'api-key', 'my secret');

// Subscribe to new track
roomServiceClient.updateSubscriptions('myroom', 'receiving-participant-identity', ['TR_TRACKID'], true);

// Unsubscribe from existing track
roomServiceClient.updateSubscriptions('myroom', 'receiving-participant-identity', ['TR_TRACKID'], false);

Adaptive stream
In an application, video elements where tracks are rendered could vary in size, and sometimes hidden. It would be extremely wasteful to fetch high-resolution videos but only to render it in a 150x150 box.
Adaptive stream allows a developer to build dynamic video applications without consternation for how interface design or user interaction might impact video quality. It allows us to fetch the minimum bits necessary for high-quality rendering and helps with scaling to very large sessions.
When adaptive stream is enabled, the LiveKit SDK will monitor both size and visibility of the UI elements that the tracks are attached to. Then it'll automatically coordinate with the server to ensure the closest-matching simulcast layer that matches the UI element is sent back. If the element is hidden, the SDK will automatically pause the associated track on the server side until the element becomes visible.

Note
With JS SDK, you must use Track.attach() in order for adaptive stream to be effective.

Enabling/disabling tracks
Implementations seeking fine-grained control can enable or disable tracks at their discretion. This could be used to implement subscriber-side mute. (for example, muting a publisher in the room, but only for the current user).
When disabled, the participant will not receive any new data for that track. If a disabled track is subsequently enabled, new data will be received again.
The disable action is useful when optimizing for a participant's bandwidth consumption. For example, if a particular user's video track is offscreen, disabling this track will reduce bytes from being sent by the LiveKit server until the track's data is needed again. (this is not needed with adaptive stream)

JAVASCRIPT
import { connect, RoomEvent } from 'livekit-client';

room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

function handleTrackSubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant,
) {
  publication.setEnabled(false);
}

Note
You may be wondering how subscribe and unsubscribe differs from enable and disable. A track must be subscribed to and enabled for data to be received by the participant. If a track has not been subscribed to (or was unsubscribed) or disabled, the participant performing these actions will not receive that track's data.
The difference between these two actions is negotiation. Subscribing requires a negotiation handshake with the LiveKit server, while enable/disable does not. Depending on one's use case, this can make enable/disable more efficient, especially when a track may be turned on or off frequently.

Simulcast controls
If a video track has simulcast enabled, a receiving participant may want to manually specify the maximum receivable quality. This would result a quality and bandwidth reduction for the target track. This might come in handy, for instance, when an application's user interface is displaying a small thumbnail for a particular user's video track.

JAVASCRIPT
import { connect, RoomEvent } from 'livekit-client';

connect('ws://your_host', token, {
  audio: true,
  video: true,
}).then((room) => {
  room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
});

function handleTrackSubscribed(
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant,
) {
  if (track.kind === Track.Kind.Video) {
    publication.setVideoQuality(VideoQuality.LOW);
  }
}