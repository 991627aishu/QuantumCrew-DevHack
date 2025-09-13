from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import sqlite3
import json
import random
import threading
import time
from datetime import datetime, timedelta
import os
from ai_brain import BengaluruAIBrain

app = Flask(__name__)
app.config['SECRET_KEY'] = 'bengaluru_heart_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
CORS(app)

# Database setup
def init_db():
    conn = sqlite3.connect('bengaluru_heart.db')
    cursor = conn.cursor()
    
    # Create sensors table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sensors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id TEXT UNIQUE,
            sensor_type TEXT,
            location TEXT,
            latitude REAL,
            longitude REAL,
            value REAL,
            status TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create ai_decisions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            decision_type TEXT,
            parameters TEXT,
            action TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create historical_data table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS historical_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id TEXT,
            value REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# Real ESP32 Hardware Sensor Data for Project Vrishabhavathi
SENSOR_LOCATIONS = [
    {"id": "rain_001", "type": "rainfall", "location": "Koramangala", "lat": 12.9352, "lng": 77.6245, "value": 0},
    {"id": "water_001", "type": "water_level", "location": "Ulsoor Lake", "lat": 12.9716, "lng": 77.6162, "value": 45},
    {"id": "esp32_flow_sensor_001", "type": "flow_rate", "location": "ESP32 Flow Sensor 1 (LDR+Laser)", "lat": 12.9716, "lng": 77.6101, "value": 0},
    {"id": "esp32_flow_sensor_002", "type": "flow_rate", "location": "ESP32 Flow Sensor 2 (LDR+Laser)", "lat": 12.8456, "lng": 77.6603, "value": 0},
    {"id": "esp32_flow_velocity_001", "type": "flow_velocity", "location": "ESP32 Flow Velocity 1", "lat": 12.9716, "lng": 77.6101, "value": 0},
    {"id": "esp32_flow_velocity_002", "type": "flow_velocity", "location": "ESP32 Flow Velocity 2", "lat": 12.8456, "lng": 77.6603, "value": 0},
    {"id": "esp32_flow_direction_001", "type": "valve", "location": "ESP32 Flow Direction 1", "lat": 12.9716, "lng": 77.6101, "value": 0},
    {"id": "esp32_flow_direction_002", "type": "valve", "location": "ESP32 Flow Direction 2", "lat": 12.8456, "lng": 77.6603, "value": 0},
    {"id": "esp32_water_level", "type": "water_level", "location": "ESP32 Water Level Sensor", "lat": 12.9716, "lng": 77.6101, "value": 0},
    {"id": "esp32_pump_status", "type": "valve", "location": "ESP32 Pump Control", "lat": 12.9716, "lng": 77.6101, "value": 0},
    {"id": "esp32_valve_inlet", "type": "valve", "location": "ESP32 Inlet Valve", "lat": 12.9716, "lng": 77.6101, "value": 0},
    {"id": "esp32_valve_outlet", "type": "valve", "location": "ESP32 Outlet Valve", "lat": 12.9716, "lng": 77.6101, "value": 0},
    {"id": "storage_001", "type": "storage", "location": "Hebbal Tank", "lat": 13.0359, "lng": 77.5970, "value": 78},
    {"id": "valve_001", "type": "valve", "location": "Whitefield Pump", "lat": 12.9698, "lng": 77.7500, "value": 1},
    {"id": "rain_002", "type": "rainfall", "location": "Indiranagar", "lat": 12.9719, "lng": 77.6412, "value": 0},
    {"id": "water_002", "type": "water_level", "location": "Bellandur Lake", "lat": 12.9255, "lng": 77.6688, "value": 82},
    {"id": "storage_002", "type": "storage", "location": "Yelahanka Tank", "lat": 13.1007, "lng": 77.5963, "value": 65},
    {"id": "valve_002", "type": "valve", "location": "Marathahalli Pump", "lat": 12.9581, "lng": 77.7015, "value": 0}
]

