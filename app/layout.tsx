import { Metadata } from 'next';
import { ThemeColorManager } from '../components/ThemeColorManager';
import { themes } from '../styles/themes';
import StyledComponentsRegistry from './registry';
import Script from 'next/script';
import { defaultTheme } from '../styles/theme-init';

// Use the default theme from our theme store (default is 'slime')
const initialTheme = themes.slime;

export const metadata: Metadata = {
  title: 'George Visan — Product Designer',
  description: 'George is a product designer and no-code developer based in Calgary, Alberta.',
  keywords: ['product design', 'no-code development', 'portfolio', 'creative developer', 'UX design', 'product designer', 'designer', 'developer', 'staff designer'],
  authors: [{ name: 'Globe' }],
  creator: 'George VIsan',
  publisher: 'George Visan',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://georgevisan.com',
    siteName: 'George Visan — Product Designer',
    title: 'George Visan — Product Designer',
    description: 'George is a designer & no co-code developer based in Calgary, Alberta.',
    images: [
      {
        url: '/og-image.jpg', // You'll need to create this image
        width: 1200,
        height: 630,
        alt: 'George Visan — Product Designer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'George Visan — Product Designer',
    description: 'George is a product designer and no-code developer based in Calgary, Alberta.',
    images: ['/og-image.jpg'], // Same image as OpenGraph
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the initial theme color from the default theme (--color-page-content)
  const initialThemeColor = defaultTheme['--color-page-content'];

  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical fonts */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" 
          as="style"
        />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap"
          media="print"
        />
        <Script id="font-loading" strategy="afterInteractive">
          {`
            document.querySelector('link[rel="stylesheet"][media="print"]').media = 'all';
          `}
        </Script>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preload" href="/images/optimized/bg-noise-dune.webp" as="image" />
        <link rel="preload" href="/images/optimized/page-noise-dune.webp" as="image" />
        <link rel="preload" href="/images/optimized/dune_logo_noise.webp" as="image" />
      </head>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            const style = document.createElement('style');
            style.textContent = \`
              :root {
                --color-page-content: ${defaultTheme['--color-bg']};
                --color-bg: ${defaultTheme['--color-bg']};
                --color-text: ${defaultTheme['--color-text']};
                --bg-noise: ${defaultTheme['--bg-noise']};
                --page-noise: ${defaultTheme['--page-noise']};
                --logo-noise: ${defaultTheme['--logo-noise']};
              }
            \`;
            document.head.appendChild(style);
          `}
        </Script>
        <ThemeColorManager />
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
} 