# RFC XXXX: Geometric Normative Keywords for Multi-Context Consensus Decision Making

## Abstract

This specification extends RFC 2119's normative keywords (MUST, SHOULD, MAY, etc.) with explicit geometric consensus constraints represented by regular and semi-regular polyhedra across three visibility contexts: private/local, protected/remote, and public/shared. Each context uses different geometric families (Platonic solids for private, 4-polytopes for protected, Archimedean solids for public), providing mathematically distinct consensus thresholds appropriate to each sharing scope. This framework enables formal verification of decision validity through algebraic proofs and provides unambiguous consensus requirements for multi-level distributed systems.

## Status of This Memo

This document specifies a proposed standard for the Internet community, and requests discussion and suggestions for improvements.

## Copyright Notice

Copyright (C) 2025. All Rights Reserved.

---

## 1. Introduction

### 1.1. Motivation

RFC 2119 defines normative keywords (MUST, SHOULD, MAY) that indicate requirement levels in specifications. However, these keywords lack:
1. Explicit consensus thresholds for distributed decision-making
2. Contextual scoping for different visibility levels (private, protected, public)
3. Formal verification mechanisms for requirement satisfaction

This specification addresses these gaps by mapping normative keywords to geometric structures across three contexts:

- **Private/Local Context**: Platonic solids (3D regular polyhedra)
- **Protected/Remote Context**: Regular 4-polytopes (4D regular polytopes)
- **Public/Shared Context**: Archimedean solids (3D semi-regular polyhedra)

### 1.2. Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119, with the additional geometric and contextual constraints defined herein.

**Additional Terms:**

- **Decision Vertex**: A single criterion or factor in a multi-factor decision
- **Consensus Threshold**: The minimum proportion of vertices that must agree
- **Geometric Constraint**: The polyhedron/polytope that defines consensus rules
- **Visibility Context**: The scope of information sharing (private, protected, public)
- **Proof Certificate**: A compact algebraic proof that consensus is satisfied
- **Polytope**: A geometric object with flat sides (generalizes polyhedra to higher dimensions)

### 1.3. Visibility Contexts

This specification defines three visibility contexts with distinct geometric families:

#### 1.3.1. Private/Local Context
**Geometric Family**: Platonic Solids (5 regular convex polyhedra in 3D)

Used for: Internal decisions, single-node processing, local state management

| Polyhedron    | Schläfli | Vertices | Edges | Faces |
|---------------|----------|----------|-------|-------|
| Tetrahedron   | {3,3}    | 4        | 6     | 4     |
| Cube          | {4,3}    | 8        | 12    | 6     |
| Octahedron    | {3,4}    | 6        | 12    | 8     |
| Dodecahedron  | {5,3}    | 20       | 30    | 12    |
| Icosahedron   | {3,5}    | 12       | 30    | 20    |

#### 1.3.2. Protected/Remote Context
**Geometric Family**: Regular 4-Polytopes (6 regular convex polytopes in 4D)

Used for: Cross-node coordination, federation boundaries, trusted subsystem communication

| Polytope      | Schläfli  | Vertices | Edges | Faces | Cells |
|---------------|-----------|----------|-------|-------|-------|
| 5-cell        | {3,3,3}   | 5        | 10    | 10    | 5     |
| 16-cell       | {3,3,4}   | 8        | 24    | 32    | 16    |
| 8-cell        | {4,3,3}   | 16       | 32    | 24    | 8     |
| 24-cell       | {3,4,3}   | 24       | 96    | 96    | 24    |
| 600-cell      | {3,3,5}   | 120      | 720   | 1200  | 600   |
| 120-cell      | {5,3,3}   | 600      | 1200  | 720   | 120   |

#### 1.3.3. Public/Shared Context
**Geometric Family**: Archimedean Solids (13 semi-regular convex polyhedra in 3D)

Used for: Public APIs, open protocols, multi-organization coordination

| Solid                      | Vertices | Edges | Faces | Vertex Config |
|----------------------------|----------|-------|-------|---------------|
| Truncated Tetrahedron      | 12       | 18    | 8     | (3,6,6)       |
| Cuboctahedron              | 12       | 24    | 14    | (3,4,3,4)     |
| Truncated Cube             | 24       | 36    | 14    | (3,8,8)       |
| Truncated Octahedron       | 24       | 36    | 14    | (4,6,6)       |
| Rhombicuboctahedron        | 24       | 48    | 26    | (3,4,4,4)     |
| Truncated Cuboctahedron    | 48       | 72    | 26    | (4,6,8)       |
| Snub Cube                  | 24       | 60    | 38    | (3,3,3,3,4)   |
| Icosidodecahedron          | 30       | 60    | 32    | (3,5,3,5)     |
| Truncated Dodecahedron     | 60       | 90    | 32    | (3,10,10)     |
| Truncated Icosahedron      | 60       | 90    | 32    | (5,6,6)       |
| Rhombicosidodecahedron     | 60       | 120   | 62    | (3,4,5,4)     |
| Truncated Icosidodecahedron| 120      | 180   | 62    | (4,6,10)      |
| Snub Dodecahedron          | 60       | 150   | 92    | (3,3,3,3,5)   |

---

## 2. Context-Specific Normative Keywords

### 2.1. Private/Local Context (Platonic Solids)

Used for decisions that remain within a single node, process, or organizational boundary.

#### 2.1.1. MUST_LOCAL (Tetrahedron)
**Geometric Constraint**: Regular Tetrahedron  
**Schläfli Symbol**: {3,3}  
**Vertices**: 4  
**Consensus Required**: 4/4 (100%)  
**Context**: Private/Local

**Definition**: All local decision vertices must unanimously agree.

