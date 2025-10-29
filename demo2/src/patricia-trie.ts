// ============================================================================
// patricia-trie.ts - Patricia Trie for Vocabulary Indexing
// ============================================================================

export interface TrieNode {
  key: string;
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  value?: any;
  termIndex?: number; // Index in state matrix M
}

export interface TrieTopology {
  nodeCount: number;
  leafCount: number;
  maxDepth: number;
  branchingFactor: number;
  compressionRatio: number;
}

export class PatriciaTrie {
  private root: TrieNode;
  private termCount: number;
  private termToIndex: Map<string, number>;
  private indexToTerm: Map<number, string>;

  constructor() {
    this.root = {
      key: '',
      children: new Map(),
      isEndOfWord: false
    };
    this.termCount = 0;
    this.termToIndex = new Map();
    this.indexToTerm = new Map();
  }

  /**
   * Insert a term into the trie and assign it a unique matrix index
   */
  insert(term: string): number {
    if (this.termToIndex.has(term)) {
      return this.termToIndex.get(term)!;
    }

    let node = this.root;
    let i = 0;

    while (i < term.length) {
      let matchFound = false;

      for (const [prefix, childNode] of node.children) {
        const commonLength = this.getCommonPrefixLength(term.slice(i), prefix);

        if (commonLength > 0) {
          matchFound = true;

          if (commonLength === prefix.length) {
            // Full match, continue down this branch
            node = childNode;
            i += commonLength;
          } else {
            // Partial match, need to split the node
            const commonPrefix = prefix.slice(0, commonLength);
            const restOfPrefix = prefix.slice(commonLength);
            const restOfTerm = term.slice(i + commonLength);

            // Create new intermediate node
            const intermediateNode: TrieNode = {
              key: commonPrefix,
              children: new Map(),
              isEndOfWord: false
            };

            // Update old child
            childNode.key = restOfPrefix;
            intermediateNode.children.set(restOfPrefix, childNode);

            // Create new branch for our term
            if (restOfTerm.length > 0) {
              const newNode: TrieNode = {
                key: restOfTerm,
                children: new Map(),
                isEndOfWord: true,
                termIndex: this.termCount
              };
              intermediateNode.children.set(restOfTerm, newNode);
            } else {
              intermediateNode.isEndOfWord = true;
              intermediateNode.termIndex = this.termCount;
            }

            // Replace old child with intermediate
            node.children.delete(prefix);
            node.children.set(commonPrefix, intermediateNode);

            // Assign index
            this.termToIndex.set(term, this.termCount);
            this.indexToTerm.set(this.termCount, term);
            return this.termCount++;
          }
          break;
        }
      }

      if (!matchFound) {
        // No matching prefix, create new branch
        const newNode: TrieNode = {
          key: term.slice(i),
          children: new Map(),
          isEndOfWord: true,
          termIndex: this.termCount
        };
        node.children.set(term.slice(i), newNode);

        this.termToIndex.set(term, this.termCount);
        this.indexToTerm.set(this.termCount, term);
        return this.termCount++;
      }
    }

    // Term already exists at this node
    if (!node.isEndOfWord) {
      node.isEndOfWord = true;
      node.termIndex = this.termCount;
      this.termToIndex.set(term, this.termCount);
      this.indexToTerm.set(this.termCount, term);
      return this.termCount++;
    }

    return node.termIndex!;
  }

  /**
   * Search for exact term
   */
  search(term: string): boolean {
    return this.termToIndex.has(term);
  }

  /**
   * Get matrix index for term
   */
  getIndex(term: string): number | undefined {
    return this.termToIndex.get(term);
  }

  /**
   * Get term from matrix index
   */
  getTerm(index: number): string | undefined {
    return this.indexToTerm.get(index);
  }

  /**
   * Find all terms with given prefix
   */
  findByPrefix(prefix: string): string[] {
    const results: string[] = [];
    let node = this.root;
    let i = 0;

    // Navigate to prefix node
    while (i < prefix.length) {
      let found = false;

      for (const [key, childNode] of node.children) {
        if (prefix.slice(i).startsWith(key)) {
          node = childNode;
          i += key.length;
          found = true;
          break;
        } else if (key.startsWith(prefix.slice(i))) {
          node = childNode;
          i = prefix.length;
          found = true;
          break;
        }
      }

      if (!found) return results;
    }

    // Collect all terms under this node
    this.collectTerms(node, prefix, results);
    return results;
  }

