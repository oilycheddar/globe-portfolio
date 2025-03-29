'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import { Ref, useEffect, useRef, useState } from "react";
import { gsap, ScrambleTextPlugin, SplitText } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";
import { MobileNavbar } from "../components/MobileNavbar";
import type { MobileNavbarRef } from "../components/MobileNavbar";
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
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
  }
  
  @media (max-width: 440px) {
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
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
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  overflow-y: auto;
  transition: filter 0.4s ease;

  /* Add padding to prevent content from overlapping with navs */
  padding: 0 var(--space-xl);

  /* Initial state to prevent FOUC */
  opacity: 0;
  
  /* Responsive adjustments */
  @media (max-width: 440px) {
    --mobile-navbar-height: 32px;
    padding: 0 var(--space-md);
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--space-md);
    justify-content: center;
    min-height: 0;
    overflow-y: auto;
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

const StyledLink = styled.a`
  text-decoration: underline;
  color: inherit;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  display: inline-block;
  text-decoration-skip-ink: none;
  position: relative;
  z-index: 1;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default function About() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLParagraphElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const mobileNavbarRef = useRef<MobileNavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);



  // Add cycleTheme function
  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  // Initialize GSAP animations
  const initializeGSAPAnimations = () => {
    gsap.registerPlugin(ScrambleTextPlugin, SplitText);
    
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

        // Hide all nav elements initially
        const allNavElements = [
          navbar.themeTop,  // Theme SLIME (top)
          navbar.grid,
          navbar.noise,
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
        opacity: 1,
        visibility: 'visible'
      });

      // Create main timeline with a delay to wait for innerShape animation
      const tl = gsap.timeline({
        delay: 1.2,
        defaults: {
          ease: "sine.out",
        }
      });

      // Animate image with scale first
      tl.fromTo(".profile-image-wrapper", {
        scale: 0.92,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      });

      // Animate text after image
      if (aboutTextRef.current) {
        // Create spans around words while preserving links
        const wrapWordsInSpans = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent?.split(/\s+/) || [];
            const fragment = document.createDocumentFragment();
            words.forEach((word, i) => {
              if (word) {
                const span = document.createElement('span');
                span.textContent = word;
                span.style.display = 'inline-block';
                fragment.appendChild(span);
                if (i < words.length - 1) {
                  fragment.appendChild(document.createTextNode(' '));
                }
              }
            });
            node.parentNode?.replaceChild(fragment, node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.nodeName === 'A') {
              // For links, wrap the entire link in a span
              const span = document.createElement('span');
              span.style.display = 'inline-block';
              node.parentNode?.insertBefore(span, node);
              span.appendChild(node);
            } else {
              Array.from(node.childNodes).forEach(wrapWordsInSpans);
            }
          }
        };

        wrapWordsInSpans(aboutTextRef.current);

        // Get all word spans and link wrapper spans
        const allSpans = aboutTextRef.current.querySelectorAll('span');
        
        // Set initial state for all spans
        gsap.set(allSpans, {
          filter: "blur(12px)",
          opacity: 0
        });

        // Animate each span with stagger
        tl.to(allSpans, {
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.3,
          stagger: {
            amount: 0.4,
            ease: "sine.inOut"
          }
        }, "-=0.25");
      }

      // Animate all nav elements together
      if (navbar) {
        const allNavElements = [
          navbar.themeTop,  // Theme SLIME (top)
          navbar.grid,
          navbar.noise,
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
  }, []);

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

  const handleNavExpandedChange = (value: boolean) => {
    setIsNavExpanded(value);
  };

  return (
    <PageWrapper noiseEnabled={noiseEnabled}>
      <ContentWrapper>
        {isMobile ? (
          <MobileNavbar
            ref={mobileNavbarRef}
            className="mobile-navbar"
            onGridToggle={handleGridToggle}
            onNoiseToggle={handleNoiseToggle}
            onExpandedChange={handleNavExpandedChange}
            initialNoiseState={noiseEnabled}
            hideInactiveToggles={false}
            showDvdToggle={false}
            show3DToggle={false}
          />
        ) : null}
        <Navbar
          ref={navbarRef}
          onGridToggle={handleGridToggle}
          onNoiseToggle={handleNoiseToggle}
          onThemeChange={cycleTheme}
          initialNoiseState={noiseEnabled}
          hideInactiveToggles={false}
          showDvdToggle={false}
          show3DToggle={false}
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
            
              I ENJOY SOME OF THE OLD, AND I ENJOY SOME OF THE   NEW. I'M IN LOVE. RUNNING GETS MY HEART RATE UP,  MUSIC    SLOWS IT DOWN. I SEEK MY OWN WAY. HONOURING MY INTUITION TOOK   MANY   YEARS. MY NEXT JOB WILL BE OPENING A <StyledLink href="https://insheepsclothinghifi.com/tokyo-jazz-kissa/" target="_blank" rel="noopener noreferrer">HI-FI </StyledLink><StyledLink href="https://insheepsclothinghifi.com/tokyo-jazz-kissa/" target="_blank" rel="noopener noreferrer">BAR</StyledLink>. <br /><br />

              I built this site with Cursor, Typescript, GSAP and three.js to push my skills as a designer and see what's possible. The code is <StyledLink href="https://github.com/oilycheddar/globe-portfolio" target="_blank" rel="noopener noreferrer">open</StyledLink><StyledLink href="https://github.com/oilycheddar/globe-portfolio" target="_blank" rel="noopener noreferrer"> source</StyledLink>.
            
          </AboutText>
        </StyledContent>
      </ContentWrapper>
    </PageWrapper>
  );
}
