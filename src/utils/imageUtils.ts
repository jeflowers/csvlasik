// Image utility functions for ClearSight website

export interface ImageConfig {
  src: string;
  alt: string;
  webp?: string;
  avif?: string;
  sizes?: string;
  priority?: boolean;
  category?: 'procedure' | 'diagram' | 'team' | 'testimonial' | 'brand';
}

// Base paths for different image categories
export const IMAGE_PATHS = {
  procedures: '/assets/images/procedures',
  diagrams: '/assets/images/diagrams',
  team: '/assets/images/team',
  testimonials: '/assets/images/testimonials',
  brand: '/assets/images/brand',
  documents: '/assets/documents'
} as const;

// Generate responsive image sources
export const generateImageSources = (basePath: string, filename: string) => {
  const name = filename.replace(/\.[^/.]+$/, '');
  const ext = filename.split('.').pop();
  
  return {
    original: `${basePath}/${filename}`,
    webp: `${basePath}/${name}.webp`,
    avif: `${basePath}/${name}.avif`,
    responsive: {
      small: `${basePath}/${name}-400w.${ext}`,
      medium: `${basePath}/${name}-800w.${ext}`,
      large: `${basePath}/${name}-1200w.${ext}`,
      xlarge: `${basePath}/${name}-1920w.${ext}`
    }
  };
};

// Predefined image configurations for medical procedures
export const PROCEDURE_IMAGES = {
  lasik: {
    hero: {
      src: `${IMAGE_PATHS.procedures}/lasik/hero-lasik-surgery-1920x1080.jpg`,
      alt: 'LASIK eye surgery procedure - Advanced laser vision correction',
      webp: `${IMAGE_PATHS.procedures}/lasik/hero-lasik-surgery-1920x1080.webp`,
      priority: true,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
    },
    process: [
      {
        src: '/assets/images/procedures/lasik/process/step-01-examination.png',
        alt: 'LASIK Step 1: Comprehensive eye examination and corneal mapping',
        webp: '/assets/images/procedures/lasik/process/step-01-examination.webp'
      },
      {
        src: '/assets/images/procedures/lasik/process/step-02-flap-creation.png',
        alt: 'LASIK Step 2: Precise corneal flap creation using femtosecond laser',
        webp: '/assets/images/procedures/lasik/process/step-02-flap-creation.webp'
      },
      {
        src: '/assets/images/procedures/lasik/process/step-03-laser-reshaping.png',
        alt: 'LASIK Step 3: Excimer laser corneal reshaping for vision correction',
        webp: '/assets/images/procedures/lasik/process/step-03-laser-reshaping.webp'
      },
      {
        src: '/assets/images/procedures/lasik/process/step-04-recovery.png',
        alt: 'LASIK Step 4: Flap repositioning and immediate recovery process',
        webp: '/assets/images/procedures/lasik/process/step-04-recovery.webp'
      }
    ]
  },
  prk: {
    hero: {
      src: `${IMAGE_PATHS.procedures}/prk/hero-prk-surgery-1920x1080.jpg`,
      alt: 'PRK photorefractive keratectomy - Surface laser vision correction',
      webp: `${IMAGE_PATHS.procedures}/prk/hero-prk-surgery-1920x1080.webp`,
      priority: true
    }
  },
  icl: {
    hero: {
      src: `${IMAGE_PATHS.procedures}/icl/hero-icl-surgery-1920x1080.jpg`,
      alt: 'ICL implantable contact lens surgery - Reversible vision correction',
      webp: `${IMAGE_PATHS.procedures}/icl/hero-icl-surgery-1920x1080.webp`,
      priority: true
    }
  }
};

// Team member images
export const TEAM_IMAGES = {
  drFlowers: {
    primary: {
      src: `${IMAGE_PATHS.team}/dr-flowers-headshot.jpg`,
      alt: 'Dr. Charles Flowers - Revolutionary LASIK surgeon and Pacific healthcare pioneer',
      priority: true
    },
    secondary: {
      src: `${IMAGE_PATHS.team}/dr-flowers-headshot.jpg`,
      alt: 'Dr. Charles Flowers performing advanced laser eye surgery',
    }
  }
};

