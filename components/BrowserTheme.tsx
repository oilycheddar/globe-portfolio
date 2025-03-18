'use client';

import { useEffect } from 'react';
import { useVisualStore } from '../hooks/useVisualStore';
import { themes } from '../styles/themes';

export function BrowserTheme() {
  const { theme } = useVisualStore();

  useEffect(() => {
    // Get theme color from current theme
    const themeColor = themes[theme as keyof typeof themes]['--color-bg'];
    
    // Update theme-color meta tags
    const metaTags = [
      { name: 'theme-color' },
      { name: 'msapplication-navbutton-color' },
      { name: 'apple-mobile-web-app-status-bar-style', value: 'black-translucent' }
    ];

    metaTags.forEach(({ name, value }) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = value || themeColor;
    });
  }, [theme]);

  // This component doesn't render anything
  return null;
} 