import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Shield, Eye, Users, ArrowRight, Check, Star, Play } from 'lucide-react';

const Lasik = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-sm font-light chopard-text-accent border chopard-border mb-6">
                <Star className="h-4 w-4 mr-3 chopard-text-accent" />
                Most Popular Choice - Revolutionary Results
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
                ClearSight LASIK Surgery
              </h1>
              <p className="text-xl chopard-text-secondary mb-8 leading-relaxed font-light">
                Experience the revolutionary LASIK technique that Dr. Flowers pioneered across the Pacific region, 
                now available at ClearSight in Los Angeles. Quick recovery, excellent results, and life-changing clarity await.
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
                  <p className="text-2xl font-serif chopard-text-primary">1-2 days</p>
                  <p className="text-sm chopard-text-secondary font-light">Recovery Time</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Shield className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">98%</p>
                  <p className="text-sm chopard-text-secondary font-light">Success Rate</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-black">
                <video
                  src="/assets/videos/Do-I-Need-LASIK.mp4"
                  className="w-full h-96 lg:h-[500px] object-cover"
                  controls
                  poster="/assets/images/procedures/lasik/brands-people-sWQrD5s0fWc-unsplash.jpg"
                  preload="metadata"
                >
                  <source src="/assets/videos/Do-I-Need-LASIK.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                  <img
                    src="/assets/images/procedures/lasik/brands-people-sWQrD5s0fWc-unsplash.jpg"
                    alt="LASIK eye surgery procedure - Advanced laser vision correction"
                    className="w-full h-96 lg:h-[500px] object-cover"
                  />
                </video>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">LASIK Procedure Demonstration</p>
                  <p className="text-xs opacity-90">Dr. Flowers' Revolutionary Technique</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is LASIK */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                Revolutionary LASIK Technology
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 font-light">
                LASIK (Laser-Assisted In Situ Keratomileusis) is the most advanced and popular vision 
                correction procedure in the world. Dr. Flowers uses state-of-the-art femtosecond laser 
                technology to create a precise corneal flap, then reshapes the underlying cornea with 
                an excimer laser to correct refractive errors.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">Blade-Free Technology</h3>
                    <p className="chopard-text-secondary font-light">Advanced femtosecond laser creates precise flaps</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">Wavefront-Guided Treatment</h3>
                    <p className="chopard-text-secondary font-light">Customized correction for your unique vision</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">Rapid Visual Recovery</h3>
                    <p className="chopard-text-secondary font-light">Most patients see clearly within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/assets/images/diagrams/educational/advanced-technology-overview.png"
                alt="Comprehensive eye examination diagnostic report showing day and night vision measurements for LASIK candidacy assessment"
                className="rounded-2xl shadow-xl w-full h-auto object-contain bg-gray-50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Life-Changing Benefits
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              Discover why LASIK is the preferred choice for vision correction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye className="h-8 w-8 chopard-text-accent" />,
                title: 'Instant Clarity',
                description: 'See clearly without glasses or contacts immediately after surgery'
              },
              {
                icon: <Clock className="h-8 w-8 chopard-text-accent" />,
                title: 'Quick Procedure',
                description: 'Only 15 minutes total, with actual laser time under 60 seconds per eye'
              },
              {
                icon: <Shield className="h-8 w-8 chopard-text-accent" />,
                title: 'Proven Safety',
                description: 'FDA-approved with over 20 years of safety data and millions of procedures'
              },
              {
                icon: <Users className="h-8 w-8 chopard-text-accent" />,
                title: 'Patient Satisfaction',
                description: 'Over 98% of Dr. Flowers\' patients would recommend LASIK to friends'
              },
              {
                icon: <Star className="h-8 w-8 chopard-text-accent" />,
                title: 'Long-Lasting Results',
                description: 'Permanent vision correction that lasts for decades'
              },
              {
                icon: <ArrowRight className="h-8 w-8 chopard-text-accent" />,
                title: 'Active Lifestyle',
                description: 'Freedom to swim, exercise, and live without visual restrictions'
              }
            ].map((benefit, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-serif chopard-text-primary mb-3">{benefit.title}</h3>
                <p className="chopard-text-secondary font-light">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Procedure */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              The LASIK Process
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              Dr. Flowers' revolutionary approach ensures comfort and precision at every step
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: '1',
                title: 'Comprehensive Eye Examination',
                description: 'Advanced diagnostic testing including corneal mapping, wavefront analysis, and pupil measurement to create your personalized treatment plan.',
                image: '/assets/images/procedures/lasik/process/step-01-examination.png'
              },
              {
                step: '2',
                title: 'Corneal Flap Creation',
                description: 'Using the revolutionary femtosecond laser, Dr. Flowers creates a thin, precise flap in the cornea. This blade-free approach ensures maximum safety and accuracy.',
                image: '/assets/images/procedures/lasik/process/step-02-flap-creation.png'
              },
              {
                step: '3',
                title: 'Laser Vision Correction',
                description: 'The excimer laser reshapes the cornea according to your unique prescription. Advanced eye tracking ensures precise treatment even with small eye movements.',
                image: '/assets/images/procedures/lasik/process/step-03-laser-reshaping.png'
              },
              {
                step: '4',
                title: 'Recovery & Follow-up',
                description: 'The corneal flap is repositioned naturally without sutures. Most patients experience immediate vision improvement with complete healing in days.',
                image: '/assets/images/procedures/lasik/process/step-04-recovery.png'
              }
            ].map((step, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 chopard-gradient text-white rounded-full flex items-center justify-center text-xl font-serif mr-4">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-serif chopard-text-primary">{step.title}</h3>
                  </div>
                  <p className="text-lg chopard-text-secondary font-light">{step.description}</p>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <img
                    src={step.image}
                    alt={`LASIK Step ${step.step}: ${step.title}`}
                    className="rounded-xl shadow-lg w-full h-64 object-contain bg-gray-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Candidacy Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Am I a LASIK Candidate?
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              LASIK can correct a wide range of vision problems for qualified candidates
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">Ideal Candidates</h3>
              <ul className="space-y-4">
                {[
                  'Age 18 or older with stable prescription',
                  'Nearsightedness up to -12.00 diopters',
                  'Farsightedness up to +6.00 diopters',
                  'Astigmatism up to 6.00 diopters',
                  'Healthy corneas with adequate thickness',
                  'No severe dry eye syndrome',
                  'Realistic expectations about outcomes'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 chopard-text-accent mr-3 mt-0.5" />
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-secondary mb-6">May Not Be Suitable</h3>
              <ul className="space-y-4">
                {[
                  'Pregnancy or nursing mothers',
                  'Unstable vision prescription',
                  'Severe autoimmune conditions',
                  'Very thin corneas',
                  'Certain eye diseases or conditions',
                  'Unrealistic expectations',
                  'Active eye infections or inflammation'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full border-2 chopard-border mr-3 mt-0.5 flex-shrink-0"></div>
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg chopard-text-secondary mb-6 font-light">
              The only way to know for sure is through a comprehensive evaluation with Dr. Flowers.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
            >
              Schedule Free Candidacy Evaluation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              LASIK Success Stories
            </h2>
            <p className="text-xl chopard-text-secondary font-light">
              Real patients, real results with Dr. Flowers' revolutionary LASIK
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Jennifer L.',
                age: '32, Teacher',
                before: '20/400',
                after: '20/15',
                text: 'I went from barely seeing the board to having better than perfect vision! Dr. Flowers made the entire process comfortable and stress-free.',
                image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
              },
              {
                name: 'Robert K.',
                age: '45, Pilot',
                before: '20/200',
                after: '20/20',
                text: 'My career required perfect vision. Dr. Flowers delivered exactly that with his revolutionary technique. I\'m back in the cockpit!',
                image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
              },
              {
                name: 'Maria S.',
                age: '28, Athlete',
                before: '20/300',
                after: '20/15',
                text: 'Swimming competitively with contacts was impossible. Now I have perfect vision and the freedom to pursue my passion.',
                image: 'https://images.pexels.com/photos/1462636/pexels-photo-1462636.jpeg'
              }
            ].map((testimonial, index) => (
              <div key={index} className="chopard-card rounded-xl p-8">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-light chopard-text-primary">{testimonial.name}</h3>
                    <p className="text-sm chopard-text-secondary font-light">{testimonial.age}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4 p-3 chopard-glass rounded-lg border chopard-border">
                  <div className="text-center">
                    <p className="text-sm chopard-text-secondary font-light">Before</p>
                    <p className="text-lg font-serif text-red-600">{testimonial.before}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 chopard-text-accent" />
                  <div className="text-center">
                    <p className="text-sm chopard-text-secondary font-light">After</p>
                    <p className="text-lg font-serif chopard-text-accent">{testimonial.after}</p>
                  </div>
                </div>
                <p className="chopard-text-secondary italic font-light">"{testimonial.text}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            Ready for Revolutionary Vision?
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            Join the thousands who have trusted Dr. Flowers with their LASIK surgery. 
            Experience the freedom of perfect vision with proven revolutionary techniques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              Schedule Free LASIK Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/testimonials"
              className="inline-flex items-center border border-white text-white px-8 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              See More Results
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Lasik;