// Educational diagrams
export const DIAGRAM_IMAGES = {
  anatomy: {
    eyeCrossSection: {
      src: `${IMAGE_PATHS.diagrams}/anatomy/eye-cross-section-detailed.jpg`,
      alt: 'Detailed anatomical diagram of human eye structure showing cornea, lens, retina',
      webp: `${IMAGE_PATHS.diagrams}/anatomy/eye-cross-section-detailed.webp`
    },
    corneaLayers: {
      src: `${IMAGE_PATHS.diagrams}/anatomy/cornea-layers-diagram.jpg`,
      alt: 'Corneal anatomy showing epithelium, stroma, and endothelium layers',
      webp: `${IMAGE_PATHS.diagrams}/anatomy/cornea-layers-diagram.webp`
    }
  },
  educational: {
    technologyOverview: {
      src: `${IMAGE_PATHS.diagrams}/educational/advanced-technology-overview.png`,
      alt: 'Advanced LASIK technology and equipment overview',
      webp: `${IMAGE_PATHS.diagrams}/educational/advanced-technology-overview.webp`
    },
    icareDevice: {
      src: `${IMAGE_PATHS.diagrams}/educational/icare-drs-plus-device.png`,
      alt: 'iCare DRS plus retinal screening device for diabetic retinopathy detection',
      webp: `${IMAGE_PATHS.diagrams}/educational/icare-drs-plus-device.webp`
    }
  }
};

// Brand assets
export const BRAND_IMAGES = {
  logos: {
    primary: {
      src: `${IMAGE_PATHS.brand}/logos/clearsight-logo-primary.svg`,
      alt: 'ClearSight Vision Institute - Revolutionary LASIK Surgery',
      priority: true
    },
    white: {
      src: `${IMAGE_PATHS.brand}/logos/clearsight-logo-white.svg`,
      alt: 'ClearSight Vision Institute Logo - White Version'
    }
  },
  icons: {
    eye: {
      src: `${IMAGE_PATHS.brand}/icons/eye-icon.svg`,
      alt: 'Eye icon representing vision care services'
    }
  }
};

// Image optimization utilities
export const getOptimizedImageProps = (config: ImageConfig) => {
  return {
    src: config.src,
    alt: config.alt,
    ...(config.webp && { webpSrc: config.webp }),
    ...(config.avif && { avifSrc: config.avif }),
    sizes: config.sizes || '100vw',
    priority: config.priority || false
  };
};

// Generate structured data for medical images
export const generateImageStructuredData = (image: ImageConfig, context: string) => {
  return {
    "@type": "ImageObject",
    "url": image.src,
    "description": image.alt,
    "contentUrl": image.src,
    "width": "1920",
    "height": "1080",
    "encodingFormat": "image/jpeg",
    "about": {
      "@type": "MedicalProcedure",
      "name": context,
      "description": image.alt
    }
  };
};

// Validate image accessibility
export const validateImageAccessibility = (alt: string): boolean => {
  if (!alt || alt.trim().length === 0) return false;
  if (alt.length < 10) return false;
  if (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture')) return false;
  return true;
};

// Generate image sitemap data
export const generateImageSitemapData = () => {
  const images: Array<{url: string, caption: string, title: string}> = [];
  
  // Add procedure images
  Object.values(PROCEDURE_IMAGES).forEach(procedure => {
    if (procedure.hero) {
      images.push({
        url: procedure.hero.src,
        caption: procedure.hero.alt,
        title: procedure.hero.alt
      });
    }
    if (procedure.process) {
      procedure.process.forEach(step => {
        images.push({
          url: step.src,
          caption: step.alt,
          title: step.alt
        });
      });
    }
  });
  
  // Add team images
  Object.values(TEAM_IMAGES).forEach(member => {
    Object.values(member).forEach(image => {
      images.push({
        url: image.src,
        caption: image.alt,
        title: image.alt
      });
    });
  });
  
  return images;
};