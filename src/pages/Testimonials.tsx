import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ArrowRight, Eye, TrendingUp, Award, Play } from 'lucide-react';
import { usePublicTestimonials, usePublicStatistics } from '../hooks/useApi';
import ExternalReviews from '../components/ExternalReviews';

const Testimonials = () => {
  const { t } = useTranslation(['testimonials', 'common']);
  const { testimonials, loading: testimonialsLoading } = usePublicTestimonials({ limit: 10 });
  const { statistics, loading: statsLoading } = usePublicStatistics();

  // Default testimonials for fallback
  const defaultTestimonials = [
    {
      display_name: 'Sarah Martinez',
      age: 32,
      occupation: 'Elementary School Teacher',
      location: 'Los Angeles, CA',
      procedure_type: 'LASIK',
      vision_before: '20/400',
      vision_after: '20/15',
      testimonial_text: "I couldn't see the whiteboard from just 3 feet away. Now I have better than perfect vision! Dr. Flowers didn't just change my sight—he changed my entire career. I can finally connect with my students without struggling to see their faces.",
      rating: 5,
      image_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      is_featured: true
    },
    {
      display_name: 'Captain Michael Torres',
      age: 45,
      occupation: 'Commercial Airline Pilot',
      location: 'Long Beach, CA',
      procedure_type: 'PRK',
      vision_before: '20/200',
      vision_after: '20/20',
      testimonial_text: "My career required perfect vision without glasses. Dr. Flowers' PRK gave me exactly that. The procedure was comfortable, recovery was smooth, and now I'm cleared for flight with better vision than I've had in 20 years.",
      rating: 5,
      image_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      is_featured: true
    },
    {
      display_name: 'Dr. Amanda Rodriguez',
      age: 38,
      occupation: 'Surgeon',
      location: 'Los Angeles, CA',
      procedure_type: 'ICL',
      vision_before: '20/800 (-15.00)',
      vision_after: '20/20',
      testimonial_text: "With -15.00 prescription, LASIK wasn't an option. ICL was revolutionary for me. As a surgeon myself, I needed the absolute best vision quality. The results exceeded my expectations - crisp, clear vision without any compromise.",
      rating: 5,
      image_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      is_featured: true
    }
  ];

  // Use dynamic testimonials if available, otherwise use defaults
  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  // Default statistics for fallback
  const defaultStats = {
    total_procedures: { value: '30000', format: '{value}+' },
    success_rate: { value: '98', format: '{value}%' },
    patient_satisfaction: { value: '99.2', format: '{value}%' },
    average_rating: { value: '4.9', format: '{value}/5' }
  };

  const displayStats = Object.keys(statistics).length > 0 ? statistics : defaultStats;
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
              {t('hero.title')} <span className="chopard-text-accent">{t('hero.titleAccent')}</span>
            </h1>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto mb-6 leading-relaxed font-light">
              {t('hero.description')}
            </p>
            <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-base font-medium chopard-text-accent border-2 chopard-border mb-8">
              <Award className="h-5 w-5 mr-3 chopard-text-accent" />
              {t('hero.badge')}
            </div>
            <div>
              <Link
                to="/contact"
                className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Results Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('results.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('results.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Eye className="h-12 w-12 chopard-text-accent" />,
                number: displayStats.success_rate?.value ? displayStats.success_rate.format.replace('{value}', displayStats.success_rate.value) : '98%',
                label: t('results.stats.vision.label'),
                description: t('results.stats.vision.description')
              },
              {
                icon: <TrendingUp className="h-12 w-12 chopard-text-accent" />,
                number: displayStats.patient_satisfaction?.value ? displayStats.patient_satisfaction.format.replace('{value}', displayStats.patient_satisfaction.value) : '99.2%',
                label: t('results.stats.satisfaction.label'),
                description: t('results.stats.satisfaction.description')
              },
              {
                icon: <Star className="h-12 w-12 chopard-text-accent" />,
                number: displayStats.average_rating?.value ? displayStats.average_rating.format.replace('{value}', displayStats.average_rating.value) : '4.9/5',
                label: t('results.stats.rating.label'),
                description: t('results.stats.rating.description')
              },
              {
                icon: <Award className="h-12 w-12 chopard-text-accent" />,
                number: displayStats.total_procedures?.value ? displayStats.total_procedures.format.replace('{value}', displayStats.total_procedures.value) : '30000+',
                label: t('results.stats.stories.label'),
                description: t('results.stats.stories.description')
              }
            ].map((stat, index) => (
              <div key={index} className="text-center chopard-card p-8 rounded-xl">
                <div className="mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-4xl font-serif chopard-text-primary mb-2">{stat.number}</div>
                <div className="text-xl font-light chopard-text-primary mb-2">{stat.label}</div>
                <p className="chopard-text-secondary text-sm font-light">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Success Stories */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('featured.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('featured.description')}
            </p>
          </div>

          <div className="space-y-12">
            {displayTestimonials.slice(0, 3).map((story, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="chopard-card p-8 rounded-2xl">
                    <div className="flex items-center mb-6">
                      <img
                        src={story.image_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'}
                        alt={story.display_name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="text-2xl font-serif chopard-text-primary">{story.display_name}</h3>
                        <p className="chopard-text-secondary font-light">{story.age && story.occupation ? `${story.age}, ${story.occupation}` : story.occupation}</p>
                        <p className="text-sm chopard-text-secondary font-light">{story.location}</p>
                      </div>
                      {story.is_featured && (
                        <div className="ml-auto chopard-glass p-2 rounded-full border chopard-border">
                          <Play className="h-6 w-6 chopard-text-accent" />
                        </div>
                      )}
                    </div>

                    {/* Vision Improvement */}
                    <div className="chopard-glass p-6 rounded-xl mb-6 border chopard-border">
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <p className="text-sm chopard-text-secondary mb-1 font-light">Before</p>
                          <p className="text-2xl font-bold text-red-600">{story.vision_before}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="chopard-text-secondary text-lg font-bold mx-4">→</div>
                          <div className="chopard-accent text-white px-3 py-1 rounded-full text-sm font-light">
                            {story.procedure_type}
                          </div>
                          <div className="chopard-text-secondary text-lg font-bold mx-4">→</div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm chopard-text-secondary mb-1 font-light">After</p>
                          <p className="text-2xl font-bold chopard-text-accent">{story.vision_after}</p>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <blockquote className="text-lg italic chopard-text-secondary mb-6 leading-relaxed font-light">
                      "{story.testimonial_text}"
                    </blockquote>

                    {/* Rating */}
                    <div className="flex items-center mb-6">
                      <div className="flex space-x-1">
                        {[...Array(story.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 chopard-text-secondary font-light">{story.rating || 5}.0/5</span>
                    </div>

                    {/* Procedure Badge */}
                    {story.is_pacific_patient && (
                      <div className="mt-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {t('badges.pacific')}
                        </span>
                      </div>
                    )}
                    {story.is_military && (
                      <div className="mt-4">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {t('badges.military')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <div className="relative">
                    <img
                      src={story.image_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'}
                      alt={story.display_name}
                      className="rounded-2xl shadow-xl w-full h-96 object-cover"
                    />
                    {story.is_featured && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-2xl opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="bg-white rounded-full p-4">
                          <Play className="h-8 w-8 chopard-text-accent" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 chopard-accent text-white px-3 py-1 rounded-full text-sm font-light">
                      {story.procedure_type} {t('badges.success')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* External Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ExternalReviews />
        </div>
      </section>

      {/* Pacific Success Stories */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif mb-4">
              {t('pacific.title')}
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
              {t('pacific.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Maria Taumalolo',
                location: 'Tonga Islands',
                story: 'First LASIK patient in Pacific history',
                before: '20/400',
                after: '20/20',
                impact: 'Now teaches children to read',
                image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
              },
              {
                name: 'Captain James Fa\'anana',
                location: 'Samoa',
                story: 'Boat captain who couldn\'t navigate safely',
                before: '20/300',
                after: '20/15',
                impact: 'Safely guides inter-island transport',
                image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
              },
              {
                name: 'Dr. Helen Kiri',
                location: 'Cook Islands',
                story: 'Became first local LASIK-trained surgeon',
                before: '20/200',
                after: '20/20',
                impact: 'Trained 50+ island medical staff',
                image: 'https://images.pexels.com/photos/1462636/pexels-photo-1462636.jpeg'
              }
            ].map((story, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-xl font-serif text-white text-center mb-2">{story.name}</h3>
                <p className="text-white/70 text-center text-sm mb-4 font-light">{story.location}</p>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-4 border border-white/20">
                  <div className="flex justify-between text-center">
                    <div>
                      <p className="text-xs text-white/70 font-light">Before</p>
                      <p className="font-bold text-red-400">{story.before}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 font-light">After</p>
                      <p className="font-bold text-white">{story.after}</p>
                    </div>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-3 font-light">{story.story}</p>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                  <p className="text-white text-sm font-light">Revolutionary Impact:</p>
                  <p className="text-white/80 text-sm font-light">{story.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('gallery.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('gallery.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { procedure: 'LASIK', before: '20/400', after: '20/15', satisfaction: '100%' },
              { procedure: 'PRK', before: '20/200', after: '20/20', satisfaction: '98%' },
              { procedure: 'ICL', before: '20/800', after: '20/20', satisfaction: '100%' },
              { procedure: 'LASIK', before: '20/250', after: '20/20', satisfaction: '97%' },
              { procedure: 'PRK', before: '20/150', after: '20/15', satisfaction: '100%' }
            ].map((result, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="chopard-accent text-white px-4 py-2 rounded-full text-sm font-light mb-6 inline-block">
                  {result.procedure}
                </div>
                <div className="space-y-4">
                  <div className="chopard-glass p-4 rounded-lg border chopard-border">
                    <p className="text-sm chopard-text-secondary mb-1 font-light">{t('gallery.before')}</p>
                    <p className="text-3xl font-bold text-red-600">{result.before}</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="h-8 w-8 chopard-text-accent" />
                  </div>
                  <div className="chopard-glass p-4 rounded-lg border chopard-border">
                    <p className="text-sm chopard-text-secondary mb-1 font-light">{t('gallery.after')}</p>
                    <p className="text-3xl font-bold chopard-text-accent">{result.after}</p>
                  </div>
                  <div className="chopard-glass p-3 rounded-lg border chopard-border">
                    <p className="text-sm chopard-text-secondary font-light">{t('gallery.satisfaction')}</p>
                    <p className="text-xl font-bold chopard-text-accent">{result.satisfaction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Reviews */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('reviews.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('reviews.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Jennifer K.',
                rating: 5,
                procedure: 'LASIK',
                text: 'Absolutely life-changing! Dr. Flowers is a true revolutionary in his field. The entire process was smooth, professional, and exceeded all my expectations.',
                date: '2 weeks ago'
              },
              {
                name: 'Robert M.',
                rating: 5,
                procedure: 'PRK',
                text: 'After 25 years of glasses, I finally have perfect vision. Dr. Flowers\' expertise and care were evident from consultation to recovery.',
                date: '1 month ago'
              },
              {
                name: 'David L.',
                rating: 5,
                procedure: 'ICL',
                text: 'With -18 prescription, I thought perfect vision was impossible. Dr. Flowers proved me wrong. The ICL procedure was amazing.',
                date: '1 week ago'
              },
              {
                name: 'Maria R.',
                rating: 5,
                procedure: 'LASIK',
                text: 'From consultation to follow-up, everything was perfect. Dr. Flowers truly cares about his patients and delivers revolutionary results.',
                date: '2 months ago'
              },
              {
                name: 'Thomas W.',
                rating: 5,
                procedure: 'PRK',
                text: 'Professional athlete here - needed the strongest cornea possible. PRK was perfect choice and Dr. Flowers delivered flawlessly.',
                date: '6 weeks ago'
              }
            ].map((review, index) => (
              <div key={index} className="chopard-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-light chopard-text-primary">{review.name}</h3>
                    <p className="text-sm chopard-text-secondary font-light">{review.procedure} Patient</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs chopard-text-secondary font-light">{review.date}</p>
                  </div>
                </div>
                <p className="chopard-text-secondary italic font-light">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              {t('cta.schedule')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/procedures"
              className="inline-flex items-center border border-white text-white px-8 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('cta.procedures')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;