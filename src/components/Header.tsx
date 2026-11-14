'use client';

import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  BookmarkPlus,
  Clock,
  Menu,
  ChevronDown,
  Check,
} from 'lucide-react';
import { CityLocation, AirQualityResponse } from '@/lib/types';
import { formatTime } from '@/lib/aqi-utils';
import { LocationModal } from './LocationModal';

interface HeaderProps {
  currentLocation: CityLocation;
  onSelectLocation: (loc: CityLocation) => void;
  airData: AirQualityResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onSaveSnapshot: () => void;
  savedFeedback: boolean;
  onOpenMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  airData,
  loading,
  onRefresh,
  onSaveSnapshot,
  savedFeedback,
  onOpenMobileNav,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const displayLocation = [currentLocation.name, currentLocation.state]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Mobile Nav Toggle & Selected City + State */}
          <div className="flex items-center gap-2.5 min-w-0">
            {onOpenMobileNav && (
              <button
                onClick={onOpenMobileNav}
                className="md:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group"
              title="Change city or enter GPS coordinates"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {displayLocation || currentLocation.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
                  {currentLocation.latitude.toFixed(2)}°N, {currentLocation.longitude.toFixed(2)}°E
                </div>
              </div>
            </button>
          </div>

          {/* Right: Last Updated Time, Snapshot & Refresh */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {airData?.current?.time && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated:</span>
                <span className="font-medium text-slate-700 font-mono">
                  {formatTime(airData.current.time)}
                </span>
              </div>
            )}

            {/* Save Snapshot button */}
            <button
              onClick={onSaveSnapshot}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                savedFeedback
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
              title="Save snapshot to browser history"
            >
              {savedFeedback ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <BookmarkPlus className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline">{savedFeedback ? 'Saved' : 'Save'}</span>
            </button>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-60 transition-all shadow-xs"
              title="Fetch latest telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Updating...' : 'Refresh'}</span>
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
