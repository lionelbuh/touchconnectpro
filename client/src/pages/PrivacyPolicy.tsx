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
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            {/* About Us */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">1. About Us</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  www.TouchConnectPro.com operates in USA and offers services in the following category: Other.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. Information We Collect</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We collect the following types of personal data from our users:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Email</li>
                  <li>Name</li>
                  <li>Cookies</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tools and Technologies Used */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">3. Tools and Technologies Used</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  To ensure the smooth operation and optimization of our services, we use the following tools and platforms:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Stripe</li>
                  <li>Mailchimp</li>
                </ul>
              </CardContent>
            </Card>

            {/* Use of Your Data */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Use of Your Data</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  The data we collect is used solely to operate our website, improve our services, and provide better user experiences. We do not sell or share your personal information with third parties without your consent, unless required by law.
                </p>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Data Protection</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Your Rights</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You have the right to access, correct, or delete your personal data. You may also object to or restrict certain data processing activities. To exercise your rights, please contact us at <span className="font-semibold">hello@touchconnectpro.com</span>.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> 7. Contact Us
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  If you have any questions or concerns about this Privacy Policy, please feel free to reach out to us at:
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-4">
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
