// ============================================================================
// types.ts - Type Definitions for 8-Tuple Perceptron State (𝒫)
// ============================================================================

import { PatriciaTrie, type TrieTopology } from './patricia-trie';

// IEEE 754 Floating-Point Format Types
/** IEEE 754 half-precision floating-point format (16-bit). */
export type binary16 = number;

/** IEEE 754 single-precision floating-point format (32-bit). */
export type binary32 = number;

/** IEEE 754 double-precision floating-point format (64-bit). */
export type binary64 = number;

/** IEEE 754 quadruple-precision floating-point format (128-bit). Represented as a hex string. */
export type binary128 = string;

/** IEEE 754 octuple-precision floating-point format (256-bit). Represented as a hex string. */
export type binary256 = string;

/** IEEE 754 decimal32 format (32-bit). Represented as a string. */
export type decimal32 = string;

/** IEEE 754 decimal64 format (64-bit). Represented as a string. */
export type decimal64 = string;

/** IEEE 754 decimal128 format (128-bit). Represented as a string. */
export type decimal128 = string;

/** DecimalSpace: All IEEE 754 decimal formats */
export type DecimalSpace = decimal32 | decimal64 | decimal128;

// BlockDesign for IEEE 754 binary formats (legacy format used by App.tsx)
export type BlockDesign = {
  Node:       binary16;   // 16 bits  - 3.31 decimal digits
  Edge:       binary32;   // 32 bits  - 7.22 decimal digits
  Graph:      binary64;   // 64 bits  - 15.95 decimal digits
  Incidence:  binary128;  // 128 bits - 34.02 decimal digits
  Hypergraph: binary256;  // 256 bits - 71.34 decimal digits
};

// BlockDesign for combinatorial design (used by PerceptronState)
export interface BlockDesignCombinatorial {
  v: number;
  k: number;
  lambda: number;
  r: number;
  b: number;
}

// FanoPlane: 7 points (5 binary + 2 decimal)
export type FanoPlane = BlockDesign & {
  Functor?: DecimalSpace; // Point 6 (optional)
  Monad?: DecimalSpace;   // Point 7 (optional)
};

// Perceptron: 8 dimensions (7 FanoPlane + 1 self-reference) - legacy format
export type Perceptron = {
  point: FanoPlane;              // 7 dimensions
  Perceptron?: DecimalSpace;     // 8th dimension (self-reference)
  word: string;
  content: string;
  timestamp: string;
  day: number;
  triples: { subject: string; predicate: string; object: string }[];
};

export interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
  modality: 'MUST' | 'SHOULD' | 'MAY';
  certainty: number;
  eventId: string; // Unique event identifier for the log
  timestamp: number;
}

export interface HypergraphNode {
  id: string;
  label: string;
  data: any;
  owner: string;
}

export interface Hyperedge {
  id: string;
  nodes: string[];
  label: string;
  owner: string;
}

export interface NetworkMessage {
  type: 'STATE_UPDATE' | 'HYPERGRAPH_NODE' | 'HYPERGRAPH_EDGE' | 'SYNC_REQUEST' | 'SYNC_RESPONSE';
  topic: string; // Pub/Sub topic
  payload: any;
  signature: string;
  tau_state: number;
  ipv6: string;
  timestamp: number;
}

export interface PerceptronState {
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
    blockDesign: BlockDesignCombinatorial | null;
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

