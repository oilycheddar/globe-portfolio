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
    width: 40vw;
    height: 40vw;
    margin: 40vh 0 0;
    transform: translate(0, -50%);
    object-fit: contain;
    object-position: 50% 100%;
    will-change: transform;
    border-radius: 0px;
    
    @media (max-width: 440px) {
      width: 80vw;
      margin: 40vh 0 0;
      height: 100vw;
    }
  }
`;

const Lightbox = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s ease;

  .lightbox-content {
    position: relative;
    width: 90%;
    height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .lightbox-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 10px;
  }

  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 20px;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }

    &.prev {
      left: 20px;
    }

    &.next {
      right: 20px;
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
    radius: 200,
    rotationSpeed: 40,
    yDisplacement: 4,
    animationDuration: 0.8
  });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const startingRotation = 170; // Set this value to control starting position (0-360)

  // Configuration for touch and scroll behavior
  const touchConfig = {
    sensitivity: 4, // Higher number = less sensitive
    direction: 1, // 1 for clockwise, -1 for counter-clockwise
  };

  const scrollConfig = {
    sensitivity: 25, // Higher number = less sensitive
    direction: -1, // 1 for clockwise, -1 for counter-clockwise
  };

  // Handle mobile responsiveness and radius
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 440;
      setIsMobile(isMobileView);
      setRadius(isMobileView ? 400 : 200); // Different values for mobile/desktop
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state for orbital images
      gsap.set(".mwg_effect023 .media", { yPercent: -50 });
      gsap.set(".mwg_effect023 .container", { rotation: startingRotation });

      let incr = startingRotation; // Use the startingRotation value

      const medias = document.querySelectorAll<HTMLElement>(".mwg_effect023 .inner-media");
      const mediasTotal = medias.length;

      // Distribute images evenly in a circle
      medias.forEach((media, index) => {
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
        duration: 1.25,
        ease: "ease.inOut2",
      });

      const yTo = gsap.quickTo(".mwg_effect023 .media", "yPercent", {
        duration: 1,
        ease: "power3",
      });

      const handleScroll = (e: WheelEvent) => {
        const deltaY = e.deltaY;
        incr += (deltaY / scrollConfig.sensitivity) * scrollConfig.direction;
        rotTo(incr);

        const val = -Math.abs(deltaY / 4) - 50;
        yTo(val);
      };

      window.addEventListener("wheel", handleScroll, { passive: true });

      // Add touch event handling
      let touchStartX = 0;
      let lastTouchX = 0;

      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX;
        lastTouchX = touchStartX;
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        
        // Calculate delta movement
        const deltaX = touchX - lastTouchX;
        
        // Update rotation based on horizontal movement
        incr += (deltaX / touchConfig.sensitivity) * touchConfig.direction;
        rotTo(incr);

        lastTouchX = touchX;
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

  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      radius: radius // This will update whenever radius changes
    }));
  }, [radius]);

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

  const handleNavExpandedChange = (value: boolean) => {
    setIsNavExpanded(value);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
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
                  onClick={() => handleImageClick(i)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        </OrbitalContainer>
      </ContentWrapper>

      <Lightbox isOpen={isLightboxOpen}>
        <div className="lightbox-content">
          <button className="close-button" onClick={handleCloseLightbox}>
            ×
          </button>
          <button className="nav-button prev" onClick={handlePrevImage}>
            ‹
          </button>
          <Image
            className="lightbox-image"
            src={noiseEnabled ? photos[currentImageIndex].src : photos[currentImageIndex].src.replace('.webp', '_noiseless.webp')}
            alt={photos[currentImageIndex].alt}
            width={1200}
            height={1600}
            quality={100}
          />
          <button className="nav-button next" onClick={handleNextImage}>
            ›
          </button>
        </div>
      </Lightbox>
    </PageWrapper>
  );
}
