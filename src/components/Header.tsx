'use client';

import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  BookmarkPlus,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
  Database,
  Building,
} from 'lucide-react';
import { CityLocation, AirQualityResponse } from '@/lib/types';
import { DEFAULT_CITIES, formatTime } from '@/lib/aqi-utils';
import { LocationModal } from './LocationModal';

interface HeaderProps {
  currentLocation: CityLocation;
  onSelectLocation: (loc: CityLocation) => void;
  airData: AirQualityResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onSaveSnapshot: () => void;
  savedFeedback: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  airData,
  loading,
  onRefresh,
  onSaveSnapshot,
  savedFeedback,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Location & Quick Selector */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-slate-800 group shadow-sm"
              title="Click to search any city or enter GPS coordinates"
            >
              <MapPin className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold flex items-center gap-1 text-slate-900">
                  {currentLocation.name}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentLocation.latitude.toFixed(3)}°N, {currentLocation.longitude.toFixed(3)}°E
                </div>
              </div>
            </button>

            {/* Quick Metro Pills */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {DEFAULT_CITIES.slice(0, 5).map((city) => (
                <button
                  key={city.id}
                  onClick={() => onSelectLocation(city)}
                  className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                    currentLocation.name.toLowerCase() === city.name.toLowerCase()
                      ? 'bg-white text-emerald-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {city.name}
                </button>
              ))}
              <button
                onClick={() => setModalOpen(true)}
                className="px-2 py-1 text-[11px] text-emerald-700 font-semibold hover:underline"
              >
                + More
              </button>
            </div>

            {/* Classification Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 border border-teal-200 text-teal-800">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              <span>CAMS Model Estimate</span>
              <span
                title="Open-Meteo values are ECMWF CAMS regional atmosphere simulations (~11-40km resolution), not physical CAAQMS stations."
                className="cursor-help text-teal-600"
              >
                <Info className="w-3 h-3 inline" />
              </span>
            </div>
          </div>

          {/* Action Buttons & Timestamps */}
          <div className="flex items-center gap-3">
            {airData?.current?.time && (
              <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Model Time:</span>
                <span className="font-medium text-slate-700 font-mono">
                  {formatTime(airData.current.time)}
                </span>
              </div>
            )}

            <button
              onClick={onSaveSnapshot}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                savedFeedback
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{savedFeedback ? 'Saved!' : 'Save Snapshot'}</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-sm shadow-emerald-700/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Fetching...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </header>

      <LocationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectLocation={onSelectLocation}
      />
    </>
  );
};
