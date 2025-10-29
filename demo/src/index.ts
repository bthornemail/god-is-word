// ============================================================================
// index.ts - Main Entry Point (Cluster Primary + Worker Process)
// ============================================================================

import cluster from 'cluster';
import os from 'os';
import dgram from 'dgram';
import { Worker } from 'worker_threads';
import crypto from 'crypto';
import { performance } from 'perf_hooks';

// ============================================================================
// Type Definitions - The 8-Tuple Perceptron State (𝒫)
// ============================================================================

interface PerceptronState {
  // H: Hilbert Space
  H: {
    tau_state: number;
    publicKey: string;
    vocab: string[];
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
  };
  // F: Functional Primitives
  F: string[];
  // T: Semantic Basis (knowledge triples)
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
  v: number; // points
  k: number; // block size
  lambda: number; // incidence
  r: number; // replication
  b: number; // blocks
}

interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
  modality: 'MUST' | 'SHOULD' | 'MAY';
  certainty: number;
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
  payload: any;
  signature: string;
  tau_state: number;
  ipv6: string;
  timestamp: number;
}

// ============================================================================
// Shared Memory Layout (SharedArrayBuffer)
// ============================================================================

const SHARED_MEMORY_SIZE = 1024 * 1024; // 1MB
const SIGNAL_OFFSET = 0;              // Int32 - signal flag
const LENGTH_OFFSET = 4;              // Int32 - data length
const DATA_OFFSET = 8;                // Start of data

// ============================================================================
// Perceptron Core Logic
// ============================================================================

class PerceptronAgent {
  private state: PerceptronState;
  private hypergraph: {
    nodes: Map<string, HypergraphNode>;
    edges: Map<string, Hyperedge>;
  };

  constructor(agentId: string) {
    const { privateKey, publicKey } = this.generateKeyPair();

    this.state = {
      H: {
        tau_state: 0.0,
        publicKey,
        vocab: ['Read', 'Eval', 'Print', 'Loop', 'Node', 'Edge', 'Graph', 'Hypergraph', 'Functor', 'Monad']
      },
      L: ['Async', 'Await', 'Try', 'Catch', 'Call'],
      K: { privateKey, publicKey, hashFunction: 'SHA-256' },
      I: {
        blockDesign: null,
        bettiNumbers: { beta0: 1, beta1: 0 },
        schlaefliSymbol: null,
        deltaT: null
      },
      F: ['Read', 'Eval', 'Print', 'Loop'],
      T: [],
      B: ['Node', 'Edge', 'Graph', 'Incidence', 'Hypergraph', 'Functor', 'Monad'],
      D: { standard: 'IEEE 754', encoding: 'Binary' },
      M: this.createIdentityMatrix(4),
      S: null,
      ipv6: null
    };

    this.hypergraph = {
      nodes: new Map(),
      edges: new Map()
    };

    console.log(`[Perceptron ${agentId}] Initialized with Public Key: ${publicKey}`);
  }

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

  // Add knowledge triple to T
  addKnowledge(subject: string, predicate: string, object: string, modality: 'MUST' | 'SHOULD' | 'MAY' = 'MUST'): void {
    const triple: SemanticTriple = { subject, predicate, object, modality, certainty: 1.0 };
    this.state.T.push(triple);
  }

  // Compute Change of Basis matrix (ΔT)
  private computeDeltaT(triple: SemanticTriple): number[][] {
    const size = this.state.M.length;
    const deltaT = Array(size).fill(0).map(() => Array(size).fill(0));

    // Create sparse connectivity updates based on semantic relationships
    const weight = triple.certainty * (triple.modality === 'MUST' ? 0.1 :
      triple.modality === 'SHOULD' ? 0.05 : 0.02);

    // Update connectivity based on hash of subject/object
    const subjectHash = this.hashToIndex(triple.subject, size);
    const objectHash = this.hashToIndex(triple.object, size);

    deltaT[subjectHash][objectHash] = weight;
    deltaT[objectHash][subjectHash] = weight;

    return deltaT;
  }

  private hashToIndex(str: string, max: number): number {
    const hash = crypto.createHash('sha256').update(str).digest();
    return hash[0] % max;
  }

  // Matrix addition: M_{n+1} = M_n + ΔT
  private addMatrices(M: number[][], deltaT: number[][]): number[][] {
    return M.map((row, i) => row.map((val, j) => val + deltaT[i][j]));
  }

