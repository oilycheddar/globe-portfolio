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
import { CaseStudy } from "../components/CaseStudy";
import { caseStudies } from "../data/caseStudies";

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

  @media (max-width: 440px) {
    position: fixed;
    width: 100%;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const CaseStudiesList = styled.div`
  width: 100%;
  margin-left: var(--navbar-width);
  display: flex;
  flex-direction: column;
  gap: var(--space-xxl);
  padding: var(--space-xl) var(--space-lg);
  overflow-y: auto;
  height: calc(100vh - var(--space-xl) *2);
  margin-top: var(--navbar-height);
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  box-sizing: border-box;
  
  /* First handle tablet/medium sizes */
  @media (max-width: 768px) {
    width: calc(100% - var(--navbar-width));
    padding: var(--space-lg) var(--space-lg);
    gap: var(--space-lg);
  }
  
  /* Then handle mobile */
  @media (max-width: 440px) {
    --space-mobile-xxl: 80px; /* Add larger space for mobile */
    --mobile-navbar-height: 32px;
    width: 100%;
    margin-left: 0;
    flex: 1;
    padding: var(--space-xl) var(--space-md);
    gap: var(--space-mobile-xxl);
    height: auto;
    margin-top: var(--mobile-navbar-height);
    padding-bottom: calc(var(--navbar-height) + var(--space-xl));
  }
`;

const PlayButton = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  z-index: 10;
  
  &:hover {
    transform: scale(1.1);
  }

  &::before {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 15px 0 15px 25px;
    border-color: transparent transparent transparent white;
    margin-left: 5px;
  }

  @media (max-width: 440px) {
    width: 60px;
    height: 60px;

    &::before {
      border-width: 12px 0 12px 20px;
      margin-left: 4px;
    }
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  position: relative;
  aspect-ratio: 16/9;
  margin: 0 calc(-1 * var(--space-lg));
  overflow: hidden;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 440px) {
    margin: 0 calc(-1 * var(--space-md));
    aspect-ratio: 16/9;
  }
`;

const WorkSampleVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 100%;
  max-width: 100%;
`;

const WorkSampleTitle = styled.h2`
  margin: 0;
  text-align: left;
  white-space: nowrap;
  width: fit-content;
  
  @media (max-width: 440px) {
    width: fit-content;
  }
`;

const WorkTitleLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: inherit;
  font: inherit;
  
  &:hover {
    opacity: 0.8;
  }

  img {
    width: 16px;
    height: 16px;
  }

  ${WorkSampleTitle} {
    text-decoration: underline;
  }
`;

const WorkSampleDescription = styled.p`
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: right;
  overflow: visible;
  width: fit-content;
  
  @media (max-width: 440px) {
    width: 100%;
  }
`;

const WorkSampleCopyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  width: fit-content;
  overflow: visible;
  
  ${WorkSampleTitle}, ${WorkSampleDescription} {
    text-align: left;
  }
  
  @media (max-width: 440px) {
    width: 100%;
      gap: var(--space-sm);

  }
`;

const WorkSampleTeamContainer = styled(WorkSampleCopyContainer)`
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;
  gap: var(--space-lg);
  width: fit-content;

  ${WorkSampleTitle}, ${WorkSampleDescription} {
    text-align: right;
  }

  @media (max-width: 440px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: var(--space-sm);
    width: 100%;

    ${WorkSampleTitle}, ${WorkSampleDescription} {
      text-align: left;
    }
  }
`;

const CollaboratorRole = styled(WorkSampleTitle)`
  white-space: pre-line;
`;

const CollaboratorNames = styled(WorkSampleDescription)`
  white-space: pre-line;
  width: fit-content;
  
  @media (max-width: 440px) {
    min-width: unset;
    width: auto;
    flex: 1;
  }
`;

const WorkSampleText = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  overflow: visible;
  gap: var(--space-xl);
  
  @media (max-width: 768px) {
    gap: var(--space-sm);
  }
  
  @media (max-width: 440px) {
    flex-direction: column;
    gap: var(--space-xl);
    align-items: stretch;
  }
`;

export default function Work() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [currentCaseStudyIndex, setCurrentCaseStudyIndex] = useState(0);

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

      // Set initial state for all case studies
      const caseStudies = document.querySelectorAll('.case-study');
      caseStudies.forEach((study) => {
        gsap.set(study, {
          opacity: 0,
          y: 20,
          visibility: 'visible',
          display: 'flex'
        });
      });

      // Create main timeline with a delay to wait for innerShape animation
      const tl = gsap.timeline({
        delay: 1.2,
        defaults: {
          ease: "sine.out",
        }
      });

      // Animate all case studies with stagger
      tl.to(caseStudies, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        clearProps: "all"
      });

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
            onExpandedChange={handleNavExpandedChange}
            initialNoiseState={noiseEnabled}
          />
        ) : null}
        <Navbar
          ref={navbarRef}
          onGridToggle={handleGridToggle}
          onNoiseToggle={handleNoiseToggle}
          onThemeChange={() => {}}
          initialNoiseState={noiseEnabled}
          hideSideNavs={true}
        />
        <CaseStudiesList>
          {caseStudies.map((study, index) => (
            <CaseStudy
              key={study.id}
              data={study}
              ref={index === 0 ? contentRef : undefined}
              className={`${jetbrainsMono.className} case-study`}
              style={isMobile && isNavExpanded ? {
                filter: 'blur(8px)'
              } : undefined}
              autoplay={study.id === 'affirmations'}
            />
          ))}
        </CaseStudiesList>
      </ContentWrapper>
    </PageWrapper>
  );
}