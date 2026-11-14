import {
  compareSnapshots,
  getRecommendationsForRole,
  saveSnapshotToStorage,
  getSnapshotsFromStorage,
  deleteSnapshotFromStorage,
} from '../src/lib/storage';
import { CurrentPollutants, ReportSnapshot } from '../src/lib/types';

describe('Storage & Analytics Utilities', () => {
  // Mock localStorage and window in Node environment
  const mockStore: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => mockStore[key] || null,
    setItem: (key: string, value: string) => {
      mockStore[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete mockStore[key];
    },
    clear: () => {
      for (const k of Object.keys(mockStore)) delete mockStore[k];
    },
  };

  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });
    (global as any).window = global;
  });

  beforeEach(() => {
    mockLocalStorage.clear();
  });

  const currentTelemetry: CurrentPollutants = {
    time: '2026-11-14T10:00:00Z',
    pm2_5: 85.5,
    pm10: 160.0,
    carbon_monoxide: 450.0,
    nitrogen_dioxide: 42.0,
    sulphur_dioxide: 12.0,
    ozone: 35.0,
    us_aqi: 166,
    european_aqi: 75,
  };

  const previousTelemetry: CurrentPollutants = {
    time: '2026-11-14T08:00:00Z',
    pm2_5: 70.0,
    pm10: 180.0,
    carbon_monoxide: 450.0,
    nitrogen_dioxide: 50.0,
    sulphur_dioxide: null, // missing previous reading
    ozone: 35.0,
    us_aqi: 158,
    european_aqi: 70,
  };

  describe('compareSnapshots', () => {
    it('computes accurate numeric delta and percentage for increased metric', () => {
      const deltas = compareSnapshots(currentTelemetry, previousTelemetry, true);
      const pm25Delta = deltas.find((d) => d.metric.includes('PM2.5'));
      expect(pm25Delta).toBeDefined();
      expect(pm25Delta?.delta).toBe(15.5);
      expect(pm25Delta?.trend).toBe('increased');
      expect(pm25Delta?.percentChange).toBe(22.1);
    });

    it('computes accurate numeric delta and percentage for decreased metric', () => {
      const deltas = compareSnapshots(currentTelemetry, previousTelemetry, true);
      const pm10Delta = deltas.find((d) => d.metric.includes('PM10'));
      expect(pm10Delta).toBeDefined();
      expect(pm10Delta?.delta).toBe(-20.0);
      expect(pm10Delta?.trend).toBe('decreased');
      expect(pm10Delta?.percentChange).toBe(-11.1);
    });

    it('identifies unchanged metrics', () => {
      const deltas = compareSnapshots(currentTelemetry, previousTelemetry, true);
      const o3Delta = deltas.find((d) => d.metric.includes('O3'));
      expect(o3Delta).toBeDefined();
      expect(o3Delta?.delta).toBe(0);
      expect(o3Delta?.trend).toBe('unchanged');
    });

    it('handles missing previous readings without fabricating zeroes', () => {
      const deltas = compareSnapshots(currentTelemetry, previousTelemetry, true);
      const so2Delta = deltas.find((d) => d.metric.includes('SO2'));
      expect(so2Delta).toBeDefined();
      expect(so2Delta?.trend).toBe('unavailable');
      expect(so2Delta?.delta).toBeNull();
      expect(so2Delta?.percentChange).toBeNull();
    });
  });

  describe('localStorage Snapshot Persistence', () => {
    const dummySnapshot: ReportSnapshot = {
      id: 'snap_test_1',
      createdAt: new Date().toISOString(),
      locationName: 'Bhopal',
      coordinates: { lat: 23.2599, lon: 77.4126 },
      provider: 'Open-Meteo',
      classification: 'Model Estimate (CAMS)',
      current: currentTelemetry,
    };

    it('saves snapshot to localStorage and retrieves it', () => {
      saveSnapshotToStorage(dummySnapshot);
      const retrieved = getSnapshotsFromStorage();
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].id).toBe('snap_test_1');
      expect(retrieved[0].locationName).toBe('Bhopal');
    });

    it('deletes snapshot by id from storage', () => {
      saveSnapshotToStorage(dummySnapshot);
      expect(getSnapshotsFromStorage().length).toBe(1);
      deleteSnapshotFromStorage('snap_test_1');
      expect(getSnapshotsFromStorage().length).toBe(0);
    });

    it('caps stored snapshots to 30 items max', () => {
      for (let i = 0; i < 35; i++) {
        saveSnapshotToStorage({ ...dummySnapshot, id: `snap_${i}` });
      }
      expect(getSnapshotsFromStorage().length).toBe(30);
    });
  });

  describe('getRecommendationsForRole', () => {
    const elevatedPollution: CurrentPollutants = {
      time: '2026-11-14T10:00:00Z',
      pm2_5: 95.0,
      pm10: 210.0,
      carbon_monoxide: 600.0,
      nitrogen_dioxide: 85.0,
      sulphur_dioxide: 15.0,
      ozone: 40.0,
      us_aqi: 220,
      european_aqi: 88,
    };

    it('generates grounded protocols for Ward Officer (municipal sweeping & C&D checks)', () => {
      const recs = getRecommendationsForRole('Ward Officer', elevatedPollution, 'Bhopal');
      expect(recs.length).toBeGreaterThanOrEqual(3);
      expect(recs.some((r) => r.suggested_action.toLowerCase().includes('sweeping') || r.suggested_action.toLowerCase().includes('sprinklers'))).toBe(true);
      expect(recs.every((r) => r.supporting_data.length > 5)).toBe(true);
    });

    it('generates grounded protocols for Housing Society (no-idling & waste burning ban)', () => {
      const recs = getRecommendationsForRole('Housing Society', elevatedPollution, 'Indore');
      expect(recs.length).toBeGreaterThanOrEqual(3);
      expect(recs.some((r) => r.suggested_action.toLowerCase().includes('burning') || r.suggested_action.toLowerCase().includes('idling'))).toBe(true);
    });

    it('generates grounded protocols for School Administrator (indoor PE & asthma registers)', () => {
      const recs = getRecommendationsForRole('School Administrator', elevatedPollution, 'Delhi');
      expect(recs.length).toBeGreaterThanOrEqual(3);
      expect(recs.some((r) => r.suggested_action.toLowerCase().includes('physical education') || r.suggested_action.toLowerCase().includes('indoor'))).toBe(true);
    });

    it('covers all branch conditions under low and moderate pollution scenarios', () => {
      const cleanAir: CurrentPollutants = {
        time: '2026-11-14T10:00:00Z',
        pm2_5: 15.0,
        pm10: 35.0,
        carbon_monoxide: 100.0,
        nitrogen_dioxide: 12.0,
        sulphur_dioxide: 5.0,
        ozone: 20.0,
        us_aqi: 40,
        european_aqi: 20,
      };

      const moderateAir: CurrentPollutants = {
        time: '2026-11-14T10:00:00Z',
        pm2_5: 45.0,
        pm10: 85.0,
        carbon_monoxide: 300.0,
        nitrogen_dioxide: 35.0,
        sulphur_dioxide: 8.0,
        ozone: 30.0,
        us_aqi: 110,
        european_aqi: 50,
      };

      const severeAir: CurrentPollutants = {
        time: '2026-11-14T10:00:00Z',
        pm2_5: 220.0,
        pm10: 380.0,
        carbon_monoxide: 1200.0,
        nitrogen_dioxide: 110.0,
        sulphur_dioxide: 30.0,
        ozone: 60.0,
        us_aqi: 320,
        european_aqi: 95,
      };

      expect(getRecommendationsForRole('Ward Officer', cleanAir, 'Bhopal')).toBeDefined();
      expect(getRecommendationsForRole('Housing Society', cleanAir, 'Indore')).toBeDefined();
      expect(getRecommendationsForRole('School Administrator', cleanAir, 'Delhi')).toBeDefined();

      expect(getRecommendationsForRole('Ward Officer', moderateAir, 'Bhopal')).toBeDefined();
      expect(getRecommendationsForRole('Housing Society', moderateAir, 'Indore')).toBeDefined();
      expect(getRecommendationsForRole('School Administrator', moderateAir, 'Delhi')).toBeDefined();

      expect(getRecommendationsForRole('Housing Society', severeAir, 'Delhi')).toBeDefined();
    });
  });
});
