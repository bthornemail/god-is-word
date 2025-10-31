# Domain-Typed Semantic Extensions

## 1. Motivation

The base specification defines two fundamental types:
- **Monad (M):** Container/wrapper types
- **Functor (F):** Transformation types

However, real semantic systems need **domain-specific refinements**. For example:
- In **core grammar**: Subject ≠ Object (both are Monad, but different roles)
- In **category theory**: Object ≠ Morphism (different mathematical structures)
- In **federated identity**: User ≠ Credential (different security contexts)

**Solution:** Introduce **domain labels** as type refinements: `M_X`, `F_Y`, etc.

---

## 2. Extended Type System

### 2.1 Domain-Labeled Types

**Definition:** A **domain-labeled type** is a tuple `(BaseType, DomainLabel)`.

**Notation:**
- `M_X` or `MX`: Monad with domain label X
- `F_Y` or `FY`: Functor with domain label Y

**Constraint:** Domain labels form a lattice with partial ordering `≤_domain`.

### 2.2 Base Type Hierarchy

```
Type ::= M | F
DomainLabel ::= X | Y | Z | ...
DomainType ::= Type_DomainLabel

Example:
- M_Subject (subject monad)
- F_Predicate (predicate functor)
- M_Object (object monad)
- F_Modality (modality functor)
```

### 2.3 Extended Tetrahedron Structure

**Original (Base):**
```typescript
[subject: M, predicate: F, object: M, modality?: F]
```

**Extended (Domain-Typed):**
```typescript
[subject: M_X, predicate: F_Y, object: M_X, modality?: F_Y]
```

**Constraint:** Domain labels must be **coherent** within a tetrahedron:
- Subjects and objects share domain: `X`
- Predicates and modalities share domain: `Y`
- Cross-domain relationships require explicit mappings

---

## 3. Domain Ontology

### 3.1 Core Domains

**Definition:** A **domain** is a triple `(Subjects, Objects, Predicates)`.

```typescript
type Domain = {
  name: string;
  subjects: Set<string>;
  objects: Set<string>;
  predicates: Set<string>;
}
```

### 3.2 Standard Domain Catalog

#### 3.2.1 Core Domain (X = CORE)

```typescript
const CORE: Domain = {
  name: "core",
  subjects: [
    "subject", "object", "predicate", "modality", 
    "statement", "domain"
  ],
  objects: [
    "subject", "object", "predicate", "modality", 
    "statement", "domain", "relation"
  ],
  predicates: [
    "is", "has", "contains", "relates", "defines", 
    "constrains", "validates"
  ]
};
```

**Geometric Embedding:** Core domain elements map to specific 600-cell vertices.

#### 3.2.2 Meta Domain (Y = META)

```typescript
const META: Domain = {
  name: "meta",
  subjects: [
    "ontology", "domain", "vocabulary", "schema"
  ],
  objects: [
    "structure", "constraint", "rule", "mapping"
  ],
  predicates: [
    "describe", "validate", "transform", "compose", 
    "extend", "merge", "partition"
  ]
};
```

**Role:** Meta domain describes the structure of other domains.

#### 3.2.3 Logic Domain (Z = LOGIC)

```typescript
const LOGIC: Domain = {
  name: "logic",
  subjects: [
    "proposition", "statement", "clause", "formula"
  ],
  objects: [
    "truth_value", "condition", "consequence", "axiom"
  ],
  predicates: [
    "imply", "negate", "conjoin", "disjoin", 
    "quantify", "prove", "satisfy"
  ]
};
```

#### 3.2.4 Temporal Domain (T = TEMPORAL)

```typescript
const TEMPORAL: Domain = {
  name: "temporal",
  subjects: [
    "event", "state", "process", "transition"
  ],
  objects: [
    "moment", "interval", "sequence", "duration"
  ],
  predicates: [
    "precede", "follow", "during", "overlap", 
    "cause", "trigger", "persist"
  ]
};
```

#### 3.2.5 Grammar Domain (G = GRAMMAR)

```typescript
const CORE_GRAMMAR: Domain = {
  name: "core_grammar",
  subjects: [
    "I", "you", "he", "she", "it", "we", "they"
  ],
  objects: [
    "me", "you", "him", "her", "it", "us", "them"
  ],
  predicates: [
    "be", "appear", "seem", "become", "feel", "look", 
    "sound", "smell", "taste", "remain", "grow", "turn", 
    "stay", "have", "do", "can", "will", "run", "eat", 
    "see", "know"
  ]
};
```

#### 3.2.6 Category Theory Domain (C = CATEGORY)

```typescript
const CATEGORY: Domain = {
  name: "category",
  subjects: [
    "object", "morphism", "functor", "natural_transformation"
  ],
  objects: [
    "object", "morphism", "category", "diagram"
  ],
  predicates: [
    "objectify", "morph", "compose", "functorize", 
    "naturalize", "map", "transform"
  ]
};
```

