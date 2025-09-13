# Bengaluru Heart System - Pure Real-Time Backend

## Language: Python 🐍

**Framework:** Flask + SocketIO for WebSocket support
**Storage:** Pure In-Memory (No Database)
**Performance:** Optimized for real-time operations

## Features

✅ **Zero Database Queries** during real-time operations
✅ **In-Memory Data Store** for instant access
✅ **WebSocket Broadcasting** for live updates
✅ **Real-Time AI Decisions** without DB overhead
✅ **Instant Sensor Updates** with immediate broadcast
✅ **Memory-Efficient** caching system

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

## API Endpoints

- `GET /api/sensors` - Current sensor data (from memory)
- `POST /api/sensors` - Update sensors + trigger AI decisions
- `GET /api/health` - System health status
- `GET /api/decisions` - Recent AI decisions (last 10)
- `GET /api/routing` - Current water routing plan
- `POST /api/control` - Manual system control
- `GET /api/status` - Server status and metrics

## WebSocket Events

- `connect` - Client connects, receives current data
- `sensor_update` - Real-time sensor data broadcast
- `control_update` - Manual control actions
- `minor_update` - Small fluctuations for realism

## Data Flow

```
IoT Sensors → POST /api/sensors → In-Memory Update → AI Analysis → WebSocket Broadcast → Frontend
```

## Memory Structure

```python
data_store = {
    'sensors': {...},           # Current readings
    'recent_decisions': [...],  # Last 10 AI decisions
    'system_health': {...},     # Health metrics
    'routing_plan': {...},      # Water routing
    'connected_clients': 0      # WebSocket clients
}
```

## Performance Benefits

- **0ms Database Queries** during real-time operations
- **Instant AI Decisions** from in-memory data
- **Sub-second WebSocket Updates** to all clients
- **Minimal Memory Footprint** with smart caching
- **High Concurrency** support for multiple sensors

Perfect for hackathons and real-time demos! 🚀