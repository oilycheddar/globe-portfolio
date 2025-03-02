'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import PageWrapper from "../components/pageWrapper";
import { useState } from "react";

export default function Home() {
  const { theme, setTheme } = useThemeStore();
  const themeKeys = Object.keys(themes);

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-6 text-[var(--color-text)]">Current Theme: {theme}</h1>
        <button 
          onClick={cycleTheme} 
          className="px-4 py-2 bg-[var(--color-accent-primary)] text-[var(--color-text)] rounded-lg shadow-md">
          Change Theme
        </button>
      </div>
    </PageWrapper>
  );
}