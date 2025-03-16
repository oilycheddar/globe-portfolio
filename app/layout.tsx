import { Metadata } from 'next';
import { ThemeColorManager } from '../components/ThemeColorManager';

export const metadata: Metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
  themeColor: '#1A1A1A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeColorManager />
        {children}
      </body>
    </html>
  );
} 