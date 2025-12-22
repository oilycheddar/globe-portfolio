'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../hooks/useThemeStore';
import { themes } from '../styles/themes';

export function ThemeColorManager() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM updates are applied before setting meta tags
    requestAnimationFrame(() => {
      // Get the theme color directly from the themes object to avoid timing issues
      const currentTheme = themes[theme as keyof typeof themes];
      const themeColor = currentTheme?.['--color-bg'] || '';
      
      if (!themeColor) return;
      
      // iOS 26 Safari requires the body background color to be explicitly set
      // Safari uses the body background color to determine toolbar colors
      if (document.body) {
        document.body.style.backgroundColor = themeColor;
      }

      // Create or update the theme-color meta tag
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        (metaThemeColor as HTMLMetaElement).name = 'theme-color';
        document.head.appendChild(metaThemeColor);
      }

      // Set theme-color to the theme's --color-bg value
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

      // Also set html background color for iOS 26 Safari compatibility
      if (document.documentElement) {
        document.documentElement.style.backgroundColor = themeColor;
      }
    });
  }, [theme]);

  return null;
} 