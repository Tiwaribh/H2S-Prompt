describe('API Request Validation & Sanitization Engine', () => {
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

  function sanitizeQuery(query: string | null): string {
    if (!query) return '';
    return query.trim().slice(0, 100);
  }

  describe('Geographic Coordinate Range Rules', () => {
    it('rejects null or empty coordinates', () => {
      expect(validateCoordinates(null, '77.4126').valid).toBe(false);
      expect(validateCoordinates('23.2599', null).valid).toBe(false);
    });

    it('rejects non-numeric coordinates', () => {
      expect(validateCoordinates('invalid', '77.4126').valid).toBe(false);
      expect(validateCoordinates('23.2599', 'nan').valid).toBe(false);
    });

    it('rejects latitude out of bounds (-90 to +90)', () => {
      expect(validateCoordinates('90.5', '77.4126').valid).toBe(false);
      expect(validateCoordinates('-91.0', '77.4126').valid).toBe(false);
    });

    it('rejects longitude out of bounds (-180 to +180)', () => {
      expect(validateCoordinates('23.2599', '180.5').valid).toBe(false);
      expect(validateCoordinates('23.2599', '-181.0').valid).toBe(false);
    });

    it('accepts valid coordinates within global ranges', () => {
      const res = validateCoordinates('23.2599', '77.4126');
      expect(res.valid).toBe(true);
      expect(res.latitude).toBe(23.2599);
      expect(res.longitude).toBe(77.4126);
    });
  });

  describe('Query String Sanitization', () => {
    it('trims leading/trailing whitespace and limits string length', () => {
      const longInput = '   ' + 'Delhi '.repeat(30) + '   ';
      const clean = sanitizeQuery(longInput);
      expect(clean.length).toBeLessThanOrEqual(100);
      expect(clean.startsWith(' ')).toBe(false);
      expect(clean.endsWith(' ')).toBe(false);
    });
  });
});
