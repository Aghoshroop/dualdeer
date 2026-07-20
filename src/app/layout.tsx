import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SupportAgent from "@/components/chat/SupportAgent";
import HideOnAdmin from "@/components/layout/HideOnAdmin";
import NewsletterModal from "@/components/modals/NewsletterModal";
import BottomNav from "@/components/layout/BottomNav";
import { ThemeProvider } from "next-themes";
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import Script from "next/script";
import SplashScreen from "@/components/layout/SplashScreen";
import CustomCursor from "@/components/layout/CustomCursor";
import { Analytics } from "@vercel/analytics/react";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import MetaPixelTracker from "@/components/analytics/MetaPixelTracker";
import { Suspense } from "react";
import { AuthToastProvider } from "@/context/AuthToastContext";
import MaintenanceWrapper from "@/components/layout/MaintenanceWrapper";

export const metadata: Metadata = {
  title: "Best Gym Wear & Premium Activewear in Kolkata | DualDeer Elite",
  description: "Shop the best gym wear and premium activewear in Kolkata. DualDeer's Elite Collection features the world's best fabrics and high-performance SpeedSuits.",
  keywords: [
    "best activewear", "best gym wears", "best fabrics", "DualDeer", "SpeedSuit", "DualDeer SpeedSuits", 
    "premium activewear kolkata", "luxury athleisure kolkata", "best gym clothes in kolkata", "mens gym wear kolkata",
    "high-performance sportswear", "elite activewear collection", "luxury workout clothes",
    "street-ready activewear", "premium fitness gear", "lifestyle apparel",
    "workout gear", "elevated athleisure", "bodybuilding apparel", "sports fashion", "urban activewear","speedsuits india",
    "buy speedsuit india", "compression wear india", "gym compression suit india"
  ],
  authors: [{ name: "DualDeer Team" }],
  creator: "DualDeer Official",
  publisher: "DualDeer",
  metadataBase: new URL("https://dualdeer.com"),
  alternates: {
    canonical: 'https://dualdeer.com',
  },
  verification: {
   google: "cvUp3ToWivbX7NaGg_l0-rNmvUI3JfmUJ-yeYR8BSBQ",
  },
  openGraph: {

    title: "Best Gym Wear & Premium Activewear in Kolkata | DualDeer",
    description: "Discover DualDeer's Elite Collection — the absolute best activewear featuring world-class fabrics engineered for peak performance.",
    url: "https://dualdeer.com",
    siteName: "DualDeer Elite Activewear",
    images: [
      {
        url: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=1200&auto=format&fit=crop", // Dynamic luxury activewear cover
        width: 1200,
        height: 630,
        alt: "DualDeer Premium Activewear Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DualDeer SpeedSuits | Premium Activewear for Performance",
    description: "Discover DualDeer SpeedSuits — premium high-performance activewear engineered for athletes.",
    images: ["https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=1200&auto=format&fit=crop"],
    creator: "@DualDeerOfficial",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: "clothing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "DualDeer",
      "url": "https://dualdeer.com",
      "logo": "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=200",
      "slogan": "The vanguard of human performance.",
      "founder": {
        "@type": "Person",
        "name": "The DualDeer Team"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@dualdeer.com",
        "availableLanguage": ["English", "Hindi"]
      },
      "sameAs": [
        "https://instagram.com/dualdeerofficial",
        "https://twitter.com/dualdeerofficial"
      ],
      "description": "DualDeer is Kolkata's premier luxury athleisure and high-performance activewear brand, renowned for its Elite collection and signature SpeedSuits built from the world's best fabrics.",
      "knowsAbout": ["Premium Activewear", "SpeedSuits", "Compression Wear", "Best Gym Wear in Kolkata", "Luxury Athleisure"],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kolkata",
        "addressRegion": "West Bengal",
        "addressCountry": "IN"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "DualDeer",
      "url": "https://dualdeer.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://dualdeer.com/shop?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SportsActivityLocation",
      "name": "DualDeer Activewear",
      "url": "https://dualdeer.com",
      "image": "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=200",
      "priceRange": "$$$",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kolkata",
        "addressRegion": "West Bengal",
        "addressCountry": "IN"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is DualDeer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DualDeer is a premium luxury activewear and athleisure brand in India, specializing in high-performance apparel engineered for elite athletes and modern professionals."
          }
        },
        {
          "@type": "Question",
          "name": "What is a SpeedSuit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A SpeedSuit is a proprietary high-performance compression garment designed by DualDeer. It features seamless, chafe-free construction and intelligent compression zones for superior muscle stabilization and recovery."
          }
        },
        {
          "@type": "Question",
          "name": "Where is DualDeer located?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DualDeer is designed globally and based in Kolkata, West Bengal, delivering premium activewear and athleisure across India."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best activewear brand in Kolkata?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "DualDeer is widely considered the best activewear brand in Kolkata, offering an Elite collection built from the best fabrics for peak physical performance and unmatched style."
          }
        }
      ]
    }
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}');
          `}
        </Script>

        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        <Suspense fallback={null}>
          <MetaPixelTracker />
        </Suspense>
        <ThemeProvider defaultTheme="light" attribute="data-theme">
        <CustomCursor />
        <MaintenanceWrapper>
          <CurrencyProvider>
            <CartProvider>
              <SplashScreen />
              <HideOnAdmin>
                <Navbar />
                <NewsletterModal />
              </HideOnAdmin>
              <AuthToastProvider>
                <SmoothScrollProvider>
                  {children}
                </SmoothScrollProvider>
              </AuthToastProvider>
              <HideOnAdmin>
                <SupportAgent />
                <Footer />
                <BottomNav />
              </HideOnAdmin>
            </CartProvider>
          </CurrencyProvider>
        </MaintenanceWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
