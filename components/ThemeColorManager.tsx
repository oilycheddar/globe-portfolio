'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../hooks/useThemeStore';

export function ThemeColorManager() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Create meta tag if it doesn't exist
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      (metaThemeColor as HTMLMetaElement).name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    // Get the computed background color
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    metaThemeColor.setAttribute('content', themeColor);
  }, [theme]);

  return null;
} 