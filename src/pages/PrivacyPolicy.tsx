
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-purple-500">Privacy Policy</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="space-y-6">
              <div className="text-center border-b border-border pb-4">
                <h2 className="text-2xl font-bold text-purple-500 mb-2">
                  Privacy Policy for UnderKover – Anonymous Social Media
                </h2>
                <p className="text-muted-foreground">
                  <strong>Effective Date:</strong> July 14, 2025<br />
                  <strong>Website URL:</strong>{' '}
                  <a href="http://underkover.in" className="text-purple-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    http://underkover.in
                  </a>
                </p>
                <p className="mt-4">
                  Welcome to UnderKover – Anonymous Social Media. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal data in compliance with the <strong>General Data Protection Regulation (GDPR)</strong>.
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">1. Who We Are</h3>
                <p>
                  UnderKover is an anonymous social media platform designed for college students, teenagers, introverts, and anyone who wants to express themselves privately. We are based in India and serve users worldwide.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">2. What Personal Data We Collect</h3>
                <p>We may collect the following information from you:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Name</strong> (required)</li>
                  <li><strong>Email address</strong> (required)</li>
                  <li><strong>Gender</strong> (optional; used only if you enable the dating feature)</li>
                  <li><strong>Device and usage information</strong> (via Google Analytics)</li>
                  <li><strong>Notification preferences</strong></li>
                  <li><strong>Payment data</strong> (processed by Razorpay)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">3. How We Use Your Data</h3>
                <p>We use your personal data for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>To create and manage your account</li>
                  <li>To send app updates, newsletters, and marketing emails</li>
                  <li>To improve the app based on usage patterns and research</li>
                  <li>To provide features like anonymous posts and dating (if enabled)</li>
                  <li>To process payments (via Razorpay)</li>
                </ul>
                <p className="mt-2">
                  You can unsubscribe from newsletters at any time using the link provided in the email.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">4. Legal Basis for Processing</h3>
                <p>Under GDPR, we process your data on the following legal bases:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Consent</strong>: For newsletters, optional features, and marketing.</li>
                  <li><strong>Contract</strong>: To provide the services you request.</li>
                  <li><strong>Legitimate interests</strong>: To improve app performance and ensure safety.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">5. How We Obtain Consent</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You provide consent when signing up and using the app.</li>
                  <li>We ask for optional data (like gender) only when relevant.</li>
                  <li>You can withdraw consent anytime by contacting us or using the in-app options.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">6. Your GDPR Rights</h3>
                <p>If you are located in the EU or UK, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access</strong> your personal data</li>
                  <li><strong>Correct</strong> inaccurate information</li>
                  <li><strong>Delete</strong> your account and all personal data permanently</li>
                  <li><strong>Object</strong> to processing</li>
                  <li><strong>Restrict</strong> processing in some cases</li>
                  <li><strong>Transfer</strong> your data to another service provider</li>
                </ul>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-green-400 mb-2">✅ Permanent Deletion Support</h4>
                  <p>
                    If you delete your account, <strong>all your personal data is permanently removed</strong> from our systems, in accordance with GDPR Article 17 ("Right to be Forgotten"). This includes all identifying information and content tied to your profile.
                  </p>
                </div>
                <p className="mt-4">
                  To make a request or exercise your rights, email us at: <strong>support@underkover.in</strong>
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">7. Data Retention</h3>
                <p>
                  We keep your data only as long as your account is active. If you delete your account, <strong>all associated data is fully and permanently deleted</strong> within a reasonable time frame (typically 7–14 days).
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">8. Third Parties and Data Sharing</h3>
                <p>We may share limited information with trusted service providers:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Razorpay</strong> – to process subscriptions and payments</li>
                  <li><strong>Google Analytics</strong> – to track usage and improve user experience</li>
                </ul>
                <p className="mt-2">
                  These providers are GDPR-compliant and are contractually bound to protect your data.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">9. International Data Transfers</h3>
                <p>
                  Your data may be processed outside your country, including in India, where our servers are based. If you are an EU/UK user, we apply appropriate safeguards to ensure your data remains protected according to GDPR standards.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">10. Cookies and Tracking</h3>
                <p>
                  We use <strong>Google Analytics cookies</strong> to understand how users engage with UnderKover. These cookies do <strong>not</strong> collect identifiable personal information. You can manage or block cookies in your browser settings.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">11. Data Security</h3>
                <p>We take your privacy seriously and protect your data through:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Encryption</strong> of personal and communication data</li>
                  <li><strong>Secure storage</strong> with access controls</li>
                  <li><strong>Regular system reviews</strong> and audits</li>
                  <li>Use of <strong>trusted, GDPR-compliant</strong> service providers</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">12. Changes to This Policy</h3>
                <p>We may update this policy to reflect new features, legal requirements, or user feedback. If we make significant changes, we will notify you via:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>A notice in the app or website</li>
                  <li>Email (if you've provided one)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">13. Contact Us</h3>
                <p>
                  If you have any questions, concerns, or requests about your data or this policy, please reach out to us:
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> support@underkover.in<br />
                  <strong>Website:</strong>{' '}
                  <a href="http://underkover.in" className="text-purple-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    http://underkover.in
                  </a>
                </p>
              </section>

              <div className="text-center border-t border-border pt-6 mt-8">
                <p className="text-muted-foreground">
                  Thank you for using UnderKover. We are committed to protecting your privacy while giving you a safe space to express yourself.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
