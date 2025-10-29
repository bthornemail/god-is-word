// Placeholder types for IEEE 754 formats not native to JavaScript.
// We can use libraries like 'decimal.js' or custom ArrayBuffer implementations later.

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


// BlockDesign: All IEEE 754 binary formats
export type BlockDesign = {
  Node:       binary16;   // 16 bits  - 3.31 decimal digits
  Edge:       binary32;   // 32 bits  - 7.22 decimal digits
  Graph:      binary64;   // 64 bits  - 15.95 decimal digits
  Incidence:  binary128;  // 128 bits - 34.02 decimal digits
  Hypergraph: binary256;  // 256 bits - 71.34 decimal digits
};

// DecimalSpace: All IEEE 754 decimal formats
export type DecimalSpace = decimal32 | decimal64 | decimal128;

// FanoPlane: 7 points (5 binary + 2 decimal)
export type FanoPlane = BlockDesign & {
  Functor?: DecimalSpace; // Point 6 (optional)
  Monad?: DecimalSpace;   // Point 7 (optional)
};

// Perceptron: 8 dimensions (7 FanoPlane + 1 self-reference)
export type Perceptron = {
  point: FanoPlane;              // 7 dimensions
  Perceptron?: DecimalSpace;     // 8th dimension (self-reference)
  // Adding original entry data for compatibility for now
  word: string;
  content: string;
  timestamp: string;
  day: number;
  // The triples from the original app
  triples: { subject: string, predicate: string, object: string }[];
};
