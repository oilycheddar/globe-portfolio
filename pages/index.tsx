'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import Logo from "../components/Logo";
import { ValueToggle } from "../components/valueToggle";
import { useEffect, useRef } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

// Define different character sets for scramble effects
const scrambleCharSets = {
  japanese: "プロダクトデザイナーノーコードエンジニア",
  binary: "0123456789",
  symbols: "!<>-_\\/[]{}—=+*^?#",
  matrix: "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ",
  code: "{([/\\])}@#$%^&*<>+="
};

// Styled container to ensure theme variables are properly applied
const StyledContent = styled.div`
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--space-md);
`;

export default function Home() {
  const { theme, setTheme } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const helloTextRef = useRef<HTMLHeadingElement>(null);
  const topTextRef = useRef<HTMLHeadingElement>(null);
  const bottomTextRef = useRef<HTMLParagraphElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  // Apply theme variables
  useEffect(() => {
    const themeVars = themes[theme as keyof typeof themes];
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme]);

  // Get random character set
  const getRandomCharSet = () => {
    const sets = Object.values(scrambleCharSets);
    return sets[Math.floor(Math.random() * sets.length)];
  };

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);

    // Get two different random character sets
    const firstCharSet = getRandomCharSet();
    let secondCharSet = getRandomCharSet();
    while (secondCharSet === firstCharSet) {
      secondCharSet = getRandomCharSet();
    }

    // Create a timeline for theme change animations
    const tl = gsap.timeline();

    // Animate first text
    tl.to(topTextRef.current, {
      duration: 0.68,
      scrambleText: {
        text: "product designer",
        chars: firstCharSet,
        revealDelay: 0.4,
        speed: 0.8,
        rightToLeft: false,
        delimiter: ""
      },
      onComplete: () => {
        // Show second text with scramble effect
        gsap.to(bottomTextRef.current, {
          duration: 0.68,
          scrambleText: {
            text: "vibe coder",
            chars: secondCharSet,
            revealDelay: 0.4,
            speed: 0.8,
            rightToLeft: false,
            delimiter: ""
          }
        });
      }
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set([helloTextRef.current, topTextRef.current, bottomTextRef.current, toggleRef.current], {
        opacity: 0,
        scrambleText: {
          text: " ",
          chars: "!<>-_\\/[]{}—=+*^?#",
          revealDelay: 0.4,
          speed: 0.8,
          delimiter: "",
        }
      });

      // Create timeline for the sequence
      const tl = gsap.timeline();

      // Logo container animation
      tl.fromTo(contentRef.current,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.68,
          delay: 1.6,
          ease: "sine.out"
        }
      );

      // Text animations with scramble effect

      tl.to(topTextRef.current, {
        opacity: 1,
        duration: 0.68,
        scrambleText: {
          text: "product designer",
          chars: "プロダクトデザイナー",
          revealDelay: 0.4,
          speed: 0.8,
          rightToLeft: false,
          delimiter: ""
        }
      }, "+=0.2");

      tl.to(bottomTextRef.current, {
        opacity: 1,
        duration: 0.68,
        scrambleText: {
          text: "vibe coder",
          chars: "アイウエオカキクケコサシスセソタチツテト",
          revealDelay: 0.4,
          speed: 0.8,
          rightToLeft: false,
          delimiter: ""
        }
      }, "+=0.2");

      // Add toggle animation
      tl.to(toggleRef.current, {
        opacity: 1,
        duration: 0.68,
      }, "+=0.2");
    });

    return () => ctx.revert();
  }, []);

  return (
    <PageWrapper>
      <StyledContent 
        ref={contentRef}
        className={jetbrainsMono.className}
      >
        <h1 
          ref={helloTextRef}
          className={`${textStyles.caption} text-[var(--color-text)]`}
        >
          hello jason
        </h1>
        <h1 
          ref={topTextRef}
          className={`${textStyles.caption} text-[var(--color-text)]`}
        >
          product designer
        </h1>
        <div className="w-[50vw] aspect-[2/1]">
          <Logo />
        </div>
        <p 
          ref={bottomTextRef}
          className={`${textStyles.caption} text-[var(--color-text)]`}
        >
          vibe coder
        </p>
        <div ref={toggleRef} className="mt-[var(--space-sm)]">
          <ValueToggle
            type="multi"
            label="theme"
            value={theme}
            values={themeKeys as readonly string[]}
            onClick={cycleTheme}
          />
        </div>
      </StyledContent>
    </PageWrapper>
  );
}