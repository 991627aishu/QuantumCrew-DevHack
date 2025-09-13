import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Power, 
  PowerOff,
  Brain,
  RefreshCw,
  Clock,
  MapPin
} from 'lucide-react';

const Alerts = ({ alerts, aiDecisions }) => {
  const [valveControls, setValveControls] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const controlValve = async (valveId, action) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valve_id: valveId,
          action: action
        })
      });
      
      if (response.ok) {
        setValveControls(prev => ({
          ...prev,
          [valveId]: action
        }));
        console.log(`Valve ${valveId} ${action} successful`);
      }
    } catch (error) {
      console.error('Error controlling valve:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return XCircle;
      case 'warning': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default: return 'text-green-500 bg-green-50 border-green-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'urgent': return 'bg-orange-500';
      case 'high': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Brain Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neumorphic-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Brain - Smart Decisions</h2>
            <p className="text-sm text-gray-600">Automated water management recommendations</p>
          </div>
        </div>

        <div className="space-y-4">
          {aiDecisions.map((decision, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${getAlertColor(decision.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(decision.priority)}`}></div>
                    <span className="font-semibold capitalize">{decision.type.replace('_', ' ')}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      decision.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      decision.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                      decision.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {decision.priority}
                    </span>
                  </div>
                  <p className="text-gray-700">{decision.message}</p>
                </div>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Valve Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neumorphic-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Power className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Valve Control Panel</h2>
            <p className="text-sm text-gray-600">Manual control of water flow systems</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['valve_001', 'valve_002', 'valve_003'].map((valveId, index) => (
            <motion.div
              key={valveId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{valveId.replace('_', ' ').toUpperCase()}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  valveControls[valveId] === 'open' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => controlValve(valveId, 'open')}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    valveControls[valveId] === 'open'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>Open Valve</span>
                </button>
                
                <button
                  onClick={() => controlValve(valveId, 'close')}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    valveControls[valveId] === 'close'
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50'
                  }`}
                >
                  <PowerOff className="w-4 h-4" />
                  <span>Close Valve</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Active Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="neumorphic-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Active Alerts</h2>
            <p className="text-sm text-gray-600">Real-time system notifications</p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">All Systems Normal</h3>
            <p className="text-gray-600">No active alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{alert.sensor?.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="neumorphic-card p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">System Status</h2>
            <p className="text-sm text-gray-600">Overall system health</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.type === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {alerts.filter(a => a.type === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {aiDecisions.length}
            </div>
            <div className="text-sm text-gray-600">AI Decisions</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Alerts;
