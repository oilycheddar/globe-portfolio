'use client';

import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import { Logo } from "../components/Logo";
import { Ref, useEffect, useRef, useState, useCallback } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { ToggleButton } from "../components/toggleButton";
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";
import { MobileNavbar } from "../components/MobileNavbar";
import { useVisualStore } from "../hooks/useVisualStore";
import { NavigationBars } from "../components/NavigationBars";
import { ExpandableToggleButton } from "../components/ExpandableToggleButton";
import { useStravaDistance } from "../hooks/useStravaDistance";

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
  const { theme, setTheme } = useVisualStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const helloTextRef = useRef<HTMLHeadingElement>(null);
  const topTextRef = useRef<HTMLHeadingElement>(null);
  const bottomTextRef = useRef<HTMLParagraphElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const { toggleNoise } = useVisualStore();
  const { distance, loading, error } = useStravaDistance();
  const [runningDistance, setRunningDistance] = useState(loading ? "..." : `${distance}KM`);
  const [employer, setEmployer] = useState("Ramp");
  
  // Add refs for navigation elements
  const employerRef = useRef<HTMLDivElement>(null);
  const stationRef = useRef<HTMLDivElement>(null);
  const runningDistanceRef = useRef<HTMLDivElement>(null);

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
          visibility: 'visible'
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

      // Set initial states for other navigation elements
      gsap.set([employerRef.current, stationRef.current, runningDistanceRef.current], {
        opacity: 0,
        filter: 'blur(20px)',
        visibility: 'visible'
      });

      // Set initial state for content
      gsap.set(contentRef.current, {
        opacity: 0,
        y: 20,
        visibility: 'visible'
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
            }, `-=0.45`);
          }
        });
      }

      // Animate other navigation elements simultaneously
      // Start at the same time as the first toggle button but with longer duration
      tl.to([employerRef.current, stationRef.current, runningDistanceRef.current], {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: "power2.out",
        clearProps: "all"
      }, "-=0.6"); // Start at the same time as the first toggle button
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

  useEffect(() => {
    if (distance !== null) {
      setRunningDistance(`${distance}KM`);
    }
  }, [distance]);

  // Get random character set
  const getRandomCharSet = () => {
    const sets = Object.values(scrambleCharSets);
    return sets[Math.floor(Math.random() * sets.length)];
  };

  // Optimize theme change handler for mobile
  const handleMobileThemeChange = useCallback((newTheme: string) => {
    // Get random character set once
    const charSet = getRandomCharSet();

    // Create a timeline for theme change animations
    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out",
        duration: 0.3 // Reduced from 0.5
      }
    });

    // Animate both texts simultaneously with stagger
    tl.to(topTextRef.current, {
      scrambleText: {
        text: "product designer",
        chars: charSet,
        revealDelay: 0.1, // Reduced from 0.2
        speed: 1.2, // Increased for faster animation
        rightToLeft: false,
        delimiter: ""
      }
    })
    .to(bottomTextRef.current, {
      scrambleText: {
        text: "no code developer",
        chars: charSet,
        revealDelay: 0.1, // Reduced from 0.2
        speed: 1.2, // Increased for faster animation
        rightToLeft: false,
        delimiter: ""
      },
      onComplete: () => {
        // Clear any remaining animations
        gsap.killTweensOf([topTextRef.current, bottomTextRef.current]);
      }
    }, "-=0.2"); // Start slightly before the first animation ends
  }, []);

  // Optimize cycle theme function
  const cycleTheme = useCallback(() => {
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);

    // Get random character set once
    const charSet = getRandomCharSet();

    // Create a timeline for theme change animations
    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out",
        duration: 0.3 // Reduced from 0.5
      }
    });

    // Animate both texts simultaneously with stagger
    tl.to(topTextRef.current, {
      scrambleText: {
        text: "product designer",
        chars: charSet,
        revealDelay: 0.1, // Reduced from 0.2
        speed: 1.2, // Increased for faster animation
        rightToLeft: false,
        delimiter: ""
      }
    })
    .to(bottomTextRef.current, {
      scrambleText: {
        text: "no code developer",
        chars: charSet,
        revealDelay: 0.1, // Reduced from 0.2
        speed: 1.2, // Increased for faster animation
        rightToLeft: false,
        delimiter: ""
      },
      onComplete: () => {
        // Clear any remaining animations
        gsap.killTweensOf([topTextRef.current, bottomTextRef.current]);
      }
    }, "-=0.2"); // Start slightly before the first animation ends
  }, [theme, themeKeys, setTheme]);

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
              <div ref={runningDistanceRef}>
                <ToggleButton
                  type="multi"
                  label="2025 running distance"
                  value={runningDistance}
                  options={[runningDistance]}
                  onChange={setRunningDistance}
                />
              </div>
            }
            right={
              <div ref={employerRef}>
                <ToggleButton
                  type="multi"
                  label="employer"
                  value={employer}
                  options={["Ramp"]}
                  onChange={setEmployer}
                  link="https://www.ramp.com"
                />
              </div>
            }
            bottom={
              <div ref={stationRef} className="flex items-center justify-center w-full">
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