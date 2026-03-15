import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Agent Planner IO</title>
        <meta name="description" content="Privacy Policy for Agent Planner. Learn how we handle your data." />
        <link rel="canonical" href="https://agentplanner.io/privacy" />
        <meta property="og:title" content="Privacy Policy - Agent Planner IO" />
        <meta property="og:description" content="Privacy Policy for Agent Planner" />
        <meta property="og:url" content="https://agentplanner.io/privacy" />
      </Helmet>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <Link
          to="/"
          className="inline-flex items-center text-amber-600 hover:text-amber-700 dark:text-amber-400 mb-8"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Privacy Policy
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last Updated: March 14, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (email, name, password)</li>
              <li>Planning data (plans, tasks, milestones, and related content)</li>
              <li>API tokens (stored as secure hashes, never in plain text)</li>
              <li>GitHub profile information (username, avatar, profile URL) if you sign in via GitHub OAuth</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Data Storage and Security
            </h2>
            <p>
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>PostgreSQL database with row-level security</li>
              <li>Encrypted connections (HTTPS/TLS)</li>
              <li>Secure API token authentication</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p>
              We do not sell your personal data. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Your Rights and Choices
            </h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Request export of your planning data in a portable format</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:contact@talkingagents.com" className="text-amber-600 dark:text-amber-400 hover:underline">
                contact@talkingagents.com
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. AI Integration and MCP
            </h2>
            <p>
              When you use MCP (Model Context Protocol) integration with AI systems like Claude:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your planning data is accessed only with your API token</li>
              <li>Data is transmitted securely between the MCP server and our API</li>
              <li>We do not share your data with AI providers unless you explicitly configure the integration</li>
              <li>You control which plans and data are accessible to AI agents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Cookies
            </h2>
            <p>
              We only use essential cookies for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintaining your authentication session</li>
              <li>Remembering your preferences (e.g., dark mode)</li>
            </ul>
            <p className="mt-2">
              We do not use any analytics, advertising, or third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Children's Privacy
            </h2>
            <p>
              Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. GDPR and EU Data Protection Rights
            </h2>
            <p>
              If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR). We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your personal data.
            </p>
            <p className="mt-4 font-semibold">Your rights include:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Right to Access</strong> – You have the right to request copies of your personal data</li>
              <li><strong>Right to Rectification</strong> – You have the right to request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure</strong> – You have the right to request deletion of your personal data under certain conditions</li>
              <li><strong>Right to Restrict Processing</strong> – You have the right to request restriction of processing your personal data under certain conditions</li>
              <li><strong>Right to Data Portability</strong> – You have the right to request transfer of your data to another organization or directly to you</li>
              <li><strong>Right to Object</strong> – You have the right to object to our processing of your personal data under certain conditions</li>
              <li><strong>Right to Withdraw Consent</strong> – You have the right to withdraw your consent at any time where we relied on consent to process your personal data</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us using the information provided in the Contact section below. We will respond to your request within one month.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Data Controller and Processor Information
            </h2>
            <p>
              <strong>Data Controller:</strong>
            </p>
            <p className="ml-4 mt-2">
              Talking Agents Oy<br />
              Business ID: 3501123-6<br />
              Registered in Finland
            </p>
            <p className="mt-4">
              For data protection inquiries, you may contact:<br />
              Email: contact@talkingagents.com
            </p>
            <p className="mt-4">
              You also have the right to lodge a complaint with a supervisory authority, in particular in the EU member state of your habitual residence, place of work, or place of the alleged infringement.
            </p>
            <p className="mt-2">
              <strong>Finnish Data Protection Ombudsman:</strong><br />
              Website: <a href="https://tietosuoja.fi" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 dark:text-amber-400">tietosuoja.fi</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. International Data Transfers
            </h2>
            <p>
              Your personal data is primarily stored and processed within the European Economic Area (EEA). Our services are hosted on Google Cloud Platform in the europe-north1 (Finland) region to ensure data residency within the EU.
            </p>
            <p className="mt-4">
              If data is transferred outside the EEA, we ensure appropriate safeguards are in place, such as:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Data Processing Agreements with third-party service providers</li>
              <li>Adequacy decisions by the European Commission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Data Retention
            </h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <p className="mt-4">
              When you request deletion of your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain certain information for legal, tax, or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact us:
            </p>
            <p className="ml-4 mt-2">
              <strong>Talking Agents Oy</strong><br />
              Email: contact@talkingagents.com<br />
              GitHub: <a href="https://github.com/tagents" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 dark:text-amber-400">github.com/tagents</a>
            </p>
          </section>
        </div>
      </div>
    </div>
    </>
  );
};

export default PrivacyPolicy;
