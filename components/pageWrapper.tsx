import { useVisualStore } from "../hooks/useVisualStore";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const innerShapeRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isNoiseEnabled } = useVisualStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (innerShapeRef.current && wrapperRef.current) {
        const mediaQuery = window.matchMedia('(max-width: 440px)');
        
        // Initial animation timeline
        const tl = gsap.timeline();
        
        // Fade in the background
        tl.to(wrapperRef.current, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        });

        // Animate the inner shape
        const updateInset = (e: MediaQueryListEvent | MediaQueryList) => {
          tl.to(innerShapeRef.current, {
            opacity: 1,
            top: e.matches ? 'max(16px, env(safe-area-inset-top))' : '16px',
            right: '16px',
            bottom: '16px',
            left: '16px',
            duration: 1.2,
            ease: "expo.out"
          });
        };

        updateInset(mediaQuery);
        mediaQuery.addEventListener('change', updateInset);
        return () => mediaQuery.removeEventListener('change', updateInset);
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={wrapperRef} 
      className="fixed w-screen h-screen flex items-center justify-center bg-[var(--color-bg)] p-0 opacity-0"
    >      
      {/* Outer Shape (Darker Background) */}
      <div className="fixed w-screen h-screen flex items-center justify-center overflow-hidden" />
      
      {/* Inner Shape (Lighter Page Content) */}
      <div 
        ref={innerShapeRef}
        className="fixed bg-[var(--color-page-content)] rounded-[20px] overflow-hidden opacity-0"
        style={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        {isNoiseEnabled && (
          <div 
            className="absolute w-full h-full pointer-events-none overflow-hidden rounded-[8px]"
            style={{
              backgroundImage: 'var(--page-noise)',
              backgroundSize: 'cover',
              opacity: 1,
            }}
          />
        )}
        <div className="relative w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

