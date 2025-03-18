import { useState, forwardRef, useRef, useImperativeHandle, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { textStyles, typography } from '../styles/text';
import { ToggleButton } from './toggleButton';
import { useVisualStore } from '../hooks/useVisualStore';
import { themes } from '../styles/themes';
import { JetBrains_Mono } from 'next/font/google';
import { gsap } from '../utils/gsap';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

const NavContainer = styled.div<{ $isExpanded: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: ${props => props.$isExpanded ? '100%' : '44px'};
  max-width: ${props => props.$isExpanded ? '100%' : '44px'};
  background-color: var(--color-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 30;
  border-radius: ${props => props.$isExpanded ? '20px' : '0'};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
  
  /* Add noise overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-size: cover;
    pointer-events: none;
    z-index: 1;
  }
`;

const IconWrapper = styled.div`
  padding: 0 10px 4px 10px;
  cursor: pointer;
  position: relative;
  z-index: 2;
  width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-primary);
  
  img {
    color: inherit;
  }
`;

const ToggleButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  padding: 20px;
  width: 100%;
  justify-items: center;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const ApplyButton = styled.a`
  ${typography.caption};
  color: var(--color-text) !important;
  text-decoration: none !important;
  margin: 0 0 20px;
  cursor: pointer;
  position: relative;
  z-index: 2;
  display: inline-block;
  
  &:hover, &:visited, &:active {
    color: var(--color-text) !important;
    text-decoration: none !important;
  }
  
  span {
    color: var(--color-text) !important;
  }
`;

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.75 12C6.75 9.1005 9.10051 6.75 12 6.75C13.4497 6.75 14.7622 7.33762 15.7123 8.28767L8.28767 15.7123C7.33762 14.7622 6.75 13.4497 6.75 12ZM12 5.25C8.27208 5.25 5.25 8.27208 5.25 12C5.25 15.7279 8.27208 18.75 12 18.75C15.7279 18.75 18.75 15.7279 18.75 12C18.75 8.27208 15.7279 5.25 12 5.25Z" fill="currentColor"/>
  </svg>
);

interface MobileNavbarProps {
  onGridToggle: (value: boolean) => void;
  onNoiseToggle: (value: boolean) => void;
  onDvdToggle: (value: boolean) => void;
  onSpeedToggle: (value: boolean) => void;
  onThemeChange?: (theme: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export interface MobileNavbarRef {
  container: HTMLDivElement | null;
}

export const MobileNavbar = forwardRef<MobileNavbarRef, MobileNavbarProps>(({
  onGridToggle,
  onNoiseToggle,
  onDvdToggle,
  onSpeedToggle,
  onThemeChange,
  onExpandedChange,
  className = ''
}, ref) => {
  const { theme, setTheme, isNoiseEnabled, toggleNoise } = useVisualStore();
  const themeKeys = Object.keys(themes);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const applyButtonRef = useRef<HTMLAnchorElement>(null);
  
  // Store pending changes
  const [pendingChanges, setPendingChanges] = useState({
    grid: false,
    noise: false,
    dvd: false,
    speed: false
  });

  useImperativeHandle(ref, () => ({
    container: containerRef.current
  }));

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  // Animation effect
  useEffect(() => {
    if (!containerRef.current || !contentRef.current || !applyButtonRef.current) return;

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.3,
        ease: "power3.inOut"
      }
    });

    // Set initial states
    if (isExpanded) {
      gsap.set(containerRef.current, {
        width: "44px",
        maxWidth: "44px"
      });
      gsap.set([contentRef.current, applyButtonRef.current], {
        opacity: 0,
        scale: 0.98,
        y: -5
      });
    }

    // Set up the animation
    if (isExpanded) {
      // Expand animation
      tl.to(containerRef.current, {
        width: "100%",
        maxWidth: "100%",
      })
      .to([contentRef.current, applyButtonRef.current], {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.05,
        clearProps: "all"
      }, "<"); // Start at the same time as the container animation
    } else {
      // Collapse animation
      tl.to(containerRef.current, {
        width: "44px",
        maxWidth: "44px",
      })
      .to([contentRef.current, applyButtonRef.current], {
        opacity: 0,
        scale: 0.98,
        y: -5,
        stagger: 0.03,
      }, "<"); // Start at the same time as the container animation
    }

    // Play the animation
    tl.play();

    // Cleanup
    return () => {
      tl.kill();
      gsap.set([containerRef.current, contentRef.current, applyButtonRef.current], {
        clearProps: "all"
      });
    };
  }, [isExpanded]);

  // Optimize theme change handler
  const handleThemeChange = useCallback((value: string) => {
    if (value === theme) return;
    
    // Batch theme updates
    requestAnimationFrame(() => {
      setTheme(value);
      onThemeChange?.(value);
    });
  }, [theme, setTheme, onThemeChange]);

  // Optimize close handler
  const handleClose = useCallback(() => {
    if (!containerRef.current || !contentRef.current || !applyButtonRef.current) return;

    const tl = gsap.timeline({
      defaults: {
        duration: 0.15,
        ease: "power2.inOut"
      }
    });

    tl.to([contentRef.current, applyButtonRef.current], {
      opacity: 0,
      scale: 0.98,
      y: -5,
      stagger: 0.05
    })
    .to(containerRef.current, {
      width: "44px",
      maxWidth: "44px",
      clearProps: "all",
      onComplete: () => {
        // Only update state after animation completes
        setIsExpanded(false);
        onExpandedChange?.(false);
      }
    }, "-=0.1");
  }, [theme, onExpandedChange, onThemeChange]);

  return (
    <NavContainer 
      ref={containerRef}
      $isExpanded={isExpanded}
      className={className}
    >
      <IconWrapper onClick={handleToggle}>
        <MenuIcon />
      </IconWrapper>
      
      {isExpanded && (
        <>
          <ToggleButtonsGrid ref={contentRef} className={jetbrainsMono.className}>
            <ToggleButton
              type="multi"
              label="theme"
              value={theme}
              options={themeKeys}
              onChange={handleThemeChange}
            />
            <ToggleButton
              type="boolean"
              label="grid"
              value={pendingChanges.grid}
              onChange={(value) => setPendingChanges(prev => ({ ...prev, grid: value }))}
            />
            <ToggleButton
              type="boolean"
              label="noise"
              value={isNoiseEnabled}
              onChange={() => {
                toggleNoise();
                onNoiseToggle(!isNoiseEnabled);
              }}
            />
            <ToggleButton
              type="boolean"
              label="dvd"
              value={pendingChanges.dvd}
              onChange={(value) => setPendingChanges(prev => ({ ...prev, dvd: value }))}
            />
            {pendingChanges.dvd && (
              <ToggleButton
                type="boolean"
                label="speed"
                value={pendingChanges.speed}
                onChange={(value) => setPendingChanges(prev => ({ ...prev, speed: value }))}
              />
            )}
          </ToggleButtonsGrid>
          <ApplyButton 
            ref={applyButtonRef}
            onClick={handleClose}
          >
            <span>Close</span>
          </ApplyButton>
        </>
      )}
    </NavContainer>
  );
}); 