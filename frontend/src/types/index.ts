// Type definitions for the application

export interface Locality {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SignalStrengthPrediction {
  timestamp: string;
  predicted_signal_strength: number;
  lower_bound?: number;
  upper_bound?: number;
}

export interface NetworkUsageStats {
  [networkType: string]: {
    count: number;
    percentage: number;
  };
}

export interface TimePattern {
  peak_hours: number[];
  hourly_averages: { [hour: number]: number };
  daily_patterns: { [day: number]: number };
  demand_clusters: { [key: string]: any };
  heatmap?: HeatmapData[];
}

export interface HeatmapData {
  hour: number;
  day: number;
  value: number;
}

export interface LocationDemand {
  name: string;
  demand_score: number;
  rank: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  statistics: {
    [key: string]: {
      mean: number;
      std: number;
    };
  };
}

export interface ThroughputPrediction {
  timestamp: string;
  predicted_throughput_mbps: number;
  lower?: number;
  upper?: number;
}

export interface AccuracyMetrics {
  rmse?: number;
  mae?: number;
  mape?: number;
  r2?: number;
}

