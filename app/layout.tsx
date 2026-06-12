import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Easy EMI Manager',
  description: 'Generate EMI payment schedule slips instantly for your mobile or electronics shop.',
  manifest: '/manifest.json',
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
