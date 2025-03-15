import { ToggleButton } from './toggleButton';
import styled from 'styled-components';
import { useThemeStore } from '../hooks/useThemeStore';
import { themes } from '../styles/themes';
import { useState } from 'react';

const NavContainer = styled.nav`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-page-content);
`;

const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

interface NavbarProps {
  onGridToggle: (value: boolean) => void;
  onNoiseToggle: (value: boolean) => void;
  onDvdToggle: (value: boolean) => void;
  onSpeedToggle: (value: boolean) => void;
}

export function Navbar({ 
  onGridToggle, 
  onNoiseToggle, 
  onDvdToggle, 
  onSpeedToggle 
}: NavbarProps) {
  const { theme, setTheme } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const [isDvdActive, setIsDvdActive] = useState(false);

  const handleDvdToggle = (value: boolean) => {
    setIsDvdActive(value);
    onDvdToggle(value);
  };

  return (
    <NavContainer>
      <ToggleGroup>
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
          value={false}
          onChange={onNoiseToggle}
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
      </ToggleGroup>
    </NavContainer>
  );
} 