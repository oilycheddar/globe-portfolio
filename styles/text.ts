export const typography = {
  caption: {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    lineHeight: '15.8px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase'
  }
} as const;

// Tailwind class strings for convenience
export const textStyles = {
  caption: "text-[12px] font-[var(--font-mono)] font-bold leading-[15.8px] tracking-[0.1em] uppercase",
};