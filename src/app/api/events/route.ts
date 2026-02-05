import { NextRequest } from 'next/server';
import { subscribeToEvents } from '@/lib/events';
import { SSEEvent } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', data: { timestamp: new Date().toISOString() } })}\n\n`)
      );

      // Subscribe to events
      const unsubscribe = subscribeToEvents((event: SSEEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch (error) {
          // Client disconnected
          console.error('Error sending SSE event:', error);
        }
      });

      // Set up heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`: heartbeat\n\n`)
          );
        } catch {
          // Client disconnected
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 30000); // 30 second heartbeat

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
