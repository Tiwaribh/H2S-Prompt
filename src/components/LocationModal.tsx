'use client';

import React, { useState } from 'react';
import { Search, MapPin, X, Loader2, Compass } from 'lucide-react';
import { CityLocation } from '@/lib/types';
import { DEFAULT_CITIES } from '@/lib/aqi-utils';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: CityLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [customName, setCustomName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;

    setSearching(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        setResults([]);
        setErrorMsg(`No coordinates found for "${query}". Try standard city names like Bhopal, Indore, Jaipur.`);
      }
    } catch (err: any) {
      setErrorMsg('Geocoding service network lookup failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleApplyCustomCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setErrorMsg('Please enter valid numeric latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    const customLoc: CityLocation = {
      id: `coord_${lat.toFixed(4)}_${lon.toFixed(4)}`,
      name: customName.trim() || `Coord (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      country: 'Custom Coordinates',
      latitude: lat,
      longitude: lon,
      isCustom: true,
    };

    onSelectLocation(customLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Select Civic Monitoring Location</h3>
              <p className="text-xs text-slate-500">Live coordinates drive Open-Meteo API requests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick presets */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
              Quick Indian Metros & State Capitals
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectLocation(c);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-medium text-slate-700 hover:text-emerald-800 transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search form */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
              Search Any City or Town
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Bhopal, Indore, Pune, Varanasi..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-1.5 shrink-0"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>
          </div>

          {/* Search Results */}
          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              <div className="text-[11px] font-bold text-slate-500 px-2 py-1">
                Found {results.length} locations via Geocoding API:
              </div>
              {results.map((loc) => (
                <button
                  key={`${loc.latitude}_${loc.longitude}`}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-900 border border-transparent hover:border-emerald-200 text-left transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{loc.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {[loc.state, loc.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-500">
                    {loc.latitude.toFixed(3)}°, {loc.longitude.toFixed(3)}°
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Custom Coordinate Form */}
          <div className="pt-3 border-t border-slate-200">
            <details className="text-xs">
              <summary className="font-semibold text-slate-600 cursor-pointer hover:text-emerald-700 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                Enter Exact GPS Latitude & Longitude
              </summary>
              <form onSubmit={handleApplyCustomCoords} className="mt-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="23.2599"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="77.4126"
                      value={customLon}
                      onChange={(e) => setCustomLon(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Custom Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Arera Colony Ward 48"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-900"
                >
                  Apply Custom Coordinates
                </button>
              </form>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
