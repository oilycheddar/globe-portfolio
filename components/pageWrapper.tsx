import { useThemeStore } from "../hooks/useThemeStore";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const { theme } = useThemeStore();
  const innerShapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerShapeRef.current) {
      gsap.fromTo(innerShapeRef.current, 
        {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        {
          top: 24,
          right: 24,
          bottom: 24,
          left: 24,
          duration: 1.2,
          delay: 0.75,
          ease: "expo.out"
        }
      );
    }
  }, []);

  return (
    <div className="fixed w-screen h-screen flex items-center justify-center bg-[var(--color-bg)] p-0">      
      {/* Outer Shape (Darker Background) */}
      <div className="fixed w-screen h-screen flex items-center justify-center noise-overlay overflow-hidden">
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
        <div className="absolute w-full h-full noise-page-overlay pointer-events-none overflow-hidden rounded-[8px]">
          {/* Page Content Noise */}
        </div>
        <div className="relative z-20">
          {children}
        </div>
      </div>
    </div>
  );
}

