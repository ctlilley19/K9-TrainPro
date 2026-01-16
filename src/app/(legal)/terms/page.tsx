'use client';

import Link from 'next/link';
import { Dog, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <div className="flex flex-wrap gap-4 text-sm text-surface-400">
              <span>Last Updated: {lastUpdated}</span>
              <span>|</span>
              <span>Effective Date: {effectiveDate}</span>
            </div>
          </div>

          <div className="prose prose-invert prose-surface max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction and Acceptance of Terms</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  Welcome to K9 ProTrain. These Terms of Service ("Terms," "Agreement") constitute a legally binding agreement between you ("User," "you," "your") and Lazy E Holdings LLC, a Texas limited liability company ("Company," "we," "us," "our"), governing your access to and use of the K9 ProTrain platform, including our website at k9protrain.com, mobile applications, and all related services (collectively, the "Service").
                </p>
                <p>
                  By accessing or using the Service, creating an account, or clicking "I Agree" or similar buttons, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
                </p>
                <p>
                  <strong className="text-white">ARBITRATION NOTICE:</strong> These Terms contain an arbitration clause and class action waiver that affects your rights. Please read Section 16 carefully.
                </p>
              </div>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Definitions</h2>
              <div className="text-surface-300 space-y-4">
                <p>For purposes of these Terms:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">"Account"</strong> means the user account you create to access the Service.</li>
                  <li><strong className="text-white">"Content"</strong> means any text, images, videos, audio, data, or other materials uploaded, posted, or transmitted through the Service.</li>
                  <li><strong className="text-white">"Dog Profile"</strong> means the information and records associated with a specific dog registered on the platform.</li>
                  <li><strong className="text-white">"Facility"</strong> means a dog training business, kennel, or organization using the Service.</li>
                  <li><strong className="text-white">"Pet Parent"</strong> means an individual user who owns or is responsible for a dog receiving training services.</li>
                  <li><strong className="text-white">"Trainer"</strong> means an individual or entity providing professional dog training services through the platform.</li>
                  <li><strong className="text-white">"Subscription"</strong> means the paid access plan selected by users to use the Service.</li>
                  <li><strong className="text-white">"User Data"</strong> means all data, including Content, that you submit to or generate through the Service.</li>
                </ul>
              </div>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Eligibility and Account Registration</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">3.1 Eligibility Requirements</h3>
                <p>To use the Service, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be at least 18 years of age or the age of legal majority in your jurisdiction;</li>
                  <li>Have the legal authority to enter into this Agreement;</li>
                  <li>Not be prohibited from using the Service under applicable laws;</li>
                  <li>For business accounts, have the authority to bind your organization to these Terms.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">3.2 Account Registration</h3>
                <p>When creating an Account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information;</li>
                  <li>Maintain and promptly update your Account information;</li>
                  <li>Maintain the security and confidentiality of your login credentials;</li>
                  <li>Accept responsibility for all activities under your Account;</li>
                  <li>Notify us immediately of any unauthorized access or security breach.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">3.3 Account Types</h3>
                <p>The Service offers different account types including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Trainer/Facility Accounts:</strong> For professional dog trainers and training facilities;</li>
                  <li><strong className="text-white">Pet Parent Accounts:</strong> For dog owners receiving training services;</li>
                  <li><strong className="text-white">Staff Accounts:</strong> For employees of training facilities with delegated access.</li>
                </ul>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Description of Service</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">4.1 Platform Features</h3>
                <p>K9 ProTrain provides a comprehensive dog training management platform that includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dog profile management and training records;</li>
                  <li>Activity tracking and logging;</li>
                  <li>Daily reports and progress updates;</li>
                  <li>Photo and video sharing;</li>
                  <li>Badge and achievement systems;</li>
                  <li>Client communication tools;</li>
                  <li>Homework assignment and tracking;</li>
                  <li>Scheduling and booking features;</li>
                  <li>Certificate generation;</li>
                  <li>Pet parent portal access.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">4.2 Service Availability</h3>
                <p>
                  While we strive to maintain continuous Service availability, we do not guarantee uninterrupted access. The Service may be temporarily unavailable due to scheduled maintenance, upgrades, or circumstances beyond our reasonable control.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">4.3 Modifications to Service</h3>
                <p>
                  We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time. We will provide reasonable notice of material changes when practicable.
                </p>
              </div>
            </section>

            {/* Subscriptions and Payments */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Subscriptions, Fees, and Payments</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">5.1 Subscription Plans</h3>
                <p>
                  Access to certain features of the Service requires a paid Subscription. Current pricing and plan details are available on our website. We offer monthly and annual billing options.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">5.2 Free Trial</h3>
                <p>
                  We may offer free trial periods at our discretion. At the end of a free trial, your Subscription will automatically convert to a paid plan unless you cancel before the trial expires. You must provide valid payment information to start a free trial.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">5.3 Payment Terms</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All fees are quoted and payable in U.S. Dollars;</li>
                  <li>Fees are billed in advance on a recurring basis (monthly or annually);</li>
                  <li>You authorize us to charge your designated payment method;</li>
                  <li>Failed payments may result in Service suspension;</li>
                  <li>Fees are non-refundable except as expressly stated herein.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">5.4 Price Changes</h3>
                <p>
                  We may modify Subscription fees upon 30 days' advance notice. Price changes will take effect at the start of your next billing cycle. Continued use of the Service after a price change constitutes acceptance of the new pricing.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">5.5 Taxes</h3>
                <p>
                  Fees do not include applicable taxes. You are responsible for all taxes, levies, or duties imposed by taxing authorities, excluding taxes based on our net income.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">5.6 Refund Policy</h3>
                <p>
                  Monthly subscriptions are non-refundable. Annual subscriptions may be eligible for a prorated refund within the first 30 days if you are dissatisfied with the Service. Contact support@k9protrain.com to request a refund.
                </p>
              </div>
            </section>

            {/* Cancellation */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cancellation and Termination</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">6.1 Cancellation by You</h3>
                <p>
                  You may cancel your Subscription at any time through your account settings. Cancellation will be effective at the end of your current billing period. You will retain access to the Service until the end of that period.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">6.2 Termination by Us</h3>
                <p>We may suspend or terminate your Account immediately if you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate these Terms;</li>
                  <li>Engage in fraudulent or illegal activities;</li>
                  <li>Fail to pay applicable fees;</li>
                  <li>Abuse or harass other users or our staff;</li>
                  <li>Create risk or legal exposure for us.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">6.3 Effect of Termination</h3>
                <p>Upon termination:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your right to use the Service immediately ceases;</li>
                  <li>You may request a copy of your data within 30 days;</li>
                  <li>We may delete your data after 90 days;</li>
                  <li>Provisions that by their nature should survive will continue in effect.</li>
                </ul>
              </div>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. User Conduct and Acceptable Use</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">7.1 Acceptable Use</h3>
                <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Service for any illegal purpose or in violation of any laws;</li>
                  <li>Violate the rights of others, including intellectual property rights;</li>
                  <li>Upload harmful, offensive, or inappropriate Content;</li>
                  <li>Transmit viruses, malware, or other malicious code;</li>
                  <li>Attempt to gain unauthorized access to any systems or networks;</li>
                  <li>Interfere with or disrupt the Service or servers;</li>
                  <li>Scrape, harvest, or collect data from the Service without permission;</li>
                  <li>Impersonate any person or entity;</li>
                  <li>Use the Service to send spam or unsolicited communications;</li>
                  <li>Engage in any activity that could damage or overburden our infrastructure.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">7.2 Content Standards</h3>
                <p>All Content you upload must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be accurate and truthful;</li>
                  <li>Not be defamatory, obscene, or offensive;</li>
                  <li>Not infringe on third-party rights;</li>
                  <li>Not depict animal cruelty or abuse;</li>
                  <li>Not contain illegal content;</li>
                  <li>Comply with all applicable laws and regulations.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">7.3 Animal Welfare</h3>
                <p>
                  K9 ProTrain is committed to animal welfare. Users must comply with all applicable animal welfare laws and regulations. Any Content depicting or promoting animal cruelty, abuse, or neglect will be removed, and accounts may be terminated immediately.
                </p>
              </div>
            </section>

            {/* Content and Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Content and Intellectual Property</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">8.1 Your Content</h3>
                <p>
                  You retain ownership of Content you upload to the Service. By uploading Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, display, and distribute your Content solely for the purpose of operating and providing the Service.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">8.2 Our Intellectual Property</h3>
                <p>
                  The Service, including its design, features, functionality, software, text, graphics, logos, and trademarks, is owned by us or our licensors and is protected by intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service without our written consent.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">8.3 Feedback</h3>
                <p>
                  If you provide feedback, suggestions, or ideas about the Service, you grant us the right to use such feedback without restriction or compensation to you.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">8.4 DMCA Notice</h3>
                <p>
                  If you believe your copyrighted work has been infringed on the Service, please contact our designated agent at legal@k9protrain.com with the required information under the Digital Millennium Copyright Act.
                </p>
              </div>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Privacy and Data Protection</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  Your privacy is important to us. Our collection and use of personal information is governed by our <Link href="/privacy" className="text-brand-400 hover:text-brand-300 underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
                </p>
                <p>
                  By using the Service, you consent to the collection, use, and sharing of your information as described in the Privacy Policy.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Third-Party Services and Links</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  The Service may integrate with or contain links to third-party services, including payment processors (Stripe), cloud services (Supabase), and other providers. Your use of such services is subject to their respective terms and privacy policies.
                </p>
                <p>
                  We are not responsible for the practices or content of third-party services. Any transactions between you and third parties are solely between you and that third party.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Disclaimers</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">11.1 Service "As Is"</h3>
                <p className="uppercase">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">11.2 No Professional Advice</h3>
                <p>
                  The Service provides tools for dog training management but does not constitute professional veterinary, behavioral, or training advice. Always consult qualified professionals for specific advice regarding your dog's health, behavior, or training needs.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">11.3 Training Services</h3>
                <p>
                  K9 ProTrain is a platform connecting trainers with pet parents. We do not employ trainers or provide training services directly. We are not responsible for the quality, safety, or outcomes of any training services arranged through the platform.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">11.4 No Guarantee</h3>
                <p>
                  We do not guarantee that the Service will be uninterrupted, secure, or error-free. We do not guarantee any specific results from using the Service.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Limitation of Liability</h2>
              <div className="text-surface-300 space-y-4">
                <p className="uppercase">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL LAZY E HOLDINGS LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </p>
                <ul className="list-disc pl-6 space-y-2 normal-case">
                  <li>Your access to or use of (or inability to access or use) the Service;</li>
                  <li>Any conduct or content of any third party on the Service;</li>
                  <li>Any content obtained from the Service;</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content;</li>
                  <li>Any injury to any dog or person arising from training activities.</li>
                </ul>
                <p className="uppercase mt-4">
                  OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF ONE HUNDRED DOLLARS ($100) OR THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                </p>
                <p className="mt-4">
                  Some jurisdictions do not allow the exclusion or limitation of certain damages. If these laws apply to you, some or all of the above exclusions or limitations may not apply.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Indemnification</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  You agree to defend, indemnify, and hold harmless Lazy E Holdings LLC and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or relating to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your violation of these Terms;</li>
                  <li>Your Content;</li>
                  <li>Your use of the Service;</li>
                  <li>Your violation of any rights of another party;</li>
                  <li>Any dog training services you provide through the platform;</li>
                  <li>Any injury or damage caused by any dog under your care or ownership.</li>
                </ul>
              </div>
            </section>

            {/* Insurance */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Insurance Requirements (For Trainers)</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  Trainers and Facilities using the Service are strongly encouraged to maintain appropriate insurance coverage, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>General liability insurance;</li>
                  <li>Professional liability/errors and omissions insurance;</li>
                  <li>Care, custody, and control coverage for animals;</li>
                  <li>Workers' compensation insurance (where applicable).</li>
                </ul>
                <p className="mt-4">
                  K9 ProTrain does not provide insurance coverage. All trainers are responsible for their own insurance needs.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">15. Governing Law and Jurisdiction</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions.
                </p>
                <p>
                  Subject to the arbitration provisions below, any legal action or proceeding arising under these Terms shall be brought exclusively in the federal or state courts located in Texas, and you consent to personal jurisdiction and venue in such courts.
                </p>
              </div>
            </section>

            {/* Arbitration */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">16. Arbitration and Class Action Waiver</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">16.1 Agreement to Arbitrate</h3>
                <p>
                  You and Lazy E Holdings LLC agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved by binding arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">16.2 Class Action Waiver</h3>
                <p className="uppercase">
                  YOU AND WE AGREE THAT ANY ARBITRATION SHALL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. IF FOR ANY REASON A CLAIM PROCEEDS IN COURT RATHER THAN ARBITRATION, YOU AND WE EACH WAIVE ANY RIGHT TO A JURY TRIAL.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">16.3 Exceptions</h3>
                <p>
                  Notwithstanding the above, either party may seek injunctive relief in any court of competent jurisdiction. Claims of intellectual property infringement may also be brought in court.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">16.4 Opt-Out</h3>
                <p>
                  You may opt out of this arbitration agreement by sending written notice to legal@k9protrain.com within 30 days of first accepting these Terms. The notice must include your name, address, and a clear statement that you wish to opt out of arbitration.
                </p>
              </div>
            </section>

            {/* General Provisions */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">17. General Provisions</h2>
              <div className="text-surface-300 space-y-4">
                <h3 className="text-lg font-medium text-white">17.1 Entire Agreement</h3>
                <p>
                  These Terms, together with the Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and us regarding the Service.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">17.2 Waiver</h3>
                <p>
                  Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">17.3 Severability</h3>
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">17.4 Assignment</h3>
                <p>
                  You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">17.5 Force Majeure</h3>
                <p>
                  We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">17.6 Notices</h3>
                <p>
                  We may provide notices to you via email to the address associated with your Account, or by posting on the Service. You may provide notices to us at legal@k9protrain.com or by mail to Lazy E Holdings LLC at our registered address.
                </p>

                <h3 className="text-lg font-medium text-white mt-6">17.7 Headings</h3>
                <p>
                  Section headings are for convenience only and shall not affect the interpretation of these Terms.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">18. Changes to These Terms</h2>
              <div className="text-surface-300 space-y-4">
                <p>
                  We may modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on the Service and updating the "Last Updated" date. We may also notify you via email for significant changes.
                </p>
                <p>
                  Your continued use of the Service after any changes constitutes your acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the Service.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">19. Contact Information</h2>
              <div className="text-surface-300 space-y-4">
                <p>If you have any questions about these Terms, please contact us:</p>
                <div className="p-6 rounded-xl bg-surface-800/50 border border-surface-700">
                  <p className="font-medium text-white mb-2">Lazy E Holdings LLC</p>
                  <p>Email: legal@k9protrain.com</p>
                  <p>Support: support@k9protrain.com</p>
                  <p className="mt-4 text-sm text-surface-500">
                    For general inquiries, please use the contact form on our website.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-16 pt-8 border-t border-surface-800">
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/privacy" className="text-brand-400 hover:text-brand-300 transition-colors">
                Privacy Policy
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
