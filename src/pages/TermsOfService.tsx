import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 mb-8"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Terms of Service
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Agent Planner IO ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily use the Service for personal and commercial planning purposes. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. User Data
            </h2>
            <p>
              You retain all rights to your data. We store your planning data securely and will not share it with third parties except as required by law or with your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. API and MCP Usage
            </h2>
            <p>
              The Service provides API and MCP (Model Context Protocol) access. You agree to use these interfaces responsibly and not to exceed reasonable usage limits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Prohibited Uses
            </h2>
            <p>
              You may not use the Service:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>For any unlawful purpose</li>
              <li>To violate any regulations or laws</li>
              <li>To infringe upon or violate our intellectual property rights</li>
              <li>To transmit any worms, viruses, or malicious code</li>
              <li>To spam, phish, or conduct any automated data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Service Availability
            </h2>
            <p>
              We strive to provide continuous service availability but do not guarantee that the Service will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Modifications to Service
            </h2>
            <p>
              We reserve the right to modify or discontinue the Service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Limitation of Liability
            </h2>
            <p>
              In no event shall Agent Planner IO be liable for any damages arising out of the use or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. EU Consumer Rights
            </h2>
            <p>
              If you are a consumer in the European Union, you have specific rights under EU consumer protection law:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to withdraw from paid subscriptions within 14 days of purchase (cooling-off period)</li>
              <li>Right to clear and transparent pricing information</li>
              <li>Right to dispute resolution through EU online dispute resolution platform</li>
              <li>Right to fair contract terms that comply with EU consumer protection directives</li>
            </ul>
            <p className="mt-4">
              For dispute resolution, you may use the EU Online Dispute Resolution platform at: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">ec.europa.eu/consumers/odr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Governing Law and Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Finland, without regard to its conflict of law provisions.
            </p>
            <p className="mt-4">
              Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Finland. However, if you are a consumer in the EU, you may also bring proceedings in the courts of your country of residence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Service Provider Information
            </h2>
            <p>
              <strong>Talking Agents Oy</strong><br />
              Business ID: 3501123-6<br />
              Registered in Finland<br />
              VAT registered (if applicable)
            </p>
            <p className="mt-4">
              Email: support@agentplanner.io<br />
              Website: <a href="https://agentplanner.io" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">agentplanner.io</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Contact Information
            </h2>
            <p>
              For questions about these Terms of Service, please contact us:
            </p>
            <p className="ml-4 mt-2">
              <strong>Talking Agents Oy</strong><br />
              Email: support@agentplanner.io<br />
              Legal inquiries: legal@agentplanner.io<br />
              GitHub: <a href="https://github.com/tagents" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">github.com/tagents</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
