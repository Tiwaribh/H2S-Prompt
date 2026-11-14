'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { OverviewTab } from '@/components/OverviewTab';
import { LiveAirQualityTab } from '@/components/LiveAirQualityTab';
import { DataIntelligenceTab } from '@/components/DataIntelligenceTab';
import { HotspotsTrendsTab } from '@/components/HotspotsTrendsTab';
import { RecommendationsTab } from '@/components/RecommendationsTab';
import { BriefingsTab } from '@/components/BriefingsTab';
import { PreviousReportsTab } from '@/components/PreviousReportsTab';
import { DataUploadTab } from '@/components/DataUploadTab';
import { CityLocation, AirQualityResponse, GeminiAnalysisResult, ReportSnapshot } from '@/lib/types';
import { DEFAULT_CITIES } from '@/lib/aqi-utils';
import {
  saveSnapshotToStorage,
  getSnapshotsFromStorage,
} from '@/lib/storage';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [currentLocation, setCurrentLocation] = useState<CityLocation>(DEFAULT_CITIES[0]); // Default: Bhopal
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [multiLocationsData, setMultiLocationsData] = useState<AirQualityResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Gemini Intelligence state
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  // Snapshots & Feedback
  const [snapshots, setSnapshots] = useState<ReportSnapshot[]>([]);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  // Load snapshots from localStorage on mount
  useEffect(() => {
    setSnapshots(getSnapshotsFromStorage());
  }, []);

  // Fetch air quality data for given coordinates
  const fetchAirQuality = useCallback(
    async (location: CityLocation): Promise<AirQualityResponse | null> => {
      const url = `/api/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&name=${encodeURIComponent(
        location.name
      )}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${res.status}: Failed to retrieve air quality data.`
        );
      }
      return await res.json();
    },
    []
  );

  // Initial load: Fetch current location + preload 2 comparison cities (Indore, Delhi)
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setLoading(true);
      setApiError(null);

      try {
        // Fetch current city
        const mainData = await fetchAirQuality(currentLocation);
        if (!isMounted) return;
        setAirData(mainData);

        // Preload multi-locations for immediate comparison capability
        const citiesToPreload = [DEFAULT_CITIES[0], DEFAULT_CITIES[1], DEFAULT_CITIES[2]];
        const multiResults: AirQualityResponse[] = [];

        for (const city of citiesToPreload) {
          if (city.id === currentLocation.id && mainData) {
            multiResults.push(mainData);
          } else {
            try {
              const res = await fetchAirQuality(city);
              if (res) multiResults.push(res);
            } catch (err) {
              console.warn(`Failed to preload ${city.name}`, err);
            }
          }
        }

        if (isMounted) {
          setMultiLocationsData(multiResults);
        }
      } catch (err: any) {
        if (isMounted) {
          setApiError(err.message || 'Unable to connect to Open-Meteo Air Quality API.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [currentLocation, fetchAirQuality]);

  // Handle location selection
  const handleSelectLocation = async (loc: CityLocation) => {
    setCurrentLocation(loc);
    setLoading(true);
    setApiError(null);

    try {
      const data = await fetchAirQuality(loc);
      setAirData(data);

      if (data) {
        setMultiLocationsData((prev) => {
          const exists = prev.some((p) => p.location.name.toLowerCase() === loc.name.toLowerCase());
          if (!exists) {
            return [...prev, data];
          } else {
            return prev.map((p) => (p.location.name.toLowerCase() === loc.name.toLowerCase() ? data : p));
          }
        });
      }
    } catch (err: any) {
      setApiError(err.message || `Failed to fetch data for ${loc.name}.`);
    } finally {
      setLoading(false);
    }
  };

  // Add location to comparison
  const handleAddLocationToComparison = async (loc: CityLocation) => {
    try {
      const data = await fetchAirQuality(loc);
      if (data) {
        setMultiLocationsData((prev) => {
          if (!prev.some((p) => p.location.name.toLowerCase() === loc.name.toLowerCase())) {
            return [...prev, data];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error adding location comparison', err);
    }
  };

  // Remove location from comparison
  const handleRemoveLocationFromComparison = (locId: string) => {
    setMultiLocationsData((prev) => prev.filter((p) => p.location.id !== locId));
  };

  // Save current telemetry snapshot to localStorage
  const handleSaveSnapshot = () => {
    if (!airData) return;

    const snapshot: ReportSnapshot = {
      id: `snap_${Date.now()}`,
      createdAt: new Date().toISOString(),
      locationName: airData.location.name,
      coordinates: {
        lat: airData.location.latitude,
        lon: airData.location.longitude,
      },
      provider: airData.source.provider,
      classification: airData.source.classification === 'model_estimate' ? 'Model Estimate (CAMS)' : 'Station Observed',
      current: airData.current,
      analysis: geminiAnalysis ?? undefined,
    };

    saveSnapshotToStorage(snapshot);
    setSnapshots(getSnapshotsFromStorage());
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  // Trigger Gemini AI analysis
  const handleRunGeminiIntelligence = async () => {
    if (!airData) return;
    setAnalyzing(true);
    setActiveTab('intelligence');

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airQualityData: airData,
          locationsComparison: multiLocationsData,
        }),
      });

      if (!res.ok) {
        throw new Error('Gemini API call failed');
      }

      const result = await res.json();
      setGeminiAnalysis(result);
    } catch (err) {
      console.error('Gemini intelligence error', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Load a previous snapshot into view
  const handleLoadSnapshot = (snapshot: ReportSnapshot) => {
    // If the snapshot has an analysis, set it
    if (snapshot.analysis) {
      setGeminiAnalysis(snapshot.analysis);
      setActiveTab('intelligence');
    } else {
      setActiveTab('overview');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={snapshots.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          currentLocation={currentLocation}
          onSelectLocation={handleSelectLocation}
          airData={airData}
          loading={loading}
          onRefresh={() => handleSelectLocation(currentLocation)}
          onSaveSnapshot={handleSaveSnapshot}
          savedFeedback={savedFeedback}
        />

        {/* Global API Error Notice (Never hidden or silently replaced!) */}
        {apiError && (
          <div className="m-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">API Connection Error</h4>
                <p className="text-xs text-rose-800 mt-0.5">{apiError}</p>
                <p className="text-[11px] text-rose-700 mt-1 italic">
                  AirSathi maintains strict scientific integrity: we never substitute fake or simulated readings when live APIs encounter errors.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSelectLocation(currentLocation)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Tab Views */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              airData={airData}
              loading={loading}
              onNavigate={setActiveTab}
              onRefresh={() => handleSelectLocation(currentLocation)}
              onRunIntelligence={handleRunGeminiIntelligence}
            />
          )}

          {activeTab === 'live' && (
            <LiveAirQualityTab
              airData={airData}
              loading={loading}
              onRefresh={() => handleSelectLocation(currentLocation)}
            />
          )}

          {activeTab === 'intelligence' && (
            <DataIntelligenceTab
              analysis={geminiAnalysis}
              loading={analyzing}
              onRunAnalysis={handleRunGeminiIntelligence}
              airData={airData}
            />
          )}

          {activeTab === 'trends' && (
            <HotspotsTrendsTab
              currentAirData={airData}
              multiLocationsData={multiLocationsData}
              onAddLocation={handleAddLocationToComparison}
              onRemoveLocation={handleRemoveLocationFromComparison}
              onSelectActiveLocation={handleSelectLocation}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsTab airData={airData} />
          )}

          {activeTab === 'briefings' && (
            <BriefingsTab airData={airData} analysis={geminiAnalysis} />
          )}

          {activeTab === 'reports' && (
            <PreviousReportsTab
              snapshots={snapshots}
              currentAirData={airData}
              onRefreshSnapshots={() => setSnapshots(getSnapshotsFromStorage())}
              onLoadSnapshot={handleLoadSnapshot}
            />
          )}

          {activeTab === 'upload' && <DataUploadTab />}
        </main>
      </div>
    </div>
  );
}
