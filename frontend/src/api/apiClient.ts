import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Core data endpoints
export const getLocalities = async () => {
  const response = await apiClient.get('/localities');
  return response.data;
};

export const getNetworkTypes = async () => {
  const response = await apiClient.get('/network-types');
  return response.data;
};

export const getDataSummary = async () => {
  const response = await apiClient.get('/data/summary');
  return response.data;
};

// Feature 1: Signal Strength Prediction
export const predictSignalStrength = async (locality: string, networkType: string, hoursAhead: number = 24) => {
  const response = await apiClient.post('/predict/signal-strength', {
    locality,
    network_type: networkType,
    hours_ahead: hoursAhead,
  });
  return response.data;
};

// Feature 2: Network Usage Analysis
export const analyzeNetworkUsage = async (locality?: string, startDate?: string, endDate?: string) => {
  const params: any = {};
  if (locality) params.locality = locality;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await apiClient.get('/analysis/network-usage', { params });
  return response.data;
};

// Feature 3: Time Patterns
export const analyzeTimePatterns = async (locality?: string, metric: string = 'throughput') => {
  const params: any = { metric };
  if (locality) params.locality = locality;
  
  const response = await apiClient.get('/analysis/time-patterns', { params });
  return response.data;
};

// Feature 4: Location Demand
export const analyzeLocationDemand = async (metric: string = 'composite', timeRange: string = 'current') => {
  const response = await apiClient.get('/analysis/location-demand', {
    params: { metric, time_range: timeRange },
  });
  return response.data;
};

// Feature 5: Throughput Forecasting
export const predictThroughput = async (locality: string, networkType: string, hoursAhead: number = 24) => {
  const response = await apiClient.post('/predict/throughput', {
    locality,
    network_type: networkType,
    hours_ahead: hoursAhead,
  });
  return response.data;
};

// Model management
export const retrainModels = async () => {
  const response = await apiClient.post('/models/retrain');
  return response.data;
};

export const getModelMetrics = async () => {
  const response = await apiClient.get('/models/metrics');
  return response.data;
};

export default apiClient;

