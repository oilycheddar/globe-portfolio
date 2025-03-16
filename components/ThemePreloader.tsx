import { useEffect } from 'react';
import { themes } from '../styles/themes';

const extractUrls = (themeObject: Record<string, any>): string[] => {
  const urls: string[] = [];
  Object.values(themeObject).forEach(value => {
    if (typeof value === 'string' && value.startsWith('url(')) {
      // Extract URL from the CSS url() function and remove quotes
      const url = value.slice(4, -1).replace(/['"]/g, '');
      urls.push(url);
    }
  });
  return urls;
};

export default function ThemePreloader() {
  useEffect(() => {
    // Get all unique image URLs from themes
    const imageUrls = new Set<string>();
    Object.values(themes).forEach(theme => {
      extractUrls(theme).forEach(url => imageUrls.add(url));
    });

    // Preload all images
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // This component doesn't render anything
  return null;
} 