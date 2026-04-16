'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";
import { MobileNavbar } from "../components/MobileNavbar";
import type { MobileNavbarRef } from "../components/MobileNavbar";
import Head from 'next/head';
import Link from 'next/link';

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

  .mobile-navbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 31;
  }

  @media (max-width: 440px) {
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const StyledContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: 0 var(--space-xl);

  @media (max-width: 440px) {
    padding: 0 var(--space-md);
  }
`;

const BottomLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  min-height: 64px;
  flex-shrink: 0;
`;

const GoHomeLink = styled.a`
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
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
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const navbarRef = useRef<NavbarRef>(null);
  const mobileNavbarRef = useRef<MobileNavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid'>('verifying');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 440);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    setTheme(themeKeys[(currentIndex + 1) % themeKeys.length]);
  };

  const handleGridToggle = () => {};
  const handleNoiseToggle = (value: boolean) => setNoiseEnabled(value);
  const handleNavExpandedChange = (value: boolean) => setIsNavExpanded(value);

  return (
    <>
      <Head>
        <title>Download HyperPaste</title>
        <meta name="robots" content="noindex" />
      </Head>
      <PageWrapper noiseEnabled={noiseEnabled}>
        <ContentWrapper>
          {isMobile ? (
            <MobileNavbar
              ref={mobileNavbarRef}
              className="mobile-navbar"
              onGridToggle={handleGridToggle}
              onNoiseToggle={handleNoiseToggle}
              onExpandedChange={handleNavExpandedChange}
              initialNoiseState={noiseEnabled}
              hideInactiveToggles={false}
              showDvdToggle={false}
              show3DToggle={false}
            />
          ) : null}
          <Navbar
            ref={navbarRef}
            onGridToggle={handleGridToggle}
            onNoiseToggle={handleNoiseToggle}
            onThemeChange={cycleTheme}
            initialNoiseState={noiseEnabled}
            hideInactiveToggles={false}
            showDvdToggle={false}
            show3DToggle={false}
            hideSideNavs={true}
            hideBottomNav={true}
          />
          <StyledContent
            className={jetbrainsMono.className}
            style={isMobile && isNavExpanded ? { filter: 'blur(8px)' } : undefined}
          >
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
          <BottomLinkContainer className={jetbrainsMono.className}>
            <Link href="/" passHref legacyBehavior>
              <GoHomeLink>Go Home</GoHomeLink>
            </Link>
          </BottomLinkContainer>
        </ContentWrapper>
      </PageWrapper>
    </>
  );
}
