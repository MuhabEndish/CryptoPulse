import { describe, it, expect, vi } from 'vitest';
import { fetchMarketData } from '../cryptoApi';

describe('CryptoAPI Service', () => {
  describe('fetchMarketData', () => {
    it('should be defined', () => {
      expect(fetchMarketData).toBeDefined();
      expect(typeof fetchMarketData).toBe('function');
    });

    it('should return a promise', () => {
      const result = fetchMarketData();
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
