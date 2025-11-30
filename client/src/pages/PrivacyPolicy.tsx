import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-slate-900/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Last updated: 11/30/2025
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Your privacy matters to us. This Privacy Policy explains what information we collect, why we collect it, and how we protect it when you use TouchConnectPro.com.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            {/* Who We Are */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">1. Who We Are</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  TouchConnectPro ("we", "our", "us") operates from the United States and provides tools and mentorship services for entrepreneurs, coaches, and investors.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  By using our website, you agree to how we handle data as described here.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. Information We Collect</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We may collect information in two categories:
                </p>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Personal Information (provided by you)</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Account details you submit during sign-up or onboarding</li>
                    <li>Information shared with mentors or during pitch-building</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Technical Information (collected automatically)</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Cookies and tracking data</li>
                    <li>IP address, device type, and browser information</li>
                    <li>Usage logs to improve website performance</li>
                  </ul>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                  We only collect what we need to provide and improve our services — nothing more.
                </p>
              </CardContent>
            </Card>

            {/* Tools & Services We Use */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. Tools & Services We Use</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We work with trusted third-party tools to run our platform securely:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                  <li><span className="font-semibold">Stripe</span> — to process payments safely</li>
                  <li><span className="font-semibold">Mailchimp</span> — to communicate updates, onboarding emails, and newsletters</li>
                  <li>Other internal tools may be added as we grow. If so, we will update this policy.</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4 font-semibold">
                  We do not sell your information — ever.
                </p>
              </CardContent>
            </Card>

            {/* How We Use Your Data */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. How We Use Your Data</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                  <li>Create and manage your TouchConnectPro account</li>
                  <li>Process membership payments</li>
                  <li>Communicate important updates, onboarding steps, and service changes</li>
                  <li>Improve the experience, functionality, and security of our platform</li>
                  <li>Help match you with mentors, coaches, or investors (when applicable)</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                  Your information is not shared with third parties for commercial purposes unless you give permission or the law requires it.
                </p>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Data Security</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We take data protection seriously.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We use reasonable security measures to prevent unauthorized access, misuse, loss, or disclosure of your information. However, no online service can guarantee 100% security. If a security issue ever occurs, we will inform users as quickly as possible.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Cookies</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Cookies help us understand how people use the website and allow features like login to function.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You can disable cookies in your browser at any time, but some parts of the site may not work as intended.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">7. Your Rights</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  You have control over your personal information. You may:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2">
                  <li>Request access to the data we hold about you</li>
                  <li>Ask us to correct or update inaccurate data</li>
                  <li>Request deletion of your information</li>
                  <li>Opt out of marketing emails at any time</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                  To request any of the above, contact us directly at <span className="font-semibold">hello@touchconnectpro.com</span>.
                </p>
              </CardContent>
            </Card>

            {/* Changes to This Policy */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">8. Changes to This Policy</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We may update this Privacy Policy when new tools or features are added. The latest version will always be posted on this page with an updated date.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> 9. Contact Us
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  For any questions about privacy, data usage, or this policy, email us anytime:
                </p>
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
