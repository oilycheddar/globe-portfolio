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

const ContentWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;  
  
  .mobile-navbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 31;
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
  padding: 0 var(--space-xl);
  opacity: 0;
  
  @media (max-width: 440px) {
    --mobile-navbar-height: 32px;
    padding: 0 var(--space-md);
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--space-md);
    justify-content: center;
    padding-top: var(--space-xl);
    min-height: 0;
    overflow-y: auto;
  }
`;

const ImageWrapper = styled.div`
  width: 300px;
  max-width: 100%;
  position: relative;
  aspect-ratio: 1/1;
  
  @media (max-width: 440px) {
    width: 100%;
    aspect-ratio: 1/1;
    position: relative;
  }
`;

const ProfileImage = styled(Image)`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  mix-blend-mode: hard-light;
  object-fit: cover;
  object-position: center;
  
  @media (max-width: 440px) {
    object-position: center;
  }
`;

const AboutText = styled.p`
  width: 300px;
  max-width: 300px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: center;
  
  @media (max-width: 440px) {
    width: 100%;
    max-width: none;
  }
`;

export default function NotFound() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const aboutTextRef = useRef<HTMLParagraphElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const mobileNavbarRef = useRef<MobileNavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  const initializeGSAPAnimations = () => {
    gsap.registerPlugin(ScrambleTextPlugin, SplitText);
    
    const ctx = gsap.context(() => {
      if (navbarRef.current?.container) {
        gsap.set(navbarRef.current.container, {
          opacity: 1,
          y: 0,
          visibility: 'visible'
        });
      }

      const navbar = navbarRef.current;
      if (navbar?.container) {
        gsap.set(navbar.container, {
          opacity: 1,
          y: 0,
          visibility: 'visible'
        });

        const allNavElements = [
          navbar.themeTop,
          navbar.grid,
          navbar.noise,
          navbar.themeBottom,
          navbar.themeLeft,
          navbar.themeRight
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

      gsap.set(contentRef.current, {
        opacity: 1,
        visibility: 'visible'
      });

      const tl = gsap.timeline({
        delay: 1.2,
        defaults: {
          ease: "sine.out",
        }
      });

      tl.fromTo(".profile-image-wrapper", {
        scale: 0.92,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      });

      if (aboutTextRef.current) {
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
            Array.from(node.childNodes).forEach(wrapWordsInSpans);
          }
        };

        wrapWordsInSpans(aboutTextRef.current);
        const allSpans = aboutTextRef.current.querySelectorAll('span');
        
        gsap.set(allSpans, {
          filter: "blur(12px)",
          opacity: 0
        });

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

      if (navbar) {
        const allNavElements = [
          navbar.themeTop,
          navbar.grid,
          navbar.noise,
          navbar.themeBottom,
          navbar.themeLeft,
          navbar.themeRight
        ];

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

  useEffect(() => {
    const ctx = initializeGSAPAnimations();
    return () => ctx.revert();
  }, []);

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
              src="/chewy.JPG"
              alt="Chewy the dog"
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
            This is Chewy. He's here to say you've found a dead end. Bye.
          </AboutText>
        </StyledContent>
      </ContentWrapper>
    </PageWrapper>
  );
}
