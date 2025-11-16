import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/landing/HeroSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import GettingStartedSection from '../components/landing/GettingStartedSection';
import Footer from '../components/landing/Footer';
import Navigation from '../components/navigation/Navigation';

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
        <title>Agent Planner IO - Collaborative Planning for Humans and AI Agents</title>
        <meta
          name="description"
          content="Agent Planner IO is a collaborative planning system enabling seamless interaction between humans and AI agents via MCP (Model Context Protocol). Plan smarter, together."
        />
        <meta name="keywords" content="AI planning, MCP, Model Context Protocol, collaborative planning, AI agents, Claude integration" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentplanner.io/" />
        <meta property="og:title" content="Agent Planner IO - Collaborative Planning for Humans and AI Agents" />
        <meta property="og:description" content="Agent Planner IO is a collaborative planning system enabling seamless interaction between humans and AI agents via MCP." />
        <meta property="og:image" content="https://agentplanner.io/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://agentplanner.io/" />
        <meta property="twitter:title" content="Agent Planner IO - Collaborative Planning for Humans and AI Agents" />
        <meta property="twitter:description" content="Agent Planner IO is a collaborative planning system enabling seamless interaction between humans and AI agents via MCP." />
        <meta property="twitter:image" content="https://agentplanner.io/og-image.png" />

        <link rel="canonical" href="https://agentplanner.io/" />
      </Helmet>

      {/* Top Navigation Bar */}
      <Navigation />

      <div className="min-h-screen bg-white overflow-x-hidden">
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
