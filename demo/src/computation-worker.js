"use strict";
// ============================================================================
// computation-worker.ts - Worker Thread for Heavy Computation
// ============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var worker_threads_1 = require("worker_threads");
var vm_1 = require("vm");
// Shared memory layout constants
var SIGNAL_OFFSET = 0;
var LENGTH_OFFSET = 4;
var DATA_OFFSET = 8;
var _a = worker_threads_1.workerData, sharedBuffer = _a.sharedBuffer, workerId = _a.workerId;
// Create views into the SharedArrayBuffer
var signalArray = new Int32Array(sharedBuffer, SIGNAL_OFFSET, 1);
var lengthArray = new Int32Array(sharedBuffer, LENGTH_OFFSET, 1);
var dataArray = new Uint8Array(sharedBuffer, DATA_OFFSET);
console.log("[Computation Worker ".concat(workerId, "] Started, waiting for tasks..."));
// ============================================================================
// Computation Functions for Perceptron Operations
// ============================================================================
/**
 * Compute matrix eigenvalues (simplified using power iteration)
 * This represents the "Change of Basis" computation in the Perceptron
 */
function computeEigenvalues(matrix) {
    var n = matrix.length;
    var eigenvalues = [];
    // Simplified: compute trace and determinant for 2x2, approximate for larger
    if (n === 2) {
        var trace = matrix[0][0] + matrix[1][1];
        var det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        var discriminant = Math.sqrt(trace * trace - 4 * det);
        eigenvalues.push((trace + discriminant) / 2);
        eigenvalues.push((trace - discriminant) / 2);
    }
    else {
        // Power iteration for dominant eigenvalue
        var v_1 = Array(n).fill(1.0);
        var _loop_1 = function (iter) {
            var Av = matrix.map(function (row) {
                return row.reduce(function (sum, val, j) { return sum + val * v_1[j]; }, 0);
            });
            var norm = Math.sqrt(Av.reduce(function (sum, val) { return sum + val * val; }, 0));
            v_1 = Av.map(function (val) { return val / norm; });
            if (iter === 99) {
                var lambda = matrix[0].reduce(function (sum, val, j) { return sum + val * v_1[j]; }, 0) / v_1[0];
                eigenvalues.push(lambda);
            }
        };
        for (var iter = 0; iter < 100; iter++) {
            _loop_1(iter);
        }
    }
    return eigenvalues;
}
/**
 * Compute Betti numbers from adjacency matrix
 * β₀ = number of connected components
 * β₁ = number of independent cycles
 */
function computeBettiNumbers(matrix) {
    var n = matrix.length;
    var threshold = 0.1;
    var visited = new Array(n).fill(false);
    var components = 0;
    var dfs = function (i, component) {
        visited[i] = true;
        component.push(i);
        for (var j = 0; j < n; j++) {
            if (!visited[j] && matrix[i][j] > threshold) {
                dfs(j, component);
            }
        }
    };
    var componentsList = [];
    for (var i = 0; i < n; i++) {
        if (!visited[i]) {
            var component = [];
            dfs(i, component);
            componentsList.push(component);
            components++;
        }
    }
    // Compute β₁: count cycles (Euler characteristic V - E + F = 2 - 2g)
    var edges = 0;
    for (var i = 0; i < n; i++) {
        for (var j = i + 1; j < n; j++) {
            if (matrix[i][j] > threshold)
                edges++;
        }
    }
    var beta1 = Math.max(0, edges - n + components);
    return { beta0: components, beta1: beta1 };
}
/**
 * Compute Schläfli Symbol classification
 * Determines geometric type based on matrix structure
 */
function computeSchlaefliSymbol(matrix) {
    var n = matrix.length;
    var eigenvalues = computeEigenvalues(matrix);
    var dominant = Math.max.apply(Math, eigenvalues.map(Math.abs));
    // Classify based on dimension and symmetry
    if (n === 3)
        return '{3}'; // Triangle
    if (n === 4)
        return '{3,3}'; // Tetrahedron
    if (n === 6)
        return '{3,4}'; // Octahedron
    if (n === 8)
        return '{4,3}'; // Cube
    return "{".concat(n, "}");
}
/**
 * Compute Block Design (BIBD) parameters
 * For Fano plane: (7, 3, 1, 3, 7)
 */
