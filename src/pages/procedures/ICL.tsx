import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Clock, Eye, Shield, ArrowRight, Check, Star, RotateCcw } from 'lucide-react';

const ICL = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-sm font-light chopard-text-accent border chopard-border mb-6">
                <Layers className="h-4 w-4 mr-3 chopard-text-accent" />
                Implantable Solution - Reversible Results
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
                ClearSight ICL Surgery
              </h1>
              <p className="text-xl chopard-text-secondary mb-8 leading-relaxed font-light">
                Experience ICL (Implantable Contact Lens), the revolutionary permanent solution for 
                high prescriptions. Reversible, protective, and offering superior vision quality 
                for patients beyond traditional laser limits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
                >
                  Schedule Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/procedures"
                  className="inline-flex items-center border border-gray-900 chopard-text-primary px-8 py-3 rounded-lg font-light hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  Compare Procedures
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Clock className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">30 min</p>
                  <p className="text-sm chopard-text-secondary font-light">Procedure Time</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Eye className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">1-3 days</p>
                  <p className="text-sm chopard-text-secondary font-light">Recovery Time</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Shield className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">99%</p>
                  <p className="text-sm chopard-text-secondary font-light">Success Rate</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="/assets/images/procedures/lasik/arteum-ro-7H41oiADqqg-unsplash.jpg"
                alt="ICL procedure"
                className="rounded-2xl shadow-2xl w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is ICL */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                Revolutionary Implantable Technology
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 font-light">
                ICL (Implantable Contact Lens) is a revolutionary refractive surgery that places a 
                soft, biocompatible lens inside your eye, between the iris and natural lens. This 
                permanent solution corrects vision without removing any corneal tissue.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">Reversible Procedure</h3>
                    <p className="chopard-text-secondary font-light">ICL can be removed or replaced if needed</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">No Corneal Alteration</h3>
                    <p className="chopard-text-secondary font-light">Preserves natural corneal structure completely</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">Superior Night Vision</h3>
                    <p className="chopard-text-secondary font-light">Exceptional vision quality in all lighting</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/assets/images/misc/getty-images-9v-k2iQI4BI-unsplash.jpg"
                alt="Eye anatomy"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ICL Advantages */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Unique ICL Advantages
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              Discover why ICL is the preferred choice for high prescriptions and demanding patients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <RotateCcw className="h-8 w-8 chopard-text-accent" />,
                title: 'Reversible',
                description: 'Unlike laser procedures, ICL can be removed or replaced if your vision changes'
              },
              {
                icon: <Eye className="h-8 w-8 chopard-text-accent" />,
                title: 'Superior Vision Quality',
                description: 'Exceptional clarity and contrast, especially in low-light conditions'
              },
              {
                icon: <Shield className="h-8 w-8 chopard-text-accent" />,
                title: 'UV Protection',
                description: 'Built-in UV filter protects your retina from harmful ultraviolet rays'
              },
              {
                icon: <Layers className="h-8 w-8 chopard-text-accent" />,
                title: 'No Corneal Changes',
                description: 'Preserves natural corneal structure and biomechanical properties'
              },
              {
                icon: <Clock className="h-8 w-8 chopard-text-accent" />,
                title: 'Quick Recovery',
                description: 'Most patients return to normal activities within 24-48 hours'
              },
              {
                icon: <Star className="h-8 w-8 chopard-text-accent" />,
                title: 'High Prescriptions',
                description: 'Corrects severe myopia beyond the limits of laser surgery'
              }
            ].map((advantage, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="mb-4">{advantage.icon}</div>
                <h3 className="text-xl font-serif chopard-text-primary mb-3">{advantage.title}</h3>
                <p className="chopard-text-secondary font-light">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The ICL Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              The ICL Process
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              Dr. Flowers' meticulous approach to ICL implantation
            </p>
          </div>

          <div className="space-y-16">
            {[
              {
                step: '1',
                title: 'Comprehensive Evaluation',
                description: 'Detailed eye measurements including anterior chamber depth, corneal endothelial cell count, and precise biometry to ensure perfect ICL sizing and positioning.',
                image: '/assets/images/team/drflowers/DrFlowers_eye_exam_01.png',
                duration: '2-3 weeks before surgery'
              },
              {
                step: '2',
                title: 'Pre-Procedure Preparation',
                description: 'Small laser openings (iridotomies) are created to ensure proper fluid circulation. Custom ICL is ordered based on your exact measurements.',
                image: '/assets/images/team/drflowers/DrFlowers_eye_surgery_01.png',
                duration: '1-2 weeks before surgery'
              },
              {
                step: '3',
                title: 'ICL Implantation',
                description: 'Using a microscopic incision, the folded ICL is inserted behind the iris and positioned in front of your natural lens. No stitches are required.',
                image: '/assets/images/team/drflowers/DrFlowers_eye_surgery_02.png',
                duration: '15-20 minutes per eye'
              },
              {
                step: '4',
                title: 'Recovery & Monitoring',
                description: 'Regular follow-up visits ensure proper healing and optimal vision. Most patients notice immediate improvement with continued enhancement over days.',
                image: '/assets/images/team/drflowers/DrFlowers_after_surgery_recovery.png',
                duration: 'Several follow-up visits'
              }
            ].map((step, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 chopard-gradient text-white rounded-full flex items-center justify-center text-2xl font-serif mr-6">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif chopard-text-primary">{step.title}</h3>
                      <p className="chopard-text-accent font-light">{step.duration}</p>
                    </div>
                  </div>
                  <p className="text-lg chopard-text-secondary leading-relaxed font-light">{step.description}</p>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <img
                    src={step.image}
                    alt={step.title}
                    className="rounded-xl shadow-lg w-full h-64 object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ICL vs Laser Comparison */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif mb-4">
              ICL vs Laser Surgery
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
              Understanding when ICL is the superior choice
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <h3 className="text-2xl font-serif text-white mb-6">ICL Advantages</h3>
              <ul className="space-y-4">
                {[
                  'Corrects prescriptions up to -20.00 D',
                  'Completely reversible procedure',
                  'No dry eye complications',
                  'Superior night vision quality',
                  'Preserves natural corneal structure',
                  'Built-in UV protection',
                  'No corneal healing required'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-white mr-3 mt-0.5" />
                    <span className="text-white/70 font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
              <h3 className="text-2xl font-serif text-white/70 mb-6">Laser Limitations</h3>
              <ul className="space-y-4">
                {[
                  'Limited prescription range',
                  'Permanent corneal changes',
                  'Potential for dry eyes',
                  'May affect night vision',
                  'Requires adequate corneal thickness',
                  'Cannot correct extreme myopia',
                  'Irreversible tissue removal'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full border-2 border-white/40 mr-3 mt-0.5 flex-shrink-0"></div>
                    <span className="text-white/60 font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal Candidates */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Who Benefits Most from ICL?
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              ICL is the ideal solution for specific patient needs and prescription ranges
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'High Prescriptions',
                icon: <Eye className="h-12 w-12 chopard-text-accent" />,
                description: 'Patients with severe myopia (-3.00 to -20.00 D) or hyperopia (+0.50 to +10.00 D)',
                benefits: ['Beyond laser limits', 'Exceptional correction', 'Stable results']
              },
              {
                title: 'Thin Corneas',
                icon: <Shield className="h-12 w-12 chopard-text-accent" />,
                description: 'When corneal thickness is insufficient for laser procedures',
                benefits: ['No corneal tissue removal', 'Preserves eye structure', 'Safe alternative']
              },
              {
                title: 'Quality Seekers',
                icon: <Star className="h-12 w-12 chopard-text-accent" />,
                description: 'Patients who prioritize superior vision quality and reversibility',
                benefits: ['Premium vision quality', 'Reversible option', 'UV protection']
              }
            ].map((candidate, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="mb-6">{candidate.icon}</div>
                <h3 className="text-xl font-serif chopard-text-primary mb-4">{candidate.title}</h3>
                <p className="chopard-text-secondary mb-6 font-light">{candidate.description}</p>
                <div className="space-y-2">
                  {candidate.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center justify-center">
                      <Check className="h-4 w-4 chopard-text-accent mr-2" />
                      <span className="text-sm chopard-text-secondary font-light">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 chopard-glass p-8 rounded-xl border chopard-border">
            <h3 className="text-2xl font-serif chopard-text-primary mb-4 text-center">Pre-Procedure Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-light chopard-text-primary mb-3">Qualifying Factors:</h4>
                <ul className="space-y-2">
                  {[
                    'Age 21-45 for optimal results',
                    'Stable prescription for 1+ years',
                    'Adequate anterior chamber depth',
                    'Healthy corneal endothelium',
                    'No active eye disease'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 chopard-text-accent mr-2 mt-0.5" />
                      <span className="text-sm chopard-text-secondary font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-light chopard-text-primary mb-3">Disqualifying Conditions:</h4>
                <ul className="space-y-2">
                  {[
                    'Glaucoma or high eye pressure',
                    'Previous eye surgeries',
                    'Shallow anterior chamber',
                    'Active eye inflammation',
                    'Unrealistic expectations'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-4 h-4 rounded-full border-2 chopard-border mr-2 mt-0.5 flex-shrink-0"></div>
                      <span className="text-sm chopard-text-secondary font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Success Stories */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              ICL Success Stories
            </h2>
            <p className="text-xl chopard-text-secondary font-light">
              Real patients experiencing life-changing results with ICL technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="chopard-card p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
                  alt="Amanda Chen"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-light chopard-text-primary">Amanda Chen</h3>
                  <p className="text-sm chopard-text-secondary font-light">Graphic Designer</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="chopard-text-secondary italic mb-4 font-light">
                "With -15.00 prescription, LASIK wasn't an option. ICL gave me perfect vision without 
                changing my corneas. The night vision is incredible, and I love knowing it's reversible!"
              </blockquote>
              <div className="chopard-glass p-4 rounded-lg border chopard-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm chopard-text-secondary font-light">Before</p>
                    <p className="text-lg font-serif text-red-600">-15.00</p>
                  </div>
                  <div>
                    <p className="text-sm chopard-text-secondary font-light">After</p>
                    <p className="text-lg font-serif chopard-text-accent">20/15</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <img
                  src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg"
                  alt="Marcus Rodriguez"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-light chopard-text-primary">Marcus Rodriguez</h3>
                  <p className="text-sm chopard-text-secondary font-light">Photographer</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="chopard-text-secondary italic mb-4 font-light">
                "As a photographer, vision quality is everything. ICL not only corrected my -12.00 
                prescription but gave me the sharpest vision I've ever had. The UV protection is a bonus!"
              </blockquote>
              <div className="chopard-glass p-4 rounded-lg border chopard-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm chopard-text-secondary font-light">Before</p>
                    <p className="text-lg font-serif text-red-600">-12.00</p>
                  </div>
                  <div>
                    <p className="text-sm chopard-text-secondary font-light">After</p>
                    <p className="text-lg font-serif chopard-text-accent">20/20</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            Is ICL Right for Your High Prescription?
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            Discover if ICL is the perfect reversible solution for your vision needs. 
            Schedule a comprehensive evaluation with Dr. Flowers to explore this revolutionary option.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              Schedule ICL Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/procedures"
              className="inline-flex items-center border border-white text-white px-8 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Compare All Procedures
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ICL;