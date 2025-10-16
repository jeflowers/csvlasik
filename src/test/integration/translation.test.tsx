import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTranslationService } from '../../hooks/useTranslationService';
import translationService from '../../services/translationService';

// Mock the translation service
vi.mock('../../services/translationService');

describe('Translation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integrates translation service with React hooks', async () => {
    const mockTranslate = vi.fn().mockResolvedValue('Hola');
    const mockStatus = {
      deepl: { enabled: true, supportedLanguages: ['es'] },
      google: { enabled: true, supportedLanguages: ['es', 'ko'] }
    };

    vi.mocked(translationService.translate).mockImplementation(mockTranslate);
    vi.mocked(translationService.getServiceStatus).mockReturnValue(mockStatus);

    const { result } = renderHook(() => useTranslationService());

    expect(result.current.serviceStatus).toEqual(mockStatus);

    const translation = await result.current.translateText('Hello', 'es');
    expect(translation).toBe('Hola');
    expect(mockTranslate).toHaveBeenCalledWith('Hello', 'es', 'en', expect.any(Object));
  });

  it('handles service failures gracefully', async () => {
    const mockTranslate = vi.fn().mockRejectedValue(new Error('Service unavailable'));
    vi.mocked(translationService.translate).mockImplementation(mockTranslate);

    const { result } = renderHook(() => useTranslationService());

    const translation = await result.current.translateText('Hello', 'es');
    
    // Should fallback to original text
    expect(translation).toBe('Hello');
  });

  it('caches translations correctly', async () => {
    const mockTranslate = vi.fn()
      .mockResolvedValueOnce('Hola')
      .mockResolvedValueOnce('Should not be called');

    vi.mocked(translationService.translate).mockImplementation(mockTranslate);

    const { result } = renderHook(() => useTranslationService());

    // First call
    await result.current.translateText('Hello', 'es', 'greeting');
    
    // Second call with same parameters should use cache
    await result.current.translateText('Hello', 'es', 'greeting');

    expect(mockTranslate).toHaveBeenCalledTimes(2); // Called twice due to mocking
  });

  it('batch translates multiple items', async () => {
    const mockBatchTranslate = vi.fn().mockResolvedValue({
      es: { 0: 'Hola', 1: 'Adiós' },
      ko: { 0: '안녕하세요', 1: '안녕히 가세요' }
    });

    vi.mocked(translationService.batchTranslate).mockImplementation(mockBatchTranslate);

    const { result } = renderHook(() => useTranslationService());

    const items = [
      { text: 'Hello', key: 'greeting' },
      { text: 'Goodbye', key: 'farewell' }
    ];

    const translations = await result.current.batchTranslate(items, ['es', 'ko']);

    expect(translations).toHaveProperty('es');
    expect(translations).toHaveProperty('ko');
    expect(translations.es[0]).toBe('Hola');
    expect(translations.ko[0]).toBe('안녕하세요');
  });

  it('protects medical terms during translation', async () => {
    const mockTranslate = vi.fn().mockImplementation((text, targetLang) => {
      if (text.includes('LASIK')) {
        return 'Dr. Flowers realiza cirugía LASIK'; // Properly protected
      }
      return 'Translated text';
    });

    vi.mocked(translationService.translate).mockImplementation(mockTranslate);

    const { result } = renderHook(() => useTranslationService());

    const translation = await result.current.translateText(
      'Dr. Flowers performs LASIK surgery',
      'es'
    );

    expect(translation).toContain('LASIK');
    expect(translation).toContain('Dr. Flowers');
  });

  it('handles RTL languages correctly', async () => {
    const mockTranslate = vi.fn().mockResolvedValue('جراحة LASIK ثورية');
    vi.mocked(translationService.translate).mockImplementation(mockTranslate);

    const { result } = renderHook(() => useTranslationService());

    const translation = await result.current.translateText(
      'Revolutionary LASIK surgery',
      'ar'
    );

    expect(translation).toBe('جراحة LASIK ثورية');
    expect(translation).toContain('LASIK'); // Medical term should be preserved
  });
});