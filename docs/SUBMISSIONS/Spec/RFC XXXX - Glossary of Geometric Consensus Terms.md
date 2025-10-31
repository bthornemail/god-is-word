# RFC XXXX: Glossary of Geometric Consensus Terms

## A. Normative Terminology

The following terms SHALL have precise mathematical definitions when used in implementations of this protocol.

### A.1. Core Mathematical Structures

**Block Design (BIBD)**
- **Definition**: A balanced incomplete block design with parameters (v,k,λ,r,b)
- **Requirements**: MUST satisfy vr = bk and λ(v-1) = r(k-1)
- **Implementation**: Used for type structure encoding in IPv6 segments 0-4

**Chromatic Polynomial (π_G(z))**
- **Definition**: A graph polynomial counting proper colorings
- **Critical Property**: π_G(-1) = number of acyclic orientations
- **Usage**: MUST be used for consensus validation (π_G(-1) >  indicates valid state)

**Fano Plane**
- **Definition**: The finite projective plane of order 2 with 7 points and 7 lines
- **Structure**: MUST have 3 points per line, 3 lines per point
- **Encoding**: REQUIRED for IPv6 segments 0-6

**Genus (γ(G))**
- **Definition**: Minimum number of handles needed to embed graph without crossings
- **Levels**: 
  - γ=0: planar graph (k=0)
  - γ=1: toroidal graph (k=1) 
  - γ=2: double-toroidal graph (k=2)
  - γ=3: pretzel graph (k=3)
- **Mapping**: MUST correspond to geometric shift parameter k

**Hilbert Space**
- **Definition**: A complete inner product space
- **Basis**: REQUIRED to be {Node, Edge, Graph, Incidence, Hypergraph, Functor, Monad}
- **Completeness**: MUST be proven via Fano lottery property

### A.2. Protocol Components

**Geometric Shift (k)**
- **Definition**: Parameter k ∈ {0,1,2,3} encoding dimensional transformation
- **Mapping**: 
  - k=0: Point transformation
  - k=1: Line transformation  
  - k=2: Plane transformation
  - k=3: Solid transformation
- **Encoding**: REQUIRED in IPv6 segment 7 bits 8-11

**Inner Product (⟨P₁|P₂⟩)**
- **Definition**: MUST measure similarity between perceptron states
- **Formula**: ⟨P₁|P₂⟩ = Σ hash_similarity(P₁[i], P₂[i])
- **Properties**: REQUIRED to be positive definite, symmetric, and linear

**Lottery Winner**
- **Definition**: The guaranteed 2-of-3 matching from Transylvania lottery property
- **Encoding**: REQUIRED in IPv6 segment 7 bits 0-7
- **Guarantee**: MUST provide at least 2 matching segments between any two addresses

**Perceptron**
- **Definition**: The fundamental computational unit implementing both:
  - Quadratic form: P² = (BD × FP) ± k·I (Monad view)
  - Fixed point: P = f(BD, FP, P) ± k (Functor view)
- **Duality**: MUST support both formulations as isomorphic representations

**Ramanujan Form**
- **Definition**: Universal quadratic form {a,b,c,d} that generates all positive integers
- **Critical Forms**: 
  - {1,1,2,d} with 2 ≤ d ≤ 14 (primary)
  - {1,2,4,d} with 4 ≤ d ≤ 14 (secondary)
- **Exception**: {1,2,5,5} cannot represent 15 (infinite loop prevention)

### A.3. Graph Theory Terms

**Acyclic Orientation**
- **Definition**: Orientation of graph edges that contains no directed cycles
- **Relation**: π_G(-1) counts acyclic orientations
- **Consensus Meaning**: Valid consensus paths are acyclic

**Betti Numbers (β₀, β₁, β₂)**
- **Definition**: Topological invariants counting components, cycles, and voids
- **Partition Detection**: β₀ > 1 indicates network partition
- **Computation**: MUST be computable in O(v) for simple cases

**Complete Bipartite Graph (K_{m,n})**
- **Definition**: Graph with two partitions where all cross-partition edges exist
- **Interpretation**: Models Monad ↔ Functor bipartite structure

**Self-Complementary Graph**
- **Definition**: Graph isomorphic to its complement (G ≅ Ḡ)
- **Monad Correspondence**: Every monad MUST be self-complementary
- **Examples**: P₂, P₄, C₅, and certain 7-vertex graphs

**Tutte Polynomial (T_G(x,y))**
- **Definition**: Universal graph invariant encoding numerous graph properties
- **Generating Function**: Exponential form relates to perceptron iteration
- **Specializations**: Chromatic polynomial and genus are evaluations of Tutte polynomial

## B. Implementation Terminology

### B.1. IPv6 Encoding

**Fano Descriptor**
- **Definition**: IPv6 segments 0-6 encoding the 7 points of a Fano plane
- **Structure**: Each segment encodes one Fano point with geometric properties

**Geometric Context**
- **Definition**: The combined lottery winner and geometric shift in segment 7
- **Encoding**: 16 bits total: 8 bits lottery, 4 bits shift, 4 bits metadata

