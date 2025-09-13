import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Charts from './components/Charts';
import Alerts from './components/Alerts';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Initialize socket with better error handling
let socket = null;
try {
  socket = io('http://localhost:5000', {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });
} catch (error) {
  console.error('Socket initialization failed:', error);
}

function App() {
  const [sensors, setSensors] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [aiDecisions, setAiDecisions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    // Initialize with mock data if socket is not available
    if (!socket) {
      console.log('Socket not available, using mock data');
      setConnectionError(true);
      initializeMockData();
      return;
    }

    // Socket connection handlers
    socket.on('connect', () => {
      console.log('Connected to backend');
      setIsConnected(true);
      setConnectionError(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from backend');
      setIsConnected(false);
      setConnectionError(true);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError(true);
      setIsConnected(false);
    });

    socket.on('sensor_update', (data) => {
      setSensors(data.sensors);
      checkForAlerts(data.sensors);
    });

    socket.on('valve_update', (data) => {
      console.log('Valve update:', data);
      // Update sensors with new valve status
      setSensors(prev => prev.map(sensor => 
        sensor.id === data.valve_id ? { ...sensor, value: data.status } : sensor
      ));
    });

    // Initial data fetch - only if socket is available
    fetchSensors();
    fetchForecast();
    fetchAiDecisions();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeMockData = () => {
    // Mock sensor data for demo purposes
    const mockSensors = [
      { id: "rain_001", type: "rainfall", location: "Koramangala", lat: 12.9352, lng: 77.6245, value: 15.2, status: "active", timestamp: new Date().toISOString() },
      { id: "rain_002", type: "rainfall", location: "Indiranagar", lat: 12.9719, lng: 77.6412, value: 8.7, status: "active", timestamp: new Date().toISOString() },
      { id: "water_001", type: "water_level", location: "Ulsoor Lake", lat: 12.9716, lng: 77.6162, value: 65.3, status: "active", timestamp: new Date().toISOString() },
      { id: "water_002", type: "water_level", location: "Bellandur Lake", lat: 12.9255, lng: 77.6688, value: 78.9, status: "active", timestamp: new Date().toISOString() },
      { id: "flow_001", type: "flow_rate", location: "MG Road Drain", lat: 12.9716, lng: 77.6101, value: 145.6, status: "active", timestamp: new Date().toISOString() },
      { id: "flow_002", type: "flow_rate", location: "Electronic City Drain", lat: 12.8456, lng: 77.6603, value: 132.4, status: "active", timestamp: new Date().toISOString() },
      { id: "storage_001", type: "storage", location: "Hebbal Tank", lat: 13.0359, lng: 77.5970, value: 72.1, status: "active", timestamp: new Date().toISOString() },
      { id: "storage_002", type: "storage", location: "Yelahanka Tank", lat: 13.1007, lng: 77.5963, value: 58.7, status: "active", timestamp: new Date().toISOString() },
      { id: "valve_001", type: "valve", location: "Whitefield Pump", lat: 12.9698, lng: 77.7500, value: 1, status: "active", timestamp: new Date().toISOString() },
      { id: "valve_002", type: "valve", location: "Marathahalli Pump", lat: 12.9581, lng: 77.7015, value: 0, status: "active", timestamp: new Date().toISOString() }
    ];

    const mockForecast = [
      { date: "2024-01-15", rainfall: 12.5, probability: 75 },
      { date: "2024-01-16", rainfall: 8.2, probability: 60 },
      { date: "2024-01-17", rainfall: 15.8, probability: 85 },
      { date: "2024-01-18", rainfall: 5.1, probability: 40 },
      { date: "2024-01-19", rainfall: 18.3, probability: 90 },
      { date: "2024-01-20", rainfall: 7.6, probability: 55 },
      { date: "2024-01-21", rainfall: 11.2, probability: 70 }
    ];

    const mockAiDecisions = [
      {
        type: "recharge_wells",
        priority: "high",
        message: "Moderate rainfall detected. Directing water to recharge wells for optimal groundwater recharge.",
        action: "activate_recharge_wells",
        confidence: 0.85
      },
      {
        type: "normal_operation",
        priority: "low",
        message: "All systems operating within normal parameters. Continue monitoring.",
        action: "monitor",
        confidence: 0.95
      }
    ];

    setSensors(mockSensors);
    setForecast(mockForecast);
    setAiDecisions(mockAiDecisions);
    checkForAlerts(mockSensors);
  };

  const fetchSensors = async () => {
    try {
      const response = await fetch('/api/sensors');
      if (!response.ok) {
        throw new Error('Backend not available');
      }
      const data = await response.json();
      setSensors(data);
      checkForAlerts(data);
      setConnectionError(false);
    } catch (error) {
      console.error('Error fetching sensors:', error);
      setConnectionError(true);
      // Only initialize mock data if we don't already have sensors
      if (sensors.length === 0) {
        initializeMockData();
      }
    }
  };

  const fetchForecast = async () => {
    try {
      const response = await fetch('/api/forecast');
      if (!response.ok) {
        throw new Error('Backend not available');
      }
      const data = await response.json();
      setForecast(data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      // Use mock forecast data
      const mockForecast = [
        { date: "2024-01-15", rainfall: 12.5, probability: 75 },
        { date: "2024-01-16", rainfall: 8.2, probability: 60 },
        { date: "2024-01-17", rainfall: 15.8, probability: 85 },
        { date: "2024-01-18", rainfall: 5.1, probability: 40 },
        { date: "2024-01-19", rainfall: 18.3, probability: 90 },
        { date: "2024-01-20", rainfall: 7.6, probability: 55 },
        { date: "2024-01-21", rainfall: 11.2, probability: 70 }
      ];
      setForecast(mockForecast);
    }
  };

  const fetchAiDecisions = async () => {
    try {
      const response = await fetch('/api/ai-decision');
      if (!response.ok) {
        throw new Error('Backend not available');
      }
      const data = await response.json();
      setAiDecisions(data);
    } catch (error) {
      console.error('Error fetching AI decisions:', error);
      // Use mock AI decisions
      const mockAiDecisions = [
        {
          type: "recharge_wells",
          priority: "high",
          message: "Moderate rainfall detected. Directing water to recharge wells for optimal groundwater recharge.",
          action: "activate_recharge_wells",
          confidence: 0.85
        },
        {
          type: "normal_operation",
          priority: "low",
          message: "All systems operating within normal parameters. Continue monitoring.",
          action: "monitor",
          confidence: 0.95
        }
      ];
      setAiDecisions(mockAiDecisions);
    }
  };

  const checkForAlerts = (sensorData) => {
    const newAlerts = [];
    
    sensorData.forEach(sensor => {
      if (sensor.type === 'water_level' && sensor.value > 80) {
        newAlerts.push({
          id: `alert-${sensor.id}-${Date.now()}`,
          type: 'warning',
          message: `⚠️ Overflow Risk: ${sensor.location} water level at ${sensor.value.toFixed(1)}%`,
          sensor: sensor,
          timestamp: new Date().toISOString()
        });
      }
      
      if (sensor.type === 'storage' && sensor.value > 90) {
        newAlerts.push({
          id: `alert-${sensor.id}-${Date.now()}`,
          type: 'critical',
          message: `🚨 Critical: ${sensor.location} storage tank at ${sensor.value.toFixed(1)}% capacity`,
          sensor: sensor,
          timestamp: new Date().toISOString()
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
    }
  };

  const controlValve = async (valveId, action) => {
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
        console.log(`Valve ${valveId} ${action} successful`);
        fetchAiDecisions(); // Refresh AI decisions
      }
    } catch (error) {
      console.error('Error controlling valve:', error);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard sensors={sensors} isConnected={isConnected} />;
      case 'map':
        return <MapView sensors={sensors} />;
      case 'charts':
        return <Charts sensors={sensors} forecast={forecast} />;
      case 'alerts':
        return <Alerts alerts={alerts} aiDecisions={aiDecisions} />;
      default:
        return <Dashboard sensors={sensors} isConnected={isConnected} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header isConnected={isConnected} />
      
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderActiveTab()}
          </motion.div>
        </main>
      </div>

    </div>
  );
}

export default App;
