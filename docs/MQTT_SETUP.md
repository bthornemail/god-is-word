# MQTT Setup Guide for Collective Discovery

## Overview

The God Reflection Journal now supports MQTT (Mosquitto) for real-time collective signature discovery and search. This allows users to share and discover signatures over a network in addition to QR code and file imports.

## Architecture

- **MQTT Broker**: Central message broker (Mosquitto)
- **Topics**:
  - `god-mirror/signatures/{publicKey}` - Individual signature publications
  - `god-mirror/signatures/+` - Discovery subscription (wildcard)
  - `god-mirror/search/query` - Search queries
  - `god-mirror/search/response/{clientId}` - Search responses

## Setup Instructions

### 1. Install Mosquitto MQTT Broker

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients
```

#### macOS:
```bash
brew install mosquitto
```

#### Docker:
```bash
docker run -it -p 1883:1883 -p 9001:9001 eclipse-mosquitto
```

### 2. Configure Mosquitto for WebSocket

Edit `/etc/mosquitto/mosquitto.conf`:

```conf
# WebSocket listener
listener 9001
protocol websockets

# Standard MQTT listener
listener 1883
protocol mqtt

# Allow anonymous connections (for development)
allow_anonymous true

# Logging
log_dest file /var/log/mosquitto/mosquitto.log
log_type all
```

### 3. Start Mosquitto

```bash
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

Or manually:
```bash
mosquitto -c /etc/mosquitto/mosquitto.conf
```

### 4. Configure in App

1. Open the app and go to **Collective** view
2. Scroll to **MQTT Collective Discovery** section
3. Click "Configure MQTT"
4. Enter broker URL: `ws://localhost:9001` (for local) or `ws://your-broker:9001` (for remote)
5. Optionally enter username/password if broker requires authentication
6. Click "Connect to MQTT Broker"

## Usage

### Discovery

Once connected, the app automatically:
- Subscribes to signature discoveries
- Receives signatures published by other users
- Displays discovered signatures in the list

### Search

1. Enter a search query (e.g., "love", "peace")
2. Click "Search"
3. Results appear in the discovered signatures list

### Publishing

Your signature is automatically published to MQTT when:
- You save a journal entry (if MQTT is connected)
- Your signature is available for others to discover

### Import

1. Browse discovered signatures
2. Click "Import" on any signature
3. Signature is added to your collective data
4. Analytics update automatically

## Network Setup

### Local Network
- Use `ws://localhost:9001` for same machine
- Use `ws://<local-ip>:9001` for local network

### Public Broker
- Use public MQTT brokers like `test.mosquitto.org` (port 8080)
- Or set up your own public-facing broker

### Security (Production)

For production use, configure authentication:

```conf
# Require authentication
allow_anonymous false
password_file /etc/mosquitto/passwd

# Use SSL/TLS
listener 9001
protocol websockets
cafile /etc/ssl/certs/ca-certificates.crt
certfile /etc/mosquitto/certs/server.crt
keyfile /etc/mosquitto/certs/server.key
```

## Testing

### Test Connection
```bash
# Terminal 1: Start broker
mosquitto -c /etc/mosquitto/mosquitto.conf

# Terminal 2: Subscribe to discoveries
mosquitto_sub -h localhost -p 1883 -t "god-mirror/signatures/+"

# Terminal 3: Publish a test signature
mosquitto_pub -h localhost -p 1883 -t "god-mirror/signatures/test123" -m '{"type":"test","publicKey":"test123"}'
```

### Test WebSocket Connection
```javascript
const client = mqtt.connect('ws://localhost:9001');
client.on('connect', () => console.log('Connected!'));
```

## Troubleshooting

### Connection Failed
- Check broker is running: `sudo systemctl status mosquitto`
- Verify WebSocket port (9001) is open
- Check firewall settings
- Verify broker URL format: `ws://` not `http://` or `mqtt://`

### No Discoveries
- Ensure other users are connected and publishing
- Check broker logs: `tail -f /var/log/mosquitto/mosquitto.log`
- Verify topic subscriptions are correct

### WebSocket Errors
- Ensure Mosquitto is configured with WebSocket support
- Check port 9001 is not blocked
- Try using standard MQTT port 1883 if WebSocket unavailable (requires different connection method)

## Advanced Configuration

### Custom Topics
Modify topics in MQTT config:
```typescript
{
  signatures: 'god-mirror/signatures',
  discovery: 'god-mirror/signatures/+',
  search: 'god-mirror/search',
}
```

### Quality of Service (QoS)
Currently using QoS 1 (at least once delivery). Can be modified in `src/sync/mqtt-sync.ts`.

### Retention
Signatures are not retained by default. To enable:
- Add `retain: true` in `publishSignature()` calls
- Configure broker retention policy

## Production Considerations

1. **Authentication**: Require username/password or certificates
2. **SSL/TLS**: Use WSS (wss://) instead of WS for encrypted connections
3. **Rate Limiting**: Configure broker to prevent abuse
4. **Monitoring**: Set up broker monitoring and alerts
5. **Backup**: Regular backup of broker state (if using persistence)

