import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Users, Award, Calendar, ArrowRight, Globe, Heart, Plane } from 'lucide-react';

const PacificStory = () => {
  const { t } = useTranslation(['pacific', 'common']);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('hero.title')} <span className="text-teal-600">Atelier</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6 leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="inline-flex items-center bg-teal-100 text-teal-800 px-6 py-3 rounded-full text-base font-semibold mb-8">
              <Globe className="h-5 w-5 mr-3" />
              {t('hero.badge')}
            </div>
            <div>
              <Link
                to="/contact"
                className="inline-flex items-center bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              The Pacific Healthcare Revolution in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch Dr. Flowers' groundbreaking work bringing modern eye care to remote Pacific communities
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/smzkYORJQQc?rel=0&modestbranding=1"
                  title="Dr. Charles Flowers Pacific Healthcare Mission"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => console.log('YouTube iframe loaded successfully')}
                  onError={(e) => {
                    console.error('YouTube iframe error:', e);
                    console.error('Error details:', e.target);
                  }}
                ></iframe>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-600 italic">
                "Bringing revolutionary healthcare to those who need it most" - Featured on KUAM News
                <br />
                <span className="text-sm text-gray-500">
                  If video doesn't load, check browser console (F12) for error details
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              The Revolutionary Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A timeline of innovation, dedication, and life-changing impact
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 lg:left-1/2 transform lg:-translate-x-px h-full w-1 bg-gradient-to-b from-teal-400 to-teal-600"></div>
            
            <div className="space-y-16">
              {[
                {
                  year: '2010',
                  title: 'The Call to Service',
                  description: 'Fresh from completing his ophthalmology residency, Dr. Flowers received an assignment to serve in the Pacific region. What he discovered shocked him: thousands of people living with preventable blindness and vision problems, with no access to modern eye care.',
                  image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg',
                  stats: { patients: '2,000+', islands: '3', procedures: '150' },
                  side: 'left'
                },
                {
                  year: '2012',
                  title: 'The Revolutionary Decision',
                  description: 'After two years of providing basic eye care, Dr. Flowers made a groundbreaking decision: he would bring LASIK technology to the Pacific. Against all conventional wisdom, he began planning the first mobile LASIK center for remote islands.',
                  image: 'https://images.pexels.com/photos/5752407/pexels-photo-5752407.jpeg',
                  stats: { investment: '$2M+', preparation: '18 months', training: '50 staff' },
                  side: 'right',
                  highlight: true
                },
                {
                  year: '2013',
                  title: 'First LASIK in the Pacific',
                  description: 'On March 15, 2013, Dr. Flowers performed the first LASIK surgery in Pacific island history. The patient, a 34-year-old teacher, went from 20/400 vision to 20/20 in minutes. Word spread like wildfire across the islands.',
                  image: './Flowers_cd1.jpg',
                  stats: { firstPatient: 'Maria S.', improvement: '20/400→20/20', impact: 'Life-changing' },
                  side: 'left'
                },
                {
                  year: '2015',
                  title: 'Expanding the Revolution',
                  description: 'The success led to unprecedented demand. Dr. Flowers established permanent LASIK centers on five major islands, trained local medical staff, and developed telemedicine protocols for remote consultations.',
                  image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
                  stats: { centers: '5 islands', staff: '120 trained', consultations: '10,000+' },
                  side: 'right'
                },
                {
                  year: '2018',
                  title: 'Innovation Under Pressure',
                  description: 'Faced with challenging logistics and limited resources, Dr. Flowers pioneered new techniques in mobile surgery, developed protocols for equipment maintenance in humid climates, and created sustainable training programs.',
                  image: 'https://images.pexels.com/photos/5998460/pexels-photo-5998460.jpeg',
                  stats: { innovations: '12 protocols', efficiency: '300%', reliability: '99.2%' },
                  side: 'left'
                },
                {
                  year: '2020',
                  title: 'Bringing Revolution to Los Angeles',
                  description: 'With over 500 successful Pacific procedures and a revolutionary approach to patient care, Dr. Flowers established his Los Angeles practice, bringing the same pioneering spirit and innovation to Southern California.',
                  image: 'https://images.pexels.com/photos/5214413/pexels-photo-5214413.jpeg',
                  stats: { patients: '500+', satisfaction: '98%', referrals: '95%' },
                  side: 'right'
                },
                {
                  year: '2024',
                  title: 'The Dual Mission Continues',
                  description: 'Today, Dr. Flowers maintains his revolutionary dual mission: providing cutting-edge vision care in Los Angeles while continuing quarterly missions to the Pacific, training new surgeons, and expanding access to revolutionary eye care.',
                  image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg',
                  stats: { total: '650+ procedures', missions: 'Quarterly', impact: 'Ongoing' },
                  side: 'left',
                  current: true
                }
              ].map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${milestone.side === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${milestone.side === 'right' ? 'lg:text-right lg:pr-12' : 'lg:pl-12'} pl-12 lg:pl-12`}>
                    <div className={`p-8 rounded-2xl shadow-xl ${milestone.highlight ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200' : milestone.current ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200' : 'bg-white border border-gray-200'}`}>
                      <div className="flex items-center mb-4">
                        <div className={`text-3xl font-bold mr-4 ${milestone.highlight ? 'text-teal-600' : milestone.current ? 'text-teal-600' : 'text-gray-900'}`}>
                          {milestone.year}
                        </div>
                        {milestone.highlight && (
                          <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Revolutionary Breakthrough
                          </div>
                        )}
                        {milestone.current && (
                          <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Current Mission
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{milestone.title}</h3>
                      <p className="text-gray-700 mb-6 leading-relaxed">{milestone.description}</p>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {Object.entries(milestone.stats).map(([key, value], statIndex) => (
                          <div key={statIndex} className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900">{value}</p>
                            <p className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          </div>
                        ))}
                      </div>
                      
                      <img
                        src={milestone.image}
                        alt={milestone.title}
                        className="rounded-xl shadow-md w-full h-48 object-contain bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="absolute left-4 lg:left-1/2 transform lg:-translate-x-1/2 w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 bg-gradient-to-r from-teal-900 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Revolutionary Impact</h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto">
              The numbers tell the story of a healthcare revolution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-12 w-12 text-teal-300" />,
                number: '650+',
                label: 'Lives Transformed',
                description: 'Patients who received revolutionary vision care'
              },
              {
                icon: <MapPin className="h-12 w-12 text-teal-300" />,
                number: '12',
                label: 'Islands Served',
                description: 'Remote Pacific locations reached'
              },
              {
                icon: <Award className="h-12 w-12 text-teal-300" />,
                number: '98%',
                label: 'Success Rate',
                description: 'Patients achieving 20/20 vision or better'
              },
              {
                icon: <Heart className="h-12 w-12 text-teal-300" />,
                number: '15+',
                label: 'Years of Service',
                description: 'Dedicated to healthcare revolution'
              }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">{metric.icon}</div>
                <div className="text-4xl font-bold text-white mb-2">{metric.number}</div>
                <div className="text-xl font-semibold text-teal-200 mb-2">{metric.label}</div>
                <p className="text-teal-300 text-sm">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pacific Mission Photos */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Mission in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Witness the revolutionary impact across the Pacific region
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: 'https://images.pexels.com/photos/5752407/pexels-photo-5752407.jpeg',
                title: 'Mobile Surgery Unit',
                description: 'State-of-the-art LASIK equipment transported to remote islands'
              },
              {
                image: 'https://images.pexels.com/photos/5214413/pexels-photo-5214413.jpeg',
                title: 'Training Local Staff',
                description: 'Building sustainable healthcare infrastructure through education'
              },
              {
                image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg',
                title: 'Island Communities',
                description: 'Reaching the most remote Pacific communities'
              },
              {
                image: 'https://images.pexels.com/photos/5752403/pexels-photo-5752403.jpeg',
                title: 'Revolutionary Results',
                description: 'Life-changing procedures changing communities forever'
              },
              {
                image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
                title: 'Technology Innovation',
                description: 'Adapting cutting-edge technology for challenging environments'
              },
              {
                image: 'https://images.pexels.com/photos/5998460/pexels-photo-5998460.jpeg',
                title: 'Continuing Mission',
                description: 'Quarterly return trips to maintain and expand services'
              }
            ].map((photo, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-48 object-contain"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{photo.title}</h3>
                  <p className="text-gray-600">{photo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                The Revolutionary Philosophy
              </h2>
              <blockquote className="text-2xl italic text-gray-700 mb-8 leading-relaxed">
                "Healthcare shouldn't be limited by geography. Every person, regardless of where they live, 
                deserves access to life-changing medical technology. Sometimes being revolutionary means 
                going where others won't go."
              </blockquote>
              <p className="text-lg text-gray-600 mb-8">
                This philosophy drives everything Dr. Flowers does, from his Pacific missions to his 
                Los Angeles practice. It's about bringing innovation to those who need it most, 
                challenging conventional boundaries, and never accepting "impossible" as an answer.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Globe className="h-6 w-6 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Impact Mindset</h3>
                    <p className="text-gray-600">Thinking beyond local practice to worldwide healthcare needs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Heart className="h-6 w-6 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Patient-Centered Innovation</h3>
                    <p className="text-gray-600">Developing solutions based on real patient needs and challenges</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Plane className="h-6 w-6 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Sustainable Healthcare</h3>
                    <p className="text-gray-600">Building lasting systems that continue beyond individual missions</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg"
                alt="Dr. Flowers philosophy"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Current Mission */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">The Mission Continues</h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto">
              Today's dual mission: Revolutionary care in Los Angeles and ongoing Pacific impact
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <MapPin className="h-8 w-8 mr-4" />
                <h3 className="text-2xl font-bold">Los Angeles Practice</h3>
              </div>
              <ul className="space-y-3 text-teal-100">
                <li>• Revolutionary patient experience with Pacific-proven techniques</li>
                <li>• State-of-the-art Lakewood facility with mobile-surgery efficiency</li>
                <li>• Innovative approach to complex cases</li>
                <li>• Same pioneering spirit, premium setting</li>
                <li>• Training ground for future Pacific missionaries</li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 mr-4" />
                <h3 className="text-2xl font-bold">Ongoing Pacific Mission</h3>
              </div>
              <ul className="space-y-3 text-teal-100">
                <li>• Quarterly return missions to maintain and expand services</li>
                <li>• Training new generation of Pacific eye surgeons</li>
                <li>• Telemedicine consultations for remote follow-ups</li>
                <li>• Equipment maintenance and technology updates</li>
                <li>• Research into tropical climate surgical protocols</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Calendar className="h-16 w-16 mx-auto mb-6 text-teal-200" />
            <h3 className="text-2xl font-bold mb-4">Next Pacific Mission</h3>
            <p className="text-xl text-teal-200 mb-6">March 2025 - Expanding to Two New Islands</p>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-xl max-w-2xl mx-auto">
              <p className="text-teal-100">
                Support Dr. Flowers' revolutionary mission by becoming a patient. Part of every Los Angeles 
                procedure helps fund Pacific healthcare expansion and training programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Experience Revolutionary Healthcare
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            When you choose Dr. Flowers, you're not just getting revolutionary vision care—you're 
            supporting a mission that continues to transform lives across the Pacific. Experience 
            the same pioneering approach that brought modern medicine to remote islands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Join the Revolutionary Mission
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-50 transition-colors"
            >
              Learn More About Dr. Flowers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PacificStory;