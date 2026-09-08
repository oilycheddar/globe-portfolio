import type { AppProps } from 'next/app';
import { StyledComponentsProvider } from '../providers/StyledComponentsProvider';
import "../styles/globals.css";
import Head from 'next/head';
import { defaultTheme } from '../styles/theme-init';
import { ThemeColorManager } from '../components/ThemeColorManager';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>George Bugg — Product Designer</title>
        <meta name="description" content="Hello, world. I'm a product designer, AI maximalist and long distance athlete." />
        <meta name="keywords" content="product design, no-code development, portfolio, creative developer, UX design, product designer, designer, developer, staff designer" />
        <meta name="author" content="George Bugg" />
        <meta name="creator" content="George Bugg" />
        <meta name="publisher" content="George Bugg" />
        <meta name="robots" content="index, follow" />
        
        {/* Theme & Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content={defaultTheme['--color-bg']} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta key="og:url" property="og:url" content="https://georgebugg.com" />
        <meta property="og:site_name" content="George Bugg — Product Designer" />
        <meta key="og:title" property="og:title" content="George Bugg — Product Designer" />
        <meta key="og:description" property="og:description" content="Hello, world. I'm a product designer, AI maximalist and long distance athlete." />
        <meta key="og:image" property="og:image" content="https://georgebugg.com/og-image.jpg" />
        <meta key="og:image:width" property="og:image:width" content="1200" />
        <meta key="og:image:height" property="og:image:height" content="630" />
        <meta key="og:image:alt" property="og:image:alt" content="George Bugg — Product Designer" />
        <meta key="og:image:type" property="og:image:type" content="image/jpeg" />

        {/* Twitter */}
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content="George Bugg — Product Designer" />
        <meta key="twitter:description" name="twitter:description" content="Hello, world. I'm a product designer, AI maximalist and long distance athlete." />
        <meta key="twitter:image" name="twitter:image" content="https://georgebugg.com/og-image.jpg" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" type="image/png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <style jsx global>{`
        :root {
          --font-mono: ${jetbrainsMono.style.fontFamily};
        }
      `}</style>

      <StyledComponentsProvider>
        <ThemeColorManager />
        <Component {...pageProps} />
      </StyledComponentsProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
