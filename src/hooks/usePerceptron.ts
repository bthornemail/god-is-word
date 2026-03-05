// ============================================================================
// usePerceptron.ts - React Hook for Perceptron Worker Management
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { BroadcastSync, type BroadcastSyncEvent } from '../sync/broadcast-sync';
import type { HypergraphNode, Hyperedge } from '../lib/perceptron/types';

interface PerceptronState {
  state: any;
  hypergraph: { nodes: any[]; edges: any[] };
  eventLog: any[];
}

export function usePerceptron(agentId: string = 'user-agent') {
  const [perceptronState, setPerceptronState] = useState<PerceptronState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [liveEvents, setLiveEvents] = useState<BroadcastSyncEvent[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const broadcastSyncRef = useRef<BroadcastSync | null>(null);
  const initializedRef = useRef(false);

  // Initialize worker and sync
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Initialize BroadcastChannel sync
    const broadcastSync = new BroadcastSync('perceptron-sync');
    broadcastSyncRef.current = broadcastSync;

    // Subscribe to sync events
    const unsubscribe = broadcastSync.subscribe('STATE_UPDATE', (event) => {
      setLiveEvents(prev => [...prev, event].slice(-50)); // Keep last 50 events
      
      // Process the message if it's from another tab
      if (workerRef.current && event.senderId !== broadcastSync.getSenderId()) {
        workerRef.current.postMessage({
          type: 'PROCESS_MESSAGE',
          payload: event.payload
        });
      }
    });

    // Initialize worker
    try {
      console.log('[usePerceptron] Creating worker...');
      const worker = new Worker(new URL('../workers/perceptron-worker.ts', import.meta.url), {
        type: 'module'
      });
      workerRef.current = worker;

      // Handle worker errors
      worker.onerror = (error) => {
        console.error('[usePerceptron] Worker error:', error);
        setIsReady(false);
      };

      // Handle worker messages
      worker.onmessage = (e) => {
        const { type, payload } = e.data;
        console.log('[usePerceptron] Received message:', type);

        switch (type) {
          case 'INITIALIZED':
            console.log('[usePerceptron] Agent initialized, setting state');
            setPerceptronState({
              state: payload.state,
              hypergraph: payload.hypergraph,
              eventLog: []
            });
            setIsReady(true);
            console.log('[usePerceptron] isReady set to true');
            break;
          
          case 'ERROR':
            console.error('[usePerceptron] Worker error:', payload.error);
            setIsReady(false);
            break;

          case 'STATE_UPDATE':
            setPerceptronState({
              state: payload.state,
              hypergraph: payload.hypergraph,
              eventLog: payload.eventLog || []
            });
            
            // Broadcast to other tabs
            if (broadcastSyncRef.current) {
              broadcastSyncRef.current.broadcast(payload.message, 'STATE_UPDATE');
            }
            break;

          case 'HYPERGRAPH_UPDATE':
            setPerceptronState(prev => ({
              ...prev!,
              hypergraph: payload.hypergraph,
              state: payload.state
            }));
            
            // Broadcast to other tabs
            if (broadcastSyncRef.current) {
              broadcastSyncRef.current.broadcast(payload.message, 'HYPERGRAPH_UPDATE');
            }
            break;

          case 'MESSAGE_RESPONSE':
            // Handle response from processing remote message
            setPerceptronState(prev => ({
              ...prev!,
              state: payload.state,
              hypergraph: payload.hypergraph
            }));
            break;
        }
      };
    } catch (error) {
      console.error('[usePerceptron] Failed to create worker:', error);
      setIsReady(false);
      return;
    }

    // Load saved state and initialize
    const loadAndInit = async () => {
      try {
        console.log('[usePerceptron] Loading saved state...');
        const savedState = localStorage.getItem('perceptron_state');
        const parsedState = savedState ? JSON.parse(savedState) : null;
        console.log('[usePerceptron] Sending INIT message to worker');

        if (workerRef.current) {
          workerRef.current.postMessage({
            type: 'INIT',
            payload: {
              agentId,
              savedState: parsedState
            }
          });
          
          // Fallback timeout - if worker doesn't respond in 10 seconds, mark as failed
          setTimeout(() => {
            if (!isReady) {
              console.error('[usePerceptron] Timeout waiting for worker initialization');
              setIsReady(true); // Allow app to continue anyway
            }
          }, 10000);
        }
      } catch (error) {
        console.error('[usePerceptron] Failed to load state:', error);
        if (workerRef.current) {
          workerRef.current.postMessage({
            type: 'INIT',
            payload: { agentId }
          });
        }
      }
    };

    loadAndInit();

    return () => {
      unsubscribe();
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      broadcastSync.close();
    };
  }, [agentId]);

  // Add knowledge (convert journal entry to triple)
  const addKnowledge = useCallback(async (
    subject: string,
    predicate: string,
    object: string,
    modality: 'MUST' | 'SHOULD' | 'MAY' = 'MUST'
  ) => {
    if (!workerRef.current || !isReady) {
      throw new Error('Perceptron not initialized');
    }

    workerRef.current.postMessage({
      type: 'ADD_KNOWLEDGE',
      payload: { subject, predicate, object, modality }
    });
  }, [isReady]);

  // Add hypergraph node
  const addHypergraphNode = useCallback(async (node: HypergraphNode) => {
    if (!workerRef.current || !isReady) {
      throw new Error('Perceptron not initialized');
    }

    workerRef.current.postMessage({
      type: 'ADD_HYPERGRAPH_NODE',
      payload: node
    });
  }, [isReady]);

  // Add hyperedge
  const addHyperedge = useCallback(async (edge: Hyperedge) => {
    if (!workerRef.current || !isReady) {
      throw new Error('Perceptron not initialized');
    }

    workerRef.current.postMessage({
      type: 'ADD_HYPEREDGE',
      payload: edge
    });
  }, [isReady]);

  // Export state
  const exportState = useCallback(async (): Promise<any> => {
    if (!workerRef.current || !isReady) {
      throw new Error('Perceptron not initialized');
    }

    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'EXPORT_RESPONSE') {
          workerRef.current?.removeEventListener('message', handler);
          resolve(e.data.payload);
        } else if (e.data.type === 'ERROR') {
          workerRef.current?.removeEventListener('message', handler);
          reject(new Error(e.data.payload.error));
        }
      };

      workerRef.current?.addEventListener('message', handler);
      workerRef.current?.postMessage({ type: 'EXPORT_STATE' });
    });
  }, [isReady]);

  // Save state to localStorage
  useEffect(() => {
    if (perceptronState && isReady) {
      try {
        localStorage.setItem('perceptron_state', JSON.stringify(perceptronState));
      } catch (error) {
        console.error('[usePerceptron] Failed to save state:', error);
      }
    }
  }, [perceptronState, isReady]);

  return {
    perceptronState,
    isReady,
    liveEvents,
    addKnowledge,
    addHypergraphNode,
    addHyperedge,
    exportState
  };
}

