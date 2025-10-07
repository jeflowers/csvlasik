import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Shield, Eye, Cpu, ArrowRight, CheckCircle, Monitor, Smartphone } from 'lucide-react';
import ResponsiveImage from '../components/ResponsiveImage';
import { DIAGRAM_IMAGES } from '../utils/imageUtils';

const Technology = () => {
  const { t } = useTranslation(['technology', 'common']);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="h-4 w-4 mr-2" />
              {t('hero.badge')}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-teal-600">ClearSight</span> {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('hero.description')}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Revolutionary Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Innovation Born from Necessity
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Dr. Flowers' revolutionary approach to technology wasn't developed in a lab—it was 
                forged in the challenging conditions of Pacific island missions where reliability, 
                portability, and precision were matters of patient safety.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Field-Tested Reliability</h3>
                    <p className="text-gray-600">Technology proven in demanding tropical conditions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Adaptive Innovation</h3>
                    <p className="text-gray-600">Solutions created to overcome real-world challenges</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-teal-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Patient-Focused Design</h3>
                    <p className="text-gray-600">Every innovation designed for optimal patient outcomes</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ResponsiveImage
                {...DIAGRAM_IMAGES.educational.technologyOverview}
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Equipment */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              State-of-the-Art Equipment
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The latest technology enhanced by revolutionary techniques and protocols
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Femtosecond Laser System',
                technology: 'Ultra-precise corneal flap creation',
                innovation: 'Dr. Flowers\' humidity-resistant protocols',
                benefits: ['Blade-free surgery', '15-micron precision', 'Tropical climate optimized'],
                image: {
                  src: '/assets/images/diagrams/educational/femtosecond-laser-system.jpg',
                  alt: 'Femtosecond laser system for precise LASIK flap creation',
                  webp: '/assets/images/diagrams/educational/femtosecond-laser-system.webp'
                }
              },
              {
                name: 'Excimer Laser Platform',
                technology: 'Advanced wavefront-guided correction',
                innovation: 'Custom Pacific-tested profiles',
                benefits: ['Personalized treatment', 'Aberration reduction', 'Enhanced night vision'],
                image: {
                  src: '/assets/images/diagrams/educational/excimer-laser-platform.jpg',
                  alt: 'Excimer laser platform for corneal reshaping',
                  webp: '/assets/images/diagrams/educational/excimer-laser-platform.webp'
                }
              },
              {
                name: 'Corneal Topographer',
                technology: 'Ultra-high resolution mapping',
                innovation: 'Mobile-adapted diagnostics',
                benefits: ['22,000 data points', 'Instant analysis', 'Portable precision'],
                image: {
                  src: '/assets/images/diagrams/educational/corneal-topographer.jpg',
                  alt: 'Advanced corneal topography mapping system',
                  webp: '/assets/images/diagrams/educational/corneal-topographer.webp'
                }
              }
            ].map((equipment, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <ResponsiveImage
                  {...equipment.image}
                  className="w-full h-48"
                  objectFit="cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{equipment.name}</h3>
                  <p className="text-gray-600 mb-3">{equipment.technology}</p>
                  <div className="bg-teal-50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-teal-900 mb-1">Revolutionary Innovation:</p>
                    <p className="text-sm text-teal-700">{equipment.innovation}</p>
                  </div>
                  <ul className="space-y-1">
                    {equipment.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="py-16 bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Revolutionary Innovations
            </h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto">
              Breakthrough techniques and protocols developed through Pacific missions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                title: 'Tropical Climate Protocols',
                description: 'Specialized techniques for maintaining laser precision in high-humidity environments, ensuring consistent results regardless of weather conditions.',
                features: [
                  'Humidity compensation algorithms',
                  'Temperature stability protocols',
                  'Equipment calibration procedures',
                  'Quality assurance systems'
                ],
                icon: <Shield className="h-12 w-12 text-teal-300" />
              },
              {
                title: 'Mobile Surgery Optimization',
                description: 'Revolutionary approaches to portable surgical excellence, allowing world-class procedures in challenging locations.',
                features: [
                  'Rapid setup procedures (< 30 minutes)',
                  'Portable sterilization systems',
                  'Battery-powered backup systems',
                  'Compact storage solutions'
                ],
                icon: <Zap className="h-12 w-12 text-teal-300" />
              },
              {
                title: 'Enhanced Safety Protocols',
                description: 'Multi-layered safety systems developed for situations where traditional medical support isn\'t immediately available.',
                features: [
                  'Redundant safety checks',
                  'Remote monitoring capabilities',
                  'Emergency response protocols',
                  'Complication prevention systems'
                ],
                icon: <Eye className="h-12 w-12 text-teal-300" />
              },
              {
                title: 'Telemedicine Integration',
                description: 'Advanced remote consultation and follow-up systems connecting patients across vast Pacific distances.',
                features: [
                  'High-resolution imaging transmission',
                  'Real-time consultation platforms',
                  'Remote diagnostic capabilities',
                  'Digital health record systems'
                ],
                icon: <Cpu className="h-12 w-12 text-teal-300" />
              }
            ].map((innovation, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8">
                <div className="flex items-center mb-6">
                  {innovation.icon}
                  <h3 className="text-2xl font-bold ml-4">{innovation.title}</h3>
                </div>
                <p className="text-teal-100 mb-6">{innovation.description}</p>
                <ul className="space-y-2">
                  {innovation.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-teal-300 mr-3" />
                      <span className="text-teal-200">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telemedicine Technology */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Telemedicine Revolution
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Born from the necessity of connecting with patients across thousands of miles of ocean, 
                Dr. Flowers' telemedicine innovations now enhance every aspect of patient care, from 
                initial consultations to long-term follow-ups.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Monitor className="h-8 w-8 text-teal-600 mr-4 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Virtual Consultations</h3>
                    <p className="text-gray-600">High-definition video consultations with real-time diagnostic capabilities, allowing initial assessments and follow-up care from anywhere.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Smartphone className="h-8 w-8 text-teal-600 mr-4 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Health Monitoring</h3>
                    <p className="text-gray-600">Revolutionary mobile apps for tracking recovery, reporting symptoms, and maintaining connection with the care team throughout your journey.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Eye className="h-8 w-8 text-teal-600 mr-4 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Remote Diagnostics</h3>
                    <p className="text-gray-600">Advanced imaging systems that can transmit detailed eye measurements and photographs for expert analysis, regardless of location.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg"
                alt="Telemedicine consultation"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-teal-600 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">24/7 Access</p>
                    <p className="text-sm text-teal-200">Revolutionary care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Quality Assurance */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Uncompromising Safety Standards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary technology paired with the highest safety standards in the industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Triple Redundancy Systems',
                description: 'Every critical system has multiple backups to ensure uninterrupted precision.',
                stats: ['3 backup systems', '99.99% uptime', '0 system failures']
              },
              {
                title: 'Real-Time Monitoring',
                description: 'Advanced sensors monitor every aspect of the procedure in real-time.',
                stats: ['1000+ data points/sec', 'Instant feedback', '24/7 monitoring']
              },
              {
                title: 'Quality Assurance',
                description: 'Rigorous testing and calibration protocols ensure consistent excellence.',
                stats: ['Daily calibrations', 'Weekly deep testing', 'Monthly certifications']
              }
            ].map((safety, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center">
                <Shield className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">{safety.title}</h3>
                <p className="text-gray-600 mb-6">{safety.description}</p>
                <div className="space-y-2">
                  {safety.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="bg-teal-50 p-2 rounded-lg">
                      <span className="text-sm font-semibold text-teal-900">{stat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Philosophy */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Innovation Philosophy
            </h2>
            <blockquote className="text-2xl italic text-teal-100 max-w-4xl mx-auto leading-relaxed">
              "Technology should serve humanity, not the other way around. Every innovation we develop 
              must make vision correction safer, more accessible, and more effective for patients 
              regardless of where they are in the world."
            </blockquote>
            <p className="text-xl text-teal-200 mt-6">— Dr. Charles Flowers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-3">Patient-First Innovation</h3>
              <p className="text-teal-100">Every technological advancement must directly benefit patient outcomes and experience.</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-3">Accessibility Focus</h3>
              <p className="text-teal-100">Technology should break down barriers, not create them—making care available everywhere.</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-3">Proven Reliability</h3>
              <p className="text-teal-100">Real-world testing in challenging conditions ensures technology performs when it matters most.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Experience Revolutionary Technology
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Benefit from cutting-edge technology enhanced by years of innovation and field testing. 
            Schedule your consultation to experience the difference revolutionary technology makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Schedule Technology Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/procedures"
              className="inline-flex items-center border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-50 transition-colors"
            >
              See Procedures
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Technology;