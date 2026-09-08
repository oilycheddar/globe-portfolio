import { colors } from "./colors";

// Define spacing scale
export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '40px',
  xxl: '80px'
} as const;

export const themes = {
    slime: {
      "--color-page-content": colors.water.water900,
      "--color-bg": colors.earth.earth800, 
      "--color-text": colors.dune.dune50,
      "--color-text-secondary": colors.water.water900,
      "--color-accent-primary": colors.earth.earth100,
      "--color-accent-secondary": colors.water.water800,
      "--slime_shadow": "0px -8px 100px rgba(196, 223, 30, 0.5)",
      // Spacing variables
      "--space-xs": spacing.xs,
      "--space-sm": spacing.sm,
      "--space-md": spacing.md,
      "--space-lg": spacing.lg,
      "--space-xl": spacing.xl,
    },
    water: {
        "--color-page-content": colors.water.water700,
        "--color-bg": colors.dune.dune100, 
        "--color-text": colors.earth.earth50,
        "--color-text-secondary": colors.water.water700,
        "--color-accent-primary": colors.water.water300,
        "--color-accent-secondary": colors.water.water500,
        "--water_shadow": "0px -8px 100px rgba(230, 214, 251, 0.5)",
        // Spacing variables
        "--space-xs": spacing.xs,
        "--space-sm": spacing.sm,
        "--space-md": spacing.md,
        "--space-lg": spacing.lg,
        "--space-xl": spacing.xl,
    },
    acid: {
        "--color-page-content": colors.earth.earth100,
        "--color-bg": colors.water.water100, 
        "--color-text": colors.water.water900,
        "--color-text-secondary": colors.earth.earth50,
        "--color-accent-primary": colors.water.water700,
        "--color-accent-secondary": colors.earth.earth300,
        "--acid_shadow": "0px -8px 100px rgba(99, 33, 238, 0.5)",
        // Spacing variables
        "--space-xs": spacing.xs,
        "--space-sm": spacing.sm,
        "--space-md": spacing.md,
        "--space-lg": spacing.lg,
        "--space-xl": spacing.xl,
    },    
    bunny: {
        "--color-page-content": colors.water.water50,
        "--color-bg": colors.water.water500, 
        "--color-text": colors.earth.earth900,
        "--color-text-secondary": colors.water.water50,
        "--color-accent-primary": colors.water.water100,
        "--color-accent-secondary": colors.water.water300,
        "--bunny_shadow": "0px -8px 100px rgba(223, 30, 155, 0.5)",
        // Spacing variables
        "--space-xs": spacing.xs,
        "--space-sm": spacing.sm,
        "--space-md": spacing.md,
        "--space-lg": spacing.lg,
        "--space-xl": spacing.xl,
    },
    dune: {
        "--color-page-content": colors.dune.dune300,
        "--color-bg": colors.dune.dune500, 
        "--color-text": colors.earth.earth900,
        "--color-text-secondary": colors.dune.dune200,
        "--color-accent-primary": colors.dune.dune100,
        "--color-accent-secondary": colors.dune.dune200,
        "--dune_shadow": "0px -8px 100px rgba(8, 34, 163, 0.5)",
        // Spacing variables
        "--space-xs": spacing.xs,
        "--space-sm": spacing.sm,
        "--space-md": spacing.md,
        "--space-lg": spacing.lg,
        "--space-xl": spacing.xl,
    }
};
  