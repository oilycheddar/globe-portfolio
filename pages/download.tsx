'use client';

import { useEffect } from 'react';
import { useThemeStore } from "../hooks/useThemeStore";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import Head from 'next/head';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

const ContentWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: 0 var(--space-xl);
`;

const ManualLink = styled.a`
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: underline;
  text-underline-offset: 3px;
  color: var(--color-text);
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.7;
  }
`;

export default function Download() {
  const { noiseEnabled } = useThemeStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/HyperPaste.zip';
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Download HyperPaste</title>
        <meta name="robots" content="noindex" />
      </Head>
      <PageWrapper noiseEnabled={noiseEnabled}>
        <ContentWrapper>
          <StyledContent className={jetbrainsMono.className}>
            <p className={`${textStyles.caption} text-[var(--color-text)]`}>
              YOUR DOWNLOAD SHOULD START AUTOMATICALLY.
            </p>
            <ManualLink href="/HyperPaste.zip" download>
              CLICK HERE IF IT DOESN&apos;T
            </ManualLink>
          </StyledContent>
        </ContentWrapper>
      </PageWrapper>
    </>
  );
}
