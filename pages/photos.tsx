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
import photos, { Photo } from '../data/photos';

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
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
    padding: var(--space-md);
    gap: var(--space-lg);
    min-height: 0;
    position: relative;
    flex: 1;
    overflow: hidden;
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
  touch-action: pan-y;

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
    margin: 37vh 0 0;
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

  @media (max-width: 440px) {
    display: none;
  }
`;

const MobileImageStack = styled.div`
  display: none;
  
  @media (max-width: 440px) {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    overflow-y: auto;
    padding: var(--space-xl) var(--space-md);
    -webkit-overflow-scrolling: touch;
    
    .stack-image {
      width: 100%;
      height: auto;
      cursor: pointer;
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
  const mobileNavbarRef = useRef<MobileNavbarRef>(null);
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
  const startingRotation = 170; // Set this value to control starting position (0-360)

  // Prevent body scrolling when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Configuration for touch and scroll behavior
  const touchConfig = {
    sensitivity: 4, // Higher number = less sensitive
    direction: 1, // 1 for clockwise, -1 for counter-clockwise
  };

  const scrollConfig = {
    sensitivity: 10, // Much more responsive
    direction: -1,
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

  const handleGridToggle = (value: boolean) => {
    // Implement grid toggle functionality
  };

  const handleNoiseToggle = (value: boolean) => {
    setNoiseEnabled(value);
  };

  const handleNavExpandedChange = (value: boolean) => {
    setIsNavExpanded(value);
  };

  // Add cycleTheme function
  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
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
        <OrbitalContainer className="mwg_effect023" ref={containerRef}>
          <div className="container">
            {photos.map((photo: Photo, i: number) => (
              <div className="inner-media" key={i}>
                <Image
                  className="media"
                  src={photo.src}
                  alt={photo.alt}
                  width={800}
                  height={1000}
                  quality={75}
                  priority={i < 4}
                  sizes="(max-width: 440px) 80vw, 40vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRseHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </div>
            ))}
          </div>
        </OrbitalContainer>

        <MobileImageStack>
          {photos.map((photo: Photo, i: number) => (
            <Image
              key={i}
              className="stack-image"
              src={photo.src}
              alt={photo.alt}
              width={800}
              height={1000}
              quality={75}
              priority={i < 2}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRseHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              style={{ 
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                aspectRatio: 'auto'
              }}
            />
          ))}
        </MobileImageStack>
      </ContentWrapper>
    </PageWrapper>
  );
}
