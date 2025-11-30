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
              Privacy Policy — TouchConnectPro
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Last Updated: 11/30/2025
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              This Privacy Policy explains how TouchConnectPro ("we", "us", "our") collects, stores, uses, and protects your personal information when you access or interact with TouchConnectPro.com.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-semibold">
              Your privacy is important — and we keep your information safe, transparent, and only used for the purpose of delivering our services.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            {/* 1. Information We Collect */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">1. Information We Collect</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We collect two types of data:
                </p>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">A) Information you provide directly</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Account details & onboarding information</li>
                    <li>Information you share with mentors or during pitch building</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">B) Automatically collected technical data</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Cookies and analytics tracking</li>
                    <li>IP address, browser, device type</li>
                    <li>Usage behavior to improve website performance</li>
                  </ul>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4 font-semibold">
                  We collect only the data required to operate the platform and help you succeed.
                </p>
              </CardContent>
            </Card>

            {/* 2. How We Use Your Data */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. How We Use Your Data</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Your data is used to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Create and manage your account</li>
                  <li>Process membership payments</li>
                  <li>Communicate onboarding, updates, and service information</li>
                  <li>Match users with mentors/coaches where relevant</li>
                  <li>Improve platform features, security, and user experience</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  We do not sell your data — ever.
                </p>
              </CardContent>
            </Card>

            {/* 3. Third-Party Tools Involved */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. Third-Party Tools Involved</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  To operate TouchConnectPro, we securely use trusted external services:
                </p>
                
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm text-slate-700 dark:text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-300 dark:border-slate-600">
                        <th className="text-left py-2 px-3 font-semibold">Tool</th>
                        <th className="text-left py-2 px-3 font-semibold">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-2 px-3">Stripe</td>
                        <td className="py-2 px-3">Payment processing</td>
                      </tr>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <td className="py-2 px-3">Mailchimp</td>
                        <td className="py-2 px-3">Email updates & onboarding</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Analytics/Cookies</td>
                        <td className="py-2 px-3">Website performance & optimization</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  These providers may process your data only to perform their services — never to contact you independently or resell your information.
                </p>
              </CardContent>
            </Card>

            {/* 4. Data Protection & Security */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Data Protection & Security</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We follow reasonable and standard industry measures to protect personal data from unauthorized access, manipulation, loss, or disclosure.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  While no digital system can guarantee 100% security, TouchConnectPro continuously monitors systems and will notify users if a data-related risk or breach ever occurs.
                </p>
              </CardContent>
            </Card>

            {/* 5. Cookies */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Cookies</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Cookies help us operate the platform, remember logins, and improve your experience.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You may disable cookies in your browser at any time, but some features may not function correctly if disabled.
                </p>
              </CardContent>
            </Card>

            {/* 6. Your Rights Over Your Data */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Your Rights Over Your Data</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  You may request at any time to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Access the information we hold about you</li>
                  <li>Correct or update inaccurate details</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt-out of marketing or communications</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 font-semibold">
                  You remain in control of your privacy.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  To exercise any rights, contact us at:
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-2 font-semibold">
                  📩 hello@touchconnectpro.com
                </p>
              </CardContent>
            </Card>

            {/* 7. Data Retention */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">7. Data Retention</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We keep your information only as long as your account is active, or as required by law for accounting and security purposes. Data can be permanently deleted upon request unless retained by legal requirement.
                </p>
              </CardContent>
            </Card>

            {/* 8. Changes to This Policy */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">8. Changes to This Policy</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If we update how we use or protect data, we will revise this policy and update the date above. Continued use of the platform implies acceptance of the latest version.
                </p>
              </CardContent>
            </Card>

            {/* Questions or Concerns */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> Questions or Concerns?
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We're here to help — contact us anytime:
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
