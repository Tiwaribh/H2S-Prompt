'use client';

import React from 'react';
import {
  LayoutDashboard,
  Wind,
  BrainCircuit,
  TrendingUp,
  ShieldAlert,
  FileText,
  History,
  UploadCloud,
  Layers,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'live'
  | 'intelligence'
  | 'trends'
  | 'recommendations'
  | 'briefings'
  | 'reports'
  | 'upload';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: '1. Overview',
      subtitle: 'Executive civic summary',
      icon: LayoutDashboard,
    },
    {
      id: 'live' as NavTab,
      label: '2. Live Air Quality',
      subtitle: 'Real-time criteria pollutants',
      icon: Wind,
    },
    {
      id: 'intelligence' as NavTab,
      label: '3. Data Intelligence',
      subtitle: 'Gemini AI grounded analysis',
      icon: BrainCircuit,
      badge: 'AI',
    },
    {
      id: 'trends' as NavTab,
      label: '4. Hotspots & Trends',
      subtitle: 'Multi-location & forecast',
      icon: TrendingUp,
    },
    {
      id: 'recommendations' as NavTab,
      label: '5. Action Recommendations',
      subtitle: 'Role-based civic mitigation',
      icon: ShieldAlert,
    },
    {
      id: 'briefings' as NavTab,
      label: '6. Generate Briefings',
      subtitle: 'Internal & Hindi citizen advisories',
      icon: FileText,
    },
    {
      id: 'reports' as NavTab,
      label: '7. Previous Reports',
      subtitle: 'Snapshot delta comparison',
      icon: History,
      count: savedCount,
    },
    {
      id: 'upload' as NavTab,
      label: 'Data Upload & CSV',
      subtitle: 'External data evaluation',
      icon: UploadCloud,
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-emerald-50/60 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">AirSathi</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                MVP
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-700 tracking-wide">Civic Air Intelligence</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500 italic leading-snug">
          "From live air quality data to local action."
        </p>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Civic Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white font-medium shadow-sm shadow-emerald-700/20'
                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-emerald-700 text-white' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-emerald-700' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Provider Status Indicator */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-600 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Primary API
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Open-Meteo Live</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          CAMS Numerical Atmosphere Model (~11-40km grid). Real-time telemetry.
        </p>
        <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>PromptWars 2026</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
