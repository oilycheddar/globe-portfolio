import React from 'react';
import { useThemeStore } from '../hooks/useThemeStore';
import { themes } from '../styles/themes';

export const ThemeDecorator = (Story: any, context: any) => {
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

  return <Story />;
}; 