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
              Last updated: December 30, 2025
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
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  TouchConnectPro ("we", "us", "our") respects your privacy. This Privacy Policy explains what personal data we collect, why we collect it, and how we use it when you use our website and services.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. What data we collect</h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">a. Account & profile data</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">When you create an account (coach or entrepreneur), we may collect:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Profile information you choose to provide</li>
                    <li>Login and authentication data</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">b. Usage data</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">We collect limited usage data to understand how our website is used, such as:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Pages visited</li>
                    <li>Device and browser type</li>
                    <li>Approximate location (country-level)</li>
                  </ul>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 italic">
                    This data is collected using Google Analytics, only after you give consent.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">c. Communications</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">If you contact us or receive emails from us, we may collect:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Email address</li>
                    <li>Message content</li>
                    <li>Email delivery and open information (for transactional emails)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. How we use your data</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">We use your data to:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Provide and operate TouchConnectPro</li>
                  <li>Authenticate users and secure accounts</li>
                  <li>Improve our website and user experience</li>
                  <li>Communicate with you about your account or our services</li>
                  <li>Comply with legal obligations</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  We do not sell your personal data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Third-party services we use</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We use trusted third-party services to operate TouchConnectPro:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li><strong>Supabase</strong> – authentication and database</li>
                  <li><strong>Google Analytics</strong> – website analytics (only with consent)</li>
                  <li><strong>Render</strong> – hosting infrastructure</li>
                  <li><strong>Senders</strong> – transactional email delivery</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  These providers process data only as necessary to provide their services.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Cookies & tracking</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">We use:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li><strong>Essential cookies</strong> for login, security, and core functionality</li>
                  <li><strong>Analytics cookies</strong> (Google Analytics) only if you consent</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  For more details, see our <Link href="/cookie-policy" className="text-cyan-600 hover:underline">Cookie Policy</Link>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Data retention</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We keep your personal data only as long as necessary:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>While your account is active</li>
                  <li>Or as required by law</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You may request deletion of your account and data at any time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">7. Your rights (GDPR)</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you are located in the EU or UK, you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent for analytics cookies</li>
                  <li>Object to certain processing</li>
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
                  We take reasonable technical and organizational measures to protect your data from unauthorized access, loss, or misuse.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">9. Changes to this policy</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. Updates will be posted on this page with a new "Last updated" date.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> 10. Contact
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy, contact us at:
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
