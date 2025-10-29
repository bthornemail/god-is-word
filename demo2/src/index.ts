// ============================================================================
// index.ts - Local-First Perceptron with Patricia Trie & Pub/Sub
// ============================================================================

import cluster from 'cluster';
import os from 'os';
import { Worker } from 'worker_threads';
import crypto from 'crypto';
import { performance } from 'perf_hooks';
// import { writeFileSync, readFileSync, existsSync } from 'fs';
import { PatriciaTrie, TrieTopology } from './patricia-trie';
// import { TopicRouter } from './topic-router';
// import { ConflictResolver, ConflictEvent, VectorClock } from './conflict-resolver';
// import { TransportFactory, TransportMessage, TransportConfig } from './ipc-transport';
import dgram from 'dgram';

// ============================================================================
// Type Definitions - The 8-Tuple Perceptron State (𝒫)
// ============================================================================

interface PerceptronState {
  // H: Hilbert Space
  H: {
    tau_state: number;
    publicKey: string;
    vocabTrie: PatriciaTrie;
    trieHash: string;
  };
  // L: Async Logic
  L: string[];
  // K: Cryptographic Identity
  K: {
    privateKey: string;
    publicKey: string;
    hashFunction: string;
  };
  // I: Geometric Invariants
  I: {
    blockDesign: BlockDesign | null;
    bettiNumbers: { beta0: number; beta1: number };
    schlaefliSymbol: string | null;
    deltaT: number[][] | null;
    trieTopology: TrieTopology | null;
  };
  // F: Functional Primitives
  F: string[];
  // T: Semantic Basis (Local Event Log)
  T: SemanticTriple[];
  // B: Universal Basis
  B: string[];
  // D: Data Primitives
  D: { standard: string; encoding: string };
  // State Matrix M
  M: number[][];
  // Metric Signature
  S: string | null;
  // IPv6 Address
  ipv6: string | null;
}

interface BlockDesign {
  v: number;
  k: number;
  lambda: number;
  r: number;
  b: number;
}

interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
  modality: 'MUST' | 'SHOULD' | 'MAY';
  certainty: number;
  eventId: string; // Unique event identifier for the log
  timestamp: number;
}

interface HypergraphNode {
  id: string;
  label: string;
  data: any;
  owner: string;
}

interface Hyperedge {
  id: string;
  nodes: string[];
  label: string;
  owner: string;
}

interface NetworkMessage {
  type: 'STATE_UPDATE' | 'HYPERGRAPH_NODE' | 'HYPERGRAPH_EDGE' | 'SYNC_REQUEST' | 'SYNC_RESPONSE';
  topic: string; // NEW: Pub/Sub topic
  payload: any;
  signature: string;
  tau_state: number;
  ipv6: string;
  timestamp: number;
}

// ============================================================================
// Shared Memory Layout
// ============================================================================

const SHARED_MEMORY_SIZE = 1024 * 1024;
const SIGNAL_OFFSET = 0;
const LENGTH_OFFSET = 4;
const DATA_OFFSET = 8;

// ============================================================================
// Perceptron Agent with Local-First & Pub/Sub
// ============================================================================

class PerceptronAgent {
  private state: PerceptronState;
  private hypergraph: {
    nodes: Map<string, HypergraphNode>;
    edges: Map<string, Hyperedge>;
  };
  private subscriptions: Set<string>; // NEW: Topic subscriptions
  private agentId: string;

  constructor(agentId: string) {
    const { privateKey, publicKey } = this.generateKeyPair();

    // Initialize Patricia Trie with basis vocabulary
    const vocabTrie = new PatriciaTrie();
    const basisTerms = ['Read', 'Eval', 'Print', 'Loop', 'Node', 'Edge',
      'Graph', 'Hypergraph', 'Functor', 'Monad'];
    basisTerms.forEach(term => vocabTrie.insert(term));

    this.state = {
      H: {
        tau_state: 0.0,
        publicKey,
        vocabTrie,
        trieHash: vocabTrie.calculateHash()
      },
      L: ['Async', 'Await', 'Try', 'Catch', 'Call'],
      K: { privateKey, publicKey, hashFunction: 'SHA-256' },
      I: {
        blockDesign: null,
        bettiNumbers: { beta0: 1, beta1: 0 },
        schlaefliSymbol: null,
        deltaT: null,
        trieTopology: null
      },
      F: ['Read', 'Eval', 'Print', 'Loop'],
      T: [],
      B: ['Node', 'Edge', 'Graph', 'Incidence', 'Hypergraph', 'Functor', 'Monad'],
      D: { standard: 'IEEE 754', encoding: 'Binary' },
      M: this.createIdentityMatrix(basisTerms.length),
      S: null,
      ipv6: null
    };

    this.hypergraph = {
      nodes: new Map(),
      edges: new Map()
    };

    this.subscriptions = new Set();
    this.agentId = agentId;

    // Subscribe to system topics by default
    this.subscribe('system:sync');
    this.subscribe('system:heartbeat');

    console.log(`[${agentId}] Initialized`);
    console.log(`[${agentId}] Public Key: ${publicKey.substring(0, 8)}...`);
    console.log(`[${agentId}] Trie Hash: ${this.state.H.trieHash.substring(0, 8)}...`);
  }

