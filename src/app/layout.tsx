import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SupportAgent from "@/components/chat/SupportAgent";
import HideOnAdmin from "@/components/layout/HideOnAdmin";
import NewsletterModal from "@/components/modals/NewsletterModal";
import NewUserPopup from "@/components/modals/NewUserPopup";
import BottomNav from "@/components/layout/BottomNav";
import { ThemeProvider } from "next-themes";
import { CartProvider } from '@/context/CartContext';
import Script from "next/script";
import SplashScreen from "@/components/layout/SplashScreen";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: '--font-inter'
});

const engry = localFont({
  src: '../../public/fonts/engry.otf',
  variable: '--font-logo'
});

export const metadata: Metadata = {
  title: {
    default: "DualDeer | Premium Activewear & Luxury Athleisure",
    template: "%s | DualDeer",
  },
  description: "Discover DualDeer, the ultimate destination for premium activewear, luxury athleisure, and high-performance menswear. Elevate your lifestyle with aesthetic, gym-ready, and street-ready apparel.",
  keywords: [
    "DualDeer", "premium activewear", "luxury athleisure", "menswear", "gym wear",
    "high-performance sportswear", "aesthetic fitness apparel", "luxury workout clothes",
    "street-ready activewear", "men's gym clothing", "premium fitness gear", "lifestyle apparel",
    "workout gear", "elevated athleisure", "bodybuilding apparel", "sports fashion", "urban activewear"
  ],
  authors: [{ name: "DualDeer Team" }],
  creator: "DualDeer Official",
  publisher: "DualDeer",
  metadataBase: new URL("https://dualdeer.com"),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "DualDeer | Premium Activewear & Luxury Athleisure",
    description: "Shop DualDeer for exclusive luxury activewear, premium gym apparel, and high-performance streetwear. Designed for the relentless.",
    url: "https://dualdeer.com",
    siteName: "DualDeer",
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
    title: "DualDeer | Premium Activewear & Luxury Athleisure",
    description: "Elevate your performance. Explore the latest drop of luxury athleisure & activewear from DualDeer.",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DualDeer",
    "url": "https://dualdeer.com",
    "logo": "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=200",
    "sameAs": [
      "https://instagram.com/dualdeerofficial",
      "https://twitter.com/dualdeerofficial"
    ],
    "description": "Premium luxury athleisure, activewear, and performance menswear."
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${engry.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
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
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || 'XXXXXXXXXXXXX'}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID || 'XXXXXXXXXXXXX'}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <ThemeProvider defaultTheme="light" attribute="data-theme">
        <CartProvider>
            <SplashScreen />
            <HideOnAdmin>
              <Navbar />
              <NewsletterModal />
              <NewUserPopup />
            </HideOnAdmin>
            {children}
            <HideOnAdmin>
              <SupportAgent />
              <Footer />
              <BottomNav />
            </HideOnAdmin>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
