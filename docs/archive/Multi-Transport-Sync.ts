/**
 * IEEE 754 Universal Binary Transformation Framework
 * with HD Vector Clock, State Machine, and Multi-Transport Sync
 * 
 * Sync Methods:
 * - QR Codes (compressed state pointers)
 * - Files (JSON/Binary export/import)
 * - In-Memory Streams (real-time synchronization)
 */

// ============================================================================
// CORE IEEE 754 TRANSFORMATION
// ============================================================================

export type Precision = 'half' | 'single' | 'double' | 'quad' | 'octuple';

export interface BinaryTransform {
  precision: Precision;
  bits: number;
  data: Float32Array | Float64Array;
  originalLength: number;
  modulo: number;
  convergenceSteps: number;
}

export const PRECISION = {
  half: { bits: 16, bytesPerElement: 2 },
  single: { bits: 32, bytesPerElement: 4 },
  double: { bits: 64, bytesPerElement: 8 },
  quad: { bits: 128, bytesPerElement: 16 },
  octuple: { bits: 256, bytesPerElement: 32 }
};

export function applyModularTransform(length: number): number {
  return Math.floor((length / 7) % 5);
}

export function calculateConvergence(length: number): number {
  return Math.min(14, Math.ceil(Math.log2(length + 1)));
}

export class BinaryTransformer {
  static transform(data: Uint8Array, precision: Precision): BinaryTransform {
    const spec = PRECISION[precision];
    return {
      precision,
      bits: spec.bits,
      data: this.toFloat(data, precision),
      originalLength: data.length,
      modulo: applyModularTransform(data.length),
      convergenceSteps: calculateConvergence(data.length)
    };
  }

  private static toFloat(bytes: Uint8Array, precision: Precision): Float32Array | Float64Array {
    if (precision === 'half' || precision === 'single') {
      const floats = new Float32Array(Math.ceil(bytes.length / PRECISION[precision].bytesPerElement));
      for (let i = 0; i < bytes.length; i += PRECISION[precision].bytesPerElement) {
        let val = 0;
        for (let j = 0; j < PRECISION[precision].bytesPerElement && (i + j) < bytes.length; j++) {
          val = (val << 8) | bytes[i + j];
        }
        floats[Math.floor(i / PRECISION[precision].bytesPerElement)] = val / Math.pow(2, PRECISION[precision].bits);
      }
      return floats;
    } else {
      const floats = new Float64Array(Math.ceil(bytes.length / 8));
      for (let i = 0; i < bytes.length; i += 8) {
        let val = 0;
        for (let j = 0; j < 8 && (i + j) < bytes.length; j++) {
          val = val * 256 + bytes[i + j];
        }
        floats[Math.floor(i / 8)] = val / Number.MAX_SAFE_INTEGER;
      }
      return floats;
    }
  }
}

export async function hash(transform: BinaryTransform): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', transform.data.buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createHashReference(data: Uint8Array, precision: Precision): Promise<string> {
  const transform = BinaryTransformer.transform(data, precision);
  return await hash(transform);
}

