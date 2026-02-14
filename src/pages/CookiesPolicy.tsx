import React from 'react';
import { Link } from 'react-router-dom';

const CookiesPolicy: React.FC = () => {
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
          Cookies Policy
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. How We Use Cookies
            </h2>
            <p>We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the platform to function properly, including authentication and session management.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings such as theme preferences and language selection.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our platform so we can improve it.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Managing Cookies
            </h2>
            <p>
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. However, disabling essential cookies may affect the functionality of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Third-Party Cookies
            </h2>
            <p>
              We may use third-party services that set their own cookies, such as analytics providers. These cookies are governed by the respective third party's privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Contact Us
            </h2>
            <p>
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:support@agentplanner.io" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                support@agentplanner.io
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