  // Compute Betti Numbers (topological invariants)
  private computeBettiNumbers(M: number[][]): { beta0: number; beta1: number } {
    const threshold = 0.1;
    const n = M.length;
    const visited = new Array(n).fill(false);
    let components = 0;

    const dfs = (i: number) => {
      visited[i] = true;
      for (let j = 0; j < n; j++) {
        if (!visited[j] && M[i][j] > threshold) {
          dfs(j);
        }
      }
    };

    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        components++;
        dfs(i);
      }
    }

    return { beta0: components, beta1: 0 };
  }

  // Generate Metric Signature S = Hash(I | τ_state) | Sign(I, PrivateKey)
  private generateSignature(I: any, tau_state: number): string {
    const payload = JSON.stringify({ ...I, tau_state });
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    // Sign with private key
    const sign = crypto.createHmac('sha256', this.state.K.privateKey)
      .update(hash)
      .digest('hex');

    return `${hash.substring(0, 16)}|${sign.substring(0, 16)}`;
  }

  // Generate IPv6 Fano address
  private generateIPv6(blockDesign: BlockDesign, signature: string, shift: number = 0): string {
    // Encode Fano plane (7,3,1,3,7) into first 7 segments
    const fanoSegments = `2001:0db8:${blockDesign.v.toString(16).padStart(4, '0')}:${blockDesign.k.toString(16).padStart(4, '0')}`;

    // Encode signature and shift into last segment
    const cryptoSegment = signature.substring(0, 4);
    const shiftSegment = (shift + 3).toString(16).padStart(4, '0');

    return `${fanoSegments}:${cryptoSegment}:${shiftSegment}`;
  }

  // Level Up: Execute state transition 𝒫_n → 𝒫_{n+1}
  levelUp(triple: SemanticTriple): NetworkMessage {
    const startTime = performance.now();

    // Step 1: Add knowledge
    this.state.T.push(triple);

    // Step 2: Compute ΔT
    const deltaT = this.computeDeltaT(triple);

    // Step 3: Update state matrix
    this.state.M = this.addMatrices(this.state.M, deltaT);

    // Step 4: Compute Geometric Invariants (I)
    const bettiNumbers = this.computeBettiNumbers(this.state.M);
    const blockDesign: BlockDesign = { v: 7, k: 3, lambda: 1, r: 3, b: 7 }; // Fano plane
    const schlaefliSymbol = '{3,3}'; // Tetrahedron

    this.state.I = {
      blockDesign,
      bettiNumbers,
      schlaefliSymbol,
      deltaT
    };

    // Step 5: Increment τ_state
    this.state.H.tau_state += 1.0;

    // Step 6: Generate Metric Signature (S)
    this.state.S = this.generateSignature(this.state.I, this.state.H.tau_state);

    // Step 7: Generate IPv6 address
    this.state.ipv6 = this.generateIPv6(blockDesign, this.state.S, 0);

    const endTime = performance.now();

    console.log(`[Level Up] τ_state: ${this.state.H.tau_state} | Time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`[Level Up] IPv6: ${this.state.ipv6}`);
    console.log(`[Level Up] Signature: ${this.state.S}`);
    console.log(`[Level Up] β₀=${bettiNumbers.beta0}, β₁=${bettiNumbers.beta1}`);

    // Return network message
    return {
      type: 'STATE_UPDATE',
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

  // Add hypergraph node
  addHypergraphNode(node: HypergraphNode): NetworkMessage {
    this.hypergraph.nodes.set(node.id, node);

    const triple: SemanticTriple = {
      subject: 'Hypergraph',
      predicate: 'hasNode',
      object: node.id,
      modality: 'MUST',
      certainty: 1.0
    };

    const message = this.levelUp(triple);
    message.type = 'HYPERGRAPH_NODE';
    message.payload = { node };

    console.log(`[Hypergraph] Added node: ${node.id} (${node.label})`);

    return message;
  }

  // Add hyperedge
  addHyperedge(edge: Hyperedge): NetworkMessage {
    this.hypergraph.edges.set(edge.id, edge);

    const triple: SemanticTriple = {
      subject: 'Hypergraph',
      predicate: 'hasEdge',
      object: edge.id,
      modality: 'MUST',
      certainty: 1.0
    };

    const message = this.levelUp(triple);
    message.type = 'HYPERGRAPH_EDGE';
    message.payload = { edge };

    console.log(`[Hypergraph] Added edge: ${edge.id} connecting ${edge.nodes.length} nodes`);

    return message;
  }

  // Verify signature from peer
  verifySignature(message: NetworkMessage, publicKey: string): boolean {
    // In production, use actual cryptographic verification
    return message.signature.length > 0;
  }

  // Process incoming message from peer
  processMessage(message: NetworkMessage, peerPublicKey: string): void {
    if (!this.verifySignature(message, peerPublicKey)) {
      console.log(`[Security] Invalid signature from peer, rejecting message`);
      return;
    }

    console.log(`[Sync] Received ${message.type} from ${message.ipv6} (τ=${message.tau_state})`);

    switch (message.type) {
      case 'HYPERGRAPH_NODE':
        const node = message.payload.node as HypergraphNode;
        this.hypergraph.nodes.set(node.id, node);
        console.log(`[Sync] Synced node: ${node.id}`);
        break;

      case 'HYPERGRAPH_EDGE':
        const edge = message.payload.edge as Hyperedge;
        this.hypergraph.edges.set(edge.id, edge);
        console.log(`[Sync] Synced edge: ${edge.id}`);
        break;

      case 'STATE_UPDATE':
        console.log(`[Sync] Peer state: β₀=${message.payload.I.bettiNumbers.beta0}`);
        break;
    }
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
}

// ============================================================================
// Worker Process (runs in each CPU core via cluster.fork())
// ============================================================================

function runWorkerProcess() {
  const workerId = cluster.worker?.id || 0;
  const agentId = `Agent-${workerId}`;

  console.log(`[Worker ${workerId}] Starting Perceptron Agent...`);

  // Initialize Perceptron
  const perceptron = new PerceptronAgent(agentId);

  // Create SharedArrayBuffer for communication with computation threads
  const sharedBuffer = new SharedArrayBuffer(SHARED_MEMORY_SIZE);
  const signalArray = new Int32Array(sharedBuffer, SIGNAL_OFFSET, 1);
  const lengthArray = new Int32Array(sharedBuffer, LENGTH_OFFSET, 1);
  const dataArray = new Uint8Array(sharedBuffer, DATA_OFFSET);

  // Spawn computation worker thread
  const computationWorker = new Worker('./dist/computation-worker.js', {
    workerData: { sharedBuffer, workerId }
  });

  computationWorker.on('message', (result) => {
    console.log(`[Worker ${workerId}] Computation result:`, result);
  });

  computationWorker.on('error', (err) => {
    console.error(`[Worker ${workerId}] Computation worker error:`, err);
  });

  // Create UDP6 socket
  const socket = dgram.createSocket('udp6');
  const PORT = 41234;

  socket.on('error', (err) => {
    console.error(`[Worker ${workerId}] Socket error:`, err);
    socket.close();
  });

  socket.on('message', (msg, rinfo) => {
    try {
      const message: NetworkMessage = JSON.parse(msg.toString());
      // In index.ts, inside socket.on('message')
      if (message.type === 'STATE_UPDATE' && message.payload.M) {

        // ▼▼▼ ADD THIS CHECK ▼▼▼
        // Check if the worker is ready (signal == 0).
        if (Atomics.load(signalArray, 0) === 0) {
          const data = JSON.stringify(message.payload.M);
          const dataBytes = Buffer.from(data);

          if (dataBytes.length < dataArray.length) {
            dataArray.set(dataBytes);
            Atomics.store(lengthArray, 0, dataBytes.length);

            // Signal computation worker
            Atomics.store(signalArray, 0, 1);
            Atomics.notify(signalArray, 0);
          }
        } else {
          // Worker is still busy with the last packet.
          console.warn(`[Worker ${workerId}] Computation worker busy. Dropping packet.`);
        }
      }
      console.log(`[Worker ${workerId}] Received message from ${rinfo.address}:${rinfo.port}`);

      // Process message in main thread
      perceptron.processMessage(message, 'peer-public-key');

      // For heavy computation, pass to worker thread via SharedArrayBuffer
      if (message.type === 'STATE_UPDATE' && message.payload.M) {
        const data = JSON.stringify(message.payload.M);
        const dataBytes = Buffer.from(data);

        if (dataBytes.length < dataArray.length) {
          dataArray.set(dataBytes);
          Atomics.store(lengthArray, 0, dataBytes.length);

          // Signal computation worker
          Atomics.store(signalArray, 0, 1);
          Atomics.notify(signalArray, 0);
        }
      }
    } catch (err) {
      console.error(`[Worker ${workerId}] Error processing message:`, err);
    }
  });

  socket.on('listening', () => {
    const address = socket.address();
    console.log(`[Worker ${workerId}] UDP socket listening on ${address.address}:${address.port}`);
  });

  socket.bind(PORT);

  // Demo: Automated hypergraph construction
  setTimeout(() => {
    console.log(`\n[Demo ${workerId}] Building collaborative hypergraph...\n`);

    // Add root node
    const rootNode: HypergraphNode = {
      id: `node_0_w${workerId}`,
      label: 'Root',
      data: { type: 'System', worker: workerId },
      owner: agentId
    };
    const msg1 = perceptron.addHypergraphNode(rootNode);
    broadcastMessage(socket, msg1);

    setTimeout(() => {
      // Add concept nodes
      const mathNode: HypergraphNode = {
        id: `node_math_w${workerId}`,
        label: 'Mathematics',
        data: { type: 'Concept', field: 'Math' },
        owner: agentId
      };
      const msg2 = perceptron.addHypergraphNode(mathNode);
      broadcastMessage(socket, msg2);

      setTimeout(() => {
        const physicsNode: HypergraphNode = {
          id: `node_physics_w${workerId}`,
          label: 'Physics',
          data: { type: 'Concept', field: 'Science' },
          owner: agentId
        };
        const msg3 = perceptron.addHypergraphNode(physicsNode);
        broadcastMessage(socket, msg3);

        setTimeout(() => {
          // Add hyperedge
          const hedge: Hyperedge = {
            id: `hedge_1_w${workerId}`,
            nodes: [rootNode.id, mathNode.id, physicsNode.id],
            label: 'Interdisciplinary',
            owner: agentId
          };
          const msg4 = perceptron.addHyperedge(hedge);
          broadcastMessage(socket, msg4);

          // Print final state
          setTimeout(() => {
            const state = perceptron.getState();
            const hypergraph = perceptron.getHypergraph();

            console.log(`\n[Worker ${workerId}] Final State:`);
            console.log(`  τ_state: ${state.H.tau_state}`);
            console.log(`  IPv6: ${state.ipv6}`);
            console.log(`  Knowledge Triples: ${state.T.length}`);
            console.log(`  Hypergraph Nodes: ${hypergraph.nodes.length}`);
            console.log(`  Hypergraph Edges: ${hypergraph.edges.length}`);
            console.log(`  β₀=${state.I.bettiNumbers.beta0}, β₁=${state.I.bettiNumbers.beta1}`);
          }, 1000);
        }, 500);
      }, 500);
    }, 500);
  }, 2000 + workerId * 1000); // Stagger by worker ID

  // Handle stdin for interactive demo
  if (workerId === 1) {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      const cmd = data.toString().trim();

      if (cmd === 'status') {
        const state = perceptron.getState();
        const hypergraph = perceptron.getHypergraph();
        console.log('\n=== Perceptron Status ===');
        console.log(JSON.stringify({ state, hypergraph }, null, 2));
      } else if (cmd === 'sync') {
        console.log('\n=== Broadcasting Sync Request ===');
        const msg: NetworkMessage = {
          type: 'SYNC_REQUEST',
          payload: {},
          signature: 'sync-req',
          tau_state: perceptron.getState().H.tau_state,
          ipv6: perceptron.getState().ipv6!,
          timestamp: Date.now()
        };
        broadcastMessage(socket, msg);
      }
    });
  }
}

function broadcastMessage(socket: dgram.Socket, message: NetworkMessage) {
  const data = Buffer.from(JSON.stringify(message));
  // Broadcast to localhost (in production, broadcast to all peers)
  socket.send(data, 41234, '::1', (err) => {
    if (err) console.error('Broadcast error:', err);
  });
}

// ============================================================================
// Primary Process (Cluster Manager)
// ============================================================================

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`[Primary] Starting ${numCPUs} worker processes...`);
  console.log(`[Primary] Each worker will run a Perceptron Agent\n`);

  // Fork workers
  for (let i = 0; i < Math.min(numCPUs, 4); i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`[Primary] Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

  console.log('\n=== Multi-Process Perceptron Network ===');
  console.log('Commands: status, sync, quit\n');
} else {
  runWorkerProcess();
}