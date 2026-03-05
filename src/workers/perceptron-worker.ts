// ============================================================================
// perceptron-worker.ts - Main Web Worker for Perceptron State Management
// ============================================================================

import { PerceptronAgent } from '../lib/perceptron/agent';
import type { NetworkMessage, HypergraphNode, Hyperedge } from '../lib/perceptron/types';

let agent: PerceptronAgent | null = null;
let computationWorker: Worker | null = null;

// Initialize computation worker
function initComputationWorker(): Worker | null {
  try {
    return new Worker(new URL('./computation-worker.ts', import.meta.url), {
      type: 'module'
    });
  } catch (error) {
    console.warn('[Perceptron Worker] Failed to create computation worker:', error);
    return null;
  }
}

// Initialize perceptron agent
async function initializeAgent(agentId: string, savedState?: any) {
  console.log('[Perceptron Worker] Initializing agent...', { agentId, hasSavedState: !!savedState });
  
  try {
    if (savedState) {
      console.log('[Perceptron Worker] Deserializing saved state');
      agent = PerceptronAgent.deserialize(savedState);
      console.log('[Perceptron Worker] Calling agent.initialize()...');
      await agent.initialize();
      console.log('[Perceptron Worker] Agent initialized from saved state');
    } else {
      console.log('[Perceptron Worker] Creating new agent');
      agent = new PerceptronAgent(agentId);
      console.log('[Perceptron Worker] Calling agent.initialize()...');
      await agent.initialize();
      console.log('[Perceptron Worker] Agent initialized (new)');
    }

    // Subscribe to all topics by default for journal app
    agent.subscribe('system:sync');
    agent.subscribe('system:state');
    agent.subscribe('hypergraph:nodes:Concept');
    agent.subscribe('hypergraph:nodes:System');
    agent.subscribe('hypergraph:edges');
    console.log('[Perceptron Worker] Subscriptions set up');
  } catch (error) {
    console.error('[Perceptron Worker] Error in initializeAgent:', error);
    throw error;
  }
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'INIT': {
        console.log('[Perceptron Worker] Received INIT message', payload);
        const { agentId, savedState } = payload;
        
        try {
          await initializeAgent(agentId, savedState);
          console.log('[Perceptron Worker] Agent initialized successfully');
        } catch (initError) {
          console.error('[Perceptron Worker] Failed to initialize agent:', initError);
          self.postMessage({
            type: 'ERROR',
            payload: {
              error: `Initialization failed: ${initError instanceof Error ? initError.message : String(initError)}`
            }
          });
          return;
        }
        
        // Initialize computation worker (optional - can continue without it)
        computationWorker = initComputationWorker();
        if (computationWorker) {
          computationWorker.onmessage = (e) => {
            if (e.data.type === 'COMPUTATION_RESULT') {
              // Forward computation results back to main thread
              self.postMessage({
                type: 'COMPUTATION_RESULT',
                payload: e.data.result
              });
            }
          };
          console.log('[Perceptron Worker] Computation worker initialized');
        } else {
          console.log('[Perceptron Worker] Running without computation worker');
        }

        if (!agent) {
          throw new Error('Agent is null after initialization');
        }

        console.log('[Perceptron Worker] Preparing INITIALIZED message...');
        const state = agent.getState();
        const hypergraph = agent.getHypergraph();
        
        // Serialize state for postMessage (PatriciaTrie needs to be serialized)
        const serializedState = {
          ...state,
          H: {
            ...state.H,
            vocabTrie: state.H.vocabTrie.serialize()
          }
        };

        console.log('[Perceptron Worker] Sending INITIALIZED message');
        self.postMessage({
          type: 'INITIALIZED',
          payload: {
            state: serializedState,
            hypergraph: hypergraph
          }
        });
        break;
      }

      case 'ADD_KNOWLEDGE': {
        if (!agent) {
          throw new Error('Agent not initialized');
        }

        const { subject, predicate, object, modality } = payload;
        const triple = await agent.addKnowledge(subject, predicate, object, modality || 'MUST');
        const message = await agent.levelUp(triple);

        // Send matrix to computation worker for heavy computation
        if (computationWorker) {
          computationWorker.postMessage({
            type: 'COMPUTE',
            payload: { matrix: agent.getState().M },
            workerId: 0
          });
        }

        self.postMessage({
          type: 'STATE_UPDATE',
          payload: {
            message,
            state: agent.getState(),
            hypergraph: agent.getHypergraph()
          }
        });
        break;
      }

      case 'ADD_HYPERGRAPH_NODE': {
        if (!agent) {
          throw new Error('Agent not initialized');
        }

        const node = payload as HypergraphNode;
        const message = await agent.addHypergraphNode(node);

        self.postMessage({
          type: 'HYPERGRAPH_UPDATE',
          payload: {
            message,
            hypergraph: agent.getHypergraph(),
            state: agent.getState()
          }
        });
        break;
      }

      case 'ADD_HYPEREDGE': {
        if (!agent) {
          throw new Error('Agent not initialized');
        }

        const edge = payload as Hyperedge;
        const message = await agent.addHyperedge(edge);

        self.postMessage({
          type: 'HYPERGRAPH_UPDATE',
          payload: {
            message,
            hypergraph: agent.getHypergraph(),
            state: agent.getState()
          }
        });
        break;
      }

      case 'PROCESS_MESSAGE': {
        if (!agent) {
          throw new Error('Agent not initialized');
        }

        const message = payload as NetworkMessage;
        const peerPublicKey = message.signature; // Use signature as peer identifier for now
        const response = await agent.processMessage(message, peerPublicKey);

        if (response) {
          self.postMessage({
            type: 'MESSAGE_RESPONSE',
            payload: {
              response,
              state: agent.getState(),
              hypergraph: agent.getHypergraph()
            }
          });
        }
        break;
      }

      case 'GET_STATE': {
        if (!agent) {
          throw new Error('Agent not initialized');
        }

        self.postMessage({
          type: 'STATE_RESPONSE',
          payload: {
            state: agent.getState(),
            hypergraph: agent.getHypergraph(),
            eventLog: agent.getEventLog()
          }
        });
        break;
      }

      case 'EXPORT_STATE': {
        if (!agent) {
          throw new Error('Agent not initialized');
        }

        const serialized = agent.serialize();
        self.postMessage({
          type: 'EXPORT_RESPONSE',
          payload: serialized
        });
        break;
      }

      default:
        console.warn(`[Perceptron Worker] Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: {
        error: error instanceof Error ? error.message : String(error)
      }
    });
  }
};

console.log('[Perceptron Worker] Started');

