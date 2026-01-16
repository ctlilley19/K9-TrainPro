'use client';

import Link from 'next/link';
import { Dog, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 16, 2025';
  const effectiveDate = 'January 16, 2025';

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-amber">
                <Dog size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">K9 ProTrain</span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <div className="flex flex-wrap gap-4 text-sm text-surface-400">
              <span>Last Updated: {lastUpdated}</span>
              <span>|</span>
              <span>Effective Date: {effectiveDate}</span>
            </div>
          </div>

          <div className="prose prose-invert prose-surface max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  Lazy E Holdings LLC ("Company," "we," "us," or "our") operates K9 ProTrain, a comprehensive dog training management platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website at k9protrain.com, mobile applications, and related services (collectively, the "Service").
                </p>
                <p>
                  We are committed to protecting your privacy and handling your personal information with care. Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our policies and practices, please do not use the Service.
                </p>
                <p>
                  This Privacy Policy is incorporated into and subject to our <Link href="/terms" className="text-brand-400 hover:text-brand-300 underline">Terms of Service</Link>.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">2.1 Information You Provide Directly</h3>
                <p>We collect information that you voluntarily provide when using the Service:</p>

                <h4 className="text-md font-medium text-white mt-4">Account Information</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name (first and last)</li>
                  <li>Email address</li>
                  <li>Password (encrypted)</li>
                  <li>Phone number (optional)</li>
                  <li>Profile photo (optional)</li>
                  <li>Business name and information (for trainers/facilities)</li>
                  <li>Professional credentials and certifications</li>
                </ul>

                <h4 className="text-md font-medium text-white mt-4">Dog Profile Information</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dog name, breed, age, and physical characteristics</li>
                  <li>Medical and vaccination records (as provided by you)</li>
                  <li>Training history and behavioral notes</li>
                  <li>Photos and videos of dogs</li>
                  <li>Emergency contact information</li>
                  <li>Veterinarian information</li>
                </ul>

                <h4 className="text-md font-medium text-white mt-4">Training and Activity Data</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Training session logs and notes</li>
                  <li>Activity records and progress tracking</li>
                  <li>Homework assignments and completion status</li>
                  <li>Daily reports and updates</li>
                  <li>Badges and achievements earned</li>
                  <li>Certificates generated</li>
                </ul>

                <h4 className="text-md font-medium text-white mt-4">Communications</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Messages sent through the platform</li>
                  <li>Support tickets and correspondence</li>
                  <li>Feedback and survey responses</li>
                </ul>

                <h4 className="text-md font-medium text-white mt-4">Payment Information</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Billing address</li>
                  <li>Payment method details (processed securely by Stripe; we do not store full card numbers)</li>
                  <li>Transaction history</li>
                  <li>Subscription information</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">2.2 Information Collected Automatically</h3>
                <p>When you use the Service, we automatically collect certain information:</p>

                <h4 className="text-md font-medium text-white mt-4">Device and Technical Information</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device type, model, and operating system</li>
                  <li>Browser type and version</li>
                  <li>IP address</li>
                  <li>Unique device identifiers</li>
                  <li>Screen resolution and color depth</li>
                  <li>Language and time zone settings</li>
                </ul>

                <h4 className="text-md font-medium text-white mt-4">Usage Information</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pages and features accessed</li>
                  <li>Time spent on pages</li>
                  <li>Click patterns and navigation paths</li>
                  <li>Referring URLs and exit pages</li>
                  <li>Search queries within the Service</li>
                  <li>Error logs and crash reports</li>
                </ul>

                <h4 className="text-md font-medium text-white mt-4">Location Information</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Approximate geographic location derived from IP address</li>
                  <li>Precise location (only if you enable location services and grant permission)</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">2.3 Information from Third Parties</h3>
                <p>We may receive information from third-party sources:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Social login providers:</strong> If you sign in using Google, Apple, or other social providers, we receive basic profile information they share with us.</li>
                  <li><strong className="text-white">Payment processors:</strong> Transaction confirmation and payment status from Stripe.</li>
                  <li><strong className="text-white">Analytics providers:</strong> Aggregated usage statistics and insights.</li>
                  <li><strong className="text-white">Trainers/Facilities:</strong> If you are a pet parent, trainers may add information about you and your dog to the platform.</li>
                </ul>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Cookies and Tracking Technologies</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">3.1 Types of Technologies Used</h3>
                <p>We use the following technologies to collect information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Cookies:</strong> Small text files stored on your device that help us remember your preferences and authenticate your sessions.</li>
                  <li><strong className="text-white">Local Storage:</strong> Browser storage used to save app state and preferences locally.</li>
                  <li><strong className="text-white">Web Beacons:</strong> Small graphic images used in emails to track open rates and engagement.</li>
                  <li><strong className="text-white">Analytics Tools:</strong> Third-party analytics services to understand how users interact with the Service.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">3.2 Categories of Cookies</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-surface-700 rounded-lg">
                    <thead className="bg-surface-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-white">Category</th>
                        <th className="px-4 py-3 text-left text-white">Purpose</th>
                        <th className="px-4 py-3 text-left text-white">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-700">
                      <tr>
                        <td className="px-4 py-3 font-medium">Essential</td>
                        <td className="px-4 py-3">Required for basic site functionality and security</td>
                        <td className="px-4 py-3">Session/Persistent</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Functional</td>
                        <td className="px-4 py-3">Remember your preferences and settings</td>
                        <td className="px-4 py-3">Up to 1 year</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Analytics</td>
                        <td className="px-4 py-3">Understand usage patterns and improve the Service</td>
                        <td className="px-4 py-3">Up to 2 years</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Marketing</td>
                        <td className="px-4 py-3">Deliver relevant advertisements (if applicable)</td>
                        <td className="px-4 py-3">Up to 1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-medium text-white mt-6">3.3 Managing Cookies</h3>
                <p>
                  You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. However, blocking certain cookies may affect the functionality of the Service. Please note that cookie preferences are browser-specific, so you'll need to set your preferences for each browser and device you use.
                </p>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. How We Use Your Information</h2>
              <div className="text-surface-300 space-y-4">
                <p>We use the information we collect for the following purposes:</p>

                <h3 className="text-lg font-medium text-white">4.1 Providing and Improving the Service</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create and manage your account</li>
                  <li>Provide dog training management features</li>
                  <li>Generate reports, certificates, and badges</li>
                  <li>Enable communication between trainers and pet parents</li>
                  <li>Process payments and subscriptions</li>
                  <li>Provide customer support</li>
                  <li>Analyze usage patterns to improve features</li>
                  <li>Fix bugs and resolve technical issues</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">4.2 Communications</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Send transactional emails (account verification, password reset, receipts)</li>
                  <li>Send service-related notifications (training updates, daily reports)</li>
                  <li>Send marketing communications (with your consent, where required)</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Send important updates about the Service or these policies</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">4.3 Security and Compliance</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Detect and prevent fraud, abuse, and security threats</li>
                  <li>Authenticate users and protect accounts</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Comply with legal obligations</li>
                  <li>Respond to legal requests and prevent harm</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">4.4 Analytics and Research</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Analyze trends and usage patterns</li>
                  <li>Conduct research to improve dog training outcomes</li>
                  <li>Generate aggregated, de-identified insights</li>
                  <li>Measure the effectiveness of our features</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">4.5 Personalization</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Customize your experience based on your preferences</li>
                  <li>Provide relevant feature recommendations</li>
                  <li>Remember your settings and recent activity</li>
                </ul>
              </div>
            </section>

            {/* Legal Bases */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Legal Bases for Processing (GDPR)</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we rely on the following legal bases to process your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Contract Performance:</strong> Processing necessary to perform our contract with you (e.g., providing the Service, processing payments).</li>
                  <li><strong className="text-white">Legitimate Interests:</strong> Processing necessary for our legitimate business interests (e.g., improving the Service, security, fraud prevention), where those interests are not overridden by your rights.</li>
                  <li><strong className="text-white">Consent:</strong> Processing based on your specific consent (e.g., marketing emails, optional features).</li>
                  <li><strong className="text-white">Legal Obligation:</strong> Processing necessary to comply with applicable laws and regulations.</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Information Sharing and Disclosure</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>

                <h3 className="text-lg font-medium text-white">6.1 With Your Consent</h3>
                <p>
                  We share information when you direct us to do so. For example, when you share training reports with pet parents or connect with third-party integrations.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">6.2 Between Platform Users</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Trainers and Pet Parents:</strong> Training data, reports, photos, and communications are shared between connected trainers and pet parents as part of the core Service functionality.</li>
                  <li><strong className="text-white">Facility Staff:</strong> Within a facility, staff members may access dog profiles and training records as authorized by the facility administrator.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">6.3 Service Providers</h3>
                <p>We share information with third-party service providers who perform services on our behalf:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Cloud Hosting:</strong> Supabase (database and authentication)</li>
                  <li><strong className="text-white">Payment Processing:</strong> Stripe (payment transactions)</li>
                  <li><strong className="text-white">Email Services:</strong> For transactional and marketing emails</li>
                  <li><strong className="text-white">Analytics:</strong> Usage analytics and monitoring</li>
                  <li><strong className="text-white">Customer Support:</strong> Help desk and ticketing systems</li>
                </ul>
                <p className="mt-2">
                  These providers are contractually obligated to protect your information and use it only for the purposes we specify.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">6.4 Legal Requirements</h3>
                <p>We may disclose information when we believe in good faith that disclosure is necessary to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Comply with applicable laws, regulations, or legal processes;</li>
                  <li>Respond to valid legal requests (subpoenas, court orders, government requests);</li>
                  <li>Protect the rights, property, or safety of K9 ProTrain, our users, or others;</li>
                  <li>Detect, prevent, or address fraud, security, or technical issues.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">6.5 Business Transfers</h3>
                <p>
                  If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any change in ownership or uses of your personal information.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">6.6 Aggregated or De-Identified Data</h3>
                <p>
                  We may share aggregated or de-identified information that cannot reasonably be used to identify you. For example, we may share statistics about platform usage or dog training trends.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide the Service and maintain your account;</li>
                  <li>Comply with our legal obligations;</li>
                  <li>Resolve disputes and enforce agreements;</li>
                  <li>Support business operations that cannot reasonably be deleted.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">7.1 Retention Periods</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-surface-700 rounded-lg">
                    <thead className="bg-surface-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-white">Data Type</th>
                        <th className="px-4 py-3 text-left text-white">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-700">
                      <tr>
                        <td className="px-4 py-3">Account Information</td>
                        <td className="px-4 py-3">Duration of account + 90 days after deletion</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Training Records</td>
                        <td className="px-4 py-3">Duration of account + 90 days (or as required by facility)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Payment Records</td>
                        <td className="px-4 py-3">7 years (as required for tax and legal compliance)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Support Communications</td>
                        <td className="px-4 py-3">3 years after resolution</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Analytics Data</td>
                        <td className="px-4 py-3">26 months (anonymized thereafter)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Security/Audit Logs</td>
                        <td className="px-4 py-3">1-3 years depending on log type</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-medium text-white mt-6">7.2 Account Deletion</h3>
                <p>
                  When you delete your account, we will delete or anonymize your personal information within 90 days, except where retention is required by law or for legitimate business purposes.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data Security</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our security measures include:
                </p>

                <h3 className="text-lg font-medium text-white">8.1 Technical Safeguards</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit using TLS/SSL</li>
                  <li>Encryption of sensitive data at rest</li>
                  <li>Secure password hashing (bcrypt)</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Web application firewalls and DDoS protection</li>
                  <li>Automated vulnerability scanning</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">8.2 Organizational Safeguards</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Role-based access controls and principle of least privilege</li>
                  <li>Employee training on data protection and security</li>
                  <li>Background checks for employees with access to personal data</li>
                  <li>Incident response procedures</li>
                  <li>Vendor security assessments</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">8.3 Admin Access Controls</h3>
                <p>
                  Administrative access to user data is strictly controlled. All administrative actions are logged and audited. Admin staff cannot browse user accounts; they can only access specific data with documented business justification.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">8.4 Your Security Responsibilities</h3>
                <p>
                  While we work to protect your information, no system is completely secure. You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>Using strong, unique passwords</li>
                  <li>Enabling two-factor authentication when available</li>
                  <li>Reporting any suspected unauthorized access immediately</li>
                </ul>
              </div>
            </section>

            {/* Your Privacy Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Your Privacy Rights</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>

                <h3 className="text-lg font-medium text-white">9.1 General Rights</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Access:</strong> Request a copy of the personal information we hold about you.</li>
                  <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete information.</li>
                  <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements.</li>
                  <li><strong className="text-white">Portability:</strong> Request your data in a structured, commonly used, machine-readable format.</li>
                  <li><strong className="text-white">Withdraw Consent:</strong> Withdraw previously given consent for processing.</li>
                  <li><strong className="text-white">Opt-Out:</strong> Opt out of marketing communications at any time.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">9.2 How to Exercise Your Rights</h3>
                <p>
                  To exercise your privacy rights, you can:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Update your information through your account settings</li>
                  <li>Contact us at privacy@k9protrain.com</li>
                  <li>Submit a request through our support portal</li>
                </ul>
                <p className="mt-4">
                  We will respond to your request within 30 days. We may need to verify your identity before processing certain requests. If we cannot fulfill a request, we will explain why.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">9.3 Marketing Opt-Out</h3>
                <p>
                  You can opt out of marketing emails by clicking the "unsubscribe" link in any marketing email, or by updating your preferences in your account settings. Note that you will still receive transactional and service-related communications.
                </p>
              </div>
            </section>

            {/* California Privacy Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. California Privacy Rights (CCPA/CPRA)</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA):
                </p>

                <h3 className="text-lg font-medium text-white">10.1 Right to Know</h3>
                <p>
                  You have the right to know what personal information we collect, use, disclose, and sell (if applicable).
                </p>

                <h3 className="text-lg font-medium text-white mt-6">10.2 Right to Delete</h3>
                <p>
                  You have the right to request deletion of your personal information, with certain exceptions.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">10.3 Right to Correct</h3>
                <p>
                  You have the right to correct inaccurate personal information.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">10.4 Right to Opt-Out of Sale/Sharing</h3>
                <p>
                  <strong className="text-white">We do not sell your personal information.</strong> We do not share personal information for cross-context behavioral advertising.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">10.5 Right to Limit Use of Sensitive Personal Information</h3>
                <p>
                  You have the right to limit our use of sensitive personal information to only what is necessary to provide the Service.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">10.6 Non-Discrimination</h3>
                <p>
                  We will not discriminate against you for exercising your privacy rights.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">10.7 Categories of Information Collected</h3>
                <p>In the preceding 12 months, we have collected the following categories of personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Identifiers (name, email, IP address)</li>
                  <li>Commercial information (transaction history, subscriptions)</li>
                  <li>Internet/electronic network activity (usage data, browsing history within the Service)</li>
                  <li>Geolocation data (approximate location from IP)</li>
                  <li>Professional/employment information (for trainers)</li>
                  <li>Inferences (preferences, characteristics derived from other information)</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">10.8 Shine the Light</h3>
                <p>
                  California Civil Code Section 1798.83 permits California residents to request information regarding disclosure of personal information to third parties for direct marketing purposes. We do not disclose personal information to third parties for their direct marketing purposes.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">10.9 How to Submit a Request</h3>
                <p>
                  California residents can submit CCPA requests by emailing privacy@k9protrain.com or calling (833) K9-TRAIN. We may verify your identity using the information associated with your account.
                </p>
              </div>
            </section>

            {/* EEA/UK Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. European Privacy Rights (GDPR)</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have additional rights under the General Data Protection Regulation (GDPR):
                </p>

                <h3 className="text-lg font-medium text-white">11.1 Additional Rights</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Right to Object:</strong> Object to processing based on legitimate interests.</li>
                  <li><strong className="text-white">Right to Restrict:</strong> Request restriction of processing in certain circumstances.</li>
                  <li><strong className="text-white">Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">11.2 Data Controller</h3>
                <p>
                  Lazy E Holdings LLC is the data controller responsible for your personal information. For questions about data processing, contact our Data Protection contact at privacy@k9protrain.com.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">11.3 International Transfers</h3>
                <p>
                  Your information may be transferred to and processed in the United States. We ensure appropriate safeguards for international transfers, including Standard Contractual Clauses approved by the European Commission.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. International Data Transfers</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  K9 ProTrain is operated from the United States. If you are located outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located and our databases are operated.
                </p>
                <p>
                  The data protection laws of the United States may differ from those of your country. By using the Service, you consent to the transfer of your information to the United States.
                </p>
                <p>
                  Where required, we implement appropriate safeguards for cross-border transfers, such as:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Standard Contractual Clauses approved by the European Commission</li>
                  <li>Binding Corporate Rules (where applicable)</li>
                  <li>Other legally recognized transfer mechanisms</li>
                </ul>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Children's Privacy</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  The Service is not directed to children under 13 years of age (or 16 in certain jurisdictions). We do not knowingly collect personal information from children under these ages.
                </p>
                <p>
                  If we become aware that we have collected personal information from a child without appropriate consent, we will take steps to delete that information promptly.
                </p>
                <p>
                  If you believe we have collected information from a child, please contact us at privacy@k9protrain.com.
                </p>
              </div>
            </section>

            {/* Do Not Track */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Do Not Track Signals</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  Some web browsers have a "Do Not Track" (DNT) feature that sends a signal to websites you visit indicating you do not want to be tracked. Our Service does not currently respond to DNT signals because there is no industry standard for how to respond to these signals.
                </p>
                <p>
                  Regardless of DNT settings, we do not track you across third-party websites. We only collect information as described in this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Third-Party Links and Services</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  The Service may contain links to third-party websites, services, or applications that are not operated by us. This Privacy Policy does not apply to third-party services.
                </p>
                <p>
                  We are not responsible for the privacy practices of third parties. We encourage you to review the privacy policies of any third-party services you access through our platform.
                </p>
                <p>
                  Third-party services we integrate with include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Stripe:</strong> Payment processing (<Link href="https://stripe.com/privacy" className="text-brand-400 hover:text-brand-300 underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</Link>)</li>
                  <li><strong className="text-white">Supabase:</strong> Backend infrastructure (<Link href="https://supabase.com/privacy" className="text-brand-400 hover:text-brand-300 underline" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</Link>)</li>
                  <li><strong className="text-white">Google/Apple:</strong> Social authentication (if used)</li>
                </ul>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">16. Changes to This Privacy Policy</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Update the "Last Updated" date at the top of this page</li>
                  <li>Post the updated Privacy Policy on our website</li>
                  <li>Send you an email notification for significant changes (if you have an account)</li>
                  <li>Provide a summary of key changes</li>
                </ul>
                <p className="mt-4">
                  We encourage you to review this Privacy Policy periodically. Your continued use of the Service after any changes indicates your acceptance of the updated Privacy Policy.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">17. Contact Us</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="p-6 rounded-xl bg-surface-800/50 border border-surface-700 space-y-4">
                  <div>
                    <p className="font-medium text-white mb-2">Lazy E Holdings LLC</p>
                    <p className="text-surface-400">Privacy Inquiries</p>
                  </div>
                  <div>
                    <p className="text-surface-400">Email:</p>
                    <p className="text-white">privacy@k9protrain.com</p>
                  </div>
                  <div>
                    <p className="text-surface-400">General Support:</p>
                    <p className="text-white">support@k9protrain.com</p>
                  </div>
                  <div>
                    <p className="text-surface-400">Legal Matters:</p>
                    <p className="text-white">legal@k9protrain.com</p>
                  </div>
                  <div className="pt-4 border-t border-surface-700">
                    <p className="text-sm text-surface-500">
                      For general inquiries, you can also use the contact form on our website. We aim to respond to all privacy-related inquiries within 30 days.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-brand-500/10 border border-brand-500/20">
                  <p className="text-brand-400 font-medium mb-2">Data Subject Requests</p>
                  <p className="text-surface-300 text-sm">
                    To submit a formal data subject request (access, deletion, correction, or portability), please email privacy@k9protrain.com with the subject line "Data Subject Request" and include your account email address. We will verify your identity and respond within the timeframe required by applicable law.
                  </p>
                </div>
              </div>
            </section>

            {/* Summary */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">18. Privacy Policy Summary</h2>
              <div className="text-surface-300 space-y-4">
                <p className="text-surface-400 italic mb-4">
                  This summary provides an overview of our privacy practices. Please read the full Privacy Policy above for complete details.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-surface-800/50 border border-surface-700">
                    <h4 className="font-medium text-white mb-2">What We Collect</h4>
                    <ul className="text-sm space-y-1">
                      <li>Account and contact information</li>
                      <li>Dog profiles and training data</li>
                      <li>Usage and device information</li>
                      <li>Payment information (via Stripe)</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-800/50 border border-surface-700">
                    <h4 className="font-medium text-white mb-2">How We Use It</h4>
                    <ul className="text-sm space-y-1">
                      <li>Provide and improve the Service</li>
                      <li>Process transactions</li>
                      <li>Communicate with you</li>
                      <li>Ensure security and compliance</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-800/50 border border-surface-700">
                    <h4 className="font-medium text-white mb-2">Who We Share With</h4>
                    <ul className="text-sm space-y-1">
                      <li>Trainers and pet parents (per your use)</li>
                      <li>Service providers (hosting, payments)</li>
                      <li>Legal authorities (when required)</li>
                      <li className="text-brand-400 font-medium">We do NOT sell your data</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-800/50 border border-surface-700">
                    <h4 className="font-medium text-white mb-2">Your Rights</h4>
                    <ul className="text-sm space-y-1">
                      <li>Access and download your data</li>
                      <li>Correct inaccurate information</li>
                      <li>Delete your account and data</li>
                      <li>Opt out of marketing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-16 pt-8 border-t border-surface-800">
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/terms" className="text-brand-400 hover:text-brand-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="text-surface-400 hover:text-white transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
