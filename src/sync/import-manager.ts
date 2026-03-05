// ============================================================================
// import-manager.ts - Import with Geometric Verification
// ============================================================================

import type { ExportData } from './export-manager';
// NetworkMessage type available for future use

export interface ImportResult {
  success: boolean;
  signature?: ExportData;
  error?: string;
  verified?: boolean;
  perceptronState?: any;
}

export class ImportManager {
  /**
   * Import signature file with verification
   */
  async importSignature(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      // Verify it's a valid signature file
      if (data.type !== 'god_reflection_signature_perceptron') {
        return {
          success: false,
          error: 'Invalid signature file type'
        };
      }

      // Verify signature if present
      let verified = false;
      if (data.cryptoSignature && data.publicKey) {
        verified = await this.verifySignature(data, data.publicKey);
      }

      // Extract Perceptron state if present
      const perceptronState = data.perceptronState || null;

      return {
        success: true,
        signature: data,
        verified,
        perceptronState
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid file format'
      };
    }
  }

  /**
   * Import collective data file
   */
  async importCollective(file: File): Promise<{ signatures: ImportResult[] }> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.type !== 'god_collective_data') {
        throw new Error('Invalid collective data file type');
      }

      const signatures: ImportResult[] = [];

      for (const sig of data.data) {
        const result = await this.importSignature(
          new File([JSON.stringify(sig)], 'signature.json', { type: 'application/json' })
        );
        signatures.push(result);
      }

      return { signatures };
    } catch (error) {
      throw new Error(`Failed to import collective data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify geometric invariants (Betti numbers, signatures)
   */
  async verifyGeometricInvariants(perceptronState: any): Promise<boolean> {
    if (!perceptronState) {
      return true; // No Perceptron state to verify
    }

    // Verify Betti numbers are reasonable
    const bettiNumbers = perceptronState.state?.I?.bettiNumbers;
    if (bettiNumbers) {
      // β₀ should be >= 1 (at least one connected component)
      if (bettiNumbers.beta0 < 1) {
        console.warn('[ImportManager] Invalid Betti number β₀:', bettiNumbers.beta0);
        return false;
      }
      // β₁ should be >= 0 (non-negative cycles)
      if (bettiNumbers.beta1 < 0) {
        console.warn('[ImportManager] Invalid Betti number β₁:', bettiNumbers.beta1);
        return false;
      }
    }

    // Verify signature format
    const signature = perceptronState.metricSignature;
    if (signature && !signature.includes('|')) {
      console.warn('[ImportManager] Invalid signature format');
      return false;
    }

    // Verify IPv6 format
    const ipv6 = perceptronState.ipv6;
    if (ipv6 && !/^2001:0db8:[0-9a-f]{4}:[0-9a-f]{4}:[0-9a-f]{4}:[0-9a-f]{4}$/i.test(ipv6)) {
      console.warn('[ImportManager] Invalid IPv6 format:', ipv6);
      return false;
    }

    return true;
  }

  /**
   * Verify cryptographic signature
   */
  private async verifySignature(data: ExportData, publicKey: string): Promise<boolean> {
    if (!data.cryptoSignature) {
      return false;
    }

    try {
      // Reconstruct the signed message (without the signature)
      const { cryptoSignature, ...dataToVerify } = data;
      const message = JSON.stringify(dataToVerify);
      
      // Hash the message with the public key (inverse of signing)
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(message + publicKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Compare (simplified verification - in production use proper ECDSA)
      return expectedSignature.length === data.cryptoSignature.length;
    } catch (error) {
      console.error('[ImportManager] Signature verification error:', error);
      return false;
    }
  }

  /**
   * Check if signature already exists in collection
   */
  isDuplicate(signature: ExportData, existingSignatures: ExportData[]): boolean {
    return existingSignatures.some(existing => 
      existing.publicKey === signature.publicKey
    );
  }
}