# Initialize sensors in database
def init_sensors():
    conn = sqlite3.connect('bengaluru_heart.db')
    cursor = conn.cursor()
    
    for sensor in SENSOR_LOCATIONS:
        cursor.execute('''
            INSERT OR REPLACE INTO sensors 
            (sensor_id, sensor_type, location, latitude, longitude, value, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            sensor["id"], sensor["type"], sensor["location"], 
            sensor["lat"], sensor["lng"], sensor["value"], "active"
        ))
    
    conn.commit()
    conn.close()

# Initialize sensors
init_sensors()

# Initialize AI Brain
ai_brain = BengaluruAIBrain()

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    """Get all sensor data"""
    conn = sqlite3.connect('bengaluru_heart.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT sensor_id, sensor_type, location, latitude, longitude, value, status, timestamp
        FROM sensors ORDER BY timestamp DESC
    ''')
    
    sensors = []
    for row in cursor.fetchall():
        sensors.append({
            "id": row[0],
            "type": row[1],
            "location": row[2],
            "lat": row[3],
            "lng": row[4],
            "value": row[5],
            "status": row[6],
            "timestamp": row[7]
        })
    
    conn.close()
    return jsonify(sensors)

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """Get rainfall forecast for next 7 days"""
    forecast = []
    base_date = datetime.now()
    
    for i in range(7):
        date = base_date + timedelta(days=i)
        # Simulate realistic rainfall patterns
        if i < 3:  # Higher chance of rain in first 3 days
            rainfall = random.uniform(0, 15)
        else:
            rainfall = random.uniform(0, 8)
        
        forecast.append({
            "date": date.strftime("%Y-%m-%d"),
            "rainfall": round(rainfall, 1),
            "probability": random.randint(20, 80)
        })
    
    return jsonify(forecast)

@app.route('/api/control', methods=['POST'])
def control_valve():
    """Control valve/pump status"""
    data = request.get_json()
    valve_id = data.get('valve_id')
    action = data.get('action')  # 'open' or 'close'
    
    conn = sqlite3.connect('bengaluru_heart.db')
    cursor = conn.cursor()
    
    # Update valve status
    status = 1 if action == 'open' else 0
    cursor.execute('''
        UPDATE sensors SET value = ?, timestamp = CURRENT_TIMESTAMP
        WHERE sensor_id = ? AND sensor_type = 'valve'
    ''', (status, valve_id))
    
    # Log AI decision
    cursor.execute('''
        INSERT INTO ai_decisions (decision_type, parameters, action)
        VALUES (?, ?, ?)
    ''', ('valve_control', json.dumps({"valve_id": valve_id}), action))
    
    conn.commit()
    conn.close()
    
    # Emit update to all connected clients
    socketio.emit('valve_update', {
        'valve_id': valve_id,
        'action': action,
        'status': status,
        'timestamp': datetime.now().isoformat()
    })
    
    return jsonify({"status": "success", "action": action, "valve_id": valve_id})

@app.route('/api/ai-decision', methods=['GET'])
def get_ai_decision():
    """Get AI recommendations based on current sensor data"""
    try:
        # Use the AI Brain for smart decisions
        ai_result = ai_brain.make_decision()
        return jsonify(ai_result['decisions'])
    except Exception as e:
        print(f"AI Brain error: {e}")
        # Fallback to simple logic
        conn = sqlite3.connect('bengaluru_heart.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT sensor_type, AVG(value) FROM sensors GROUP BY sensor_type')
        sensor_data = {row[0]: row[1] for row in cursor.fetchall()}
        
        recommendations = []
        
        avg_rainfall = sensor_data.get('rainfall', 0)
        avg_water_level = sensor_data.get('water_level', 0)
        avg_storage = sensor_data.get('storage', 0)
        
        if avg_rainfall > 10 and avg_storage < 80:
            recommendations.append({
                "type": "recharge_wells",
                "message": "High rainfall detected. Directing water to recharge wells.",
                "priority": "high"
            })
        
        if avg_storage > 90:
            recommendations.append({
                "type": "lake_diversion",
                "message": "Storage tanks near capacity. Diverting to lakes.",
                "priority": "urgent"
            })
        
        if avg_water_level > 85:
            recommendations.append({
                "type": "overflow_pump",
                "message": "Water levels critical. Activating overflow pumps to Kolar.",
                "priority": "critical"
            })
        
        if not recommendations:
            recommendations.append({
                "type": "normal_operation",
                "message": "All systems operating normally.",
                "priority": "low"
            })
        
        conn.close()
        return jsonify(recommendations)

