export async function GET(request: Request) {
  try {
    console.log('Test token API called');
    
    // Hardcoded token and URL for testing
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTU2MzY4MDAsImlzcyI6ImRldmtleSIsIm5hbWUiOiJ0ZXN0LXVzZXIiLCJuYmYiOjE3MDk5NzY4MDAsInN1YiI6InRlc3QtdXNlciIsInZpZGVvIjp7InJvb20iOiJ2b2ljZS10ZXN0LXJvb20iLCJyb29tSm9pbiI6dHJ1ZSwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfX0.tR2yvZ1XzIuuMlT2JK9AmqHmxOc_YnkJYTYHlNvE1jw';
    const testUrl = 'wss://demo.livekit.cloud';
    
    console.log('Returning test token and URL');
    
    // Return the hardcoded token and URL
    return new Response(
      JSON.stringify({
        token: testToken,
        url: testUrl,
        room: 'voice-test-room',
        identity: 'test-user',
      }),
      { 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in test token API:', error);
    return new Response(
      JSON.stringify({ error: 'Test token API failed' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
