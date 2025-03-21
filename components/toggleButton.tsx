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
  width: ${props => props.$isExpandable ? '72px' : 'auto'}; /* Only fixed width for expandable */

  *, *:before, *:after {
    box-sizing: border-box;
  }
`;

const Button = styled.div<{ $isActive?: boolean; $isMulti?: boolean; $isExpanded?: boolean; $isExpandable?: boolean }>`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: ${props => props.$isMulti || props.$isActive || props.$isExpanded || props.$isExpandable ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)'};
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  z-index: 2;
  white-space: nowrap;
  width: ${props => props.$isExpandable ? '100%' : 'auto'}; /* Only full width for expandable */
`;

const Value = styled.span<{ $isActive?: boolean; $isMulti?: boolean; $isExpanded?: boolean; $isExpandable?: boolean }>`
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${props => props.$isMulti || props.$isActive || props.$isExpanded || props.$isExpandable ? 'var(--color-text-secondary)' : 'var(--color-text)'};
  white-space: nowrap;
`;

const DropdownMenu = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: var(--color-accent-primary);
  border-radius: 20px;
  padding: 8px;
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

type BaseToggleProps = {
  label: string;
};

type BooleanToggleProps = BaseToggleProps & {
  type: 'boolean';
  value: boolean;
  onChange: (value: boolean) => void;
};

type MultiToggleProps<T extends string> = BaseToggleProps & {
  type: 'multi';
  value: T;
  options: T[];
  onChange: (value: T) => void;
};

type ExpandableToggleProps<T extends string> = BaseToggleProps & {
  type: 'expandable';
  value: T;
  options: T[];
  onChange: (value: T) => void;
  isNavigation?: boolean;
  paths?: Record<T, string>;
};

type ToggleButtonProps<T extends string> = BooleanToggleProps | MultiToggleProps<T> | ExpandableToggleProps<T>;

export function ToggleButton<T extends string>(props: ToggleButtonProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    } else {
      props.onChange(option as never);
    }
    setIsExpanded(false);
  };

  return (
    <Container ref={containerRef}>
      <Label>{props.label}</Label>
      <ButtonWrapper $isExpandable={props.type === 'expandable'}>
        <Button 
          onClick={handleClick}
          data-type={props.type}
          $isActive={props.type === 'boolean' && props.value}
          $isMulti={props.type === 'multi'}
          $isExpanded={props.type === 'expandable' && isExpanded}
          $isExpandable={props.type === 'expandable'}
        >
          <Value 
            $isActive={props.type === 'boolean' && props.value}
            $isMulti={props.type === 'multi'}
            $isExpanded={props.type === 'expandable' && isExpanded}
            $isExpandable={props.type === 'expandable'}
          >
            {props.type === 'boolean' ? (props.value ? 'ON' : 'OFF') : props.value}
          </Value>
        </Button>
        {props.type === 'expandable' && (
          <DropdownMenu ref={dropdownRef}>
            {props.options.filter(option => option !== props.value).map((option) => (
              <DropdownItem
                key={option}
                onClick={() => handleOptionClick(option)}
                $isSelected={option === props.value}
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
