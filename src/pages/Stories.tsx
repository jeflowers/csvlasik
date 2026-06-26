import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const STATS = [
  { value: '4.9', label: 'Patient Rating' },
  { value: '2,400+', label: 'Procedures' },
  { value: '98%', label: 'Satisfaction' },
  { value: '96%', label: 'Achieve 20/20' },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'I walked in nervous and walked out amazed. Within hours I could see the alarm clock across the room for the first time in twenty years.',
    name: 'Maria L.',
    procedure: 'LASIK',
    rating: 5,
  },
  {
    id: 2,
    quote: 'Dr. Flowers took his time explaining every step. The technology they use is clearly next-level — I felt completely safe.',
    name: 'James K.',
    procedure: 'LASIK',
    rating: 5,
  },
  {
    id: 3,
    quote: 'As a competitive swimmer, glasses and contacts were a constant hassle. PRK gave me back my freedom in the water.',
    name: 'Sarah T.',
    procedure: 'PRK',
    rating: 5,
  },
  {
    id: 4,
    quote: 'My prescription was too high for LASIK. The ICL procedure was painless and my vision is now better than I ever imagined possible.',
    name: 'David R.',
    procedure: 'ICL',
    rating: 5,
  },
  {
    id: 5,
    quote: 'The entire experience — from consultation to follow-up — felt like a luxury service, not a medical visit. Truly world-class.',
    name: 'Christine M.',
    procedure: 'LASIK',
    rating: 5,
  },
  {
    id: 6,
    quote: 'I flew in from Guam specifically for Dr. Flowers. His reputation in the Pacific community is well-earned — I see perfectly now.',
    name: 'Antonio P.',
    procedure: 'ICL',
    rating: 5,
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, className: `transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}` };
}

const Stories = () => {
  const hero = useReveal();
  const stats = useReveal();
  const featured = useReveal();
  const grid = useReveal();
  const cta = useReveal();

  return (
    <div>
      {/* Hero */}
      <section className="bg-white">
        <div ref={hero.ref} className={`max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36 ${hero.className}`}>
          <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
            Patient Experiences
          </span>
          <h1 className="font-serif font-semibold text-4xl sm:text-5xl lg:text-6xl text-onyx leading-[1.1] mb-6">
            Stories
          </h1>
          <p className="text-graphite/60 font-light text-lg max-w-2xl leading-relaxed">
            Real outcomes from real patients. Hear how vision correction at Atelier has changed lives across Southern California and the Pacific Islands.
          </p>
        </div>
      </section>

      {/* Aggregate Stats */}
      <section className="border-y border-onyx/[0.06]">
        <div ref={stats.ref} className={`max-w-7xl mx-auto px-6 lg:px-8 py-12 ${stats.className}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <span className="font-serif font-semibold text-3xl lg:text-4xl text-onyx block">{stat.value}</span>
                <span className="text-xs font-sans font-medium tracking-[0.2em] text-champagne uppercase mt-2 block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pull-Quote (inverse) */}
      <section className="relative" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
        <div ref={featured.ref} className={`max-w-4xl mx-auto px-6 lg:px-8 py-28 lg:py-36 text-center relative ${featured.className}`}>
          <div className="flex items-center justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-champagne fill-champagne" />
            ))}
          </div>
          <blockquote className="font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl text-white leading-snug mb-8">
            &ldquo;The moment they removed the shield the next morning, I cried. I could see every leaf on the tree outside my window. After 30 years of thick glasses, it felt like a miracle.&rdquo;
          </blockquote>
          <cite className="not-italic text-sm font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
            &mdash; Rebecca S., LASIK patient
          </cite>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.2), transparent)' }} />
      </section>

      {/* Testimonial Grid */}
      <section className="bg-white">
        <div ref={grid.ref} className={`max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36 ${grid.className}`}>
          <div className="text-center mb-16">
            <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
              In Their Words
            </span>
            <h2 className="font-serif font-semibold text-3xl sm:text-4xl text-onyx">
              Patient Testimonials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-onyx/[0.06]">
            {TESTIMONIALS.map(t => (
              <div key={t.id} className="bg-white p-10 flex flex-col">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-champagne fill-champagne" />
                  ))}
                </div>
                <p className="text-graphite/70 text-sm font-light leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-onyx/[0.06] pt-5">
                  <span className="text-sm font-medium text-onyx block">{t.name}</span>
                  <span className="text-[10px] font-sans font-medium tracking-[0.3em] text-champagne uppercase">{t.procedure}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream">
        <div ref={cta.ref} className={`max-w-4xl mx-auto px-6 lg:px-8 py-28 lg:py-36 text-center ${cta.className}`}>
          <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
            Your Story Starts Here
          </span>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx mb-6">
            Ready for Clear Vision?
          </h2>
          <p className="text-graphite/60 font-light leading-relaxed max-w-lg mx-auto mb-10">
            Join thousands of patients who have transformed their lives through precision vision correction at Atelier.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/portal"
              className="bg-bullion text-onyx px-8 py-4 text-xs font-medium tracking-widest hover:bg-champagne transition-colors duration-200"
            >
              SCHEDULE CONSULTATION
            </Link>
            <a
              href="tel:+18449548686"
              className="inline-flex items-center gap-2 text-sm text-graphite/60 hover:text-onyx font-light transition-colors group"
            >
              Or call (844) 954-8686
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stories;
