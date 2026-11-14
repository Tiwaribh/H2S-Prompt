'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Building,
  Home,
  GraduationCap,
  Clock,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AirQualityResponse, StakeholderRole } from '@/lib/types';
import { getRecommendationsForRole } from '@/lib/storage';

interface RecommendationsTabProps {
  airData: AirQualityResponse | null;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({ airData }) => {
  const [activeRole, setActiveRole] = useState<StakeholderRole>('Ward Officer');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!airData) {
    return <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto">No air data loaded.</div>;
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
  }[] = [
    {
      id: 'Ward Officer',
      label: 'Ward Officer (Municipal)',
      icon: Building,
      desc: 'Mechanical sweeping, anti-smog misting, C&D dust netting, waste burning bans.',
    },
    {
      id: 'Housing Society',
      label: 'Housing Society (RWA)',
      icon: Home,
      desc: 'No-Idling drop zones, wet cleaning driveways, resident morning walk advisories.',
    },
    {
      id: 'School Administrator',
      label: 'School Administrator',
      icon: GraduationCap,
      desc: 'Indoor PE rescheduling, asthma register check, school bus idling controls.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-700" />
            Stakeholder Action Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted civic interventions based on live pollutant concentrations for {airData.location.name}
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 self-start md:self-auto">
          Action Engine
        </span>
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
                  ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Priority Directives for {activeRole}
          </h3>
          <span className="text-xs text-slate-400">
            {recommendations.length} action protocols active
          </span>
        </div>

        <div className="space-y-2.5">
          {recommendations.map((rec) => {
            const isHigh = rec.priority === 'High';
            const isExpanded = expandedId === rec.id;
            return (
              <div
                key={rec.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {rec.suggested_timeframe}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {rec.suggested_action}
                    </h4>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 shrink-0"
                    title="Toggle telemetry details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 animate-in fade-in space-y-1">
                    <div>
                      <strong className="text-slate-800">Supporting Telemetry Evidence:</strong>{' '}
                      <span>{rec.supporting_data}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800">Responsible Stakeholder:</strong>{' '}
                      <span>{rec.responsible_stakeholder}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scientific Integrity Note */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Civic Mitigation Notice:</strong> These interventions represent standardized environmental health measures. While localized suppression and engine idling controls reduce immediate emissions at source, ambient AQI is also governed by boundary layer meteorology.
        </p>
      </div>
    </div>
  );
};
