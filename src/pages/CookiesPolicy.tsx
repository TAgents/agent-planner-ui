import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const CookiesPolicy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Cookies Policy - Agent Planner IO</title>
        <meta name="description" content="Cookies Policy for Agent Planner. Learn about the cookies we use." />
        <link rel="canonical" href="https://agentplanner.io/cookies" />
        <meta property="og:title" content="Cookies Policy - Agent Planner IO" />
        <meta property="og:description" content="Cookies Policy for Agent Planner" />
        <meta property="og:url" content="https://agentplanner.io/cookies" />
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
          Cookies Policy
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last Updated: March 14, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Cookies We Use
            </h2>
            <p>We only use cookies that are strictly necessary for the platform to function. We do not use any analytics or tracking cookies.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Authentication Cookies:</strong> Required to keep you logged in and manage your session securely.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings such as theme preferences (e.g., dark mode). These are stored locally in your browser and are not sent to our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Managing Cookies
            </h2>
            <p>
              You can control cookies through your browser settings. However, disabling essential cookies will prevent you from logging in and using the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Third-Party Cookies
            </h2>
            <p>
              We do not use any third-party cookies. No analytics, advertising, or tracking services are embedded in our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Contact Us
            </h2>
            <p>
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:support@agentplanner.io" className="text-amber-600 dark:text-amber-400 hover:underline">
                support@agentplanner.io
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
    </>
  );
};

export default CookiesPolicy;
