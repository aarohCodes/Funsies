import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getLocalities, analyzeTimePatterns } from '../api/apiClient';
import { TimePattern } from '../types';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const TimePatternAnalyzer: React.FC = () => {
  const [localities, setLocalities] = useState<any[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('throughput');
  const [timePattern, setTimePattern] = useState<TimePattern | null>(null);
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
    loadPatternData();
  }, [selectedLocality, selectedMetric]);

  const loadPatternData = async () => {
    setLoading(true);
    try {
      const locality = selectedLocality === 'all' ? undefined : selectedLocality;
      const result = await analyzeTimePatterns(locality, selectedMetric);
      setTimePattern(result);
    } catch (error) {
      console.error('Error loading pattern data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hourlyData = timePattern?.hourly_averages
    ? Object.entries(timePattern.hourly_averages).map(([hour, value]) => ({
        hour: parseInt(hour),
        value: value,
        label: `${hour}:00`,
      }))
    : [];

  const dailyData = timePattern?.daily_patterns
    ? Object.entries(timePattern.daily_patterns).map(([day, value]) => ({
        day: parseInt(day),
        value: value,
        label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
      }))
    : [];

  const getHeatmapData = () => {
    if (!timePattern?.heatmap || timePattern.heatmap.length === 0) {
      return [];
    }

    // Create a 2D array for heatmap (24 hours x 7 days)
    const heatmap: number[][] = Array(24)
      .fill(0)
      .map(() => Array(7).fill(0));

    timePattern.heatmap.forEach((point) => {
      heatmap[point.hour][point.day] = point.value;
    });

    return heatmap;
  };

  const heatmapData = getHeatmapData();
  const maxValue = Math.max(...heatmapData.flat(), 1);

  const getHeatmapColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.66) return '#EF4444'; // High demand
    if (intensity > 0.33) return '#F59E0B'; // Medium demand
    return '#10B981'; // Low demand
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Time-based Demand Patterns</h1>
        <p className="text-gray-600">Analyze temporal demand patterns and identify peak hours</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locality
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Localities</option>
              {localities.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="throughput">Throughput</option>
              <option value="signal_strength">Signal Strength</option>
              <option value="latency">Latency</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pattern data...</p>
        </div>
      ) : (
        <>
          {timePattern && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Peak Hours</h2>
                <div className="flex flex-wrap gap-2">
                  {timePattern.peak_hours && timePattern.peak_hours.length > 0 ? (
                    timePattern.peak_hours.map((hour) => (
                      <span
                        key={hour}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                      >
                        {hour}:00
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No peak hours identified</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Average Demand by Hour</h2>
                  {hourlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          name={selectedMetric}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No data available</p>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Average Demand by Day of Week</h2>
                  {dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3B82F6" name={selectedMetric} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No data available</p>
                  )}
                </div>
              </div>

              {heatmapData.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Demand Heatmap (Hour × Day of Week)</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-2 py-2 text-xs font-medium text-gray-500">Hour</th>
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <th key={day} className="px-2 py-2 text-xs font-medium text-gray-500">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapData.map((row, hour) => (
                          <tr key={hour}>
                            <td className="px-2 py-1 text-xs font-medium text-gray-600">{hour}:00</td>
                            {row.map((value, day) => (
                              <td
                                key={day}
                                className="px-2 py-1 text-center text-xs"
                                style={{
                                  backgroundColor: getHeatmapColor(value),
                                  color: value > maxValue * 0.5 ? 'white' : 'black',
                                }}
                              >
                                {value.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Low (&lt;33%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm text-gray-600">Medium (33-66%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">High (&gt;66%)</span>
                    </div>
                  </div>
                </div>
              )}

              {timePattern.demand_clusters && Object.keys(timePattern.demand_clusters).length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Demand Clusters</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(timePattern.demand_clusters).map(([clusterId, cluster]: [string, any]) => (
                      <div key={clusterId} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">{cluster.label || `Cluster ${clusterId}`}</h3>
                        <dl className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Count</dt>
                            <dd className="font-medium">{cluster.count}</dd>
                          </div>
                          {cluster[`mean_${selectedMetric}`] !== undefined && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Mean</dt>
                              <dd className="font-medium">{cluster[`mean_${selectedMetric}`].toFixed(2)}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TimePatternAnalyzer;

