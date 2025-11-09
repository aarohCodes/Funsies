import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { healthCheck } from '../api/apiClient';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isHealthy, setIsHealthy] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await healthCheck();
        setIsHealthy(health.models_loaded || false);
        setLastUpdated(new Date());
      } catch (error) {
        setIsHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/signal-strength', label: 'Signal Strength Predictor', icon: '📡' },
    { path: '/network-usage', label: 'Network Usage', icon: '📱' },
    { path: '/time-patterns', label: 'Time Patterns', icon: '⏰' },
    { path: '/location-heatmap', label: 'Location Heatmap', icon: '🗺️' },
    { path: '/throughput', label: 'Throughput Forecast', icon: '🚀' },
  ];

  return (
    <div className="w-64 bg-white shadow-md flex flex-col h-screen">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">Network Optimizer</h1>
        <p className="text-sm text-gray-500 mt-1">Cellular Network Analysis</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isHealthy ? 'bg-success' : 'bg-danger'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isHealthy ? 'Models Loaded' : 'Loading Models...'}
          </span>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

