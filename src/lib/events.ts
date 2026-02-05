import { SSEEvent } from '@/types';

type EventListener = (event: SSEEvent) => void;

// Simple in-memory event emitter for SSE
class EventEmitter {
  private listeners: Set<EventListener> = new Set();

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: SSEEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }
}

// Singleton instance
const eventEmitter = new EventEmitter();

export function subscribeToEvents(listener: EventListener): () => void {
  return eventEmitter.subscribe(listener);
}

export function emitEvent(event: SSEEvent): void {
  eventEmitter.emit(event);
}

export default eventEmitter;
