import test from 'node:test';
import assert from 'node:assert/strict';

test('API Input Validation Logic', async (t) => {
  function validateCoordinates(latStr: string | null, lonStr: string | null) {
    if (!latStr || !lonStr) {
      return { valid: false, error: 'Missing latitude or longitude parameter.' };
    }
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return { valid: false, error: 'Invalid coordinates' };
    }
    return { valid: true, latitude: lat, longitude: lon };
  }

  await t.test('rejects missing coordinates', () => {
    assert.equal(validateCoordinates(null, '77.4126').valid, false);
    assert.equal(validateCoordinates('23.2599', null).valid, false);
  });

  await t.test('rejects non-numeric coordinates', () => {
    assert.equal(validateCoordinates('abc', '77.4126').valid, false);
    assert.equal(validateCoordinates('23.2599', 'xyz').valid, false);
  });

  await t.test('rejects out-of-range latitude (> 90 or < -90)', () => {
    assert.equal(validateCoordinates('95.0', '77.4126').valid, false);
    assert.equal(validateCoordinates('-95.0', '77.4126').valid, false);
  });

  await t.test('rejects out-of-range longitude (> 180 or < -180)', () => {
    assert.equal(validateCoordinates('23.2599', '185.0').valid, false);
    assert.equal(validateCoordinates('23.2599', '-185.0').valid, false);
  });

  await t.test('accepts valid geographic coordinates', () => {
    const res = validateCoordinates('23.2599', '77.4126');
    assert.equal(res.valid, true);
    assert.equal(res.latitude, 23.2599);
    assert.equal(res.longitude, 77.4126);
  });
});

test('Geocoding Query Sanitization', async (t) => {
  function sanitizeQuery(query: string | null): string {
    if (!query) return '';
    return query.trim().slice(0, 100);
  }

  await t.test('trims whitespace and caps maximum query length', () => {
    const longQuery = 'A'.repeat(150);
    const sanitized = sanitizeQuery(`   ${longQuery}   `);
    assert.equal(sanitized.length, 100);
    assert.equal(sanitized[0], 'A');
  });
});
