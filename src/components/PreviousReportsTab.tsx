'use client';

import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ReportSnapshot, AirQualityResponse, ComparisonDelta } from '@/lib/types';
import { compareSnapshots, deleteSnapshotFromStorage } from '@/lib/storage';
import { formatTime, getAQICategory } from '@/lib/aqi-utils';

interface PreviousReportsTabProps {
  snapshots: ReportSnapshot[];
  currentAirData: AirQualityResponse | null;
  onRefreshSnapshots: () => void;
  onLoadSnapshot: (snapshot: ReportSnapshot) => void;
}

export const PreviousReportsTab: React.FC<PreviousReportsTabProps> = ({
  snapshots,
  currentAirData,
  onRefreshSnapshots,
  onLoadSnapshot,
}) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(
    snapshots.length > 0 ? snapshots[0].id : null
  );

  const selectedSnapshot = snapshots.find((s) => s.id === selectedSnapshotId);

  let deltas: ComparisonDelta[] = [];
  if (currentAirData && selectedSnapshot) {
    const isProviderMatch =
      currentAirData.source.provider.toLowerCase() === selectedSnapshot.provider.toLowerCase();
    deltas = compareSnapshots(
      currentAirData.current,
      selectedSnapshot.current,
      isProviderMatch
    );
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSnapshotFromStorage(id);
    onRefreshSnapshots();
    if (selectedSnapshotId === id) {
      setSelectedSnapshotId(snapshots.length > 1 ? snapshots[1].id : null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            Previous Report Snapshots & Comparisons
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare live atmospheric readings against previously saved municipal snapshots
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 self-start md:self-auto">
          {snapshots.length} Stored Snapshot{snapshots.length === 1 ? '' : 's'}
        </span>
      </div>

      {snapshots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-xs">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Previous Snapshots Saved</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Save&quot; in the top header while viewing any city&apos;s live air data to benchmark future changes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Snapshots List */}
          <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
              Saved Snapshots
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {snapshots.map((snap) => {
                const isSelected = snap.id === selectedSnapshotId;
                const aqi = snap.current.us_aqi;
                const aqiCat = getAQICategory(aqi);

                return (
                  <div
                    key={snap.id}
                    onClick={() => setSelectedSnapshotId(snap.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{snap.locationName}</span>
                      <button
                        onClick={(e) => handleDelete(snap.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold font-mono"
                          style={{ color: aqiCat.color }}
                        >
                          AQI {aqi ?? 'N/A'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">PM2.5: {snap.current.pm2_5 ?? 'N/A'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTime(snap.createdAt).split(',')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison Delta View */}
          <div className="lg:col-span-2 space-y-4">
            {selectedSnapshot && currentAirData && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Live ({currentAirData.location.name})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-emerald-800">Snapshot ({selectedSnapshot.locationName})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Saved: {formatTime(selectedSnapshot.createdAt)}
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                    {selectedSnapshot.classification}
                  </span>
                </div>

                {/* Compatibility disclosure */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Comparison only factors matching pollutant units (µg/m³) and identical numerical atmosphere simulations. Missing readings are never treated as zero.
                  </p>
                </div>

                {/* Delta Table */}
                <div className="divide-y divide-slate-100">
                  {deltas.map((d, idx) => {
                    const isIncrease = d.trend === 'increased';
                    const isDecrease = d.trend === 'decreased';
                    const isAqiOrPm = d.metric.includes('AQI') || d.metric.includes('PM');

                    return (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">{d.metric}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Live: <strong className="text-slate-700">{d.currentVal ?? 'N/A'}</strong> vs Saved:{' '}
                            <strong className="text-slate-700">{d.prevVal ?? 'N/A'}</strong> {d.unit}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {d.delta !== null ? (
                            <div
                              className={`flex items-center justify-end gap-1 font-bold font-mono ${
                                isIncrease
                                  ? isAqiOrPm
                                    ? 'text-rose-600'
                                    : 'text-amber-600'
                                  : isDecrease
                                  ? 'text-emerald-700'
                                  : 'text-slate-500'
                              }`}
                            >
                              {isIncrease ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : isDecrease ? (
                                <TrendingDown className="w-3.5 h-3.5" />
                              ) : (
                                <Minus className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {d.delta > 0 ? `+${d.delta}` : d.delta} {d.unit}
                              </span>
                              {d.percentChange !== null && (
                                <span className="text-[10px] font-normal text-slate-400">
                                  ({d.percentChange > 0 ? `+${d.percentChange}` : d.percentChange}%)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">N/A</span>
                          )}
                          <div className="text-[10px] text-slate-400 uppercase font-medium">
                            {d.trend}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
