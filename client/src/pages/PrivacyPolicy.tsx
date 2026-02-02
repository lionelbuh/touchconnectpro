import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="py-16 bg-gradient-to-b from-slate-900/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Last updated: February 1, 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">1. Introduction</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Touch Equity Partners LLC ("Company", "we", "us", "our") operates TouchConnectPro.com and the TouchConnectPro service (collectively, "TouchConnectPro"), which is a brand and service of Touch Equity Partners LLC.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We respect your privacy. This Privacy Policy explains what personal data we collect, why we collect it, and how we use it when you access or use our website and services.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  By using TouchConnectPro, you agree to the collection and use of information in accordance with this Privacy Policy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. Personal data we collect</h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">a. Account and profile data</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">When you create an account as a coach, entrepreneur or mentor, we may collect:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Profile information you choose to provide</li>
                    <li>Login, authentication, and account-related data</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">b. Usage data</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">We collect limited usage data to understand how our website is used, including:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Pages visited</li>
                    <li>Device and browser type</li>
                    <li>Approximate location (country-level only)</li>
                  </ul>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 italic">
                    This data is collected using Google Analytics and only after you provide consent, where required by law.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">c. Communications</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">If you contact us or receive emails from us, we may collect:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Email address</li>
                    <li>Message content</li>
                    <li>Email delivery and open data for transactional or service-related emails</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. How we use your data</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">We use personal data to:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Provide, operate, and maintain TouchConnectPro</li>
                  <li>Authenticate users and secure accounts</li>
                  <li>Improve our website, services, and user experience</li>
                  <li>Communicate with you regarding your account or our services</li>
                  <li>Comply with legal and regulatory obligations</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  We do not sell your personal data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Third-party service providers</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We use trusted third-party providers to operate TouchConnectPro, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li><strong>Supabase</strong> for authentication and database services</li>
                  <li><strong>Google Analytics</strong> for website analytics (only with consent)</li>
                  <li><strong>Render</strong> for hosting and infrastructure</li>
                  <li><strong>Senders</strong> for transactional email delivery</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  These providers process personal data only as necessary to perform services on our behalf and are subject to their own data protection obligations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Cookies and tracking technologies</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">We use:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li><strong>Essential cookies</strong> required for login, security, and core functionality</li>
                  <li><strong>Analytics cookies</strong>, including Google Analytics, only with your consent where applicable</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  For more information, please refer to our <Link href="/cookie-policy" className="text-cyan-600 hover:underline">Cookie Policy</Link>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Data retention</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We retain personal data only for as long as necessary to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Maintain and operate your account</li>
                  <li>Provide our services</li>
                  <li>Comply with legal or regulatory requirements</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You may request deletion of your account and associated personal data at any time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">7. Your rights (GDPR and similar laws)</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you are located in the European Union, United Kingdom, or another jurisdiction with similar data protection laws, you may have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Withdraw consent for analytics cookies</li>
                  <li>Object to or restrict certain processing</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  To exercise these rights, contact us at: <a href="mailto:hello@touchconnectpro.com" className="text-cyan-600 hover:underline">hello@touchconnectpro.com</a>
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">8. Data security</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We implement reasonable technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction. However, no system can be guaranteed to be 100 percent secure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">9. Changes to this Privacy Policy</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> 10. Contact information
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, you may contact us at:
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Touch Equity Partners LLC
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  Email: hello@touchconnectpro.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
