'use client';

import React, { useState } from 'react';
import {
  Wind,
  AlertTriangle,
  Info,
  BrainCircuit,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Building,
  Home,
  GraduationCap,
  Sparkles,
  FileText,
  Copy,
  Download,
  Check,
  Languages,
  BookOpen,
} from 'lucide-react';
import { AirQualityResponse, StakeholderRole, GeminiAnalysisResult } from '@/lib/types';
import { getAQICategory, formatTime } from '@/lib/aqi-utils';
import { getRecommendationsForRole } from '@/lib/storage';

interface OverviewTabProps {
  airData: AirQualityResponse | null;
  loading: boolean;
  onNavigate: (tab: any) => void;
  onRefresh: () => void;
  onRunIntelligence: () => void;
  geminiAnalysis?: GeminiAnalysisResult | null;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  airData,
  loading,
  onNavigate,
  onRunIntelligence,
  geminiAnalysis,
}) => {
  // State for expandable sections
  const [showAllPollutants, setShowAllPollutants] = useState(false);
  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('Ward Officer');
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);

  // Briefing preview state on Overview
  const [reportType, setReportType] = useState<'internal' | 'citizen'>('internal');
  const [reportLang, setReportLang] = useState<'en' | 'hi'>('en');
  const [reportLevel, setReportLevel] = useState<'standard' | 'simple'>('standard');
  const [briefingGenerated, setBriefingGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Expandable footer details
  const [showDataDetails, setShowDataDetails] = useState(false);

  // SKELETON LOADER while data is loading initially
  if (loading && !airData) {
    return (
      <div className="space-y-5 animate-pulse max-w-5xl mx-auto">
        <div className="h-44 bg-white rounded-2xl border border-slate-200"></div>
        <div className="h-36 bg-white rounded-2xl border border-slate-200"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-white rounded-2xl border border-slate-200"></div>
          <div className="h-48 bg-white rounded-2xl border border-slate-200"></div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (!airData) {
    return (
      <div className="p-8 text-center bg-white border border-rose-200 rounded-2xl max-w-lg mx-auto my-12 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Live Air Quality Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
          Unable to retrieve telemetry from Open-Meteo Air Quality API. Real data is required to operate AirSathi.
        </p>
      </div>
    );
  }

  const { current, location, source, gridDisclosure } = airData;
  const aqi = current.us_aqi;
  const aqiCat = getAQICategory(aqi);

  // Key 3 Pollutants
  const primaryPollutants = [
    {
      key: 'pm2_5',
      name: 'PM2.5',
      fullName: 'Fine Particulates',
      val: current.pm2_5,
      unit: 'µg/m³',
      threshold: 60,
    },
    {
      key: 'pm10',
      name: 'PM10',
      fullName: 'Coarse Dust',
      val: current.pm10,
      unit: 'µg/m³',
      threshold: 100,
    },
    {
      key: 'nitrogen_dioxide',
      name: 'NO₂',
      fullName: 'Nitrogen Dioxide',
      val: current.nitrogen_dioxide,
      unit: 'µg/m³',
      threshold: 80,
    },
  ];

  // Additional Pollutants for Expandable Section
  const additionalPollutants = [
    {
      key: 'carbon_monoxide',
      name: 'CO',
      fullName: 'Carbon Monoxide',
      val: current.carbon_monoxide,
      unit: 'µg/m³',
      threshold: 2000,
    },
    {
      key: 'sulphur_dioxide',
      name: 'SO₂',
      fullName: 'Sulphur Dioxide',
      val: current.sulphur_dioxide,
      unit: 'µg/m³',
      threshold: 80,
    },
    {
      key: 'ozone',
      name: 'O₃',
      fullName: 'Ground Ozone',
      val: current.ozone,
      unit: 'µg/m³',
      threshold: 100,
    },
    {
      key: 'european_aqi',
      name: 'EAQI',
      fullName: 'European AQI',
      val: current.european_aqi,
      unit: 'Index',
      threshold: 50,
    },
  ];

  // AI Insights data (from live Gemini analysis or grounded deterministic calculation)
  const aiSummary =
    geminiAnalysis?.executive_summary ||
    `Live ambient air quality in ${location.name} registers an AQI of ${aqi ?? 'N/A'} (${aqiCat.category}). Fine particulate PM2.5 (${current.pm2_5 ?? 'N/A'} µg/m³) and dust PM10 (${current.pm10 ?? 'N/A'} µg/m³) are the primary active constituents.`;

  const aiTopFindings = (geminiAnalysis?.key_findings || []).slice(0, 3);
  const fallbackFindings = [
    {
      pollutant: 'PM2.5',
      text: `Measured at ${current.pm2_5 ?? 'N/A'} µg/m³ (${(current.pm2_5 ?? 0) > 60 ? 'elevated' : 'within standard'}).`,
    },
    {
      pollutant: 'PM10',
      text: `Recorded at ${current.pm10 ?? 'N/A'} µg/m³, reflecting regional mechanical dust and suspension.`,
    },
    {
      pollutant: 'NO₂',
      text: `Nitrogen dioxide currently reported at ${current.nitrogen_dioxide ?? 'N/A'} µg/m³ along transit corridors.`,
    },
  ];

  // Quick Actions (Max 3 practical civic actions)
  const quickActions = [
    {
      target: 'Children & Schools',
      text: (aqi ?? 0) > 150
        ? 'Reschedule strenuous morning outdoor sports to well-ventilated indoor halls.'
        : 'Normal outdoor activities permitted; observe sensitive children for fatigue.',
    },
    {
      target: 'Older Adults & Asthma',
      text: (aqi ?? 0) > 100
        ? 'Schedule morning walks after 09:30 AM when boundary layer dispersion improves.'
        : 'Standard outdoor recreation is safe; keep rescue inhalers accessible.',
    },
    {
      target: 'Community Precautions',
      text: 'Prohibit open biomass or waste burning; turn off vehicle engines at school and society gates.',
    },
  ];

  // Role recommendations (up to 3)
  const roleRecs = getRecommendationsForRole(selectedRole, current, location.name).slice(0, 3);

  // Generate Report Text for Overview Briefing Card
  const generateReportText = () => {
    if (reportType === 'internal') {
      return `AIRSATHI CIVIC BRIEFING - ${location.name.toUpperCase()}
Date: ${new Date().toLocaleDateString('en-IN')} | Time: ${formatTime(current.time)}
Data Source: ${source.provider} (CAMS Atmospheric Model)

AQI Status: ${aqi ?? 'N/A'} (${aqiCat.category})
PM2.5: ${current.pm2_5 ?? 'N/A'} µg/m³ | PM10: ${current.pm10 ?? 'N/A'} µg/m³ | NO2: ${current.nitrogen_dioxide ?? 'N/A'} µg/m³

PRIORITY MUNICIPAL DIRECTIVES:
1. Targeted mist spraying on major traffic arterial corridors.
2. Spot inspection of construction & demolition sites for dust netting.
3. Strict enforcement against horticultural and plastic waste burning.

Advisory: ${aqiCat.advisory}`;
    } else {
      if (reportLang === 'hi') {
        return `एयरसाथी नागरिक स्वास्थ्य परामर्श - ${location.name}
दिनांक: ${new Date().toLocaleDateString('en-IN')} | समय: ${formatTime(current.time)}
वायु गुणवत्ता: ${aqiCat.category} (AQI: ${aqi ?? 'N/A'})

मुख्य सावधानियां:
1. बच्चे व विद्यार्थी: सुबह के समय खुले में भारी शारीरिक व्यायाम से बचें।
2. बुजुर्ग व दमा रोगी: सुबह 09:30 के बाद ही टहलने निकलें और दवाएं साथ रखें।
3. नागरिक सहयोग: सूखे पत्ते व कचरा न जलाएं, सोसाइटी गेट पर इंजन बंद रखें।

स्रोत: Open-Meteo वायु गुणवत्ता मॉडल डेटा`;
      }
      return `AIRSATHI CITIZEN ADVISORY - ${location.name}
Date: ${new Date().toLocaleDateString('en-IN')} | Status: ${aqiCat.category} (AQI: ${aqi ?? 'N/A'})

KEY PRECAUTIONS:
1. Children & Students: Avoid strenuous early-morning outdoor exercises.
2. Older Adults & Asthma Patients: Schedule outdoor walks after 09:30 AM.
3. Community Action: Strictly avoid open burning of leaves and idle engines at gates.

Data Source: Open-Meteo CAMS Atmospheric Model`;
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AirSathi_${reportType}_${location.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* C. Current Air Quality Card (Hero Component) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden">
        {/* Subtle status tint background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundColor: aqiCat.color }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Air Quality
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-base font-bold text-slate-900">{location.name}</h2>
              <span className="text-xs text-slate-400 font-mono">
                ({location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full border"
              style={{
                backgroundColor: `${aqiCat.color}15`,
                color: aqiCat.color,
                borderColor: `${aqiCat.color}35`,
              }}
            >
              {aqiCat.category}
            </span>
            <span className="text-[11px] font-medium text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
              US AQI
            </span>
          </div>
        </div>

        {/* Hero AQI Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 items-center">
          <div className="md:col-span-1 flex items-baseline gap-3">
            <span
              className="text-6xl font-black tracking-tight font-mono"
              style={{ color: aqiCat.color }}
            >
              {aqi ?? 'N/A'}
            </span>
            <div className="text-xs text-slate-500 font-medium">
              <div>Index Score</div>
              <div className="text-slate-400">0–500 Scale</div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {aqiCat.advisory}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Precautionary Guidance:</strong> {aqiCat.healthImpact}
            </p>
          </div>
        </div>
      </div>

      {/* D. Key Pollutants Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Key Criteria Pollutants
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live criteria readings against regulatory benchmarks
            </p>
          </div>

          <button
            onClick={() => setShowAllPollutants(!showAllPollutants)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>{showAllPollutants ? 'Show fewer' : 'View all pollutants'}</span>
            {showAllPollutants ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Primary 3 Pollutants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {primaryPollutants.map((item) => {
            const hasData = item.val !== null && item.val !== undefined;
            const isElevated = hasData && (item.val as number) > item.threshold;
            return (
              <div
                key={item.key}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{item.name}</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        !hasData ? 'bg-slate-300' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span>{item.fullName}</span>
                  </span>
                </div>

                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {hasData ? item.val : 'N/A'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{item.unit}</span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  Standard Limit: {item.threshold} {item.unit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expandable Section for Remaining Pollutants */}
        {showAllPollutants && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in">
            {additionalPollutants.map((item) => {
              const hasData = item.val !== null && item.val !== undefined;
              return (
                <div
                  key={item.key}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/30"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.fullName}</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-800 font-mono">
                      {hasData ? item.val : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* E. AI Insights & Quick Actions (Split Card) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Civic Intelligence & Quick Actions
            </h3>
          </div>

          <button
            onClick={() => onNavigate('intelligence')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Section 1: AI Insights */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">AI-Generated Assessment</span>
              <button
                onClick={onRunIntelligence}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Run Audit</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {aiSummary}
            </p>

            <div className="space-y-1.5 pt-1">
              {aiTopFindings.length > 0
                ? aiTopFindings.map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>
                        <strong>{f.pollutant}:</strong> {f.interpretation}
                      </span>
                    </div>
                  ))
                : fallbackFindings.map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>
                        <strong>{f.pollutant}:</strong> {f.text}
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          {/* Section 2: Quick Actions */}
          <div className="p-5 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Immediate Public Actions</span>
            <div className="space-y-2.5">
              {quickActions.map((act, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block mb-0.5">{act.target}</span>
                  <p className="text-[11px] text-slate-600 leading-snug">{act.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* F. Recommended Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recommended Stakeholder Actions
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Role-based civic interventions based on current air levels
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {(['Ward Officer', 'Housing Society', 'School Administrator'] as StakeholderRole[]).map((r) => {
              const isSelected = selectedRole === r;
              const shortLabel = r === 'School Administrator' ? 'School' : r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Up to 3 Recommendations */}
        <div className="space-y-2.5">
          {roleRecs.map((rec) => {
            const isExpanded = expandedRecId === rec.id;
            return (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          rec.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rec.suggested_timeframe}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {rec.suggested_action}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {rec.reason}
                    </p>
                  </div>

                  <button
                    onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                    className="text-slate-400 hover:text-slate-700 p-1 shrink-0"
                    title="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 animate-in fade-in space-y-1">
                    <div>
                      <strong className="text-slate-700">Supporting Telemetry:</strong>{' '}
                      <span>{rec.supporting_data}</span>
                    </div>
                    <div>
                      <strong className="text-slate-700">Responsible Unit:</strong>{' '}
                      <span>{rec.responsible_stakeholder}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* G. Briefings & Advisories Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              Civic Briefings & Citizen Advisories
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Generate standardized technical briefings and bilingual citizen guidance
            </p>
          </div>

          <button
            onClick={() => onNavigate('briefings')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>Full Generator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          {/* Report Type */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Type:</span>
            <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setReportType('internal')}
                className={`px-2.5 py-1 rounded font-medium ${
                  reportType === 'internal' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                }`}
              >
                Internal Briefing
              </button>
              <button
                onClick={() => setReportType('citizen')}
                className={`px-2.5 py-1 rounded font-medium ${
                  reportType === 'citizen' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                }`}
              >
                Citizen Advisory
              </button>
            </div>
          </div>

          {/* Language & Level if Citizen */}
          {reportType === 'citizen' && (
            <div className="flex items-center gap-2">
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-[11px]">
                <button
                  onClick={() => setReportLang('en')}
                  className={`px-2 py-0.5 rounded ${
                    reportLang === 'en' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setReportLang('hi')}
                  className={`px-2 py-0.5 rounded ${
                    reportLang === 'hi' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                  }`}
                >
                  हिंदी
                </button>
              </div>

              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-[11px]">
                <button
                  onClick={() => setReportLevel('standard')}
                  className={`px-2 py-0.5 rounded ${
                    reportLevel === 'standard' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setReportLevel('simple')}
                  className={`px-2 py-0.5 rounded ${
                    reportLevel === 'simple' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                  }`}
                >
                  Simple
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={() => setBriefingGenerated(true)}
            className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            Generate Report
          </button>
        </div>

        {/* Generated Report Preview */}
        {briefingGenerated && (
          <div className="space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Generated Document:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 p-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 p-1 font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {generateReportText()}
            </pre>
          </div>
        )}
      </div>

      {/* 4. Data Transparency Footer */}
      <footer className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Data Source:</span>
            <span>{source.provider} ({source.model})</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Last Updated: <strong className="text-slate-700 font-mono">{formatTime(source.retrievedAt)}</strong></span>
            <span>•</span>
            <span>Units: <strong className="text-slate-700 font-mono">µg/m³</strong></span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 text-[11px] text-slate-400">
          <p className="leading-snug">
            <strong>Scientific Classification:</strong> Atmosphere numerical model estimates (ECMWF CAMS ~11–40km grid resolution), not direct physical monitoring-station measurements.
          </p>

          <button
            onClick={() => setShowDataDetails(!showDataDetails)}
            className="text-emerald-700 hover:underline shrink-0 font-medium"
          >
            {showDataDetails ? 'Hide Details' : 'Methodology Details'}
          </button>
        </div>

        {showDataDetails && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1 animate-in fade-in">
            <div className="font-bold text-slate-800">CAMS Grid Cell Resolution & Local Variance</div>
            <p className="leading-relaxed">
              {gridDisclosure} Street-level microclimates within the same municipal grid cell share the regional baseline.
            </p>
          </div>
        )}
      </footer>
    </div>
  );
};
