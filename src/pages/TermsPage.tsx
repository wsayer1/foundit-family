import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mb-8">
            Last updated: January 2026
          </p>

          <div className="prose prose-stone dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                By accessing or using Foundit.Family, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                2. Description of Service
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Foundit.Family is a community platform that allows users to share and discover free curbside items in their neighborhood. We facilitate connections between people giving away items and those looking for them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                3. User Accounts
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                To use certain features of our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                4. User Content
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                You retain ownership of content you post. By posting content, you grant us a non-exclusive, royalty-free license to use, display, and distribute your content on our platform. You agree not to post content that:
              </p>
              <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 ml-4">
                <li>Is illegal, harmful, or offensive</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains false or misleading information</li>
                <li>Violates the privacy of others</li>
                <li>Advertises commercial products or services for sale</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                5. Prohibited Uses
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 ml-4">
                <li>Use the service for any unlawful purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate others or provide false information</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated methods to access the service</li>
                <li>Interfere with or disrupt the service</li>
                <li>Post items for sale (all items must be free)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                6. Item Listings
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                When posting items, you agree that:
              </p>
              <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 ml-4">
                <li>All items must be offered for free</li>
                <li>You have the right to give away the item</li>
                <li>Item descriptions must be accurate</li>
                <li>Location information must be reasonably accurate</li>
                <li>Items must be legal to give away</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                7. Safety and Liability
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                We do not verify the safety, quality, or condition of items posted. Users assume all risks associated with picking up or giving away items. We recommend meeting in safe, public locations when possible. We are not responsible for any damages, injuries, or losses that occur from using our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                The Foundit.Family name, logo, and all related graphics, software, and service marks are our property or the property of our licensors. You may not use these without our written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                9. Termination
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. You may also delete your account at any time through your profile settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                10. Disclaimer of Warranties
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Our service is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                11. Limitation of Liability
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                12. Changes to Terms
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                We may modify these terms at any time. We will notify users of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                13. Contact Us
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through the feedback feature in the app.
              </p>
            </section>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/privacy"
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
