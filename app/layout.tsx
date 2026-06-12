import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://easy-emi-mu.vercel.app'),
  title: 'Easy EMI Manager - Offline EMI Payment Schedule Generator',
  description: 'Generate high-quality printable EMI payment schedule slips instantly for your mobile or electronics shop. Works 100% offline, privacy-first, and saves local logs.',
  keywords: [
    'EMI Manager',
    'EMI Slip Generator',
    'EMI Calculator',
    'Offline EMI App',
    'Mobile Finance Schedule',
    'Installment Scheduler',
    'Shop billing helper',
    'Bajaj TVS finance checklist'
  ],
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://easy-emi-mu.vercel.app/',
    title: 'Easy EMI Manager - Offline EMI Payment Schedule Generator',
    description: 'Generate high-quality printable EMI payment schedule slips instantly for your mobile or electronics shop. Works 100% offline, privacy-first, and saves local logs.',
    siteName: 'Easy EMI Manager',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'Easy EMI Manager Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Easy EMI Manager - Offline EMI Payment Schedule Generator',
    description: 'Generate high-quality printable EMI payment schedule slips instantly for your mobile or electronics shop. Works 100% offline, privacy-first, and saves local logs.',
    images: ['/icon.svg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Easy EMI Manager',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
