'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid'>('verifying');

  useEffect(() => {
    const sessionId = router.query.session_id as string | undefined;
    if (!sessionId) {
      if (router.isReady) setStatus('invalid');
      return;
    }

    fetch(`/api/verify-purchase?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setStatus('valid');
          setTimeout(() => {
            window.location.href = '/HyperPaste.zip';
          }, 500);
        } else {
          setStatus('invalid');
        }
      })
      .catch(() => setStatus('invalid'));
  }, [router.isReady, router.query.session_id]);

  return (
    <>
      <Head>
        <title>Download HyperPaste</title>
        <meta name="robots" content="noindex" />
      </Head>
      <PageWrapper noiseEnabled={noiseEnabled}>
        <ContentWrapper>
          <StyledContent className={jetbrainsMono.className}>
            {status === 'verifying' && (
              <p className={`${textStyles.caption} text-[var(--color-text)]`}>
                VERIFYING PURCHASE...
              </p>
            )}
            {status === 'valid' && (
              <>
                <p className={`${textStyles.caption} text-[var(--color-text)]`}>
                  YOUR DOWNLOAD SHOULD START AUTOMATICALLY.
                </p>
                <ManualLink href="/HyperPaste.zip" download>
                  CLICK HERE IF IT DOESN&apos;T
                </ManualLink>
              </>
            )}
            {status === 'invalid' && (
              <>
                <p className={`${textStyles.caption} text-[var(--color-text)]`}>
                  PURCHASE NOT FOUND.
                </p>
                <ManualLink href="/hyperpaste">
                  BUY HYPERPASTE
                </ManualLink>
              </>
            )}
          </StyledContent>
        </ContentWrapper>
      </PageWrapper>
    </>
  );
}
