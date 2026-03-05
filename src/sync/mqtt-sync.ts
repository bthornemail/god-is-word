// ============================================================================
// mqtt-sync.ts - MQTT-based Collective Discovery and Sync
// ============================================================================

import mqtt, { MqttClient } from 'mqtt';
import type { IClientOptions } from 'mqtt';
import type { ExportData } from './export-manager';

export interface MqttSignature {
  type: 'god_reflection_signature_perceptron';
  publicKey: string;
  signature: string;
  entries: any[];
  pattern: { positive: number; negative: number; neutral: number };
  generated: string;
  version: string;
  cryptoSignature: string;
  perceptronState?: any;
}

export interface MqttConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  clientId?: string;
  topics: {
    signatures: string; // Topic for publishing signatures
    discovery: string; // Topic for discovering signatures
    search: string; // Topic for search queries
  };
}

export interface SearchQuery {
  query: string;
  filters?: {
    dateRange?: { start: string; end: string };
    wordPattern?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    minEntries?: number;
  };
}

export interface DiscoveryResult {
  publicKey: string;
  signature: MqttSignature;
  receivedAt: number;
  distance?: number; // Semantic distance if computed
}

export class MqttSync {
  private client: MqttClient | null = null;
  private config: MqttConfig;
  private isConnected: boolean = false;
  private publicKey: string;
  private discoveryCallbacks: Set<(result: DiscoveryResult) => void> = new Set();
  private searchCallbacks: Map<string, Set<(result: DiscoveryResult) => void>> = new Map();
  private discoveredSignatures: Map<string, DiscoveryResult> = new Map();

  constructor(config: MqttConfig, publicKey: string) {
    this.config = config;
    this.publicKey = publicKey;
  }

