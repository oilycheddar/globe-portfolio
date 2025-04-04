import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '../utils/gsap';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const Label = styled.span`
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
`;

const ButtonWrapper = styled.div<{ $isExpandable?: boolean }>`
  position: relative;
  width: ${props => props.$isExpandable ? '80px' : 'auto'}; /* Only fixed width for expandable */

  *, *:before, *:after {
    box-sizing: border-box;
  }
`;

const Button = styled.button.attrs<{
  href?: string;
}>(props => ({
  as: props.href ? 'a' : 'button',
  target: props.href ? '_blank' : undefined,
  rel: props.href ? 'noopener noreferrer' : undefined,
}))<{ 
  $isActive?: boolean; 
  $isMulti?: boolean; 
  $isExpanded?: boolean; 
  $isExpandable?: boolean;
  'data-type'?: string;
  href?: string;
}>`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: ${props => 
    props.$isMulti || 
    props.$isActive || 
    props.$isExpanded || 
    props.$isExpandable || 
    props['data-type'] === 'strava'
    ? 'var(--color-accent-primary)' 
    : 'var(--color-accent-secondary)'};
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  z-index: 2;
  white-space: nowrap;
  width: ${props => props.$isExpandable ? '100%' : 'auto'}; /* Only full width for expandable */
  border: none;
  outline: none;
  text-decoration: none;
  color: inherit;
  
  &:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }
`;

const Value = styled.span<{ 
  $isActive?: boolean; 
  $isMulti?: boolean; 
  $isExpanded?: boolean; 
  $isExpandable?: boolean;
  'data-type'?: string;
}>`
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${props => 
    props.$isMulti || 
    props.$isActive || 
    props.$isExpanded || 
    props.$isExpandable || 
    props['data-type'] === 'strava'
    ? 'var(--color-text-secondary)' 
    : 'var(--color-text)'};
  white-space: nowrap;
`;

const DropdownMenu = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: var(--color-accent-primary);
  border-radius: 20px;
  padding: 8px 12px;
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  width: 100%;
`;

const DropdownItem = styled.div<{ $isSelected?: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${props => props.$isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)'};
  background-color: ${props => props.$isSelected ? 'var(--color-accent-secondary)' : 'transparent'};
  transition: background-color 0.2s ease, color 0.2s ease;
  text-align: center;
  white-space: nowrap;

  &:hover {
    background-color: var(--color-accent-secondary);
    color: var(--color-text);
  }
`;

interface BaseToggleProps {
  label: string;
  fullWidth?: boolean;
  href?: string;
}

interface BooleanToggleProps extends BaseToggleProps {
  type: 'boolean';
  value: boolean;
  onChange: (value: boolean) => void;
}

interface MultiToggleProps<T extends string> extends BaseToggleProps {
  type: 'multi';
  value: T;
  options: T[];
  onChange: (value: T) => void;
}

interface ExpandableToggleProps<T extends string> extends BaseToggleProps {
  type: 'expandable';
  value: T;
  options: T[];
  onChange: (value: T) => void;
  isNavigation?: boolean;
  paths?: Record<string, T>;
  autoplay?: boolean;
}

interface StravaToggleProps extends BaseToggleProps {
  type: 'strava';
  value: string;
  fallbackValue?: string;
  onChange?: (value: string) => void;
  $isActive?: boolean;
}

type ToggleButtonProps<T extends string> = 
  | BooleanToggleProps 
  | MultiToggleProps<T> 
  | ExpandableToggleProps<T>
  | StravaToggleProps;

export function ToggleButton<T extends string>(props: ToggleButtonProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (props.type === 'expandable' && dropdownRef.current) {
      if (isExpanded) {
        gsap.to(dropdownRef.current, {
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'auto',
          duration: 0.2,
          ease: 'power2.out'
        });
      } else {
        gsap.to(dropdownRef.current, {
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          duration: 0.2,
          ease: 'power2.in'
        });
      }
    }
  }, [isExpanded, props.type]);

  const handleClick = () => {
    if (props.type === 'boolean') {
      props.onChange(!props.value);
    } else if (props.type === 'multi') {
      const currentIndex = props.options.indexOf(props.value);
      const nextIndex = (currentIndex + 1) % props.options.length;
      props.onChange(props.options[nextIndex]);
    } else if (props.type === 'expandable') {
      setIsExpanded(!isExpanded);
    }
  };

  const handleOptionClick = (option: T) => {
    if (props.type === 'expandable' && props.isNavigation && props.paths) {
      const path = props.paths[option];
      if (path) {
        router.push(path);
      }
    } else if (props.type === 'strava' && props.onChange) {
      props.onChange(option as string);
    } else if (props.type !== 'strava') {
      props.onChange(option as never);
    }
    setIsExpanded(false);
  };

  const renderValue = () => {
    switch (props.type) {
      case 'boolean':
        return props.value ? 'ON' : 'OFF';
      case 'strava':
        return props.value || props.fallbackValue || '0km';
      default:
        return props.value;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Escape' && isExpanded) {
      e.preventDefault();
      setIsExpanded(false);
    }
  };

  return (
    <Container 
      ref={containerRef}
      style={props.fullWidth ? { gridColumn: '1 / -1', justifySelf: 'center' } : undefined}
    >
      <Label>{props.label}</Label>
      <ButtonWrapper $isExpandable={props.type === 'expandable'}>
        <Button 
          ref={buttonRef}
          data-type={props.type}
          $isActive={props.type === 'boolean' && props.value}
          $isMulti={props.type === 'multi'}
          $isExpanded={props.type === 'expandable' && isExpanded}
          $isExpandable={props.type === 'expandable'}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-expanded={isExpanded}
          aria-haspopup={props.type === 'expandable' ? 'true' : undefined}
          href={props.href}
        >
          <Value 
            $isActive={props.type === 'boolean' && props.value}
            $isMulti={props.type === 'multi'}
            $isExpanded={props.type === 'expandable' && isExpanded}
            $isExpandable={props.type === 'expandable'}
            data-type={props.type}
          >
            {renderValue()}
          </Value>
        </Button>
        {props.type === 'expandable' && (
          <DropdownMenu ref={dropdownRef}>
            {props.options.filter(option => option !== props.value).map((option) => (
              <DropdownItem
                key={option}
                onClick={() => handleOptionClick(option)}
                $isSelected={option === props.value}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOptionClick(option);
                  }
                }}
              >
                {option}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </ButtonWrapper>
    </Container>
  );
}
