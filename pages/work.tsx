'use client';

import { useVisualStore } from "../hooks/useVisualStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import { Logo } from "../components/Logo";
import { useEffect, useRef } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

export default function Work() {
    const { theme, setTheme } = useVisualStore();
    const themeKeys = Object.keys(themes);
    const contentRef = useRef<HTMLDivElement>(null);
}