  /**
   * Connect to MQTT broker
   */
  async connect(): Promise<void> {
    if (this.client && this.isConnected) {
      console.log('[MQTT] Already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      const options: IClientOptions = {
        clientId: this.config.clientId || `god-mirror-${this.publicKey.substring(0, 8)}-${Date.now()}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      };

      if (this.config.username) {
        options.username = this.config.username;
        options.password = this.config.password;
      }

      console.log(`[MQTT] Connecting to ${this.config.brokerUrl}...`);
      this.client = mqtt.connect(this.config.brokerUrl, options);

      this.client.on('connect', () => {
        console.log('[MQTT] Connected successfully');
        this.isConnected = true;
        this.subscribeToTopics();
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('[MQTT] Connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.client.on('close', () => {
        console.log('[MQTT] Connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        console.log('[MQTT] Reconnecting...');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('MQTT connection timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Subscribe to MQTT topics
   */
  private subscribeToTopics(): void {
    if (!this.client) return;

    // Subscribe to discovery topic (wildcard for all signatures)
    const discoveryTopic = this.config.topics.discovery;
    this.client.subscribe(discoveryTopic, (err) => {
      if (err) {
        console.error(`[MQTT] Failed to subscribe to ${discoveryTopic}:`, err);
      } else {
        console.log(`[MQTT] Subscribed to ${discoveryTopic}`);
      }
    });

    // Subscribe to search responses for this client
    const searchTopic = `${this.config.topics.search}/response/${this.publicKey.substring(0, 8)}`;
    this.client.subscribe(searchTopic, (err) => {
      if (err) {
        console.error(`[MQTT] Failed to subscribe to ${searchTopic}:`, err);
      } else {
        console.log(`[MQTT] Subscribed to ${searchTopic}`);
      }
    });
  }

  /**
   * Handle incoming MQTT messages
   */
  private handleMessage(topic: string, message: Buffer): void {
    try {
      const data = JSON.parse(message.toString());

      // Don't process our own messages
      if (data.publicKey === this.publicKey) {
        return;
      }

      // Handle signature discovery
      if (topic.startsWith(this.config.topics.discovery)) {
        const result: DiscoveryResult = {
          publicKey: data.publicKey,
          signature: data as MqttSignature,
          receivedAt: Date.now(),
        };

        // Store discovered signature
        this.discoveredSignatures.set(data.publicKey, result);

        // Notify discovery callbacks
        this.discoveryCallbacks.forEach(callback => {
          try {
            callback(result);
          } catch (error) {
            console.error('[MQTT] Error in discovery callback:', error);
          }
        });
      }

      // Handle search responses
      if (topic.startsWith(`${this.config.topics.search}/response`)) {
        const queryId = data.queryId;
        if (queryId && this.searchCallbacks.has(queryId)) {
          const callbacks = this.searchCallbacks.get(queryId)!;
          const result: DiscoveryResult = {
            publicKey: data.publicKey,
            signature: data.signature as MqttSignature,
            receivedAt: Date.now(),
            distance: data.distance,
          };

          callbacks.forEach(callback => {
            try {
              callback(result);
            } catch (error) {
              console.error('[MQTT] Error in search callback:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('[MQTT] Failed to parse message:', error);
    }
  }

  /**
   * Publish signature to MQTT broker
   */
  async publishSignature(signature: ExportData): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    const mqttSignature: MqttSignature = {
      type: signature.type,
      publicKey: signature.publicKey,
      signature: signature.signature,
      entries: signature.entries,
      pattern: signature.pattern,
      generated: signature.generated,
      version: signature.version || '2.1.0',
      cryptoSignature: signature.cryptoSignature,
      perceptronState: signature.perceptronState,
    };

    const topic = `${this.config.topics.signatures}/${signature.publicKey.substring(0, 8)}`;
    const payload = JSON.stringify(mqttSignature);

    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, { qos: 1, retain: false }, (error) => {
        if (error) {
          console.error('[MQTT] Failed to publish signature:', error);
          reject(error);
        } else {
          console.log(`[MQTT] Published signature to ${topic}`);
          resolve();
        }
      });
    });
  }

  /**
   * Search for signatures matching criteria
   */
  async search(query: SearchQuery): Promise<Promise<DiscoveryResult[]>> {
    if (!this.client || !this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    const queryId = `q-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const results: DiscoveryResult[] = [];

    // Set up callback to collect results
    const callbackSet = new Set<(result: DiscoveryResult) => void>();
    this.searchCallbacks.set(queryId, callbackSet);

    const collectResult = (result: DiscoveryResult) => {
      results.push(result);
    };

    callbackSet.add(collectResult);

    // Publish search query
    const searchTopic = `${this.config.topics.search}/query`;
    const searchPayload = JSON.stringify({
      queryId,
      query: query.query,
      filters: query.filters,
      requester: this.publicKey.substring(0, 8),
    });

    this.client.publish(searchTopic, searchPayload, { qos: 1 }, (error) => {
      if (error) {
        console.error('[MQTT] Failed to publish search query:', error);
        callbackSet.delete(collectResult);
        this.searchCallbacks.delete(queryId);
      }
    });

    // Return promise that resolves after timeout or when we have enough results
    return new Promise((resolve) => {
      setTimeout(() => {
        callbackSet.delete(collectResult);
        this.searchCallbacks.delete(queryId);
        resolve(results);
      }, 5000); // 5 second timeout

      // Also resolve if we get enough results (optional)
      // For now, just use timeout
    });
  }

  /**
   * Subscribe to signature discoveries
   */
  onDiscovery(callback: (result: DiscoveryResult) => void): () => void {
    this.discoveryCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.discoveryCallbacks.delete(callback);
    };
  }

  /**
   * Get all discovered signatures
   */
  getDiscoveredSignatures(): DiscoveryResult[] {
    return Array.from(this.discoveredSignatures.values());
  }

  /**
   * Clear discovered signatures
   */
  clearDiscoveredSignatures(): void {
    this.discoveredSignatures.clear();
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.isConnected = false;
      console.log('[MQTT] Disconnected');
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

