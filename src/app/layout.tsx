import { ThemeProvider } from "@/app/_components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { type Metadata, type Viewport } from "next";
import { Providers } from "./(frontend)/auth/providers";
import { cn } from "@/lib/utils";
import { WebVitals } from "@/components/performance/web-vitals";
import { Suspense } from "react";

// Enhanced metadata for better SEO and social sharing
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://replivity.com",
  ),
  title: {
    default: "Replivity - AI Social Media Replier",
    template: "%s | Replivity",
  },
  description:
    "AI-powered social media response generator. Create engaging replies across platforms with advanced AI models, browser extensions, and real-time analytics.",
  keywords: [
    "AI social media",
    "automated replies",
    "social media management",
    "AI content generation",
    "browser extension",
    "social media automation",
  ],
  authors: [{ name: "Replivity Team" }],
  creator: "Replivity",
  publisher: "Replivity",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-16x16.svg",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://replivity.com",
    siteName: "Replivity",
    title: "Replivity - AI Social Media Replier",
    description:
      "AI-powered social media response generator with multi-platform support and advanced analytics.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Replivity - AI Social Media Replier",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Replivity - AI Social Media Replier",
    description:
      "AI-powered social media response generator with multi-platform support and advanced analytics.",
    images: ["/twitter-image.svg"],
    creator: "@replivity",
  },
  alternates: {
    canonical: "https://replivity.com",
  },
};

// Viewport configuration for responsive design
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Root layout component with enhanced accessibility and performance
/**
 * Defines the root layout for the application, including HTML structure and provider wrappers.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/geist-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/geist-mono.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preconnect to external domains for performance */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com&display=optional"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for common external resources */}
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta
          httpEquiv="Referrer-Policy"
          content="strict-origin-when-cross-origin"
        />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Performance hints */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Additional SEO meta tags */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="google-site-verification" content="" />
        <meta name="msvalidate.01" content="" />
        <meta name="yandex-verification" content="" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Replivity",
              alternateName: "Replivity AI",
              description:
                "Leading AI-powered social media automation platform for businesses and content creators.",
              url: "https://replivity.com",
              logo: {
                "@type": "ImageObject",
                url: "https://replivity.com/og-image.svg",
                width: 1200,
                height: 630,
              },
              foundingDate: "2024",
              sameAs: [
                "https://twitter.com/replivity",
                "https://linkedin.com/company/replivity",
                "https://github.com/replivity",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "support@replivity.com",
                availableLanguage: "English",
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "US",
              },
            }),
          }}
        />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Replivity",
              alternateName: "Replivity AI Social Media Replier",
              url: "https://replivity.com",
              description:
                "AI-powered social media response generator with multi-platform support and advanced analytics.",
              publisher: {
                "@type": "Organization",
                name: "Replivity",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://replivity.com/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
              mainEntity: {
                "@type": "SoftwareApplication",
                name: "Replivity AI",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web Browser",
              },
            }),
          }}
        />

        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Replivity AI Social Media Replier",
              alternateName: "Replivity",
              description:
                "Advanced AI-powered social media response generator that helps businesses and content creators automate engaging replies across multiple platforms with intelligent context understanding.",
              url: "https://replivity.com",
              downloadUrl: "https://replivity.com/extension",
              applicationCategory: "BusinessApplication",
              applicationSubCategory: "Social Media Management",
              operatingSystem: [
                "Web Browser",
                "Chrome",
                "Firefox",
                "Safari",
                "Edge",
              ],
              softwareVersion: "6.0.0",
              datePublished: "2024-01-01",
              dateModified: new Date().toISOString().split("T")[0],
              author: {
                "@type": "Organization",
                name: "Replivity Team",
                url: "https://replivity.com",
              },
              publisher: {
                "@type": "Organization",
                name: "Replivity",
                url: "https://replivity.com",
              },
              offers: [
                {
                  "@type": "Offer",
                  name: "Free Plan",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  validFrom: "2024-01-01",
                },
                {
                  "@type": "Offer",
                  name: "Pro Plan",
                  price: "29",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  validFrom: "2024-01-01",
                  priceSpecification: {
                    "@type": "RecurringPaymentFrequency",
                    frequency: "monthly",
                  },
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
                bestRating: "5",
                worstRating: "1",
              },
              review: [
                {
                  "@type": "Review",
                  author: {
                    "@type": "Person",
                    name: "Sarah Johnson",
                  },
                  reviewRating: {
                    "@type": "Rating",
                    ratingValue: "5",
                    bestRating: "5",
                  },
                  reviewBody:
                    "Replivity has transformed how I manage social media responses. The AI is incredibly accurate and saves me hours every day.",
                },
              ],
              featureList: [
                "AI-powered response generation",
                "Multi-platform support",
                "Browser extension",
                "Real-time analytics",
                "Custom prompt templates",
                "Hashtag optimization",
                "Bio optimization",
                "Caption generation",
              ],
              screenshot: "https://replivity.com/og-image.svg",
              installUrl: "https://replivity.com/extension",
              supportingData: {
                "@type": "DataFeed",
                name: "Social Media Analytics",
              },
            }),
          }}
        />

        {/* Structured Data - Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: "AI Social Media Management",
              description:
                "Comprehensive AI-powered social media automation and response generation service.",
              provider: {
                "@type": "Organization",
                name: "Replivity",
              },
              serviceType: "Social Media Management",
              audience: {
                "@type": "Audience",
                audienceType: "Business",
              },
              availableChannel: {
                "@type": "ServiceChannel",
                serviceUrl: "https://replivity.com",
                serviceSmsNumber: "",
                servicePhone: "",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Replivity Plans",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Free Plan",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Pro Plan",
                    },
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
        suppressHydrationWarning
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
        >
          Skip to main content
        </a>

        <TRPCReactProvider>
          <Providers>
            <Suspense fallback={null}>
              <WebVitals />
            </Suspense>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="replivity-theme"
            >
              <main id="main-content" className="relative">
                {children}
              </main>

              {/* Toast notifications */}
              <Toaster
                position="bottom-right"
                expand={false}
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                  className: "font-sans",
                }}
              />
            </ThemeProvider>
          </Providers>
        </TRPCReactProvider>

        {/* Accessibility: Announce dynamic content changes */}
        <div
          id="announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  );
}
