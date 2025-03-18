import { ReactNode, useEffect } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { themes } from '../styles/themes';
import { useVisualStore } from '../hooks/useVisualStore';

const GlobalStyle = createGlobalStyle<{ theme: any }>`
  :root {
    --font-mono: "JetBrains Mono", monospace;
    --space-xs: 8px;
    --space-sm: 12px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 40px;

    /* Apply theme variables */
    ${({ theme }) => {
      let styles = '';
      Object.entries(theme).forEach(([key, value]) => {
        styles += `${key}: ${value};\n`;
      });
      return styles;
    }}
  }
`;

interface StyledComponentsProviderProps {
  children: ReactNode;
}

export function StyledComponentsProvider({ children }: StyledComponentsProviderProps) {
  const { theme } = useVisualStore();
  const currentTheme = themes[theme as keyof typeof themes];

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle theme={currentTheme} />
      {children}
    </ThemeProvider>
  );
} 