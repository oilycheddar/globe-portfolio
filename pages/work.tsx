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

const CaseStudy = styled.div`
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --navbar-height: 64px;
  position: absolute;
  top: var(--space-xl);
  bottom: var(--navbar-height);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  transition: filter 0.4s ease;
  /* Add padding to prevent content from overlapping with navs */
  padding: var(--space-xl) var(--space-lg);
  /* Initial state to prevent FOUC */
  opacity: 0;
  overflow: visible;
  /* Responsive adjustments */
  @media (max-width: 440px) {
    --mobile-navbar-height: 24px;
    position: relative;
    top: var(--mobile-navbar-height);
    bottom: auto;
    justify-content: flex-start;
    padding: var(--space-xl) var(--space-md);
    gap: var(--space-md);
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
  top: var(--space-xl);
  bottom: var(--navbar-height);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  transition: filter 0.4s ease;
  /* Add padding to prevent content from overlapping with navs */
  padding: var(--space-xl) var(--space-lg);
  /* Initial state to prevent FOUC */
  opacity: 0;
  overflow: visible;
  /* Responsive adjustments */
  @media (max-width: 440px) {
    --mobile-navbar-height: 24px;
    position: relative;
    top: var(--mobile-navbar-height);
    bottom: auto;
    justify-content: flex-start;
    padding: var(--space-xl) var(--space-md);
    gap: var(--space-md);
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
    gap: var(--space-md);
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

const CaseStudiesList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  padding: var(--space-xl) var(--space-lg);
  overflow-y: auto;
  height: 100%;
  
  @media (max-width: 440px) {
    padding: var(--space-xl) var(--space-md);
    gap: var(--space-lg);
  }
`;

export default function Work() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const workDescriptionRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
        opacity: 0,
        y: 20,
        visibility: 'visible'
      });

      // Create main timeline with a delay to wait for innerShape animation
      const tl = gsap.timeline({
        delay: 1.2,
        defaults: {
          ease: "sine.out",
        }
      });

      // Animate content first
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      });

      // Animate all nav elements together
      if (navbar) {
        const allNavElements = [
          navbar.themeTop,  // Theme SLIME (top)
          navbar.grid,
          navbar.noise,
          navbar.dvd,
          navbar.speed,
          navbar.themeBottom   // STATION (bottom)
        ];

        // Animate all nav elements together
        tl.to(allNavElements, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: "power2.out",
          clearProps: "all"
        }, "-=0.45"); // Start slightly before content animation ends
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

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
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
          hideSideNavs={true}
        />
        <CaseStudiesList>
          <CaseStudy 
            ref={contentRef}
            className={`${jetbrainsMono.className}`}
            style={isMobile && isNavExpanded ? {
              filter: 'blur(8px)'
            } : undefined}
          >
            <ImageWrapper 
              className="work-sample-image-wrapper"
              onClick={handleVideoClick}
              style={{ cursor: 'pointer' }}
            >
              {!isVideoPlaying && <PlayButton />}
              <WorkSampleVideo
                ref={videoRef}
                className="work-sample-video"
                src="/TreasuryDemoReel.mp4"
                poster="/RBA_Intelligence_Asset_Dark.png"
                muted
                playsInline
                onEnded={handleVideoEnded}
              />
            </ImageWrapper>
            <WorkSampleText>
              <WorkSampleCopyContainer>
                <WorkTitleLink 
                  href="https://www.ramp.com/treasury"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WorkSampleTitle className={`${textStyles.caption} text-[var(--color-text)]`}>
                    RAMP TREASURY
                  </WorkSampleTitle>
                  <img src="/link-external.svg" alt="External link" />
                </WorkTitleLink>
                <WorkSampleDescription 
                  ref={workDescriptionRef}
                  className={`${textStyles.caption} text-[var(--color-text)]`}
                >
                  I LED THE ZERO-TO-ONE DESIGN FOR RAMP'S BUSINESS & INVESTMENT ACCOUNTS. {'\n'}CREATED WITH THE FINANCIAL PRODUCTS TEAM AT RAMP.
                </WorkSampleDescription>
              </WorkSampleCopyContainer>
              <WorkSampleTeamContainer>
                <CollaboratorRole 
                  className={`${textStyles.caption} text-[var(--color-text)]`}
                >
                  FRONT END:{'\n'}
                  BACK END:{'\n'}
                  PRODUCT:{'\n'}
                  DATA:{'\n'}
                  MARKETING:{'\n'}
                  BRAND:
                </CollaboratorRole>
                <CollaboratorNames 
                  className={`${textStyles.caption} text-[var(--color-text)]`}
                >
                  FARDEEM, MARK{'\n'}
                  ARNAB, ERIC, DANIELLE{'\n'}
                  WILLIAM, KARL{'\n'}
                  JAMES{'\n'}
                  BECKY, CHRISTY{'\n'}
                  EMILY, SHIVANI{'\n'}
                </CollaboratorNames>
              </WorkSampleTeamContainer>
            </WorkSampleText>
          </CaseStudy>
        </CaseStudiesList>
      </ContentWrapper>
    </PageWrapper>
  );
}