// ============================================================================
// LiveFeed.tsx - Real-Time Feed Component
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Activity, Radio, Users } from 'lucide-react';
import type { BroadcastSyncEvent } from '../sync/broadcast-sync';

interface LiveFeedProps {
  events: BroadcastSyncEvent[];
  onClear?: () => void;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ events, onClear }) => {
  const [isLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (events.length > 0) {
      setLastUpdate(new Date());
    }
  }, [events]);

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="live-feed-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Live Feed
          </h3>
          {lastUpdate && (
            <span className="text-xs text-gray-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {recentEvents.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Waiting for updates from other tabs...</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentEvents.map((event, idx) => (
            <div
              key={idx}
              className="live-feed-item bg-gray-800/50 rounded p-3 border border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'STATE_UPDATE' ? 'bg-blue-500' :
                      event.type === 'HYPERGRAPH_UPDATE' ? 'bg-purple-500' :
                      'bg-green-500'
                    }`} />
                    <span className="text-sm font-semibold">{event.type}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 font-mono">
                    {event.payload.ipv6?.substring(0, 30)}...
                  </div>
                  {event.payload.payload?.triple && (
                    <div className="text-xs text-gray-400 mt-1">
                      {event.payload.payload.triple.subject} → {event.payload.payload.triple.predicate} → {event.payload.payload.triple.object}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span>Syncing with {events.length > 0 ? 'other tabs' : 'no active tabs'}</span>
      </div>
    </div>
  );
};

