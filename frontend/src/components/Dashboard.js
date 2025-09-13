import React from 'react';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Waves, 
  Gauge, 
  Database, 
  Power,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const Dashboard = ({ sensors, isConnected }) => {
  // Group sensors by type
  const sensorGroups = sensors.reduce((acc, sensor) => {
    if (!acc[sensor.type]) {
      acc[sensor.type] = [];
    }
    acc[sensor.type].push(sensor);
    return acc;
  }, {});

  const getSensorIcon = (type) => {
    switch (type) {
      case 'rainfall': return Droplets;
      case 'water_level': return Waves;
      case 'flow_rate': return Gauge;
      case 'flow_velocity': return Gauge;
      case 'storage': return Database;
      case 'valve': return Power;
      default: return Droplets;
    }
  };

  const getSensorColor = (type, value) => {
    switch (type) {
      case 'rainfall':
        return value > 15 ? 'text-red-500' : value > 5 ? 'text-yellow-500' : 'text-green-500';
      case 'water_level':
        return value > 80 ? 'text-red-500' : value > 60 ? 'text-yellow-500' : 'text-green-500';
      case 'flow_rate':
        return value > 150 ? 'text-red-500' : value > 100 ? 'text-yellow-500' : 'text-green-500';
      case 'flow_velocity':
        return value > 50 ? 'text-red-500' : value > 30 ? 'text-yellow-500' : 'text-green-500';
      case 'storage':
        return value > 90 ? 'text-red-500' : value > 70 ? 'text-yellow-500' : 'text-green-500';
      case 'valve':
        return value === 1 ? 'text-green-500' : 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  const getSensorUnit = (type) => {
    switch (type) {
      case 'rainfall': return 'mm';
      case 'water_level': return '%';
      case 'flow_rate': return 'L/min';
      case 'flow_velocity': return 'cm/s';
      case 'storage': return '%';
      case 'valve': return '';
      default: return '';
    }
  };

  const getSensorLabel = (type) => {
    switch (type) {
      case 'rainfall': return 'Rainfall';
      case 'water_level': return 'Water Level';
      case 'flow_rate': return 'Flow Rate';
      case 'flow_velocity': return 'Flow Velocity';
      case 'storage': return 'Storage';
      case 'valve': return 'Valve Status';
      default: return 'Sensor';
    }
  };

  const getTrendIcon = (type, value) => {
    // Simple trend logic based on value ranges
    if (type === 'rainfall') {
      return value > 10 ? TrendingUp : value > 5 ? Minus : TrendingDown;
    } else if (type === 'water_level' || type === 'storage') {
      return value > 80 ? TrendingUp : value > 50 ? Minus : TrendingDown;
    } else if (type === 'flow_rate') {
      return value > 150 ? TrendingUp : value > 100 ? Minus : TrendingDown;
    } else if (type === 'flow_velocity') {
      return value > 50 ? TrendingUp : value > 30 ? Minus : TrendingDown;
    }
    return Minus;
  };

  const SensorCard = ({ sensor, index }) => {
    const Icon = getSensorIcon(sensor.type);
    const TrendIcon = getTrendIcon(sensor.type, sensor.value);
    const colorClass = getSensorColor(sensor.type, sensor.value);
    const unit = getSensorUnit(sensor.type);
    const label = getSensorLabel(sensor.type);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="neumorphic-card p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{label}</h3>
              <p className="text-sm text-gray-500">{sensor.location}</p>
            </div>
          </div>
          <TrendIcon className={`w-5 h-5 ${colorClass}`} />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold ${colorClass}`}>
              {sensor.type === 'valve' ? (sensor.value === 1 ? 'ON' : 'OFF') : sensor.value.toFixed(1)}
            </span>
            {sensor.type !== 'valve' && (
              <span className="text-sm text-gray-500">{unit}</span>
            )}
          </div>

          {/* ESP32 Flow Sensor Additional Info */}
          {sensor.flow_direction && (
            <div className="text-sm text-blue-600 font-medium">
              Direction: {sensor.flow_direction}
            </div>
          )}
          
          {sensor.flow_velocity && (
            <div className="text-sm text-purple-600 font-medium">
              Velocity: {sensor.flow_velocity} cm/s
            </div>
          )}

          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                sensor.type === 'valve' 
                  ? (sensor.value === 1 ? 'bg-green-500' : 'bg-gray-400')
                  : sensor.value > 80 
                    ? 'bg-red-500' 
                    : sensor.value > 60 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${sensor.type === 'valve' ? (sensor.value === 1 ? 100 : 0) : Math.min(sensor.value, 100)}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Status: {sensor.status}</span>
            <span>{new Date(sensor.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const SystemOverview = () => {
    const totalSensors = sensors.length;
    const activeSensors = sensors.filter(s => s.status === 'active').length;
    const criticalSensors = sensors.filter(s => {
      if (s.type === 'water_level' || s.type === 'storage') {
        return s.value > 80;
      }
      return false;
    }).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neumorphic-card p-6 mb-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalSensors}</div>
            <div className="text-sm text-gray-600">Total Sensors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeSensors}</div>
            <div className="text-sm text-gray-600">Active Sensors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalSensors}</div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        <SystemOverview />
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rainfall Sensors */}
            {sensorGroups.rainfall && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Rainfall Sensors</h3>
                <div className="space-y-3">
                  {sensorGroups.rainfall.slice(0, 2).map((sensor, index) => (
                    <SensorCard key={sensor.id} sensor={sensor} index={index} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Water Level Sensors */}
            {sensorGroups.water_level && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Water Level Sensors</h3>
                <div className="space-y-3">
                  {sensorGroups.water_level.slice(0, 2).map((sensor, index) => (
                    <SensorCard key={sensor.id} sensor={sensor} index={index} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Flow Rate Sensors */}
            {sensorGroups.flow_rate && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Flow Rate Sensors</h3>
                <div className="space-y-3">
                  {sensorGroups.flow_rate.slice(0, 2).map((sensor, index) => (
                    <SensorCard key={sensor.id} sensor={sensor} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
