import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDataSummary, getLocalities, getNetworkTypes } from '../api/apiClient';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [localities, setLocalities] = useState<any[]>([]);
  const [networkTypes, setNetworkTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, localitiesData, networkTypesData] = await Promise.all([
          getDataSummary(),
          getLocalities(),
          getNetworkTypes(),
        ]);
        setSummary(summaryData);
        setLocalities(localitiesData.localities || []);
        setNetworkTypes(networkTypesData.network_types || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Localities Monitored',
      value: summary?.localities || 0,
      icon: '📍',
      color: 'bg-blue-500',
    },
    {
      title: 'Active Network Types',
      value: networkTypes.length,
      icon: '📶',
      color: 'bg-green-500',
    },
    {
      title: 'Average Signal Strength',
      value: summary?.signal_strength
        ? `${summary.signal_strength.mean.toFixed(1)} dBm`
        : 'N/A',
      icon: '📡',
      color: 'bg-yellow-500',
    },
    {
      title: 'Average Throughput',
      value: summary?.data_throughput
        ? `${summary.data_throughput.mean.toFixed(2)} Mbps`
        : 'N/A',
      icon: '🚀',
      color: 'bg-purple-500',
    },
  ];

  const features = [
    { path: '/signal-strength', title: 'Signal Strength Predictor', desc: 'Predict signal strength for next 24 hours' },
    { path: '/network-usage', title: 'Network Usage Analysis', desc: 'Analyze network type usage patterns' },
    { path: '/time-patterns', title: 'Time Patterns', desc: 'Identify peak demand hours' },
    { path: '/location-heatmap', title: 'Location Heatmap', desc: 'View demand by location' },
    { path: '/throughput', title: 'Throughput Forecast', desc: 'Forecast data throughput demand' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of network optimization metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
              <div className={`w-12 h-12 ${card.color} rounded-lg opacity-20`}></div>
            </div>
            <h3 className="text-sm text-gray-500 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
          <div className="space-y-3">
            {features.map((feature) => (
              <Link
                key={feature.path}
                to={feature.path}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Dataset Statistics</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-600">Total Records</dt>
              <dd className="font-semibold">{summary?.total_records || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Date Range</dt>
              <dd className="font-semibold text-sm">
                {summary?.date_range?.start
                  ? new Date(summary.date_range.start).toLocaleDateString()
                  : 'N/A'}{' '}
                -{' '}
                {summary?.date_range?.end
                  ? new Date(summary.date_range.end).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
            {summary?.signal_strength && (
              <>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Avg Signal Strength</dt>
                  <dd className="font-semibold">
                    {summary.signal_strength.mean.toFixed(1)} dBm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Signal Std Dev</dt>
                  <dd className="font-semibold">
                    {summary.signal_strength.std.toFixed(1)} dBm
                  </dd>
                </div>
              </>
            )}
            {summary?.data_throughput && (
              <>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Avg Throughput</dt>
                  <dd className="font-semibold">
                    {summary.data_throughput.mean.toFixed(2)} Mbps
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Max Throughput</dt>
                  <dd className="font-semibold">
                    {summary.data_throughput.max.toFixed(2)} Mbps
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

