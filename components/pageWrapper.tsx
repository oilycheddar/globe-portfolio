import { useThemeStore } from "../hooks/useThemeStore";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface PageWrapperProps {
  children: React.ReactNode;
  noiseEnabled?: boolean;
}

export default function PageWrapper({ children, noiseEnabled = true }: PageWrapperProps) {
  const { theme } = useThemeStore();
  const innerShapeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (innerShapeRef.current) {
      const mediaQuery = window.matchMedia('(max-width: 440px)');
      const topValue = mediaQuery.matches ? 'max(16px, env(safe-area-inset-top))' : '16px';

      // Set the final position immediately with opacity 0
      gsap.set(innerShapeRef.current, { top: topValue, right: '16px', bottom: '16px', left: '16px', opacity: 0 });

      // Animate opacity from 0% to 100%
      gsap.to(innerShapeRef.current, { opacity: 1, duration: 1, delay: 0.5, ease: "power1.out" });

      // Listen for media query changes to update the top offset accordingly
      const updateTop = (e: MediaQueryListEvent | MediaQueryList) => {
        const newTop = e.matches ? 'max(16px, env(safe-area-inset-top))' : '16px';
        gsap.set(innerShapeRef.current, { top: newTop });
      };

      mediaQuery.addEventListener('change', updateTop);

      return () => mediaQuery.removeEventListener('change', updateTop);
    }
  }, []);

  return (
    <div className="fixed w-screen h-screen flex items-center justify-center bg-[var(--color-bg)] p-0">
      {/* Inner Shape (Lighter Page Content) */}
      <div ref={innerShapeRef} className="fixed bg-[var(--color-page-content)] rounded-[20px] overflow-hidden">
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

