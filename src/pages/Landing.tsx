import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/landing/HeroSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import Footer from '../components/landing/Footer';

const Landing: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AgentPlanner — Structured planning backend for AI agents</title>
        <meta
          name="description"
          content="Hierarchical plans, dependency tracking, knowledge graph, and real-time sync for AI agents. Connect via MCP or REST API."
        />
        <meta name="keywords" content="MCP, Model Context Protocol, AI agents, planning, agent tools, structured planning" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentplanner.io/" />
        <meta property="og:title" content="AgentPlanner — Structured planning backend for AI agents" />
        <meta property="og:description" content="Hierarchical plans, dependency tracking, knowledge graph, and real-time sync for AI agents. Connect via MCP or REST API." />
        <meta property="og:image" content="https://agentplanner.io/og-image.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://agentplanner.io/" />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <HeroSection />
        <SocialProofSection />
        <FeaturesSection />
        <Footer />
      </div>
    </>
  );
};

export default Landing;
