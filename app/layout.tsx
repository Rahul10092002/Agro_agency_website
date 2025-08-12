import type React from "react";
import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Hind } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { ShopProvider } from "@/contexts/shop-context";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  display: "swap",
  variable: "--font-hindi",
  // Added font optimization
  preload: true,
});

const hind = Hind({
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind",
  // Added font optimization
  preload: true,
});

export const metadata: Metadata = {
  title: "कृषि उत्पाद दुकान - गांव की सबसे अच्छी दुकान",
  description:
    "बीज, खाद, कीटनाशक और कृषि उपकरण - सब कुछ एक ही जगह। किसानों के लिए बेहतरीन गुणवत्ता और सही दाम।",
  generator: "v0.dev",
  keywords:
    "बीज, खाद, कीटनाशक, कृषि उपकरण, किसान, खेती, राम कृषि उत्पाद भंडार, मेरठ, उत्तर प्रदेश",
  // Added comprehensive SEO metadata
  authors: [{ name: "राम प्रसाद शर्मा" }],
  creator: "राम कृषि उत्पाद भंडार",
  publisher: "राम कृषि उत्पाद भंडार",
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
  openGraph: {
    type: "website",
    locale: "hi_IN",
    url: "https://ramkrishi.vercel.app",
    siteName: "राम कृषि उत्पाद भंडार",
    title: "कृषि उत्पाद दुकान - गांव की सबसे अच्छी दुकान",
    description: "बीज, खाद, कीटनाशक और कृषि उपकरण - सब कुछ एक ही जगह",
    images: [
      {
        url: "/placeholder.svg?height=630&width=1200",
        width: 1200,
        height: 630,
        alt: "राम कृषि उत्पाद भंडार - कृषि उत्पाद",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "कृषि उत्पाद दुकान - गांव की सबसे अच्छी दुकान",
    description: "बीज, खाद, कीटनाशक और कृषि उपकरण - सब कुछ एक ही जगह",
    images: ["/placeholder.svg?height=630&width=1200"],
  },
  verification: {
    google: "google-site-verification-code",
  },
  alternates: {
    canonical: "https://ramkrishi.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      className={`${notoSansDevanagari.variable} ${hind.variable}`}
    >
      <head>
        {/* Added performance and SEO optimizations */}
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://maps.google.com" />

        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "राम कृषि उत्पाद भंडार",
              description: "बीज, खाद, कीटनाशक और कृषि उपकरण की दुकान",
              url: "https://ramkrishi.vercel.app",
              telephone: "+91 9876543210",
              address: {
                "@type": "PostalAddress",
                streetAddress: "मुख्य बाजार, गांव - रामपुर",
                addressLocality: "मेरठ",
                addressRegion: "उत्तर प्रदेश",
                postalCode: "250001",
                addressCountry: "IN",
              },
              openingHours: "Mo-Sa 08:00-20:00",
              priceRange: "₹₹",
              servesCuisine: [],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "कृषि उत्पाद",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "बीज",
                      category: "Agricultural Seeds",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "खाद",
                      category: "Fertilizers",
                    },
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body className="font-hindi antialiased">
        <ErrorBoundary>
          <ShopProvider>
            <AuthProvider>{children}</AuthProvider>
          </ShopProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
