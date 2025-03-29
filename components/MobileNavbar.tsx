import { useState, forwardRef, useRef, useImperativeHandle, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { textStyles } from '../styles/text';
import { ToggleButton } from './toggleButton';
import { useThemeStore } from '../hooks/useThemeStore';
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
  width: 44px;
  max-width: 44px;
  height: 32px;
  max-height: 32px;
  background-color: var(--color-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 31;
  border-radius: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
  transform-origin: top center;
  `;

const Overlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 30;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
`;

const IconWrapper = styled.div`
  padding: 0;
  cursor: pointer;
  position: relative;
  z-index: 2;
  width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-primary);
`;

const ToggleButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 12px;
  width: 100%;
  justify-items: center;
  align-items: center;
  position: relative;
  z-index: 2;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
`;

const ApplyButton = styled.button`
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  margin: 8px 0 12px;
  cursor: pointer;
  position: relative;
  z-index: 2;
  background: none;
  border: none;
  padding: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
`;

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.75 12C6.75 9.1005 9.10051 6.75 12 6.75C13.4497 6.75 14.7622 7.33762 15.7123 8.28767L8.28767 15.7123C7.33762 14.7622 6.75 13.4497 6.75 12ZM12 5.25C8.27208 5.25 5.25 8.27208 5.25 12C5.25 15.7279 8.27208 18.75 12 18.75C15.7279 18.75 18.75 15.7279 18.75 12C18.75 8.27208 15.7279 5.25 12 5.25Z" fill="currentColor"/>
  </svg>
);

interface MobileNavbarProps {
  onGridToggle: (value: boolean) => void;
  onNoiseToggle: (value: boolean) => void;
  onDvdToggle?: (value: boolean) => void;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
  initialNoiseState?: boolean;
  hideInactiveToggles?: boolean;
  showDvdToggle?: boolean;
  show3DToggle?: boolean;
}

export interface MobileNavbarRef {
  container: HTMLDivElement | null;
}

export const MobileNavbar = forwardRef<MobileNavbarRef, MobileNavbarProps>(({
  onGridToggle,
  onNoiseToggle,
  onDvdToggle = () => {},
  onExpandedChange,
  className = '',
  initialNoiseState = true,
  hideInactiveToggles = false,
  showDvdToggle = false,
  show3DToggle = false
}, ref) => {
  const { theme, setTheme, logo3DEnabled, setLogo3DEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  
  const [isNoiseActive, setIsNoiseActive] = useState(initialNoiseState);

  useImperativeHandle(ref, () => ({
    container: containerRef.current
  }));

  const handleToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  }, [isExpanded, onExpandedChange]);

  // Memoize animation timeline creation
  const createTimeline = useCallback(() => {
    if (!containerRef.current || !contentRef.current || !applyButtonRef.current) return null;

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.3,
        ease: "power2.inOut"
      }
    });

    if (isExpanded) {
      // Set initial states
      gsap.set(containerRef.current, {
        width: "44px",
        maxWidth: "44px",
        height: "32px",
        maxHeight: "32px",
        scale: 1,
        borderRadius: "0 0 8px 8px"
      });
      
      gsap.set([contentRef.current, applyButtonRef.current], {
        visibility: 'visible',
        opacity: 0,
        y: -10,
        scale: 0.95
      });

      // Expand animation
      tl.to(containerRef.current, {
        height: "auto",
        maxHeight: "280px",
        duration: 0.2,
        ease: "back.out(1.2)"
      })
      .to(containerRef.current, {
        scale: 1,
        width: "100%",
        maxWidth: "100%",
        borderRadius: "0 0 20px 20px",
        duration: 0.3,
        ease: "back.out(1.2)"
      }, "-=0.1")
      .to([contentRef.current, applyButtonRef.current], {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.2,
        stagger: 0.05,
        ease: "back.out(1.2)"
      }, "-=0.15");
    } else {
      // Collapse animation
      tl.to([contentRef.current, applyButtonRef.current], {
        opacity: 0,
        y: -10,
        scale: 1,
        duration: 0.15,
        stagger: 0.03,
        ease: "power2.in"
      })
      .to(containerRef.current, {
        height: "32px",
        maxHeight: "32px",
        duration: 0.2,
        ease: "back.out(1.2)"
      }, "-=0.15")
      .to(containerRef.current, {
        width: "44px",
        maxWidth: "44px",
        scale: 1,
        borderRadius: "0 0 8px 8px",
        duration: 0.3,
        ease: "back.out(1.2)"
      }, "-=0.1")

      .set([contentRef.current, applyButtonRef.current], {
        visibility: 'hidden'
      });
    }

    return tl;
  }, [isExpanded]);

  // Run animation effect
  useEffect(() => {
    const tl = createTimeline();
    if (tl) {
      tl.play();
      return () => {
        tl.kill();
      };
    }
  }, [createTimeline]);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    onExpandedChange?.(false);
  }, [onExpandedChange]);

  const handleNoiseToggle = (value: boolean) => {
    setIsNoiseActive(value);
    onNoiseToggle(value);
  };

  const handleDvdToggle = (value: boolean) => {
    onDvdToggle(value);
    handleClose();
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, handleClickOutside]);

  return (
    <>
      <Overlay $isVisible={isExpanded} />
      <NavContainer 
        ref={containerRef}
        $isExpanded={isExpanded}
        className={className}
      >
        <IconWrapper onClick={handleToggle}>
          <MenuIcon />
        </IconWrapper>
        
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
            label="noise"
            value={isNoiseActive}
            onChange={handleNoiseToggle}
          />
          {!hideInactiveToggles && (
            <>
              {show3DToggle && (
                <ToggleButton
                  type="boolean"
                  label="3D"
                  value={logo3DEnabled}
                  onChange={setLogo3DEnabled}
                />
              )}
              {showDvdToggle && (
                <ToggleButton
                  type="boolean"
                  label="dvd"
                  value={false}
                  onChange={handleDvdToggle}
                />
              )}
            </>
          )}
        </ToggleButtonsGrid>
        <ApplyButton 
          ref={applyButtonRef}
          onClick={handleClose}
        >
          CLOSE
        </ApplyButton>
      </NavContainer>
    </>
  );
}); 