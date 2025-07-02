import React, { useState, useEffect } from 'react';
import { Calendar, Shield, Users, TrendingUp, Brain, Heart, Zap, Clock, Star, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';

const Web3MentalHealthPlatform = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[id^="animate-"]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Alex Chen",
      role: "DeFi Trader",
      content: "Trading crypto was consuming my life. This platform helped me find balance and manage the stress of volatile markets.",
      rating: 5
    },
    {
      name: "Sarah Martinez",
      role: "Blockchain Developer",
      content: "The burnout from constant development was real. These sessions gave me tools to maintain my passion while protecting my mental health.",
      rating: 5
    },
    {
      name: "Mike Thompson",
      role: "NFT Creator",
      content: "Understanding the psychology behind FOMO and market anxiety changed everything for me. Highly recommend!",
      rating: 5
    }
  ];

  const services = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Trading Psychology",
      description: "Master emotional trading, overcome FOMO, and develop disciplined investment strategies.",
      features: ["Risk Management", "Emotional Regulation", "Decision Making"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Crypto Stress Management",
      description: "Navigate market volatility with resilience and maintain mental clarity during turbulent times.",
      features: ["Stress Reduction", "Mindfulness", "Sleep Optimization"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Developer Burnout",
      description: "Prevent and recover from burnout while maintaining peak performance in Web3 development.",
      features: ["Work-Life Balance", "Productivity", "Career Guidance"]
    }
  ];

  const stats = [
    { number: "500+", label: "Web3 Professionals Helped" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Crisis Support Available" },
    { number: "100%", label: "Confidential & Secure" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">MindWeb3</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-slate-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#about" className="text-slate-600 hover:text-blue-600 transition-colors">About</a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-600 transition-colors">Testimonials</a>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Book Session
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-2 space-y-2">
              <a href="#services" className="block py-2 text-slate-600">Services</a>
              <a href="#about" className="block py-2 text-slate-600">About</a>
              <a href="#testimonials" className="block py-2 text-slate-600">Testimonials</a>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-full mt-2">
                Book Session
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Trusted by Web3 Professionals</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Mental Health for the
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Digital Economy</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Navigate the emotional challenges of crypto trading, blockchain development, and Web3 entrepreneurship with expert psychological support tailored for your unique journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Book Your Session</span>
              </button>
              <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-full font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Specialized Services for Web3 Professionals
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Addressing the unique mental health challenges of the decentralized economy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                id={`animate-service-${index}`}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform ${
                  isVisible[`animate-service-${index}`] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white mb-6">
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-600 mb-6">{service.description}</p>
                
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button className="mt-6 w-full bg-slate-100 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Understanding the Web3 Mindset
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                As a licensed therapist specializing in digital economy psychology, I understand the unique pressures you face: market volatility, imposter syndrome, decision fatigue, and the constant pressure to stay ahead in a rapidly evolving space.
              </p>
              <p className="text-lg text-slate-600 mb-8">
                My approach combines traditional therapeutic techniques with modern understanding of crypto culture, trading psychology, and the entrepreneurial mindset that drives Web3 innovation.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Brain className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Cognitive Behavioral Therapy</h4>
                    <p className="text-slate-600">Restructure negative thought patterns around risk and failure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Mindfulness Practices</h4>
                    <p className="text-slate-600">Stay present during market turbulence and high-pressure situations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Stress Management</h4>
                    <p className="text-slate-600">Build resilience for the 24/7 nature of crypto markets</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dr. Sarah Johnson</h3>
                  <p className="text-blue-100 mb-4">Licensed Clinical Psychologist</p>
                  <p className="text-sm text-blue-100">
                    PhD in Psychology, 8+ years specializing in digital economy mental health
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Web3 Professionals Say
            </h2>
            <p className="text-xl text-slate-600">
              Real stories from traders, developers, and entrepreneurs
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg text-slate-700 mb-6">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentTestimonial].name.charAt(0)}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-slate-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-slate-600">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Prioritize Your Mental Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of Web3 professionals who've transformed their relationship with stress, trading, and success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Schedule Consultation</span>
            </button>
            <div className="flex items-center space-x-2 text-blue-100">
              <Clock className="w-4 h-4" />
              <span>Available 7 days a week</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">MindWeb3</span>
              </div>
              <p className="text-slate-400">
                Mental health support tailored for the Web3 generation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Individual Therapy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Group Sessions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Crisis Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400">
                <li>hello@mindweb3.com</li>
                <li>24/7 Crisis Line</li>
                <li>Secure & Confidential</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 MindWeb3. All rights reserved. Licensed & Insured.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Web3MentalHealthPlatform;