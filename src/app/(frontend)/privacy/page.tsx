/* eslint-disable react/no-unescaped-entities */
import { type Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Calendar,
  FileText,
  Lock,
  Eye,
  Database,
  UserCheck,
  Mail,
  Globe,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Replivity",
  description:
    "Privacy Policy for Replivity - AI Social Media Replier SaaS Platform. Learn how we collect, use, and protect your personal information.",
  keywords: [
    "privacy policy",
    "data protection",
    "GDPR",
    "CCPA",
    "AI social media",
    "data privacy",
    "personal information",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Privacy Policy | Replivity",
    description:
      "Privacy Policy for Replivity - AI Social Media Replier SaaS Platform",
    type: "website",
  },
};

const lastUpdated = "January 15, 2024";
const effectiveDate = "January 15, 2024";

/**
 * Renders the Privacy Policy page with detailed information on data protection and privacy practices.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Shield className="text-primary h-8 w-8" />
            <h1 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
              Privacy Policy
            </h1>
          </div>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last Updated: {lastUpdated}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Effective: {effectiveDate}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="text-primary h-5 w-5" />
              Data Protection & Privacy
            </CardTitle>
            <CardDescription>
              We are committed to protecting your privacy and ensuring the
              security of your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                {/* Section 1: Introduction */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    1. Introduction
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      Replivity ("we," "our," or "us") respects your privacy and
                      is committed to protecting your personal data. This
                      Privacy Policy explains how we collect, use, disclose, and
                      safeguard your information when you use our AI-powered
                      social media reply generation service.
                    </p>
                    <p>
                      This policy applies to our web application, browser
                      extension, and all related services (collectively, "the
                      Service").
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 2: Information We Collect */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    2. Information We Collect
                  </h2>
                  <div className="text-muted-foreground space-y-4">
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                        <UserCheck className="text-primary h-4 w-4" />
                        Personal Information
                      </h3>
                      <ul className="list-disc space-y-1 pl-6">
                        <li>Name and email address (for account creation)</li>
                        <li>Profile information (optional)</li>
                        <li>
                          Billing information (processed securely through
                          payment providers)
                        </li>
                        <li>Communication preferences</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                        <Database className="text-primary h-4 w-4" />
                        Usage Data
                      </h3>
                      <ul className="list-disc space-y-1 pl-6">
                        <li>
                          Social media posts you analyze (temporarily, for reply
                          generation)
                        </li>
                        <li>Generated replies and templates</li>
                        <li>Usage statistics and analytics</li>
                        <li>Feature preferences and settings</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                        <Globe className="text-primary h-4 w-4" />
                        Technical Information
                      </h3>
                      <ul className="list-disc space-y-1 pl-6">
                        <li>IP address and location data</li>
                        <li>Browser type and version</li>
                        <li>Device information</li>
                        <li>Log files and error reports</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 3: How We Use Your Information */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    3. How We Use Your Information
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>We use your information to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>Provide the Service:</strong> Generate
                        AI-powered social media replies and manage your account
                      </li>
                      <li>
                        <strong>Improve Our Service:</strong> Analyze usage
                        patterns to enhance features and performance
                      </li>
                      <li>
                        <strong>Communication:</strong> Send service updates,
                        security alerts, and support messages
                      </li>
                      <li>
                        <strong>Billing:</strong> Process payments and manage
                        subscriptions
                      </li>
                      <li>
                        <strong>Security:</strong> Detect and prevent fraud,
                        abuse, and security threats
                      </li>
                      <li>
                        <strong>Legal Compliance:</strong> Meet legal
                        obligations and enforce our terms
                      </li>
                      <li>
                        <strong>Analytics:</strong> Understand user behavior and
                        improve user experience
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 4: Data Sharing and Disclosure */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    4. Data Sharing and Disclosure
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      We do not sell your personal data. We may share your
                      information only in these circumstances:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>Service Providers:</strong> Trusted third
                        parties who help us operate our service (hosting,
                        payment processing, analytics)
                      </li>
                      <li>
                        <strong>AI Model Providers:</strong> Anonymized data may
                        be sent to AI services (OpenAI, Anthropic, etc.) for
                        reply generation
                      </li>
                      <li>
                        <strong>Legal Requirements:</strong> When required by
                        law, court order, or government request
                      </li>
                      <li>
                        <strong>Business Transfers:</strong> In case of merger,
                        acquisition, or sale of assets
                      </li>
                      <li>
                        <strong>Safety:</strong> To protect rights, property, or
                        safety of users or the public
                      </li>
                    </ul>
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Important:</strong> Social media content you
                        analyze is processed temporarily and not stored
                        permanently. We use this data solely to generate replies
                        and improve our AI models.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 5: Data Security */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    5. Data Security
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      We implement industry-standard security measures to
                      protect your data:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>Encryption:</strong> Data encrypted in transit
                        (TLS) and at rest (AES-256)
                      </li>
                      <li>
                        <strong>Access Controls:</strong> Strict access controls
                        and authentication requirements
                      </li>
                      <li>
                        <strong>Regular Audits:</strong> Security assessments
                        and vulnerability testing
                      </li>
                      <li>
                        <strong>Secure Infrastructure:</strong> Cloud providers
                        with SOC 2 Type II compliance
                      </li>
                      <li>
                        <strong>Data Minimization:</strong> We collect and
                        retain only necessary data
                      </li>
                      <li>
                        <strong>Incident Response:</strong> Procedures for
                        detecting and responding to security incidents
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 6: Your Rights and Choices */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    6. Your Rights and Choices
                  </h2>
                  <div className="text-muted-foreground space-y-4">
                    <p>
                      Depending on your location, you may have the following
                      rights:
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-semibold">
                          GDPR Rights (EU Users)
                        </h4>
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                          <li>Access your personal data</li>
                          <li>Rectify inaccurate data</li>
                          <li>Erase your data ("right to be forgotten")</li>
                          <li>Restrict processing</li>
                          <li>Data portability</li>
                          <li>Object to processing</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">
                          CCPA Rights (California Users)
                        </h4>
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                          <li>Know what data we collect</li>
                          <li>Delete personal information</li>
                          <li>Opt-out of data sales (we don't sell data)</li>
                          <li>Non-discrimination for exercising rights</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="mb-2 font-semibold">
                        How to Exercise Your Rights
                      </h4>
                      <p className="text-sm">
                        Contact us at{" "}
                        <Link
                          href="mailto:privacy@replivity.com"
                          className="text-primary hover:underline"
                        >
                          privacy@replivity.com
                        </Link>{" "}
                        or use our{" "}
                        <Link
                          href="/contact"
                          className="text-primary hover:underline"
                        >
                          contact form
                        </Link>
                        . We will respond within 30 days.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 7: Cookies and Tracking */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    7. Cookies and Tracking Technologies
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>We use cookies and similar technologies to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>Essential Cookies:</strong> Required for basic
                        functionality (authentication, security)
                      </li>
                      <li>
                        <strong>Analytics Cookies:</strong> Help us understand
                        how you use our service
                      </li>
                      <li>
                        <strong>Preference Cookies:</strong> Remember your
                        settings and preferences
                      </li>
                      <li>
                        <strong>Marketing Cookies:</strong> Deliver relevant
                        content and measure campaign effectiveness
                      </li>
                    </ul>
                    <p>
                      You can control cookies through your browser settings.
                      Note that disabling certain cookies may affect service
                      functionality.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 8: Data Retention */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    8. Data Retention
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      We retain your data for different periods based on the
                      type of information:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        <strong>Account Data:</strong> Until you delete your
                        account or request deletion
                      </li>
                      <li>
                        <strong>Usage Data:</strong> Up to 2 years for analytics
                        and service improvement
                      </li>
                      <li>
                        <strong>Social Media Content:</strong> Processed
                        temporarily and not permanently stored
                      </li>
                      <li>
                        <strong>Billing Records:</strong> 7 years for tax and
                        legal compliance
                      </li>
                      <li>
                        <strong>Support Communications:</strong> 3 years for
                        quality assurance
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 9: International Data Transfers */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    9. International Data Transfers
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      Your data may be transferred to and processed in countries
                      other than your own. We ensure adequate protection
                      through:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        Standard Contractual Clauses (SCCs) approved by the
                        European Commission
                      </li>
                      <li>Adequacy decisions for certain countries</li>
                      <li>Certification schemes and codes of conduct</li>
                      <li>Binding corporate rules where applicable</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 10: Children's Privacy */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    10. Children's Privacy
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      Our Service is not intended for children under 13 years of
                      age. We do not knowingly collect personal information from
                      children under 13. If you are a parent or guardian and
                      believe your child has provided us with personal
                      information, please contact us immediately.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 11: Changes to Privacy Policy */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    11. Changes to This Privacy Policy
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      We may update this Privacy Policy from time to time. We
                      will notify you of any material changes by:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>Email notification to registered users</li>
                      <li>Prominent notice on our website</li>
                      <li>In-app notifications</li>
                    </ul>
                    <p>
                      The updated policy will be effective immediately upon
                      posting unless otherwise specified.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 12: Contact Information */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    12. Contact Us
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      If you have any questions about this Privacy Policy or our
                      data practices, please contact us:
                    </p>
                    <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="text-primary h-4 w-4" />
                        <span className="font-medium">Privacy Officer:</span>
                        <Link
                          href="mailto:privacy@replivity.com"
                          className="text-primary hover:underline"
                        >
                          privacy@replivity.com
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="text-primary h-4 w-4" />
                        <span className="font-medium">General Support:</span>
                        <Link
                          href="/contact"
                          className="text-primary hover:underline"
                        >
                          Contact Form
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="text-primary h-4 w-4" />
                        <span className="font-medium">
                          Data Protection Officer:
                        </span>
                        <Link
                          href="mailto:dpo@replivity.com"
                          className="text-primary hover:underline"
                        >
                          dpo@replivity.com
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <div className="text-muted-foreground flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <span>•</span>
            <Link
              href="/contact"
              className="hover:text-primary transition-colors"
            >
              Contact Us
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-primary transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
