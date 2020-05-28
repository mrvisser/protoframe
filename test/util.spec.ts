import 'jasmine';
import { hasValue } from '../src/util';

describe('util', () => {
  describe('hasValue', () => {
    it('should tell us if something has a value', () => {
      expect(hasValue(null)).toBe(false);
      expect(hasValue(undefined)).toBe(false);
      expect(hasValue(0)).toBe(true);
      expect(hasValue('')).toBe(true);
      expect(hasValue(false)).toBe(true);
      expect(hasValue({})).toBe(true);
      expect(hasValue([])).toBe(true);
    });
  });
});
