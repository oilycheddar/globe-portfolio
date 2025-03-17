'use client';

import { useEffect, useState, useCallback } from 'react';
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

// Cache for meta tags to avoid unnecessary DOM queries
const metaTagCache = new Map<string, HTMLMetaElement>();

export function ThemeColorManager() {
  const { theme } = useThemeStore();
  const [debugInfo, setDebugInfo] = useState<{
    theme: string;
    color: string;
    metaTags: Record<string, string>;
  }>({ theme: '', color: '', metaTags: {} });

  // Memoize the update function to prevent unnecessary re-renders
  const updateMetaTags = useCallback(() => {
    // Get the current theme's background color
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    
    const metaTagsInfo: Record<string, string> = {};

    // Handle each meta tag type
    META_TAGS.forEach(({ name }) => {
      // Use cached meta tag or create new one
      let metaTag = metaTagCache.get(name) || document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      
      // Create if doesn't exist
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = name;
        document.head.appendChild(metaTag);
        metaTagCache.set(name, metaTag);
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

  useEffect(() => {
    // Initialize meta tags on mount
    updateMetaTags();

    // Update meta tags when theme changes
    updateMetaTags();
  }, [updateMetaTags]);

  // Return null since this component doesn't need to render anything
  return null;
} 