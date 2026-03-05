// ============================================================================
// indexed-db.ts - IndexedDB Wrapper for Large Hypergraph Storage
// ============================================================================

import { IndexedDBAdapter } from './adapter';

export class IndexedDBStorage {
  private adapter: IndexedDBAdapter;

  constructor(dbName: string = 'perceptron-db') {
    this.adapter = new IndexedDBAdapter(dbName);
  }

  /**
   * Save Perceptron state
   */
  async saveState(state: any): Promise<void> {
    await this.adapter.saveState('perceptron_state', state);
  }

  /**
   * Load Perceptron state
   */
  async loadState(): Promise<any> {
    return await this.adapter.getState('perceptron_state');
  }

  /**
   * Save hypergraph nodes
   */
  async saveNodes(nodes: any[]): Promise<void> {
    await this.adapter.saveState('hypergraph_nodes', nodes);
  }

  /**
   * Load hypergraph nodes
   */
  async loadNodes(): Promise<any[]> {
    return (await this.adapter.getState('hypergraph_nodes')) || [];
  }

  /**
   * Save hypergraph edges
   */
  async saveEdges(edges: any[]): Promise<void> {
    await this.adapter.saveState('hypergraph_edges', edges);
  }

  /**
   * Load hypergraph edges
   */
  async loadEdges(): Promise<any[]> {
    return (await this.adapter.getState('hypergraph_edges')) || [];
  }

  /**
   * Save event log
   */
  async saveEventLog(events: any[]): Promise<void> {
    // Save all events
    for (const event of events) {
      await this.adapter.saveEvent(event);
    }
  }

  /**
   * Load event log
   */
  async loadEventLog(): Promise<any[]> {
    return await this.adapter.getEvents();
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    await this.adapter.clear();
  }
}

