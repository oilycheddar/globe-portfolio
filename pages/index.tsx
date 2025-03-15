'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import Logo from "../components/Logo";
import { useEffect, useRef } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { ToggleButton } from "../components/toggleButton";
import { Navbar } from "../components/Navbar";

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
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh; /* Ensure full viewport height */
`;

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
  flex-grow: 1; /* Allow content to grow and center */
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
      if (helloTextRef.current && topTextRef.current && bottomTextRef.current && toggleRef.current) {
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
      }
    });

    return () => ctx.revert();
  }, [theme]);

  // Test handlers for navbar
  const handleGridToggle = (value: boolean) => {
    console.log('Grid toggled:', value);
  };

  const handleNoiseToggle = (value: boolean) => {
    console.log('Noise toggled:', value);
  };

  const handleDvdToggle = (value: boolean) => {
    console.log('DVD toggled:', value);
  };

  const handleSpeedToggle = (value: boolean) => {
    console.log('Speed toggled:', value);
  };

  return (
    <PageWrapper>
      <ContentWrapper>
        <Navbar
          onGridToggle={handleGridToggle}
          onNoiseToggle={handleNoiseToggle}
          onDvdToggle={handleDvdToggle}
          onSpeedToggle={handleSpeedToggle}
        />
        <StyledContent 
          ref={contentRef}
          className={jetbrainsMono.className}
        >
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
        </StyledContent>
      </ContentWrapper>
    </PageWrapper>
  );
}