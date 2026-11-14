import { getAQICategory, DEFAULT_CITIES, formatTime, formatHourOnly } from '../src/lib/aqi-utils';

describe('AQI Utilities & Scientific Classification Engine', () => {
  describe('getAQICategory', () => {
    it('handles missing, null, undefined and NaN values safely', () => {
      expect(getAQICategory(null).category).toBe('No Data');
      expect(getAQICategory(undefined).category).toBe('No Data');
      expect(getAQICategory(NaN).category).toBe('No Data');
    });

    it('classifies Good tier (0 to 50)', () => {
      const at0 = getAQICategory(0);
      const at50 = getAQICategory(50);
      expect(at0.category).toBe('Good');
      expect(at50.category).toBe('Good');
      expect(at50.textColor).toBe('text-emerald-700');
    });

    it('classifies Satisfactory / Moderate tier (51 to 100)', () => {
      const at51 = getAQICategory(51);
      const at100 = getAQICategory(100);
      expect(at51.category).toBe('Satisfactory / Moderate');
      expect(at100.category).toBe('Satisfactory / Moderate');
    });

    it('classifies Moderate tier (101 to 200)', () => {
      const at101 = getAQICategory(101);
      const at200 = getAQICategory(200);
      expect(at101.category).toBe('Moderate');
      expect(at200.category).toBe('Moderate');
    });

    it('classifies Poor / Unhealthy tier (201 to 300)', () => {
      const at201 = getAQICategory(201);
      const at300 = getAQICategory(300);
      expect(at201.category).toBe('Poor / Unhealthy');
      expect(at300.category).toBe('Poor / Unhealthy');
    });

    it('classifies Very Poor tier (301 to 400)', () => {
      const at301 = getAQICategory(301);
      const at400 = getAQICategory(400);
      expect(at301.category).toBe('Very Poor');
      expect(at400.category).toBe('Very Poor');
    });

    it('classifies Severe / Hazardous tier (> 400)', () => {
      const at401 = getAQICategory(401);
      const at500 = getAQICategory(500);
      expect(at401.category).toBe('Severe / Hazardous');
      expect(at500.category).toBe('Severe / Hazardous');
      expect(at500.color).toBe('#7f1d1d');
    });
  });

  describe('DEFAULT_CITIES Spatial Bounds', () => {
    it('contains mandatory PromptWars test cities', () => {
      const names = DEFAULT_CITIES.map((c) => c.name.toLowerCase());
      expect(names).toContain('bhopal');
      expect(names).toContain('indore');
      expect(names).toContain('delhi');
      expect(names).toContain('mumbai');
      expect(names).toContain('bengaluru');
    });

    it('ensures all city coordinates fall within Indian geographic boundaries', () => {
      for (const city of DEFAULT_CITIES) {
        expect(city.latitude).toBeGreaterThanOrEqual(8.0);
        expect(city.latitude).toBeLessThanOrEqual(37.0);
        expect(city.longitude).toBeGreaterThanOrEqual(68.0);
        expect(city.longitude).toBeLessThanOrEqual(98.0);
      }
    });
  });

  describe('Timestamp formatting helpers', () => {
    it('handles null/undefined gracefully without throwing exceptions', () => {
      expect(formatTime(undefined)).toBe('N/A');
      expect(formatTime('')).toBe('N/A');
    });

    it('formats ISO timestamps to human-readable strings', () => {
      const formatted = formatTime('2026-11-14T08:30:00Z');
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(3);
    });

    it('formats hour only strings safely', () => {
      const hour = formatHourOnly('2026-11-14T08:30:00Z');
      expect(typeof hour).toBe('string');
    });
  });
});
