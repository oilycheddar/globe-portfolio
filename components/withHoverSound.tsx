import React from 'react';
import { useHoverSound } from '../hooks/useHoverSound';

export const withHoverSound = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P) => {
    const { playSound } = useHoverSound();

    return (
      <WrappedComponent
        {...props}
        onMouseEnter={playSound}
        className={`hover-sound ${props.className || ''}`}
      />
    );
  };
}; 