import { colors } from "./colors";

export const themes = {
    slime: {
      "--color-page-content": colors.water.water900,
      "--noise-bg-image": "url('/public/images/slime_bg_noise.png')",
      "--noise-page-image": "url('/public/images/slime_page_noise.png')", /* Page content noise */
      "--color-bg": colors.earth.earth800, 
      "--color-text": colors.dune.dune50,
      "--color-text-secondary": colors.water.water900,
      "--color-accent-primary": colors.earth.earth100,
      "--color-accent-secondary": colors.water.water800,
      "--slime_shadow": "0px -16px 150px rgba(196, 223, 30, 0.4)",

    },
    water: {
        "--color-page-content": colors.water.water700,
        "--noise-bg-opacity": "0.2",
        "--color-bg": colors.water.water300, 
        "--noise-page-opacity": "0.1",
        "--color-text": colors.earth.earth50,
        "--color-text-secondary": colors.water.water700,
        "--color-accent-primary": colors.water.water300,
        "--color-accent-secondary": colors.water.water700,
        "--water_shadow": "0px -48.34934616088867px 453.2751159667969px rgba(230, 214, 251, 0.4)"
      },
      acid: {
        "--color-page-content": colors.earth.earth100,
        "--noise-bg-opacity": "0.2",
        "--color-bg": colors.water.water100, 
        "--noise-page-opacity": "0.1",
        "--color-text": colors.water.water900,
        "--color-text-secondary": colors.earth.earth50,
        "--color-accent-primary": colors.water.water700,
        "--color-accent-secondary": colors.earth.earth300,
        "--acid_shadow": "0px 4px 150px rgba(99, 33, 238, 0.4)"
      },    
      bunny: {
        "--color-page-content": colors.water.water50,
        "--noise-bg-opacity": "0.2",
        "--color-bg": colors.water.water500, 
        "--noise-page-opacity": "0.1",
        "--color-text": colors.earth.earth900,
        "--color-text-secondary": colors.water.water50,
        "--color-accent-primary": colors.water.water100,
        "--color-accent-secondary": colors.water.water300,
        "--bunny_shadow": "0px 4px 170px rgba(223, 30, 155, 0.4)"
      },
      dune: {
        "--color-page-content": colors.dune.dune300,
        "--noise-bg-opacity": "0.2",
        "--color-bg": colors.dune.dune500, 
        "--noise-page-opacity": "0.1",
        "--color-text": colors.earth.earth900,
        "--color-text-secondary": colors.dune.dune200,
        "--color-accent-primary": colors.dune.dune100,
        "--color-accent-secondary": colors.dune.dune200,
        "--dune_shadow": "0px 4px 170px rgba(8, 34, 163, 0.5)"
      }
  };
  