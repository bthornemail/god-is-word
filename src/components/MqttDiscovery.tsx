// ============================================================================
// MqttDiscovery.tsx - MQTT Collective Discovery Component
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Network, Search, Wifi, WifiOff, Download } from 'lucide-react';
import { MqttSync, type DiscoveryResult, type MqttConfig, type SearchQuery } from '../sync/mqtt-sync';
import type { ExportData } from '../sync/export-manager';

interface MqttDiscoveryProps {
  publicKey: string; // This is actually the private key, we'll hash it to get public key
  onImportSignature: (signature: ExportData) => Promise<void>;
  onPublishRequest?: (publishFn: (signature: ExportData) => Promise<void>) => void; // Callback to expose publish function
}

export const MqttDiscovery: React.FC<MqttDiscoveryProps> = ({
  publicKey: privateKey,
  onImportSignature,
  onPublishRequest
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [discoveredSignatures, setDiscoveredSignatures] = useState<DiscoveryResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>({
    brokerUrl: 'ws://localhost:9001',
    topics: {
      signatures: 'god-mirror/signatures',
      discovery: 'god-mirror/signatures/+',
      search: 'god-mirror/search',
    },
  });
  const [showConfig, setShowConfig] = useState(false);
  const [actualPublicKey, setActualPublicKey] = useState<string>('');

  const mqttSyncRef = useRef<MqttSync | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Compute public key from private key
  useEffect(() => {
    const computePublicKey = async () => {
      if (!privateKey) return;
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(privateKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setActualPublicKey(hashHex);
      } catch (error) {
        console.error('[MqttDiscovery] Failed to compute public key:', error);
      }
    };
    computePublicKey();
  }, [privateKey]);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mqtt_config');
    if (saved) {
      try {
        setMqttConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load MQTT config:', e);
      }
    }
  }, []);

  // Connect to MQTT
  const handleConnect = async () => {
    if (!actualPublicKey) {
      alert('Public key not available. Please ensure you have a private key.');
      return;
    }

    setIsConnecting(true);
    try {
      const mqttSync = new MqttSync(mqttConfig, actualPublicKey);
      mqttSyncRef.current = mqttSync;

      // Subscribe to discoveries
      unsubscribeRef.current = mqttSync.onDiscovery((result) => {
        setDiscoveredSignatures((prev) => {
          // Avoid duplicates
          const exists = prev.find((r) => r.publicKey === result.publicKey);
          if (exists) {
            return prev.map((r) => (r.publicKey === result.publicKey ? result : r));
          }
          return [...prev, result];
        });
      });

      await mqttSync.connect();
      setIsConnected(true);

      // Expose publish function to parent
      if (onPublishRequest) {
        onPublishRequest(async (signature: ExportData) => {
          if (mqttSyncRef.current && isConnected) {
            try {
              await mqttSyncRef.current.publishSignature(signature);
              console.log('[MqttDiscovery] Published signature to MQTT');
            } catch (error) {
              console.error('[MqttDiscovery] Failed to publish:', error);
            }
          }
        });
      }

      // Save config
      localStorage.setItem('mqtt_config', JSON.stringify(mqttConfig));
    } catch (error) {
      console.error('[MqttDiscovery] Connection failed:', error);
      alert(`Failed to connect to MQTT broker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from MQTT
  const handleDisconnect = () => {
    if (mqttSyncRef.current) {
      mqttSyncRef.current.disconnect();
      mqttSyncRef.current = null;
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsConnected(false);
    setDiscoveredSignatures([]);
  };

  // Expose publish function to parent via callback prop (to be added)

  // Search for signatures
  const handleSearch = async () => {
    if (!mqttSyncRef.current || !searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const query: SearchQuery = {
        query: searchQuery.trim(),
        filters: {
          minEntries: 1,
        },
      };

      const resultsPromise = await mqttSyncRef.current.search(query);
      const results = await resultsPromise;

      setDiscoveredSignatures((prev) => {
        const newResults = results.filter((r) => !prev.find((p) => p.publicKey === r.publicKey));
        return [...prev, ...newResults];
      });
    } catch (error) {
      console.error('[MqttDiscovery] Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Import a discovered signature
  const handleImport = async (result: DiscoveryResult) => {
    try {
      const exportData: ExportData = {
        type: result.signature.type,
        version: result.signature.version,
        generated: result.signature.generated,
        signature: result.signature.signature,
        entries: result.signature.entries,
        pattern: result.signature.pattern,
        publicKey: result.signature.publicKey,
        cryptoSignature: result.signature.cryptoSignature,
        perceptronState: result.signature.perceptronState,
      };

      await onImportSignature(exportData);

      // Remove from discovered list after import
      setDiscoveredSignatures((prev) => prev.filter((r) => r.publicKey !== result.publicKey));
    } catch (error) {
      console.error('[MqttDiscovery] Import failed:', error);
      alert('Failed to import signature');
    }
  };

  return (
    <div className="mqtt-discovery">
      <div className="mqtt-header">
        <h3 className="mqtt-title">
          <Network className="w-5 h-5" />
          MQTT Collective Discovery
        </h3>
        <div className="mqtt-status">
          {isConnected ? (
            <span className="status-connected">
              <Wifi className="w-4 h-4" />
              Connected
            </span>
          ) : (
            <span className="status-disconnected">
              <WifiOff className="w-4 h-4" />
              Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Connection Controls */}
      <div className="mqtt-controls">
        {!isConnected ? (
          <>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="btn btn-secondary"
            >
              {showConfig ? 'Hide' : 'Configure'} MQTT
            </button>
            {showConfig && (
              <div className="mqtt-config">
                <label>
                  Broker URL (WebSocket):
                  <input
                    type="text"
                    value={mqttConfig.brokerUrl}
                    onChange={(e) =>
                      setMqttConfig({ ...mqttConfig, brokerUrl: e.target.value })
                    }
                    placeholder="ws://localhost:9001"
                    className="input"
                  />
                </label>
                <label>
                  Username (optional):
                  <input
                    type="text"
                    value={mqttConfig.username || ''}
                    onChange={(e) =>
                      setMqttConfig({ ...mqttConfig, username: e.target.value || undefined })
                    }
                    className="input"
                  />
                </label>
                <label>
                  Password (optional):
                  <input
                    type="password"
                    value={mqttConfig.password || ''}
                    onChange={(e) =>
                      setMqttConfig({ ...mqttConfig, password: e.target.value || undefined })
                    }
                    className="input"
                  />
                </label>
              </div>
            )}
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn btn-primary"
            >
              {isConnecting ? 'Connecting...' : 'Connect to MQTT Broker'}
            </button>
          </>
        ) : (
          <>
            <button onClick={handleDisconnect} className="btn btn-secondary">
              Disconnect
            </button>
            <div className="search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for signatures (e.g., 'love', 'peace')..."
                className="input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="btn btn-success"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Discovered Signatures */}
      {discoveredSignatures.length > 0 && (
        <div className="discovered-signatures">
          <h4>Discovered Signatures ({discoveredSignatures.length})</h4>
          <div className="signatures-list">
            {discoveredSignatures.map((result) => (
              <div key={result.publicKey} className="signature-item">
                <div className="signature-info">
                  <div className="signature-header">
                    <span className="signature-key">
                      {result.publicKey.substring(0, 16)}...
                    </span>
                    <span className="signature-time">
                      {new Date(result.receivedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="signature-details">
                    <span>Entries: {result.signature.entries.length}</span>
                    <span>Pattern: +{result.signature.pattern.positive} / -{result.signature.pattern.negative} / ~{result.signature.pattern.neutral}</span>
                  </div>
                  {result.distance !== undefined && (
                    <div className="signature-distance">
                      Distance: {result.distance.toFixed(2)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleImport(result)}
                  className="btn btn-success btn-sm"
                >
                  <Download className="w-4 h-4" />
                  Import
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .mqtt-discovery {
          background: rgba(30, 27, 75, 0.4);
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
        }

        .mqtt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .mqtt-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          color: #e0e7ff;
        }

        .mqtt-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }

        .status-connected {
          color: #10b981;
        }

        .status-disconnected {
          color: #9ca3af;
        }

        .mqtt-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .mqtt-config {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mqtt-config label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #c7d2fe;
          font-size: 14px;
        }

        .input {
          padding: 8px 12px;
          background: rgba(30, 27, 75, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 6px;
          color: #f3f4f6;
          font-size: 14px;
        }

        .input:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .search-box {
          display: flex;
          gap: 8px;
        }

        .search-box .input {
          flex: 1;
        }

        .discovered-signatures {
          margin-top: 24px;
        }

        .discovered-signatures h4 {
          font-size: 16px;
          font-weight: 600;
          color: #e0e7ff;
          margin-bottom: 12px;
        }

        .signatures-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .signature-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          padding: 16px;
        }

        .signature-info {
          flex: 1;
        }

        .signature-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .signature-key {
          font-family: monospace;
          font-size: 12px;
          color: #a78bfa;
        }

        .signature-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .signature-details {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #c7d2fe;
        }

        .signature-distance {
          margin-top: 4px;
          font-size: 11px;
          color: #9ca3af;
          font-style: italic;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

