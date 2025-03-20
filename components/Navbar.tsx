import { ToggleButton } from './toggleButton';
import styled from 'styled-components';
import { useThemeStore } from '../hooks/useThemeStore';
import { themes } from '../styles/themes';
import { useState, forwardRef, useRef, useImperativeHandle } from 'react';
import { textStyles } from '../styles/text';

const NavContainer = styled.nav.attrs<{ className?: string }>(props => ({
  className: props.className || ''
}))`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  position: relative;
  z-index: 10;
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
`;

const BottomNavContainer = styled(NavContainer)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
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
}

export interface NavbarRef {
  container: HTMLDivElement | null;
  theme: HTMLDivElement | null;
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
  initialNoiseState = true
}, ref) => {
  const { theme, setTheme } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const [isDvdActive, setIsDvdActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create refs for each toggle button container
  const toggleRefs = {
    theme: useRef<HTMLDivElement>(null),
    grid: useRef<HTMLDivElement>(null),
    noise: useRef<HTMLDivElement>(null),
    dvd: useRef<HTMLDivElement>(null),
    speed: useRef<HTMLDivElement>(null)
  };

  // Expose toggle refs to parent component
  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    theme: toggleRefs.theme.current,
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
          <div ref={toggleRefs.theme}>
            <ToggleButton
              type="multi"
              label="theme"
              value={theme}
              options={themeKeys}
              onChange={handleThemeChange}
            />
          </div>
          <div ref={toggleRefs.grid}>
            <ToggleButton
              type="boolean"
              label="grid"
              value={false}
              onChange={onGridToggle}
            />
          </div>
          <div ref={toggleRefs.noise}>
            <ToggleButton
              type="boolean"
              label="noise"
              value={initialNoiseState}
              onChange={onNoiseToggle}
            />
          </div>
          <div ref={toggleRefs.dvd}>
            <ToggleButton
              type="boolean"
              label="dvd"
              value={isDvdActive}
              onChange={handleDvdToggle}
            />
          </div>
          {isDvdActive && (
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
      <LeftNavContainer>
        <ToggleGroup>
          <StyledLink href="https://www.strava.com/athletes/42678770" target="_blank" rel="noopener noreferrer">
            <div ref={toggleRefs.theme}>
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
            <div ref={toggleRefs.theme}>
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
      <BottomNavContainer>
        <ToggleGroup>
          <div ref={toggleRefs.theme}>
            <ToggleButton
              type="expandable"
              label="STATION"
              value="HOME"
              options={["HOME", "Work", "About"]}
              onChange={() => {}}
            />
          </div>
        </ToggleGroup>
      </BottomNavContainer>
    </>
  );
}); 