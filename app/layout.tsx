import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

const GA_ID = 'G-XXXXXXXXXX' // ← ใส่ Google Analytics ID จริงของคุณ

export const metadata: Metadata = {
  title: 'RentHub — เช่าทุกอย่างในที่เดียว',
  description: 'แพลตฟอร์มเช่าสินค้าออนไลน์ บ้าน รถ อุปกรณ์ เสื้อผ้า',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  // ✅ Open Graph
  openGraph: {
    title: 'RentHub — เช่าทุกอย่างในที่เดียว',
    description: 'แพลตฟอร์มเช่าสินค้าออนไลน์ บ้าน รถ อุปกรณ์ เสื้อผ้า',
    url: 'https://rental-marketplace-red.vercel.app',
    siteName: 'RentHub',
    images: [
      {
        url: 'https://rental-marketplace-red.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RentHub',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  // ✅ Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'RentHub — เช่าทุกอย่างในที่เดียว',
    description: 'แพลตฟอร์มเช่าสินค้าออนไลน์ บ้าน รถ อุปกรณ์ เสื้อผ้า',
    images: ['https://rental-marketplace-red.vercel.app/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RentHub',
  },
  icons: { apple: '/icon-192.png' },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RentHub" />
      </head>
      <body className={inter.className}>
        {/* ✅ Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}