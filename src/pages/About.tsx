import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, MapPin, Users, Calendar, ArrowRight, Play, GraduationCap, Stethoscope, Globe, BookOpen, Star, Eye } from 'lucide-react';
import ResponsiveImage from '../components/ResponsiveImage';
import { TEAM_IMAGES } from '../utils/imageUtils';

const About = () => {
  const { t } = useTranslation(['about', 'common']);


  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-sm font-light chopard-text-accent border chopard-border mb-6">
                <Award className="h-4 w-4 mr-3 chopard-text-accent" />
                {t('hero.badge')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
                {t('hero.title')}<br />
                <span className="text-3xl chopard-text-accent">{t('hero.subtitle')}</span>
              </h1>
              <p className="text-xl chopard-text-secondary mb-8 leading-relaxed font-light">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
                >
                  {t('hero.cta.schedule')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/pacific-story"
                  className="inline-flex items-center border chopard-border chopard-text-primary px-8 py-3 rounded-lg font-light hover:chopard-text-accent transition-all duration-300"
                >
                  {t('hero.cta.pacific')}
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-black">
                <video
                  src="/assets/videos/Charles-W-Flowers-Jr-MD.mp4"
                  className="w-full h-96 lg:h-[500px] object-contain"
                  controls
                  poster="/assets/images/team/drflowers/DrFlowers_illustrationImage_01.png"
                  preload="metadata"
                >
                  <source src="/assets/videos/Charles-W-Flowers-Jr-MD.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                  <img
                    src="/assets/images/team/drflowers/DrFlowers_illustrationImage_01.png"
                    alt="Dr. Charles Flowers - Revolutionary LASIK surgeon and Pacific healthcare pioneer"
                    className="w-full h-96 lg:h-[500px] object-contain"
                  />
                </video>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Dr. Flowers Introduction</p>
                  <p className="text-xs opacity-90">Vision Correction Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
              {t('excellence.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="chopard-card p-8 rounded-xl text-center">
              <Stethoscope className="h-12 w-12 chopard-text-accent mx-auto mb-4" />
              <h3 className="text-xl font-serif chopard-text-primary mb-3">{t('excellence.clinical.title')}</h3>
              <p className="chopard-text-secondary font-light">{t('excellence.clinical.description')}</p>
            </div>
            <div className="chopard-card p-8 rounded-xl text-center">
              <GraduationCap className="h-12 w-12 chopard-text-accent mx-auto mb-4" />
              <h3 className="text-xl font-serif chopard-text-primary mb-3">{t('excellence.academic.title')}</h3>
              <p className="chopard-text-secondary font-light">{t('excellence.academic.description')}</p>
            </div>
            <div className="chopard-card p-8 rounded-xl text-center">
              <Globe className="h-12 w-12 chopard-text-accent mx-auto mb-4" />
              <h3 className="text-xl font-serif chopard-text-primary mb-3">{t('excellence.global.title')}</h3>
              <p className="chopard-text-secondary font-light">{t('excellence.global.description')}</p>
            </div>
          </div>

          <div className="chopard-card p-8 rounded-xl">
            <blockquote className="text-xl italic chopard-text-secondary text-center leading-relaxed font-light">
              "{t('excellence.quote')}"
            </blockquote>
            <p className="text-center chopard-text-accent font-light mt-4">{t('excellence.attribution')}</p>
          </div>
        </div>
      </section>

      {/* Educational Excellence */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Educational Excellence
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              A foundation of academic achievement from the nation's most prestigious institutions
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                institution: 'Stanford University',
                years: '1981-1985',
                degree: 'Bachelor of Science, Chemistry',
                honors: []
              },
              {
                institution: 'Cornell University Medical College',
                years: '1985-1989',
                degree: 'Doctor of Medicine',
                honors: ['National Medical Fellowship Scholar']
              },
              {
                institution: 'Charles R. Drew University School of Medicine',
                years: '1989-1993',
                degree: 'Internship, General Surgery & Residency, Ophthalmology',
                honors: ['Chief Resident (1992-1993)', 'Intern of the Year', 'National Eye Institute Fellowship Recipient']
              },
              {
                institution: 'USC/Doheny Eye Institute',
                years: '1993-1995',
                degree: 'Fellowship, Corneal and Refractive Surgery & External Disease',
                honors: ['Henry J. Kaiser Family Foundation Merit Award', 'Award of Excellence in Resident Training']
              }
            ].map((education, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div>
                    <h3 className="text-xl font-serif chopard-text-primary mb-2">{education.institution}</h3>
                    <p className="chopard-text-accent font-light">{education.years}</p>
                  </div>
                  <div>
                    <p className="chopard-text-secondary font-light">{education.degree}</p>
                  </div>
                  <div>
                    {education.honors.length > 0 && (
                      <div>
                        <h4 className="font-light chopard-text-primary mb-2">Honors & Awards:</h4>
                        <ul className="space-y-1">
                          {education.honors.map((honor, honorIndex) => (
                            <li key={honorIndex} className="text-sm chopard-text-secondary font-light flex items-start">
                              <Star className="h-3 w-3 chopard-text-accent mr-2 mt-1 flex-shrink-0" />
                              {honor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pacific Mission Impact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              The Pacific Mission: Transforming an Entire Region
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              From 2010 to present, revolutionizing healthcare accessibility for over 200,000 Pacific residents
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-serif chopard-text-primary mb-6">Revolutionary Healthcare Innovation</h3>
              <p className="text-lg chopard-text-secondary mb-6 font-light leading-relaxed">
                In 2010, Dr. Flowers embarked on what would become his most impactful healthcare initiative. 
                Responding to a request from former resident Dr. Anthony Smith, he traveled to Guam to assess 
                the feasibility of establishing the region's first LASIK center. What he discovered was a 
                healthcare crisis affecting over 200,000 Pacific residents who had zero access to vision 
                correction surgery without traveling 13 hours to Hawaii or the Philippines.
              </p>
              <p className="text-lg chopard-text-secondary mb-6 font-light leading-relaxed">
                From 2010 to 2013, Dr. Flowers dedicated himself to designing and establishing a LASIK center 
                at Island Eye Institute. His efforts culminated in 2013 when he performed the first-ever LASIK 
                procedure in the Pacific region, instantly transforming healthcare accessibility for an entire population.
              </p>
            </div>
            <div className="relative">
              <div className="rounded-2xl shadow-xl overflow-hidden bg-black">
                <video
                  src="/assets/videos/Guam-Lasik-Eye-Treatment.mp4"
                  className="w-full h-96 lg:h-[500px] object-contain"
                  controls
                  poster="/assets/images/team/drflowers/DrFlowers_guam_innovation_01.png"
                  preload="metadata"
                >
                  <source src="/assets/videos/Guam-Lasik-Eye-Treatment.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                  <img
                    src="/assets/images/team/drflowers/DrFlowers_guam_innovation_01.png"
                    alt="Dr. Flowers' Pacific healthcare mission transforming island communities"
                    className="w-full h-96 lg:h-[500px] object-contain"
                  />
                </video>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Guam LASIK Treatment</p>
                  <p className="text-xs opacity-90">Transforming Pacific Healthcare</p>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: '600+',
                label: 'LASIK Procedures in Guam',
                description: 'Successful surgeries performed'
              },
              {
                number: '200,000+',
                label: 'Residents Served',
                description: 'Given access to advanced eye care'
              },
              {
                number: '$3,000+',
                label: 'Travel Costs Saved',
                description: 'Average savings per patient'
              },
              {
                number: '13 Hours',
                label: 'Flight Time Eliminated',
                description: 'For each patient procedure'
              }
            ].map((stat, index) => (
              <div key={index} className="text-center chopard-card p-6 rounded-xl">
                <div className="text-3xl font-serif chopard-text-accent mb-2">{stat.number}</div>
                <div className="text-lg font-light chopard-text-primary mb-2">{stat.label}</div>
                <p className="chopard-text-secondary text-sm font-light">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telemedicine Innovation */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="/assets/images/team/drflowers/DrFlowers_eye_exam_01.png"
                alt="Revolutionary telemedicine technology connecting Pacific islands to advanced eye care"
                className="rounded-2xl shadow-xl w-full h-64 object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                Telemedicine Pioneer
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 font-light leading-relaxed">
                Dr. Flowers' innovation extends beyond surgical excellence. Recognizing Guam's high diabetes 
                prevalence and genetic predisposition, he secured funding for a groundbreaking telemedicine 
                initiative. This teleretinopathy pilot project involved:
              </p>
              <div className="space-y-4">
                {[
                  'Deploying state-of-the-art retinal imaging cameras in primary care clinics throughout Guam',
                  'Implementing secure hybrid-cloud infrastructure for HIPAA-compliant image storage and real-time analysis',
                  'Leveraging artificial intelligence and machine learning algorithms for automated detection and grading of diabetic retinopathy',
                  'Establishing seamless teleconsultation pathways connecting Guam clinics with USC retinal specialists',
                  'Enabling early detection and intervention for sight-threatening diabetic retinopathy before vision loss occurs',
                  'Developing comprehensive training programs to certify local physicians in advanced retinal imaging and diagnostic protocols'
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <Eye className="h-5 w-5 chopard-text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Expertise */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Clinical Excellence & Expertise
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">Surgical Specializations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Laser-Assisted In Situ Keratomileusis (LASIK)',
                  'Advanced Cataract Surgery',
                  'Corneal Transplantation (including DSAEK)',
                  'Visian Implantable Collamer Lens (ICL)',
                  'Photorefractive Keratectomy (PRK)',
                  'Intacs Implantation for Keratoconus',
                  'Pterygium Surgery',
                  'Collagen Cross-Linking'
                ].map((procedure, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 chopard-accent rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span className="text-sm chopard-text-secondary font-light">{procedure}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">Research Priorities</h3>
              <div className="space-y-4">
                {[
                  'Visual outcomes optimization in LASIK and cataract surgery',
                  'Sports vision training and athletic performance enhancement',
                  'Telemedicine applications in ophthalmology',
                  'Population-based diabetic retinopathy studies'
                ].map((research, index) => (
                  <div key={index} className="flex items-start">
                    <BookOpen className="h-5 w-5 chopard-text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="chopard-text-secondary font-light">{research}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 chopard-glass rounded-lg border chopard-border">
                <p className="text-sm chopard-text-primary font-light">
                  <strong>Grant Funding:</strong> Over $1 million secured in research funding
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recognition & Awards */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Recognition & Awards
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              National recognition for innovation, excellence, and humanitarian impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'America\'s Top Ophthalmologists - Consumers\' Research Council of America (2000)',
              'Computer World Smithsonian Laureate - The Face of Innovation (1998)',
              'National Medical Fellowship Scholar - Cornell University Medical College',
              'Henry J. Kaiser Family Foundation Merit Award',
              'Award of Excellence - RCMI/Charles R. Drew University (2000)',
              'Sara Stivelman Memorial Award - LA County Quality & Productivity Commission (1999)',
              'Masters In Medicine Honoree - Recycling Black Dollars Communications (1999)',
              'Innovator\'s Award - Los Angeles County Department of Health Services (1998)',
              'Top LASIK Surgeon - San Diego Magazine'
            ].map((award, index) => (
              <div key={index} className="chopard-card p-6 rounded-xl">
                <div className="flex items-start">
                  <Award className="h-5 w-5 chopard-text-accent mr-3 mt-1 flex-shrink-0" />
                  <span className="text-sm chopard-text-secondary font-light leading-relaxed">{award}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Dual Mission Model */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif mb-4">The Dual Mission Model</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
              A unique practice model serving as a blueprint for addressing healthcare disparities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 mr-3" />
                <h3 className="text-2xl font-serif">Los Angeles Practice</h3>
              </div>
              <ul className="space-y-3 text-white/70 font-light">
                <li>• State-of-the-art facility</li>
                <li>• Comprehensive vision correction services</li>
                <li>• Revolutionary patient experience</li>
                <li>• Advanced technology integration</li>
                <li>• Residency program leadership</li>
                <li>• Research and innovation center</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 mr-3" />
                <h3 className="text-2xl font-serif">Pacific Mission</h3>
              </div>
              <ul className="space-y-3 text-white/70 font-light">
                <li>• Quarterly surgical missions to Guam</li>
                <li>• Mobile surgical capabilities</li>
                <li>• Local physician training and mentorship</li>
                <li>• Telemedicine infrastructure development</li>
                <li>• Sustainable healthcare system building</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/pacific-story"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-3 rounded-lg font-light hover:chopard-hero transition-all duration-300"
            >
              Learn More About the Pacific Mission
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Impact by Numbers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Impact by the Numbers
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { number: '30,000+', label: 'Total Procedures' },
              { number: '600+', label: 'Guam Procedures' },
              { number: '200,000+', label: 'Pacific Residents Served' },
              { number: '98%', label: 'Patient Satisfaction' },
              { number: '20+', label: 'Years Experience' },
              { number: '15+', label: 'Years Pacific Service' },
              { number: '12', label: 'Pacific Islands' },
              { number: '$1M+', label: 'Research Funding' },
              { number: '4', label: 'Annual Guam Missions' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-serif chopard-text-accent mb-2">{stat.number}</div>
                <p className="chopard-text-secondary font-light text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Care Philosophy */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-8">
              Patient Care Philosophy
            </h2>
            <div className="chopard-card p-12 rounded-xl max-w-4xl mx-auto">
              <blockquote className="text-2xl italic chopard-text-secondary text-center leading-relaxed font-light mb-6">
                "I treat every patient as though I am caring for a family member. Establishing a personal rapport is a priority, so open, honest and transparent communication can take place about every aspect of their visual condition and the care interventions."
              </blockquote>
              <p className="chopard-text-secondary font-light text-center leading-relaxed">
                This philosophy extends beyond individual patient care to encompass entire communities. 
                Dr. Flowers believes that healthcare should reach every corner of the world, and that 
                innovation isn't just about technology—it's about finding ways to bring life-changing 
                treatments to those who need them most, regardless of location or circumstances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/80 mb-8 font-light">
            {t('cta.subtitle')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:chopard-hero transition-all duration-300"
          >
            <Calendar className="mr-2 h-5 w-5" />
            {t('cta.schedule')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;