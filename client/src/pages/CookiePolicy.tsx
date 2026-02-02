import { Cookie, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function CookiePolicy() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="py-16 bg-gradient-to-b from-slate-900/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <Cookie className="h-12 w-12 text-cyan-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">
              Cookie Policy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
              Last updated: February 1, 2026
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              TouchConnectPro is a website and service operated by Touch Equity Partners LLC.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">1. What are cookies?</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Cookies are small text files stored on your device when you visit a website. They help websites function properly and understand how users interact with them.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. Cookies we use</h2>
                
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">a. Essential cookies (always active)</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-3">These cookies are required for the website to function:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>User authentication and login</li>
                    <li>Security and fraud prevention</li>
                    <li>Session management</li>
                  </ul>
                  <p className="text-green-700 dark:text-green-400 mt-3 text-sm font-medium">
                    These cookies do not require consent.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">b. Analytics cookies (optional)</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-3">
                    We use Google Analytics to understand how visitors use TouchConnectPro. These cookies may collect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-2">
                    <li>Pages visited</li>
                    <li>Time spent on pages</li>
                    <li>Device and browser information</li>
                  </ul>
                  <p className="text-amber-700 dark:text-amber-400 mt-3 text-sm font-medium">
                    Analytics cookies are disabled by default and only activated if you give consent.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. How we collect consent</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  When you first visit TouchConnectPro, you see a cookie banner that lets you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Accept analytics cookies</li>
                  <li>Reject analytics cookies</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You can use the website even if you reject analytics cookies.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Managing your preferences</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">You can:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-2 mb-4">
                  <li>Withdraw or change your consent at any time using the "Cookie Settings" link in our footer</li>
                  <li>Clear cookies through your browser settings</li>
                </ul>
                <button 
                  onClick={() => window.openCookieSettings?.()} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Cookie className="h-4 w-4" />
                  Open Cookie Settings
                </button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Third-party cookies</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Analytics cookies are provided by Google Analytics. We do not use advertising or marketing cookies at this time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Changes to this policy</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We may update this Cookie Policy from time to time. Any changes will be posted on this page.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> 7. Contact
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you have questions about this Cookie Policy, contact us at:
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  hello@touchconnectpro.com
                </p>
              </CardContent>
            </Card>

            <div className="text-center pt-4">
              <Link href="/privacy-policy" className="text-cyan-600 hover:underline">
                View our Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