#### 3.2.7 Geometry Domain (Geo = GEOMETRY)

```typescript
const GEOMETRY: Domain = {
  name: "geometry",
  subjects: [
    "point", "line", "shape", "manifold"
  ],
  objects: [
    "point", "line", "plane", "axis", "space"
  ],
  predicates: [
    "point", "line", "intersect", "project", "rotate", 
    "reflect", "transform", "embed"
  ]
};
```

#### 3.2.8 Computational Domain (Comp = COMPUTATIONAL)

```typescript
const COMPUTATIONAL: Domain = {
  name: "computational",
  subjects: [
    "algorithm", "program", "process", "machine"
  ],
  objects: [
    "output", "state", "result", "data"
  ],
  predicates: [
    "compute", "evaluate", "iterate", "recurse", 
    "decide", "simulate", "optimize", "compile"
  ]
};
```

#### 3.2.9 Identity Domain (ID = IDENTITY)

```typescript
const FEDERATED_IDENTITY: Domain = {
  name: "federated_identity",
  subjects: [
    "user", "service", "identity_provider", "relying_party", 
    "device", "application", "token"
  ],
  objects: [
    "credential", "profile", "claim", "permission", 
    "session", "key", "certificate"
  ],
  predicates: [
    "authenticate", "authorize", "validate", "issue", 
    "verify", "delegate", "revoke", "sign", "encrypt", 
    "decrypt", "claim", "link", "synchronize"
  ]
};
```

#### 3.2.10 Networking Domain (Net = NETWORKING)

```typescript
const NETWORKING_MESSAGING: Domain = {
  name: "networking_messaging",
  subjects: [
    "client", "server", "node", "peer", "broker", 
    "endpoint", "process"
  ],
  objects: [
    "packet", "message", "request", "response", 
    "stream", "channel", "topic"
  ],
  predicates: [
    "send", "receive", "connect", "disconnect", 
    "route", "forward", "broadcast", "subscribe", 
    "publish", "encrypt", "decrypt", "acknowledge", 
    "queue", "process"
  ]
};
```

---

## 4. Modality Extensions

### 4.1 Base Modalities

**Definition:** Modalities refine the **certainty** and **accessibility** of semantic relationships.

```typescript
enum Modality {
  // Epistemic (knowledge)
  CERTAIN = "certain",
  UNCERTAIN = "uncertain",
  HIDDEN = "hidden",
  UNKNOWN = "unknown",
  
  // Alethic (possibility)
  POSSIBLE = "possible",
  NECESSARY = "necessary",
  CONTINGENT = "contingent",
  IMPOSSIBLE = "impossible"
}
```

### 4.2 Modal Operators on Domain Types

**Notation:** `□M_X` (necessarily M_X), `◇M_X` (possibly M_X)

**Geometric Interpretation:** Modalities correspond to **distance from the key vertex** in projective space.

| Modality | Distance | Interpretation |
|----------|----------|----------------|
| CERTAIN | 0 | At the key (absolute truth) |
| POSSIBLE | 1-2 | Adjacent vertices |
| CONTINGENT | 3-4 | Medial vertices |
| IMPOSSIBLE | ∞ | At projective infinity |

---

## 5. Cross-Domain Mappings

### 5.1 Domain Morphisms

**Definition:** A **domain morphism** is a structure-preserving map between domains.

```typescript
type DomainMorphism = {
  source: Domain;
  target: Domain;
  subject_map: Map<string, string>;
  object_map: Map<string, string>;
  predicate_map: Map<string, string>;
}
```

**Example: CORE → CATEGORY**
```typescript
const CORE_TO_CATEGORY: DomainMorphism = {
  source: CORE,
  target: CATEGORY,
  subject_map: {
    "subject": "object",
    "predicate": "morphism",
    "statement": "diagram"
  },
  object_map: {
    "object": "object",
    "relation": "morphism"
  },
  predicate_map: {
    "relates": "morph",
    "defines": "objectify"
  }
};
```

### 5.2 Functor Between Domains

**Geometric Realization:** A domain morphism is realized as a **Spin(4) rotor** that maps tetrahedra in domain X to tetrahedra in domain Y.

**Validation:** Cross-domain transitions must:
1. Preserve the Fano incidence structure
2. Preserve deltoid area (up to domain-specific tolerance)
3. Have a valid domain morphism

---

## 6. Implementation: Extended Data Types

### 6.1 Domain-Labeled Vertex

```typescript
interface DomainVertex extends Vertex {
  domain_label: string;  // e.g., "CORE", "META", "GRAMMAR"
  role: "subject" | "object" | "predicate" | "modality";
}
```

