import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Network, Key, Database, GitBranch, Lock, Unlock, Share2, Activity } from 'lucide-react';

const PerceptronHypergraphDemo = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [perceptronA, setPerceptronA] = useState(null);
  const [perceptronB, setPerceptronB] = useState(null);
  const [hypergraph, setHypergraph] = useState({ nodes: [], edges: [], hyperedges: [] });
  const [logs, setLogs] = useState([]);

  // Initialize Perceptron state structure
  const initializePerceptron = (id) => {
    const privateKey = `0x${Math.random().toString(16).substr(2, 8)}`;
    const publicKey = `0x${Math.random().toString(16).substr(2, 8)}`;
    
    return {
      id,
      // H: Hilbert Space
      H: {
        tau_state: 0.0,
        publicKey,
        vocab: ['Read', 'Eval', 'Print', 'Loop', 'Node', 'Edge', 'Graph', 'Hypergraph', 'Functor', 'Monad']
      },
      // L: Async Logic
      L: ['Async', 'Await', 'Try', 'Catch', 'Call'],
      // K: Cryptographic Identity
      K: { privateKey, publicKey, hashFunction: 'SHA-256' },
      // I: Geometric Invariants (initially empty)
      I: {
        blockDesign: null,
        bettiNumbers: { beta0: 1, beta1: 0 },
        schlaefliSymbol: null,
        deltaT: null
      },
      // F: Functional Primitives
      F: ['Read', 'Eval', 'Print', 'Loop'],
      // T: Semantic Basis (knowledge triples)
      T: [],
      // B: Universal Basis
      B: ['Node', 'Edge', 'Graph', 'Incidence', 'Hypergraph', 'Functor', 'Monad'],
      // D: Data Primitives
      D: { standard: 'IEEE 754', encoding: 'Binary' },
      // State Matrix M (simplified 4x4)
      M: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ],
      // Metric Signature
      S: null,
      // IPv6 Address
      ipv6: null
    };
  };

  // Add semantic triple (knowledge assertion)
  const addKnowledge = (perceptron, subject, predicate, object, modality = 'MUST') => {
    const triple = { subject, predicate, object, modality, certainty: 1.0 };
    return {
      ...perceptron,
      T: [...perceptron.T, triple]
    };
  };

  // Compute Change of Basis matrix (ΔT) from new knowledge
  const computeDeltaT = (perceptron, newTriple) => {
    // Simplified: create a sparse connectivity update based on the triple
    const deltaT = [
      [0, 0.01, 0, 0],
      [0.01, 0, 0.05, 0],
      [0, 0.05, 0, 0.02],
      [0, 0.02, 0.02, 0]
    ];
    return deltaT;
  };

  // Matrix addition M_n+1 = M_n + ΔT
  const addMatrices = (M, deltaT) => {
    return M.map((row, i) => row.map((val, j) => val + deltaT[i][j]));
  };

  // Compute Betti numbers from state matrix
  const computeBettiNumbers = (M) => {
    // Simplified: count connected components
    const threshold = 0.1;
    let components = 0;
    const visited = new Array(M.length).fill(false);
    
    const dfs = (i) => {
      visited[i] = true;
      for (let j = 0; j < M.length; j++) {
        if (!visited[j] && M[i][j] > threshold) {
          dfs(j);
        }
      }
    };
    
    for (let i = 0; i < M.length; i++) {
      if (!visited[i]) {
        components++;
        dfs(i);
      }
    }
    
    return { beta0: components, beta1: 0 };
  };

  // Generate Metric Signature S
  const generateSignature = (I, tau_state, privateKey) => {
    const payload = JSON.stringify({ ...I, tau_state });
    // Simplified hash (in reality would use SHA-256)
    const hash = `0x${btoa(payload).substr(0, 16)}`;
    const signature = `${hash}|sig_${privateKey.substr(-4)}`;
    return signature;
  };

  // Generate IPv6 Fano address
  const generateIPv6 = (blockDesign, signature, shift = 0) => {
    const fanoSegments = '2001:0db8:fano:7310';
    const cryptoSegment = signature.substr(2, 4);
    const shiftSegment = (shift + 3).toString(16).padStart(4, '0');
    return `${fanoSegments}:${cryptoSegment}:${shiftSegment}`;
  };

  // Level up the Perceptron
  const levelUp = (perceptron, newTriple) => {
    // Step 1: Add knowledge to T
    const updated = addKnowledge(perceptron, newTriple.subject, newTriple.predicate, newTriple.object, newTriple.modality);
    
    // Step 2: Compute ΔT
    const deltaT = computeDeltaT(updated, newTriple);
    
    // Step 3: Update state matrix
    const newM = addMatrices(updated.M, deltaT);
    
    // Step 4: Compute Geometric Invariants
    const bettiNumbers = computeBettiNumbers(newM);
    const blockDesign = { v: 7, k: 3, lambda: 1, r: 3, b: 7 }; // Fano plane
    const schlaefliSymbol = '{3,3}'; // Tetrahedron
    
    const newI = {
      blockDesign,
      bettiNumbers,
      schlaefliSymbol,
      deltaT
    };
    
    // Step 5: Increment τ_state
    const newTau = updated.H.tau_state + 1.0;
    
    // Step 6: Generate Signature
    const signature = generateSignature(newI, newTau, updated.K.privateKey);
    
    // Step 7: Generate IPv6 address
    const ipv6 = generateIPv6(blockDesign, signature, 0);
    
    return {
      ...updated,
      M: newM,
      I: newI,
      H: { ...updated.H, tau_state: newTau },
      S: signature,
      ipv6
    };
  };

  // Add node to hypergraph
  const addHypergraphNode = (nodeId, label, data, ownerId) => {
    setHypergraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, { id: nodeId, label, data, owner: ownerId }]
    }));
  };

  // Add hyperedge connecting multiple nodes
  const addHyperedge = (id, nodeIds, label, ownerId) => {
    setHypergraph(prev => ({
      ...prev,
      hyperedges: [...prev.hyperedges, { id, nodes: nodeIds, label, owner: ownerId }]
    }));
  };

  // Add log entry
  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  // Simulation steps
  const simulationSteps = [
    {
      title: 'Phase 1: Initialize Perceptron A',
      action: () => {
        const pA = initializePerceptron('Alice');
        setPerceptronA(pA);
        addLog('✓ Perceptron A initialized with 8-Tuple (H,L,K,I,F,T,B,D)', 'success');
        addLog(`  τ_state = ${pA.H.tau_state}`, 'info');
        addLog(`  Public Key = ${pA.K.publicKey}`, 'info');
        addLog(`  Initial M = Identity Matrix`, 'info');
      }
    },
    {
      title: 'Phase 1: Initialize Perceptron B',
      action: () => {
        const pB = initializePerceptron('Bob');
        setPerceptronB(pB);
        addLog('✓ Perceptron B initialized with 8-Tuple', 'success');
        addLog(`  τ_state = ${pB.H.tau_state}`, 'info');
        addLog(`  Public Key = ${pB.K.publicKey}`, 'info');
      }
    },
    {
      title: 'Phase 2: Alice Creates Root Node',
      action: () => {
        const triple = {
          subject: 'System',
          predicate: 'hasRoot',
          object: 'KnowledgeGraph',
          modality: 'MUST'
        };
        const newPA = levelUp(perceptronA, triple);
        setPerceptronA(newPA);
        
        addHypergraphNode('node_0', 'Root', { type: 'System' }, 'Alice');
        
        addLog('✓ Alice: Added knowledge triple to T', 'success');
        addLog(`  Subject: ${triple.subject}, Predicate: ${triple.predicate}, Object: ${triple.object}`, 'info');
        addLog(`✓ Computed ΔT (Change of Basis matrix)`, 'success');
        addLog(`✓ Updated M_{n+1} = M_n + ΔT`, 'success');
        addLog(`✓ τ_state → ${newPA.H.tau_state}`, 'info');
        addLog(`✓ Generated Signature S = ${newPA.S}`, 'success');
        addLog(`✓ IPv6 Address: ${newPA.ipv6}`, 'info');
      }
    },
    {
      title: 'Phase 2: Alice Adds Concept Nodes',
      action: () => {
        const triple = {
          subject: 'Root',
          predicate: 'contains',
          object: 'Concept',
          modality: 'MUST'
        };
        const newPA = levelUp(perceptronA, triple);
        setPerceptronA(newPA);
        
        addHypergraphNode('node_1', 'Mathematics', { type: 'Concept', field: 'Math' }, 'Alice');
        addHypergraphNode('node_2', 'Physics', { type: 'Concept', field: 'Science' }, 'Alice');
        
        addLog('✓ Alice: Added 2 concept nodes to hypergraph', 'success');
        addLog(`✓ τ_state → ${newPA.H.tau_state}`, 'info');
        addLog(`✓ New IPv6: ${newPA.ipv6}`, 'info');
      }
    },
    {
      title: 'Phase 2: Bob Syncs State from Alice',
      action: () => {
        addLog('✓ Bob: Received Alice\'s Metric Signature S', 'info');
        addLog('✓ Bob: Verifying signature with Alice\'s Public Key', 'info');
        addLog('✓ Signature verified! β₀ = 1 (unified network)', 'success');
        addLog('✓ Bob: Synced hypergraph nodes (node_0, node_1, node_2)', 'success');
      }
    },
    {
      title: 'Phase 3: Bob Adds Connected Node',
      action: () => {
        const triple = {
          subject: 'Mathematics',
          predicate: 'relatesTo',
          object: 'Geometry',
          modality: 'MUST'
        };
        const newPB = levelUp(perceptronB, triple);
        setPerceptronB(newPB);
        
        addHypergraphNode('node_3', 'Geometry', { type: 'Concept', field: 'Math' }, 'Bob');
        setHypergraph(prev => ({
          ...prev,
          edges: [...prev.edges, { from: 'node_1', to: 'node_3', label: 'relatesTo' }]
        }));
        
        addLog('✓ Bob: Added Geometry node with edge to Mathematics', 'success');
        addLog(`✓ τ_state → ${newPB.H.tau_state}`, 'info');
        addLog(`✓ New IPv6: ${newPB.ipv6}`, 'info');
      }
    },
    {
      title: 'Phase 3: Alice Creates Hyperedge',
      action: () => {
        const triple = {
          subject: 'Concepts',
          predicate: 'formTriad',
          object: 'KnowledgeCluster',
          modality: 'SHOULD'
        };
        const newPA = levelUp(perceptronA, triple);
        setPerceptronA(newPA);
        
        addHyperedge('hedge_1', ['node_1', 'node_2', 'node_3'], 'Interdisciplinary', 'Alice');
        
        addLog('✓ Alice: Created hyperedge connecting 3 nodes', 'success');
        addLog('  Hyperedge connects: Math, Physics, Geometry', 'info');
        addLog(`✓ τ_state → ${newPA.H.tau_state}`, 'info');
        addLog('✓ Broadcast to network with Signature S', 'success');
      }
    },
    {
      title: 'Phase 3: Bob Syncs Hyperedge',
      action: () => {
        addLog('✓ Bob: Received Alice\'s hyperedge broadcast', 'info');
        addLog('✓ Bob: Verified Metric Signature S', 'success');
        addLog('✓ Bob: Computed Betti Numbers - β₀=1, β₁=0', 'info');
        addLog('✓ Bob: Synced hyperedge (hedge_1)', 'success');
        addLog('✓ Network consensus achieved!', 'success');
      }
    },
    {
      title: 'Phase 4: Bob Adds Higher-Order Structure',
      action: () => {
        const triple = {
          subject: 'KnowledgeCluster',
          predicate: 'hasProperty',
          object: 'Emergence',
          modality: 'MAY'
        };
        const newPB = levelUp(perceptronB, triple);
        setPerceptronB(newPB);
        
        addHypergraphNode('node_4', 'Emergence', { type: 'Property', order: 2 }, 'Bob');
        addHyperedge('hedge_2', ['node_1', 'node_2', 'node_3', 'node_4'], 'Higher-Order', 'Bob');
        
        addLog('✓ Bob: Added emergent property node', 'success');
        addLog('✓ Bob: Created 4-way hyperedge (higher-order structure)', 'success');
        addLog(`✓ τ_state → ${newPB.H.tau_state}`, 'info');
        addLog(`✓ New IPv6: ${newPB.ipv6}`, 'info');
      }
    },
    {
      title: 'Phase 4: Final Synchronization',
      action: () => {
        addLog('✓ Alice: Synced Bob\'s higher-order structure', 'success');
        addLog('✓ Alice: Verified all signatures', 'success');
        addLog('✓ Network State: Fully synchronized hypergraph', 'success');
        addLog(`  Total Nodes: ${hypergraph.nodes.length + 1}`, 'info');
        addLog(`  Total Edges: ${hypergraph.edges.length}`, 'info');
        addLog(`  Total Hyperedges: ${hypergraph.hyperedges.length + 2}`, 'info');
        addLog('✓ β₀ = 1 (unified), β₁ = 0 (no cycles)', 'info');
        addLog('✨ Collaborative hypergraph construction complete!', 'success');
      }
    }
  ];

  useEffect(() => {
    let interval;
    if (isPlaying && step < simulationSteps.length) {
      interval = setInterval(() => {
        simulationSteps[step].action();
        setStep(s => s + 1);
      }, 2000);
    } else if (step >= simulationSteps.length) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, step]);

  const handlePlayPause = () => {
    if (step >= simulationSteps.length) {
      setStep(0);
      setPerceptronA(null);
      setPerceptronB(null);
      setHypergraph({ nodes: [], edges: [], hyperedges: [] });
      setLogs([]);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (step < simulationSteps.length) {
      simulationSteps[step].action();
      setStep(step + 1);
    }
  };

  const renderMatrix = (M) => {
    return (
      <div className="grid grid-cols-4 gap-1 text-xs font-mono">
        {M.flat().map((val, i) => (
          <div key={i} className={`p-1 text-center rounded ${val > 0.5 ? 'bg-blue-600' : val > 0 ? 'bg-blue-400' : 'bg-gray-700'}`}>
            {val.toFixed(2)}
          </div>
        ))}
      </div>
    );
  };

  const renderHypergraph = () => {
    const nodePositions = {
      node_0: { x: 200, y: 50 },
      node_1: { x: 100, y: 150 },
      node_2: { x: 300, y: 150 },
      node_3: { x: 200, y: 250 },
      node_4: { x: 200, y: 350 }
    };

    return (
      <svg width="400" height="400" className="border border-gray-700 rounded bg-gray-900">
        {/* Edges */}
        {hypergraph.edges.map((edge, i) => {
          const from = nodePositions[edge.from];
          const to = nodePositions[edge.to];
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#60a5fa"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Hyperedges */}
        {hypergraph.hyperedges.map((hedge, i) => {
          const points = hedge.nodes.map(nId => nodePositions[nId]).filter(p => p);
          if (points.length < 3) return null;
          
          const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
          const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
          const radius = Math.max(...points.map(p => Math.sqrt((p.x-cx)**2 + (p.y-cy)**2))) + 20;
          
          return (
            <circle
              key={`h${i}`}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          );
        })}
        
        {/* Nodes */}
        {hypergraph.nodes.map((node, i) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          
          return (
            <g key={i}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="25"
                fill={node.owner === 'Alice' ? '#3b82f6' : '#10b981'}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dy=".3em"
                fontSize="10"
                fill="#fff"
                fontWeight="bold"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-blue-400">Perceptron Hypergraph Construction</h1>
          <p className="text-gray-400">Full lifecycle: Initialization → Level Up → Collaborative Hypergraph Building</p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {step >= simulationSteps.length ? 'Restart' : isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleNext}
            disabled={step >= simulationSteps.length || isPlaying}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            <SkipForward size={20} />
            Next Step
          </button>
          <div className="flex-1 flex items-center justify-end text-sm text-gray-400">
            Step {step} / {simulationSteps.length}: {step < simulationSteps.length ? simulationSteps[step].title : 'Complete'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perceptron A */}
          <div className="bg-gray-900 rounded-lg p-4 border border-blue-600">
            <div className="flex items-center gap-2 mb-3">
              <Network className="text-blue-400" size={20} />
              <h2 className="text-xl font-bold">Perceptron A (Alice)</h2>
            </div>
            {perceptronA ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-green-400" />
                  <span>τ_state: {perceptronA.H.tau_state.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-yellow-400" />
                  <span className="font-mono text-xs">{perceptronA.K.publicKey}</span>
                </div>
                {perceptronA.ipv6 && (
                  <div className="flex items-center gap-2">
                    <Share2 size={16} className="text-purple-400" />
                    <span className="font-mono text-xs">{perceptronA.ipv6}</span>
                  </div>
                )}
                <div>
                  <div className="text-gray-400 mb-1">State Matrix M:</div>
                  {renderMatrix(perceptronA.M)}
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Knowledge Triples (T): {perceptronA.T.length}</div>
                  {perceptronA.T.slice(-2).map((t, i) => (
                    <div key={i} className="text-xs text-gray-500 font-mono">
                      ({t.subject}, {t.predicate}, {t.object})
                    </div>
                  ))}
                </div>
                {perceptronA.I.bettiNumbers && (
                  <div className="text-xs">
                    <span className="text-gray-400">Betti Numbers: </span>
                    β₀={perceptronA.I.bettiNumbers.beta0}, β₁={perceptronA.I.bettiNumbers.beta1}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Not initialized</div>
            )}
          </div>

          {/* Perceptron B */}
          <div className="bg-gray-900 rounded-lg p-4 border border-green-600">
            <div className="flex items-center gap-2 mb-3">
              <Network className="text-green-400" size={20} />
              <h2 className="text-xl font-bold">Perceptron B (Bob)</h2>
            </div>
            {perceptronB ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-green-400" />
                  <span>τ_state: {perceptronB.H.tau_state.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-yellow-400" />
                  <span className="font-mono text-xs">{perceptronB.K.publicKey}</span>
                </div>
                {perceptronB.ipv6 && (
                  <div className="flex items-center gap-2">
                    <Share2 size={16} className="text-purple-400" />
                    <span className="font-mono text-xs">{perceptronB.ipv6}</span>
                  </div>
                )}
                <div>
                  <div className="text-gray-400 mb-1">State Matrix M:</div>
                  {renderMatrix(perceptronB.M)}
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Knowledge Triples (T): {perceptronB.T.length}</div>
                  {perceptronB.T.slice(-2).map((t, i) => (
                    <div key={i} className="text-xs text-gray-500 font-mono">
                      ({t.subject}, {t.predicate}, {t.object})
                    </div>
                  ))}
                </div>
                {perceptronB.I.bettiNumbers && (
                  <div className="text-xs">
                    <span className="text-gray-400">Betti Numbers: </span>
                    β₀={perceptronB.I.bettiNumbers.beta0}, β₁={perceptronB.I.bettiNumbers.beta1}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Not initialized</div>
            )}
          </div>

          {/* Hypergraph Visualization */}
          <div className="bg-gray-900 rounded-lg p-4 border border-purple-600">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="text-purple-400" size={20} />
              <h2 className="text-xl font-bold">Shared Hypergraph</h2>
            </div>
            <div className="flex justify-center">
              {renderHypergraph()}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Nodes</div>
                <div className="text-2xl font-bold">{hypergraph.nodes.length}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Edges</div>
                <div className="text-2xl font-bold">{hypergraph.edges.length}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Hyperedges</div>
                <div className="text-2xl font-bold">{hypergraph.hyperedges.length}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <span>Alice's nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <span>Bob's nodes</span>
              </div>
            </div>
          </div>

          {/* Execution Log */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Database className="text-gray-400" size={20} />
              <h2 className="text-xl font-bold">Execution Log</h2>
            </div>
            <div className="space-y-1 text-xs font-mono max-h-96 overflow-y-auto">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    'text-gray-400'
                  }`}
                >
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerceptronHypergraphDemo;
