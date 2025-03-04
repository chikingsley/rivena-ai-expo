import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { LLM_CONFIG } from '@/lib/config';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Set the runtime to edge for streaming responses
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Ensure messages array exists
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the system message if it doesn't exist
    if (!messages.some(message => message.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: LLM_CONFIG.systemPrompt,
      });
    }

    // Request the OpenAI API for the response
    const response = await openai.chat.completions.create({
      model: LLM_CONFIG.model,
      messages,
      temperature: LLM_CONFIG.temperature,
      max_tokens: LLM_CONFIG.maxTokens,
      stream: true,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in voice-ai API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process voice request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
