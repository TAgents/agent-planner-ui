import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/landing/HeroSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import GettingStartedSection from '../components/landing/GettingStartedSection';
import Footer from '../components/landing/Footer';

const Landing: React.FC = () => {
  // Enable smooth scrolling for the entire page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Agent Planner - AI-Powered Planning for Your Ideas</title>
        <meta
          name="description"
          content="Let AI create plans from your ideas. Implement the plan with your AI tools. Or let our Agents implement them."
        />
        <meta name="keywords" content="AI planning, MCP, Model Context Protocol, collaborative planning, AI agents, Claude integration" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentplanner.io/" />
        <meta property="og:title" content="Agent Planner - AI-Powered Planning for Your Ideas" />
        <meta property="og:description" content="Let AI create plans from your ideas. Implement the plan with your AI tools. Or let our Agents implement them." />
        <meta property="og:image" content="https://agentplanner.io/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://agentplanner.io/" />
        <meta property="twitter:title" content="Agent Planner - AI-Powered Planning for Your Ideas" />
        <meta property="twitter:description" content="Let AI create plans from your ideas. Implement the plan with your AI tools. Or let our Agents implement them." />
        <meta property="twitter:image" content="https://agentplanner.io/og-image.png" />

        <link rel="canonical" href="https://agentplanner.io/" />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
        <HeroSection />
        <SocialProofSection />
        <FeaturesSection />
        <GettingStartedSection />
        <Footer />
      </div>
    </>
  );
};

export default Landing;
