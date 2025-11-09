import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SignalStrengthPredictor from './components/SignalStrengthPredictor';
import NetworkUsageAnalyzer from './components/NetworkUsageAnalyzer';
import TimePatternAnalyzer from './components/TimePatternAnalyzer';
import LocationHeatmap from './components/LocationHeatmap';
import ThroughputForecaster from './components/ThroughputForecaster';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/signal-strength" element={<SignalStrengthPredictor />} />
            <Route path="/network-usage" element={<NetworkUsageAnalyzer />} />
            <Route path="/time-patterns" element={<TimePatternAnalyzer />} />
            <Route path="/location-heatmap" element={<LocationHeatmap />} />
            <Route path="/throughput" element={<ThroughputForecaster />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

