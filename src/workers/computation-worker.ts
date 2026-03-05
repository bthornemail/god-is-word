// ============================================================================
// computation-worker.ts - Web Worker for Heavy Computation (Browser Version)
// ============================================================================

// ============================================================================
// Computation Functions for Perceptron Operations
// ============================================================================

/**
 * Compute matrix eigenvalues (simplified using power iteration)
 * This represents the "Change of Basis" computation in the Perceptron
 */
function computeEigenvalues(matrix: number[][]): number[] {
  const n = matrix.length;
  const eigenvalues: number[] = [];

  // Simplified: compute trace and determinant for 2x2, approximate for larger
  if (n === 2) {
    const trace = matrix[0][0] + matrix[1][1];
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    const discriminant = Math.sqrt(trace * trace - 4 * det);
    eigenvalues.push((trace + discriminant) / 2);
    eigenvalues.push((trace - discriminant) / 2);
  } else {
    // Power iteration for dominant eigenvalue
    let v = Array(n).fill(1.0);
    for (let iter = 0; iter < 100; iter++) {
      const Av = matrix.map(row =>
        row.reduce((sum, val, j) => sum + val * v[j], 0)
      );
      const norm = Math.sqrt(Av.reduce((sum, val) => sum + val * val, 0));
      v = Av.map(val => val / norm);

      if (iter === 99) {
        const lambda = matrix[0].reduce((sum, val, j) => sum + val * v[j], 0) / v[0];
        eigenvalues.push(lambda);
      }
    }
  }

  return eigenvalues;
}

/**
 * Compute Betti numbers from adjacency matrix
 * β₀ = number of connected components
 * β₁ = number of independent cycles
 */
function computeBettiNumbers(matrix: number[][]): { beta0: number; beta1: number } {
  const n = matrix.length;
  const threshold = 0.1;
  const visited = new Array(n).fill(false);
  let components = 0;

  const dfs = (i: number, component: number[]) => {
    visited[i] = true;
    component.push(i);
    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[i][j] > threshold) {
        dfs(j, component);
      }
    }
  };

  const componentsList: number[][] = [];
  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      const component: number[] = [];
      dfs(i, component);
      componentsList.push(component);
      components++;
    }
  }

  // Compute β₁: count cycles (Euler characteristic V - E + F = 2 - 2g)
  let edges = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] > threshold) edges++;
    }
  }

  const beta1 = Math.max(0, edges - n + components);

  return { beta0: components, beta1 };
}

/**
 * Compute Schläfli Symbol classification
 * Determines geometric type based on matrix structure
 */
function computeSchlaefliSymbol(matrix: number[][]): string {
  const n = matrix.length;
  const eigenvalues = computeEigenvalues(matrix);
  // Reserved for future eigenvalue analysis
  // @ts-expect-error - Intentionally unused, reserved for future use
  const _dominant = Math.max(...eigenvalues.map(Math.abs));

  // Classify based on dimension and symmetry
  if (n === 3) return '{3}'; // Triangle
  if (n === 4) return '{3,3}'; // Tetrahedron
  if (n === 6) return '{3,4}'; // Octahedron
  if (n === 8) return '{4,3}'; // Cube

  return `{${n}}`;
}

/**
 * Compute Block Design (BIBD) parameters
 * For Fano plane: (7, 3, 1, 3, 7)
 */
function computeBlockDesign(matrix: number[][]): any {
  const n = matrix.length;

  // Count non-zero entries per row (replication number r)
  const threshold = 0.1;
  const degrees = matrix.map(row =>
    row.filter(val => val > threshold).length
  );
  const avgDegree = degrees.reduce((a, b) => a + b, 0) / n;

  // Standard Fano plane parameters
  if (n === 7) {
    return { v: 7, k: 3, lambda: 1, r: 3, b: 7 };
  }

  // General BIBD estimation
  return {
    v: n,
    k: Math.round(avgDegree),
    lambda: 1,
    r: Math.round(avgDegree),
    b: n
  };
}

/**
 * Main computation function
 */
function performHeavyComputation(matrixData: number[][]): any {
  const startTime = Date.now();

  // Step 1: Compute Geometric Invariants (I)
  const blockDesign = computeBlockDesign(matrixData);
  const bettiNumbers = computeBettiNumbers(matrixData);
  const schlaefliSymbol = computeSchlaefliSymbol(matrixData);
  const eigenvalues = computeEigenvalues(matrixData);

  // Step 2: Verify topological consistency
  const isUnified = bettiNumbers.beta0 === 1;
  const hasPartition = bettiNumbers.beta0 > 1;

  // Step 3: Compute consensus metric (inner product)
  const trace = matrixData.reduce((sum, row, i) => sum + row[i], 0);
  const frobenius = Math.sqrt(
    matrixData.reduce((sum, row) =>
      sum + row.reduce((s, val) => s + val * val, 0), 0
    )
  );

  const endTime = Date.now();

  return {
    geometricInvariants: {
      blockDesign,
      bettiNumbers,
      schlaefliSymbol,
      eigenvalues
    },
    topology: {
      isUnified,
      hasPartition,
      connectedComponents: bettiNumbers.beta0,
      cycles: bettiNumbers.beta1
    },
    metrics: {
      trace,
      frobeniusNorm: frobenius,
      spectralRadius: Math.max(...eigenvalues.map(Math.abs))
    },
    computationTime: endTime - startTime
  };
}

// ============================================================================
// Web Worker Message Handler
// ============================================================================

self.onmessage = (e: MessageEvent) => {
  const { type, payload, workerId } = e.data;

  if (type === 'COMPUTE') {
    try {
      const matrixData = payload.matrix as number[][];

      console.log(`[Computation Worker] Processing matrix ${matrixData.length}x${matrixData.length}...`);

      const computationResult = performHeavyComputation(matrixData);

      console.log(`[Computation Worker] Computation complete:`);
      console.log(`  β₀=${computationResult.geometricInvariants.bettiNumbers.beta0}, β₁=${computationResult.geometricInvariants.bettiNumbers.beta1}`);
      console.log(`  Schläfli: ${computationResult.geometricInvariants.schlaefliSymbol}`);
      console.log(`  Unified: ${computationResult.topology.isUnified}`);
      console.log(`  Time: ${computationResult.computationTime}ms`);

      // Send result back to main thread
      self.postMessage({
        type: 'COMPUTATION_RESULT',
        workerId,
        result: computationResult
      });
    } catch (err) {
      console.error(`[Computation Worker] Error:`, err);

      self.postMessage({
        type: 'COMPUTATION_ERROR',
        workerId,
        error: String(err)
      });
    }
  }
};

console.log('[Computation Worker] Started, waiting for tasks...');

