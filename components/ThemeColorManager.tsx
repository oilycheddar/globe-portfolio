'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../hooks/useThemeStore';

export function ThemeColorManager() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Create or update the theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      (metaThemeColor as HTMLMetaElement).name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    // Set theme-color to the computed --color-bg value
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    metaThemeColor.setAttribute('content', themeColor);

    // Create or update the apple-mobile-web-app-status-bar-style meta tag for iOS Safari
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      appleStatusBar = document.createElement('meta');
      (appleStatusBar as HTMLMetaElement).name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(appleStatusBar);
    }

    // Set to 'black-translucent' so that the background color extends into the status bar
    appleStatusBar.setAttribute('content', 'black-translucent');

  }, [theme]);

  return null;
} 