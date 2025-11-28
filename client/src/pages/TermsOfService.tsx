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
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">2. Use License</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Permission is granted to temporarily download one copy of the materials (information or software) on TouchConnectPro.com for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                  <li>Attempt to decompile or reverse engineer any software contained on TouchConnectPro.com</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </CardContent>
            </Card>

            {/* 3. Disclaimer */}
            <Card className="border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" /> 3. Disclaimer
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  The materials on TouchConnectPro.com are provided on an "as is" basis. TouchConnectPro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </CardContent>
            </Card>

            {/* 4. Limitations */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">4. Limitations</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  In no event shall TouchConnectPro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TouchConnectPro.com, even if TouchConnectPro or a TouchConnectPro authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </CardContent>
            </Card>

            {/* 5. Accuracy of Materials */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">5. Accuracy of Materials</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  The materials appearing on TouchConnectPro.com could include technical, typographical, or photographic errors. TouchConnectPro does not warrant that any of the materials on the Service are accurate, complete, or current. TouchConnectPro may make changes to the materials contained on the Service at any time without notice.
                </p>
              </CardContent>
            </Card>

            {/* 6. Materials Ownership */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">6. Materials Ownership</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  The materials on TouchConnectPro.com are owned by or licensed to TouchConnectPro and are protected by international copyright laws. All rights reserved.
                </p>
              </CardContent>
            </Card>

            {/* 7. Links */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">7. Links</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  TouchConnectPro has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by TouchConnectPro of the site. Use of any such linked website is at the user's own risk.
                </p>
              </CardContent>
            </Card>

            {/* 8. Modifications */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">8. Modifications</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  TouchConnectPro may revise these Terms of Service for the Service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these Terms of Service.
                </p>
              </CardContent>
            </Card>

            {/* 9. Governing Law */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">9. Governing Law</h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  These Terms and Conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </CardContent>
            </Card>

            {/* 10. Contact Information */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-6 w-6" /> 10. Contact Us
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
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
