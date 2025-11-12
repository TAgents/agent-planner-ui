import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiStar } from 'react-icons/fi';

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for individuals and small projects',
    features: [
      '3 active plans',
      'Up to 50 tasks per plan',
      'MCP integration',
      'Basic collaboration',
      'Community support',
      'Web access',
    ],
    cta: 'Start Free',
    ctaLink: '/register',
    popular: false,
    gradient: 'from-gray-600 to-gray-700',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For teams that need advanced planning',
    features: [
      'Unlimited plans',
      'Unlimited tasks',
      'MCP integration',
      'Advanced collaboration',
      'Real-time WebSocket sync',
      'Priority support',
      'API access',
      'Custom webhooks',
      'Advanced analytics',
    ],
    cta: 'Start Pro Trial',
    ctaLink: '/register',
    popular: true,
    gradient: 'from-indigo-600 to-purple-600',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For organizations with advanced needs',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'SSO/SAML',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'On-premise deployment',
      'Custom AI models',
      'White-label options',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    popular: false,
    gradient: 'from-purple-600 to-pink-600',
  },
];

const PricingCard: React.FC<{ tier: typeof pricingTiers[0]; index: number }> = ({ tier, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative ${tier.popular ? 'lg:scale-105 z-10' : ''}`}
    >
      {tier.popular && (
        <div className="absolute -top-5 left-0 right-0 flex justify-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
            {React.createElement(FiStar as any, { className: "w-4 h-4 mr-1" })}
            Most Popular
          </div>
        </div>
      )}

      <div
        className={`h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 ${
          tier.popular ? 'border-indigo-500' : 'border-gray-100'
        }`}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
        <p className="text-gray-600 mb-6">{tier.description}</p>

        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
            {tier.period !== 'contact us' && (
              <span className="text-gray-600 ml-2">/ {tier.period}</span>
            )}
          </div>
          {tier.period === 'contact us' && (
            <span className="text-gray-600 text-sm">{tier.period}</span>
          )}
        </div>

        <Link
          to={tier.ctaLink}
          className={`block w-full text-center py-3 rounded-lg font-semibold mb-8 transition-all ${
            tier.popular
              ? `bg-gradient-to-r ${tier.gradient} text-white hover:shadow-lg transform hover:scale-105`
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {tier.cta}
        </Link>

        <ul className="space-y-4">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              {React.createElement(FiCheck as any, { className: "w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" })}
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const PricingSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. Start free and upgrade as you grow.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} tier={tier} index={index} />
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-50 rounded-2xl p-8 md:p-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I switch plans anytime?</h4>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                immediately, and we'll prorate any charges.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, Amex) via Stripe. Enterprise
                customers can also pay via invoice.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is the free plan really free forever?</h4>
              <p className="text-gray-600">
                Yes! Our free plan is free forever with no hidden fees. It's perfect for individuals
                and small projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not
                satisfied, we'll refund your payment in full.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
