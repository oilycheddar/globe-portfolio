import type { AppProps } from 'next/app';
import { StyledComponentsProvider } from '../providers/StyledComponentsProvider';
import "../styles/globals.css";
import { useEffect } from "react";
import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";

export default function App({ Component, pageProps }: AppProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const themeStyles = themes[theme as keyof typeof themes];

    Object.entries(themeStyles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <StyledComponentsProvider>
      <Component {...pageProps} />
    </StyledComponentsProvider>
  );
}
