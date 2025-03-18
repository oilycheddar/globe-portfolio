import { Metadata } from 'next';
import { ThemeColorManager } from '../components/ThemeColorManager';

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
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/images/optimized/bg-noise-dune.webp" as="image" />
        <link rel="preload" href="/images/optimized/page-noise-dune.webp" as="image" />
        <link rel="preload" href="/images/optimized/dune_logo_noise.webp" as="image" />
      </head>
      <body>
        <ThemeColorManager />
        {children}
      </body>
    </html>
  );
} 