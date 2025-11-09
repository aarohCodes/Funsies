import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getLocalities, getNetworkTypes, predictSignalStrength } from '../api/apiClient';
import { SignalStrengthPrediction, AccuracyMetrics } from '../types';

const SignalStrengthPredictor: React.FC = () => {
  const [localities, setLocalities] = useState<any[]>([]);
  const [networkTypes, setNetworkTypes] = useState<string[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [selectedNetworkType, setSelectedNetworkType] = useState<string>('4G');
  const [hoursAhead, setHoursAhead] = useState<number>(24);
  const [predictions, setPredictions] = useState<SignalStrengthPrediction[]>([]);
  const [metrics, setMetrics] = useState<AccuracyMetrics>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handlePredict = async () => {
    if (!selectedLocality) {
      setError('Please select a locality');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await predictSignalStrength(selectedLocality, selectedNetworkType, hoursAhead);
      setPredictions(result.predictions || []);
      setMetrics(result.accuracy_metrics || {});
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to generate predictions');
    } finally {
      setLoading(false);
    }
  };

  const getSignalQuality = (strength: number): { color: string; label: string } => {
    if (strength > -70) return { color: '#10B981', label: 'Good' };
    if (strength > -90) return { color: '#F59E0B', label: 'Fair' };
    return { color: '#EF4444', label: 'Poor' };
  };

  const chartData = predictions.map((pred) => {
    const quality = getSignalQuality(pred.predicted_signal_strength);
    return {
      timestamp: new Date(pred.timestamp).toLocaleString(),
      strength: pred.predicted_signal_strength,
      lower: pred.lower_bound,
      upper: pred.upper_bound,
      quality: quality.label,
    };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Signal Strength Predictor</h1>
        <p className="text-gray-600">Predict signal strength for the next 24 hours</p>
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
              Hours Ahead
            </label>
            <select
              value={hoursAhead}
              onChange={(e) => setHoursAhead(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handlePredict}
              disabled={loading || !selectedLocality}
              className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Predicting...' : 'Predict'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {metrics && Object.keys(metrics).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Accuracy Metrics</h2>
          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <p className="text-sm text-gray-600">MAPE</p>
              <p className="text-2xl font-bold text-gray-800">
                {metrics.mape?.toFixed(2) || 'N/A'}%
              </p>
            </div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Signal Strength Predictions</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Signal Strength (dBm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="strength"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Predicted Signal Strength"
                dot={false}
              />
              {chartData[0]?.lower && (
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#94A3B8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Lower Bound"
                  dot={false}
                />
              )}
              {chartData[0]?.upper && (
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#94A3B8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Upper Bound"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Good (&gt; -70 dBm)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Fair (-70 to -90 dBm)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Poor (&lt; -90 dBm)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalStrengthPredictor;

