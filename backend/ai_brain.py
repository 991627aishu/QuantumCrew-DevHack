#!/usr/bin/env python3
"""
Project Vrishabhavathi - AI Brain
Smart decision making for water management
"""

import json
import sqlite3
from datetime import datetime, timedelta
import random
import math

class BengaluruAIBrain:
    def __init__(self, db_path='bengaluru_heart.db'):
        self.db_path = db_path
        self.decision_history = []
        
    def get_current_sensor_data(self):
        """Get current sensor data from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT sensor_type, AVG(value) as avg_value, COUNT(*) as count
            FROM sensors 
            WHERE status = 'active'
            GROUP BY sensor_type
        ''')
        
        sensor_data = {}
        for row in cursor.fetchall():
            sensor_data[row[0]] = {
                'avg_value': row[1],
                'count': row[2]
            }
        
        conn.close()
        return sensor_data
    
    def get_weather_context(self):
        """Get weather context (simulated)"""
        # In a real implementation, this would connect to weather APIs
        current_hour = datetime.now().hour
        season = self._get_season()
        
        # Simulate weather patterns
        if 6 <= current_hour <= 18:  # Daytime
            rain_probability = 0.3 if season == 'monsoon' else 0.1
        else:  # Nighttime
            rain_probability = 0.2 if season == 'monsoon' else 0.05
            
        return {
            'rain_probability': rain_probability,
            'season': season,
            'temperature': random.uniform(20, 35),
            'humidity': random.uniform(40, 90)
        }
    
    def _get_season(self):
        """Determine current season"""
        month = datetime.now().month
        if month in [6, 7, 8, 9]:  # Monsoon
            return 'monsoon'
        elif month in [10, 11, 12, 1]:  # Winter
            return 'winter'
        else:  # Summer
            return 'summer'
    
    def analyze_water_system_health(self, sensor_data):
        """Analyze overall water system health"""
        health_score = 100
        issues = []
        
        # Check rainfall levels
        rainfall = sensor_data.get('rainfall', {}).get('avg_value', 0)
        if rainfall > 20:
            health_score -= 20
            issues.append('Heavy rainfall detected - risk of flooding')
        elif rainfall > 10:
            health_score -= 10
            issues.append('Moderate rainfall - monitor water levels')
        
        # Check water levels
        water_level = sensor_data.get('water_level', {}).get('avg_value', 0)
        if water_level > 85:
            health_score -= 25
            issues.append('Critical water levels - immediate action required')
        elif water_level > 70:
            health_score -= 15
            issues.append('High water levels - prepare for overflow')
        
        # Check storage capacity
        storage = sensor_data.get('storage', {}).get('avg_value', 0)
        if storage > 95:
            health_score -= 30
            issues.append('Storage tanks at critical capacity')
        elif storage > 80:
            health_score -= 10
            issues.append('Storage tanks nearing capacity')
        
        # Check flow rates
        flow_rate = sensor_data.get('flow_rate', {}).get('avg_value', 0)
        if flow_rate > 200:
            health_score -= 15
            issues.append('High flow rates - system stress')
        elif flow_rate < 50:
            health_score -= 10
            issues.append('Low flow rates - potential blockage')
        
        return {
            'health_score': max(0, health_score),
            'issues': issues,
            'status': 'critical' if health_score < 50 else 'warning' if health_score < 80 else 'healthy'
        }
    
    def generate_smart_decisions(self, sensor_data, weather_context):
        """Generate smart decisions based on current conditions"""
        decisions = []
        
        rainfall = sensor_data.get('rainfall', {}).get('avg_value', 0)
        water_level = sensor_data.get('water_level', {}).get('avg_value', 0)
        storage = sensor_data.get('storage', {}).get('avg_value', 0)
        flow_rate = sensor_data.get('flow_rate', {}).get('avg_value', 0)
        
        # Decision 1: Rainwater Harvesting
        if rainfall > 5 and storage < 80:
            decisions.append({
                'type': 'recharge_wells',
                'priority': 'high',
                'message': f'Rainfall of {rainfall:.1f}mm detected. Directing water to recharge wells to maximize groundwater recharge.',
                'action': 'activate_recharge_wells',
                'confidence': 0.85
            })
        
        # Decision 2: Lake Diversion
        if storage > 90 and water_level < 70:
            decisions.append({
                'type': 'lake_diversion',
                'priority': 'urgent',
                'message': f'Storage at {storage:.1f}% capacity. Diverting excess water to lakes.',
                'action': 'divert_to_lakes',
                'confidence': 0.90
            })
        
        # Decision 3: Overflow Management
        if water_level > 85 or storage > 95:
            decisions.append({
                'type': 'overflow_pump',
                'priority': 'critical',
                'message': f'Critical levels detected (Water: {water_level:.1f}%, Storage: {storage:.1f}%). Activating overflow pumps to Kolar.',
                'action': 'activate_overflow_pumps',
                'confidence': 0.95
            })
        
        # Decision 4: Flow Optimization
        if flow_rate > 180:
            decisions.append({
                'type': 'flow_optimization',
                'priority': 'medium',
                'message': f'High flow rate of {flow_rate:.1f} L/min detected. Optimizing drainage to prevent system stress.',
                'action': 'optimize_flow',
                'confidence': 0.75
            })
        
        # Decision 5: Preventive Measures
        if weather_context['rain_probability'] > 0.7 and storage > 60:
            decisions.append({
                'type': 'preventive_drainage',
                'priority': 'medium',
                'message': f'High rain probability ({weather_context["rain_probability"]*100:.0f}%). Preparing drainage systems.',
                'action': 'prepare_drainage',
                'confidence': 0.70
            })
        
        # Decision 6: Normal Operation
        if not decisions:
            decisions.append({
                'type': 'normal_operation',
                'priority': 'low',
                'message': 'All systems operating within normal parameters. Continue monitoring.',
                'action': 'monitor',
                'confidence': 0.95
            })
        
        return decisions
    
    def predict_future_scenarios(self, sensor_data, weather_context):
        """Predict future scenarios based on current data"""
        predictions = []
        
        # Predict water level trends
        current_water = sensor_data.get('water_level', {}).get('avg_value', 50)
        rainfall = sensor_data.get('rainfall', {}).get('avg_value', 0)
        
        # Simple prediction model
        if rainfall > 10:
            predicted_water = min(100, current_water + rainfall * 2)
            predictions.append({
                'metric': 'water_level',
                'current': current_water,
                'predicted_1h': predicted_water,
                'trend': 'increasing',
                'confidence': 0.8
            })
        
        # Predict storage capacity
        current_storage = sensor_data.get('storage', {}).get('avg_value', 50)
        if current_storage > 70:
            predicted_storage = min(100, current_storage + 5)
            predictions.append({
                'metric': 'storage',
                'current': current_storage,
                'predicted_1h': predicted_storage,
                'trend': 'increasing',
                'confidence': 0.7
            })
        
        return predictions
    
    def optimize_water_routing(self, sensor_data):
        """Optimize water routing based on current conditions"""
        routing_plan = {
            'recharge_wells': 0,
            'lakes': 0,
            'storage_tanks': 0,
            'overflow_systems': 0
        }
        
        rainfall = sensor_data.get('rainfall', {}).get('avg_value', 0)
        storage = sensor_data.get('storage', {}).get('avg_value', 0)
        water_level = sensor_data.get('water_level', {}).get('avg_value', 0)
        
        total_water = rainfall * 10  # Convert mm to liters
        
        if storage < 60:
            routing_plan['storage_tanks'] = total_water * 0.6
            routing_plan['recharge_wells'] = total_water * 0.4
        elif storage < 80:
            routing_plan['storage_tanks'] = total_water * 0.3
            routing_plan['recharge_wells'] = total_water * 0.4
            routing_plan['lakes'] = total_water * 0.3
        else:
            routing_plan['recharge_wells'] = total_water * 0.3
            routing_plan['lakes'] = total_water * 0.4
            routing_plan['overflow_systems'] = total_water * 0.3
        
        return routing_plan
    
    def make_decision(self):
        """Main decision-making function"""
        sensor_data = self.get_current_sensor_data()
        weather_context = self.get_weather_context()
        
        # Analyze system health
        health_analysis = self.analyze_water_system_health(sensor_data)
        
        # Generate decisions
        decisions = self.generate_smart_decisions(sensor_data, weather_context)
        
        # Get predictions
        predictions = self.predict_future_scenarios(sensor_data, weather_context)
        
        # Optimize routing
        routing_plan = self.optimize_water_routing(sensor_data)
        
        # Store decision in database
        self._store_decision(decisions, health_analysis)
        
        return {
            'timestamp': datetime.now().isoformat(),
            'health_analysis': health_analysis,
            'decisions': decisions,
            'predictions': predictions,
            'routing_plan': routing_plan,
            'weather_context': weather_context
        }
    
    def _store_decision(self, decisions, health_analysis):
        """Store AI decision in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for decision in decisions:
            cursor.execute('''
                INSERT INTO ai_decisions (decision_type, parameters, action)
                VALUES (?, ?, ?)
            ''', (
                decision['type'],
                json.dumps({
                    'priority': decision['priority'],
                    'confidence': decision['confidence'],
                    'health_score': health_analysis['health_score']
                }),
                decision['action']
            ))
        
        conn.commit()
        conn.close()
    
    def get_decision_history(self, hours=24):
        """Get AI decision history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT decision_type, parameters, action, timestamp
            FROM ai_decisions
            WHERE timestamp > datetime('now', '-{} hours')
            ORDER BY timestamp DESC
        '''.format(hours))
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'type': row[0],
                'parameters': json.loads(row[1]),
                'action': row[2],
                'timestamp': row[3]
            })
        
        conn.close()
        return history

# Example usage
if __name__ == "__main__":
    ai_brain = BengaluruAIBrain()
    decision = ai_brain.make_decision()
    
    print("🧠 Bengaluru AI Brain Decision:")
    print(json.dumps(decision, indent=2))