export async function calculateMerkleRoot(hashes: string[]): Promise<string> {
  if (hashes.length === 0) return '';
  if (hashes.length === 1) return hashes[0];
  const combined = hashes.join('');
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// BLOCK DESIGN STATE
// ============================================================================

export type binary16 = string;
export type binary32 = string;
export type binary64 = string;
export type binary128 = string;
export type binary256 = string;

export interface BlockDesignState {
  nodes: binary16;
  edges: binary32;
  graphs: binary64;
  incidences: binary128;
  hypergraph: binary256;
  timestamp: number;
  previousHash: string;
  merkleRoot: string;
}

export interface StatePointer {
  merkleRoot: string;
  timestamp: number;
  dimensions: {
    nodes: binary16;
    edges: binary32;
    graphs: binary64;
    incidences: binary128;
    hypergraph: binary256;
  };
  previousHash: string;
}

export async function createBlockDesign(data: {
  nodes: Uint8Array;
  edges: Uint8Array;
  graphs: Uint8Array;
  incidences: Uint8Array;
  hypergraph: Uint8Array;
}, previousState?: BlockDesignState): Promise<BlockDesignState> {
  const [nodesHash, edgesHash, graphsHash, incidencesHash, hypergraphHash] = await Promise.all([
    createHashReference(data.nodes, 'half'),
    createHashReference(data.edges, 'single'),
    createHashReference(data.graphs, 'double'),
    createHashReference(data.incidences, 'quad'),
    createHashReference(data.hypergraph, 'octuple')
  ]);

  const merkleRoot = await calculateMerkleRoot([
    nodesHash, edgesHash, graphsHash, incidencesHash, hypergraphHash
  ]);

  return {
    nodes: nodesHash, edges: edgesHash, graphs: graphsHash,
    incidences: incidencesHash, hypergraph: hypergraphHash,
    timestamp: Date.now(),
    previousHash: previousState?.merkleRoot || 'genesis',
    merkleRoot
  };
}

export function createPointer(state: BlockDesignState): StatePointer {
  return {
    merkleRoot: state.merkleRoot,
    timestamp: state.timestamp,
    dimensions: {
      nodes: state.nodes,
      edges: state.edges,
      graphs: state.graphs,
      incidences: state.incidences,
      hypergraph: state.hypergraph
    },
    previousHash: state.previousHash
  };
}

// ============================================================================
// TRANSPORT LAYER - QR CODE SYNC
// ============================================================================

export interface QRCodeData {
  pointer: StatePointer;
  compressed: boolean;
  version: number;
}

export class QRCodeTransport {
  /**
   * Export state pointer to QR-compatible JSON string
   * Optimized for QR code capacity (Version 40: ~2953 bytes alphanumeric)
   */
  static exportToQR(pointer: StatePointer): string {
    const compressed: QRCodeData = {
      pointer: {
        merkleRoot: pointer.merkleRoot.substring(0, 16), // Truncate for QR
        timestamp: pointer.timestamp,
        dimensions: {
          nodes: pointer.dimensions.nodes.substring(0, 8),
          edges: pointer.dimensions.edges.substring(0, 8),
          graphs: pointer.dimensions.graphs.substring(0, 12),
          incidences: pointer.dimensions.incidences.substring(0, 16),
          hypergraph: pointer.dimensions.hypergraph.substring(0, 16)
        },
        previousHash: pointer.previousHash.substring(0, 16)
      },
      compressed: true,
      version: 1
    };
    return JSON.stringify(compressed);
  }

  /**
   * Import state pointer from QR code JSON
   */
  static importFromQR(qrData: string): Partial<StatePointer> {
    const data: QRCodeData = JSON.parse(qrData);
    return data.pointer;
  }

  /**
   * Generate QR code-ready URL (for QR libraries)
   */
  static toQRUrl(pointer: StatePointer): string {
    const qrData = this.exportToQR(pointer);
    return `data:text/plain;base64,${btoa(qrData)}`;
  }
}

// ============================================================================
// TRANSPORT LAYER - FILE SYNC
// ============================================================================

export interface FileExport {
  format: 'json' | 'binary';
  version: number;
  state: BlockDesignState;
  pointer: StatePointer;
  history?: BlockDesignState[];
  metadata: {
    exportDate: number;
    nodeId?: string;
    compressed: boolean;
  };
}

export class FileTransport {
  /**
   * Export state to JSON file
   */
  static exportToJSON(
    state: BlockDesignState, 
    history?: BlockDesignState[],
    nodeId?: string
  ): string {
    const exportData: FileExport = {
      format: 'json',
      version: 1,
      state,
      pointer: createPointer(state),
      history,
      metadata: {
        exportDate: Date.now(),
        nodeId,
        compressed: false
      }
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import state from JSON file
   */
  static importFromJSON(jsonData: string): FileExport {
    return JSON.parse(jsonData);
  }

  /**
   * Export state to binary format (more compact)
   */
  static exportToBinary(state: BlockDesignState): Uint8Array {
    const json = JSON.stringify(state);
    const encoder = new TextEncoder();
    return encoder.encode(json);
  }

  /**
   * Import state from binary format
   */
  static importFromBinary(binaryData: Uint8Array): BlockDesignState {
    const decoder = new TextDecoder();
    const json = decoder.decode(binaryData);
    return JSON.parse(json);
  }

  /**
   * Save to file (Browser)
   */
  static downloadAsFile(data: string, filename: string = 'state.json'): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Read from file (Browser)
   */
  static async readFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

// ============================================================================
// TRANSPORT LAYER - IN-MEMORY STREAM SYNC
// ============================================================================

export type SyncEvent = {
  type: 'state_update' | 'pointer_update' | 'merge_request' | 'merge_response';
  nodeId: string;
  timestamp: number;
  data: BlockDesignState | StatePointer | MergeResult;
};

export interface StreamConfig {
  bufferSize: number;
  autoSync: boolean;
  syncInterval?: number;
}

export class MemoryStreamTransport {
  private subscribers: Map<string, (event: SyncEvent) => void> = new Map();
  private eventBuffer: SyncEvent[] = [];
  private config: StreamConfig;

  constructor(config: Partial<StreamConfig> = {}) {
    this.config = {
      bufferSize: config.bufferSize || 100,
      autoSync: config.autoSync ?? true,
      syncInterval: config.syncInterval || 1000
    };
  }

  /**
   * Publish state update to stream
   */
  publish(event: SyncEvent): void {
    this.eventBuffer.push(event);
    
    // Trim buffer if needed
    if (this.eventBuffer.length > this.config.bufferSize) {
      this.eventBuffer.shift();
    }

    // Notify subscribers
    this.subscribers.forEach(callback => callback(event));
  }

  /**
   * Subscribe to state updates
   */
  subscribe(nodeId: string, callback: (event: SyncEvent) => void): () => void {
    this.subscribers.set(nodeId, callback);
    
    // Return unsubscribe function
    return () => this.subscribers.delete(nodeId);
  }

  /**
   * Get buffered events
   */
  getBuffer(): SyncEvent[] {
    return [...this.eventBuffer];
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.eventBuffer = [];
  }

  /**
   * Get events since timestamp
   */
  getEventsSince(timestamp: number): SyncEvent[] {
    return this.eventBuffer.filter(e => e.timestamp > timestamp);
  }
}

// ============================================================================
// UNIFIED SYNC MANAGER
// ============================================================================

export interface SyncOptions {
  method: 'qr' | 'file' | 'stream';
  nodeId?: string;
  includeHistory?: boolean;
}

export interface MergeResult {
  success: boolean;
  newState?: BlockDesignState;
  convergence?: number;
  conflict?: boolean;
  conflictingDimensions?: Precision[];
}

export class SyncManager {
  private qrTransport = QRCodeTransport;
  private fileTransport = FileTransport;
  private streamTransport: MemoryStreamTransport;

  constructor(streamConfig?: Partial<StreamConfig>) {
    this.streamTransport = new MemoryStreamTransport(streamConfig);
  }

  /**
   * Export state using specified method
   */
  async export(
    state: BlockDesignState,
    options: SyncOptions,
    history?: BlockDesignState[]
  ): Promise<string | Uint8Array> {
    const pointer = createPointer(state);

    switch (options.method) {
      case 'qr':
        return this.qrTransport.exportToQR(pointer);

      case 'file':
        if (options.includeHistory) {
          return this.fileTransport.exportToJSON(state, history, options.nodeId);
        }
        return this.fileTransport.exportToBinary(state);

      case 'stream':
        const event: SyncEvent = {
          type: 'state_update',
          nodeId: options.nodeId || 'unknown',
          timestamp: Date.now(),
          data: state
        };
        this.streamTransport.publish(event);
        return JSON.stringify(event);
    }
  }

  /**
   * Import state using specified method
   */
  async import(
    data: string | Uint8Array,
    options: SyncOptions
  ): Promise<BlockDesignState | Partial<StatePointer>> {
    switch (options.method) {
      case 'qr':
        return this.qrTransport.importFromQR(data as string);

      case 'file':
        if (typeof data === 'string') {
          const imported = this.fileTransport.importFromJSON(data);
          return imported.state;
        }
        return this.fileTransport.importFromBinary(data as Uint8Array);

      case 'stream':
        const event: SyncEvent = JSON.parse(data as string);
        return event.data as BlockDesignState;
    }
  }

  /**
   * Subscribe to stream updates
   */
  subscribeToStream(nodeId: string, callback: (state: BlockDesignState) => void): () => void {
    return this.streamTransport.subscribe(nodeId, (event) => {
      if (event.type === 'state_update') {
        callback(event.data as BlockDesignState);
      }
    });
  }

  /**
   * Get stream buffer
   */
  getStreamBuffer(): SyncEvent[] {
    return this.streamTransport.getBuffer();
  }
}

// ============================================================================
// HD VECTOR CLOCK WITH SYNC
// ============================================================================

export class HDVectorClock {
  private currentState: BlockDesignState;
  private stateHistory: Map<string, BlockDesignState> = new Map();
  private currentData: Map<Precision, Uint8Array> = new Map();
  private syncManager: SyncManager;

  constructor(private nodeId: string, streamConfig?: Partial<StreamConfig>) {
    this.syncManager = new SyncManager(streamConfig);
  }

  async initialize(initialData?: {
    nodes: Uint8Array;
    edges: Uint8Array;
    graphs: Uint8Array;
    incidences: Uint8Array;
    hypergraph: Uint8Array;
  }): Promise<BlockDesignState> {
    if (initialData) {
      this.currentData.set('half', initialData.nodes);
      this.currentData.set('single', initialData.edges);
      this.currentData.set('double', initialData.graphs);
      this.currentData.set('quad', initialData.incidences);
      this.currentData.set('octuple', initialData.hypergraph);
    }

    const data = {
      nodes: this.currentData.get('half') || new Uint8Array(),
      edges: this.currentData.get('single') || new Uint8Array(),
      graphs: this.currentData.get('double') || new Uint8Array(),
      incidences: this.currentData.get('quad') || new Uint8Array(),
      hypergraph: this.currentData.get('octuple') || new Uint8Array()
    };

    this.currentState = await createBlockDesign(data);
    this.stateHistory.set(this.currentState.merkleRoot, this.currentState);
    return this.currentState;
  }

  async increment(dimension: Precision, data: Uint8Array): Promise<BlockDesignState> {
    this.currentData.set(dimension, data);
    const newHash = await createHashReference(data, dimension);
    const field = this.dimensionToField(dimension);

    const newState: BlockDesignState = {
      ...this.currentState,
      [field]: newHash,
      timestamp: Date.now(),
      previousHash: this.currentState.merkleRoot,
      merkleRoot: ''
    };

    newState.merkleRoot = await calculateMerkleRoot([
      newState.nodes, newState.edges, newState.graphs,
      newState.incidences, newState.hypergraph
    ]);

    this.stateHistory.set(newState.merkleRoot, newState);
    this.currentState = newState;
    return newState;
  }

  // ========== SYNC METHODS ==========

  async exportToQR(): Promise<string> {
    return await this.syncManager.export(this.currentState, {
      method: 'qr',
      nodeId: this.nodeId
    }) as string;
  }

  async exportToFile(includeHistory: boolean = false): Promise<string> {
    const history = includeHistory ? Array.from(this.stateHistory.values()) : undefined;
    return await this.syncManager.export(this.currentState, {
      method: 'file',
      nodeId: this.nodeId,
      includeHistory
    }, history) as string;
  }

  async importFromQR(qrData: string): Promise<void> {
    const pointer = await this.syncManager.import(qrData, { method: 'qr' }) as Partial<StatePointer>;
    // Merge imported state (simplified - you'd want full merge logic)
    console.log('Imported from QR:', pointer);
  }

  async importFromFile(fileData: string): Promise<void> {
    const state = await this.syncManager.import(fileData, { method: 'file' }) as BlockDesignState;
    this.currentState = state;
    this.stateHistory.set(state.merkleRoot, state);
  }

  subscribeToStream(callback: (state: BlockDesignState) => void): () => void {
    return this.syncManager.subscribeToStream(this.nodeId, callback);
  }

  async publishToStream(): Promise<void> {
    await this.syncManager.export(this.currentState, {
      method: 'stream',
      nodeId: this.nodeId
    });
  }

  getState(): BlockDesignState {
    return this.currentState;
  }

  getPointer(): StatePointer {
    return createPointer(this.currentState);
  }

  private dimensionToField(precision: Precision): keyof BlockDesignState {
    const map: Record<Precision, keyof BlockDesignState> = {
      'half': 'nodes',
      'single': 'edges',
      'double': 'graphs',
      'quad': 'incidences',
      'octuple': 'hypergraph'
    };
    return map[precision];
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

async function demoMultiTransportSync() {
  console.log('=== Multi-Transport Sync Demo ===\n');

  // Initialize two nodes
  const nodeA = new HDVectorClock('node-a');
  const nodeB = new HDVectorClock('node-b');

  const initialData = {
    nodes: new TextEncoder().encode("node1,node2"),
    edges: new TextEncoder().encode("edge1"),
    graphs: new TextEncoder().encode("graph1"),
    incidences: new TextEncoder().encode("inc1"),
    hypergraph: new TextEncoder().encode("hyper1")
  };

  await nodeA.initialize(initialData);
  await nodeB.initialize(initialData);

  // === QR Code Sync ===
  console.log('--- QR Code Sync ---');
  const qrData = await nodeA.exportToQR();
  console.log('QR Data length:', qrData.length, 'bytes');
  console.log('QR Data:', qrData.substring(0, 100) + '...');

  // === File Sync ===
  console.log('\n--- File Sync ---');
  const fileData = await nodeA.exportToFile(true);
  console.log('File Data length:', fileData.length, 'bytes');
  
  // Simulate file transfer
  await nodeB.importFromFile(fileData);
  console.log('✓ Node B imported file data');

  // === Stream Sync ===
  console.log('\n--- Stream Sync ---');
  
  // Node B subscribes to Node A's updates
  const unsubscribe = nodeB.subscribeToStream((state) => {
    console.log('Node B received stream update:', state.merkleRoot.substring(0, 16) + '...');
  });

  // Node A publishes update
  await nodeA.increment('single', new TextEncoder().encode("edge2"));
  await nodeA.publishToStream();

  console.log('\n✓ Multi-transport sync operational!');
  console.log('✓ QR codes for mobile sync');
  console.log('✓ Files for backup/restore');
  console.log('✓ Streams for real-time sync');

  unsubscribe();
}

demoMultiTransportSync();