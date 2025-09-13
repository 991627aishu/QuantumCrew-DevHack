import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Droplets, Waves, Gauge, Database, Power } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = ({ sensors }) => {
  const [mapCenter] = useState([12.9716, 77.5946]); // Bengaluru center
  const [mapZoom] = useState(11);

  // Bengaluru lakes and major water bodies
  const waterBodies = [
    { name: 'Ulsoor Lake', lat: 12.9716, lng: 77.6162, type: 'lake' },
    { name: 'Bellandur Lake', lat: 12.9255, lng: 77.6688, type: 'lake' },
    { name: 'Varthur Lake', lat: 12.9400, lng: 77.7500, type: 'lake' },
    { name: 'Hebbal Lake', lat: 13.0359, lng: 77.5970, type: 'lake' },
    { name: 'Yelahanka Lake', lat: 13.1007, lng: 77.5963, type: 'lake' },
  ];

  // Drainage lines (simplified)
  const drainageLines = [
    { name: 'MG Road Drain', coords: [[12.9716, 77.6101], [12.9716, 77.6162]] },
    { name: 'Electronic City Drain', coords: [[12.8456, 77.6603], [12.9255, 77.6688]] },
    { name: 'Marathahalli Drain', coords: [[12.9581, 77.7015], [12.9400, 77.7500]] },
  ];

  const getSensorIcon = (type, value) => {
    let color = 'green';
    let size = 12;

    if (type === 'water_level' || type === 'storage') {
      if (value > 80) color = 'red';
      else if (value > 60) color = 'yellow';
    } else if (type === 'rainfall') {
      if (value > 15) color = 'red';
      else if (value > 5) color = 'yellow';
    } else if (type === 'flow_rate') {
      if (value > 150) color = 'red';
      else if (value > 100) color = 'yellow';
    } else if (type === 'valve') {
      color = value === 1 ? 'green' : 'gray';
    }

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  const getSensorIconComponent = (type) => {
    switch (type) {
      case 'rainfall': return Droplets;
      case 'water_level': return Waves;
      case 'flow_rate': return Gauge;
      case 'storage': return Database;
      case 'valve': return Power;
      default: return Droplets;
    }
  };

  const getSensorUnit = (type) => {
    switch (type) {
      case 'rainfall': return 'mm';
      case 'water_level': return '%';
      case 'flow_rate': return 'L/min';
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
      case 'storage': return 'Storage';
      case 'valve': return 'Valve';
      default: return 'Sensor';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neumorphic-card p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Bengaluru Water Circulation Map</h2>
        <p className="text-gray-600 mb-4">
          Real-time monitoring of water sensors across Bengaluru. Green = Safe, Yellow = Warning, Red = Critical
        </p>
        
        <div className="h-96 w-full rounded-xl overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Water Bodies */}
            {waterBodies.map((body, index) => (
              <Circle
                key={index}
                center={[body.lat, body.lng]}
                radius={500}
                pathOptions={{
                  color: '#3B82F6',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-blue-600">{body.name}</h3>
                    <p className="text-sm text-gray-600">Water Body</p>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Drainage Lines */}
            {drainageLines.map((line, index) => (
              <Polyline
                key={index}
                positions={line.coords}
                pathOptions={{
                  color: '#10B981',
                  weight: 3,
                  opacity: 0.7
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-green-600">{line.name}</h3>
                    <p className="text-sm text-gray-600">Drainage Line</p>
                  </div>
                </Popup>
              </Polyline>
            ))}

            {/* Sensors */}
            {sensors.map((sensor) => {
              const Icon = getSensorIconComponent(sensor.type);
              const unit = getSensorUnit(sensor.type);
              const label = getSensorLabel(sensor.type);

              return (
                <Marker
                  key={sensor.id}
                  position={[sensor.lat, sensor.lng]}
                  icon={getSensorIcon(sensor.type, sensor.value)}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-800">{sensor.location}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">{label}:</span>
                          <span className="text-sm font-medium">
                            {sensor.type === 'valve' 
                              ? (sensor.value === 1 ? 'ON' : 'OFF')
                              : `${sensor.value.toFixed(1)} ${unit}`
                            }
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`text-sm font-medium ${
                            sensor.status === 'active' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {sensor.status}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {new Date(sensor.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="neumorphic-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Sensor Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Safe/Normal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Warning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Critical</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Map Elements</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full opacity-20"></div>
                <span className="text-sm text-gray-600">Water Bodies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-1 bg-green-500"></div>
                <span className="text-sm text-gray-600">Drainage Lines</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MapView;
