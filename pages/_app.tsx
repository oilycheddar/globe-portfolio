import "../styles/globals.css";
import { useEffect } from "react";
import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";

export default function MyApp({ Component, pageProps }: { Component: React.ComponentType; pageProps: any }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const themeStyles = themes[theme as keyof typeof themes]; // ✅ Fix type error

    Object.entries(themeStyles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <Component {...pageProps} />
  );
}
