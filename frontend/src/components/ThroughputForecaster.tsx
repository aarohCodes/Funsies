import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { getLocalities, getNetworkTypes, predictThroughput } from '../api/apiClient';
import { ThroughputPrediction, AccuracyMetrics } from '../types';

const ThroughputForecaster: React.FC = () => {
  const [localities, setLocalities] = useState<any[]>([]);
  const [networkTypes, setNetworkTypes] = useState<string[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [selectedNetworkType, setSelectedNetworkType] = useState<string>('4G');
  const [hoursAhead, setHoursAhead] = useState<number>(24);
  const [predictions, setPredictions] = useState<ThroughputPrediction[]>([]);
  const [confidenceIntervals, setConfidenceIntervals] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<AccuracyMetrics>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [localitiesData, networkTypesData] = await Promise.all([
          getLocalities(),
          getNetworkTypes(),
        ]);
        setLocalities(localitiesData.localities || []);
        setNetworkTypes(networkTypesData.network_types || []);
        if (localitiesData.localities && localitiesData.localities.length > 0) {
          setSelectedLocality(localitiesData.localities[0].name);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (predictions.length > 0) {
      // Check for low throughput predictions
      const lowThroughput = predictions.filter((p) => p.predicted_throughput_mbps < 5.0);
      if (lowThroughput.length > 0) {
        const earliestLow = lowThroughput[0];
        setAlert(
          `Warning: Low throughput predicted (${earliestLow.predicted_throughput_mbps.toFixed(2)} Mbps) at ${new Date(earliestLow.timestamp).toLocaleString()}. Consider allocating additional resources.`
        );
      } else {
        setAlert(null);
      }
    }
  }, [predictions]);

  const handlePredict = async () => {
    if (!selectedLocality) {
      setError('Please select a locality');
      return;
    }

    setLoading(true);
    setError(null);
    setAlert(null);

    try {
      const result = await predictThroughput(selectedLocality, selectedNetworkType, hoursAhead);
      setPredictions(result.predictions || []);
      setConfidenceIntervals(result.confidence_intervals || []);
      setMetrics(result.accuracy_metrics || {});

      // Find high demand period
      if (result.predictions && result.predictions.length > 0) {
        const maxThroughput = Math.max(...result.predictions.map((p: any) => p.predicted_throughput_mbps));
        const highDemand = result.predictions.find(
          (p: any) => p.predicted_throughput_mbps === maxThroughput
        );
        if (highDemand) {
          setAlert(
            `High demand expected at ${new Date(highDemand.timestamp).toLocaleString()}. Consider allocating additional resources.`
          );
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to generate predictions');
    } finally {
      setLoading(false);
    }
  };

  const chartData = predictions.map((pred, index) => {
    const conf = confidenceIntervals[index];
    return {
      timestamp: new Date(pred.timestamp).toLocaleString(),
      throughput: pred.predicted_throughput_mbps,
      lower: conf?.lower,
      upper: conf?.upper,
    };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Throughput Demand Forecasting</h1>
        <p className="text-gray-600">Forecast data throughput for the next 24-72 hours</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locality
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Locality</option>
              {localities.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network Type
            </label>
            <select
              value={selectedNetworkType}
              onChange={(e) => setSelectedNetworkType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {networkTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Horizon
            </label>
            <select
              value={hoursAhead}
              onChange={(e) => setHoursAhead(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handlePredict}
              disabled={loading || !selectedLocality}
              className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Forecasting...' : 'Forecast'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {alert && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            <p>{alert}</p>
          </div>
        </div>
      )}

      {metrics && Object.keys(metrics).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Accuracy Metrics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">R² Score</p>
              <p className="text-2xl font-bold text-gray-800">
                {metrics.r2?.toFixed(3) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">RMSE</p>
              <p className="text-2xl font-bold text-gray-800">
                {metrics.rmse?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">MAE</p>
              <p className="text-2xl font-bold text-gray-800">
                {metrics.mae?.toFixed(2) || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Throughput Forecast</h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Throughput (Mbps)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="upper"
                fill="#94A3B8"
                fillOpacity={0.2}
                stroke="none"
                name="Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lower"
                fill="#94A3B8"
                fillOpacity={0.2}
                stroke="none"
                name="Lower Bound"
              />
              <Line
                type="monotone"
                dataKey="throughput"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Predicted Throughput"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="upper"
                stroke="#94A3B8"
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Confidence Interval"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="lower"
                stroke="#94A3B8"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Recommendations</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Monitor predicted throughput values below 5 Mbps</li>
              <li>Allocate additional resources during peak demand periods</li>
              <li>Consider network type upgrades for consistently low throughput areas</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThroughputForecaster;

