"use client"

import { Suspense, lazy, useState, useEffect, useRef } from 'react'
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
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 auto;
  
  & canvas {
    overflow: visible !important;
    overflow-clip-margin: unset !important;
  }
`;

export default function LogoContainer({ className = '', style }: LogoContainerProps) {
  const { logo3DEnabled, noiseEnabled } = useThemeStore()
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    setIsLoading(false)

    return () => resizeObserver.disconnect()
  }, [])

  if (isLoading || !dimensions.width) {
    return (
      <CanvasOverride 
        ref={containerRef}
        className={`${className} overflow-visible`} 
        style={{
          position: 'relative',
          visibility: 'hidden',
          ...style
        }}
      >
        <Logo className="w-full h-full" style={style} />
      </CanvasOverride>
    )
  }

  return (
    <CanvasOverride 
      ref={containerRef}
      className={`${className} overflow-visible`} 
      style={{
        position: 'relative',
        visibility: 'visible',
        ...style
      }}
    >
      {logo3DEnabled ? (
        <Suspense fallback={<Logo className="w-full h-full" style={style} />}>
          <Logo3D 
            className="w-full h-full"
            style={style} 
            noiseEnabled={noiseEnabled}
          />
        </Suspense>
      ) : (
        <Logo className="w-full h-full" style={style} />
      )}
    </CanvasOverride>
  )
} 