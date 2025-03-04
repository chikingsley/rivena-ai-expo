# Generating LiveKit Tokens

To connect frontend applications to LiveKit rooms, you need to generate tokens from your backend server. This guide outlines the process of setting up a server to create these tokens.

## 1. Install LiveKit Server SDK

```bash
npm install livekit-server-sdk
# or
yarn add livekit-server-sdk
```

## 2. Configure API Keys

Create a `development.env` file with your LiveKit API credentials:

```bash
export LIVEKIT_API_KEY=your_api_key_here
export LIVEKIT_API_SECRET=your_api_secret_here
```

## 3. Create a Token Generation Endpoint

Set up an Express server to handle token creation:

```javascript
// server.js
import express from 'express';
import { AccessToken } from 'livekit-server-sdk';

const app = express();
const port = 3000;

async function createToken() {
  const roomName = 'my-room';
  const participantName = 'user-123';

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: participantName,
    ttl: '10m'
  });
  token.addGrant({ roomJoin: true, room: roomName });

  return token.toJwt();
}

app.get('/token', async (req, res) => {
  const token = await createToken();
  res.json({ token });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
```

Start the server:

```bash
source development.env
node server.js
```

## 4. Implement Frontend Connection

Use the generated token in your frontend application to establish a LiveKit room connection:

```javascript
import { Room } from 'livekit-client';

async function connectToRoom() {
  const response = await fetch('http://localhost:3000/token');
  const { token } = await response.json();

  const room = new Room();
  await room.connect('wss://your-livekit-url.livekit.cloud', token);
  console.log('Connected to room:', room.name);
}

connectToRoom();
```

Refer to the [LiveKit documentation](https://docs.livekit.io) for more detailed information on authentication and room management.

# Room Management with RoomServiceClient

Room management operations are performed using a `RoomServiceClient` in Node.js. Here's how to initialize and use it:

## Initialize RoomServiceClient

```javascript
import { Room, RoomServiceClient } from 'livekit-server-sdk';

const livekitHost = 'https://my.livekit.host';
const roomService = new RoomServiceClient(livekitHost, 'api-key', 'secret-key');
```

## Create a Room

```javascript
const opts = {
  name: 'myroom',
  emptyTimeout: 10 * 60, // 10 minutes
  maxParticipants: 20,
};

roomService.createRoom(opts).then((room: Room) => {
  console.log('room created', room);
});
```

## List Rooms

```javascript
roomService.listRooms().then((rooms: Room[]) => {
  console.log('existing rooms', rooms);
});
```

## Delete a Room

Deleting a room will disconnect all participants.

```javascript
roomService.deleteRoom('myroom').then(() => {
  console.log('room deleted');
});
```