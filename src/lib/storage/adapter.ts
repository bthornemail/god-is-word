// ============================================================================
// storage-adapter.ts - Abstracts localStorage/IndexedDB for Event Log
// ============================================================================

import type { SemanticTriple } from '../perceptron/types';

interface StorageAdapter {
  saveEvent(triple: SemanticTriple): Promise<void>;
  getEvents(): Promise<SemanticTriple[]>;
  saveState(key: string, value: any): Promise<void>;
  getState(key: string): Promise<any>;
  clear(): Promise<void>;
}

/**
 * Simple localStorage adapter for small datasets
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'perceptron') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async saveEvent(triple: SemanticTriple): Promise<void> {
    const events = await this.getEvents();
    events.push(triple);
    localStorage.setItem(this.getKey('events'), JSON.stringify(events));
  }

  async getEvents(): Promise<SemanticTriple[]> {
    const data = localStorage.getItem(this.getKey('events'));
    return data ? JSON.parse(data) : [];
  }

  async saveState(key: string, value: any): Promise<void> {
    localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  async getState(key: string): Promise<any> {
    const data = localStorage.getItem(this.getKey(key));
    return data ? JSON.parse(data) : null;
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix + ':')) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * IndexedDB adapter for large datasets
 */
export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'perceptron-db', version: number = 1) {
    this.dbName = dbName;
    this.dbVersion = version;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'eventId' });
          eventStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('state')) {
          db.createObjectStore('state', { keyPath: 'key' });
        }
      };
    });
  }

  async saveEvent(triple: SemanticTriple): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    await new Promise<void>((resolve, reject) => {
      const request = store.put(triple);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getEvents(): Promise<SemanticTriple[]> {
    const db = await this.getDB();
    const transaction = db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveState(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['state'], 'readwrite');
    const store = transaction.objectStore('state');
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getState(key: string): Promise<any> {
    const db = await this.getDB();
    const transaction = db.transaction(['state'], 'readonly');
    const store = transaction.objectStore('state');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    const transactions = [
      db.transaction(['events'], 'readwrite'),
      db.transaction(['state'], 'readwrite')
    ];

    await Promise.all(transactions.map(transaction => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(transaction.objectStoreNames[0]);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }));
  }
}

/**
 * Factory function to get the appropriate storage adapter
 */
export function createStorageAdapter(useIndexedDB: boolean = false): StorageAdapter {
  if (useIndexedDB && 'indexedDB' in window) {
    return new IndexedDBAdapter();
  }
  return new LocalStorageAdapter();
}

