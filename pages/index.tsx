'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import Logo from "../components/Logo";
import { Ref, useEffect, useRef, useState, useCallback } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { ToggleButton } from "../components/toggleButton";
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";
import { MobileNavbar } from "../components/MobileNavbar";
import { useNoiseStore } from "../hooks/useNoiseStore";
import { NavigationBars } from "../components/NavigationBars";
import { ExpandableToggleButton } from "../components/ExpandableToggleButton";

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
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  /* Position for mobile navbar */
  .mobile-navbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
  }
`;

const StyledContent = styled.div`
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --navbar-height: 64px;
  
  position: absolute;
  inset: var(--navbar-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  transition: filter 0.4s ease;
  
  /* Responsive adjustments */
  @media (max-width: 440px) {
    gap: var(--space-sm);
  }
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
  const navbarRef = useRef<NavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const { toggleNoise, isNoiseEnabled } = useNoiseStore();

  // Initialize GSAP animations
  const initializeGSAPAnimations = () => {
    gsap.registerPlugin(ScrambleTextPlugin);
    
    const ctx = gsap.context(() => {
      // Initial state setup for main content
      gsap.set([topTextRef.current, bottomTextRef.current], {
        opacity: 0,
      });

      // Initial state for navbar and toggle buttons
      const navbar = (navbarRef.current as unknown) as NavbarRef;
      if (navbar?.container) {
        // Hide navbar container
        gsap.set(navbar.container, {
          opacity: 0,
          y: -20,
          visibility: 'visible' // Make visible before animation
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
        y: 20,
        visibility: 'visible' // Make visible before animation
      });

      // Create main timeline with a delay to wait for innerShape animation
      const tl = gsap.timeline({
        delay: 1.25,
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
          text: "no code developer",
          chars: scrambleCharSets.matrix,
          revealDelay: 0.4,
          speed: 0.8,
          delimiter: ""
        }
      }, "+=0.2");

      // Animate navbar container
      if (navbar?.container) {
        tl.to(navbar.container, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          clearProps: "all"
        }, "+=0.2");

        // Staggered animation for toggle buttons
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
              stagger: 0.1,
              clearProps: "all"
            }, `-=0.45`); // Slightly more overlap for smoother sequence
          }
        });
      }
    }, contentRef);

    return ctx;
  };

  // Effect for handling GSAP animations
  useEffect(() => {
    const ctx = initializeGSAPAnimations();
    return () => ctx.revert();
  }, []); // Only run once on mount

  // Remove the mobile state effect that was clearing props
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 440);
    };

    // Initial check
    checkMobile();

    // Add listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out" // Changed from sine.out for better performance
      }
    });

    // Animate first text
    tl.to(topTextRef.current, {
      duration: 0.5, // Reduced from 0.68
      scrambleText: {
        text: "product designer",
        chars: firstCharSet,
        revealDelay: 0.2, // Reduced from 0.4
        speed: 1, // Increased from 0.8
        rightToLeft: false,
        delimiter: ""
      },
      onComplete: () => {
        // Show second text with scramble effect
        gsap.to(bottomTextRef.current, {
          duration: 0.5, // Reduced from 0.68
          scrambleText: {
            text: "no code developer",
            chars: secondCharSet,
            revealDelay: 0.2, // Reduced from 0.4
            speed: 1, // Increased from 0.8
            rightToLeft: false,
            delimiter: ""
          }
        });
      }
    });
  };

  // Simple theme change handler for mobile
  const handleMobileThemeChange = useCallback((newTheme: string) => {
    // Get two different random character sets
    const firstCharSet = getRandomCharSet();
    let secondCharSet = getRandomCharSet();
    while (secondCharSet === firstCharSet) {
      secondCharSet = getRandomCharSet();
    }

    // Create a timeline for theme change animations
    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out"
      }
    });

    // Animate first text
    tl.to(topTextRef.current, {
      duration: 0.5,
      scrambleText: {
        text: "product designer",
        chars: firstCharSet,
        revealDelay: 0.2,
        speed: 1,
        rightToLeft: false,
        delimiter: ""
      },
      onComplete: () => {
        // Show second text with scramble effect
        gsap.to(bottomTextRef.current, {
          duration: 0.5,
          scrambleText: {
            text: "no code developer",
            chars: secondCharSet,
            revealDelay: 0.2,
            speed: 1,
            rightToLeft: false,
            delimiter: ""
          }
        });
      }
    });
  }, []);

  // Test handlers for navbar
  const handleGridToggle = (value: boolean) => {
    console.log('Grid toggled:', value);
  };

  const handleNoiseToggle = (value: boolean) => {
    toggleNoise();
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
        {!isMobile ? (
          <NavigationBars
            top={
              <Navbar
                ref={navbarRef}
                onGridToggle={handleGridToggle}
                onNoiseToggle={handleNoiseToggle}
                onDvdToggle={handleDvdToggle}
                onSpeedToggle={handleSpeedToggle}
                onThemeChange={cycleTheme}
              />
            }
            left={
              <div className={`${textStyles.caption} text-[var(--color-text)]`}>
                2025 running distance 464km
              </div>
            }
            right={
              <div className={`${textStyles.caption} text-[var(--color-text)]`}>
                employer ramp
              </div>
            }
            bottom={
              <div className="flex items-center justify-center w-full">
                <ExpandableToggleButton
                  label="station"
                  options={["work", "play", "about"]}
                  value="work"
                  onChange={(value) => console.log('Selected:', value)}
                />
              </div>
            }
          />
        ) : (
          <MobileNavbar
            className="mobile-navbar"
            onGridToggle={handleGridToggle}
            onNoiseToggle={handleNoiseToggle}
            onDvdToggle={handleDvdToggle}
            onSpeedToggle={handleSpeedToggle}
            onThemeChange={handleMobileThemeChange}
            onExpandedChange={setIsNavExpanded}
          />
        )}
        <StyledContent 
          ref={contentRef}
          className={`${jetbrainsMono.className}`}
          style={isMobile && isNavExpanded ? {
            filter: 'blur(8px)'
          } : undefined}
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