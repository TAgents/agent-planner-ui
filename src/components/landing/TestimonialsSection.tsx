import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechCorp Inc.',
    image: 'https://i.pravatar.cc/150?img=1',
    quote: 'Agent Planner IO has transformed how our team collaborates with AI. The MCP integration with Claude is seamless, and our planning efficiency has increased by 40%.',
    rating: 5,
  },
  {
    name: 'Michael Rodriguez',
    role: 'Engineering Lead',
    company: 'StartupXYZ',
    image: 'https://i.pravatar.cc/150?img=2',
    quote: 'The ability to have AI agents autonomously manage tasks while staying in sync with our human team is game-changing. Best planning tool we\'ve used.',
    rating: 5,
  },
  {
    name: 'Emily Johnson',
    role: 'CTO',
    company: 'InnovateLabs',
    image: 'https://i.pravatar.cc/150?img=3',
    quote: 'We moved from Jira to Agent Planner IO and never looked back. The AI-native approach just makes sense for modern teams working with AI agents.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Project Coordinator',
    company: 'Design Studio',
    image: 'https://i.pravatar.cc/150?img=4',
    quote: 'Real-time collaboration, powerful AI integration, and an intuitive interface. Agent Planner IO checks all the boxes for modern project management.',
    rating: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Teams{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what teams are saying about their experience with Agent Planner IO
            </p>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-xl"
            >
              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  React.createElement(FiStar as any, { key: i, className: "w-6 h-6 text-yellow-400 fill-current" })
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-indigo-300"
              aria-label="Previous testimonial"
            >
              {React.createElement(FiChevronLeft as any, { className: "w-6 h-6 text-gray-700" })}
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-indigo-300"
              aria-label="Next testimonial"
            >
              {React.createElement(FiChevronRight as any, { className: "w-6 h-6 text-gray-700" })}
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-4 gap-8 mt-20"
        >
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              50K+
            </div>
            <div className="text-gray-600">Plans Created</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              1M+
            </div>
            <div className="text-gray-600">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <div className="text-gray-600">Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