**Example**:
```yaml
requirement: "MUST_LOCAL validate input before processing"
context: private
decision_vertices:
  vertex_1: type_correctness
  vertex_2: range_validity
  vertex_3: schema_conformance
  vertex_4: sanitization_complete
consensus: 4/4 (100%)
```

#### 2.1.2. SHOULD_LOCAL (Octahedron)
**Geometric Constraint**: Regular Octahedron  
**Schläfli Symbol**: {3,4}  
**Vertices**: 6  
**Consensus Required**: 5/6 (83.3%)  
**Context**: Private/Local

**Example**:
```yaml
requirement: "SHOULD_LOCAL cache computation results"
context: private
decision_vertices: [memory_available, cpu_benefit, cache_hit_rate, 
                    eviction_policy, coherency_simple, access_pattern]
consensus: 5/6 (83.3%)
```

#### 2.1.3. MAY_LOCAL (Cube)
**Geometric Constraint**: Regular Cube  
**Schläfli Symbol**: {4,3}  
**Vertices**: 8  
**Consensus Required**: 4/8 (50%)  
**Context**: Private/Local

#### 2.1.4. MUST_NOT_LOCAL (Dodecahedron)
**Geometric Constraint**: Regular Dodecahedron  
**Schläfli Symbol**: {5,3}  
**Vertices**: 20  
**Consensus Required**: 18/20 (90%)  
**Context**: Private/Local

#### 2.1.5. RECOMMENDED_LOCAL (Icosahedron)
**Geometric Constraint**: Regular Icosahedron  
**Schläfli Symbol**: {3,5}  
**Vertices**: 12  
**Consensus Required**: 10/12 (83.3%)  
**Context**: Private/Local

---

### 2.2. Protected/Remote Context (4-Polytopes)

Used for decisions crossing trust boundaries but within controlled federation.

#### 2.2.1. MUST_PROTECTED (5-cell)
**Geometric Constraint**: Regular 5-cell (4-simplex)  
**Schläfli Symbol**: {3,3,3}  
**Vertices**: 5  
**Consensus Required**: 5/5 (100%)  
**Context**: Protected/Remote

**Definition**: All nodes in a federated cluster must unanimously agree. The 5-cell is the 4D analog of the tetrahedron.

**Example**:
```yaml
requirement: "MUST_PROTECTED authenticate federation partner"
context: protected
decision_vertices:
  vertex_1: certificate_validity
  vertex_2: trust_anchor_verification
  vertex_3: revocation_check
  vertex_4: policy_compliance
  vertex_5: temporal_validity
consensus: 5/5 (100%)
```

#### 2.2.2. SHOULD_PROTECTED (24-cell)
**Geometric Constraint**: Regular 24-cell  
**Schläfli Symbol**: {3,4,3}  
**Vertices**: 24  
**Consensus Required**: 20/24 (83.3%)  
**Context**: Protected/Remote

**Definition**: Strong supermajority across federated nodes. The 24-cell is unique to 4D and self-dual.

**Example**:
```yaml
requirement: "SHOULD_PROTECTED replicate state across cluster"
context: protected
decision_vertices: [24 cluster nodes]
consensus: 20/24 (83.3%)
rationale: "Tolerates up to 4 node failures while maintaining consensus"
```

#### 2.2.3. MAY_PROTECTED (8-cell / Tesseract)
**Geometric Constraint**: Regular 8-cell (hypercube)  
**Schläfli Symbol**: {4,3,3}  
**Vertices**: 16  
**Consensus Required**: 8/16 (50%)  
**Context**: Protected/Remote

**Definition**: Simple majority across federated nodes. The 8-cell is the 4D analog of the cube.

#### 2.2.4. RECOMMENDED_PROTECTED (16-cell)
**Geometric Constraint**: Regular 16-cell (4-orthoplex)  
**Schläfli Symbol**: {3,3,4}  
**Vertices**: 8  
**Consensus Required**: 7/8 (87.5%)  
**Context**: Protected/Remote

**Definition**: Very strong supermajority. The 16-cell is the 4D analog of the octahedron.

#### 2.2.5. MUST_NOT_PROTECTED (600-cell)
**Geometric Constraint**: Regular 600-cell  
**Schläfli Symbol**: {3,3,5}  
**Vertices**: 120  
**Consensus Required**: 108/120 (90%)  
**Context**: Protected/Remote

**Definition**: Extremely strong prohibition across large federation. The 600-cell has the maximum vertices among non-trivial 4-polytopes.

---

### 2.3. Public/Shared Context (Archimedean Solids)

Used for decisions visible to external parties, public protocols, open standards.

#### 2.3.1. MUST_PUBLIC (Truncated Tetrahedron)
**Geometric Constraint**: Truncated Tetrahedron  
**Vertices**: 12  
**Consensus Required**: 12/12 (100%)  
**Context**: Public/Shared

**Definition**: Unanimous agreement across public stakeholders. Truncation adds vertices while preserving tetrahedral symmetry.

**Example**:
```yaml
requirement: "MUST_PUBLIC support TLS 1.3 for public APIs"
context: public
decision_vertices: [security_requirement, industry_standard, 
                    client_compatibility, cipher_suite_support,
                    certificate_validation, protocol_version,
                    handshake_correctness, encryption_strength,
                    forward_secrecy, authentication_method,
                    key_exchange_algorithm, compliance_mandate]
consensus: 12/12 (100%)
```

#### 2.3.2. SHOULD_PUBLIC (Cuboctahedron)
**Geometric Constraint**: Cuboctahedron  
**Vertices**: 12  
**Consensus Required**: 10/12 (83.3%)  
**Context**: Public/Shared

**Definition**: Strong supermajority for public recommendations. Combines cubic and octahedral symmetry.