**JSON Serialization:**
```json
{
  "type": "DomainVertex",
  "coords": [0.5, 0.5, 0.5, 0.5],
  "type_label": "MONAD",
  "domain_label": "CORE",
  "role": "subject",
  "semantic_value": "dog"
}
```

### 6.2 Domain-Typed Pentachoron

```typescript
interface DomainPentachoron extends Pentachoron {
  subject: DomainVertex;      // M_X
  predicate: DomainVertex;    // F_Y
  object?: DomainVertex;      // M_X
  modality?: DomainVertex;    // F_Y
  domain_context: string;     // Primary domain (X)
  meta_domain: string;        // Secondary domain (Y)
}
```

**Example:**
```typescript
const grammar_statement: DomainPentachoron = {
  subject: {
    coords: [...],
    type_label: "MONAD",
    domain_label: "GRAMMAR",
    role: "subject",
    semantic_value: "I"
  },
  predicate: {
    coords: [...],
    type_label: "FUNCTOR",
    domain_label: "GRAMMAR",
    role: "predicate",
    semantic_value: "see"
  },
  object: {
    coords: [...],
    type_label: "MONAD",
    domain_label: "GRAMMAR",
    role: "object",
    semantic_value: "you"
  },
  modality: {
    coords: [...],
    type_label: "FUNCTOR",
    domain_label: "META",
    role: "modality",
    semantic_value: "certain"
  },
  domain_context: "GRAMMAR",
  meta_domain: "META",
  key: {...}
};
```

---

## 7. Advanced Patterns

### 7.1 REPL Pattern (Read-Eval-Print-Loop)

```typescript
interface REPLStructure {
  read: DomainVertex;     // M_X (input domain)
  eval: DomainVertex;     // F_Y (transformation)
  print: DomainVertex;    // M_X (output domain)
  loop: DomainVertex;     // F_Y (continuation)
  core: DomainVertex;     // M_X (state)
  meta: DomainVertex;     // F_Y | F_M (reflection)
}
```

**Geometric Interpretation:** REPL is a **6-cell** (hexachoron) with alternating M/F types.

### 7.2 Core-Meta Duality

```typescript
interface CoreMetaStructure {
  subjects: Set<DomainVertex>;    // M_CORE
  predicates: Set<DomainVertex>;  // F_META
  objects: Set<DomainVertex>;     // M_CORE
}

interface MetaCoreStructure {
  modalities: Set<DomainVertex>;  // F_META
  core: Set<DomainVertex>;        // M_CORE
  meta: Set<DomainVertex>;        // F_META
}
```

**Duality:** `CoreMeta ⊗ MetaCore ≅ Identity`

This represents the **self-referential closure** of the system: the meta-level describes the core, and the core instantiates the meta.

---

## 8. Validation Extensions

### 8.1 Domain Consistency Check

**Additional Tier:** Tier 9 - Domain Coherence

```python
def validate_domain_coherence(p: DomainPentachoron) -> bool:
    """
    Verify domain labels are coherent.
    """
    # Subject and object must share domain
    if p.object and p.subject.domain_label != p.object.domain_label:
        return False
    
    # Predicate and modality may differ (cross-domain)
    # but must have valid morphism
    if p.modality:
        morphism = get_domain_morphism(
            p.predicate.domain_label,
            p.modality.domain_label
        )
        if not morphism:
            return False
    
    return True
```

### 8.2 Domain-Specific Tolerances

```python
DOMAIN_TOLERANCES = {
    "CORE": 1.0e-6,
    "META": 1.0e-5,      # Meta allows more flexibility
    "GRAMMAR": 1.0e-7,   # Grammar is strict
    "LOGIC": 1.0e-8,     # Logic is strictest
    "TEMPORAL": 1.0e-4,  # Temporal is fuzzy
}

def get_tolerance(domain: str) -> float:
    return DOMAIN_TOLERANCES.get(domain, 1.0e-6)
```

---

## 9. Semantic Grounding

### 9.1 Lexicon Mapping

**Problem:** Map natural language words to 600-cell vertices.

**Solution:** Define a **semantic lexicon** for each domain.

```typescript
type SemanticLexicon = Map<string, DomainVertex>;

const GRAMMAR_LEXICON: SemanticLexicon = new Map([
  ["I", {coords: [1, 0, 0, 0], domain: "GRAMMAR", role: "subject"}],
  ["you", {coords: [0, 1, 0, 0], domain: "GRAMMAR", role: "object"}],
  ["see", {coords: [0.707, 0.707, 0, 0], domain: "GRAMMAR", role: "predicate"}],
  // ... 600-cell has 120 vertices, so ~120 core words per domain
]);
```

### 9.2 Word Vector Embedding

**Integration with existing embeddings:**