  // ============================================================================
  // Pub/Sub Methods
  // ============================================================================

  subscribe(topic: string): void {
    this.subscriptions.add(topic);
    console.log(`[${this.agentId}] Subscribed to '${topic}'`);
  }

  unsubscribe(topic: string): void {
    this.subscriptions.delete(topic);
    console.log(`[${this.agentId}] Unsubscribed from '${topic}'`);
  }

  isSubscribed(topic: string): boolean {
    return this.subscriptions.has(topic);
  }

  // ============================================================================
  // Cryptographic Methods
  // ============================================================================

  private generateKeyPair(): { privateKey: string; publicKey: string } {
    const privateKey = crypto.randomBytes(32).toString('hex');
    const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex');
    return { privateKey, publicKey };
  }

  private createIdentityMatrix(size: number): number[][] {
    return Array(size).fill(0).map((_, i) =>
      Array(size).fill(0).map((_, j) => i === j ? 1 : 0)
    );
  }

  // ============================================================================
  // State Transition Logic (Local-First)
  // ============================================================================

  /**
   * Add knowledge triple to local log (T) and update trie
   */
  addKnowledge(subject: string, predicate: string, object: string,
    modality: 'MUST' | 'SHOULD' | 'MAY' = 'MUST'): SemanticTriple {
    const eventId = crypto.randomBytes(8).toString('hex');
    const triple: SemanticTriple = {
      subject, predicate, object, modality, certainty: 1.0,
      eventId,
      timestamp: Date.now()
    };

    // LOCAL-FIRST: Update our log immediately
    this.state.T.push(triple);

    // Update trie with new terms
    this.state.H.vocabTrie.insert(subject);
    this.state.H.vocabTrie.insert(predicate);
    this.state.H.vocabTrie.insert(object);

    // Recalculate trie hash (part of Geometric Invariants)
    this.state.H.trieHash = this.state.H.vocabTrie.calculateHash();

    return triple;
  }

  /**
   * Compute Change of Basis matrix (ΔT) using trie indices
   */
  private computeDeltaT(triple: SemanticTriple): number[][] {
    const trieSize = this.state.H.vocabTrie.getTermCount();
    const matrixSize = Math.max(trieSize, this.state.M.length);

    // Resize matrix if needed
    if (matrixSize > this.state.M.length) {
      this.resizeMatrix(matrixSize);
    }

    const deltaT = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(0));

    // Use trie indices for consistent matrix positions
    const subjectIdx = this.state.H.vocabTrie.getIndex(triple.subject);
    const objectIdx = this.state.H.vocabTrie.getIndex(triple.object);

    if (subjectIdx !== undefined && objectIdx !== undefined) {
      const weight = triple.certainty * (triple.modality === 'MUST' ? 0.1 :
        triple.modality === 'SHOULD' ? 0.05 : 0.02);

      deltaT[subjectIdx][objectIdx] = weight;
      deltaT[objectIdx][subjectIdx] = weight;
    }

