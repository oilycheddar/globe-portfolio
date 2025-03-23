import { themes } from './themes';

// Default theme values to prevent flash of unstyled content
export const defaultTheme = themes.slime;

// Create a style element with default theme values
export const createDefaultThemeStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --color-page-content: ${defaultTheme['--color-page-content']};
      --color-bg: ${defaultTheme['--color-bg']};
      --color-text: ${defaultTheme['--color-text']};
      --bg-noise: ${defaultTheme['--bg-noise']};
      --page-noise: ${defaultTheme['--page-noise']};
      --logo-noise: ${defaultTheme['--logo-noise']};
    }
  `;
  return style;
}; 