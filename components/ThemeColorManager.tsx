'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '../hooks/useThemeStore';
import styled from 'styled-components';

const DebugPanel = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const META_TAGS = [
  { name: 'theme-color' },                    // Standard
  { name: 'msapplication-navbutton-color' },  // Windows
  { name: 'apple-mobile-web-app-status-bar-style' }, // iOS
] as const;

export function ThemeColorManager() {
  const { theme } = useThemeStore();
  const [debugInfo, setDebugInfo] = useState<{
    theme: string;
    color: string;
    metaTags: Record<string, string>;
  }>({ theme: '', color: '', metaTags: {} });

  useEffect(() => {
    // Get the current theme's background color
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    
    const metaTagsInfo: Record<string, string> = {};

    // Handle each meta tag type
    META_TAGS.forEach(({ name }) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      
      // Create if doesn't exist
      if (!metaTag) {
        metaTag = document.createElement('meta');
        (metaTag as HTMLMetaElement).name = name;
        document.head.appendChild(metaTag);
      }

      // Set the color
      if (name === 'apple-mobile-web-app-status-bar-style') {
        metaTag.setAttribute('content', 'black-translucent');
        metaTagsInfo[name] = 'black-translucent';
      } else {
        metaTag.setAttribute('content', themeColor);
        metaTagsInfo[name] = themeColor;
      }
    });

    // Update debug info
    setDebugInfo({
      theme,
      color: themeColor,
      metaTags: metaTagsInfo
    });
  }, [theme]);


} 