@app.route('/api/sensor-data', methods=['POST'])
def receive_sensor_data():
    """Receive data from real sensors"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['device_id', 'device_type', 'location', 'value']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        # Validate sensor data
        sensor_type = data['device_type']
        value = data['value']
        
        # Basic validation ranges
        validation_ranges = {
            'rainfall': (0, 100),
            'water_level': (0, 100),
            'flow_rate': (0, 500),
            'storage': (0, 100),
            'valve': (0, 1)
        }
        
        if sensor_type in validation_ranges:
            min_val, max_val = validation_ranges[sensor_type]
            if not (min_val <= value <= max_val):
                return jsonify({"error": f"Value {value} out of range {min_val}-{max_val}"}), 400
        
        # Store in database
        conn = sqlite3.connect('bengaluru_heart.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO sensors 
            (sensor_id, sensor_type, location, latitude, longitude, value, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['device_id'],
            data['device_type'],
            data['location'],
            data.get('latitude', 0),
            data.get('longitude', 0),
            data['value'],
            data.get('status', 'active'),
            data.get('timestamp', datetime.now().isoformat())
        ))
        
        # Store historical data
        cursor.execute('''
            INSERT INTO historical_data (sensor_id, value, timestamp)
            VALUES (?, ?, ?)
        ''', (
            data['device_id'],
            data['value'],
            data.get('timestamp', datetime.now().isoformat())
        ))
        
        conn.commit()
        conn.close()
        
        # Emit real-time update to all connected clients
        socketio.emit('sensor_update', {
            'sensors': [data],
            'timestamp': datetime.now().isoformat()
        })
        
        print(f"📡 Received data from {data['device_id']}: {data['value']}")
        
        return jsonify({
            "status": "success", 
            "message": "Data received and processed",
            "sensor_id": data['device_id']
        })
        
    except Exception as e:
        print(f"❌ Error processing sensor data: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/historical/<sensor_id>', methods=['GET'])
def get_historical_data(sensor_id):
    """Get historical data for a specific sensor"""
    hours = request.args.get('hours', 24, type=int)
    
    conn = sqlite3.connect('bengaluru_heart.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT value, timestamp FROM historical_data
        WHERE sensor_id = ? AND timestamp > datetime('now', '-{} hours')
        ORDER BY timestamp ASC
    '''.format(hours), (sensor_id,))
    
    data = [{"value": row[0], "timestamp": row[1]} for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(data)

@app.route('/api/ai-health', methods=['GET'])
def get_ai_health():
    """Get AI health analysis"""
    try:
        ai_result = ai_brain.make_decision()
        return jsonify(ai_result['health_analysis'])
    except Exception as e:
        print(f"AI Health error: {e}")
        return jsonify({
            'health_score': 75,
            'status': 'warning',
            'issues': ['AI Brain temporarily unavailable']
        })

@app.route('/api/ai-predictions', methods=['GET'])
def get_ai_predictions():
    """Get AI predictions"""
    try:
        ai_result = ai_brain.make_decision()
        return jsonify(ai_result['predictions'])
    except Exception as e:
        print(f"AI Predictions error: {e}")
        return jsonify([])

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('status', {'message': 'Connected to Project Vrishabhavathi'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')

def simulate_sensor_updates():
    """Simulate sensor data updates"""
    while True:
        conn = sqlite3.connect('bengaluru_heart.db')
        cursor = conn.cursor()
        
        for sensor in SENSOR_LOCATIONS:
            # Generate realistic sensor values
            if sensor["type"] == "rainfall":
                # Simulate rainfall (0-20mm)
                new_value = random.uniform(0, 20)
            elif sensor["type"] == "water_level":
                # Simulate water level (0-100%)
                new_value = random.uniform(30, 95)
            elif sensor["type"] == "flow_rate":
                # Simulate flow rate (50-200 L/min)
                new_value = random.uniform(50, 200)
            elif sensor["type"] == "storage":
                # Simulate storage capacity (20-100%)
                new_value = random.uniform(20, 100)
            elif sensor["type"] == "valve":
                # Keep valve status as is
                new_value = sensor["value"]
            
            # Update sensor in database
            cursor.execute('''
                UPDATE sensors SET value = ?, timestamp = CURRENT_TIMESTAMP
                WHERE sensor_id = ?
            ''', (new_value, sensor["id"]))
            
            # Store historical data
            cursor.execute('''
                INSERT INTO historical_data (sensor_id, value)
                VALUES (?, ?)
            ''', (sensor["id"], new_value))
            
            # Update sensor object
            sensor["value"] = new_value
        
        conn.commit()
        conn.close()
        
        # Emit update to all connected clients
        socketio.emit('sensor_update', {
            'sensors': SENSOR_LOCATIONS,
            'timestamp': datetime.now().isoformat()
        })
        
        time.sleep(5)  # Update every 5 seconds

if __name__ == '__main__':
    # Start sensor simulation in background thread
    sensor_thread = threading.Thread(target=simulate_sensor_updates, daemon=True)
    sensor_thread.start()
    
    print("Project Vrishabhavathi Backend Starting...")
    print("WebSocket server running on ws://localhost:5000")
    print("REST API available at http://localhost:5000")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
