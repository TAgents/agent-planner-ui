import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiCpu, FiUsers, FiZap, FiShield, FiGlobe, FiTrendingUp } from 'react-icons/fi';

interface Feature {
  iconName: string;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    iconName: 'FiCpu',
    title: 'MCP Integration',
    description: 'Seamlessly connect with AI agents via Model Context Protocol. Works with Claude Desktop, Claude Code, and any MCP-compatible AI system.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    iconName: 'FiUsers',
    title: 'Hierarchical Planning',
    description: 'Organize complex projects with plans, phases, tasks, and milestones. Track dependencies and progress through nested structures.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    iconName: 'FiZap',
    title: 'AI-Powered Collaboration',
    description: 'Let AI agents create, update, and manage plans alongside your team. Full CRUD operations available through the MCP interface.',
    gradient: 'from-pink-500 to-red-500',
  },
  {
    iconName: 'FiShield',
    title: 'Secure by Default',
    description: 'Row-level security with PostgreSQL. API token authentication ensures your plans stay private and secure.',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    iconName: 'FiGlobe',
    title: 'REST API',
    description: 'Complete REST API with OpenAPI documentation. Integrate Agent Planner into your existing workflows and tools.',
    gradient: 'from-orange-500 to-yellow-500',
  },
  {
    iconName: 'FiTrendingUp',
    title: 'Visual Planning',
    description: 'Interactive tree visualization and list views. See your entire project structure at a glance with real-time updates.',
    gradient: 'from-yellow-500 to-green-500',
  },
];

const iconMap: { [key: string]: any } = {
  FiCpu,
  FiUsers,
  FiZap,
  FiShield,
  FiGlobe,
  FiTrendingUp,
};

const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const Icon = iconMap[feature.iconName];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="h-full bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Plan with AI
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Agent Planner IO combines powerful planning tools with seamless AI integration,
              enabling your team to work alongside intelligent agents.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Additional feature highlight */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Open Source & MCP-Native</h3>
              <p className="text-indigo-100 text-lg leading-relaxed mb-6">
                Agent Planner IO is built on open standards and designed for seamless AI integration.
                Connect Claude Desktop or any MCP-compatible AI to your planning system in minutes.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Published on npm - zero installation with npx</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Full REST API with OpenAPI documentation</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Open source MCP server on GitHub</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h4 className="text-lg font-semibold mb-4 text-white">What's Included</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-100">Claude Desktop Integration</span>
                  <span className="text-white font-semibold">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-100">Claude Code Integration</span>
                  <span className="text-white font-semibold">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-100">Hierarchical Planning</span>
                  <span className="text-white font-semibold">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-100">REST API Access</span>
                  <span className="text-white font-semibold">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-100">API Token Authentication</span>
                  <span className="text-white font-semibold">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-100">Visual Tree Views</span>
                  <span className="text-white font-semibold">✓</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
