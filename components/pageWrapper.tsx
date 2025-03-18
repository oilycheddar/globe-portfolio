import { useThemeStore } from "../hooks/useThemeStore";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PageWrapperProps {
  children: React.ReactNode;
  noiseEnabled?: boolean;
}

export default function PageWrapper({ children, noiseEnabled = true }: PageWrapperProps) {
  const { theme } = useThemeStore();
  const innerShapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerShapeRef.current) {
      const mediaQuery = window.matchMedia('(max-width: 440px)');
      
      const updateInset = (e: MediaQueryListEvent | MediaQueryList) => {
        gsap.fromTo(innerShapeRef.current, 
          {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
          {
            top: e.matches ? 'max(16px, env(safe-area-inset-top))' : '16px',
            right: e.matches ? '16px' : '16px',
            bottom: e.matches ? '16px' : '16px',
            left: e.matches ? '16px' : '16px',
            duration: 1.2,
            delay: 0.75,
            ease: "expo.out"
          }
        );
      };

      // Initial check
      updateInset(mediaQuery);

      // Add listener for changes
      mediaQuery.addEventListener('change', updateInset);

      // Cleanup
      return () => mediaQuery.removeEventListener('change', updateInset);
    }
  }, []);

  return (
    <div className="fixed w-screen h-screen flex items-center justify-center bg-[var(--color-bg)] p-0">      
      {/* Outer Shape (Darker Background) */}
      <div className="fixed w-screen h-screen flex items-center justify-center overflow-hidden">
        {/* Static BG Noise */}
      </div>
      
      {/* Animated Noise Layer */}
      <div className="noise-animated-layer">
        <div className="noise-animated"></div>
      </div>

      {/* Inner Shape (Lighter Page Content) */}
      <div 
        ref={innerShapeRef}
        className="fixed bg-[var(--color-page-content)] rounded-[20px] overflow-hidden"
      >
        {noiseEnabled && (
          <div className="absolute w-full h-full noise-page-overlay pointer-events-none overflow-hidden rounded-[8px]">
            {/* Page Content Noise */}
          </div>
        )}
        <div className="relative z-20">
          {children}
        </div>
      </div>
    </div>
  );
}

