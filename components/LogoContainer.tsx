"use client"

import { Suspense, lazy, useState, useEffect } from 'react'
import { useThemeStore } from '../hooks/useThemeStore'
import Logo from './Logo'
import styled from 'styled-components'

// Lazy load the 3D logo component
const Logo3D = lazy(() => import('./Logo3D'))

interface LogoContainerProps {
  className?: string;
  style?: React.CSSProperties;
}

const CanvasOverride = styled.div`
  & canvas {
    overflow: visible !important;
    overflow-clip-margin: unset !important;
  }
`;

export default function LogoContainer({ className = '', style }: LogoContainerProps) {
  const { logo3DEnabled, noiseEnabled } = useThemeStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide initial state until hydration is complete
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return null // Or a minimal placeholder
  }

  return (
    <CanvasOverride className={className} style={style}>
      {logo3DEnabled ? (
        <Suspense fallback={<Logo className={className} style={style} />}>
          <Logo3D 
            className={className} 
            style={style} 
            noiseEnabled={noiseEnabled}
          />
        </Suspense>
      ) : (
        <Logo className={className} style={style} />
      )}
    </CanvasOverride>
  )
} 