#### 2.3.3. MAY_PUBLIC (Truncated Cube)
**Geometric Constraint**: Truncated Cube  
**Vertices**: 24  
**Consensus Required**: 12/24 (50%)  
**Context**: Public/Shared

#### 2.3.4. RECOMMENDED_PUBLIC (Icosidodecahedron)
**Geometric Constraint**: Icosidodecahedron  
**Vertices**: 30  
**Consensus Required**: 25/30 (83.3%)  
**Context**: Public/Shared

**Definition**: Strong recommendation for complex public protocols. Combines icosahedral and dodecahedral symmetry.

#### 2.3.5. MUST_NOT_PUBLIC (Truncated Icosidodecahedron)
**Geometric Constraint**: Truncated Icosidodecahedron  
**Vertices**: 120  
**Consensus Required**: 108/120 (90%)  
**Context**: Public/Shared

**Definition**: Very strong prohibition for public standards. Largest Archimedean solid provides maximum scrutiny.

**Example**:
```yaml
requirement: "MUST_NOT_PUBLIC expose internal database schema"
context: public
decision_vertices: [120 security/privacy/compliance criteria]
consensus: 108/120 (90%)
rationale: "Overwhelming consensus prohibits schema exposure"
```

---

## 3. Context Selection Guidelines

### 3.1. Private/Local Context

**Use Platonic Solids When:**
- Decision remains within a single process/node
- No network communication required
- Internal state management
- Single-organization scope
- Local validation and computation

**Examples:**
- Input validation
- Local caching decisions
- Memory management
- Thread synchronization
- Internal data structures

### 3.2. Protected/Remote Context

**Use 4-Polytopes When:**
- Decision crosses trust boundaries within federation
- Coordination between known, authenticated nodes
- Cluster consensus mechanisms
- Inter-service communication within organization
- Trusted subsystem interaction

**Examples:**
- Distributed consensus (Raft, Paxos)
- Federation authentication
- Cross-datacenter replication
- Service mesh policies
- Internal API contracts

### 3.3. Public/Shared Context

**Use Archimedean Solids When:**
- Decision affects external parties
- Public API or protocol specification
- Multi-organization coordination
- Open standard compliance
- External visibility required

**Examples:**
- REST API specifications
- Public protocol definitions (HTTP, TLS)
- Open standards compliance
- Multi-vendor interoperability
- Public-facing security policies

---

## 4. Bipartite Algebraic Proof System

### 4.1. Context-Aware Proof Structure

The proof system extends to three partitions:

**Left Partition (Geometric Constraints by Context):**
```
Private:    {Tetrahedron, Cube, Octahedron, Dodecahedron, Icosahedron}
Protected:  {5-cell, 8-cell, 16-cell, 24-cell, 600-cell, 120-cell}
Public:     {Truncated Tetrahedron, Cuboctahedron, Truncated Cube, ...}
```

**Middle Partition (Algebraic Laws):**
```
Unanimity:           |A| = |V|
Strong Supermajority: |A| ≥ 0.833|V|
Supermajority:       |A| ≥ 0.875|V|
Simple Majority:     |A| ≥ 0.5|V|
Near-Unanimity:      |A| ≥ 0.9|V|
```

**Right Partition (Concrete Decisions with Context):**
```
{requirement, context, vertices, consensus}
```

### 4.2. Context-Aware Certificate Format

```
Certificate := {
  requirement: string,
  context: "private" | "protected" | "public",
  normative_keyword: string,
  geometric_constraint: {
    name: string,
    dimension: 3 | 4,
    vertices: number,
    family: "platonic" | "4-polytope" | "archimedean"
  },
  decision_vertices: [DecisionVertex],
  consensus: {
    agrees: number,
    required: number,
    percentage: number
  },
  algebraic_law: string,
  valid: boolean,
  proof: string,
  context_justification: string
}
```

### 4.3. Verification Algorithm (Context-Aware)

```
Algorithm: VerifyContextualRequirement(requirement, context, vertices)

1. Identify normative keyword (e.g., MUST_PROTECTED)
2. Extract context from keyword suffix or specification
3. Select geometric constraint family based on context:
   - private → Platonic solid
   - protected → 4-polytope
   - public → Archimedean solid
4. Select specific polyhedron/polytope from normative keyword
5. Assert: |vertices| = expected_vertex_count(constraint)
6. Count agreements: agrees_count = |{v ∈ vertices : agrees(v)}|
7. Retrieve threshold: threshold = consensus_threshold(constraint)
8. Verify: agrees_count ≥ threshold
9. Verify context appropriateness: context matches visibility scope
10. Generate proof certificate with context justification
11. Return valid/invalid with certificate
```

---

## 5. Formal Semantics with Context

### 5.1. Context Function

Define a context function that maps requirements to visibility contexts:

```
context: Requirement → {private, protected, public}
```

### 5.2. Geometric Constraint Function (Context-Aware)

```
geometric_constraint: (NormativeKeyword, Context) → Polyhedron ∪ Polytope

For context = private:
  geometric_constraint(MUST_LOCAL, private) = Tetrahedron
  geometric_constraint(SHOULD_LOCAL, private) = Octahedron
  geometric_constraint(MAY_LOCAL, private) = Cube
  ...

For context = protected:
  geometric_constraint(MUST_PROTECTED, protected) = 5-cell
  geometric_constraint(SHOULD_PROTECTED, protected) = 24-cell
  geometric_constraint(MAY_PROTECTED, protected) = 8-cell
  ...

For context = public:
  geometric_constraint(MUST_PUBLIC, public) = Truncated Tetrahedron
  geometric_constraint(SHOULD_PUBLIC, public) = Cuboctahedron
  geometric_constraint(MAY_PUBLIC, public) = Truncated Cube
  ...
```

### 5.3. Context-Aware Validity Predicate

