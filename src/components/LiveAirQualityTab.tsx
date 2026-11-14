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
      <div className="p-8 text-center text-slate-500">
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
      benchmark: '0-50 Good | >150 Unhealthy',
      category: getAQICategory(current.us_aqi).category,
      colorClass: getAQICategory(current.us_aqi).textColor,
      description: 'Standard EPA composite index based on maximum risk across criteria pollutants.',
    },
    {
      id: 'european_aqi',
      name: 'European Air Quality Index',
      value: current.european_aqi,
      unit: units.european_aqi || 'Index (1-6)',
      benchmark: '1-2 Good | 4-6 Poor',
      category: (current.european_aqi ?? 0) > 3 ? 'High' : 'Moderate',
      colorClass: (current.european_aqi ?? 0) > 3 ? 'text-orange-700' : 'text-emerald-700',
      description: 'European Environment Agency (EEA) standardized multi-pollutant scale.',
    },
    {
      id: 'pm2_5',
      name: 'PM2.5 (Fine Respirable Particles)',
      value: current.pm2_5,
      unit: units.pm2_5 || 'µg/m³',
      benchmark: 'NAAQS Standard: 60 µg/m³ (24h) | WHO: 15 µg/m³',
      category: (current.pm2_5 ?? 0) > 60 ? 'Exceeds Standard' : 'Within Standard',
      colorClass: (current.pm2_5 ?? 0) > 60 ? 'text-rose-600' : 'text-emerald-700',
      description:
        'Microscopic particles (≤2.5 µm) that penetrate deep into lung alveoli and bloodstream.',
    },
    {
      id: 'pm10',
      name: 'PM10 (Coarse Inhalable Dust)',
      value: current.pm10,
      unit: units.pm10 || 'µg/m³',
      benchmark: 'NAAQS Standard: 100 µg/m³ (24h) | WHO: 45 µg/m³',
      category: (current.pm10 ?? 0) > 100 ? 'Exceeds Standard' : 'Within Standard',
      colorClass: (current.pm10 ?? 0) > 100 ? 'text-amber-700' : 'text-emerald-700',
      description:
        'Mechanical dust, resuspended road silt, construction activities, and unpaved surface transport.',
    },
    {
      id: 'nitrogen_dioxide',
      name: 'NO2 (Nitrogen Dioxide)',
      value: current.nitrogen_dioxide,
      unit: units.nitrogen_dioxide || 'µg/m³',
      benchmark: 'NAAQS Standard: 80 µg/m³ (24h) | WHO: 25 µg/m³',
      category: (current.nitrogen_dioxide ?? 0) > 80 ? 'Elevated' : 'Normal',
      colorClass: (current.nitrogen_dioxide ?? 0) > 80 ? 'text-amber-700' : 'text-emerald-700',
      description:
        'Pungent toxic gas originating directly from vehicular exhaust, diesel engines, and combustion.',
    },
    {
      id: 'sulphur_dioxide',
      name: 'SO2 (Sulphur Dioxide)',
      value: current.sulphur_dioxide,
      unit: units.sulphur_dioxide || 'µg/m³',
      benchmark: 'NAAQS Standard: 80 µg/m³ (24h) | WHO: 40 µg/m³',
      category: (current.sulphur_dioxide ?? 0) > 80 ? 'Elevated' : 'Normal',
      colorClass: (current.sulphur_dioxide ?? 0) > 80 ? 'text-amber-700' : 'text-emerald-700',
      description:
        'Generated from coal and furnace oil combustion in thermal stations, brick kilns, and industries.',
    },
    {
      id: 'carbon_monoxide',
      name: 'CO (Carbon Monoxide)',
      value: current.carbon_monoxide,
      unit: units.carbon_monoxide || 'µg/m³',
      benchmark: 'NAAQS Standard: 2000 µg/m³ (8h)',
      category: (current.carbon_monoxide ?? 0) > 2000 ? 'Exceeds Standard' : 'Normal',
      colorClass: (current.carbon_monoxide ?? 0) > 2000 ? 'text-rose-700' : 'text-emerald-700',
      description:
        'Colorless, odorless gas emitted by incomplete fuel burning, biomass burning, and congested traffic.',
    },
    {
      id: 'ozone',
      name: 'O3 (Ground-level Ozone)',
      value: current.ozone,
      unit: units.ozone || 'µg/m³',
      benchmark: 'NAAQS Standard: 100 µg/m³ (8h)',
      category: (current.ozone ?? 0) > 100 ? 'Exceeds Standard' : 'Normal',
      colorClass: (current.ozone ?? 0) > 100 ? 'text-rose-700' : 'text-emerald-700',
      description:
        'Photochemical pollutant created when sunlight triggers reactions between NOx and VOCs.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar with provider and coordinates */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-base font-bold text-slate-900">
              Live Air Quality Criteria Matrix: {location.name}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Coordinates: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Retrieved: {formatTime(source.retrievedAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Open-Meteo Live API Active
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Model Estimate (CAMS)
          </span>
        </div>
      </div>

      {/* Grid of 8 Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pollutants.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 truncate">{item.name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${item.colorClass}`}>
                  {item.category}
                </span>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {item.value !== null && item.value !== undefined ? item.value : 'N/A'}
                </span>
                <span className="text-xs font-medium text-slate-500">{item.unit}</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug line-clamp-3">
                {item.description}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              {item.benchmark}
            </div>
          </div>
        ))}
      </div>

      {/* Atmospheric Specifications and NAAQS Standards Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Specifications */}
        <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-700" />
                Atmospheric Modeling & Sensor Assimilation
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-200 text-teal-900">
                ECMWF CAMS
              </span>
            </div>
            <p className="text-xs text-teal-900 leading-relaxed mb-3">
              The Copernicus Atmosphere Monitoring Service combines satellite optical retrievals, meteorological fields, and numerical dispersion models to produce continuous spatial coverage across India.
            </p>
            <div className="p-3 bg-white/80 rounded-xl border border-teal-200/80 text-xs text-teal-950 space-y-1.5">
              <div className="flex items-center justify-between font-medium">
                <span>Model Pipeline:</span>
                <span className="font-bold text-teal-800">CAMS Global & Regional Ensemble</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Grid Spatial Resolution:</span>
                <span className="font-bold text-teal-800">~11 km to 40 km (0.1°–0.25°)</span>
              </div>
              <p className="text-[11px] text-teal-800 pt-1">
                {gridDisclosure}
              </p>
            </div>
          </div>
        </div>

        {/* National Air Quality Standard Reference */}
        <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-blue-700" />
                National Ambient Air Quality Standards (NAAQS)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                Benchmarks
              </span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed mb-3">
              Official Indian regulatory thresholds used by municipal ward officers and civic authorities to evaluate ambient environmental compliance.
            </p>
            <div className="p-3 bg-white/80 rounded-xl border border-blue-200/80 text-xs text-blue-950 space-y-1.5">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>PM2.5 Limit: <strong>60 µg/m³</strong> (24-hr)</div>
                <div>PM10 Limit: <strong>100 µg/m³</strong> (24-hr)</div>
                <div>NO2 Limit: <strong>80 µg/m³</strong> (24-hr)</div>
                <div>SO2 Limit: <strong>80 µg/m³</strong> (24-hr)</div>
                <div>CO Limit: <strong>2000 µg/m³</strong> (8-hr)</div>
                <div>Ozone Limit: <strong>100 µg/m³</strong> (8-hr)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid cell resolution disclosure */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-600" />
          Atmospheric Grid Resolution & Civic Spatial Accuracy
        </div>
        <p className="leading-relaxed text-slate-500">
          The Copernicus Atmosphere Monitoring Service (CAMS) computes regional atmospheric chemistry across grid cells of approximately 0.1° to 0.25° (around 11km to 40km). AirSathi maintains scientific integrity by not inventing synthetic ward-level micro-readings. Neighborhoods within the same municipal grid receive the shared baseline concentration.
        </p>
      </div>
    </div>
  );
};
