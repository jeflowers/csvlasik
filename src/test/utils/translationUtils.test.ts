import { describe, it, expect } from 'vitest';
import {
  getLanguageDirection,
  getLanguageInfo,
  formatPhoneNumber,
  getCurrencyFormat,
  getDateFormat,
  validateTranslation
} from '../../utils/translationUtils';

describe('Translation Utils', () => {
  describe('getLanguageDirection', () => {
    it('returns ltr for left-to-right languages', () => {
      expect(getLanguageDirection('en')).toBe('ltr');
      expect(getLanguageDirection('es')).toBe('ltr');
      expect(getLanguageDirection('ko')).toBe('ltr');
    });

    it('returns rtl for right-to-left languages', () => {
      expect(getLanguageDirection('ar')).toBe('rtl');
      expect(getLanguageDirection('he')).toBe('rtl');
    });

    it('defaults to ltr for unknown languages', () => {
      expect(getLanguageDirection('unknown')).toBe('ltr');
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats US phone numbers correctly', () => {
      expect(formatPhoneNumber('8449548686', 'en')).toBe('(844) 954-8686');
    });

    it('formats Mexican phone numbers correctly', () => {
      expect(formatPhoneNumber('5512345678', 'es-MX')).toBe('+52 55 1234 5678');
    });

    it('formats Korean phone numbers correctly', () => {
      expect(formatPhoneNumber('01012345678', 'ko')).toBe('+82 010-1234-5678');
    });

    it('returns original for invalid formats', () => {
      expect(formatPhoneNumber('123', 'en')).toBe('123');
    });
  });

  describe('getCurrencyFormat', () => {
    it('formats USD correctly', () => {
      const result = getCurrencyFormat(5000, 'en');
      expect(result).toContain('$5,000');
    });

    it('formats Mexican Peso correctly', () => {
      const result = getCurrencyFormat(5000, 'es-MX');
      expect(result).toContain('5,000');
    });

    it('formats Korean Won correctly', () => {
      const result = getCurrencyFormat(5000, 'ko');
      expect(result).toContain('₩5,000');
    });
  });

  describe('validateTranslation', () => {
    it('validates successful translations', () => {
      const result = validateTranslation(
        'Schedule your LASIK consultation',
        'Programe su consulta LASIK'
      );
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('detects missing medical terms', () => {
      const result = validateTranslation(
        'Dr. Flowers performs LASIK surgery',
        'El doctor realiza cirugía láser'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Medical term "Dr. Flowers" missing in translation');
      expect(result.warnings).toContain('Medical term "LASIK" missing in translation');
    });

    it('detects unchanged translations', () => {
      const longText = 'This is a long text that should be translated';
      const result = validateTranslation(longText, longText);
      
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Translation appears unchanged');
    });

    it('detects HTML tag mismatches', () => {
      const result = validateTranslation(
        '<p>Hello <strong>world</strong></p>',
        '<p>Hola mundo</p>'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('HTML tag count mismatch');
    });
  });
});