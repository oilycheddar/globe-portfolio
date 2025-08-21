import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TooltipContainer = styled.div<{ $isVisible: boolean; $x: number; $y: number }>`
  position: fixed;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  z-index: 9999;
  pointer-events: none;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.15s cubic-bezier(.215, .61, .355, 1);
  transform: translate(12px, -32px); /* Offset from cursor */

  /* Hide tooltip on mobile/touch devices */
  @media (max-width: 440px) {
    display: none;
  }
  
  /* Hide tooltip on touch devices */
  @media (hover: none) {
    display: none;
  }
`;

const TooltipButton = styled.div`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: var(--color-accent-primary);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  border: none;
  outline: none;
`;

const TooltipValue = styled.span`
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

interface CursorTooltipProps {
  text: string;
  isVisible: boolean;
}

export const CursorTooltip: React.FC<CursorTooltipProps> = ({ text, isVisible }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    if (isVisible) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible]);

  return (
    <TooltipContainer $isVisible={isVisible} $x={position.x} $y={position.y}>
      <TooltipButton>
        <TooltipValue>{text}</TooltipValue>
      </TooltipButton>
    </TooltipContainer>
  );
};