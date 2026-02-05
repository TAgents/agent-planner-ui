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
        <title>AgentPlanner - Structured Planning for OpenClaw Agents</title>
        <meta
          name="description"
          content="Give your OpenClaw agent the power of structured planning. Create detailed plans, track progress, and execute projects through natural conversation."
        />
        <meta name="keywords" content="OpenClaw, AI agents, MCP, Model Context Protocol, AI planning, agent tools, Claude, structured planning" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentplanner.io/" />
        <meta property="og:title" content="AgentPlanner - Structured Planning for OpenClaw Agents" />
        <meta property="og:description" content="Give your OpenClaw agent the power of structured planning. Create detailed plans, track progress, and execute projects through natural conversation." />
        <meta property="og:image" content="https://agentplanner.io/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://agentplanner.io/" />
        <meta property="twitter:title" content="AgentPlanner - Structured Planning for OpenClaw Agents" />
        <meta property="twitter:description" content="Give your OpenClaw agent the power of structured planning. Create detailed plans, track progress, and execute projects through natural conversation." />
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