A requirement R with normative keyword K in context C is valid if and only if:

```
valid(R, K, C, V) ⟺ 
  context(R) = C ∧
  |V| = vertex_count(geometric_constraint(K, C)) ∧
  |A| ≥ threshold(geometric_constraint(K, C)) ∧
  context_appropriate(R, C)
```

Where `context_appropriate` verifies that the visibility context matches the actual usage scope.

---

## 6. Dimensional Interpretation

### 6.1. Why 3D for Private?

Platonic solids exist in 3D space, representing decisions that can be fully visualized and understood within a single local scope. The three dimensions metaphorically represent:
- Dimension 1: Internal correctness
- Dimension 2: Resource constraints
- Dimension 3: Performance characteristics

### 6.2. Why 4D for Protected?

4-polytopes require an additional dimension, representing the complexity of coordinating across multiple nodes. The four dimensions metaphorically represent:
- Dimension 1: Internal correctness
- Dimension 2: Resource constraints  
- Dimension 3: Performance characteristics
- Dimension 4: **Trust/Federation coordination**

The additional dimension captures the federated nature of protected contexts.

### 6.3. Why Semi-Regular for Public?

Archimedean solids are semi-regular (vertex-transitive but not face-transitive), representing the heterogeneous nature of public stakeholders. Different faces represent different stakeholder types, but all vertices (decision criteria) are equivalent under the symmetry group.

---

## 7. Security Considerations

### 7.1. Context Downgrade Attacks

An attacker might attempt to reclassify a public requirement as private to reduce the consensus threshold. Implementations MUST ensure:

- Context is cryptographically bound to requirements
- Context changes require re-approval under new threshold
- Audit logs track context modifications

### 7.2. Vertex Count Manipulation

Since different contexts use different vertex counts, an attacker might:
- Add spurious vertices to inflate agreement
- Remove critical vertices to lower threshold
- Correlate vertices across contexts

Mitigations:
- Lock vertex definitions at requirement publication
- Validate vertex count matches geometric constraint exactly
- Audit vertex independence within and across contexts

### 7.3. Context Confusion

Implementations MUST clearly distinguish between contexts to prevent:
- Applying private consensus rules to public requirements
- Accepting protected decisions in public contexts
- Leaking private decision details into public proofs

---

## 8. Implementation Guidelines

### 8.1. Context Declaration

Every requirement MUST explicitly declare its context:

```yaml
requirement:
  text: "Validate cryptographic signatures"
  context: "protected"  # MUST be explicit
  normative_keyword: "MUST_PROTECTED"
  geometric_constraint: "5-cell"
```

### 8.2. Tooling Support for Higher Dimensions

Implementations SHOULD provide tools for:

- **4D Visualization**: Projecting 4-polytopes to 3D for human understanding
- **Context Validation**: Verifying context matches actual usage scope  
- **Cross-Context Analysis**: Detecting requirements spanning multiple contexts
- **Dimensional Consistency**: Ensuring vertex count matches polytope dimension

### 8.3. Migration Between Contexts

When requirements change visibility context:

1. **Identify new context** (private→protected→public)
2. **Select new geometric constraint** from target context family
3. **Redefine vertices** to match new vertex count
4. **Re-evaluate consensus** under new threshold
5. **Generate new proof certificate** with migration justification
6. **Archive old certificate** for audit trail

---

## 9. IANA Considerations

This document requires no IANA actions.

---

## 10. References

### 10.1. Normative References

**[RFC2119]** Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997.

### 10.2. Informative References

**[COXETER]** Coxeter, H.S.M., "Regular Polytopes", Dover Publications, 1973.

**[4POLYTOPE]** Coxeter, H.S.M., "Regular and Semi-Regular Polytopes I-III", Mathematische Zeitschrift, 1940-1988.

**[ARCHIMEDEAN]** Cromwell, P., "Polyhedra", Cambridge University Press, 1997.

**[CONSENSUS]** Lamport, L., "The Part-Time Parliament", ACM Transactions on Computer Systems, 1998.

---

## Appendix A. Complete Geometric Reference Tables

### A.1. Private Context (Platonic Solids)

| Keyword             | Solid        | Vertices | Threshold | Percentage |
|---------------------|--------------|----------|-----------|------------|
| MUST_LOCAL          | Tetrahedron  | 4        | 4         | 100.0%     |
| SHOULD_LOCAL        | Octahedron   | 6        | 5         | 83.3%      |
| MAY_LOCAL           | Cube         | 8        | 4         | 50.0%      |
| RECOMMENDED_LOCAL   | Icosahedron  | 12       | 10        | 83.3%      |
| MUST_NOT_LOCAL      | Dodecahedron | 20       | 18        | 90.0%      |

### A.2. Protected Context (4-Polytopes)

| Keyword                | Polytope  | Vertices | Threshold | Percentage |
|------------------------|-----------|----------|-----------|------------|
| MUST_PROTECTED         | 5-cell    | 5        | 5         | 100.0%     |
| RECOMMENDED_PROTECTED  | 16-cell   | 8        | 7         | 87.5%      |
| SHOULD_PROTECTED       | 24-cell   | 24       | 20        | 83.3%      |
| MAY_PROTECTED          | 8-cell    | 16       | 8         | 50.0%      |
| MUST_NOT_PROTECTED     | 600-cell  | 120      | 108       | 90.0%      |

### A.3. Public Context (Archimedean Solids)

| Keyword            | Solid                       | Vertices | Threshold | Percentage |
|--------------------|-----------------------------|----------|-----------|------------|
| MUST_PUBLIC        | Truncated Tetrahedron       | 12       | 12        | 100.0%     |
| SHOULD_PUBLIC      | Cuboctahedron               | 12       | 10        | 83.3%      |
| MAY_PUBLIC         | Truncated Cube              | 24       | 12        | 50.0%      |
| RECOMMENDED_PUBLIC | Icosidodecahedron           | 30       | 25        | 83.3%      |
| MUST_NOT_PUBLIC    | Truncated Icosidodecahedron | 120      | 108       | 90.0%      |

