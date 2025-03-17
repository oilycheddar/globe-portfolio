import styled from 'styled-components';
import { ReactNode } from 'react';

const NavContainer = styled.div`
  --nav-height: 64px;
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
`;

const BaseNav = styled.nav`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const TopNav = styled(BaseNav)`
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
`;

const BottomNav = styled(BaseNav)`
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
`;

const LeftNav = styled(BaseNav)`
  top: var(--nav-height);
  bottom: var(--nav-height);
  left: 0;
  width: var(--nav-height);
  transform-origin: center center;

  /* Container for rotated content */
  > div {
    transform: rotate(-90deg);
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const RightNav = styled(BaseNav)`
  top: var(--nav-height);
  bottom: var(--nav-height);
  right: 0;
  width: var(--nav-height);
  transform-origin: center center;

  /* Container for rotated content */
  > div {
    transform: rotate(90deg);
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

interface NavigationBarsProps {
  top?: ReactNode;
  right?: ReactNode;
  bottom?: ReactNode;
  left?: ReactNode;
  className?: string;
}

export function NavigationBars({ 
  top, 
  right, 
  bottom, 
  left,
  className = '' 
}: NavigationBarsProps) {
  return (
    <NavContainer className={className}>
      {top && <TopNav className="nav-top">{top}</TopNav>}
      {right && <RightNav className="nav-right"><div>{right}</div></RightNav>}
      {bottom && <BottomNav className="nav-bottom">{bottom}</BottomNav>}
      {left && <LeftNav className="nav-left"><div>{left}</div></LeftNav>}
    </NavContainer>
  );
} 