import { AccessToken } from 'livekit-server-sdk';

// This would typically come from environment variables
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'devsecret';
const LIVEKIT_WS_URL = process.env.LIVEKIT_WS_URL || 'wss://your-livekit-server.com';

export async function GET(request: Request) {
  try {
    // Parse the URL to get query parameters
    const { searchParams } = new URL(request.url);
    
    // Get the room name and participant identity from query parameters
    // Default to 'voice-ai-room' and a random identity if not provided
    const roomName = searchParams.get('room') || 'voice-ai-room';
    const identity = searchParams.get('identity') || `user-${Math.floor(Math.random() * 100000)}`;
    
    // Create a new AccessToken
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      ttl: 60 * 60, // 1 hour in seconds
    });
    
    // Grant permissions to the token
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    
    // Generate the JWT token
    const jwt = token.toJwt();
    
    // Return the token and WebSocket URL
    return Response.json({
      token: jwt,
      url: LIVEKIT_WS_URL,
      room: roomName,
      identity,
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return Response.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
