import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Privacy Policy
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mb-8">
            Last updated: January 2026
          </p>

          <div className="prose prose-stone dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                1. Introduction
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Welcome to Foundit.Family. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                2. Information We Collect
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 ml-4">
                <li>Account information (email address, display name)</li>
                <li>Profile information (avatar)</li>
                <li>Content you post (photos, descriptions of items)</li>
                <li>Location data when you choose to share it</li>
                <li>Feedback and bug reports you submit</li>
                <li>Usage data (items posted, claimed, and confirmed)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Display items near your location</li>
                <li>Track your contributions and award points</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your feedback and bug reports</li>
                <li>Detect and prevent fraudulent activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                4. Location Data
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                When you post an item, we collect the location where the item was found. This location is displayed to other users so they can find the item. Your precise real-time location is only used locally on your device to calculate distances and is never stored on our servers unless you explicitly post an item.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                5. Information Sharing
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 ml-4">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                6. Data Security
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                7. Your Rights
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data (via profile settings)</li>
                <li>Request deletion of your data by contacting us</li>
                <li>Delete your own posted items at any time</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                8. Cookies and Tracking
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                11. Contact Us
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through the feedback feature in the app.
              </p>
            </section>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/tos"
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