  private collectTerms(node: TrieNode, prefix: string, results: string[]): void {
    if (node.isEndOfWord) {
      results.push(prefix);
    }

    for (const [key, childNode] of node.children) {
      this.collectTerms(childNode, prefix + key, results);
    }
  }

  /**
   * Calculate cryptographic hash of trie structure (Merkle-style)
   */
  calculateHash(): string {
    const crypto = require('crypto');
    return this.hashNode(this.root);
  }

  private hashNode(node: TrieNode): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');

    // Hash node properties
    hash.update(node.key);
    hash.update(node.isEndOfWord ? '1' : '0');

    // Hash children in sorted order (deterministic)
    const childHashes: string[] = [];
    for (const [key, child] of Array.from(node.children.entries()).sort()) {
      childHashes.push(`${key}:${this.hashNode(child)}`);
    }

    hash.update(childHashes.join('|'));
    return hash.digest('hex');
  }

  /**
   * Get topological properties of the trie (for Geometric Invariants)
   */
  getTopology(): TrieTopology {
    const stats = {
      nodeCount: 0,
      leafCount: 0,
      maxDepth: 0,
      totalBranching: 0,
      totalTermLength: 0
    };

    const traverse = (node: TrieNode, depth: number) => {
      stats.nodeCount++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      stats.totalBranching += node.children.size;

      if (node.children.size === 0) {
        stats.leafCount++;
      }

      if (node.isEndOfWord) {
        stats.totalTermLength += depth;
      }

      for (const child of node.children.values()) {
        traverse(child, depth + 1);
      }
    };

    traverse(this.root, 0);

    const avgBranching = stats.nodeCount > 0 ? stats.totalBranching / stats.nodeCount : 0;
    const avgTermLength = this.termCount > 0 ? stats.totalTermLength / this.termCount : 0;
    const compressionRatio = this.termCount > 0 ? stats.nodeCount / this.termCount : 1;

    return {
      nodeCount: stats.nodeCount,
      leafCount: stats.leafCount,
      maxDepth: stats.maxDepth,
      branchingFactor: avgBranching,
      compressionRatio
    };
  }

  /**
   * Get total number of unique terms
   */
  getTermCount(): number {
    return this.termCount;
  }

  /**
   * Export trie structure for serialization (complete state snapshot)
   */
  serialize(): any {
    const serializeNode = (node: TrieNode): any => {
      return {
        key: node.key,
        isEndOfWord: node.isEndOfWord,
        termIndex: node.termIndex,
        children: Array.from(node.children.entries()).map(([key, child]) => ({
          key,
          child: serializeNode(child)
        }))
      };
    };

    return {
      version: '1.0',
      root: serializeNode(this.root),
      termToIndex: Array.from(this.termToIndex.entries()),
      indexToTerm: Array.from(this.indexToTerm.entries()),
      termCount: this.termCount,
      trieHash: this.calculateHash(),
      topology: this.getTopology(),
      timestamp: Date.now()
    };
  }

  /**
   * Import trie structure from serialized data (restore complete state)
   */
  static deserialize(data: any): PatriciaTrie {
    const trie = new PatriciaTrie();

    const deserializeNode = (nodeData: any): TrieNode => {
      const node: TrieNode = {
        key: nodeData.key,
        isEndOfWord: nodeData.isEndOfWord,
        termIndex: nodeData.termIndex,
        children: new Map()
      };

      for (const { key, child } of nodeData.children) {
        node.children.set(key, deserializeNode(child));
      }

      return node;
    };

    // Restore root structure
    trie.root = deserializeNode(data.root);
    
    // Restore mappings
    trie.termToIndex = new Map(data.termToIndex);
    trie.indexToTerm = new Map(data.indexToTerm);
    trie.termCount = data.termCount;

    return trie;
  }

  /**
   * Export to JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.serialize());
  }

  /**
   * Import from JSON string
   */
  static fromJSON(json: string): PatriciaTrie {
    return PatriciaTrie.deserialize(JSON.parse(json));
  }

  /**
   * Create snapshot for state checkpointing
   */
  createSnapshot(): Buffer {
    const data = this.serialize();
    return Buffer.from(JSON.stringify(data), 'utf8');
  }

  /**
   * Restore from snapshot
   */
  static fromSnapshot(snapshot: Buffer): PatriciaTrie {
    const data = JSON.parse(snapshot.toString('utf8'));
    return PatriciaTrie.deserialize(data);
  }

  private getCommonPrefixLength(str1: string, str2: string): number {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return i;
  }

  /**
   * Get all terms (for debugging)
   */
  getAllTerms(): string[] {
    return Array.from(this.termToIndex.keys());
  }
}