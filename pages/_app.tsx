import type { AppProps } from 'next/app';
import { StyledComponentsProvider } from '../providers/StyledComponentsProvider';
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StyledComponentsProvider>
      <Component {...pageProps} />
    </StyledComponentsProvider>
  );
}
