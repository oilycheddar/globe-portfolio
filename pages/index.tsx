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

  @media (max-width: 440px) {
    position: fixed;
    width: 100%;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const BlurWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: filter 0.4s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 440px) {
    --mobile-navbar-height: 32px;
    margin-top: var(--mobile-navbar-height);
  }
`;

const StyledContent = styled.div`
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --navbar-height: 64px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  transition: filter 0.4s ease;

  /* Add padding to prevent content from overlapping with navs */

  /* Responsive adjustments */
  @media (max-width: 440px) {
    gap: var(--space-sm);
    padding-top: 32px;
    height: 100%;
    justify-content: center;
  }
`;

interface NavbarProps {
  onGridToggle: (value: boolean) => void;
  onNoiseToggle: (value: boolean) => void;
  onThemeChange?: () => void;
}

export default function Home() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const helloTextRef = useRef<HTMLHeadingElement>(null);
  const topTextRef = useRef<HTMLHeadingElement>(null);
  const bottomTextRef = useRef<HTMLParagraphElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const [isDvdActive, setIsDvdActive] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });
  const [logoVelocity, setLogoVelocity] = useState({ x: 2, y: 2 });
  const currentPositionRef = useRef({ x: 0, y: 0 });
  const currentVelocityRef = useRef({ x: 2, y: 2 });
  const blurWrapperRef = useRef<HTMLDivElement>(null);
  const dvdLogoRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize GSAP animations
  const initializeGSAPAnimations = () => {
    gsap.registerPlugin(ScrambleTextPlugin);
    
    const ctx = gsap.context(() => {
      // Initial state for navbar and toggle buttons
      const navbar = navbarRef.current;
      if (navbar?.container) {
        // Make navbar container immediately visible
        gsap.set(navbar.container, {
          opacity: 1,
          y: 0,
          visibility: 'visible'
        });

        // Hide all nav elements initially
        const allNavElements = [
          navbar.themeTop,  // Theme SLIME (top)
          navbar.grid,
          navbar.noise,
          navbar.dvd,      // Add DVD toggle
          navbar.themeBottom,   // STATION (bottom)
          navbar.themeLeft,     // Left nav
          navbar.themeRight     // Right nav
        ];

        allNavElements.forEach(element => {
          if (element) {
            gsap.set(element, {
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
        delay: 1.2,
        defaults: {
          ease: "sine.out",
        }
      });

      // Animate content container first
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

      // Animate all nav elements together
      if (navbar) {
        const allNavElements = [
          navbar.themeTop,  // Theme SLIME (top)
          navbar.grid,
          navbar.noise,
          navbar.dvd,      // Add DVD toggle
          navbar.themeBottom,   // STATION (bottom)
          navbar.themeLeft,     // Left nav
          navbar.themeRight     // Right nav
        ];

        // Animate all nav elements together
        tl.to(allNavElements, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: "power2.out",
          clearProps: "all"
        }, "+=0.45");
      }
    }, contentRef);

    return ctx;
  };

  // Effect for handling GSAP animations
  useEffect(() => {
    const ctx = initializeGSAPAnimations();
    return () => ctx.revert();
  }, []); // Only run once on mount

  // Set initial theme-color
  useEffect(() => {
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  }, [theme]); // Update whenever theme changes

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
            text: "no code developer",
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

  // Test handlers for navbar
  const handleGridToggle = (value: boolean) => {
    // Implement grid toggle functionality
  };

  const handleNoiseToggle = (value: boolean) => {
    setNoiseEnabled(value);
  };

  const handleNavExpandedChange = (value: boolean) => {
    setIsNavExpanded(value);
  };

  // Update refs when state changes
  useEffect(() => {
    currentPositionRef.current = logoPosition;
  }, [logoPosition]);

  useEffect(() => {
    currentVelocityRef.current = logoVelocity;
  }, [logoVelocity]);

  // DVD animation logic
  const startDvdAnimation = useCallback(() => {
    if (!dvdLogoRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const logo = dvdLogoRef.current;
    
    // Use container's actual dimensions
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Calculate the center position
    const centerX = (containerWidth - logo.offsetWidth) / 2;
    const centerY = (containerHeight - logo.offsetHeight) / 2;
    
    // Set initial position to center
    currentPositionRef.current = { x: centerX, y: centerY };
    setLogoPosition({ x: centerX, y: centerY });

    const animate = () => {
      if (!dvdLogoRef.current || !containerRef.current) return;

      const logo = dvdLogoRef.current;
      
      // Calculate new position first
      const newX = currentPositionRef.current.x + currentVelocityRef.current.x;
      const newY = currentPositionRef.current.y + currentVelocityRef.current.y;

      // Calculate boundaries with padding
      const padding = 0;
      const maxX = containerWidth - logo.offsetWidth - padding;
      const maxY = containerHeight - logo.offsetHeight - padding;
      
      // Check for collisions with new position
      if (newX <= padding || newX >= maxX) {
        currentVelocityRef.current = {
          x: -currentVelocityRef.current.x * (0.95 + Math.random() * 0.1),
          y: currentVelocityRef.current.y
        };
      }
      if (newY <= padding || newY >= maxY) {
        currentVelocityRef.current = {
          x: currentVelocityRef.current.x,
          y: -currentVelocityRef.current.y * (0.95 + Math.random() * 0.1)
        };
      }

      // Cap maximum speed
      currentVelocityRef.current = {
        x: Math.min(Math.max(currentVelocityRef.current.x, -4), 4),
        y: Math.min(Math.max(currentVelocityRef.current.y, -4), 4)
      };

      // Update position
      currentPositionRef.current = { x: newX, y: newY };
      setLogoPosition({ x: newX, y: newY });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []); // Empty dependency array since we're using refs

  const stopDvdAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Handle DVD toggle
  const handleDvdToggle = useCallback((value: boolean) => {
    setIsDvdActive(value);
    if (value) {
      // Stop any existing animation first
      stopDvdAnimation();
      
      // Create a timeline for the exit animation
      const tl = gsap.timeline({
        onComplete: () => {
          // Calculate center position before showing logo
          if (dvdLogoRef.current && containerRef.current) {
            const container = containerRef.current;
            const logo = dvdLogoRef.current;
            const centerX = (container.offsetWidth - logo.offsetWidth) / 2;
            const centerY = (container.offsetHeight - logo.offsetHeight) / 2;
            
            // Set initial position via GSAP
            gsap.set(dvdLogoRef.current, {
              x: centerX,
              y: centerY,
              visibility: 'visible',
              opacity: 1,
              delay: 0.5 // Wait for content to fade out
            });
            
            // Update refs and state after position is set
            currentPositionRef.current = { x: centerX, y: centerY };
            setLogoPosition({ x: centerX, y: centerY });
            
            // Start animation after a delay
            setTimeout(() => {
              startDvdAnimation();
            }, 500); // Match the delay with the fade out duration
          }
        }
      });

      // Animate content out
      tl.to(contentRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "sine.in"
      });

      // Animate nav elements out
      const navbar = navbarRef.current;
      if (navbar) {
        const allNavElements = [
          navbar.themeTop,
          navbar.grid,
          navbar.noise,
          navbar.dvd,
          navbar.themeBottom,
          navbar.themeLeft,
          navbar.themeRight
        ];

        tl.to(allNavElements, {
          opacity: 0,
          y: -10,
          filter: 'blur(20px)',
          duration: 0.5,
          ease: "power2.in"
        }, "-=0.3");
      }
    } else {
      stopDvdAnimation();
      
      // Create a timeline for the enter animation
      const tl = gsap.timeline();

      // Hide the shadow logo first
      if (dvdLogoRef.current) {
        gsap.set(dvdLogoRef.current, {
          visibility: 'hidden',
          opacity: 0
        });
      }

      // Animate nav elements in
      const navbar = navbarRef.current;
      if (navbar) {
        const allNavElements = [
          navbar.themeTop,
          navbar.grid,
          navbar.noise,
          navbar.dvd,
          navbar.themeBottom,
          navbar.themeLeft,
          navbar.themeRight
        ];

        tl.to(allNavElements, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: "power2.out"
        });
      }

      // Animate content in
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "sine.out"
      }, "-=0.3");
    }
  }, [startDvdAnimation, stopDvdAnimation]);

  // Handle click to exit DVD mode
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDvdActive) {
      handleDvdToggle(false);
    }
  }, [isDvdActive, handleDvdToggle]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      stopDvdAnimation();
    };
  }, [stopDvdAnimation]);

  return (
    <PageWrapper noiseEnabled={noiseEnabled}>
      <ContentWrapper ref={containerRef} onClick={handleClick}>
        {isMobile ? (
          <MobileNavbar
            className="mobile-navbar"
            onGridToggle={handleGridToggle}
            onNoiseToggle={handleNoiseToggle}
            onDvdToggle={handleDvdToggle}
            onExpandedChange={handleNavExpandedChange}
            initialNoiseState={noiseEnabled}
            hideInactiveToggles={false}
          />
        ) : null}
        <BlurWrapper 
          ref={blurWrapperRef}
          style={isMobile && isNavExpanded ? {
            filter: 'blur(8px)'
          } : undefined}
        >
          <Navbar
            ref={navbarRef}
            onGridToggle={handleGridToggle}
            onNoiseToggle={handleNoiseToggle}
            onThemeChange={cycleTheme}
            onDvdToggle={handleDvdToggle}
            initialNoiseState={noiseEnabled}
            hideInactiveToggles={false}
          />
          <StyledContent 
            ref={contentRef}
            className={`${jetbrainsMono.className}`}
            style={{
              visibility: isDvdActive ? 'hidden' : 'visible',
              transition: 'visibility 0.2s ease'
            }}
          >
            <h1 
              ref={topTextRef}
              className={`${textStyles.caption} text-[var(--color-text)] text-content-hidden`}
              style={{ backgroundColor: 'transparent' }}
            >
              product designer
            </h1>
            <div 
              ref={logoRef}
              className="w-[50vw] aspect-[2/1]"
              style={{ visibility: isDvdActive ? 'hidden' : 'visible' }}
            >
              <Logo />
            </div>
            <p 
              ref={bottomTextRef}
              className={`${textStyles.caption} text-[var(--color-text)] text-content-hidden`}
              style={{ backgroundColor: 'transparent' }}
            >
              no code developer
            </p>
          </StyledContent>
          <div
            ref={dvdLogoRef}
            className="absolute w-[50vw] aspect-[2/1] pointer-events-none"
            style={{
              visibility: isDvdActive ? 'visible' : 'hidden',
              opacity: isDvdActive ? 1 : 0,
              transform: `translate(${logoPosition.x}px, ${logoPosition.y}px)`,
              transition: 'none',
              zIndex: 40,
              width: '50vw',
              height: 'auto',
              maxWidth: 'calc(100vw - 64px)',
              maxHeight: 'calc(100vh - 64px)',
              willChange: 'transform',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            <Logo />
          </div>
        </BlurWrapper>
      </ContentWrapper>
    </PageWrapper>
  );
}