### A.4. Full Archimedean Catalog for Public Context

| Solid                       | Vertices | Use Case             | Threshold |
|-----------------------------|----------|----------------------|-----------|
| Truncated Tetrahedron       | 12       | MUST_PUBLIC          | 12/12     |
| Cuboctahedron               | 12       | SHOULD_PUBLIC        | 10/12     |
| Truncated Cube              | 24       | MAY_PUBLIC           | 12/24     |
| Truncated Octahedron        | 24       | Alternative MAY      | 12/24     |
| Rhombicuboctahedron         | 24       | Alternative MAY      | 12/24     |
| Truncated Cuboctahedron     | 48       | High-complexity MAY  | 24/48     |
| Snub Cube                   | 24       | Alternative MAY      | 12/24     |
| Icosidodecahedron           | 30       | RECOMMENDED_PUBLIC   | 25/30     |
| Truncated Dodecahedron      | 60       | High-complexity MUST | 60/60     |
| Truncated Icosahedron       | 60       | High-complexity MUST | 60/60     |
| Rhombicosidodecahedron      | 60       | Large-scale SHOULD   | 50/60     |
| Truncated Icosidodecahedron | 120      | MUST_NOT_PUBLIC      | 108/120   |
| Snub Dodecahedron           | 60       | Alternative SHOULD   | 50/60     |

---

## Appendix B. Complete Examples Across Contexts

### B.1. Private Context Example

```yaml
specification: "Local Cache Manager"
version: "1.0"

requirement:
  text: "Validate cache entry before insertion"
  level: MUST_LOCAL
  context: private
  geometric_constraint:
    name: "Tetrahedron"
    dimension: 3
    vertices: 4
    family: "platonic"
  decision_vertices:
    vertex_1:
      name: "key_valid"
      evaluation: "Cache key meets format requirements"
      state: agree
    vertex_2:
      name: "value_serializable"
      evaluation: "Value can be serialized to storage"
      state: agree
    vertex_3:
      name: "size_within_limit"
      evaluation: "Entry size does not exceed max"
      state: agree
    vertex_4:
      name: "ttl_reasonable"
      evaluation: "TTL is within acceptable range"
      state: agree
  consensus:
    required: 4
    actual: 4
    percentage: 100%
  proof_certificate:
    law: "unanimity"
    valid: true
    proof: "All 4 local vertices agree → tetrahedron satisfied → MUST_LOCAL met"
    context_justification: "Decision local to single node, no network coordination"
```

### B.2. Protected Context Example

```yaml
specification: "Federation Authentication Protocol"
version: "2.0"

requirement:
  text: "Verify federation partner identity"
  level: MUST_PROTECTED
  context: protected
  geometric_constraint:
    name: "5-cell"
    dimension: 4
    vertices: 5
    family: "4-polytope"
  decision_vertices:
    vertex_1: {name: "certificate_chain_valid", state: agree}
    vertex_2: {name: "trust_anchor_recognized", state: agree}
    vertex_3: {name: "revocation_status_current", state: agree}
    vertex_4: {name: "policy_requirements_met", state: agree}
    vertex_5: {name: "temporal_validity_confirmed", state: agree}
  consensus:
    required: 5
    actual: 5
    percentage: 100%
  proof_certificate:
    law: "unanimity"
    valid: true
    proof: "All 5 federated vertices agree → 5-cell satisfied → MUST_PROTECTED met"
    context_justification: "Decision crosses trust boundary within federation"
```

### B.3. Public Context Example

```yaml
specification: "Public REST API Standard"
version: "3.0"

requirement:
  text: "Support TLS 1.3 for all public endpoints"
  level: MUST_PUBLIC
  context: public
  geometric_constraint:
    name: "Truncated Tetrahedron"
    dimension: 3
    vertices: 12
    family: "archimedean"
  decision_vertices:
    vertex_1: {name: "security_requirement", state: agree}
    vertex_2: {name: "industry_standard", state: agree}
    vertex_3: {name: "browser_support", state: agree}
    vertex_4: {name: "cipher_suite_modern", state: agree}
    vertex_5: {name: "cert_validation_robust", state: agree}
    vertex_6: {name: "protocol_version_current", state: agree}
    vertex_7: {name: "handshake_optimized", state: agree}
    vertex_8: {name: "encryption_strength_adequate", state: agree}
    vertex_9: {name: "forward_secrecy_enabled", state: agree}
    vertex_10: {name: "authentication_mutual", state: agree}
    vertex_11: {name: "compliance_pci_dss", state: agree}
    vertex_12: {name: "interoperability_verified", state: agree}
  consensus:
    required: 12
    actual: 12
    percentage: 100%
  proof_certificate:
    law: "unanimity"
    valid: true
    proof: "All 12 public vertices agree → truncated tetrahedron satisfied → MUST_PUBLIC met"
    context_justification: "Decision affects external parties, requires public consensus"
```

---

## Appendix C. Dimensional Projections for 4-Polytopes

### C.1. Visualizing 4D Structures in 3D

Since 4-polytopes cannot be directly visualized, implementations SHOULD use these projection methods:

#### C.1.1. Stereographic Projection
Project the 4-polytope from 4D to 3D space, similar to how a 3D globe projects to a 2D map.

```
Example: 24-cell stereographic projection
- 24 vertices in 4D → 24 points in 3D
- 96 edges in 4D → 96 line segments in 3D
- Structure resembles a rhombic dodecahedron envelope
```

