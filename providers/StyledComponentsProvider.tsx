import { ReactNode, useEffect } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { themes } from '../styles/themes';
import { useThemeStore } from '../hooks/useThemeStore';

const GlobalStyle = createGlobalStyle<{ theme: any }>`
  :root {
    --font-mono: "JetBrains Mono", monospace;
    --space-xs: 8px;
    --space-sm: 12px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 40px;
    /* Reset noise-related properties to avoid leftover values */
    --bg-noise: none;
    --page-noise: none;
    --logo-noise: none;

    /* Apply theme variables */
    ${({ theme }) => {
      let styles = '';
      Object.entries(theme).forEach(([key, value]) => {
        styles += `${key}: ${value};\n`;
      });
      return styles;
    }}
  }

  @media (max-width: 440px) {
    :root {
      --slime_shadow: 0px -8px 50px rgba(196,223,30,.9);
      --water_shadow: 0px -8px 50px rgba(230,214,251,.9);
      --acid_shadow: 0px -8px 50px rgba(99,33,238,.9);
      --bunny_shadow: 0px -8px 50px rgba(223,30,155,.9);
      --dune_shadow: 0px -8px 50px rgba(8,34,163,.9);
    }
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
      <GlobalStyle theme={currentTheme} />
      {children}
    </ThemeProvider>
  );
} 