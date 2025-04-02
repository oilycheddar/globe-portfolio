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
    width: 100% !important;
    height: 100% !important;
  }
`;

export default function LogoContainer({ className = '', style }: LogoContainerProps) {
  const { logo3DEnabled, noiseEnabled } = useThemeStore()
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<null | { width: number, height: number }>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Set initial dimensions immediately
    const initialDimensions = {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight
    }
    console.log('[LogoContainer] Initial dimensions:', {
      timestamp: new Date().toISOString(),
      dimensions: initialDimensions,
      logo3DEnabled,
      containerWidth: containerRef.current.offsetWidth,
      containerHeight: containerRef.current.offsetHeight,
      computedStyle: window.getComputedStyle(containerRef.current)
    })
    setDimensions(initialDimensions)

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry && containerRef.current) {
        const newDimensions = {
          width: entry.contentRect.width,
          height: entry.contentRect.height
        }
        console.log('[LogoContainer] Resize dimensions:', {
          timestamp: new Date().toISOString(),
          dimensions: newDimensions,
          logo3DEnabled,
          containerWidth: containerRef.current.offsetWidth,
          containerHeight: containerRef.current.offsetHeight,
          computedStyle: window.getComputedStyle(containerRef.current)
        })
        setDimensions(newDimensions)
      }
    })

    resizeObserver.observe(containerRef.current)
    setIsLoading(false)

    return () => resizeObserver.disconnect()
  }, [logo3DEnabled])

  useEffect(() => {
    if (dimensions) {
      console.log('[LogoContainer] Dimensions updated:', {
        timestamp: new Date().toISOString(),
        dimensions,
        logo3DEnabled,
        isLoading
      })
    }
  }, [dimensions, logo3DEnabled, isLoading])

  // Don't render 3D logo until we have dimensions
  if (isLoading || !dimensions) {
    return (
      <CanvasOverride 
        ref={containerRef}
        className={`${className} overflow-visible`} 
        style={{
          position: 'relative',
          visibility: 'hidden',
          width: '100%',
          height: '100%',
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
        width: '100%',
        height: '100%',
        ...style
      }}
    >
      {logo3DEnabled ? (
        <Suspense fallback={<Logo className="w-full h-full" style={style} />}>
          <Logo3D 
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
              ...style
            }} 
            noiseEnabled={noiseEnabled}
          />
        </Suspense>
      ) : (
        <Logo className="w-full h-full" style={style} />
      )}
    </CanvasOverride>
  )
} 