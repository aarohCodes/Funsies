import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLocalities, analyzeLocationDemand } from '../api/apiClient';
import { LocationDemand } from '../types';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationHeatmap: React.FC = () => {
  const [localities, setLocalities] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('composite');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('current');
  const [locationDemands, setLocationDemands] = useState<LocationDemand[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [top5High, setTop5High] = useState<LocationDemand[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationDemand | null>(null);

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
    loadLocationDemand();
  }, [selectedMetric, selectedTimeRange]);

  const loadLocationDemand = async () => {
    setLoading(true);
    try {
      const result = await analyzeLocationDemand(selectedMetric, selectedTimeRange);
      setLocationDemands(result.ranked_localities || []);
      setStatistics(result.statistics || {});
      setTop5High(result.top_5_high_demand || []);
    } catch (error) {
      console.error('Error loading location demand:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDemandColor = (score: number) => {
    const maxScore = statistics.max || 1;
    const normalized = score / maxScore;
    if (normalized > 0.66) return '#EF4444'; // High demand
    if (normalized > 0.33) return '#F59E0B'; // Medium demand
    return '#10B981'; // Low demand
  };

  const getDemandSize = (score: number) => {
    const maxScore = statistics.max || 1;
    const normalized = score / maxScore;
    return 8 + normalized * 12; // Size between 8 and 20
  };

  // Calculate center of all localities (Bihar approximate center)
  const centerLat = locationDemands.length > 0
    ? locationDemands.reduce((sum, loc) => sum + loc.coordinates.latitude, 0) / locationDemands.length
    : 25.0961;
  const centerLon = locationDemands.length > 0
    ? locationDemands.reduce((sum, loc) => sum + loc.coordinates.longitude, 0) / locationDemands.length
    : 85.3131;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Location-based Demand Heatmap</h1>
        <p className="text-gray-600">View network demand by location and identify high-priority areas</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="composite">Composite Score</option>
              <option value="throughput">Throughput</option>
              <option value="signal_strength">Signal Strength</option>
              <option value="latency">Latency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="current">Current</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading location demand data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Demand Map</h2>
              {locationDemands.length > 0 ? (
                <div style={{ height: '600px', width: '100%' }}>
                  <MapContainer
                    center={[centerLat, centerLon]}
                    zoom={8}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {locationDemands.map((location) => (
                      <CircleMarker
                        key={location.name}
                        center={[location.coordinates.latitude, location.coordinates.longitude]}
                        radius={getDemandSize(location.demand_score)}
                        pathOptions={{
                          color: getDemandColor(location.demand_score),
                          fillColor: getDemandColor(location.demand_score),
                          fillOpacity: 0.6,
                        }}
                        eventHandlers={{
                          click: () => setSelectedLocation(location),
                        }}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-bold text-lg">{location.name}</h3>
                            <p className="text-sm">Demand Score: {location.demand_score.toFixed(2)}</p>
                            <p className="text-sm">Rank: #{location.rank}</p>
                            {location.statistics.throughput && (
                              <p className="text-sm">
                                Avg Throughput: {location.statistics.throughput.mean.toFixed(2)} Mbps
                              </p>
                            )}
                            {location.statistics.signal_strength && (
                              <p className="text-sm">
                                Avg Signal: {location.statistics.signal_strength.mean.toFixed(1)} dBm
                              </p>
                            )}
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No location data available</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 High Demand</h2>
              <div className="space-y-3">
                {top5High.map((location, index) => (
                  <div
                    key={location.name}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedLocation?.name === location.name
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">#{index + 1}</span>
                      <span className="text-sm font-bold text-red-600">
                        {location.demand_score.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{location.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Statistics</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Mean</dt>
                  <dd className="font-semibold">{statistics.mean?.toFixed(2) || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Std Dev</dt>
                  <dd className="font-semibold">{statistics.std?.toFixed(2) || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Min</dt>
                  <dd className="font-semibold">{statistics.min?.toFixed(2) || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Max</dt>
                  <dd className="font-semibold">{statistics.max?.toFixed(2) || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Total Localities</dt>
                  <dd className="font-semibold">{statistics.total_localities || 0}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Legend</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Low Demand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Medium Demand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">High Demand</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Circle size represents demand intensity
              </p>
            </div>
          </div>
        </div>
      )}

      {locationDemands.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ranked Localities</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinates
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locationDemands.map((location) => (
                  <tr
                    key={location.name}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedLocation?.name === location.name ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{location.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.demand_score.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationHeatmap;

