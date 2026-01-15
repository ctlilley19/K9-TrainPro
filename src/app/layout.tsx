import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'K9 ProTrain - Professional Dog Training Management',
    template: '%s | K9 ProTrain',
  },
  description:
    'Comprehensive SaaS platform for professional dog training facilities. Real-time updates, automated reports, gamification, and more.',
  keywords: [
    'dog training',
    'board and train',
    'pet management',
    'training facility',
    'dog trainer software',
  ],
  authors: [{ name: 'Lazy E Holdings LLC' }],
  creator: 'Lazy E Holdings LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'K9 ProTrain - Professional Dog Training Management',
    description:
      'Comprehensive SaaS platform for professional dog training facilities.',
    siteName: 'K9 ProTrain',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K9 ProTrain',
    description:
      'Professional dog training management platform with real-time updates and gamification.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f59e0b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