```python
def embed_word_to_600cell(word: str, 
                           word2vec_model: Model) -> DomainVertex:
    """
    Map word embedding to nearest 600-cell vertex.
    """
    # Get word vector (typically 300D)
    word_vec = word2vec_model[word]
    
    # Project to 4D using PCA or learned projection
    projected_4d = project_to_4d(word_vec)
    
    # Find nearest vertex in 600-cell
    nearest = find_nearest_neighbors(projected_4d, k=1)[0]
    
    # Infer domain from context
    domain = infer_domain(word, context)
    
    return DomainVertex(
        coords=nearest.coords,
        domain_label=domain,
        semantic_value=word
    )
```

---

## 10. Use Cases

### 10.1 Natural Language Understanding

```typescript
// Sentence: "I see you"
const sentence = create_pentachoron(
  lookup_word("I", "GRAMMAR", "subject"),
  lookup_word("see", "GRAMMAR", "predicate"),
  lookup_word("you", "GRAMMAR", "object"),
  null,  // no explicit modality
  create_key("GRAMMAR")
);

// Validate semantic coherence
const valid = validate_transition(sentence, ...);
```

### 10.2 Program Transformation

```typescript
// Program: x → f(x) → y
const program = {
  input: lookup_symbol("x", "COMPUTATIONAL", "subject"),
  transform: lookup_symbol("f", "COMPUTATIONAL", "predicate"),
  output: lookup_symbol("y", "COMPUTATIONAL", "object"),
  translate: lookup_symbol("compile", "META", "predicate")
};

// Compile to machine code (domain morphism)
const machine_code = apply_domain_morphism(
  program,
  COMPUTATIONAL_TO_MACHINE
);
```

### 10.3 Federated Identity

```typescript
// User authenticates to service
const auth_event = {
  subject: create_vertex("user", "IDENTITY", "subject"),
  predicate: create_vertex("authenticate", "IDENTITY", "predicate"),
  object: create_vertex("service", "IDENTITY", "object"),
  modality: create_vertex("certain", "META", "modality"),
  key: create_key("IDENTITY")
};

// Validate with identity provider
const valid = validate_with_idp(auth_event);
```

---

## 11. Implementation Checklist (Extended)

### 11.1 Domain System

- [ ] Domain type definition
- [ ] Standard domain catalog (10+ domains)
- [ ] Domain morphism implementation
- [ ] Domain coherence validation
- [ ] Domain-specific tolerances

### 11.2 Modality System

- [ ] Modality enumeration
- [ ] Modal operators (□, ◇)
- [ ] Modality-distance mapping
- [ ] Modal logic rules

### 11.3 Lexicon System

- [ ] Semantic lexicon data structure
- [ ] Word-to-vertex mapping
- [ ] Word embedding integration
- [ ] Context-sensitive lookup

### 11.4 Cross-Domain

- [ ] Domain morphism validation
- [ ] Cross-domain rotor construction
- [ ] Domain translation API
- [ ] Multi-domain composition

---

## 12. Migration from Base Specification

### 12.1 Backward Compatibility

**All v1.0 code remains valid:**

```typescript
// v1.0 (still works)
const p1: Pentachoron = {...};

// v1.1 (extended)
const p2: DomainPentachoron = {...};
```

### 12.2 Opt-In Enhancement

```typescript
function upgrade_to_domain_typed(
  p: Pentachoron,
  domain: string
): DomainPentachoron {
  return {
    ...p,
    subject: {...p.subject, domain_label: domain},
    predicate: {...p.predicate, domain_label: domain},
    object: p.object ? {...p.object, domain_label: domain} : null,
    modality: p.modality ? {...p.modality, domain_label: domain} : null,
    domain_context: domain,
    meta_domain: "META"
  };
}
```

---

## 13. Future Extensions

### 13.1 Planned Domains

- **Ethical:** subjects, values, actions, consequences
- **Aesthetic:** form, beauty, harmony, expression
- **Economic:** agent, resource, transaction, value
- **Social:** actor, relationship, group, norm
- **Biological:** organism, gene, phenotype, environment

### 13.2 Higher-Order Domains

**Domains about domains:**
- **Ontology Engineering:** How to create new domains
- **Domain Composition:** How to merge domains
- **Domain Evolution:** How domains change over time

### 13.3 Continuous Domains

**Relaxing discrete 600-cell:**
- Manifold-valued domains
- Smooth interpolation between vertices
- Riemannian geometry on semantic spaces

---

## 14. Conclusion

Domain-typed semantics provides:

1. **Expressivity:** Capture domain-specific knowledge
2. **Modularity:** Domains can be developed independently
3. **Composability:** Morphisms enable cross-domain reasoning
4. **Grounding:** Connect to natural language and programs
5. **Scalability:** Add domains without breaking core system

This extension maintains all guarantees from the base specification while enabling real-world semantic applications.