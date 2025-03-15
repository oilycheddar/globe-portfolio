import React from 'react';
import { useThemeStore } from '../hooks/useThemeStore';
import { themes } from '../styles/themes';
import { createGlobalStyle } from 'styled-components';

// Add link to head for font loading
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const GlobalStyles = createGlobalStyle`
  :root {
    --font-mono: "JetBrains Mono", monospace;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

export const GlobalDecorator = (Story: any, context: any) => {
  // Get the theme from Storybook controls or use default
  const theme = context.globals.theme || 'slime';
  
  // Set the theme using your theme store
  useThemeStore.setState({ theme });

  // Apply theme CSS variables
  React.useEffect(() => {
    const themeVars = themes[theme as keyof typeof themes];
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <>
      <GlobalStyles />
      <Story />
    </>
  );
}; 