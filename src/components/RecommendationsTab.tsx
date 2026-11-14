'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Building,
  Home,
  GraduationCap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
} from 'lucide-react';
import { AirQualityResponse, StakeholderRole, StakeholderRecommendation } from '@/lib/types';
import { getRecommendationsForRole } from '@/lib/storage';

interface RecommendationsTabProps {
  airData: AirQualityResponse | null;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({ airData }) => {
  const [activeRole, setActiveRole] = useState<StakeholderRole>('Ward Officer');

  if (!airData) {
    return <div className="p-8 text-center text-slate-500">No air data loaded.</div>;
  }

  const recommendations = getRecommendationsForRole(
    activeRole,
    airData.current,
    airData.location.name
  );

  const roles: {
    id: StakeholderRole;
    label: string;
    icon: any;
    desc: string;
    focus: string;
  }[] = [
    {
      id: 'Ward Officer',
      label: 'Ward Officer (Municipal)',
      icon: Building,
      desc: 'Municipal road dust mitigation, construction oversight, and biomass fire enforcement.',
      focus: 'Mechanical sweeping, anti-smog water sprinklers, C&D dust netting, waste burning bans.',
    },
    {
      id: 'Housing Society',
      label: 'Housing Society (RWA)',
      icon: Home,
      desc: 'Residential gate management, gardening waste, generator emissions, and resident health circulars.',
      focus: 'No-Idling drop zones, wet cleaning driveways, resident morning walk advisories.',
    },
    {
      id: 'School Administrator',
      label: 'School Administrator',
      icon: GraduationCap,
      desc: 'Pediatric exposure reduction, indoor physical education rescheduling, and air filtration.',
      focus: 'Indoor PE rescheduling, asthma register check, school bus idling controls.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            Stakeholder Action Matrix: {airData.location.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted civic interventions computed from live pollutant concentrations (PM2.5: {airData.current.pm2_5} µg/m³, PM10: {airData.current.pm10} µg/m³)
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Targeted Stakeholder Engine
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = activeRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">{r.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {r.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Active Recommended Actions for {activeRole}
          </h3>
          <span className="text-[11px] text-slate-400">
            {recommendations.length} action protocols active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isHigh = rec.priority === 'High';
            return (
              <div
                key={rec.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {rec.suggested_timeframe}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {rec.suggested_action}
                  </h4>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    <strong>Operational Reason:</strong> {rec.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="font-semibold text-emerald-800 block mb-0.5">
                    Supporting Telemetry Evidence:
                  </span>
                  <span>{rec.supporting_data}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scientific Integrity Note */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Scientific Integrity Disclosure:</strong> These civic recommendations represent standardized municipal environmental health practices designed to mitigate emissions and exposure. While localized dust suppression and idling bans reduce emissions at source, regional ambient AQI is heavily driven by boundary layer meteorology and long-range transport. AirSathi avoids unwarranted claims of guaranteed immediate regional AQI drops.
        </p>
      </div>
    </div>
  );
};
