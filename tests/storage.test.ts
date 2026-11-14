import test from 'node:test';
import assert from 'node:assert/strict';
import { compareSnapshots, getRecommendationsForRole } from '../src/lib/storage.ts';
import type { CurrentPollutants } from '../src/lib/types.ts';

test('Snapshot Comparison Engine - Scientific Delta Math', async (t) => {
  const current: CurrentPollutants = {
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

  const previous: CurrentPollutants = {
    time: '2026-11-14T08:00:00Z',
    pm2_5: 70.0,
    pm10: 180.0,
    carbon_monoxide: 450.0,
    nitrogen_dioxide: 50.0,
    sulphur_dioxide: null, // Test missing previous
    ozone: 35.0,
    us_aqi: 158,
    european_aqi: 70,
  };

  const deltas = compareSnapshots(current, previous, true);

  await t.test('computes accurate numeric delta and percentage for PM2.5 increase', () => {
    const pm25Delta = deltas.find((d) => d.metric.includes('PM2.5'));
    assert.ok(pm25Delta);
    assert.equal(pm25Delta.delta, 15.5);
    assert.equal(pm25Delta.trend, 'increased');
    assert.equal(pm25Delta.percentChange, 22.1);
  });

  await t.test('computes accurate numeric delta and percentage for PM10 decrease', () => {
    const pm10Delta = deltas.find((d) => d.metric.includes('PM10'));
    assert.ok(pm10Delta);
    assert.equal(pm10Delta.delta, -20.0);
    assert.equal(pm10Delta.trend, 'decreased');
    assert.equal(pm10Delta.percentChange, -11.1);
  });

  await t.test('marks unchanged metrics accurately', () => {
    const o3Delta = deltas.find((d) => d.metric.includes('O3'));
    assert.ok(o3Delta);
    assert.equal(o3Delta.delta, 0);
    assert.equal(o3Delta.trend, 'unchanged');
  });

  await t.test('never treats missing pollutant values as zero (marks unavailable)', () => {
    const so2Delta = deltas.find((d) => d.metric.includes('SO2'));
    assert.ok(so2Delta);
    assert.equal(so2Delta.trend, 'unavailable');
    assert.equal(so2Delta.delta, null);
    assert.equal(so2Delta.percentChange, null);
  });
});

test('Stakeholder Action Matrix - Role Grounding & Citations', async (t) => {
  const highPollution: CurrentPollutants = {
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

  await t.test('generates actionable protocols for Ward Officer citing PM10 and dust suppression', () => {
    const recs = getRecommendationsForRole('Ward Officer', highPollution, 'Bhopal');
    assert.ok(recs.length >= 3);
    assert.ok(recs.some((r) => r.suggested_action.toLowerCase().includes('sweeping') || r.suggested_action.toLowerCase().includes('sprinklers')));
    assert.ok(recs.every((r) => r.supporting_data.length > 5));
  });

  await t.test('generates actionable protocols for Housing Society citing no-idling and waste burning', () => {
    const recs = getRecommendationsForRole('Housing Society', highPollution, 'Indore');
    assert.ok(recs.length >= 3);
    assert.ok(recs.some((r) => r.suggested_action.toLowerCase().includes('burning') || r.suggested_action.toLowerCase().includes('idling')));
  });

  await t.test('generates actionable protocols for School Administrator prioritizing child health', () => {
    const recs = getRecommendationsForRole('School Administrator', highPollution, 'Delhi');
    assert.ok(recs.length >= 3);
    assert.ok(recs.some((r) => r.suggested_action.toLowerCase().includes('physical education') || r.suggested_action.toLowerCase().includes('indoor')));
  });
});
