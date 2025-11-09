import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getLocalities, analyzeNetworkUsage } from '../api/apiClient';
import { NetworkUsageStats } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const NetworkUsageAnalyzer: React.FC = () => {
  const [localities, setLocalities] = useState<any[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [usageStats, setUsageStats] = useState<NetworkUsageStats>({});
  const [dominantNetwork, setDominantNetwork] = useState<string>('');
  const [trends, setTrends] = useState<any[]>([]);
  const [allLocalitiesStats, setAllLocalitiesStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const localitiesData = await getLocalities();
        setLocalities(localitiesData.localities || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    loadUsageData();
  }, [selectedLocality]);

  const loadUsageData = async () => {
    setLoading(true);
    try {
      if (selectedLocality === 'all') {
        // Load data for all localities
        const allStats = [];
        for (const locality of localities) {
          const result = await analyzeNetworkUsage(locality.name);
          allStats.push({
            locality: locality.name,
            ...result,
          });
        }
        setAllLocalitiesStats(allStats);
        // Aggregate overall stats
        const aggregated: NetworkUsageStats = {};
        let totalRecords = 0;
        allStats.forEach((stat) => {
          Object.keys(stat.usage_stats || {}).forEach((network) => {
            if (!aggregated[network]) {
              aggregated[network] = { count: 0, percentage: 0 };
            }
            aggregated[network].count += stat.usage_stats[network].count;
            totalRecords += stat.usage_stats[network].count;
          });
        });
        Object.keys(aggregated).forEach((network) => {
          aggregated[network].percentage = (aggregated[network].count / totalRecords) * 100;
        });
        setUsageStats(aggregated);
        setDominantNetwork(Object.keys(aggregated).sort((a, b) => aggregated[b].percentage - aggregated[a].percentage)[0] || '');
      } else {
        const result = await analyzeNetworkUsage(selectedLocality);
        setUsageStats(result.usage_stats || {});
        setDominantNetwork(result.dominant_network || '');
        setTrends(result.trends || []);
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = Object.entries(usageStats).map(([name, stats]) => ({
    name,
    value: stats.percentage,
  }));

  const barData = allLocalitiesStats.map((stat) => {
    const data: any = { locality: stat.locality };
    Object.keys(stat.usage_stats || {}).forEach((network) => {
      data[network] = stat.usage_stats[network].percentage;
    });
    return data;
  });

  const trendData = trends.flatMap((trend) =>
    trend.dates.map((date: string, idx: number) => ({
      date,
      [trend.network_type]: trend.counts[idx],
    }))
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Network Usage Analysis</h1>
        <p className="text-gray-600">Analyze network type usage patterns across localities</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Locality
        </label>
        <select
          value={selectedLocality}
          onChange={(e) => setSelectedLocality(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Localities</option>
          {localities.map((loc) => (
            <option key={loc.name} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading usage data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Network Type Distribution</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Usage Statistics</h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Dominant Network</dt>
                  <dd className="font-semibold text-primary">{dominantNetwork || 'N/A'}</dd>
                </div>
                {Object.entries(usageStats).map(([network, stats]) => (
                  <div key={network} className="flex justify-between">
                    <dt className="text-gray-600">{network}</dt>
                    <dd className="font-semibold">
                      {stats.percentage.toFixed(1)}% ({stats.count} records)
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {selectedLocality === 'all' && barData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Network Usage by Locality</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="locality" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {Object.keys(usageStats).map((network, idx) => (
                    <Bar key={network} dataKey={network} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {trends.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Usage Trends Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {trends.map((trend, idx) => (
                    <Line
                      key={trend.network_type}
                      type="monotone"
                      dataKey={trend.network_type}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {selectedLocality === 'all' && allLocalitiesStats.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Statistics by Locality</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Locality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dominant Network
                      </th>
                      {Object.keys(usageStats).map((network) => (
                        <th
                          key={network}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {network} %
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allLocalitiesStats.map((stat) => (
                      <tr key={stat.locality}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stat.locality}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.dominant_network}
                        </td>
                        {Object.keys(usageStats).map((network) => (
                          <td key={network} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.usage_stats[network]?.percentage.toFixed(1) || '0.0'}%
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NetworkUsageAnalyzer;

