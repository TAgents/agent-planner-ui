import React from 'react';
import { Helmet } from 'react-helmet-async';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import WhyDifferentSection from '../components/landing/WhyDifferentSection';
import ProductFlowSection from '../components/landing/ProductFlowSection';
import UseCasesSection from '../components/landing/UseCasesSection';
import DifferentiationSection from '../components/landing/DifferentiationSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import Footer from '../components/landing/Footer';

const Landing: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AgentPlanner — Turn repeatable work into live workspaces with agents</title>
        <meta
          name="description"
          content="Fork reusable Blueprints into live Workspaces, link goals and plans inside them, and run execution with humans and AI agents in one system."
        />
        <meta
          name="keywords"
          content="workspace, blueprint, AI agents, planning, agent orchestration, MCP, Model Context Protocol, repeatable workflows, operating system for work"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentplanner.io/" />
        <meta property="og:title" content="AgentPlanner — Turn repeatable work into live workspaces with agents" />
        <meta
          property="og:description"
          content="Fork reusable Blueprints into live Workspaces. Run with humans and AI agents in one system."
        />
        <meta property="og:image" content="https://agentplanner.io/og-image.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://agentplanner.io/" />
      </Helmet>

      <div className="min-h-screen bg-bg font-body text-text">
        <LandingHeader />
        <HeroSection />
        <WhyDifferentSection />
        <ProductFlowSection />
        <UseCasesSection />
        <DifferentiationSection />
        <FinalCtaSection />
        <Footer />
      </div>
    </>
  );
};

export default Landing;
