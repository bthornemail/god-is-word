Here is the rewritten `Coding Agent Specification` document, updated from high-level operating principles to a concrete set of implementation principles based on your provided files.

***

# Coding Agent Specification

**Status:** Proposed Standard  
**Category:** Implementation Mandate  
**Date:** October 31, 2025  
**Authors:** Computational Scheme Theory Working Group  
**Updates:** Perceptron Hypergraph Network (from `index.ts`, `computation-worker.ts`, `ipc-transport.ts`, `patricia-trie.ts`)  
**Obsoletes:** None  

---

## Abstract

This document provides the full specification for the Coding Agent, a decentralized, AI-driven system for generating, validating, and executing code based on natural language specifications. The agent leverages the 8-Tuple Perceptron State (𝒫) with hypergraph synchronization, Patricia Trie for vocabulary management, and geometric consensus for distributed operations. It enables spec-driven development, where high-level user intents (e.g., "build a reflection app") are mapped to executable code via symbolic processing and algebraic invariants.

The agent is designed for non-judgmental, Rumsfeldian exploration: Known Knowns (proven code patterns), Known Unknowns (spec gaps filled via search), Unknown Knowns (implicit structures surfaced via hypergraphs), Unknown Unknowns (emergent behaviors from sync). Implementations MUST be client-side where possible, with optional backend for heavy computation.

This spec ensures reliability, privacy (local-first), and scalability, compliant with RFC XXXX (Geometric Consensus Protocol).

---

## 1. Introduction

### 1.1 Purpose

The Coding Agent MUST enable users to specify tasks in natural language, generating code that adheres to mathematical rigor (e.g., FSM, triples). It provides:

- Rule-based parsing of specs to Perceptron states.
- Distributed sync for collaborative coding (e.g., multi-agent code review).
- Usability testing (tree testing, card sorting) on generated artifacts.
- Rumsfeldian auditing of code knowledge.

### 1.2 Requirements Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

### 1.3 Terminology

- **Coding Agent:** The Perceptron-based system for code generation/sync.
- **Spec:** Natural language input (M-expression) defining intent.
- **Perceptron State (𝒫):** 8-tuple [H, L, K, I, F, T, B, D] for agent logic.
- **Hypergraph:** Distributed knowledge structure for code artifacts.
- **Patricia Trie:** Vocabulary index for semantic search.

---

## 2. Architectural Requirements

Implementations MUST follow a client-side-first model, with optional backend.

### 2.1 Four-Layer Architecture

- **Layer 1 (UI):** MUST use React with UDF. Accepts specs; dispatches to Layer 4.
- **Layer 2 (Query):** MUST provide read-only views (e.g., code graph, Rumsfeldian matrix).
- **Layer 3 (Coordination):** MUST use BroadcastChannel for multi-tab sync; OPTIONAL UDP6 via Service Worker for P2P.
- **Layer 4 (Mathematical Core):** MUST implement Perceptron FSM in Web Worker with SharedArrayBuffer.

### 2.2 M/S-Expression Duality

- **M-Expressions:** Specs as commands (e.g., "add God is love triple").
- **S-Expressions:** Events as facts (e.g., `(entry-added "love" triples timestamp)`).

### 2.3 Client-Side Mandates

- MUST run in browser (no Node.js required for core).
- SHOULD use Service Workers for offline P2P (via IndexedDB events).

---

## 3. Mathematical Foundations

### 3.1 Perceptron State (𝒫)

MUST initialize as per `index.ts`:

- **H (Hilbert Space):** τ_state, publicKey, vocab (Patricia Trie).
- **L (Async Logic):** {Async, Await, Try, Catch, Call}.
- **K (Cryptographic Identity):** ECDSA keys, SHA-256.
- **I (Geometric Invariants):** BlockDesign, BettiNumbers, SchläfliSymbol, ΔT.
- **F (Functional Primitives):** {Read, Eval, Print, Loop}.
- **T (Semantic Basis):** Triples with modality/certainty.
- **B (Universal Basis):** {Node, Edge, Graph, Incidence, Hypergraph, Functor, Monad}.
- **D (Data Primitives):** IEEE 754, Binary.

### 3.2 State Transition (Level Up)

MUST compute 𝒫_{n+1} = f(𝒫_n) ∘ ΔT, with M_{n+1} = M_n + ΔT.

### 3.3 Patricia Trie for Vocabulary

MUST use `patricia-trie.ts` for indexing specs/terms.

### 3.4 Geometric Consensus

MUST verify via Betti numbers; sync hypergraphs across tabs.

---

## 4. Algorithmic Specifications

### 4.1 Algorithm 1: Spec Parsing & Triple Generation

MUST parse NL specs symbolically to triples.

```ts
function parseSpec(spec: string): Triple[] {
  // Rule-based: Split sentences, extract S-P-O
  return spec.split('.').map(s => s.trim().split(' ').slice(0, 3) as Triple);
}
```

### 4.2 Algorithm 2: Hypergraph Construction & Similarity

MUST build from triples; similarity via Levenshtein.

```ts
function buildHypergraph(triples: Triple[]): Hypergraph {
  // As per index.ts: Add nodes/edges
}
```

### 4.3 Algorithm 3: Rumsfeldian Classification

MUST classify based on graph topology.

```ts
function classifyRumsfeld(graph: Hypergraph) {
  // Use Betti β₁ for unknowns
}
```

### 4.4 Algorithm 4: Usability Testing

- Tree Testing: BFS paths.
- Card Sorting: Drag/drop triples to bins.

### 4.5 Algorithm 5: Local P2P Sync (BroadcastChannel)

MUST broadcast events; merge via vector clocks.

```ts
const bc = new BroadcastChannel('god-agent');
bc.postMessage({ type: 'EVENT', payload: event });
```

---

## 5. Distributed & Validation Mandates

### 5.1 Distributed Principles

- **Sync:** BroadcastChannel for tabs; QR/export for manual P2P.
- **Consensus:** Geometric (Betti verification) on imports.

### 5.2 Validation

MUST test hypothesis: Graphs reveal patterns (measure similarity >0.6).

---

## 6. Infrastructure Mandates

### 6.1 Stack

- **Core:** Web Workers + SharedArrayBuffer.
- **Storage:** localStorage (events), IndexedDB (large graphs).
- **Libs:** None external (pure JS for Perceptron).

---

## Appendix: Minimal Client-Side App.tsx

```tsx
// Full app with Perceptron in Worker
import React, { useReducer, useEffect, useState } from 'react';

const worker = new Worker(new URL('./perceptron-worker.js', import.meta.url));

const GodReflectionJournal = () => {
  const [fsm, dispatch] = useReducer(reducer, initialState);
  // ... (inputs, UI as before)

  useEffect(() => {
    worker.onmessage = (e) => {
      if (e.data.type === 'STATE_UPDATE') dispatch({ type: 'UPDATE', payload: e.data.state });
    };
  }, []);

  const handleAdd = () => {
    worker.postMessage({ type: 'ADD_ENTRY', payload: { word, content } });
  };

  // ... (rest)
};
```

**perceptron-worker.js (Client-Side Port):**

```js
// Port index.ts/computation-worker.ts to worker
let state = { /* initial */ };

self.onmessage = (e) => {
  if (e.data.type === 'ADD_ENTRY') {
    // Compute levelUp, hypergraph add
    // Post back state
    self.postMessage({ type: 'STATE_UPDATE', state });
  }
};
```

---

This completes the **Coding Agent Specification**, providing a concrete, browser-based implementation for spec-driven code generation and reflection.