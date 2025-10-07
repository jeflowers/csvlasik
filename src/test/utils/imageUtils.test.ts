import { describe, it, expect } from 'vitest';
import {
  generateImageSources,
  getOptimizedImageProps,
  validateImageAccessibility,
  PROCEDURE_IMAGES,
  TEAM_IMAGES
} from '../../utils/imageUtils';

describe('Image Utils', () => {
  describe('generateImageSources', () => {
    it('generates responsive image sources', () => {
      const sources = generateImageSources('/assets/images', 'hero.jpg');
      
      expect(sources.original).toBe('/assets/images/hero.jpg');
      expect(sources.webp).toBe('/assets/images/hero.webp');
      expect(sources.responsive.small).toBe('/assets/images/hero-400w.jpg');
      expect(sources.responsive.large).toBe('/assets/images/hero-1200w.jpg');
    });
  });

  describe('getOptimizedImageProps', () => {
    it('returns optimized props for image config', () => {
      const config = {
        src: '/test.jpg',
        alt: 'Test image',
        webp: '/test.webp',
        priority: true
      };
      
      const props = getOptimizedImageProps(config);
      
      expect(props.src).toBe('/test.jpg');
      expect(props.alt).toBe('Test image');
      expect(props.webpSrc).toBe('/test.webp');
      expect(props.priority).toBe(true);
    });
  });

  describe('validateImageAccessibility', () => {
    it('validates good alt text', () => {
      const goodAlt = 'LASIK eye surgery procedure showing corneal flap creation';
      expect(validateImageAccessibility(goodAlt)).toBe(true);
    });

    it('rejects empty alt text', () => {
      expect(validateImageAccessibility('')).toBe(false);
      expect(validateImageAccessibility('   ')).toBe(false);
    });

    it('rejects short alt text', () => {
      expect(validateImageAccessibility('eye')).toBe(false);
    });

    it('rejects redundant alt text', () => {
      expect(validateImageAccessibility('Image of LASIK surgery')).toBe(false);
      expect(validateImageAccessibility('Picture showing procedure')).toBe(false);
    });
  });

  describe('predefined image configurations', () => {
    it('has complete LASIK procedure images', () => {
      expect(PROCEDURE_IMAGES.lasik.hero).toBeDefined();
      expect(PROCEDURE_IMAGES.lasik.hero.src).toContain('lasik');
      expect(PROCEDURE_IMAGES.lasik.hero.alt).toContain('LASIK');
      
      expect(PROCEDURE_IMAGES.lasik.process).toHaveLength(4);
      PROCEDURE_IMAGES.lasik.process.forEach((step, index) => {
        expect(step.src).toContain(`step-0${index + 1}`);
        expect(step.alt).toContain('LASIK Step');
      });
    });

    it('has team member images', () => {
      expect(TEAM_IMAGES.drFlowers.primary).toBeDefined();
      expect(TEAM_IMAGES.drFlowers.primary.alt).toContain('Dr. Charles Flowers');
      expect(TEAM_IMAGES.drFlowers.primary.priority).toBe(true);
    });

    it('all images have proper alt text', () => {
      const checkImageConfig = (config: any) => {
        if (config.alt) {
          expect(validateImageAccessibility(config.alt)).toBe(true);
        }
      };

      // Check procedure images
      Object.values(PROCEDURE_IMAGES).forEach(procedure => {
        if (procedure.hero) checkImageConfig(procedure.hero);
        if (procedure.process) {
          procedure.process.forEach(checkImageConfig);
        }
      });

      // Check team images
      Object.values(TEAM_IMAGES).forEach(member => {
        Object.values(member).forEach(checkImageConfig);
      });
    });
  });
});