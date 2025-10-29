// ============================================================================
// ipc-transport.ts - Optimized IPC/TCP Transport with Node Streams
// ============================================================================

import net from 'net';
import { Readable, Writable, Duplex, Transform } from 'stream';
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';
import { pipeline } from 'stream/promises';
import crypto from 'crypto';

export interface TransportMessage {
  type: string;
  topic: string;
  payload: any;
  signature: string;
  metadata: {
    tau_state: number;
    ipv6: string;
    timestamp: number;
    senderId: string;
  };
}

export interface TransportConfig {
  mode: 'ipc' | 'tcp';
  path?: string; // For IPC
  host?: string; // For TCP
  port?: number; // For TCP
  workerId: number;
}

/**
 * Message framing protocol:
 * [4 bytes: message length] [N bytes: message data]
 */
class MessageFramer extends Transform {
  private buffer: Buffer = Buffer.alloc(0);
  private expectedLength: number = -1;

  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk: Buffer, encoding: string, callback: Function) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      // Read length prefix if we don't have it yet
      if (this.expectedLength === -1 && this.buffer.length >= 4) {
        this.expectedLength = this.buffer.readUInt32BE(0);
        this.buffer = this.buffer.slice(4);
      }

      // Read message if we have enough data
      if (this.expectedLength !== -1 && this.buffer.length >= this.expectedLength) {
        const messageData = this.buffer.slice(0, this.expectedLength);
        this.buffer = this.buffer.slice(this.expectedLength);
        this.expectedLength = -1;

        try {
          const message = JSON.parse(messageData.toString('utf8'));
          this.push(message);
        } catch (err) {
          console.error('[MessageFramer] Parse error:', err);
        }
      } else {
        break; // Need more data
      }
    }

    callback();
  }
}

class MessageSerializer extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(message: any, encoding: string, callback: Function) {
    try {
      const json = JSON.stringify(message);
      const data = Buffer.from(json, 'utf8');
      const length = Buffer.alloc(4);
      length.writeUInt32BE(data.length, 0);

      this.push(Buffer.concat([length, data]));
    } catch (err) {
      console.error('[MessageSerializer] Serialize error:', err);
    }
    callback();
  }
}

/**
 * IPC Transport using Unix Domain Sockets (faster than UDP for local)
 */
export class IPCTransport {
  private server: net.Server | null = null;
  private clients: Map<string, net.Socket> = new Map();
  private messageHandler: ((message: TransportMessage) => void) | null = null;
  private config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  /**
   * Start IPC server
   */
  async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socketPath = this.config.path || `/tmp/perceptron-${this.config.workerId}.sock`;

      // Remove existing socket file
      try {
        require('fs').unlinkSync(socketPath);
      } catch (err) {
        // Ignore if doesn't exist
      }

      this.server = net.createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (err) => {
        console.error(`[IPC Server ${this.config.workerId}] Error:`, err);
        reject(err);
      });

      this.server.listen(socketPath, () => {
        console.log(`[IPC Server ${this.config.workerId}] Listening on ${socketPath}`);
        resolve();
      });
    });
  }

  /**
   * Connect to peer IPC server
   */
  async connectToPeer(peerWorkerId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const socketPath = `/tmp/perceptron-${peerWorkerId}.sock`;
      const client = net.createConnection(socketPath);

      client.on('connect', () => {
        console.log(`[IPC Client ${this.config.workerId}] Connected to Worker ${peerWorkerId}`);
        this.clients.set(`worker-${peerWorkerId}`, client);
        this.handleConnection(client);
        resolve();
      });

      client.on('error', (err) => {
        console.error(`[IPC Client ${this.config.workerId}] Connection error:`, err);
        reject(err);
      });
    });
  }

  private handleConnection(socket: net.Socket) {
    const framer = new MessageFramer();

    socket.pipe(framer);

    framer.on('data', (message: TransportMessage) => {
      if (this.messageHandler) {
        this.messageHandler(message);
      }
    });

    socket.on('error', (err) => {
      console.error(`[IPC ${this.config.workerId}] Socket error:`, err);
    });

    socket.on('close', () => {
      // Remove from clients
      for (const [id, client] of this.clients.entries()) {
        if (client === socket) {
          this.clients.delete(id);
          break;
        }
      }
    });
  }

  /**
   * Send message to specific peer
   */
  async send(peerId: string, message: TransportMessage): Promise<void> {
    const client = this.clients.get(peerId);
    if (!client) {
      throw new Error(`No connection to peer ${peerId}`);
    }

    const serializer = new MessageSerializer();
    serializer.pipe(client, { end: false });
    serializer.write(message);
  }

  /**
   * Broadcast to all connected peers
   */
  async broadcast(message: TransportMessage): Promise<void> {
    const promises = Array.from(this.clients.entries()).map(([id, client]) => {
      return new Promise<void>((resolve, reject) => {
        const serializer = new MessageSerializer();
        serializer.pipe(client, { end: false });
        serializer.write(message);
        serializer.on('finish', resolve);
        serializer.on('error', reject);
      });
    });

    await Promise.all(promises);
  }

  /**
   * Set message handler
   */
  onMessage(handler: (message: TransportMessage) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    for (const client of this.clients.values()) {
      client.end();
    }
    this.clients.clear();

    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => resolve());
      });
    }
  }
}

