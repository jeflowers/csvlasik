import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, BookOpen, FileText, Globe } from 'lucide-react';

const CATEGORIES = ['All Posts', 'Innovation', 'Procedures', 'Technology', 'Patient Care', 'Mission'];

const POSTS = [
  {
    id: 1,
    category: 'Technology',
    title: 'Telemedicine in Eye Care: Connecting Pacific Islands to Advanced Treatment',
    excerpt: 'How remote diagnostics and satellite-linked consultations are bridging the gap between island communities and world-class refractive surgery.',
  },
  {
    id: 2,
    category: 'Procedures',
    title: 'Recovery Timeline: What to Expect After Your LASIK Surgery',
    excerpt: 'A detailed week-by-week guide to healing milestones, from initial clarity within hours to full stabilisation at six months.',
  },
  {
    id: 3,
    category: 'Procedures',
    title: 'ICL Surgery: The Revolutionary Solution for High Prescriptions',
    excerpt: 'For patients beyond the LASIK treatment range, implantable collamer lenses offer a reversible path to spectacle independence.',
  },
  {
    id: 4,
    category: 'Mission',
    title: 'Building Healthcare Infrastructure in Remote Pacific Islands',
    excerpt: 'Dr. Flowers\u2019 ongoing mission to establish permanent ophthalmic clinics across Guam, Saipan, and Micronesian communities.',
  },
];

