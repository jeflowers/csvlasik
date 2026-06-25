/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-onyx',
    'bg-cream',
    'bg-bullion',
    'text-onyx',
    'text-white',
    'text-champagne',
    'text-bullion',
    'text-graphite',
    'border-white/10',
    'border-onyx/20',
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Cormorant Garamond', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        onyx: '#1A1A1A',
        graphite: '#2C2C2C',
        bullion: '#D4AF37',
        champagne: '#C9A96E',
        cream: '#FBF7EF',
        chopard: {
          primary: '#2c2c2c',
          secondary: '#666666',
          accent: '#c9a96e',
          'accent-light': '#d4af37',
          'accent-dark': '#b8956a',
          hero: '#fafafa',
          glass: 'rgba(255, 255, 255, 0.95)',
        }
      },
      letterSpacing: {
        'eyebrow': '0.4em',
      },
      backgroundImage: {
        'chopard-gradient': 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
        'chopard-accent': 'linear-gradient(135deg, #c9a96e 0%, #b8956a 100%)',
        'chopard-hero': 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
      },
      boxShadow: {
        'chopard': '0 20px 40px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'chopard-hover': '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(201, 169, 110, 0.1)',
      }
    },
  },
  plugins: [],
};
