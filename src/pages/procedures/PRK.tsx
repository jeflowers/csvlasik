import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Eye, Users, ArrowRight, Check, Star } from 'lucide-react';

const PRK = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-sm font-light chopard-text-accent border chopard-border mb-6">
                <Shield className="h-4 w-4 mr-3 chopard-text-accent" />
                Surface Treatment Alternative - Proven Results
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
                ClearSight PRK Surgery
              </h1>
              <p className="text-xl chopard-text-secondary mb-8 leading-relaxed font-light">
                Experience PRK (Photorefractive Keratectomy), the original laser vision correction procedure. 
                Perfect for patients with thin corneas or active lifestyles, offering excellent long-term stability.
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
                  <p className="text-2xl font-serif chopard-text-primary">15 min</p>
                  <p className="text-sm chopard-text-secondary font-light">Procedure Time</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Eye className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">3-5 days</p>
                  <p className="text-sm chopard-text-secondary font-light">Recovery Time</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Shield className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">96%</p>
                  <p className="text-sm chopard-text-secondary font-light">Success Rate</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-black">
                <video
                  src="/assets/videos/PRK-Treatment-Animation.mp4"
                  className="w-full h-96 lg:h-[500px] object-cover"
                  controls
                  poster="/assets/images/procedures/lasik/jsb-co-G2sv2jjH3JU-unsplash.jpg"
                  preload="metadata"
                >
                  <source src="/assets/videos/PRK-Treatment-Animation.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                  <img
                    src="/assets/images/procedures/lasik/jsb-co-G2sv2jjH3JU-unsplash.jpg"
                    alt="PRK photorefractive keratectomy - Surface laser vision correction"
                    className="w-full h-96 lg:h-[500px] object-cover"
                  />
                </video>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">PRK Surface Treatment</p>
                  <p className="text-xs opacity-90">No corneal flap required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is PRK */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                The Original Laser Vision Correction
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 font-light">
                PRK (Photorefractive Keratectomy) was the first laser vision correction procedure and remains 
                the gold standard for certain patients. Unlike LASIK, PRK treats the surface of the cornea 
                directly, making it ideal for patients with thin corneas or those in high-impact professions.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">No Corneal Flap</h3>
                    <p className="chopard-text-secondary font-light">Surface treatment eliminates flap-related complications</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">Suitable for Thin Corneas</h3>
                    <p className="chopard-text-secondary font-light">Perfect option when LASIK isn't recommended</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">Excellent Long-term Stability</h3>
                    <p className="chopard-text-secondary font-light">Proven track record with decades of data</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/assets/images/misc/jsb-co-VFkksKfrsvM-unsplash.jpg"
                alt="Eye examination"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PRK vs LASIK */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Why Choose PRK?
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              Understanding the unique advantages of PRK over other procedures
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">PRK Advantages</h3>
              <ul className="space-y-4">
                {[
                  'No risk of flap complications',
                  'Suitable for thin corneas',
                  'Ideal for contact sports and military',
                  'Excellent long-term stability',
                  'Preserves more corneal tissue',
                  'Can correct higher prescriptions',
                  'No risk of dry eyes from flap'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 chopard-text-accent mr-3 mt-0.5" />
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-secondary mb-6">LASIK Comparison</h3>
              <ul className="space-y-4">
                {[
                  'Requires corneal flap creation',
                  'Needs adequate corneal thickness',
                  'Faster initial recovery',
                  'Immediate vision improvement',
                  'Less post-op discomfort',
                  'Most popular procedure',
                  'Quick return to activities'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full chopard-glass border-2 chopard-border mr-3 mt-0.5 flex-shrink-0"></div>
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg chopard-text-secondary mb-6 font-light">
              Dr. Flowers will help determine which procedure is best for your unique situation.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
            >
              Get Personalized Recommendation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The PRK Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              The PRK Process
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              Dr. Flowers' refined PRK technique ensures optimal results with maximum comfort
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: '1',
                title: 'Pre-Operative Preparation',
                description: 'Comprehensive eye mapping and measurements. Topical anesthetic drops are applied for comfort during the procedure.',
                image: './Flowers_cd2.jpg',
                duration: '15 minutes'
              },
              {
                step: '2',
                title: 'Epithelium Removal',
                description: 'The thin surface layer of the cornea (epithelium) is gently removed to access the treatment area.',
                duration: '2 minutes'
              },
              {
                step: '3',
                title: 'Laser Reshaping',
                description: 'The excimer laser precisely reshapes the cornea to correct your vision prescription with advanced eye-tracking technology.',
                duration: '30-60 seconds'
              },
              {
                step: '4',
                title: 'Protective Contact Lens',
                description: 'A soft contact lens bandage is placed to protect the eye and promote healing while the epithelium regenerates.',
                duration: '1 minute'
              }
            ].map((step, index) => (
              <div key={index} className="chopard-card rounded-xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div className="flex items-center">
                    <div className="w-16 h-16 chopard-gradient text-white rounded-full flex items-center justify-center text-2xl font-serif mr-6">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif chopard-text-primary">{step.title}</h3>
                      <p className="chopard-text-accent font-light">{step.duration}</p>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-lg chopard-text-secondary font-light">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recovery Timeline */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              PRK Recovery Timeline
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              What to expect during your healing journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                period: 'Days 1-3',
                title: 'Initial Healing',
                symptoms: ['Mild discomfort', 'Light sensitivity', 'Tearing', 'Blurry vision'],
                care: ['Use prescribed drops', 'Wear sunglasses', 'Rest eyes frequently', 'Avoid screens']
              },
              {
                period: 'Days 4-7',
                title: 'Vision Clearing',
                symptoms: ['Improving comfort', 'Clearer vision', 'Less sensitivity', 'Contact lens removal'],
                care: ['Continue medications', 'Follow-up appointment', 'Gradual activity return', 'Protect eyes']
              },
              {
                period: 'Weeks 2-4',
                title: 'Stabilization',
                symptoms: ['Stable vision', 'Minimal symptoms', 'Normal activities', 'Clear sight'],
                care: ['Regular check-ups', 'UV protection', 'Normal routine', 'Final healing']
              }
            ].map((phase, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl">
                <div className="text-center mb-6">
                  <div className="text-2xl font-serif chopard-text-accent mb-2">{phase.period}</div>
                  <h3 className="text-xl font-serif chopard-text-primary">{phase.title}</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-light chopard-text-primary mb-3">What to Expect:</h4>
                    <ul className="space-y-2">
                      {phase.symptoms.map((symptom, symptomIndex) => (
                        <li key={symptomIndex} className="flex items-start">
                          <Eye className="h-4 w-4 chopard-text-accent mr-2 mt-0.5" />
                          <span className="text-sm chopard-text-secondary font-light">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-light chopard-text-primary mb-3">Care Instructions:</h4>
                    <ul className="space-y-2">
                      {phase.care.map((instruction, instructionIndex) => (
                        <li key={instructionIndex} className="flex items-start">
                          <Check className="h-4 w-4 chopard-text-accent mr-2 mt-0.5" />
                          <span className="text-sm chopard-text-secondary font-light">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Candidates */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Who Benefits Most from PRK?
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              PRK is often the preferred choice for specific patient profiles
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Active Professionals',
                icon: <Users className="h-12 w-12 chopard-text-accent" />,
                description: 'Military personnel, law enforcement, firefighters, and athletes who face potential eye trauma',
                benefits: ['No flap displacement risk', 'Contact sport safe', 'High-impact activities']
              },
              {
                title: 'Thin Corneas',
                icon: <Shield className="h-12 w-12 chopard-text-accent" />,
                description: 'Patients whose corneas are too thin for LASIK or who have irregular corneal shapes',
                benefits: ['Preserves corneal tissue', 'Treats irregular astigmatism', 'Safe for thin corneas']
              },
              {
                title: 'High Prescriptions',
                icon: <Eye className="h-12 w-12 chopard-text-accent" />,
                description: 'Patients with higher degrees of nearsightedness, farsightedness, or astigmatism',
                benefits: ['Treats severe myopia', 'Corrects high astigmatism', 'Long-term stability']
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
        </div>
      </section>

      {/* Patient Success Story */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif mb-6">
                PRK Success Story
              </h2>
              <blockquote className="text-xl italic text-white/70 mb-6 font-light">
                "As a Marine, I needed a procedure that could withstand combat conditions. Dr. Flowers recommended 
                PRK, and it was the best decision I ever made. No flap to worry about, perfect vision, and 
                I'm back to active duty with confidence."
              </blockquote>
              <div className="flex items-center">
                <img
                  src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg"
                  alt="Military patient"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-light">Sergeant Michael Torres</p>
                  <p className="text-white/70 font-light">U.S. Marine Corps</p>
                  <div className="flex mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg"
                alt="Military service member"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            Is PRK Right for You?
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            Discover if PRK is the perfect solution for your vision needs and lifestyle. 
            Dr. Flowers will provide expert guidance and personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              Schedule PRK Consultation
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

export default PRK;