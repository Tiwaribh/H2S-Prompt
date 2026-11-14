'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  MapPin,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { AirQualityResponse, CityLocation } from '@/lib/types';
import { AQIBadge } from './AQIBadge';
import { getAQICategory, formatHourOnly, DEFAULT_CITIES } from '@/lib/aqi-utils';

interface HotspotsTrendsTabProps {
  currentAirData: AirQualityResponse | null;
  multiLocationsData: AirQualityResponse[];
  onAddLocation: (loc: CityLocation) => void;
  onRemoveLocation: (id: string) => void;
  onSelectActiveLocation: (loc: CityLocation) => void;
}

export const HotspotsTrendsTab: React.FC<HotspotsTrendsTabProps> = ({
  currentAirData,
  multiLocationsData,
  onAddLocation,
  onRemoveLocation,
  onSelectActiveLocation,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('us_aqi');

  if (!currentAirData) {
    return <div className="p-8 text-center text-slate-500">No air data loaded.</div>;
  }

  // Format hourly chart data (sampling every 2-3 hours for clean rendering)
  const hourly = currentAirData.hourly;
  const chartData = (hourly.time || [])
    .map((timeStr, i) => {
      const d = new Date(timeStr);
      const isPast = d < new Date();
      return {
        time: timeStr,
        displayTime: formatHourOnly(timeStr),
        date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        us_aqi: hourly.us_aqi[i],
        pm2_5: hourly.pm2_5[i],
        pm10: hourly.pm10[i],
        nitrogen_dioxide: hourly.nitrogen_dioxide[i],
        ozone: hourly.ozone[i],
        carbon_monoxide: hourly.carbon_monoxide[i],
        sulphur_dioxide: hourly.sulphur_dioxide[i],
        isPast,
      };
    })
    .filter((_, idx) => idx % 2 === 0); // sample every 2 hours

  // Comparison Bar Chart data
  const comparisonData = multiLocationsData.map((d) => ({
    name: d.location.name,
    aqi: d.current.us_aqi ?? 0,
    pm2_5: d.current.pm2_5 ?? 0,
    pm10: d.current.pm10 ?? 0,
    no2: d.current.nitrogen_dioxide ?? 0,
  }));

  // Identify highest pollution location
  const highestLocation = [...multiLocationsData].sort(
    (a, b) => (b.current.us_aqi ?? 0) - (a.current.us_aqi ?? 0)
  )[0];

  const availableCitiesToAdd = DEFAULT_CITIES.filter(
    (c) => !multiLocationsData.some((m) => m.location.name.toLowerCase() === c.name.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Non-negotiable Disclosure Alert */}
      <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/70 text-teal-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold">CIVIC LOCATION COMPARISON NOTICE</div>
          <p className="text-teal-800 leading-relaxed">
            This module compares regional model-estimated atmospheric baselines across distinct geographic coordinates. It is accurately designated as a <strong>Location Comparison</strong>, not an official continuous monitoring-station hotspot map, because readings originate from CAMS numerical atmospheric grid cells.
          </p>
        </div>
      </div>

      {/* Multi-Location Comparison Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Multi-Location Comparison Intelligence
            </h2>
            <p className="text-xs text-slate-500">
              Live criteria pollutant comparison across Indian urban centers
            </p>
          </div>

          {/* Quick Add City Dropdown */}
          {availableCitiesToAdd.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Add City:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableCitiesToAdd.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onAddLocation(c)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {multiLocationsData.map((locData) => {
            const isHighest = highestLocation?.location.id === locData.location.id && multiLocationsData.length > 1;
            const aqiVal = locData.current.us_aqi;
            const cat = getAQICategory(aqiVal);

            return (
              <div
                key={locData.location.id}
                className={`p-4 rounded-xl border transition-all ${
                  isHighest
                    ? 'border-rose-300 bg-rose-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => onSelectActiveLocation(locData.location)}
                    className="cursor-pointer group"
                  >
                    <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1">
                      {locData.location.name}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {locData.location.latitude.toFixed(2)}°, {locData.location.longitude.toFixed(2)}°
                    </span>
                  </div>

                  {multiLocationsData.length > 1 && (
                    <button
                      onClick={() => onRemoveLocation(locData.location.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-baseline justify-between my-3">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-3xl font-black font-mono"
                      style={{ color: cat.color }}
                    >
                      {aqiVal ?? 'N/A'}
                    </span>
                    <span className="text-xs font-bold" style={{ color: cat.color }}>
                      {cat.category}
                    </span>
                  </div>
                  {isHighest && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Highest Risk
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PM2.5</span>
                    <span className="font-bold text-slate-700">
                      {locData.current.pm2_5 ?? 'N/A'} <span className="text-[9px] font-normal text-slate-400">µg</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PM10</span>
                    <span className="font-bold text-slate-700">
                      {locData.current.pm10 ?? 'N/A'} <span className="text-[9px] font-normal text-slate-400">µg</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NO2</span>
                    <span className="font-bold text-slate-700">
                      {locData.current.nitrogen_dioxide ?? 'N/A'} <span className="text-[9px] font-normal text-slate-400">µg</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-Location Comparison Bar Chart */}
        {multiLocationsData.length > 1 && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Comparative Criteria Pollutants Across Selected Cities
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="aqi" name="US AQI" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pm2_5" name="PM2.5 (µg/m³)" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pm10" name="PM10 (µg/m³)" fill="#d97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="no2" name="NO2 (µg/m³)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Hourly Trend & Forecast Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Hourly Pollution Trends & 72-Hour Forecast: {currentAirData.location.name}
            </h2>
            <p className="text-xs text-slate-500">
              Past 48 hours simulated historical baseline & upcoming 72 hours forecast
            </p>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'us_aqi', label: 'AQI' },
              { id: 'pm2_5', label: 'PM2.5' },
              { id: 'pm10', label: 'PM10' },
              { id: 'nitrogen_dioxide', label: 'NO2' },
              { id: 'ozone', label: 'O3' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedMetric === m.id
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="displayTime" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
                labelFormatter={(value, items) => {
                  if (items && items[0]) {
                    const payload = items[0].payload;
                    return `${payload.date} ${payload.displayTime} ${payload.isPast ? '(Past Archive)' : '(Forecast)'}`;
                  }
                  return value;
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#metricGradient)"
                name={selectedMetric.toUpperCase()}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Past 48h Reanalysis
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-300"></span>
              Next 72h Forecast
            </span>
          </div>
          <span className="font-mono text-slate-400">Asia/Kolkata Timezone (IST)</span>
        </div>
      </div>
    </div>
  );
};