**Patricia Trie RPC**
- **Definition**: Signature-based storage with universal binary data access
- **Property**: MUST store signatures separately from data
- **Access**: REQUIRED to support universal RPC calls

### B.2. System Architecture

**Browser Model Execution**
- **Definition**: Loading and running AI models directly from IPv6 addresses in browsers
- **Requirement**: MUST work without installation or specialized hardware

**Federated Learning Coordination**
- **Definition**: Multi-browser model training using geometric consensus
- **Privacy**: Data NEVER leaves local browser
- **Coordination**: Uses Fano plane structures for update synchronization

**Geometric Consensus**
- **Definition**: Agreement protocol using geometric structures rather than cryptographic proofs
- **Advantage**: Provides mathematical convergence bounds
- **Implementation**: MUST converge within 14 steps

**P2P Type Synchronization**
- **Definition**: Distributed type alignment using BlockDesign × FanoPlane²
- **Guarantee**: Transylvania lottery property ensures 2-of-3 matching
- **Application**: Enables type-safe distributed programming

### B.3. Cryptographic Terms

**Cryptographic Sovereignty**
- **Definition**: Proof of ownership via cryptographic signatures on geometric structures
- **Implementation**: Public key hash in coefficient 5, signature hash in coefficient 6

**Sovereignty Proof**
- **Definition**: Combined cryptographic and geometric proof of ownership
- **Components**: MUST include both digital signature and geometric structure preservation proof

**Zero State Identity**
- **Definition**: Ownership status revealed through ±0 encoding
- **+0 State**: Unknown/unowned (signature_hash = 0, public_key_hash = 0)
- **-0 State**: Owned/sovereign (signature_hash ≠ 0, public_key_hash ≠ 0)

## C. Mathematical Properties

### C.1. Universal Properties

**Completeness (Hilbert Space)**
- **Definition**: Every Cauchy sequence converges to a point in the space
- **Proof**: Derived from Fano lottery guaranteeing ≤14 steps between any two points

**Duality (Monad-Functor)**
- **Definition**: Isomorphism between self-complementary graphs and complement transformations
- **Interpretation**: Observer perspective vs transformation perspective of same structure

**Universality (Quadratic Forms)**
- **Definition**: Ability to represent all positive integers using specific coefficient sets
- **Bound**: Maximum coefficient 14 provides step bound
- **Exception**: Coefficient set {1,2,5,5} cannot represent 15

### C.2. Geometric Properties

**Projective Geometry**
- **Definition**: Geometry without parallel lines (all lines intersect)
- **Application**: Fano plane is smallest projective plane
- **Use**: Provides coordination structure for distributed systems

**Topological Protection**
- **Definition**: Consensus outcomes that cannot be changed by local perturbations
- **Mechanism**: Derived from index theorems in algebraic topology
- **Benefit**: Robust against Byzantine faults

## D. Protocol-Specific Terms

### D.1. Consensus Mechanisms

**Fano Lottery**
- **Definition**: Property guaranteeing any two IPv6 addresses match on ≥2 segments
- **Implementation**: Basis for Hilbert space completeness proof
- **Result**: Enables efficient peer discovery and coordination

**Transylvania Lottery Property**
- **Definition**: Mathematical guarantee that two Fano planes ensure 2-of-3 matching
- **Proof**: Pigeonhole principle applied to intervals [1,7] and [8,14]
- **Application**: P2P type synchronization

### D.2. Validation Terms

**Acyclic Check**
- **Definition**: Validation using π_G(-1) > 0 to ensure no cycles
- **Purpose**: Prevents infinite loops in consensus process
- **Implementation**: REQUIRED consensus validation step

**Geometric Proof**
- **Definition**: Mathematical proof based on geometric structure preservation
- **Components**: MUST include Fano plane properties and automorphism group preservation

**Negative Discriminant Rejection**
- **Definition**: Automatic rejection of configurations with imaginary eigenvalues
- **Purpose**: Prevents invalid perceptron states and infinite recursion
- **Trigger**: Δ < 0 in perceptron fixed-point equation

## E. Cross-References

### E.1. Mathematical Foundations
- Ramanujan Universal Forms → Section 2.2
- Hilbert Space Structure → Section 2.1  
- Chromatic Polynomial → Section A.1
- Tutte Polynomial → Section A.3

### E.2. Protocol Implementation
- IPv6 Encoding → Section B.1
- Consensus Algorithm → Section 3.2
- Browser Execution → Section B.2
- Security Mechanisms → Section 6

### E.3. Validation Requirements
- Convergence Proofs → Section 9.1
- Loop Prevention → Section 9.2
- Geometric Validation → Section D.2

---

**Note**: All terms in this glossary SHALL be interpreted according to their mathematical definitions when used in protocol implementations. Implementations MUST maintain the precise relationships between these terms as specified in the main protocol document.

**Status**: This glossary is normative and forms an integral part of the Geometric Consensus Protocol specification.
