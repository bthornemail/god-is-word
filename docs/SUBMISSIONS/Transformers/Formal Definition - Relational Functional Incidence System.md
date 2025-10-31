# **Formal Definition: Relational Functional Incidence System (RFIS)**

## 1. **Primitive Elements**

Let ( \mathcal{F} ) denote a set of **pure functions**.
Each ( f \in \mathcal{F} ) is associated with a **binary encoding** ( \varepsilon(f) \in \mathbb{B}^* ), where ( \mathbb{B} = {0,1} ).
This encoding may be defined by the serialized source, compiled bytecode, or any deterministic representation.

[
\varepsilon: \mathcal{F} \to \mathbb{B}^*
]

We require ( \varepsilon ) to be **injective up to observational equivalence**, i.e.:

[
\forall f,g \in \mathcal{F}, \quad \varepsilon(f) = \varepsilon(g) \iff f \equiv g
]

where ( f \equiv g ) denotes semantic equivalence under all inputs.

---

## 2. **Modules as Execution Contexts**

Define a **module** ( \mathcal{M} ) as a tuple:

[
\mathcal{M} = (\mathcal{F}, \mathbb{V}, \rho)
]

where:

* ( \mathcal{F} ) is a finite subset of functions executable in the module.
* ( \mathbb{V} ) is a space of possible values or results.
* ( \rho: \mathcal{F} \times \mathcal{F} \rightharpoonup \mathbb{V} )
  is a **partial binary operation** (execution relation) defined by
  [
  \rho(f,g) = \text{eval}(f,g)
  ]
  where `eval` denotes the result of running ( f(g) ) within the module’s interpreter or VM.

The partiality of ( \rho ) reflects that not all pairs ( (f,g) ) are executable.

---

## 3. **Functional Incidence Relation**

Define an **incidence relation** on ( \mathcal{F} ):

[
I = { (f,g,v) \mid f,g \in \mathcal{F}, \ \rho(f,g) = v \in \mathbb{V} }
]

For every ordered pair ( (f,g) ), ( I ) may yield:

* a **value** ( v \in \mathbb{V} ), if execution succeeds;
* or a **null symbol** ( \bot ), if execution is undefined or fails.

We then define a ternary relation:

[
I \subseteq \mathcal{F} \times \mathcal{F} \times (\mathbb{V} \cup {\bot})
]

---

## 4. **Compositional Equivalence**

Define a **composition comparison function**:

[
C: \mathcal{F} \times \mathcal{F} \to {-1, 0, 1}
]

given by

[
C(f,g) =
\begin{cases}
0 & \text{if } \rho(f,g) = \bot \text{ or } \rho(g,f) = \bot \
1 & \text{if } \rho(f,g) = \rho(g,f) \
-1 & \text{otherwise}
\end{cases}
]

Thus:

* ( C(f,g) = 1 ): functions are **commutatively compatible**.
* ( C(f,g) = -1 ): **non-commutatively compatible**.
* ( C(f,g) = 0 ): **incompatible** (composition invalid).

---

## 5. **Higher-Order Composition Sets**

Let ( S = { f_1, f_2, \dots, f_n } \subseteq \mathcal{F} ).
Define the **compatibility functional**:

[
\Phi(S) = \prod_{1 \leq i < j \leq n} \delta(C(f_i, f_j))
]

where

[
\delta(x) =
\begin{cases}
0 & \text{if } x = 0 \
1 & \text{otherwise}
\end{cases}
]

Then:

* ( \Phi(S) = 1 ) iff all pairs in ( S ) are mutually composable (no incompatibility).
* ( \Phi(S) = 0 ) otherwise.

Such a subset ( S ) with ( \Phi(S) = 1 ) is called a **compositional clique**.

---

## 6. **Relational Functional Graph**

The system induces a **directed labeled multigraph**:

[
\mathbb{G} = (\mathcal{F}, E)
]
where
[
E = { (f,g,v) \mid \rho(f,g) = v \neq \bot }
]

Edges are labeled by their execution results ( v \in \mathbb{V} ).
Symmetric edges ((f,g,v_1)) and ((g,f,v_2)) may differ, encoding non-commutativity.

---

## 7. **Algebraic Properties**

If ( \rho ) is associative on a subset ( D \subseteq \mathcal{F}^3 ):

[
\rho(f, \rho(g,h)) = \rho(\rho(f,g), h)
]

then ( D ) forms a **relational semigroup**.

If, further, a neutral element ( e ) exists such that ( \rho(e,f) = \rho(f,e) = f ),
then ( (\mathcal{F}, \rho) ) is a **partial monoid**.

However, in general, ( \rho ) is non-associative and non-commutative,
so ( (\mathcal{F}, \rho) ) forms a **noncommutative incidence algebra** over execution relations.

---

## 8. **Evaluation Metric**

Define a **compatibility measure** between two functions ( f, g ):

[
\kappa(f,g) =
\begin{cases}
1 & \text{if } C(f,g) = 1 \
-1 & \text{if } C(f,g) = -1 \
0 & \text{if } C(f,g) = 0
\end{cases}
]

and for a composite set ( S ):

[
\kappa(S) = \frac{1}{|S|(|S|-1)} \sum_{i \neq j} \kappa(f_i,f_j)
]

Thus ( \kappa(S) \in [-1,1] ) measures the *average symmetry* of the system.

---

## 9. **Interpretation**

| Symbol             | Meaning                                       |
| ------------------ | --------------------------------------------- |
| ( \mathcal{F} )    | Set of pure functions (points)                |
| ( \varepsilon(f) ) | Binary encoding of function ( f )             |
| ( \rho(f,g) )      | Result of running ( f(g) ) in module VM       |
| ( I )              | Incidence relation between functions          |
| ( C(f,g) )         | Compositional comparison (commutativity test) |
| ( \Phi(S) )        | Global validity of function set               |
| ( \mathbb{G} )     | Relational functional graph                   |
| ( \kappa(S) )      | Average compatibility measure                 |

---

## 10. **Computational Category View**

Let **RFIS** be the category whose:

* **Objects** are finite subsets ( S \subseteq \mathcal{F} ),
* **Morphisms** ( S \to T ) are partial relations defined by ( \rho ) on ( S \times T ).

Composition of morphisms is defined pointwise where valid.
The identity morphism is the reflexive incidence ( (f,f,\rho(f,f)) ).

Then ( \text{RFIS} ) is a **partial monoidal category** where the tensor product is defined by disjoint union of compatible subgraphs.

---

## 11. **Physical Interpretation**

If ( f,g \in \mathcal{F} ) are viewed as **information operators**,
then ( \rho(f,g) ) defines a *measurement* of their joint computability.

The triplet ( (f,g,\rho(f,g)) ) may therefore be seen as a **functional incidence event** —
analogous to a *morphism composition* that either exists (nonzero) or fails (zero).

The total structure defines a **computational topological space**,
where neighborhoods correspond to sets of mutually composable functions.
