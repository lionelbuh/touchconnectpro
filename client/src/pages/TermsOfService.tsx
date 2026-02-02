import { Mail, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="py-16 bg-gradient-to-b from-slate-900/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">
              Terms & Conditions + Refund Policy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Last Updated: February 1, 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Welcome to TouchConnectPro.com.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC ("Company", "we", "us", "our").
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  By accessing or using our website, creating an account, booking a coach, or purchasing a membership, you agree to these Terms & Conditions and our associated policies. If you do not agree, you must discontinue use of the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. Overview of the Platform</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  TouchConnectPro connects entrepreneurs with mentors, coaches, experts, and educational resources to support business development and growth.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Our services may include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>AI-assisted pitch and business material creation</li>
                  <li>Mentor and coach profile placement, subject to approval</li>
                  <li>Paid one-on-one and group coaching access</li>
                  <li>Investor pitch preparation support</li>
                  <li>Tools and resources for strategy, learning, and growth</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  TouchConnectPro provides guidance and access to expertise. We do not guarantee business success, coaching outcomes, revenue growth, or investor funding decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. Membership and Subscription</h2>
                
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Membership Activation</h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      Membership begins only after your project has been reviewed and accepted by a mentor or coach on the platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Billing</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                      <li>Memberships are billed monthly through Stripe</li>
                      <li>Billing continues until canceled by the user</li>
                      <li>Prices may change with advance notice prior to renewal</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Cancellation</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                      <li>You may cancel your membership at any time from your dashboard</li>
                      <li>Cancellation stops future billing</li>
                      <li>Access remains active until the end of the current billing cycle</li>
                    </ul>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Coaching sessions and services are not included in the membership fee unless explicitly stated.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Mentor Availability and Changes</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We aim to support continuity in mentorship relationships. However, mentor assignments may change due to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Evolving project needs</li>
                  <li>Mentor availability</li>
                  <li>Identification of a more suitable expert</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  If a change is required, TouchConnectPro will assist in transitioning you to another appropriate mentor when possible.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Refund and Cancellation Policy</h2>
                
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Membership Refunds</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                      <li>New members are eligible for a 7-day refund window starting from the date of first charge</li>
                      <li>To request a refund within this period, you must contact us at hello@touchconnectpro.com</li>
                      <li>After 7 days, membership fees become non-refundable</li>
                      <li>No refunds are issued for partial months, unused time, or lack of platform usage.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Coaching and Consulting Sessions</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                      <li>Coaching sessions are provided by independent mentors and coaches</li>
                      <li>These services are not included in the membership fee</li>
                      <li>Coaches are solely responsible for approving or denying refund requests for their services</li>
                      <li className="font-semibold">TouchConnectPro retains a non-refundable 20 percent platform commission for providing access to the coach network and infrastructure. This service fee is not reimbursable under any circumstances.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Data Protection and Privacy</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Your privacy is important to us.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  By using TouchConnectPro, you agree to our Privacy Policy, which explains how personal data is collected, used, and protected. This may include information such as your name, email address, usage data, and cookies.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We do not sell personal data. Information is shared only when necessary for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Payment processing</li>
                  <li>Platform communications</li>
                  <li>Service delivery</li>
                  <li>Legal or regulatory compliance</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You may request access, correction, or deletion of your personal data at any time by contacting:
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-2 font-semibold">
                  hello@touchconnectpro.com
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">7. Intellectual Property</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  All branding, software, content, guides, templates, materials, and digital assets associated with TouchConnectPro are the exclusive property of Touch Equity Partners LLC.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Users may not copy, reproduce, resell, distribute, or exploit any platform materials for commercial or competitive purposes without prior written permission.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">8. No Guarantee of Funding</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  TouchConnectPro may help entrepreneurs prepare investor materials and facilitate introductions. However:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Investment decisions are made independently by investors</li>
                  <li>Funding is never guaranteed</li>
                  <li>Results depend on execution, readiness, and external factors</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  TouchConnectPro is not a lender, broker, or funding provider.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" /> 9. Limitation of Liability
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Use of the platform is voluntary and at your own discretion.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Touch Equity Partners LLC and TouchConnectPro are not liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Business losses or performance outcomes</li>
                  <li>Investment acceptance or rejection</li>
                  <li>Disputes between users and coaches</li>
                  <li>Missed sessions or external agreements</li>
                  <li>Decisions made based on mentorship or platform content</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  Users are solely responsible for their business and financial decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">10. Changes to These Terms</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We may update these Terms & Conditions from time to time as the platform evolves.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  The most current version will always be available on this page with an updated "Last Updated" date.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> 11. Contact Information
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you have questions about these Terms & Conditions or our policies, please contact:
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Touch Equity Partners LLC
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Operator of TouchConnectPro
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-2">
                  hello@touchconnectpro.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
