// ============================================================================
// agent.ts - Perceptron Agent with Local-First & Pub/Sub (Browser Version)
// ============================================================================

import { PatriciaTrie } from './patricia-trie';
import type {
  PerceptronState,
  SemanticTriple,
  HypergraphNode,
  Hyperedge,
  NetworkMessage,
  BlockDesignCombinatorial
} from './types';

// ============================================================================
// Perceptron Agent with Local-First & Pub/Sub
// ============================================================================

export class PerceptronAgent {
  private state: PerceptronState;
  private hypergraph: {
    nodes: Map<string, HypergraphNode>;
    edges: Map<string, Hyperedge>;
  };
  private subscriptions: Set<string>;
  private agentId: string;

  constructor(agentId: string, privateKey?: string, publicKey?: string) {
    // Generate or use provided keys
    const keys = privateKey && publicKey 
      ? { privateKey, publicKey }
      : this.generateKeyPair();

    // Initialize Patricia Trie with basis vocabulary
    const vocabTrie = new PatriciaTrie();
    const basisTerms = ['Read', 'Eval', 'Print', 'Loop', 'Node', 'Edge',
      'Graph', 'Hypergraph', 'Functor', 'Monad'];
    basisTerms.forEach(term => vocabTrie.insert(term));

    // Initialize state with placeholder trieHash (will be computed async)
    this.state = {
      H: {
        tau_state: 0.0,
        publicKey: keys.publicKey,
        vocabTrie,
        trieHash: '' // Will be set async in initialize()
      },
      L: ['Async', 'Await', 'Try', 'Catch', 'Call'],
      K: { privateKey: keys.privateKey, publicKey: keys.publicKey, hashFunction: 'SHA-256' },
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
  }

  /**
   * Initialize async operations (calculate initial trie hash and proper public key)
   */
  async initialize(): Promise<void> {
    try {
      console.log(`[${this.agentId}] Starting initialization...`);
      
      // Calculate proper public key from private key
      const encoder = new TextEncoder();
      const data = encoder.encode(this.state.K.privateKey);
      
      if (!crypto || !crypto.subtle) {
        console.warn(`[${this.agentId}] crypto.subtle not available, using existing public key`);
        // Keep existing public key
      } else {
        console.log(`[${this.agentId}] Computing public key hash...`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        this.state.K.publicKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        this.state.H.publicKey = this.state.K.publicKey;
        console.log(`[${this.agentId}] Public key computed`);
      }

      // Calculate initial trie hash
      console.log(`[${this.agentId}] Computing trie hash...`);
      this.state.H.trieHash = await this.state.H.vocabTrie.calculateHash();
      console.log(`[${this.agentId}] Initialized`);
      console.log(`[${this.agentId}] Public Key: ${this.state.K.publicKey.substring(0, 8)}...`);
      console.log(`[${this.agentId}] Trie Hash: ${this.state.H.trieHash.substring(0, 8)}...`);
    } catch (error) {
      console.error(`[${this.agentId}] Error during initialization:`, error);
      throw error;
    }
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
    // Use crypto.getRandomValues for browser compatibility
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const privateKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Derive public key from private key using simple hash
    // For now, use synchronous approach - in production use proper ECDSA key generation
    // We'll compute the full hash async in initialize()
    const fallbackHash = Array.from(new Uint8Array(32), (_, i) => {
      const charCode = privateKey.charCodeAt(i % privateKey.length);
      return ((charCode * 31 + i) & 0xff).toString(16).padStart(2, '0');
    }).join('');
    
    return { privateKey, publicKey: fallbackHash };
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
  async addKnowledge(subject: string, predicate: string, object: string,
    modality: 'MUST' | 'SHOULD' | 'MAY' = 'MUST'): Promise<SemanticTriple> {
    // Generate eventId using crypto.getRandomValues
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    const eventId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

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
    this.state.H.trieHash = await this.state.H.vocabTrie.calculateHash();

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
  private async generateSignature(I: any, tau_state: number, trieHash: string): Promise<string> {
    const payload = JSON.stringify({ ...I, tau_state, trieHash });
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    
    // Hash the payload
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create HMAC signature using private key
    const keyData = encoder.encode(this.state.K.privateKey);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(hash));
    const signArray = Array.from(new Uint8Array(signBuffer));
    const sign = signArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `${hash.substring(0, 16)}|${sign.substring(0, 16)}`;
  }

  private generateIPv6(blockDesign: BlockDesignCombinatorial, signature: string, shift: number = 0): string {
    const fanoSegments = `2001:0db8:${blockDesign.v.toString(16).padStart(4, '0')}:${blockDesign.k.toString(16).padStart(4, '0')}`;
    const cryptoSegment = signature.substring(0, 4);
    const shiftSegment = (shift + 3).toString(16).padStart(4, '0');
    return `${fanoSegments}:${cryptoSegment}:${shiftSegment}`;
  }

  /**
   * Level Up: Execute state transition 𝒫_n → 𝒫_{n+1}
   */
  async levelUp(triple: SemanticTriple, isRemote: boolean = false): Promise<NetworkMessage> {
    const startTime = performance.now();

    // Step 1: Compute ΔT using trie indices
    const deltaT = this.computeDeltaT(triple);

    // Step 2: Update state matrix
    this.state.M = this.addMatrices(this.state.M, deltaT);

    // Step 3: Compute Geometric Invariants (I)
    const trieTopology = this.state.H.vocabTrie.getTopology();
    const blockDesign: BlockDesignCombinatorial = { v: 7, k: 3, lambda: 1, r: 3, b: 7 };
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
    this.state.S = await this.generateSignature(this.state.I, this.state.H.tau_state, this.state.H.trieHash);

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
      topic: 'system:state',
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

  async addHypergraphNode(node: HypergraphNode, isRemote: boolean = false): Promise<NetworkMessage | null> {
    if (this.hypergraph.nodes.has(node.id)) {
      return null; // Already have it
    }

    this.hypergraph.nodes.set(node.id, node);

    const triple = await this.addKnowledge('Hypergraph', 'hasNode', node.id, 'MUST');
    const message = await this.levelUp(triple, isRemote);

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

  async addHyperedge(edge: Hyperedge, isRemote: boolean = false): Promise<NetworkMessage | null> {
    if (this.hypergraph.edges.has(edge.id)) {
      return null;
    }

    this.hypergraph.edges.set(edge.id, edge);

    const triple = await this.addKnowledge('Hypergraph', 'hasEdge', edge.id, 'MUST');
    const message = await this.levelUp(triple, isRemote);

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

  verifySignature(message: NetworkMessage, _publicKey: string): boolean {
    // In production: actual cryptographic verification
    return message.signature.length > 0;
  }

  /**
   * Process incoming message (selective sync based on subscriptions)
   */
  async processMessage(message: NetworkMessage, peerPublicKey: string): Promise<NetworkMessage | null> {
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
        return await this.addHypergraphNode(node, true);
      }
      case 'HYPERGRAPH_EDGE': {
        const edge = message.payload.edge as Hyperedge;
        return await this.addHyperedge(edge, true);
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

  /**
   * Serialize state for storage/export
   */
  serialize(): any {
    return {
      agentId: this.agentId,
      state: {
        ...this.state,
        H: {
          ...this.state.H,
          vocabTrie: this.state.H.vocabTrie.serialize()
        }
      },
      hypergraph: this.getHypergraph(),
      subscriptions: Array.from(this.subscriptions)
    };
  }

  /**
   * Deserialize state from stored data
   */
  static deserialize(data: any): PerceptronAgent {
    const agent = new PerceptronAgent(
      data.agentId,
      data.state.K.privateKey,
      data.state.K.publicKey
    );

    // Restore state
    agent.state = {
      ...data.state,
      H: {
        ...data.state.H,
        vocabTrie: PatriciaTrie.deserialize(data.state.H.vocabTrie)
      }
    };

    // Restore hypergraph
    data.hypergraph.nodes.forEach((node: HypergraphNode) => {
      agent.hypergraph.nodes.set(node.id, node);
    });
    data.hypergraph.edges.forEach((edge: Hyperedge) => {
      agent.hypergraph.edges.set(edge.id, edge);
    });

    // Restore subscriptions
    data.subscriptions.forEach((topic: string) => {
      agent.subscriptions.add(topic);
    });

    return agent;
  }
}

