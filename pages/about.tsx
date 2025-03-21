'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import { Ref, useEffect, useRef, useState } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";
import { MobileNavbar } from "../components/MobileNavbar";
import Image from 'next/image';

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

const ContentWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
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
  top: var(--navbar-height);
  bottom: var(--navbar-height);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  transition: filter 0.4s ease;
  /* Add padding to prevent content from overlapping with navs */
  padding: 0 var(--space-xl);
  /* Responsive adjustments */
  @media (max-width: 440px) {
    gap: var(--space-md);
    padding: 0 var(--space-md);
  }
`;

const ProfileImage = styled(Image)`
  width: 100%;
  height: auto;
  border-radius: 12px;
  mix-blend-mode: hard-light;
`;

const ImageWrapper = styled.div`
  width: 300px;
  max-width: 100%;
  position: relative;
  aspect-ratio: 1064/1331;
`;

const AboutText = styled.p`
  width: 300px;
  max-width: 300px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

export default function About() {
  const { theme, setTheme } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLParagraphElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [noiseEnabled, setNoiseEnabled] = useState(true);

  // Initialize GSAP animations
  const initializeGSAPAnimations = () => {
    gsap.registerPlugin(ScrambleTextPlugin);
    
    const ctx = gsap.context(() => {
      // Initial state setup for main content
      if (navbarRef.current?.container) {
        gsap.set(navbarRef.current.container, {
          opacity: 0,
          y: -20,
          filter: 'blur(10px)'
        });
      }

      // Set initial state for ContentWrapper
      gsap.set(contentRef.current, {
        opacity: 0,
        y: 20,
        visibility: 'visible' // Make visible before animation
      });

      // Initial state for navbar and toggle buttons
      const navbar = navbarRef.current;
      if (navbar?.container) {
        // Hide navbar container
        gsap.set(navbar.container, {
          opacity: 0,
          y: -20,
          visibility: 'visible' // Make visible before animation
        });

        // Hide only top and bottom toggle buttons
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

      // Create main timeline with a delay to wait for innerShape animation
      const tl = gsap.timeline({
        delay: .75,
        defaults: {
          ease: "sine.out",
        }
      });

      // Animate navbar container
      if (navbar?.container) {
        tl.to(navbar.container, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "all"
        }, "+=0.2");

        // Combined staggered animation for top and bottom toggle buttons
        const navToggleButtons = [
          navbar.theme, // Top theme
          navbar.grid,  // Top grid
          navbar.noise, // Top noise
          navbar.dvd,   // Top dvd
          navbar.theme  // Bottom station
        ];

        navToggleButtons.forEach((button, index) => {
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

      // Animate content container
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.2,
        ease: "power2.out",
      }, "+=0.1");
    }, contentRef);

    return ctx;
  };

  // Effect for handling GSAP animations
  useEffect(() => {
    const ctx = initializeGSAPAnimations();
    return () => ctx.revert();
  }, []);

  // Set initial theme-color
  useEffect(() => {
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  }, [theme]);

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 440);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGridToggle = (value: boolean) => {
    // Implement grid toggle functionality
  };

  const handleNoiseToggle = (value: boolean) => {
    setNoiseEnabled(value);
  };

  const handleDvdToggle = (value: boolean) => {
    // Implement DVD toggle functionality
  };

  const handleSpeedToggle = (value: boolean) => {
    // Implement speed toggle functionality
  };

  const handleNavExpandedChange = (value: boolean) => {
    setIsNavExpanded(value);
  };

  return (
    <PageWrapper noiseEnabled={noiseEnabled}>
      <ContentWrapper>
        {isMobile ? (
          <MobileNavbar
            className="mobile-navbar"
            onGridToggle={handleGridToggle}
            onNoiseToggle={handleNoiseToggle}
            onDvdToggle={handleDvdToggle}
            onSpeedToggle={handleSpeedToggle}
            onExpandedChange={handleNavExpandedChange}
            initialNoiseState={noiseEnabled}
          />
        ) : null}
        <Navbar
          ref={navbarRef}
          onGridToggle={handleGridToggle}
          onNoiseToggle={handleNoiseToggle}
          onDvdToggle={handleDvdToggle}
          onSpeedToggle={handleSpeedToggle}
          onThemeChange={() => {}}
          initialNoiseState={noiseEnabled}
        />
        <StyledContent 
          ref={contentRef}
          className={`${jetbrainsMono.className}`}
          style={isMobile && isNavExpanded ? {
            filter: 'blur(8px)'
          } : undefined}
        >
          <ImageWrapper>
            <ProfileImage
              src="/Profile_Photo.webp"
              alt="Profile photo"
              fill
              sizes="(max-width: 440px) 100vw, 300px"
              quality={100}
              priority
            />
          </ImageWrapper>
          <AboutText 
            ref={aboutTextRef}
            className={`${textStyles.caption} text-[var(--color-text)]`}
          >
            I ENJOY SOME OF THE   OLD, AND I ENJOY SOME OF THE NEW. I'M IN LOVE. RUNNING GETS  MY HEART  RATE UP,  MUSIC    SLOWS IT DOWN. I SEEK MY   OWN WAY. HONOURING MY INTUITION   TOOK   MANY   YEARS. MY NEXT JOB  WILL BE OPENING   A HI-FI BAR.
          </AboutText>
        </StyledContent>
      </ContentWrapper>
    </PageWrapper>
  );
}
