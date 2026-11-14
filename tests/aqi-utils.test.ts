import test from 'node:test';
import assert from 'node:assert/strict';
import { getAQICategory, DEFAULT_CITIES, formatTime, formatHourOnly } from '../src/lib/aqi-utils.ts';

test('AQI Categorization - Boundary & Classification Accuracy', async (t) => {
  await t.test('handles missing, null, undefined and NaN gracefully', () => {
    assert.equal(getAQICategory(null).category, 'No Data');
    assert.equal(getAQICategory(undefined).category, 'No Data');
    assert.equal(getAQICategory(NaN).category, 'No Data');
  });

  await t.test('classifies Good (0 - 50)', () => {
    const at0 = getAQICategory(0);
    const at50 = getAQICategory(50);
    assert.equal(at0.category, 'Good');
    assert.equal(at50.category, 'Good');
    assert.equal(at50.textColor, 'text-emerald-700');
  });

  await t.test('classifies Satisfactory / Moderate (51 - 100)', () => {
    const at51 = getAQICategory(51);
    const at100 = getAQICategory(100);
    assert.equal(at51.category, 'Satisfactory / Moderate');
    assert.equal(at100.category, 'Satisfactory / Moderate');
  });

  await t.test('classifies Moderate (101 - 200)', () => {
    const at101 = getAQICategory(101);
    const at200 = getAQICategory(200);
    assert.equal(at101.category, 'Moderate');
    assert.equal(at200.category, 'Moderate');
  });

  await t.test('classifies Poor / Unhealthy (201 - 300)', () => {
    const at201 = getAQICategory(201);
    const at300 = getAQICategory(300);
    assert.equal(at201.category, 'Poor / Unhealthy');
    assert.equal(at300.category, 'Poor / Unhealthy');
  });

  await t.test('classifies Very Poor (301 - 400)', () => {
    const at301 = getAQICategory(301);
    const at400 = getAQICategory(400);
    assert.equal(at301.category, 'Very Poor');
    assert.equal(at400.category, 'Very Poor');
  });

  await t.test('classifies Severe / Hazardous (> 400)', () => {
    const at401 = getAQICategory(401);
    const at500 = getAQICategory(500);
    assert.equal(at401.category, 'Severe / Hazardous');
    assert.equal(at500.category, 'Severe / Hazardous');
  });
});

test('Location Presets - Indian Metropolitan Spatial Validity', async (t) => {
  await t.test('contains required PromptWars cities', () => {
    const cityNames = DEFAULT_CITIES.map((c) => c.name.toLowerCase());
    assert.ok(cityNames.includes('bhopal'));
    assert.ok(cityNames.includes('indore'));
    assert.ok(cityNames.includes('delhi'));
    assert.ok(cityNames.includes('mumbai'));
    assert.ok(cityNames.includes('bengaluru'));
  });

  await t.test('all default cities have valid geographical coordinates in India', () => {
    for (const city of DEFAULT_CITIES) {
      assert.ok(city.latitude >= 8.0 && city.latitude <= 37.0, `${city.name} latitude out of Indian bounds: ${city.latitude}`);
      assert.ok(city.longitude >= 68.0 && city.longitude <= 98.0, `${city.name} longitude out of Indian bounds: ${city.longitude}`);
    }
  });
});

test('Time Formatting Utilities', async (t) => {
  await t.test('handles empty or invalid timestamps without throwing', () => {
    assert.equal(formatTime(undefined), 'N/A');
    assert.equal(formatTime(''), 'N/A');
  });

  await t.test('formats valid ISO timestamps', () => {
    const iso = '2026-11-14T10:00:00Z';
    const formatted = formatTime(iso);
    assert.ok(typeof formatted === 'string');
    assert.ok(formatted.length > 3);
  });
});
