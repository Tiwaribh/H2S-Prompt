export interface CityLocation {
  id: string;
  name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  isCustom?: boolean;
}

export interface CurrentPollutants {
  time: string;
  pm2_5: number | null;
  pm10: number | null;
  carbon_monoxide: number | null;
  nitrogen_dioxide: number | null;
  sulphur_dioxide: number | null;
  ozone: number | null;
  us_aqi: number | null;
  european_aqi: number | null;
}

export interface HourlyPollutants {
  time: string[];
  pm2_5: (number | null)[];
  pm10: (number | null)[];
  carbon_monoxide: (number | null)[];
  nitrogen_dioxide: (number | null)[];
  sulphur_dioxide: (number | null)[];
  ozone: (number | null)[];
  us_aqi: (number | null)[];
  european_aqi: (number | null)[];
}

export interface AirQualityResponse {
  location: CityLocation;
  current: CurrentPollutants;
  hourly: HourlyPollutants;
  units: Record<string, string>;
  source: {
    provider: string;
    model: string;
    classification: 'model_estimate' | 'station_observed';
    description: string;
    retrievedAt: string;
  };
  gridDisclosure?: string;
}

export interface GeminiFinding {
  location: string;
  pollutant: string;
  source_value: number | string;
  unit: string;
  timestamp: string;
  data_provider: string;
  data_type: 'Model estimate (CAMS)' | 'Station observed (CPCB)';
  confidence_and_limitations: string;
  interpretation: string;
}

export interface GeminiAnalysisResult {
  executive_summary: string;
  overall_assessment: string;
  key_findings: GeminiFinding[];
  trends: {
    pollutant: string;
    pattern: string;
    peak_time?: string;
    implication: string;
  }[];
  location_comparison: {
    location: string;
    aqi: number;
    category: string;
    dominant_pollutant: string;
    relative_risk: string;
  }[];
  data_quality: {
    source: string;
    type: string;
    completeness: string;
    uncertainty_notes: string;
  }[];
  priority_actions: {
    priority: 'Immediate (High)' | 'Moderate' | 'Advisory';
    action: string;
    stakeholder: 'Ward Officer' | 'Housing Society' | 'School Administrator' | 'Public';
    target_pollutant: string;
    rationale: string;
    timeframe: string;
  }[];
  health_advisory: string;
  source_meta?: {
    generated_at: string;
    used_model: string;
    real_data_backed: boolean;
  };
}

export type StakeholderRole = 'Ward Officer' | 'Housing Society' | 'School Administrator';

export interface StakeholderRecommendation {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  suggested_action: string;
  responsible_stakeholder: StakeholderRole;
  reason: string;
  supporting_data: string;
  suggested_timeframe: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface ReportSnapshot {
  id: string;
  createdAt: string;
  locationName: string;
  coordinates: { lat: number; lon: number };
  provider: string;
  classification: string;
  current: CurrentPollutants;
  analysis?: GeminiAnalysisResult;
  notes?: string;
}

export interface ComparisonDelta {
  metric: string;
  currentVal: number | null;
  prevVal: number | null;
  delta: number | null;
  percentChange: number | null;
  trend: 'increased' | 'decreased' | 'unchanged' | 'unavailable';
  unit: string;
  compatible: boolean;
  note?: string;
}

export interface UploadedDataRow {
  timestamp?: string;
  location?: string;
  pm2_5?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  aqi?: number;
  raw: Record<string, any>;
}

export interface UploadedDataset {
  filename: string;
  uploadedAt: string;
  rowCount: number;
  columnsDetected: string[];
  rows: UploadedDataRow[];
  warnings: string[];
}
