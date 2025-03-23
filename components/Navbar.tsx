import { ToggleButton } from './toggleButton';
import styled from 'styled-components';
import { useThemeStore } from '../hooks/useThemeStore';
import { themes } from '../styles/themes';
import { useState, forwardRef, useRef, useImperativeHandle } from 'react';
import { textStyles } from '../styles/text';
import { useRouter } from 'next/router';

const NavContainer = styled.nav.attrs<{ className?: string }>(props => ({
  className: props.className || ''
}))`
  width: 100%;
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  z-index: 10;
  flex-shrink: 0;

  @media (max-width: 440px) {
    display: none; /* Hide the top nav on mobile */
  }
`;

const LeftNavContainer = styled(NavContainer)`
  position: absolute;
  left: 32px;
  top: 50%;
  height: 64px;
  width: 100%;
  transform: translateY(-50%) translateX(-50%) rotate(-90deg);
  transform-origin: center;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 20;

  @media (max-width: 440px) {
    display: none; /* Hide the left nav on mobile */
  }
`;

const RightNavContainer = styled(NavContainer)`
  position: absolute;
  right: 32px;
  top: 50%;
  height: 64px;
  width: 100%;
  transform: translateY(-50%) translateX(50%) rotate(90deg);
  transform-origin: center;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 20;

  @media (max-width: 440px) {
    display: none; /* Hide the right nav on mobile */
  }
`;

const BottomNavContainer = styled(NavContainer)`
  order: 3;
  display: flex;

  @media (max-width: 440px) {
    display: flex; /* Ensure bottom nav is visible on mobile */
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const StyledLink = styled.a`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
    color: inherit;
  }
`;

interface NavbarProps {
  onGridToggle: (value: boolean) => void;
  onNoiseToggle: (value: boolean) => void;
  onDvdToggle: (value: boolean) => void;
  onSpeedToggle: (value: boolean) => void;
  onThemeChange?: () => void;
  className?: string;
  initialNoiseState?: boolean;
  hideSideNavs?: boolean;
  hideInactiveToggles?: boolean;
}

export interface NavbarRef {
  container: HTMLDivElement | null;
  themeTop: HTMLDivElement | null;
  themeLeft: HTMLDivElement | null;
  themeRight: HTMLDivElement | null;
  themeBottom: HTMLDivElement | null;
  grid: HTMLDivElement | null;
  noise: HTMLDivElement | null;
  dvd: HTMLDivElement | null;
  speed: HTMLDivElement | null;
}

export const Navbar = forwardRef<NavbarRef, NavbarProps>(({ 
  onGridToggle, 
  onNoiseToggle, 
  onDvdToggle, 
  onSpeedToggle,
  onThemeChange,
  className = '',
  initialNoiseState = true,
  hideSideNavs = false,
  hideInactiveToggles = false
}, ref) => {
  const { theme, setTheme } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const [isDvdActive, setIsDvdActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Create refs for each toggle button container
  const toggleRefs = {
    themeTop: useRef<HTMLDivElement>(null),
    themeLeft: useRef<HTMLDivElement>(null),
    themeRight: useRef<HTMLDivElement>(null),
    themeBottom: useRef<HTMLDivElement>(null),
    grid: useRef<HTMLDivElement>(null),
    noise: useRef<HTMLDivElement>(null),
    dvd: useRef<HTMLDivElement>(null),
    speed: useRef<HTMLDivElement>(null)
  };

  // Get current page value based on route
  const getCurrentPageValue = () => {
    const path = router.pathname;
    switch (path) {
      case '/':
        return 'HOME';
      case '/about':
        return 'ABOUT';
      case '/work':
        return 'WORK';
      case '/photos':
        return 'PHOTOS';
      default:
        return 'HOME';
    }
  };

  // Navigation paths mapping
  const navigationPaths = {
    'HOME': '/',
    'WORK': '/work',
    'ABOUT': '/about',
    'PHOTOS': '/photos'
  };

  // Expose toggle refs to parent component
  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    themeTop: toggleRefs.themeTop.current,
    themeLeft: toggleRefs.themeLeft.current,
    themeRight: toggleRefs.themeRight.current,
    themeBottom: toggleRefs.themeBottom.current,
    grid: toggleRefs.grid.current,
    noise: toggleRefs.noise.current,
    dvd: toggleRefs.dvd.current,
    speed: toggleRefs.speed.current
  }));

  const handleDvdToggle = (value: boolean) => {
    setIsDvdActive(value);
    onDvdToggle(value);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    onThemeChange?.();
  };

  return (
    <>
      <NavContainer ref={containerRef} className={className}>
        <ToggleGroup>
          <div ref={toggleRefs.themeTop}>
            <ToggleButton
              type="multi"
              label="theme"
              value={theme}
              options={themeKeys}
              onChange={handleThemeChange}
            />
          </div>
          {!hideInactiveToggles && (
            <div ref={toggleRefs.grid}>
              <ToggleButton
                type="boolean"
                label="grid"
                value={false}
                onChange={onGridToggle}
              />
            </div>
          )}
          <div ref={toggleRefs.noise}>
            <ToggleButton
              type="boolean"
              label="noise"
              value={initialNoiseState}
              onChange={onNoiseToggle}
            />
          </div>
          {!hideInactiveToggles && (
            <div ref={toggleRefs.dvd}>
              <ToggleButton
                type="boolean"
                label="dvd"
                value={isDvdActive}
                onChange={handleDvdToggle}
              />
            </div>
          )}
          {isDvdActive && !hideInactiveToggles && (
            <div ref={toggleRefs.speed}>
              <ToggleButton
                type="boolean"
                label="speed"
                value={false}
                onChange={onSpeedToggle}
              />
            </div>
          )}
        </ToggleGroup>
      </NavContainer>
      {!hideSideNavs && (
        <>
          <LeftNavContainer>
            <ToggleGroup>
              <StyledLink href="https://www.strava.com/athletes/42678770" target="_blank" rel="noopener noreferrer">
                <div ref={toggleRefs.themeLeft}>
                  <ToggleButton
                    type="multi"
                    label="2025 running distance"
                    value="349km"
                    options={["349km"]}
                    onChange={() => {}}
                  />
                </div>
              </StyledLink>
            </ToggleGroup>
          </LeftNavContainer>
          <RightNavContainer>
            <ToggleGroup>
              <StyledLink href="https://www.ramp.com" target="_blank" rel="noopener noreferrer">
                <div ref={toggleRefs.themeRight}>
                  <ToggleButton
                    type="multi"
                    label="employer"
                    value="Ramp"
                    options={["Ramp"]}
                    onChange={() => {}}
                  />
                </div>
              </StyledLink>
            </ToggleGroup>
          </RightNavContainer>
        </>
      )}
      <BottomNavContainer>
        <ToggleGroup>
          <div ref={toggleRefs.themeBottom}>
            <ToggleButton
              type="expandable"
              label="STATION"
              value={getCurrentPageValue()}
              options={["HOME", "WORK", "ABOUT", "PHOTOS"]}
              onChange={() => {}}
              isNavigation
              paths={navigationPaths}
            />
          </div>
        </ToggleGroup>
      </BottomNavContainer>
    </>
  );
}); 