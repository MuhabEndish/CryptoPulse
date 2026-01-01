import { describe, it, expect } from 'vitest';
import { containsProfanity, findProfanity, censorText, moderateContent } from '../contentModeration';

describe('Content Moderation', () => {
  describe('containsProfanity', () => {
    it('should detect profanity in text', () => {
      const result = containsProfanity('This is a damn test');
      expect(result).toBe(true);
    });

    it('should detect profanity with mixed case', () => {
      const result = containsProfanity('This is a DAMN test');
      expect(result).toBe(true);
    });

    it('should allow clean content', () => {
      const result = containsProfanity('Bitcoin is a great cryptocurrency');
      expect(result).toBe(false);
    });

    it('should allow empty string', () => {
      const result = containsProfanity('');
      expect(result).toBe(false);
    });

    it('should detect profanity in longer text', () => {
      const result = containsProfanity('I think Bitcoin will moon. Buy now you idiot!');
      expect(result).toBe(true);
    });
  });

  describe('findProfanity', () => {
    it('should find profanity words in text', () => {
      const result = findProfanity('This is a damn stupid test');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('damn');
    });

    it('should return empty array for clean text', () => {
      const result = findProfanity('Bitcoin is great');
      expect(result).toEqual([]);
    });
  });

  describe('censorText', () => {
    it('should replace profanity with asterisks', () => {
      const result = censorText('This is damn bad');
      expect(result).toContain('****'); // damn = 4 chars
    });

    it('should return clean text unchanged', () => {
      const result = censorText('Bitcoin is great');
      expect(result).toBe('Bitcoin is great');
    });
  });

  describe('moderateContent', () => {
    it('should detect inappropriate text', () => {
      const result = moderateContent('This is a damn test');
      expect(result.isClean).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should allow clean content', () => {
      const result = moderateContent('Bitcoin will moon soon');
      expect(result.isClean).toBe(true);
    });

    it('should detect inappropriate filename', () => {
      const result = moderateContent('Nice post', 'damn-image.jpg');
      expect(result.isClean).toBe(false);
    });

    it('should detect suspicious filename', () => {
      const result = moderateContent('Nice post', 'nude-photo.jpg');
      expect(result.isClean).toBe(false);
    });
  });
});
