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
              Terms of Service
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Last updated: 11/30/2025
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Please read these Terms of Service carefully before using www.TouchConnectPro.com
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            {/* 1. Acceptance of Terms */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  By accessing and using www.TouchConnectPro.com (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            {/* 2. Use License */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. User Responsibilities</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  By using TouchConnectPro, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Provide accurate and complete information during sign-up and onboarding</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Use the platform only for lawful purposes and in a way that does not infringe upon the rights of others</li>
                  <li>Not engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                  <li>Not attempt to gain unauthorized access to the platform or its systems</li>
                </ul>
              </CardContent>
            </Card>

            {/* 3. Membership & Billing */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. Membership & Billing</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  TouchConnectPro membership is only available after a mentor approves your application and you're added to their portfolio. Once approved, your membership billing will begin at the agreed-upon rate ($49/month for standard membership). By continuing to use TouchConnectPro after approval, you authorize us to charge your payment method.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Billing cycles are monthly and will continue until you cancel your membership. You are responsible for keeping your billing information current.
                </p>
              </CardContent>
            </Card>

            {/* 4. Refund & Cancellation Policy */}
            <Card className="border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Refund & Cancellation Policy</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Cancellation</h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      You can cancel your TouchConnectPro membership at any time with one click from your dashboard. Cancellation takes effect immediately, and you will retain access to your account through the end of the current billing cycle.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Refunds</h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                      We offer a 7-day refund window for new members. If you cancel within 7 days of your first billing cycle, we will issue a full refund to your original payment method.
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      After 7 days, membership fees are non-refundable. However, you can cancel anytime to stop future charges. No refunds will be issued for partial months or unused portions of your membership.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Coaching Session Fees</h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Coaching sessions booked through mentors and coaches are separate from membership fees and are non-refundable. These are managed directly between you and your mentor/coach. Disputes regarding coaching sessions should be addressed with the provider directly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Disclaimer */}
            <Card className="border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" /> 5. Disclaimer
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  The materials on TouchConnectPro.com are provided on an "as is" basis. TouchConnectPro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  TouchConnectPro is not responsible for the accuracy or outcomes of mentorship relationships, coaching sessions, or investment opportunities. Mentor guidance and business advice are provided as educational resources and should not be considered professional financial, legal, or business advice.
                </p>
              </CardContent>
            </Card>

            {/* 6. Intellectual Property */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Intellectual Property</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  All content on TouchConnectPro.com, including text, graphics, logos, images, and software, is the property of TouchConnectPro or its content suppliers and is protected by international copyright laws.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You retain ownership of any content you create or upload to your TouchConnectPro account (such as your business pitch or project information). However, by uploading content, you grant TouchConnectPro and your assigned mentor/coach a license to use, copy, and display that content for the purposes of your membership and mentorship relationship.
                </p>
              </CardContent>
            </Card>

            {/* 7. Limitations of Liability */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">7. Limitations of Liability</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  In no event shall TouchConnectPro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TouchConnectPro.com, even if TouchConnectPro or a TouchConnectPro authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </CardContent>
            </Card>

            {/* 8. Third-Party Links */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">8. Third-Party Links</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  TouchConnectPro may contain links to third-party websites and resources. We are not responsible for the availability or content of these external sites, and linking to them does not imply endorsement. Your use of third-party websites is at your own risk and subject to their terms of service.
                </p>
              </CardContent>
            </Card>

            {/* 9. Modifications to Service */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">9. Modifications to Service</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  TouchConnectPro reserves the right to modify or discontinue the Service (or any part thereof) at any time with or without notice. We may also revise these Terms of Service at any time. By continuing to use the Service after any such modification, you accept and agree to be bound by the revised Terms of Service.
                </p>
              </CardContent>
            </Card>

            {/* 10. Dispute Resolution */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">10. Dispute Resolution</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you have a dispute with TouchConnectPro, please first contact us at hello@touchconnectpro.com to attempt to resolve the issue informally. If the dispute cannot be resolved within 30 days, either party may pursue formal legal action.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  These Terms are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </CardContent>
            </Card>

            {/* 11. Contact Information */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> 11. Contact Us
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  For any questions about these Terms of Service or to report violations, please contact us at:
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
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
