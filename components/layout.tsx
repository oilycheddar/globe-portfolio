'use client';

import { ReactNode, useEffect, useCallback } from "react";
import { useVisualStore } from "../hooks/useVisualStore";
import { themes } from "../styles/themes";

export default function Layout({ children }: { children: ReactNode }) {
  const { theme, initializeTheme } = useVisualStore();

  const applyTheme = useCallback(() => {
    const root = document.documentElement;
    const themeStyles = themes[theme as keyof typeof themes];
    
    // Batch all style updates
    Object.entries(themeStyles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  useEffect(() => {
    // Initialize theme on mount
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {children}
    </div>
  );
}