    return deltaT;
  }

  private resizeMatrix(newSize: number): void {
    const oldSize = this.state.M.length;
    const newMatrix = Array(newSize).fill(0).map(() => Array(newSize).fill(0));

    // Copy old values
    for (let i = 0; i < oldSize; i++) {
      for (let j = 0; j < oldSize; j++) {
        newMatrix[i][j] = this.state.M[i][j];
      }
    }

    // Set diagonal to 1 for new entries
    for (let i = oldSize; i < newSize; i++) {
      newMatrix[i][i] = 1;
    }

    this.state.M = newMatrix;
  }

  private addMatrices(M: number[][], deltaT: number[][]): number[][] {
    return M.map((row, i) => row.map((val, j) => val + deltaT[i][j]));
  }

  /**
   * Generate Metric Signature S = Hash(I | τ_state | trieHash) | Sign(I, PrivateKey)
   */
  private generateSignature(I: any, tau_state: number, trieHash: string): string {
    const payload = JSON.stringify({ ...I, tau_state, trieHash });
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    const sign = crypto.createHmac('sha256', this.state.K.privateKey)
      .update(hash)
      .digest('hex');
    return `${hash.substring(0, 16)}|${sign.substring(0, 16)}`;
  }

  private generateIPv6(blockDesign: BlockDesign, signature: string, shift: number = 0): string {
    const fanoSegments = `2001:0db8:${blockDesign.v.toString(16).padStart(4, '0')}:${blockDesign.k.toString(16).padStart(4, '0')}`;
    const cryptoSegment = signature.substring(0, 4);
    const shiftSegment = (shift + 3).toString(16).padStart(4, '0');
    return `${fanoSegments}:${cryptoSegment}:${shiftSegment}`;
  }

  /**
   * Level Up: Execute state transition 𝒫_n → 𝒫_{n+1}
   */
  levelUp(triple: SemanticTriple, isRemote: boolean = false): NetworkMessage {
    const startTime = performance.now();

    // Step 1: Compute ΔT using trie indices
    const deltaT = this.computeDeltaT(triple);

    // Step 2: Update state matrix
    this.state.M = this.addMatrices(this.state.M, deltaT);

    // Step 3: Compute Geometric Invariants (I)
    const trieTopology = this.state.H.vocabTrie.getTopology();
    const blockDesign: BlockDesign = { v: 7, k: 3, lambda: 1, r: 3, b: 7 };
    const schlaefliSymbol = '{3,3}';

    this.state.I = {
      blockDesign,
      bettiNumbers: { beta0: 1, beta1: 0 }, // Will be computed by worker
      schlaefliSymbol,
      deltaT,
      trieTopology
    };

    // Step 4: Increment τ_state
    this.state.H.tau_state += 1.0;

    // Step 5: Generate Metric Signature (S)
    this.state.S = this.generateSignature(this.state.I, this.state.H.tau_state, this.state.H.trieHash);

    // Step 6: Generate IPv6 address
    this.state.ipv6 = this.generateIPv6(blockDesign, this.state.S, 0);

    const endTime = performance.now();

    if (!isRemote) {
      console.log(`[${this.agentId}] Level Up τ=${this.state.H.tau_state} | ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`[${this.agentId}] Event: ${triple.eventId} | ${triple.subject}->${triple.predicate}->${triple.object}`);
      console.log(`[${this.agentId}] Trie: ${trieTopology.nodeCount} nodes, ${trieTopology.leafCount} leaves`);
    }

    return {
      type: 'STATE_UPDATE',
      topic: 'system:state', // Default topic
      payload: {
        triple,
        I: this.state.I,
        M: this.state.M
      },
      signature: this.state.S!,
      tau_state: this.state.H.tau_state,
      ipv6: this.state.ipv6!,
      timestamp: Date.now()
    };
  }

  // ============================================================================
  // Hypergraph Operations
  // ============================================================================

  addHypergraphNode(node: HypergraphNode, isRemote: boolean = false): NetworkMessage | null {
    if (this.hypergraph.nodes.has(node.id)) {
      return null; // Already have it
    }

    this.hypergraph.nodes.set(node.id, node);

    const triple = this.addKnowledge('Hypergraph', 'hasNode', node.id, 'MUST');
    const message = this.levelUp(triple, isRemote);

    // Determine topic based on node type
    const topic = `hypergraph:nodes:${node.data.type || 'default'}`;
    message.type = 'HYPERGRAPH_NODE';
    message.topic = topic;
    message.payload = { node, triple };

    if (!isRemote) {
      console.log(`[${this.agentId}] Added node: ${node.id} (Topic: ${topic})`);
    }

    return message;
  }

  addHyperedge(edge: Hyperedge, isRemote: boolean = false): NetworkMessage | null {
    if (this.hypergraph.edges.has(edge.id)) {
      return null;
    }

    this.hypergraph.edges.set(edge.id, edge);

    const triple = this.addKnowledge('Hypergraph', 'hasEdge', edge.id, 'MUST');
    const message = this.levelUp(triple, isRemote);

    message.type = 'HYPERGRAPH_EDGE';
    message.topic = 'hypergraph:edges';
    message.payload = { edge, triple };

    if (!isRemote) {
      console.log(`[${this.agentId}] Added edge: ${edge.id} connecting ${edge.nodes.length} nodes`);
    }

    return message;
  }

  // ============================================================================
  // Message Processing (Selective Sync)
  // ============================================================================

  verifySignature(message: NetworkMessage, publicKey: string): boolean {
    // In production: actual cryptographic verification
    return message.signature.length > 0;
  }

  /**
   * Process incoming message (selective sync based on subscriptions)
   */
  processMessage(message: NetworkMessage, peerPublicKey: string): NetworkMessage | null {
    // 1. FILTER: Check subscription
    if (!this.isSubscribed(message.topic)) {
      // Silently ignore unsubscribed topics
      return null;
    }

    // 2. VERIFY: Check signature
    if (!this.verifySignature(message, peerPublicKey)) {
      console.log(`[${this.agentId}] Invalid signature, rejecting message`);
      return null;
    }

    console.log(`[${this.agentId}] Syncing ${message.type} from ${message.ipv6.substring(0, 20)}... (τ=${message.tau_state})`);

    // 3. PROCESS: Re-run local logic (local-first)
    switch (message.type) {
      case 'HYPERGRAPH_NODE': {
        const node = message.payload.node as HypergraphNode;
        return this.addHypergraphNode(node, true);
      }
      case 'HYPERGRAPH_EDGE': {
        const edge = message.payload.edge as Hyperedge;
        return this.addHyperedge(edge, true);
      }
      case 'SYNC_REQUEST': {
        // Respond with our current hypergraph state
        const response: NetworkMessage = {
          type: 'SYNC_RESPONSE',
          topic: `peer:${peerPublicKey.substring(0, 8)}`,
          payload: {
            hypergraph: this.getHypergraph(),
            trieData: this.state.H.vocabTrie.serialize()
          },
          signature: this.state.S!,
          tau_state: this.state.H.tau_state,
          ipv6: this.state.ipv6!,
          timestamp: Date.now()
        };
        return response;
      }
      case 'SYNC_RESPONSE': {
        console.log(`[${this.agentId}] Received sync response with ${message.payload.hypergraph.nodes.length} nodes`);
        break;
      }
    }

    return null;
  }

  getState(): PerceptronState {
    return this.state;
  }

  getHypergraph() {
    return {
      nodes: Array.from(this.hypergraph.nodes.values()),
      edges: Array.from(this.hypergraph.edges.values())
    };
  }

  getEventLog(): SemanticTriple[] {
    return this.state.T;
  }
}

// ============================================================================
// Worker Process
// ============================================================================

function runWorkerProcess() {
  const workerId = cluster.worker?.id || 0;
  const agentId = `Agent-${workerId}`;

  console.log(`\n[Worker ${workerId}] Starting Perceptron Agent...\n`);

  const perceptron = new PerceptronAgent(agentId);

  // Configure subscriptions based on worker role
  if (workerId === 1) {
    perceptron.subscribe('hypergraph:nodes:Concept');
    perceptron.subscribe('hypergraph:nodes:System');
    perceptron.subscribe('hypergraph:edges');
  } else if (workerId === 2) {
    perceptron.subscribe('hypergraph:nodes:Concept');
    perceptron.subscribe('hypergraph:edges');
  } else {
    perceptron.subscribe('hypergraph:nodes:System');
  }

  // Setup shared memory for computation worker
  const sharedBuffer = new SharedArrayBuffer(SHARED_MEMORY_SIZE);
  const signalArray = new Int32Array(sharedBuffer, SIGNAL_OFFSET, 1);
  const lengthArray = new Int32Array(sharedBuffer, LENGTH_OFFSET, 1);
  const dataArray = new Uint8Array(sharedBuffer, DATA_OFFSET);

  const computationWorker = new Worker('../dist/computation-worker.js', {
    workerData: { sharedBuffer, workerId }
  });

  computationWorker.on('message', (result) => {
    if (result.type === 'COMPUTATION_RESULT') {
      console.log(`[${agentId}] Computation: β₀=${result.result.geometricInvariants.bettiNumbers.beta0}, β₁=${result.result.geometricInvariants.bettiNumbers.beta1}`);
    }
  });

  // Setup UDP6 socket
  const socket = dgram.createSocket("udp4");
  const PORT = 41233;

  socket.on('message', (msg, rinfo) => {
    try {
      const message: NetworkMessage = JSON.parse(msg.toString());

      // Process message (selective sync)
      const responseMsg = perceptron.processMessage(message, 'peer-public-key');

      // Broadcast response if generated
      if (responseMsg) {
        broadcastMessage(socket, responseMsg);
      }

      // Send matrix to computation worker if needed
      if (message.type === 'STATE_UPDATE' && message.payload.M) {
        if (Atomics.load(signalArray, 0) === 0) {
          const data = JSON.stringify(message.payload.M);
          const dataBytes = Buffer.from(data);

          if (dataBytes.length < dataArray.length) {
            dataArray.set(dataBytes);
            Atomics.store(lengthArray, 0, dataBytes.length);
            Atomics.store(signalArray, 0, 1);
            Atomics.notify(signalArray, 0);
          }
        }
      }
    } catch (err) {
      console.error(`[${agentId}] Error processing message:`, err);
    }
  });

  socket.on('listening', () => {
    const address = socket.address();
    console.log(`[${agentId}] Listening on ${address.address}:${address.port}`);
  });

  socket.connect(PORT);

  // Demo: Build hypergraph
  setTimeout(() => {
    console.log(`\n[${agentId}] Building hypergraph...\n`);

    const rootNode: HypergraphNode = {
      id: `node_root_w${workerId}`,
      label: 'Root',
      data: { type: 'System', worker: workerId },
      owner: agentId
    };
    const msg1 = perceptron.addHypergraphNode(rootNode);
    if (msg1) broadcastMessage(socket, msg1);

    setTimeout(() => {
      const conceptNode: HypergraphNode = {
        id: `node_concept_w${workerId}`,
        label: workerId === 1 ? 'Mathematics' : 'Physics',
        data: { type: 'Concept', field: workerId === 1 ? 'Math' : 'Science' },
        owner: agentId
      };
      const msg2 = perceptron.addHypergraphNode(conceptNode);
      if (msg2) broadcastMessage(socket, msg2);

      setTimeout(() => {
        const hedge: Hyperedge = {
          id: `hedge_w${workerId}`,
          nodes: [rootNode.id, conceptNode.id],
          label: 'Connection',
          owner: agentId
        };
        const msg3 = perceptron.addHyperedge(hedge);
        if (msg3) broadcastMessage(socket, msg3);

        setTimeout(() => {
          const state = perceptron.getState();
          const hypergraph = perceptron.getHypergraph();
          const log = perceptron.getEventLog();

          console.log(`\n[${agentId}] Final State:`);
          console.log(`  τ_state: ${state.H.tau_state}`);
          console.log(`  IPv6: ${state.ipv6}`);
          console.log(`  Event Log: ${log.length} events`);
          console.log(`  Trie: ${state.I.trieTopology?.nodeCount} nodes, ${state.H.vocabTrie.getTermCount()} terms`);
          console.log(`  Hypergraph: ${hypergraph.nodes.length} nodes, ${hypergraph.edges.length} edges`);
        }, 1000);
      }, 500);
    }, 500);
  }, 2000 + workerId * 1000);
}

function broadcastMessage(socket: dgram.Socket, message: NetworkMessage) {
  const data = Buffer.from(JSON.stringify(message));
  socket.send(data, (err) => {
    if (err) console.error('Broadcast error:', err);
  });
}

// ============================================================================
// Primary Process
// ============================================================================

if (cluster.isPrimary) {

  const udpPort = 41233;
  let broadcastSocket: dgram.Socket | null = null;

  // Create a single UDP socket for the primary process only.
  try {
    broadcastSocket = dgram.createSocket("udp4");
    broadcastSocket.bind(udpPort, '0.0.0.0', () => {
      const address = broadcastSocket!.address();
      console.log(`[Primary] UDP Geometric Sync bound to ${address.address}:${address.port} (τ_state 0.0)`);

      const numCPUs = os.cpus().length;
      console.log(`\n=== Perceptron Network with Local-First Pub/Sub ===`);
      console.log(`Starting ${Math.min(numCPUs, 4)} worker processes...\n`);

      for (let i = 0; i < Math.min(numCPUs, 4); i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`[Primary] Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
      });
    });

    broadcastSocket.on('error', (err) => {
      // Handle EADDRINUSE specifically
      if (err.name === 'EADDRINUSE') {
        console.error(`[Primary] Error: Port ${udpPort} is already in use (EADDRINUSE).`);
        console.error('The Perceptron network is unable to bind the primary sync port. Please kill the existing process or use a different port.');
        // Crucially: Do not attempt to rebind here, as it may cause cascading failures.
        // The primary process MUST have a stable broadcast port. Exit cleanly.
        process.exit(1);
      } else {
        console.error(`[Primary] UDP Socket Error:`, err);
      }
    });

  } catch (err) {
    // Should not be reached for dgram.createSocket, but kept for robustness.
    console.error(`[Primary] Fatal Error in Socket Setup:`, err);
    process.exit(1);
  }
} else {
  runWorkerProcess();
}