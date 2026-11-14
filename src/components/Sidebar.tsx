'use client';

import React from 'react';
import {
  LayoutDashboard,
  Wind,
  BrainCircuit,
  ShieldAlert,
  FileText,
  History,
  X,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'live'
  | 'intelligence'
  | 'recommendations'
  | 'briefings'
  | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'live' as NavTab,
      label: 'Air Quality',
      icon: Wind,
    },
    {
      id: 'intelligence' as NavTab,
      label: 'AI Insights',
      icon: BrainCircuit,
    },
    {
      id: 'recommendations' as NavTab,
      label: 'Recommendations',
      icon: ShieldAlert,
    },
    {
      id: 'briefings' as NavTab,
      label: 'Briefings',
      icon: FileText,
    },
    {
      id: 'reports' as NavTab,
      label: 'History',
      icon: History,
      count: savedCount,
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm font-black text-base">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">AirSathi</span>
            </div>
            <p className="text-[11px] font-medium text-emerald-700">Civic Air Intelligence</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="text-xs flex-1 truncate">{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Compact Status & Multi-Source Disclosure Indicator */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 space-y-1.5">
        <div className="flex items-center justify-between font-medium text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Open-Meteo CAMS</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Active
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>CPCB / Data.gov.in</span>
          <span className="text-[9px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
            Configurable
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight pt-1 border-t border-slate-200/60">
          CAMS atmospheric model (~11-40km grid).
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Navigation Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
