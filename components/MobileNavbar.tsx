import { useState, forwardRef, useRef, useImperativeHandle, useEffect, useCallback, useMemo } from 'react';
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
  width: ${props => props.$isExpanded ? '100%' : '44px'};
  max-width: ${props => props.$isExpanded ? '100%' : '44px'};
  height: ${props => props.$isExpanded ? 'auto' : '32px'};
  max-height: ${props => props.$isExpanded ? '280px' : '32px'};
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
  transition: width 0.2s ease-out, max-width 0.2s ease-out, height 0.2s ease-out, max-height 0.2s ease-out;
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
`;

const ToggleButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
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
  ${textStyles.caption};
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
  font-family: var(--font-mono);
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
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
  initialNoiseState?: boolean;
}

export interface MobileNavbarRef {
  container: HTMLDivElement | null;
}

export const MobileNavbar = forwardRef<MobileNavbarRef, MobileNavbarProps>(({
  onGridToggle,
  onNoiseToggle,
  onDvdToggle,
  onSpeedToggle,
  onExpandedChange,
  className = '',
  initialNoiseState = true
}, ref) => {
  const { theme, setTheme } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  
  const [isDvdActive, setIsDvdActive] = useState(false);
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
        duration: 0.2,
        ease: "power2.out"
      }
    });

    if (isExpanded) {
      // Set initial state
      gsap.set([contentRef.current, applyButtonRef.current], {
        visibility: 'visible',
        opacity: 0,
        y: -10,
        scale: 0.98
      });

      // Expand animation
      tl.to(containerRef.current, {
        width: "100%",
        maxWidth: "100%",
        duration: 0.2
      })
      .to([contentRef.current, applyButtonRef.current], {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.2,
        stagger: 0.05
      }, "-=0.1");
    } else {
      // Collapse animation
      tl.to([contentRef.current, applyButtonRef.current], {
        opacity: 0,
        y: -10,
        scale: 0.98,
        duration: 0.15,
        stagger: 0.05
      })
      .to(containerRef.current, {
        width: "44px",
        maxWidth: "44px",
        duration: 0.2
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

  const handleDvdToggle = (value: boolean) => {
    setIsDvdActive(value);
    onDvdToggle(value);
  };

  const handleNoiseToggle = (value: boolean) => {
    setIsNoiseActive(value);
    onNoiseToggle(value);
  };

  return (
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
          onChange={setTheme}
        />
        <ToggleButton
          type="boolean"
          label="grid"
          value={false}
          onChange={onGridToggle}
        />
        <ToggleButton
          type="boolean"
          label="noise"
          value={isNoiseActive}
          onChange={handleNoiseToggle}
        />
        <ToggleButton
          type="boolean"
          label="dvd"
          value={isDvdActive}
          onChange={handleDvdToggle}
        />
        {isDvdActive && (
          <ToggleButton
            type="boolean"
            label="speed"
            value={false}
            onChange={onSpeedToggle}
          />
        )}
      </ToggleButtonsGrid>
      <ApplyButton 
        ref={applyButtonRef}
        onClick={handleClose}
      >
        Close
      </ApplyButton>
    </NavContainer>
  );
}); 