/**
 * TCP Transport with Web Streams API integration
 */
export class TCPTransport {
  private server: net.Server | null = null;
  private connections: Map<string, net.Socket> = new Map();
  private messageHandler: ((message: TransportMessage) => void) | null = null;
  private config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  /**
   * Start TCP server
   */
  async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const port = this.config.port || 41234 + this.config.workerId;

      this.server = net.createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (err) => {
        console.error(`[TCP Server ${this.config.workerId}] Error:`, err);
        reject(err);
      });

      this.server.listen(port, '127.0.0.1', () => {
        console.log(`[TCP Server ${this.config.workerId}] Listening on 127.0.0.1:${port}`);
        resolve();
      });
    });
  }

  /**
   * Connect to peer TCP server
   */
  async connectToPeer(peerId: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = net.createConnection({
        host: '127.0.0.1',
        port
      });

      client.on('connect', () => {
        console.log(`[TCP Client ${this.config.workerId}] Connected to ${peerId}:${port}`);
        this.connections.set(peerId, client);
        this.handleConnection(client);
        resolve();
      });

      client.on('error', (err) => {
        console.error(`[TCP Client ${this.config.workerId}] Connection error:`, err);
        reject(err);
      });
    });
  }

  private handleConnection(socket: net.Socket) {
    // Convert Node stream to Web Stream for modern API
    const nodeReadable = socket;
    const webReadable = Readable.toWeb(nodeReadable) as ReadableStream<Uint8Array>;

    // Create transform stream for message framing
    const frameTransform = new TransformStream({
      start(controller) {
        // @ts-ignore
        controller.buffer = new Uint8Array(0);
        // @ts-ignore
        controller.expectedLength = -1;
      },
      transform(chunk, controller) {
        // Concatenate chunk to buffer
        // @ts-ignore
        const oldBuffer = controller.buffer;
        // @ts-ignore
        controller.buffer = new Uint8Array(oldBuffer.length + chunk.length);
        // @ts-ignore
        controller.buffer.set(oldBuffer);
        // @ts-ignore
        controller.buffer.set(chunk, oldBuffer.length);

        // Process complete messages
        while (true) {
          // @ts-ignore
          if (controller.expectedLength === -1 && controller.buffer.length >= 4) {
            // @ts-ignore
            const view = new DataView(controller.buffer.buffer);
            // @ts-ignore
            controller.expectedLength = view.getUint32(0);
            // @ts-ignore
            controller.buffer = controller.buffer.slice(4);
          }

          // @ts-ignore
          if (controller.expectedLength !== -1 && controller.buffer.length >= controller.expectedLength) {
            // @ts-ignore
            const messageData = controller.buffer.slice(0, controller.expectedLength);
            // @ts-ignore
            controller.buffer = controller.buffer.slice(controller.expectedLength);
            // @ts-ignore
            controller.expectedLength = -1;

            const text = new TextDecoder().decode(messageData);
            try {
              const message = JSON.parse(text);
              controller.enqueue(message);
            } catch (err) {
              console.error('[TCP] Parse error:', err);
            }
          } else {
            break;
          }
        }
      }
    });

    // Process messages
    const processMessages = async () => {
      const reader = webReadable.pipeThrough(frameTransform).getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (this.messageHandler) {
            this.messageHandler(value as TransportMessage);
          }
        }
      } catch (err) {
        console.error('[TCP] Read error:', err);
      }
    };

    processMessages().catch(console.error);

    socket.on('error', (err) => {
      console.error(`[TCP ${this.config.workerId}] Socket error:`, err);
    });

    socket.on('close', () => {
      for (const [id, conn] of this.connections.entries()) {
        if (conn === socket) {
          this.connections.delete(id);
          break;
        }
      }
    });
  }

  /**
   * Send message using Web Streams API
   */
  async send(peerId: string, message: TransportMessage): Promise<void> {
    const socket = this.connections.get(peerId);
    if (!socket) {
      throw new Error(`No connection to peer ${peerId}`);
    }

    const json = JSON.stringify(message);
    const data = new TextEncoder().encode(json);
    const length = new Uint8Array(4);
    new DataView(length.buffer).setUint32(0, data.length);

    const combined = new Uint8Array(4 + data.length);
    combined.set(length);
    combined.set(data, 4);

    socket.write(Buffer.from(combined));
  }

  /**
   * Broadcast to all connections
   */
  async broadcast(message: TransportMessage): Promise<void> {
    const promises = Array.from(this.connections.keys()).map(peerId => 
      this.send(peerId, message)
    );
    await Promise.all(promises);
  }

  /**
   * Set message handler
   */
  onMessage(handler: (message: TransportMessage) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    for (const conn of this.connections.values()) {
      conn.end();
    }
    this.connections.clear();

    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => resolve());
      });
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      activeConnections: this.connections.size,
      peers: Array.from(this.connections.keys())
    };
  }
}

/**
 * Factory for creating appropriate transport
 */
export class TransportFactory {
  static create(config: TransportConfig): IPCTransport | TCPTransport {
    if (config.mode === 'ipc') {
      return new IPCTransport(config);
    } else {
      return new TCPTransport(config);
    }
  }
}