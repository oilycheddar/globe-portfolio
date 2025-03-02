'use client';

import { ReactNode, useEffect } from "react";
import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";

export default function Layout({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const themeStyles = themes[theme as keyof typeof themes]; 
    Object.entries(themeStyles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {children}
    </div>
  );
}
