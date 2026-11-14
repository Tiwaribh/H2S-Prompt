'use client';

import React from 'react';
import {
  MapPin,
  Clock,
  Info,
  Cpu,
  BookmarkCheck,
} from 'lucide-react';
import { AirQualityResponse } from '@/lib/types';
import { getAQICategory, formatTime } from '@/lib/aqi-utils';

interface LiveAirQualityTabProps {
  airData: AirQualityResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const LiveAirQualityTab: React.FC<LiveAirQualityTabProps> = ({
  airData,
}) => {
  if (!airData) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto">
        No air quality data loaded.
      </div>
    );
  }

  const { current, location, units, source, gridDisclosure } = airData;

  const pollutants = [
    {
      id: 'us_aqi',
      name: 'US Air Quality Index',
      value: current.us_aqi,
      unit: units.us_aqi || 'Index (0-500)',
      benchmark: '0–50 Good | >150 Unhealthy',
      category: getAQICategory(current.us_aqi).category,
      colorClass: getAQICategory(current.us_aqi).textColor,
      description: 'Standard EPA composite index based on maximum risk across criteria pollutants.',
    },
    {
      id: 'european_aqi',
      name: 'European Air Quality Index',
      value: current.european_aqi,
      unit: units.european_aqi || 'Index (1-6)',
      benchmark: '1–2 Good | 4–6 Poor',
      category: (current.european_aqi ?? 0) > 3 ? 'High' : 'Moderate',
      colorClass: (current.european_aqi ?? 0) > 3 ? 'text-orange-700' : 'text-emerald-700',
      description: 'European Environment Agency (EEA) standardized multi-pollutant scale.',
    },
    {
      id: 'pm2_5',
      name: 'PM2.5 (Fine Particles)',
      value: current.pm2_5,
      unit: units.pm2_5 || 'µg/m³',
      benchmark: 'NAAQS: 60 µg/m³ (24h) | WHO: 15 µg/m³',
      category: (current.pm2_5 ?? 0) > 60 ? 'Exceeds Standard' : 'Within Standard',
      colorClass: (current.pm2_5 ?? 0) > 60 ? 'text-rose-600' : 'text-emerald-700',
      description:
        'Microscopic particles (≤2.5 µm) that penetrate deep into lung alveoli and bloodstream.',
    },
    {
      id: 'pm10',
      name: 'PM10 (Coarse Dust)',
      value: current.pm10,
      unit: units.pm10 || 'µg/m³',
      benchmark: 'NAAQS: 100 µg/m³ (24h) | WHO: 45 µg/m³',
      category: (current.pm10 ?? 0) > 100 ? 'Exceeds Standard' : 'Within Standard',
      colorClass: (current.pm10 ?? 0) > 100 ? 'text-amber-700' : 'text-emerald-700',
      description:
        'Mechanical dust, resuspended road silt, construction activities, and unpaved surface transport.',
    },
    {
      id: 'nitrogen_dioxide',
      name: 'NO₂ (Nitrogen Dioxide)',
      value: current.nitrogen_dioxide,
      unit: units.nitrogen_dioxide || 'µg/m³',
      benchmark: 'NAAQS: 80 µg/m³ (24h) | WHO: 25 µg/m³',
      category: (current.nitrogen_dioxide ?? 0) > 80 ? 'Elevated' : 'Normal',
      colorClass: (current.nitrogen_dioxide ?? 0) > 80 ? 'text-amber-700' : 'text-emerald-700',
      description:
        'Pungent combustion gas originating from vehicular exhaust, diesel engines, and transit corridors.',
    },
    {
      id: 'sulphur_dioxide',
      name: 'SO₂ (Sulphur Dioxide)',
      value: current.sulphur_dioxide,
      unit: units.sulphur_dioxide || 'µg/m³',
      benchmark: 'NAAQS: 80 µg/m³ (24h) | WHO: 40 µg/m³',
      category: (current.sulphur_dioxide ?? 0) > 80 ? 'Elevated' : 'Normal',
      colorClass: (current.sulphur_dioxide ?? 0) > 80 ? 'text-amber-700' : 'text-emerald-700',
      description:
        'Generated from coal and furnace oil combustion in thermal stations and industrial boilers.',
    },
    {
      id: 'carbon_monoxide',
      name: 'CO (Carbon Monoxide)',
      value: current.carbon_monoxide,
      unit: units.carbon_monoxide || 'µg/m³',
      benchmark: 'NAAQS: 2000 µg/m³ (8h)',
      category: (current.carbon_monoxide ?? 0) > 2000 ? 'Exceeds Standard' : 'Normal',
      colorClass: (current.carbon_monoxide ?? 0) > 2000 ? 'text-rose-700' : 'text-emerald-700',
      description:
        'Emitted by incomplete combustion, smoldering biomass, and congested idling traffic.',
    },
    {
      id: 'ozone',
      name: 'O₃ (Ground-level Ozone)',
      value: current.ozone,
      unit: units.ozone || 'µg/m³',
      benchmark: 'NAAQS: 100 µg/m³ (8h)',
      category: (current.ozone ?? 0) > 100 ? 'Exceeds Standard' : 'Normal',
      colorClass: (current.ozone ?? 0) > 100 ? 'text-rose-700' : 'text-emerald-700',
      description:
        'Photochemical pollutant created when sunlight triggers reactions between NOx and VOCs.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-base font-bold text-slate-900">
              Live Air Quality Criteria Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{location.name} ({location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E)</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTime(source.retrievedAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            Open-Meteo Live API
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            CAMS Model Estimate
          </span>
        </div>
      </div>

      {/* Grid of 8 Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {pollutants.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${item.colorClass}`}>
                  {item.category}
                </span>
              </div>

              <div className="my-2.5 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {item.value !== null && item.value !== undefined ? item.value : 'N/A'}
                </span>
                <span className="text-xs font-medium text-slate-500">{item.unit}</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              {item.benchmark}
            </div>
          </div>
        ))}
      </div>

      {/* Standards & Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Specifications */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-emerald-700" />
            <span>Atmospheric Modeling Pipeline</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Derived from the Copernicus Atmosphere Monitoring Service (ECMWF CAMS) assimilating satellite observations, meteorological forecasts, and emission inventories.
          </p>
          <div className="pt-2 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Grid Spatial Resolution:</span>
              <strong className="text-slate-700 font-mono">~11 km to 40 km (0.1°–0.25°)</strong>
            </div>
            <div className="flex justify-between">
              <span>Forecast Horizon:</span>
              <strong className="text-slate-700 font-mono">72 Hours Hourly</strong>
            </div>
          </div>
        </div>

        {/* NAAQS Benchmarks */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <BookmarkCheck className="w-4 h-4 text-emerald-700" />
            <span>Indian NAAQS Thresholds</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            National Ambient Air Quality Standards regulatory limits utilized by municipal authorities for environmental compliance.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600">
            <div>PM2.5: <strong className="text-slate-800">60 µg/m³</strong> (24h)</div>
            <div>PM10: <strong className="text-slate-800">100 µg/m³</strong> (24h)</div>
            <div>NO2: <strong className="text-slate-800">80 µg/m³</strong> (24h)</div>
            <div>SO2: <strong className="text-slate-800">80 µg/m³</strong> (24h)</div>
          </div>
        </div>
      </div>

      {/* Multi-Source Atmospheric Sensor Network & Station Registry */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Public Telemetry &amp; Sensor Network Registry
          </div>
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Open-Meteo Primary Active
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-emerald-900">Open-Meteo CAMS</strong>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Active primary provider. Global numerical atmospheric model (~11–40km grid cell).
            </p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-slate-800">CPCB / Data.gov.in</strong>
              <span className="text-[10px] text-slate-500 font-mono">Configurable</span>
            </div>
            <p className="text-[11px] text-slate-500">
              National physical station network. Requires DATA_GOV_IN_API_KEY. Primary fallback active.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-slate-800">OpenAQ v3 API</strong>
              <span className="text-[10px] text-slate-500 font-mono">Optional</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Global open sensor network. Requires OPENAQ_API_KEY. Primary fallback active.
            </p>
          </div>
        </div>
      </div>

      {/* Grid disclosure note */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Grid Baseline Disclosure:</strong> {gridDisclosure} Neighborhoods within the same municipal grid cell share the model baseline value.
        </p>
      </div>
    </div>
  );
};
