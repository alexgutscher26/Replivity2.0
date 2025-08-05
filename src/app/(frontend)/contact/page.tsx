import ContactSection from "./_components/contact-section";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get Support & Connect with Replivity",
  description: "Get in touch with Replivity for support, partnerships, or questions about our AI social media management platform. We're here to help you succeed.",
  keywords: [
    "contact replivity",
    "customer support",
    "AI social media help",
    "technical support",
    "business inquiries",
    "partnership opportunities",
  ],
  openGraph: {
    title: "Contact Us | Replivity",
    description: "Get in touch with our team for support and inquiries about AI social media management.",
    type: "website",
  },
};

// Structured data for contact information
const contactStructuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Replivity",
  "description": "Get in touch with Replivity for support, partnerships, or questions about our AI social media management platform.",
  "url": "https://replivity.com/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "Replivity",
    "url": "https://replivity.com",
    "logo": "https://replivity.com/logo.png",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@replivity.com",
        "availableLanguage": ["English"],
        "areaServed": "Worldwide",
        "serviceType": "Technical Support"
      },
      {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "sales@replivity.com",
        "availableLanguage": ["English"],
        "areaServed": "Worldwide",
        "serviceType": "Sales Inquiries"
      },
      {
        "@type": "ContactPoint",
        "contactType": "business partnerships",
        "email": "partnerships@replivity.com",
        "availableLanguage": ["English"],
        "areaServed": "Worldwide",
        "serviceType": "Partnership Opportunities"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressRegion": "Global"
    },
    "sameAs": [
      "https://twitter.com/replivity",
      "https://linkedin.com/company/replivity",
      "https://facebook.com/replivity"
    ]
  },
  "potentialAction": {
    "@type": "CommunicateAction",
    "name": "Contact Support",
    "description": "Send a message to our support team for assistance"
  }
};

export default async function ContactPage() {
  return (
    <>
      {/* Structured Data for Contact Information */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactStructuredData)
        }}
      />
      
      <ContactSection />
    </>
  );
}
