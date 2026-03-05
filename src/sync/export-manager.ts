// ============================================================================
// export-manager.ts - Enhanced Export with Perceptron State
// ============================================================================

// NetworkMessage type available for future use

export interface ExportData {
  type: 'god_reflection_signature_perceptron';
  version: string;
  generated: string;
  signature: string;
  entries: any[];
  pattern: any;
  publicKey: string;
  cryptoSignature: string;
  
  // Enhanced with Perceptron state
  perceptronState?: {
    state: any;
    hypergraph: {
      nodes: any[];
      edges: any[];
    };
    eventLog: any[];
    tau_state: number;
    ipv6: string;
    metricSignature: string;
  };
}

export class ExportManager {
  /**
   * Export signature with full Perceptron state
   */
  async exportSignature(
    entries: any[],
    pattern: any,
    privateKey: string,
    perceptronState?: any
  ): Promise<ExportData> {
    const signature = entries.map((e: any) => e.word).join('-');
    const publicKey = await this.hashMessage(privateKey);

    const data: ExportData = {
      type: 'god_reflection_signature_perceptron',
      version: '2.1.0', // Version bump for Perceptron integration
      generated: new Date().toISOString(),
      signature,
      entries,
      pattern,
      publicKey,
      cryptoSignature: ''
    };

    // Add Perceptron state if provided
    if (perceptronState) {
      data.perceptronState = {
        state: perceptronState.state,
        hypergraph: perceptronState.hypergraph,
        eventLog: perceptronState.eventLog || [],
        tau_state: perceptronState.state?.H?.tau_state || 0,
        ipv6: perceptronState.state?.ipv6 || '',
        metricSignature: perceptronState.state?.S || ''
      };
    }

    // Sign the data
    const message = JSON.stringify(data);
    data.cryptoSignature = await this.signData(message, privateKey);

    return data;
  }

  /**
   * Export as JSON file
   */
  async exportAsFile(data: ExportData, filename?: string): Promise<void> {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `god-signature-perceptron-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export collective data from multiple signatures
   */
  async exportCollective(signatures: (ExportData | any)[]): Promise<void> {
    // Convert any CollectiveSignature to ExportData format
    const convertedSignatures = signatures.map(sig => {
      if (sig.type === 'god_reflection_signature_perceptron' && sig.version && sig.signature) {
        return sig as ExportData;
      }
      // Convert CollectiveSignature to ExportData format
      return {
        type: 'god_reflection_signature_perceptron' as const,
        version: sig.version || '2.0.0',
        generated: sig.generated || new Date().toISOString(),
        signature: sig.signature || sig.entries?.map((e: any) => e.word).join('-') || '',
        entries: sig.entries || [],
        pattern: sig.pattern || { positive: 0, negative: 0, neutral: 0 },
        publicKey: sig.publicKey || '',
        cryptoSignature: sig.cryptoSignature || '',
        perceptronState: sig.perceptronState
      } as ExportData;
    });

    const collective = {
      type: 'god_collective_data',
      version: '2.1.0',
      generated: new Date().toISOString(),
      data: convertedSignatures,
      // Aggregate Perceptron states
      aggregateHypergraph: this.aggregateHypergraphs(convertedSignatures)
    };

    const blob = new Blob([JSON.stringify(collective, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `god-collective-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Aggregate hypergraphs from multiple signatures
   */
  private aggregateHypergraphs(signatures: ExportData[]) {
    const allNodes = new Map<string, any>();
    const allEdges = new Map<string, any>();

    signatures.forEach(sig => {
      if (sig.perceptronState?.hypergraph) {
        sig.perceptronState.hypergraph.nodes.forEach((node: any) => {
          if (!allNodes.has(node.id)) {
            allNodes.set(node.id, node);
          }
        });
        sig.perceptronState.hypergraph.edges.forEach((edge: any) => {
          if (!allEdges.has(edge.id)) {
            allEdges.set(edge.id, edge);
          }
        });
      }
    });

    return {
      nodes: Array.from(allNodes.values()),
      edges: Array.from(allEdges.values()),
      totalSignatures: signatures.length
    };
  }

  private async hashMessage(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async signData(message: string, privateKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message + privateKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

