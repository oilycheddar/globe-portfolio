import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="absolute w-full h-full noise-overlay pointer-events-none mix-blend-overlay"></div> {/* Background Noise */}
      
      {/* Outer Shape (Darker Background) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[calc(100vw-48px)] h-[calc(100vh-48px)] bg-[var(--color-bg)] rounded-2xl shadow-lg"></div>
      </div>

      {/* Inner Shape (Lighter Page Content) */}
      <div className="relative w-[calc(100vw-40px)] h-[calc(100vh-40px)] bg-[var(--color-page-content)] rounded-[12px] p-0">
        <div className="absolute w-full h-full noise-page-overlay pointer-events-none mix-blend-overlay"></div> {/* Page Content Noise */}
        {children}
      </div>
    </div>
  );
}
