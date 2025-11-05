/* eslint-disable react/no-unescaped-entities */
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
  FileText,
  Calendar,
  Shield,
  AlertTriangle,
  Mail,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Replivity",
  description:
    "Terms of Service for Replivity - AI Social Media Replier SaaS Platform. Learn about our service terms, user responsibilities, and legal agreements.",
  keywords: [
    "terms of service",
    "legal",
    "agreement",
    "AI social media",
    "SaaS terms",
    "user agreement",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Terms of Service | Replivity",
    description:
      "Terms of Service for Replivity - AI Social Media Replier SaaS Platform",
    type: "website",
  },
};

const lastUpdated = "January 15, 2024";
const effectiveDate = "January 15, 2024";

/**
 * Renders the Terms of Service page component.
 */
export default function TermsOfServicePage() {
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Scale className="text-primary h-8 w-8" />
            <h1 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
              Terms of Service
            </h1>
          </div>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Please read these terms carefully before using Replivity's AI Social
            Media Replier platform.
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
              <Shield className="text-primary h-5 w-5" />
              Legal Agreement
            </CardTitle>
            <CardDescription>
              By accessing or using Replivity, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                {/* Section 1: Acceptance of Terms */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    1. Acceptance of Terms
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      By accessing and using Replivity ("the Service"), you
                      accept and agree to be bound by the terms and provision of
                      this agreement. If you do not agree to abide by the above,
                      please do not use this service.
                    </p>
                    <p>
                      These Terms of Service ("Terms") govern your use of our
                      AI-powered social media reply generation platform,
                      including our web application and browser extension.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 2: Service Description */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    2. Service Description
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      Replivity is an AI-powered Software as a Service (SaaS)
                      platform that generates contextual replies for social
                      media posts. Our service includes:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        AI-generated social media replies using advanced
                        language models
                      </li>
                      <li>
                        Multi-platform support (Twitter, LinkedIn, Facebook,
                        Instagram)
                      </li>
                      <li>Browser extension for seamless integration</li>
                      <li>Customizable reply templates and tone settings</li>
                      <li>Analytics and performance tracking</li>
                      <li>Team collaboration features</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 3: User Accounts and Registration */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    3. User Accounts and Registration
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      To access certain features of the Service, you must
                      register for an account. You agree to:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        Provide accurate, current, and complete information
                        during registration
                      </li>
                      <li>
                        Maintain and promptly update your account information
                      </li>
                      <li>
                        Maintain the security of your password and account
                      </li>
                      <li>
                        Accept responsibility for all activities under your
                        account
                      </li>
                      <li>
                        Notify us immediately of any unauthorized use of your
                        account
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 4: Acceptable Use Policy */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    4. Acceptable Use Policy
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>You agree not to use the Service to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        Generate harmful, abusive, threatening, or
                        discriminatory content
                      </li>
                      <li>
                        Spam or harass other users on social media platforms
                      </li>
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe upon intellectual property rights</li>
                      <li>
                        Attempt to reverse engineer or compromise our systems
                      </li>
                      <li>
                        Share your account credentials with unauthorized parties
                      </li>
                      <li>
                        Use the service for commercial purposes beyond your
                        subscription tier
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 5: Subscription and Billing */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    5. Subscription and Billing
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      Replivity offers various subscription plans with different
                      features and usage limits:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        Subscription fees are billed in advance on a monthly or
                        annual basis
                      </li>
                      <li>
                        All fees are non-refundable except as required by law
                      </li>
                      <li>
                        You may cancel your subscription at any time through
                        your account settings
                      </li>
                      <li>
                        Upon cancellation, you retain access until the end of
                        your billing period
                      </li>
                      <li>
                        We reserve the right to change pricing with 30 days
                        notice
                      </li>
                      <li>Failed payments may result in service suspension</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 6: Data Privacy and Security */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    6. Data Privacy and Security
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      We take your privacy seriously. Our data handling
                      practices include:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>Encryption of data in transit and at rest</li>
                      <li>
                        Limited data collection necessary for service
                        functionality
                      </li>
                      <li>No sale of personal data to third parties</li>
                      <li>
                        Compliance with GDPR, CCPA, and other privacy
                        regulations
                      </li>
                      <li>Regular security audits and updates</li>
                      <li>User control over data deletion and export</li>
                    </ul>
                    <p>
                      For detailed information about our data practices, please
                      review our{" "}
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 7: AI Content and Disclaimers */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    7. AI-Generated Content
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                            Important Disclaimer
                          </h4>
                          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                            AI-generated content may not always be accurate,
                            appropriate, or suitable for your specific context.
                          </p>
                        </div>
                      </div>
                    </div>
                    <p>Regarding AI-generated content:</p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        You are responsible for reviewing and approving all
                        generated content before posting
                      </li>
                      <li>
                        We do not guarantee the accuracy, appropriateness, or
                        quality of AI-generated replies
                      </li>
                      <li>
                        You retain full responsibility for content posted using
                        our service
                      </li>
                      <li>
                        We reserve the right to improve our AI models and
                        algorithms
                      </li>
                      <li>
                        Generated content should comply with platform-specific
                        guidelines
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 8: Intellectual Property */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    8. Intellectual Property
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      The Service and its original content, features, and
                      functionality are owned by Replivity and are protected by
                      international copyright, trademark, patent, trade secret,
                      and other intellectual property laws.
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>
                        You retain ownership of content you input into our
                        service
                      </li>
                      <li>
                        You grant us a license to process your content to
                        provide the service
                      </li>
                      <li>
                        Generated replies become your content upon creation
                      </li>
                      <li>
                        Our AI models, algorithms, and platform remain our
                        intellectual property
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                {/* Section 9: Limitation of Liability */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    9. Limitation of Liability
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      To the maximum extent permitted by law, Replivity shall
                      not be liable for any indirect, incidental, special,
                      consequential, or punitive damages, including but not
                      limited to:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>Loss of profits, data, or business opportunities</li>
                      <li>Service interruptions or technical failures</li>
                      <li>Third-party actions or platform policy violations</li>
                      <li>Consequences of AI-generated content usage</li>
                    </ul>
                    <p>
                      Our total liability shall not exceed the amount paid by
                      you for the service in the 12 months preceding the claim.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 10: Termination */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    10. Termination
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      We may terminate or suspend your account and access to the
                      Service immediately, without prior notice, for conduct
                      that we believe:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>Violates these Terms of Service</li>
                      <li>Is harmful to other users or our business</li>
                      <li>Violates applicable laws or regulations</li>
                      <li>Is fraudulent or involves unauthorized use</li>
                    </ul>
                    <p>
                      Upon termination, your right to use the Service will cease
                      immediately, and we may delete your account data after a
                      reasonable retention period.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 11: Changes to Terms */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    11. Changes to Terms
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      We reserve the right to modify these Terms at any time. We
                      will notify users of material changes via:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                      <li>Email notification to registered users</li>
                      <li>In-app notifications</li>
                      <li>Updates to this page with revised effective date</li>
                    </ul>
                    <p>
                      Continued use of the Service after changes constitutes
                      acceptance of the new Terms.
                    </p>
                  </div>
                </section>

                <Separator />

                {/* Section 12: Contact Information */}
                <section>
                  <h2 className="text-primary mb-4 text-2xl font-semibold">
                    12. Contact Information
                  </h2>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      If you have any questions about these Terms of Service,
                      please contact us:
                    </p>
                    <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="text-primary h-4 w-4" />
                        <span className="font-medium">Email:</span>
                        <Link
                          href="mailto:legal@replivity.com"
                          className="text-primary hover:underline"
                        >
                          legal@replivity.com
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="text-primary h-4 w-4" />
                        <span className="font-medium">Support:</span>
                        <Link
                          href="/contact"
                          className="text-primary hover:underline"
                        >
                          Contact Form
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
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
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
