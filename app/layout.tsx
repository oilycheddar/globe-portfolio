import { Metadata } from 'next';
import { ThemeColorManager } from '../components/ThemeColorManager';
import { themes } from '../styles/themes';
import StyledComponentsRegistry from './registry';

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
  const initialThemeColor = initialTheme['--color-page-content'];

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content={initialThemeColor} />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preload" href="/images/optimized/bg-noise-dune.webp" as="image" />
        <link rel="preload" href="/images/optimized/page-noise-dune.webp" as="image" />
        <link rel="preload" href="/images/optimized/dune_logo_noise.webp" as="image" />
      </head>
      <body>
        <ThemeColorManager />
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
} 