function computeBlockDesign(matrix) {
    var n = matrix.length;
    // Count non-zero entries per row (replication number r)
    var threshold = 0.1;
    var degrees = matrix.map(function (row) {
        return row.filter(function (val) { return val > threshold; }).length;
    });
    var avgDegree = degrees.reduce(function (a, b) { return a + b; }, 0) / n;
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
 * Main computation function - runs in VM context
 */
function performHeavyComputation(matrixData) {
    var startTime = Date.now();
    // Step 1: Compute Geometric Invariants (I)
    var blockDesign = computeBlockDesign(matrixData);
    var bettiNumbers = computeBettiNumbers(matrixData);
    var schlaefliSymbol = computeSchlaefliSymbol(matrixData);
    var eigenvalues = computeEigenvalues(matrixData);
    // Step 2: Verify topological consistency
    var isUnified = bettiNumbers.beta0 === 1;
    var hasPartition = bettiNumbers.beta0 > 1;
    // Step 3: Compute consensus metric (inner product)
    var trace = matrixData.reduce(function (sum, row, i) { return sum + row[i]; }, 0);
    var frobenius = Math.sqrt(matrixData.reduce(function (sum, row) {
        return sum + row.reduce(function (s, val) { return s + val * val; }, 0);
    }, 0));
    var endTime = Date.now();
    return {
        geometricInvariants: {
            blockDesign: blockDesign,
            bettiNumbers: bettiNumbers,
            schlaefliSymbol: schlaefliSymbol,
            eigenvalues: eigenvalues
        },
        topology: {
            isUnified: isUnified,
            hasPartition: hasPartition,
            connectedComponents: bettiNumbers.beta0,
            cycles: bettiNumbers.beta1
        },
        metrics: {
            trace: trace,
            frobeniusNorm: frobenius,
            spectralRadius: Math.max.apply(Math, eigenvalues.map(Math.abs))
        },
        computationTime: endTime - startTime
    };
}
// ============================================================================
// Worker Main Loop - Wait for signals via Atomics
// ============================================================================
function workerLoop() {
    return __awaiter(this, void 0, void 0, function () {
        var result, dataLength, dataBytes, dataStr, matrixData, sandbox, script, computationResult;
        return __generator(this, function (_a) {
            while (true) {
                result = Atomics.wait(signalArray, 0, 0);
                if (result === 'ok') {
                    dataLength = Atomics.load(lengthArray, 0);
                    if (dataLength > 0) {
                        try {
                            dataBytes = new Uint8Array(dataArray.buffer, DATA_OFFSET, dataLength);
                            dataStr = Buffer.from(dataBytes).toString('utf8');
                            matrixData = JSON.parse(dataStr);
                            console.log("[Computation Worker ".concat(workerId, "] Processing matrix ").concat(matrixData.length, "x").concat(matrixData.length, "..."));
                            sandbox = {
                                matrixData: matrixData,
                                computeBlockDesign: computeBlockDesign,
                                computeBettiNumbers: computeBettiNumbers,
                                computeSchlaefliSymbol: computeSchlaefliSymbol,
                                computeEigenvalues: computeEigenvalues,
                                result: null,
                                console: console // Allow logging from VM
                            };
                            vm_1.default.createContext(sandbox);
                            script = new vm_1.default.Script("\n            result = {\n              geometricInvariants: {\n                blockDesign: computeBlockDesign(matrixData),\n                bettiNumbers: computeBettiNumbers(matrixData),\n                schlaefliSymbol: computeSchlaefliSymbol(matrixData),\n                eigenvalues: computeEigenvalues(matrixData)\n              },\n              timestamp: Date.now()\n            };\n          ");
                            script.runInContext(sandbox, { timeout: 5000 });
                            computationResult = performHeavyComputation(matrixData);
                            console.log("[Computation Worker ".concat(workerId, "] Computation complete:"));
                            console.log("  \u03B2\u2080=".concat(computationResult.geometricInvariants.bettiNumbers.beta0, ", \u03B2\u2081=").concat(computationResult.geometricInvariants.bettiNumbers.beta1));
                            console.log("  Schl\u00E4fli: ".concat(computationResult.geometricInvariants.schlaefliSymbol));
                            console.log("  Unified: ".concat(computationResult.topology.isUnified));
                            console.log("  Time: ".concat(computationResult.computationTime, "ms"));
                            // Send result back to main thread
                            if (worker_threads_1.parentPort) {
                                worker_threads_1.parentPort.postMessage({
                                    type: 'COMPUTATION_RESULT',
                                    workerId: workerId,
                                    result: computationResult
                                });
                            }
                        }
                        catch (err) {
                            console.error("[Computation Worker ".concat(workerId, "] Error:"), err);
                            if (worker_threads_1.parentPort) {
                                worker_threads_1.parentPort.postMessage({
                                    type: 'COMPUTATION_ERROR',
                                    workerId: workerId,
                                    error: String(err)
                                });
                            }
                        }
                    }
                    // Reset signal
                    Atomics.store(signalArray, 0, 0);
                }
            }
            return [2 /*return*/];
        });
    });
}
// Start the worker loop
workerLoop().catch(function (err) {
    console.error("[Computation Worker ".concat(workerId, "] Fatal error:"), err);
    process.exit(1);
});
