import { Metadata } from 'next';
import { ThemeColorManager } from '../components/ThemeColorManager';
import { themes } from '../styles/themes';
import StyledComponentsRegistry from './registry';
import Script from 'next/script';
import { defaultTheme } from '../styles/theme-init';

// Use the default theme from our theme store (default is 'slime')
const initialTheme = themes.slime;

export const metadata: Metadata = {};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const themeColor = '#1A1A1A';

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
        <meta name="theme-color" content={initialThemeColor} />
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
                --color-page-content: ${defaultTheme['--color-page-content']};
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