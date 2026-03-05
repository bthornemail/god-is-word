// ============================================================================
// broadcast-sync.ts - BroadcastChannel for Multi-Tab Sync
// ============================================================================

import type { NetworkMessage } from '../lib/perceptron/types';

export interface BroadcastSyncEvent {
  type: 'STATE_UPDATE' | 'HYPERGRAPH_UPDATE' | 'SYNC_REQUEST' | 'SYNC_RESPONSE';
  payload: NetworkMessage;
  timestamp: number;
  senderId: string;
}

export class BroadcastSync {
  private channel: BroadcastChannel;
  private listeners: Map<string, Set<(event: BroadcastSyncEvent) => void>>;
  private senderId: string;

  constructor(channelName: string = 'perceptron-sync') {
    this.channel = new BroadcastChannel(channelName);
    this.listeners = new Map();
    
    // Generate unique sender ID
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    this.senderId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // Listen for messages from other tabs
    this.channel.onmessage = (event: MessageEvent) => {
      const syncEvent = event.data as BroadcastSyncEvent;
      
      // Don't process our own messages
      if (syncEvent.senderId === this.senderId) {
        return;
      }

      // Notify all listeners for this event type
      const typeListeners = this.listeners.get(syncEvent.type);
      if (typeListeners) {
        typeListeners.forEach(listener => {
          try {
            listener(syncEvent);
          } catch (error) {
            console.error(`[BroadcastSync] Error in listener:`, error);
          }
        });
      }
    };
  }

  /**
   * Broadcast a state update to all tabs
   */
  broadcast(message: NetworkMessage, eventType: BroadcastSyncEvent['type'] = 'STATE_UPDATE'): void {
    const syncEvent: BroadcastSyncEvent = {
      type: eventType,
      payload: message,
      timestamp: Date.now(),
      senderId: this.senderId
    };

    this.channel.postMessage(syncEvent);
    console.log(`[BroadcastSync] Broadcasted ${eventType} to all tabs`);
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(eventType: BroadcastSyncEvent['type'], listener: (event: BroadcastSyncEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(eventType);
      if (typeListeners) {
        typeListeners.delete(listener);
        if (typeListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Close the broadcast channel
   */
  close(): void {
    this.channel.close();
    this.listeners.clear();
  }

  /**
   * Get the sender ID for this instance
   */
  getSenderId(): string {
    return this.senderId;
  }
}

