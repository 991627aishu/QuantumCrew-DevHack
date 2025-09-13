import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  AlertTriangle,
  Droplets,
  Activity
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Map View', icon: Map },
    { id: 'charts', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts & AI', icon: AlertTriangle },
  ];

  return (
    <motion.aside 
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-white/80 backdrop-blur-md shadow-lg border-r border-gray-200"
    >
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Heart System</h2>
              <p className="text-xs text-gray-500">Water Circulation</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">System Status</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p>🏙️ Bengaluru Smart City</p>
            <p>💧 Water Management</p>
            <p>🤖 AI-Powered Decisions</p>
            <p>📡 Real-time Monitoring</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
