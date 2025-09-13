import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Wifi, WifiOff } from 'lucide-react';

const Header = ({ isConnected }) => {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative"
            >
              <Heart className="w-8 h-8 text-red-500" />
              <motion.div
                className="absolute inset-0 w-8 h-8 bg-red-500 rounded-full opacity-20"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </motion.div>
            
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Project Vrishabhavathi
              </h1>
              <p className="text-sm text-gray-600">
                Real-time Water Circulation Monitor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-orange-600 font-medium">Demo Mode</span>
                </>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
