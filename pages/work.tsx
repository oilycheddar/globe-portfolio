'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import Logo from "../components/Logo";
import { useEffect, useRef } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

export default function Home() {
    const { theme, setTheme } = useThemeStore();
    const themeKeys = Object.keys(themes);
    const contentRef = useRef<HTMLDivElement>(null);
}