#### C.1.2. Schlegel Diagram
Project the polytope through one of its cells, creating a 3D diagram showing connectivity.

```
Example: 5-cell Schlegel diagram
- One tetrahedral cell becomes the "container"
- Other 4 cells nest inside it
- All vertex relationships preserved
```

#### C.1.3. Vertex-First Projection
Orient the polytope with a vertex pointing toward the viewer, project orthographically.

```
Example: 8-cell (tesseract) vertex-first
- Central vertex projects to origin
- Surrounding structure forms nested cubes
```

### C.2. Implementation Helper Functions

```python
def project_4d_to_3d(polytope_4d, method="stereographic"):
    """
    Project 4D polytope to 3D for visualization
    
    Args:
        polytope_4d: 4D polytope with vertices in R^4
        method: "stereographic", "schlegel", or "vertex_first"
    
    Returns:
        vertices_3d: Array of 3D coordinates
        edges_3d: List of edge pairs in 3D
    """
    if method == "stereographic":
        # Project from north pole of 4-sphere
        vertices_3d = stereographic_projection(polytope_4d.vertices)
    elif method == "schlegel":
        # Project through facet
        vertices_3d = schlegel_projection(polytope_4d)
    elif method == "vertex_first":
        # Orthographic projection with vertex alignment
        vertices_3d = vertex_first_projection(polytope_4d)
    
    return vertices_3d, polytope_4d.edges

def visualize_consensus_4d(polytope_name, vertex_states):
    """
    Visualize 4D consensus in 3D projection
    
    Args:
        polytope_name: "5-cell", "8-cell", "16-cell", "24-cell", etc.
        vertex_states: Dict mapping vertex_id to boolean (agrees/disagrees)
    
    Returns:
        3D visualization with colored vertices
    """
    polytope = get_4d_polytope(polytope_name)
    projection_3d = project_4d_to_3d(polytope)
    
    # Color vertices: green = agrees, red = disagrees
    colored_vertices = apply_vertex_colors(projection_3d, vertex_states)
    
    return render_3d(colored_vertices)
```

---

## Appendix D. Archimedean Solid Properties

### D.1. Vertex Configuration Notation

Archimedean solids are described by their vertex configuration, e.g., (3,6,6):
- Numbers represent polygon faces meeting at each vertex
- Order matters (reading clockwise around vertex)
- All vertices have the same configuration (vertex-transitive)

### D.2. Dual Relationships

Many Archimedean solids have Catalan solid duals:

| Archimedean Solid          | Catalan Dual              |
|----------------------------|---------------------------|
| Truncated Tetrahedron      | Triakis Tetrahedron       |
| Cuboctahedron              | Rhombic Dodecahedron      |
| Truncated Cube             | Triakis Octahedron        |
| Truncated Octahedron       | Tetrakis Hexahedron       |
| Rhombicuboctahedron        | Deltoidal Icositetrahedron|
| Icosidodecahedron          | Rhombic Triacontahedron   |

### D.3. Symmetry Groups

| Solid                  | Symmetry Group | Order |
|------------------------|----------------|-------|
| Truncated Tetrahedron  | Td             | 24    |
| Cuboctahedron          | Oh             | 48    |
| Truncated Cube         | Oh             | 48    |
| Icosidodecahedron      | Ih             | 120   |
| Snub Cube              | O              | 24    |
| Snub Dodecahedron      | I              | 60    |

---

## Appendix E. Context Migration Examples

### E.1. Private → Protected Migration

**Scenario**: Local cache decision becomes distributed cache decision

```yaml
# Before: Private Context
requirement_v1:
  text: "Cache computed results"
  level: MAY_LOCAL
  context: private
  vertices: 8  # Cube
  consensus: 4/8 (50%)

# After: Protected Context
requirement_v2:
  text: "Replicate cache across cluster nodes"
  level: MAY_PROTECTED
  context: protected
  vertices: 16  # 8-cell (tesseract)
  consensus: 8/16 (50%)
  migration:
    from_context: private
    rationale: "Cache now distributed across federation"
    vertex_mapping:
      # Original 8 vertices expanded to 16 federated vertices
      local_memory_available → [node_1_memory, node_2_memory, ...]
      local_cpu_benefit → [node_1_cpu, node_2_cpu, ...]
```

### E.2. Protected → Public Migration

**Scenario**: Internal API becomes public API

```yaml
# Before: Protected Context
requirement_v1:
  text: "Authenticate API requests"
  level: MUST_PROTECTED
  context: protected
  vertices: 5  # 5-cell
  consensus: 5/5 (100%)

# After: Public Context
requirement_v2:
  text: "Authenticate public API requests"
  level: MUST_PUBLIC
  context: public
  vertices: 12  # Truncated Tetrahedron
  consensus: 12/12 (100%)
  migration:
    from_context: protected
    rationale: "API now public, requires external stakeholder consensus"
    vertex_expansion:
      # Original 5 protected vertices expanded to 12 public vertices
      certificate_validity → [cert_valid, cert_unexpired, cert_trusted]
      trust_anchor → [ca_recognized, ca_unrevoked, ca_policy_match]
      revocation_check → [ocsp_current, crl_checked]
      policy_compliance → [rate_limit_met, quota_valid, terms_accepted]
      temporal_validity → [timestamp_fresh, replay_prevented]
```

---

## Appendix F. Proof Certificate Examples

### F.1. Private Context Certificate

