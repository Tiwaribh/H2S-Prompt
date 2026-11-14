'use client';

import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GeminiAnalysisResult, AirQualityResponse } from '@/lib/types';
import { formatTime } from '@/lib/aqi-utils';

interface DataIntelligenceTabProps {
  analysis: GeminiAnalysisResult | null;
  loading: boolean;
  onRunAnalysis: () => void;
  airData: AirQualityResponse | null;
}

export const DataIntelligenceTab: React.FC<DataIntelligenceTabProps> = ({
  analysis,
  loading,
  onRunAnalysis,
  airData,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Run Trigger */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Civic AI Intelligence & Audit
            </h2>
            <p className="text-xs text-slate-500">
              Structured civic insights powered by Google Gemini API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {analysis?.source_meta && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              {analysis.source_meta.used_model}
            </span>
          )}
          <button
            onClick={onRunAnalysis}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-60 transition-all shadow-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Telemetry...' : 'Run Intelligence Audit'}</span>
          </button>
        </div>
      </div>

      {/* SKELETON LOADER while analyzing */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
          <div className="h-64 bg-white rounded-2xl border border-slate-200"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !analysis && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Ready to Generate Grounded Civic Insights
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Run Gemini AI on live telemetry for {airData?.location?.name || 'the selected city'} to receive an evidence-backed civic audit.
            </p>
          </div>
          <button
            onClick={onRunAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Audit</span>
          </button>
        </div>
      )}

      {/* Populated Results */}
      {!loading && analysis && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Summary & Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Executive Civic Summary
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {analysis.executive_summary}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Overall Atmospheric Assessment
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {analysis.overall_assessment}
              </p>
            </div>
          </div>

          {/* Key Findings (Real Grounded Telemetry) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Grounded Telemetry Findings (Citing Exact Values)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Validated against Open-Meteo
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {analysis.key_findings.map((f, i) => (
                <div key={i} className="p-4 hover:bg-slate-50/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{f.pollutant}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        {f.source_value} {f.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono">{formatTime(f.timestamp)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-2">
                    {f.interpretation}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                    <strong className="text-slate-700">Limitations & Confidence:</strong> {f.confidence_and_limitations}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trends & Health Advisory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trends */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                Diurnal Dispersion Trends
              </h3>
              <div className="space-y-2.5">
                {analysis.trends.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                      <span>{t.pollutant}</span>
                      {t.peak_time && (
                        <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Peak: {t.peak_time}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mb-1">{t.pattern}</p>
                    <p className="text-[11px] text-slate-500 italic">
                      Civic Implication: {t.implication}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Health & Data Quality */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-700" />
                  Data Quality & Completeness
                </h3>
                <div className="space-y-2.5">
                  {analysis.data_quality.map((dq, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{dq.source}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">{dq.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        <strong>Completeness:</strong> {dq.completeness}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {dq.uncertainty_notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen Health Advisory Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                <div className="font-bold mb-1 flex items-center gap-1.5 text-slate-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Citizen Health Advisory
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {analysis.health_advisory}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