const RESOURCES = [
  {
    icon: BookOpen,
    title: 'LASIK Guide',
    description: 'Everything you need to know before your consultation \u2014 candidacy, technology, and expected outcomes.',
    link: '/procedures/lasik',
  },
  {
    icon: FileText,
    title: 'Procedure Comparison',
    description: 'LASIK vs. PRK vs. ICL \u2014 a side-by-side overview of recovery, eligibility, and long-term results.',
    link: '/procedures',
  },
  {
    icon: Globe,
    title: 'Pacific Mission Updates',
    description: 'Follow Dr. Flowers\u2019 humanitarian eye-care missions across Pacific island communities.',
    link: '/pacific-story',
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

const Journal = () => {
  const [activeCategory, setActiveCategory] = useState('All Posts');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const filteredPosts = activeCategory === 'All Posts'
    ? POSTS
    : POSTS.filter(p => p.category === activeCategory);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setSubmitted(true);
  };

  const hero = useReveal();
  const featured = useReveal();
  const grid = useReveal();
  const resources = useReveal();
  const newsletter = useReveal();

  return (
    <div>
      {/* 1. Hero */}
      <section className="bg-white">
        <div ref={hero.ref} className={`max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36 ${hero.className}`}>
          <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
            Revolutionary Insights &amp; Education
          </span>
          <h1 className="font-serif font-semibold text-4xl sm:text-5xl lg:text-6xl text-onyx leading-[1.1] mb-6">
            Media &amp; Resources
          </h1>
          <p className="text-graphite/60 font-light text-lg max-w-2xl leading-relaxed">
            The latest insights from Dr. Flowers' practice &mdash; cutting-edge procedures, Pacific mission updates, and patient stories shaping the future of vision correction.
          </p>
        </div>
      </section>

      {/* 2. Featured Article */}
      <section className="bg-cream/50">
        <div ref={featured.ref} className={`max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36 ${featured.className}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 border border-onyx/[0.08]">
            {/* Left: dark editorial cover */}
            <div className="bg-onyx p-10 lg:p-14 flex flex-col justify-between min-h-[340px]">
              <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase">
                Innovation
              </span>
              <h2 className="font-serif font-semibold text-2xl lg:text-3xl text-white leading-snug mt-auto">
                The Revolutionary Journey: How Pacific Missions Shaped Modern LASIK
              </h2>
            </div>
            {/* Right: body panel */}
            <div className="bg-white p-10 lg:p-14 flex flex-col justify-center">
              <span className="inline-block text-[10px] font-sans font-medium tracking-[0.3em] text-champagne uppercase border border-champagne/30 px-3 py-1 w-fit mb-6">
                Mission
              </span>
              <p className="text-graphite/60 font-light leading-relaxed mb-8">
                From remote island clinics to state-of-the-art surgical suites, Dr. Flowers' two-decade humanitarian journey has
                directly informed the precision techniques used at Atelier today.
              </p>
              <Link
                to="/pacific-story"
                className="inline-flex items-center gap-2 text-sm text-onyx font-light group"
              >
                Read article
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Filter + 4. Post Grid */}
      <section className="bg-white">
        <div ref={grid.ref} className={`max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36 ${grid.className}`}>
          {/* Filter pills */}
          <div className="flex flex-wrap gap-3 mb-16">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-xs font-sans font-medium tracking-[0.1em] uppercase transition-colors duration-200 border ${
                  activeCategory === cat
                    ? 'bg-onyx text-white border-onyx'
                    : 'bg-transparent text-graphite/60 border-onyx/10 hover:border-onyx/30 hover:text-onyx'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-onyx/[0.06]">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                className="bg-white p-10 lg:p-12 group"
              >
                <span className="text-[10px] font-sans font-medium tracking-[0.3em] text-champagne uppercase block mb-5">
                  {post.category}
                </span>
                <h3 className="font-serif font-semibold text-xl lg:text-2xl text-onyx leading-snug mb-4">
                  {post.title}
                </h3>
                <p className="text-graphite/60 text-sm font-light leading-relaxed mb-8">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-sm text-onyx/70 group-hover:text-onyx font-light transition-colors cursor-pointer">
                  Read more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </article>
            ))}
            {filteredPosts.length === 0 && (
              <div className="col-span-2 py-16 text-center text-graphite/40 font-light">
                No posts in this category yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Educational Resources (inverse band) */}
      <section className="relative" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
        <div ref={resources.ref} className={`max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36 relative ${resources.className}`}>
          <div className="text-center mb-16">
            <span className="text-xs font-sans font-medium tracking-eyebrow uppercase block mb-4" style={{ color: '#C9A96E' }}>
              Guides &amp; Downloads
            </span>
            <h2 className="font-serif font-semibold text-3xl sm:text-4xl text-white">
              Educational Resources
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
            {RESOURCES.map(({ icon: Icon, title, description, link }) => (
              <Link
                key={title}
                to={link}
                className="bg-onyx p-10 group hover:bg-[#222] transition-colors duration-300"
              >
                <Icon className="w-6 h-6 text-champagne mb-6" strokeWidth={1.5} />
                <h3 className="font-serif font-semibold text-xl text-white mb-3">{title}</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed mb-6">{description}</p>
                <span className="inline-flex items-center gap-2 text-xs text-champagne font-medium tracking-[0.1em] uppercase group-hover:gap-3 transition-all">
                  Explore
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.2), transparent)' }} />
      </section>

      {/* 6. Newsletter Signup */}
      <section style={{ backgroundColor: '#FAFAF8' }}>
        <div ref={newsletter.ref} className={`max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36 ${newsletter.className}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="font-serif font-semibold text-3xl sm:text-4xl text-onyx mb-4">
                Stay Updated
              </h2>
              <p className="text-graphite/60 font-light leading-relaxed">
                Get the latest insights and Pacific mission updates delivered to your inbox &mdash; no spam, unsubscribe anytime.
              </p>
            </div>

            <div>
              {submitted ? (
                <div className="border border-champagne/30 p-8 text-center">
                  <p className="font-serif text-xl text-onyx mb-2">Thank you</p>
                  <p className="text-graphite/60 text-sm font-light">You'll receive our next update soon.</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                    className="absolute opacity-0 pointer-events-none h-0 w-0"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                      placeholder="Your email address"
                      className="w-full h-12 px-4 border border-onyx/10 bg-white text-onyx text-sm font-light placeholder:text-graphite/40 focus:outline-none focus:border-champagne/50 transition-colors"
                    />
                    {emailError && (
                      <p className="text-red-600 text-xs mt-2 font-light">{emailError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="h-12 px-8 bg-onyx text-white text-xs font-medium tracking-[0.15em] uppercase hover:bg-graphite transition-colors flex items-center gap-2 justify-center"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Journal;
