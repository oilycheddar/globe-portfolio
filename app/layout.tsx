import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { BrowserTheme } from '../components/BrowserTheme';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'George Bugg - Designer & Developer',
    template: '%s | George Bugg - Designer & Developer',
  },
  description: 'A Canadian product designer and no-code developer.',
  keywords: ['portfolio', 'developer', 'designer', 'creative'],
  authors: [{ name: 'George Bugg' }],
  creator: 'George Bugg',
  publisher: 'George Bugg',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://georgebugg.com',
    siteName: 'George Bugg - Designer & Developer',
    title: 'Bugg - Designer & Developer',
    description: 'A Canadian product designer and no-code developer.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Your Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Portfolio',
    description: 'Welcome to my portfolio website showcasing my work and skills.',
    images: ['/images/og-image.jpg'],
    creator: '@yourtwitter',
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <BrowserTheme />
        {children}
      </body>
    </html>
  );
} 