import type { AppProps } from 'next/app';
import { StyledComponentsProvider } from '../providers/StyledComponentsProvider';
import ThemePreloader from '../components/ThemePreloader';
import { ThemeColorManager } from '../components/ThemeColorManager';
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StyledComponentsProvider>
      <ThemePreloader />
      <ThemeColorManager />
      <Component {...pageProps} />
    </StyledComponentsProvider>
  );
}