```json
{
  "certificate_id": "cert_local_cache_001",
  "requirement": "Validate cache entry before insertion",
  "context": "private",
  "normative_keyword": "MUST_LOCAL",
  "geometric_constraint": {
    "name": "Tetrahedron",
    "schläfli": "{3,3}",
    "dimension": 3,
    "vertices": 4,
    "edges": 6,
    "faces": 4,
    "family": "platonic"
  },
  "decision_vertices": [
    {"id": 1, "name": "key_valid", "state": "agree"},
    {"id": 2, "name": "value_serializable", "state": "agree"},
    {"id": 3, "name": "size_within_limit", "state": "agree"},
    {"id": 4, "name": "ttl_reasonable", "state": "agree"}
  ],
  "consensus": {
    "agrees": 4,
    "required": 4,
    "threshold": 1.0,
    "percentage": "100%"
  },
  "algebraic_law": "unanimity",
  "valid": true,
  "proof": "unanimous(V) ∧ |V| = 4 ∧ context(private) → valid(MUST_LOCAL)",
  "context_justification": "Decision confined to single node with no federation",
  "timestamp": "2025-10-20T12:34:56Z",
  "authority": "local-node-validator",
  "signature": "0x8f3a..."
}
```

### F.2. Protected Context Certificate

```json
{
  "certificate_id": "cert_federation_auth_002",
  "requirement": "Verify federation partner identity",
  "context": "protected",
  "normative_keyword": "MUST_PROTECTED",
  "geometric_constraint": {
    "name": "5-cell",
    "schläfli": "{3,3,3}",
    "dimension": 4,
    "vertices": 5,
    "edges": 10,
    "faces": 10,
    "cells": 5,
    "family": "4-polytope"
  },
  "decision_vertices": [
    {"id": 1, "name": "certificate_chain_valid", "state": "agree"},
    {"id": 2, "name": "trust_anchor_recognized", "state": "agree"},
    {"id": 3, "name": "revocation_status_current", "state": "agree"},
    {"id": 4, "name": "policy_requirements_met", "state": "agree"},
    {"id": 5, "name": "temporal_validity_confirmed", "state": "agree"}
  ],
  "consensus": {
    "agrees": 5,
    "required": 5,
    "threshold": 1.0,
    "percentage": "100%"
  },
  "algebraic_law": "unanimity",
  "valid": true,
  "proof": "unanimous(V) ∧ |V| = 5 ∧ context(protected) ∧ dimension(4) → valid(MUST_PROTECTED)",
  "context_justification": "Decision crosses trust boundary within authenticated federation",
  "federation_scope": "trusted-cluster-001",
  "timestamp": "2025-10-20T12:35:00Z",
  "authority": "federation-consensus-service",
  "signature": "0x7c2b..."
}
```

### F.3. Public Context Certificate

```json
{
  "certificate_id": "cert_public_api_tls_003",
  "requirement": "Support TLS 1.3 for all public endpoints",
  "context": "public",
  "normative_keyword": "MUST_PUBLIC",
  "geometric_constraint": {
    "name": "Truncated Tetrahedron",
    "vertex_config": "(3,6,6)",
    "dimension": 3,
    "vertices": 12,
    "edges": 18,
    "faces": 8,
    "family": "archimedean"
  },
  "decision_vertices": [
    {"id": 1, "name": "security_requirement", "state": "agree"},
    {"id": 2, "name": "industry_standard", "state": "agree"},
    {"id": 3, "name": "browser_support", "state": "agree"},
    {"id": 4, "name": "cipher_suite_modern", "state": "agree"},
    {"id": 5, "name": "cert_validation_robust", "state": "agree"},
    {"id": 6, "name": "protocol_version_current", "state": "agree"},
    {"id": 7, "name": "handshake_optimized", "state": "agree"},
    {"id": 8, "name": "encryption_strength_adequate", "state": "agree"},
    {"id": 9, "name": "forward_secrecy_enabled", "state": "agree"},
    {"id": 10, "name": "authentication_mutual", "state": "agree"},
    {"id": 11, "name": "compliance_pci_dss", "state": "agree"},
    {"id": 12, "name": "interoperability_verified", "state": "agree"}
  ],
  "consensus": {
    "agrees": 12,
    "required": 12,
    "threshold": 1.0,
    "percentage": "100%"
  },
  "algebraic_law": "unanimity",
  "valid": true,
  "proof": "unanimous(V) ∧ |V| = 12 ∧ context(public) ∧ family(archimedean) → valid(MUST_PUBLIC)",
  "context_justification": "Decision affects external parties and requires public consensus across diverse stakeholders",
  "public_scope": "global-internet-facing",
  "stakeholders": ["security_teams", "compliance_auditors", "client_applications", "standards_bodies"],
  "timestamp": "2025-10-20T12:35:30Z",
  "authority": "public-standards-consortium",
  "signature": "0x9d4e..."
}
```

---

## Appendix G. Complexity Analysis

### G.1. Verification Complexity by Context

| Context   | Geometric Family | Typical Vertices | Traditional | Algebraic | Speedup |
|-----------|------------------|------------------|-------------|-----------|---------|
| Private   | Platonic         | 4-20             | O(n³)       | O(1)      | n³      |
| Protected | 4-Polytope       | 5-120            | O(n⁴)       | O(1)      | n⁴      |
| Public    | Archimedean      | 12-120           | O(n³)       | O(1)      | n³      |

**Note**: Protected context has O(n⁴) traditional complexity due to the additional dimension requiring cross-node coordination checks.

### G.2. Certificate Generation Complexity

```
Operation: GenerateCertificate(requirement, vertices)

Time Complexity:
  1. Parse requirement: O(1)
  2. Identify context: O(1)
  3. Select polyhedron: O(1)
  4. Count vertex agreements: O(v) where v = vertex count
  5. Verify threshold: O(1)
  6. Generate proof string: O(1)
  7. Sign certificate: O(1) [using EdDSA or similar]
  
  Total: O(v)

Space Complexity:
  Certificate size: O(v) [storing v vertices]
  Signature: O(1) [constant size]
  
  Total: O(v)

Example for 24-cell:
  v = 24
  Time: O(24) = constant for practical purposes
  Space: ~2KB certificate size
```

