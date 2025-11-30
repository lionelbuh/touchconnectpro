import { Mail, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-slate-900/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">
              Terms & Conditions + Refund Policy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Last Updated: 11/30/2025
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Welcome to TouchConnectPro.com. By using our website, creating an account, booking a coach, or purchasing a membership, you agree to the Terms & Conditions outlined below. If you do not agree, please discontinue use of the platform.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            {/* 1. Overview of the Platform */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">1. Overview of the Platform</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  TouchConnectPro connects entrepreneurs with mentors, coaches, experts, and resources to grow their business. We provide:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>AI-assisted pitch & business material creation</li>
                  <li>Mentor portfolio placement (upon approval)</li>
                  <li>Paid 1:1 and group coaching access</li>
                  <li>Investor presentation preparation</li>
                  <li>Platform for growth, strategy, and learning</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  We guide entrepreneurs — but we do not guarantee business results, coaching outcomes, or investor funding decisions.
                </p>
              </CardContent>
            </Card>

            {/* 2. Membership & Subscription */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. Membership & Subscription</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                  <li>Membership begins only after your project is accepted by a mentor.</li>
                  <li>Once active, membership is billed monthly through Stripe until canceled.</li>
                  <li>You may cancel at any time from your dashboard.</li>
                  <li>Membership pricing may change with notice before renewal.</li>
                  <li>Coaching sessions purchased separately are not included in your membership fee.</li>
                </ul>
              </CardContent>
            </Card>

            {/* 3. Mentor Availability & Changes */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. Mentor Availability & Changes</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Mentorship continuity is supported, however changes may occur if:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Your needs evolve</li>
                  <li>A mentor becomes unavailable</li>
                  <li>A new professional becomes a better fit</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  If a change is required, TouchConnectPro will help transition you to a new suitable mentor.
                </p>
              </CardContent>
            </Card>

            {/* 4. Refund & Cancellation Policy */}
            <Card className="border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Refund & Cancellation Policy</h2>
                
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Membership Cancellation</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                      <li>You may cancel your membership anytime through your dashboard.</li>
                      <li>Cancellation stops future billing, and your access remains active until the end of the billing cycle.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Membership Refunds</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                      <li>We offer a 7-day refund window for new members.</li>
                      <li>If you cancel within 7 days of your first charge, you may request a full refund.</li>
                      <li>After 7 days, membership fees become non-refundable.</li>
                      <li>No refunds are issued for partial months, unused time, or missed platform use.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Coaching Session Fees</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                      <li>Coaching or consulting sessions are third-party services offered by mentors and are not included in the membership price.</li>
                      <li>Coaches are responsible for approving or denying refund requests.</li>
                      <li>TouchConnectPro retains a non-refundable 20% platform commission for providing access to a network of coaches.</li>
                      <li className="font-semibold">No reimbursement of the TouchConnectPro service fee is issued under any circumstance.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Data Protection & Privacy */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Data Protection & Privacy</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Your privacy matters to us.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  By using the platform, you also agree to our Privacy Policy, which explains how we collect, use, and protect your data. Information such as name, email address, usage data, and cookies may be collected to operate the platform, improve user experience, process payments, and maintain account access.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We do not sell personal information — and only share data when required for payment processing, communication (e.g. Mailchimp), or legal compliance.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Users may request access, correction, or deletion of their data anytime by contacting:
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-2 font-semibold">
                  📩 hello@touchconnectpro.com
                </p>
              </CardContent>
            </Card>

            {/* 6. Intellectual Property */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Intellectual Property</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  All material, branding, guides, content, templates, and digital assets belong to TouchConnectPro. Users may not resell, duplicate, copy, or distribute platform materials for commercial or competitive use.
                </p>
              </CardContent>
            </Card>

            {/* 7. No Guarantee of Funding */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">7. No Guarantee of Funding</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We help entrepreneurs prepare pitches and may introduce investment opportunities — however:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Investor decisions are independent</li>
                  <li>Funding is not guaranteed</li>
                  <li>Outcomes depend on the founder's execution and readiness</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  TouchConnectPro is a support system — not a funding provider.
                </p>
              </CardContent>
            </Card>

            {/* 8. Limitation of Liability */}
            <Card className="border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" /> 8. Limitation of Liability
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Users are responsible for decisions and outcomes arising from mentorship, coaching sessions, and investor interactions. TouchConnectPro is not liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Business performance or losses</li>
                  <li>Investment acceptance or rejection</li>
                  <li>Miscommunication or disputes between users & coaches</li>
                  <li>Missed sessions or external agreements</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  Use of the platform is voluntary and at your own discretion.
                </p>
              </CardContent>
            </Card>

            {/* 9. Changes to Terms */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">9. Changes to Terms</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Terms & Conditions may be updated as the platform evolves.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  The most recent version will always be available here with a revised "Last Updated" date.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> Questions? Contact Us
                </h2>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  📩 hello@touchconnectpro.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
