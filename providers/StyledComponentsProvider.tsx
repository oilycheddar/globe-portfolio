import { ReactNode } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { themes } from '../styles/themes';
import { useThemeStore } from '../hooks/useThemeStore';

const GlobalStyle = createGlobalStyle`
  :root {
    --font-mono: "JetBrains Mono", monospace;
    --space-xs: 8px;
    --space-sm: 12px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 40px;
  }
`;

interface StyledComponentsProviderProps {
  children: ReactNode;
}

export function StyledComponentsProvider({ children }: StyledComponentsProviderProps) {
  const { theme } = useThemeStore();
  const currentTheme = themes[theme as keyof typeof themes];

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
} 