### G.3. Cross-Context Verification

When a requirement spans multiple contexts:

```
CrossContextVerify(requirement):
  for each context in [private, protected, public]:
    if requirement.affects(context):
      cert = VerifyInContext(requirement, context)
      if not cert.valid:
        return invalid
  return valid

Complexity: O(k × v_max) where k = number of contexts (≤ 3)
Practical: O(v_max) since k is constant
```

---

## Appendix H. Tool Implementation Reference

### H.1. Command-Line Interface

```bash
# Verify a requirement against its geometric constraint
$ geom-verify --requirement req.yaml --context private

Verification Result:
  Requirement: "Validate cache entry before insertion"
  Context: private
  Constraint: Tetrahedron (4 vertices)
  Consensus: 4/4 (100%)
  Valid: ✓ YES
  
  Certificate ID: cert_local_cache_001
  Proof: unanimous(V) ∧ |V| = 4 → valid(MUST_LOCAL)

# Generate certificate
$ geom-cert --requirement req.yaml --output cert.json --sign

Certificate generated: cert.json
Signed with: local-node-validator
Signature: 0x8f3a...

# Visualize 4D polytope
$ geom-viz --polytope 24-cell --projection stereographic --output 24cell.stl

Projecting 24-cell to 3D...
Method: Stereographic projection
Output: 24cell.stl (3D mesh)
Vertices: 24
Edges: 96
```

### H.2. Library API (Python)

```python
from geom_consensus import (
    Requirement, Context, verify, generate_certificate,
    project_4d, visualize_polytope
)

# Define requirement
req = Requirement(
    text="Verify federation partner identity",
    context=Context.PROTECTED,
    keyword="MUST_PROTECTED",
    vertices=[
        Vertex("certificate_chain_valid", agrees=True),
        Vertex("trust_anchor_recognized", agrees=True),
        Vertex("revocation_status_current", agrees=True),
        Vertex("policy_requirements_met", agrees=True),
        Vertex("temporal_validity_confirmed", agrees=True)
    ]
)

# Verify requirement
result = verify(req)
print(f"Valid: {result.valid}")
print(f"Proof: {result.proof}")

# Generate certificate
cert = generate_certificate(req, authority="federation-service")
cert.save("cert.json")
cert.sign(private_key)

# Visualize 4D polytope
polytope_3d = project_4d("5-cell", method="stereographic")
visualize_polytope(polytope_3d, vertex_states=req.vertex_states())
```

### H.3. Web API

```http
POST /api/v1/verify
Content-Type: application/json

{
  "requirement": {
    "text": "Verify federation partner identity",
    "context": "protected",
    "keyword": "MUST_PROTECTED",
    "vertices": [
      {"name": "certificate_chain_valid", "state": "agree"},
      {"name": "trust_anchor_recognized", "state": "agree"},
      {"name": "revocation_status_current", "state": "agree"},
      {"name": "policy_requirements_met", "state": "agree"},
      {"name": "temporal_validity_confirmed", "state": "agree"}
    ]
  }
}

Response 200 OK:
{
  "valid": true,
  "certificate_id": "cert_federation_auth_002",
  "consensus": {
    "agrees": 5,
    "required": 5,
    "percentage": "100%"
  },
  "proof": "unanimous(V) ∧ |V| = 5 → valid(MUST_PROTECTED)",
  "geometric_constraint": {
    "name": "5-cell",
    "dimension": 4,
    "vertices": 5
  }
}
```

---

## Appendix I. Future Extensions

### I.1. Higher-Dimensional Polytopes (n > 4)

Future versions MAY extend to higher dimensions for extremely complex distributed systems:

- **5D Polytopes**: For multi-federation coordination
- **6D+ Polytopes**: For global-scale consensus

However, visualization and human comprehension become prohibitively difficult beyond 4D.

### I.2. Non-Convex Polyhedra

Future versions MAY incorporate:
- **Kepler-Poinsot Solids**: Star polyhedra for adversarial consensus
- **Johnson Solids**: For irregular vertex counts
- **Deltahedra**: For triangular-face constraints

### I.3. Dynamic Consensus Thresholds

Future versions MAY support:
- **Adaptive Thresholds**: Thresholds that adjust based on network conditions
- **Probabilistic Consensus**: Using fuzzy polytope boundaries
- **Time-Variant Geometry**: Morphing between polytopes over time

---

## Appendix J. Glossary

**4-Polytope**: A four-dimensional polytope; the 4D analog of a polyhedron

**Algebraic Law**: A mathematical property (unanimity, majority, etc.) that enables proof verification

**Archimedean Solid**: A convex polyhedron with regular polygon faces and identical vertices (vertex-transitive)

**Bipartite Proof System**: A verification framework with geometric constraints on one side and decisions on the other

**Context**: The visibility scope of a decision (private, protected, public)

**Decision Vertex**: A criterion or factor in a multi-factor consensus decision

**Geometric Constraint**: A polyhedron or polytope whose structure defines consensus rules

**Platonic Solid**: One of five regular convex polyhedra (tetrahedron, cube, octahedron, dodecahedron, icosahedron)

**Proof Certificate**: A compact cryptographic attestation that a requirement is satisfied

**Schläfli Symbol**: Notation describing regular polytopes, e.g., {3,3} for tetrahedron

**Vertex-Transitive**: A property where all vertices are equivalent under the symmetry group

---

**Author's Address:**

Brian Thorne  
Universal Life Protocol
Email: bthornemial@gmail.com

---

**End of RFC XXXX: Geometric Normative Keywords for Multi-Context Consensus Decision Making**
