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
  /* Initial state to prevent FOUC */
  opacity: 0;
  transform: translateY(20px);
  /* Responsive adjustments */
  @media (max-width: 440px) {
    --mobile-navbar-height: 24px;
    position: relative;
    top: var(--mobile-navbar-height);
    bottom: auto;
    justify-content: flex-start;
    padding: 0 var(--space-md);
    gap: var(--space-md);
  }
`;

const ImageWrapper = styled.div`
  width: 300px;
  max-width: 100%;
  position: relative;
  aspect-ratio: 1064/1331;
  
  @media (max-width: 440px) {
    width: 100%;
    aspect-ratio: 1064/1000;
    position: relative;
  }
`;

const ProfileImage = styled(Image)`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  mix-blend-mode: hard-light;
  object-fit: cover;
  object-position: center 0%;
  
  @media (max-width: 440px) {
    object-position: center 0%;
  }
`;

const AboutText = styled.p`
  width: 300px;
  max-width: 300px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  
  @media (max-width: 440px) {
    width: 100%;
    max-width: none;
  }
`;

export default function About() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLParagraphElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // Initialize GSAP animations
  const initializeGSAPAnimations = () => {
    gsap.registerPlugin(ScrambleTextPlugin);
    
    const ctx = gsap.context(() => {
      // Initial state setup for main content
      if (navbarRef.current?.container) {
        gsap.set(navbarRef.current.container, {
          opacity: 1,
          y: 0,
          visibility: 'visible'
        });
      }

      // Initial state for navbar and toggle buttons
      const navbar = navbarRef.current;
      if (navbar?.container) {
        // Make navbar container immediately visible
        gsap.set(navbar.container, {
          opacity: 1,
          y: 0,
          visibility: 'visible'
        });

        // Hide only top and bottom toggle buttons
        const toggleButtons = [
          navbar.themeTop,  // Theme SLIME (top)
          navbar.grid,
          navbar.noise,
          navbar.dvd,
          navbar.speed,
          navbar.themeBottom   // STATION (bottom)
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
        opacity: 1,
        visibility: 'visible'
      });

      // Create main timeline with a delay to wait for innerShape animation
      const tl = gsap.timeline({
        delay: 0.75,
        defaults: {
          ease: "sine.out",
        }
      });

      // Combined staggered animation for toggle buttons
      if (navbar) {
        const navToggleButtons = [
          navbar.themeTop,  // Theme SLIME (top)
          navbar.grid,
          navbar.noise,
          navbar.dvd,
          navbar.speed,
          navbar.themeBottom   // STATION (bottom)
        ];

        // Animate toggle buttons with stagger
        tl.to(navToggleButtons, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.15,
          clearProps: "all"
        });

        // Animate image with scale after toggle buttons
        tl.fromTo(".profile-image-wrapper", {
          scale: 0.92,
          opacity: 0,
        }, {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out"
        }, ">");  // ">" means "after previous animation completes"

        // Split text into words and animate each word after image
        if (aboutTextRef.current) {
          // First, wrap each word in a span
          const text = aboutTextRef.current.textContent || "";
          const words = text.split(" ").filter(word => word.length > 0);
          aboutTextRef.current.innerHTML = words
            .map(word => `<span class="word" style="display: inline-block; filter: blur(12px); opacity: 0;">${word}</span>`)
            .join(" ");

          // Then animate each word after image scales
          tl.to(".word", {
            filter: "blur(0px)",
            opacity: 1,
            duration: 0.3,
            stagger: {
              amount: 0.4,
              ease: "sine.inOut"
            }
          }, ">");
        }
      }
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
          <ImageWrapper className="profile-image-wrapper">
            <ProfileImage
              className="profile-image"
              src={noiseEnabled ? "/Profile_Photo.webp" : "/Profile_Photo_noiseless.webp"}
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
            I ENJOY    SOME OF THE   OLD, AND I ENJOY SOME    OF THE NEW. I'M IN LOVE. RUNNING GETS  MY HEART  RATE UP,  MUSIC    SLOWS IT DOWN. I SEEK MY   OWN WAY. HONOURING MY INTUITION   TOOK   MANY   YEARS. MY    NEXT JOB   WILL BE     OPENING   A HI-FI BAR.
          </AboutText>
        </StyledContent>
      </ContentWrapper>
    </PageWrapper>
  );
}
