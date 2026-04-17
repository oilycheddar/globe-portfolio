import type { AppProps } from 'next/app';
import { StyledComponentsProvider } from '../providers/StyledComponentsProvider';
import "../styles/globals.css";
import Head from 'next/head';
import Script from 'next/script';
import { defaultTheme } from '../styles/theme-init';
import { ThemeColorManager } from '../components/ThemeColorManager';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>George Visan — Product Designer</title>
        <meta name="description" content="Hello, world. I'm a product designer, AI maximalist and long distance athlete." />
        <meta name="keywords" content="product design, no-code development, portfolio, creative developer, UX design, product designer, designer, developer, staff designer" />
        <meta name="author" content="George Visan" />
        <meta name="creator" content="George Visan" />
        <meta name="publisher" content="George Visan" />
        <meta name="robots" content="index, follow" />
        
        {/* Theme & Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content={defaultTheme['--color-bg']} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta key="og:url" property="og:url" content="https://georgevisan.com" />
        <meta property="og:site_name" content="George Visan — Product Designer" />
        <meta key="og:title" property="og:title" content="George Visan — Product Designer" />
        <meta key="og:description" property="og:description" content="Hello, world. I'm a product designer, AI maximalist and long distance athlete." />
        <meta key="og:image" property="og:image" content="https://georgevisan.com/og-image.jpg" />
        <meta key="og:image:width" property="og:image:width" content="1200" />
        <meta key="og:image:height" property="og:image:height" content="630" />
        <meta key="og:image:alt" property="og:image:alt" content="George Visan — Product Designer" />
        <meta key="og:image:type" property="og:image:type" content="image/jpeg" />

        {/* Twitter */}
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content="George Visan — Product Designer" />
        <meta key="twitter:description" name="twitter:description" content="Hello, world. I'm a product designer, AI maximalist and long distance athlete." />
        <meta key="twitter:image" name="twitter:image" content="https://georgevisan.com/og-image.jpg" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" type="image/png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical fonts */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" 
          as="style"
        />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/images/optimized/bg-noise-dune.webp" as="image" />
        <link rel="preload" href="/images/optimized/page-noise-dune.webp" as="image" />
        <link rel="preload" href="/images/optimized/dune_logo_noise.webp" as="image" />
      </Head>

      {/* Font loading optimization */}
      <Script id="font-loading" strategy="afterInteractive">
        {`
          const fontLink = document.querySelector('link[rel="stylesheet"][media="print"]');
          if (fontLink) {
            fontLink.media = 'all';
          }
        `}
      </Script>

      {/* Initial theme setup */}
      <Script id="theme-init" strategy="beforeInteractive">
        {`
          (function() {
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
          })();
        `}
      </Script>

      <StyledComponentsProvider>
        <ThemeColorManager />
        <Component {...pageProps} />
      </StyledComponentsProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
