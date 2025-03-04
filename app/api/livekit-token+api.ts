import { AccessToken, VideoGrant } from 'livekit-server-sdk';

// Get LiveKit configuration from environment variables
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'APIpqm34tVrMJHW';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '0bsTAo45EY5Qt9M2E4aiknYrwKZIpAnqIIdHgDaIKzJ';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://danvisualize-jwf5wckk.livekit.cloud';

export async function GET(request: Request) {
  try {
    console.log('LiveKit token API called');
    console.log('Using API key:', LIVEKIT_API_KEY);
    console.log('Using LiveKit URL:', LIVEKIT_URL);

    // Parse the URL to get query parameters
    const { searchParams } = new URL(request.url);

    // Get the room name and participant identity from query parameters
    // Default to 'voice-ai-room' and a random identity if not provided
    const roomName = searchParams.get('room') || 'voice-ai-room';
    const identity = searchParams.get('identity') || `user-${Math.floor(Math.random() * 100000)}`;

    console.log('Room name:', roomName);
    console.log('Identity:', identity);

    console.log('Creating token with:');
    console.log('- API Key:', LIVEKIT_API_KEY);
    console.log('- API Secret:', LIVEKIT_API_SECRET.substring(0, 5) + '...');
    console.log('- Identity:', identity);
    console.log('- Room:', roomName);

    // Create a new AccessToken
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      ttl: 60 * 60, // 1 hour in seconds
    });

    console.log('Token:', token);

    const videoGrant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    };

    // Grant permissions to the token
    token.addGrant(videoGrant);

    // Generate the JWT token - await it directly in the main function
    const jwt = await token.toJwt();
    
    console.log('Generated token successfully');
    console.log('Token type:', typeof jwt);
    console.log('Token starts with:', jwt.substring(0, 20) + '...');
    console.log('Token generated and ready to use');

    // Return the token and WebSocket URL
    return new Response(
      JSON.stringify({
        token: jwt,
        url: LIVEKIT_URL,
        room: roomName,
        identity,
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    // Get more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', errorMessage);
    console.error('Stack trace:', errorStack);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate token',
        details: errorMessage,
        stack: errorStack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}