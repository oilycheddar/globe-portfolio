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
import Image from 'next/image';
import photos, { Photo } from '../data/photos';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

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
  gap: var(--space-lg);
  transition: filter 0.4s ease;

  /* Add padding to prevent content from overlapping with navs */
  padding: 0 var(--space-xl);

  /* Initial state to prevent FOUC */
  opacity: 0;
  transform: translateY(20px);
  
  /* Responsive adjustments */
  @media (max-width: 440px) {
    --mobile-navbar-height: 32px;
    padding: 0 var(--space-md);
    gap: var(--space-md);
    min-height: 0;
    height: 100%;
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

const OrbitalContainer = styled.div`
  height: 100vh;
  position: relative;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;

  .container {
    position: absolute;
    width: 500vw;
    height: 500vw;
    left: -210vw;
    will-change: transform;
    touch-action: pan-y;

    @media (max-width: 440px) {
      width: 1000vw;
      height: 1000vw;
      left: -500vw;
    }
  }

  .inner-media {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
  }

  .media {
    width: 45vw;
    height: 50vw;
    margin: 75vh 0 0;
    transform: translate(0, -50%);
    object-fit: contain;
    object-position: 50% 100%;
    will-change: transform;
    border-radius: 0px;
    
    @media (max-width: 440px) {
      width: 85vw;
      margin: 40vh 0 0;
      height: 90vw;
    }
  }
`;

interface OrbitalConfig {
  radius: number;
  rotationSpeed: number;
  yDisplacement: number;
  animationDuration: number;
}

export default function Photos() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [radius, setRadius] = useState(200); // Default desktop radius
  const [config, setConfig] = useState<OrbitalConfig>({
    radius: 150,
    rotationSpeed: 40,
    yDisplacement: 4,
    animationDuration: 0.8
  });

  // Handle mobile responsiveness and radius
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 440;
      setIsMobile(isMobileView);
      setRadius(isMobileView ? 200 : 200); // Smaller radius for mobile
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state for orbital images
      gsap.set(".mwg_effect023 .media", { yPercent: -50 });

      const medias = document.querySelectorAll<HTMLElement>(".mwg_effect023 .inner-media");
      const mediasTotal = medias.length;

      // Distribute images evenly in a circle
      medias.forEach((media, index) => {
        const randomClass = `media-${Math.floor(Math.random() * 3) + 1}`;
        media.classList.add(randomClass);
        const angle = (360 / mediasTotal) * index;
        const radian = (angle * Math.PI) / 180;
        
        // Calculate x and y positions based on angle and radius
        const x = Math.cos(radian) * radius;
        const y = Math.sin(radian) * radius;
        
        gsap.set(media, {
          rotation: angle,
          x: x,
          y: y
        });
      });

      // Create quickTo instances for smooth animations
      const rotTo = gsap.quickTo(".mwg_effect023 .container", "rotation", {
        duration: 0.8,
        ease: "power4",
      });

      const yTo1 = gsap.quickTo(".mwg_effect023 .media-1 .media", "yPercent", {
        duration: 1,
        ease: "power3",
      });

      const yTo2 = gsap.quickTo(".mwg_effect023 .media-2 .media", "yPercent", {
        duration: 2,
        ease: "power3",
      });

      const yTo3 = gsap.quickTo(".mwg_effect023 .media-3 .media", "yPercent", {
        duration: 3,
        ease: "power3",
      });

      let incr = 0;
      const handleScroll = (e: WheelEvent) => {
        const deltaY = e.deltaY;
        incr -= deltaY / 14;
        rotTo(incr);

        const val = -Math.abs(deltaY / 4) - 50;
        yTo1(val);
        yTo2(val);
        yTo3(val);
      };

      window.addEventListener("wheel", handleScroll, { passive: true });

      // Add touch event handling
      let touchStartY = 0;
      let lastTouchY = 0;

      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
        lastTouchY = touchStartY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        
        // Calculate delta movement
        const deltaY = touchY - lastTouchY;
        
        // Update rotation based on vertical movement (like wheel event)
        incr -= deltaY / 14;
        rotTo(incr);

        // Update vertical position based on vertical movement
        const val = -Math.abs(deltaY / 4) - 50;
        yTo1(val);
        yTo2(val);
        yTo3(val);

        lastTouchY = touchY;
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
      }

      return () => {
        window.removeEventListener("wheel", handleScroll);
        if (container) {
          container.removeEventListener('touchstart', handleTouchStart);
          container.removeEventListener('touchmove', handleTouchMove);
        }
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Set initial theme-color
  useEffect(() => {
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  }, [theme]);

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
    setConfig(prev => ({
      ...prev,
      rotationSpeed: value ? 20 : 40,
      yDisplacement: value ? 2 : 4,
      animationDuration: value ? 0.4 : 0.8
    }));
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
            hideInactiveToggles={true}
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
          hideInactiveToggles={true}
        />
        <OrbitalContainer className="mwg_effect023" ref={containerRef}>
          <div className="container">
            {photos.map((photo: Photo, i: number) => (
              <div className="inner-media" key={i}>
                <Image
                  className="media"
                  src={noiseEnabled ? photo.src : photo.src.replace('.webp', '_noiseless.webp')}
                  alt={photo.alt}
                  width={300}
                  height={400}
                  quality={100}
                />
              </div>
            ))}
          </div>
        </OrbitalContainer>
      </ContentWrapper>
    </PageWrapper>
  );
}
