'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import Logo from "../components/Logo";
import { Ref, useEffect, useRef } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { ToggleButton } from "../components/toggleButton";
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";

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

interface NavbarProps {
  onGridToggle: (value: boolean) => void;
  onNoiseToggle: (value: boolean) => void;
  onDvdToggle: (value: boolean) => void;
  onSpeedToggle: (value: boolean) => void;
  onThemeChange?: () => void;
}

export default function Home() {
  const { theme, setTheme } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const helloTextRef = useRef<HTMLHeadingElement>(null);
  const topTextRef = useRef<HTMLHeadingElement>(null);
  const bottomTextRef = useRef<HTMLParagraphElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

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
    // Register plugin if needed (though it should be registered in utils/gsap.ts)
    gsap.registerPlugin(ScrambleTextPlugin);
    
    // Create a GSAP context
    const ctx = gsap.context(() => {
      // Initial state setup for main content
      gsap.set([topTextRef.current, bottomTextRef.current], {
        opacity: 0,
      });

      // Initial state for navbar and toggle buttons
      const navbar = navbarRef.current as any;
      if (navbar) {
        // Hide navbar container
        gsap.set(navbar, {
          opacity: 0,
          y: -20
        });

        // Hide all toggle buttons
        const toggleButtons = [
          navbar.theme,
          navbar.grid,
          navbar.noise,
          navbar.dvd,
          navbar.speed
        ];

        toggleButtons.forEach(button => {
          if (button) {
            gsap.set(button, {
              opacity: 0,
              y: -10,
              filter: 'blur(20px)'
            });
          }
        });
      }

      // Set initial state for content
      gsap.set(contentRef.current, {
        opacity: 0,
        y: 20
      });

      // Create main timeline with a delay to wait for innerShape animation
      const tl = gsap.timeline({
        delay: 1.25, // Wait for innerShape animation (1.95s) to complete
        defaults: {
          ease: "sine.out",
        }
      });

      // Animate content container
      tl.to(contentRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
        }
      );

      // Animate top text with scramble effect
      tl.to(topTextRef.current, {
        opacity: 1,
        duration: 0.8,
        scrambleText: {
          text: "product designer",
          chars: scrambleCharSets.japanese,
          revealDelay: 0.4,
          speed: 0.8,
          delimiter: ""
        }
      }, "+=0.2");

      // Animate bottom text with scramble effect
      tl.to(bottomTextRef.current, {
        opacity: 1,
        duration: 0.8,
        scrambleText: {
          text: "vibe coder",
          chars: scrambleCharSets.matrix,
          revealDelay: 0.4,
          speed: 0.8,
          delimiter: ""
        }
      }, "+=0.2");

      // Animate navbar container
      tl.to(navbar, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "+=0.2");

      // Staggered animation for toggle buttons
      if (navbar) {
        const toggleButtons = [
          navbar.theme,
          navbar.grid,
          navbar.noise,
          navbar.dvd
        ];

        toggleButtons.forEach((button, index) => {
          if (button) {
            tl.to(button, {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.1
            }, `-=0.45`); // Slightly more overlap for smoother sequence
          }
        });
      }

    }, contentRef); // Scope to content container

    // Cleanup
    return () => ctx.revert();
  }, []); // Empty dependency array since we want this to run once on mount

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
          ref={navbarRef as Ref<NavbarRef>}
          onGridToggle={handleGridToggle}
          onNoiseToggle={handleNoiseToggle}
          onDvdToggle={handleDvdToggle}
          onSpeedToggle={handleSpeedToggle}
          onThemeChange={cycleTheme}
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
            no code developer
          </p>
        </StyledContent>
      </ContentWrapper>
    </PageWrapper>
  );
}