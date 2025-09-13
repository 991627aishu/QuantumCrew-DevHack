import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ sensors, forecast }) => {
  const [selectedSensor, setSelectedSensor] = useState('rain_001');
  const [timeRange, setTimeRange] = useState('24h');
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedSensor, timeRange]);

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`/api/historical/${selectedSensor}?hours=${timeRange === '24h' ? 24 : 168}`);
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  // Rainfall vs Storage Chart
  const rainfallStorageData = {
    labels: forecast.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Rainfall (mm)',
        data: forecast.map(item => item.rainfall),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        label: 'Storage Capacity (%)',
        data: forecast.map(item => Math.min(100, item.rainfall * 3 + 50)), // Simulated storage
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  };

  const rainfallStorageOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Rainfall (mm)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Storage Capacity (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Rainfall vs Storage Capacity Forecast',
      },
      legend: {
        position: 'top',
      },
    },
  };

  // Groundwater Recharge Trend
  const rechargeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Recharge Wells Active',
        data: [45, 52, 48, 61, 55, 67, 72, 78, 85, 73, 58, 49],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Water Recharged (ML)',
        data: [120, 135, 128, 158, 145, 175, 185, 195, 210, 185, 155, 130],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const rechargeOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Groundwater Recharge Trends (2024)',
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count / Volume',
        },
      },
    },
  };

  // Historical Sensor Data Chart
  const historicalChartData = {
    labels: historicalData.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Sensor Value',
        data: historicalData.map(item => item.value),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const historicalChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Historical Data - ${selectedSensor}`,
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  const sensorOptions = sensors
    .filter(sensor => sensor.type !== 'valve')
    .map(sensor => ({
      value: sensor.id,
      label: `${sensor.location} (${sensor.type})`,
    }));

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neumorphic-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Analytics Dashboard</h2>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">Real-time Analytics</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Sensor for Historical Data
            </label>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sensorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall vs Storage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neumorphic-card p-6"
        >
          <div className="chart-container">
            <Line data={rainfallStorageData} options={rainfallStorageOptions} />
          </div>
        </motion.div>

        {/* Groundwater Recharge Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neumorphic-card p-6"
        >
          <div className="chart-container">
            <Bar data={rechargeData} options={rechargeOptions} />
          </div>
        </motion.div>
      </div>

      {/* Historical Data Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="neumorphic-card p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-800">Historical Sensor Data</h3>
        </div>
        <div className="chart-container">
          <Line data={historicalChartData} options={historicalChartOptions} />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="neumorphic-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {sensors.filter(s => s.type === 'rainfall').reduce((sum, s) => sum + s.value, 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Total Rainfall (mm)</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {sensors.filter(s => s.type === 'water_level').reduce((sum, s) => sum + s.value, 0) / sensors.filter(s => s.type === 'water_level').length || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Water Level (%)</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {sensors.filter(s => s.type === 'flow_rate').reduce((sum, s) => sum + s.value, 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Total Flow (L/min)</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {sensors.filter(s => s.type === 'storage').reduce((sum, s) => sum + s.value, 0) / sensors.filter(s => s.type === 'storage').length || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Storage (%)</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Charts;
