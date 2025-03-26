import type { AppProps } from 'next/app';
import { StyledComponentsProvider } from '../providers/StyledComponentsProvider';
import "../styles/globals.css";
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>George Visan — Product Designer</title>
        <meta name="description" content="Hello, world. I'm a self-taught designer with strong opinions, attention to detail, and an unwavering ability to find simplicity." />
        <meta name="keywords" content="product design, no-code development, portfolio, creative developer, UX design, product designer, designer, developer, staff designer" />
        <meta name="author" content="George Visan" />
        <meta name="creator" content="George Visan" />
        <meta name="publisher" content="George Visan" />
        <meta name="robots" content="index, follow" />
        
        {/* Theme */}
        <meta name="theme-color" content="#00623A" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://georgevisan.com" />
        <meta property="og:site_name" content="George Visan — Product Designer" />
        <meta property="og:title" content="George Visan — Product Designer" />
        <meta property="og:description" content="Hello, world. I'm a self-taught designer with strong opinions, attention to detail, and an unwavering ability to find simplicity." />
        <meta property="og:image" content="https://georgevisan.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="George Visan — Product Designer" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="George Visan — Product Designer" />
        <meta name="twitter:description" content="Hello, world. I'm a self-taught designer with strong opinions, attention to detail, and an unwavering ability to find simplicity." />
        <meta name="twitter:image" content="https://georgevisan.com/og-image.jpg" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" type="image/png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <StyledComponentsProvider>
        <Component {...pageProps} />
      </StyledComponentsProvider>
    </>
  );
}
