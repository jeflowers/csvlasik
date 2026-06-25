import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Shield, Clock } from 'lucide-react';
import Logo from '../components/Logo';

const heroImages = [
  '/assets/images/eyes/eric-ward-ES60LMf18KU-unsplash.jpg',
  '/assets/images/eyes/lana-graves-h0ZHYdy1qTI-unsplash.jpg',
  '/assets/images/eyes/luca-iaconelli-GmoHIZ61eMo-unsplash.jpg',
  '/assets/images/eyes/polina-kuzovkova-6VXBBFt_k9Q-unsplash.jpg',
  '/assets/images/eyes/simone-stallo-xpZ5AVjw67U-unsplash.jpg',
];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextImage, 4000);
    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <div className="pt-[72px]">
      {/* Hero */}
      <section className="bg-onyx relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background carousel */}
        {heroImages.map((src, index) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: index === currentImage ? 1 : 0 }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-onyx/70" />
          </div>
        ))}

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32 lg:py-44 relative z-10 w-full">
          <div className="flex flex-col items-center text-center">
            <div className="mb-16">
              <Logo variant="stacked" mode="dark" height={60} />
            </div>
            <h1 className="font-serif font-semibold text-4xl sm:text-5xl lg:text-7xl text-white leading-[1.1] max-w-4xl">
              Vision, perfected<br />
              <span className="text-champagne">like fine craft.</span>
            </h1>
            <p className="mt-8 text-white/50 font-light text-lg max-w-xl leading-relaxed">
              Bespoke refractive surgery by Dr. Charles Flowers, MD &mdash; the first LASIK pioneer in the Pacific region.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/portal"
                className="bg-bullion text-onyx px-8 py-4 text-xs font-medium tracking-widest hover:bg-champagne transition-colors duration-200"
              >
                BOOK CONSULTATION
              </Link>
              <Link
                to="/procedures"
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-light transition-colors group"
              >
                <span>Explore procedures</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Carousel indicators */}
            <div className="mt-16 flex items-center gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentImage
                      ? 'w-8 h-2 bg-bullion'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bullion/30 to-transparent z-10" />
      </section>

      {/* Procedures */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36">
          <div className="text-center mb-20">
            <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
              Procedures
            </span>
            <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx">
              Three paths to clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-onyx/10">
            {[
              {
                title: 'LASIK',
                description: 'Bladeless femtosecond flap creation with excimer reshaping. 15-minute procedure, next-day vision.',
                detail: 'Most popular',
                link: '/procedures/lasik',
              },
              {
                title: 'PRK',
                description: 'Surface ablation without a corneal flap. Ideal for thin corneas or active lifestyles.',
                detail: 'No-flap alternative',
                link: '/procedures/prk',
              },
              {
                title: 'ICL',
                description: 'Implantable Collamer Lens for extreme prescriptions. Reversible, UV-protective, permanent.',
                detail: 'High prescriptions',
                link: '/procedures/icl',
              },
            ].map((proc) => (
              <Link
                key={proc.title}
                to={proc.link}
                className="bg-white p-10 lg:p-14 group hover:bg-cream/50 transition-colors duration-300"
              >
                <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-6">
                  {proc.detail}
                </span>
                <h3 className="font-serif font-semibold text-2xl lg:text-3xl text-onyx mb-4">
                  {proc.title}
                </h3>
                <p className="text-graphite/60 text-sm font-light leading-relaxed mb-8">
                  {proc.description}
                </p>
                <span className="flex items-center gap-2 text-sm text-onyx/70 group-hover:text-onyx font-light transition-colors">
                  Learn more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pioneer Story */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
                The Pioneer
              </span>
              <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx leading-[1.15] mb-8">
                Dr. Charles Flowers, MD
              </h2>
              <p className="text-graphite/60 font-light leading-relaxed mb-6">
                Dr. Flowers performed the first LASIK procedures across Guam, Saipan, Palau, and the Marshall Islands &mdash; bringing sight-restoring surgery to remote Pacific communities that had never had access to refractive care.
              </p>
              <p className="text-graphite/60 font-light leading-relaxed mb-10">
                Today, that same pioneering spirit drives every procedure at Atelier. Over 30,000 successful surgeries. A 99.2% patient satisfaction rate. The precision of a craftsman applied to the gift of vision.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm text-onyx font-light border-b border-onyx/20 pb-1 hover:border-onyx transition-colors group"
              >
                Read the full story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-onyx/5 overflow-hidden">
                <img
                  src="/assets/images/team/drflowers/dr-flowers-headshot.jpg"
                  alt="Dr. Charles Flowers, MD"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-chopard">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-semibold text-3xl text-onyx">30,000+</span>
                  <span className="text-xs text-champagne font-medium tracking-eyebrow uppercase">procedures</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Atelier */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36">
          <div className="text-center mb-20">
            <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
              Why Atelier
            </span>
            <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx">
              Crafted with precision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                icon: Eye,
                title: 'Custom wavefront mapping',
                description: 'Every eye is unique. We create a topographic map of your cornea to guide laser treatment with sub-micron accuracy.',
              },
              {
                icon: Shield,
                title: 'Pacific-tested expertise',
                description: 'Dr. Flowers honed his craft in challenging conditions across remote islands. Los Angeles patients benefit from that depth of experience.',
              },
              {
                icon: Clock,
                title: 'Same-week consultations',
                description: 'No waitlists. Comprehensive evaluation, honest candidacy assessment, and a clear path forward within days.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 border border-champagne/30 mb-6">
                  <Icon className="w-5 h-5 text-champagne" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif font-semibold text-xl text-onyx mb-3">{title}</h3>
                <p className="text-graphite/60 text-sm font-light leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-onyx relative">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-28 lg:py-36 text-center relative">
          <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-12">
            Patient Stories
          </span>
          <blockquote className="font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl text-white leading-snug mb-8">
            &ldquo;I woke up the next morning and could read the clock across the room. After twenty years of glasses, it felt like a miracle.&rdquo;
          </blockquote>
          <cite className="not-italic text-sm text-white/50 font-light">
            &mdash; Sarah M., LASIK patient, 2024
          </cite>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bullion/30 to-transparent" />
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-28 lg:py-36 text-center">
          <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
            Begin
          </span>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx mb-6">
            Your consultation awaits
          </h2>
          <p className="text-graphite/60 font-light leading-relaxed max-w-lg mx-auto mb-10">
            A 90-minute evaluation to determine your candidacy, map your cornea, and design a treatment plan tailored to your eyes.
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
              className="text-sm text-graphite/60 hover:text-onyx font-light transition-colors"
            >
              or call (844) 954-8686
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
