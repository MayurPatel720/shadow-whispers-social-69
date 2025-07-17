
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-purple-300 hover:text-purple-200 hover:bg-purple-800/30"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="border-purple-700/50 bg-black/40 backdrop-blur-md text-gray-100">
          <CardHeader className="text-center border-b border-purple-800/30 pb-6">
            <CardTitle className="text-3xl font-bold text-purple-400">
              Terms and Conditions
            </CardTitle>
            <p className="text-gray-400 mt-2">
              <strong>Effective Date:</strong> July 14, 2025<br />
              <strong>Website:</strong> <a href="http://underkover.in" className="text-purple-300 hover:underline">http://underkover.in</a>
            </p>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300">
                Welcome to UnderKover. These Terms and Conditions ("Terms") govern your use of our website and mobile app ("Platform"). By accessing or using UnderKover, you agree to comply with these Terms. If you do not agree, please do not use our services.
              </p>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">1. Who Can Use UnderKover</h2>
                <p className="text-gray-300">To use UnderKover, you must:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Be at least 16 years old</li>
                  <li>Agree to comply with these Terms and our <Link to="/privacy-policy" className="text-purple-300 hover:underline">Privacy Policy</Link></li>
                  <li>Use the platform only for lawful, respectful, and non-harmful purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">2. Your Responsibilities as a User</h2>
                <p className="text-gray-300">By using UnderKover, you agree:</p>
                <p className="text-gray-300 font-medium">Not to post or share:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Nude images or sexually explicit content</li>
                  <li>Content involving minors in any sexual context (zero tolerance)</li>
                  <li>Hate speech, racism, or abusive language</li>
                  <li>Threats, harassment, or bullying</li>
                  <li>Spam, scams, or misleading/fake information</li>
                  <li>Content that violates any applicable law (e.g., drugs, terrorism, violence)</li>
                </ul>
                <p className="text-gray-300 mt-3">You are <strong>fully and solely responsible</strong> for all content you post or share on UnderKover.</p>
                <p className="text-gray-300">UnderKover is an <strong>anonymous platform</strong>, but we <strong>log and track IPs and device information</strong> when required by law for abuse prevention.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">3. Platform Rights and Moderation</h2>
                <p className="text-gray-300">UnderKover reserves the right to:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Monitor content for violations</li>
                  <li>Remove or block any content that violates these Terms</li>
                  <li>Suspend or permanently ban users at our sole discretion</li>
                </ul>
                <p className="text-gray-300 mt-3">We may <strong>cooperate with law enforcement</strong> if illegal activity is reported or suspected.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">4. Dating Feature</h2>
                <p className="text-gray-300">If you choose to use the optional dating feature:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>You must use accurate and respectful information</li>
                  <li>UnderKover is not responsible for any communication or outcome between matched users</li>
                  <li>We do not screen or verify dating profiles</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">5. Account Security</h2>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Keep your login details private and secure</li>
                  <li>You are responsible for any activity under your account</li>
                  <li>If you suspect unauthorized access, notify us immediately</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">6. Subscription and Payments</h2>
                <p className="text-gray-300">Some features may require a paid subscription:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Payments are handled securely via <strong>Razorpay</strong></li>
                  <li>Prices and fees will be clearly shown before purchase</li>
                  <li>No refunds are provided unless legally required</li>
                  <li>Cancelling a subscription stops renewal but does not grant a refund for past payments</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">7. Account Deletion and Data</h2>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>You may delete your account anytime</li>
                  <li>Upon deletion, all your personal data and content will be <strong>permanently removed</strong></li>
                  <li>See our <Link to="/privacy-policy" className="text-purple-300 hover:underline">Privacy Policy</Link> for full details</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">8. Intellectual Property</h2>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>You retain rights to your original content</li>
                  <li>By posting, you grant UnderKover a license to display your content as part of the platform</li>
                </ul>
                <p className="text-gray-300 mt-3">You may not:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Copy or distribute content posted by other users</li>
                  <li>Use our logos, branding, or platform design without permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">9. Disclaimer of Liability</h2>
                <p className="text-gray-300">UnderKover provides the platform <strong>"as is"</strong>, without warranties of any kind.</p>
                <p className="text-gray-300 mt-3">We are <strong>not responsible or liable</strong> for:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>User-generated content, including offensive or illegal material</li>
                  <li>Any harm, damage, or loss arising from the use of our app or content posted by others</li>
                  <li>Content or conduct of other users, including during dating interactions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">10. Limitation of Liability</h2>
                <p className="text-gray-300">To the fullest extent permitted by law, UnderKover and its owners will not be liable for:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Any indirect, incidental, or consequential damages</li>
                  <li>Loss of data, reputation, or income</li>
                  <li>Harm caused by interactions or user content</li>
                </ul>
                <p className="text-gray-300 mt-3">You use UnderKover at your <strong>own risk</strong>.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">11. Indemnity</h2>
                <p className="text-gray-300">You agree to <strong>indemnify and hold harmless</strong> UnderKover and its team from any claims, damages, or liabilities that arise from:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>Your use of the app</li>
                  <li>Your violation of these Terms</li>
                  <li>Any content you post or share</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">12. Governing Law</h2>
                <p className="text-gray-300">These Terms are governed by the laws of <strong>India</strong>. Any disputes shall be resolved in the courts of India.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">13. Updates to Terms</h2>
                <p className="text-gray-300">We may update these Terms as needed. When we do:</p>
                <ul className="list-disc list-inside text-gray-300 ml-4 space-y-1">
                  <li>We'll post the changes on our website</li>
                  <li>If major changes are made, we may notify you via app or email</li>
                </ul>
                <p className="text-gray-300 mt-3">Continued use after changes means you accept the new Terms.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-purple-300 mb-3">14. Contact Us</h2>
                <p className="text-gray-300">Questions or legal inquiries?</p>
                <p className="text-gray-300 mt-2">
                  <strong>Website:</strong> <a href="http://underkover.in" className="text-purple-300 hover:underline">http://underkover.in</a>
                </p>
              </section>

              <div className="mt-8 p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
                <p className="text-gray-300 text-center">
                  Thank you for using UnderKover. We are committed to creating a safe, respectful, and anonymous space for all users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
