'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { textStyles } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrambleTextPlugin } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";
import { MobileNavbar } from "../components/MobileNavbar";
import type { MobileNavbarRef } from "../components/MobileNavbar";
import Image from 'next/image';
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
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --navbar-height: 64px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  overflow-y: auto;
  transition: filter 0.4s ease;
  padding: 0 var(--space-xl);
  opacity: 0;

  @media (max-width: 440px) {
    --mobile-navbar-height: 32px;
    padding: var(--space-xl) var(--space-md);
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--space-lg);
    justify-content: center;
    min-height: 0;
    overflow-y: auto;
  }
`;

const VideoWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
`;

const DemoVideo = styled.video`
  width: 100%;
  height: auto;
  display: block;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`;

const AppIcon = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  max-width: 360px;
  text-align: center;
`;

const BuyButton = styled.a`
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-text-secondary);
  background: var(--color-accent-primary);
  border-radius: 6px;
  padding: 12px 28px;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;

const Kbd = styled.span`
  display: inline;
  background: var(--color-accent-secondary);
  border-radius: 3px;
  padding: 1px 5px;
`;

export default function HyperPaste() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const navbarRef = useRef<NavbarRef>(null);
  const mobileNavbarRef = useRef<MobileNavbarRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    setTheme(themeKeys[(currentIndex + 1) % themeKeys.length]);
  };

  const initializeGSAPAnimations = () => {
    gsap.registerPlugin(ScrambleTextPlugin);

    const ctx = gsap.context(() => {
      const navbar = navbarRef.current;
      if (navbar?.container) {
        gsap.set(navbar.container, {
          opacity: 1,
          y: 0,
          visibility: 'visible'
        });

        const allNavElements = [
          navbar.themeTop,
          navbar.grid,
          navbar.noise,
          navbar.themeBottom,
        ];

        allNavElements.forEach(element => {
          if (element) {
            gsap.set(element, {
              opacity: 0,
              y: -10,
              filter: 'blur(20px)'
            });
          }
        });
      }

      gsap.set(contentRef.current, {
        opacity: 1,
        visibility: 'visible'
      });

      const tl = gsap.timeline({
        delay: 1.2,
        defaults: { ease: "sine.out" }
      });

      tl.fromTo(".demo-video", {
        scale: 0.92,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      });

      tl.fromTo(".title-row", {
        opacity: 0,
        filter: "blur(12px)",
      }, {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.4,
      }, "-=0.2");

      tl.fromTo(".fade-in", {
        opacity: 0,
        filter: "blur(12px)",
      }, {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.4,
        stagger: 0.08,
      }, "-=0.1");

      if (navbar) {
        const allNavElements = [
          navbar.themeTop,
          navbar.grid,
          navbar.noise,
          navbar.themeBottom,
        ];

        tl.to(allNavElements, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: "cubic-bezier(.455, .03, .515, .955)",
          clearProps: "all"
        }, "+=0.45");
      }
    }, contentRef);

    return ctx;
  };

  useEffect(() => {
    const ctx = initializeGSAPAnimations();
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 440);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGridToggle = () => {};
  const handleNoiseToggle = (value: boolean) => setNoiseEnabled(value);
  const handleNavExpandedChange = (value: boolean) => setIsNavExpanded(value);

  return (
    <>
      <Head>
        <title>HyperPaste — Paste links onto text, everywhere</title>
        <meta name="description" content="Copy a URL, select text, Cmd+V. The text becomes a clickable hyperlink. Works in Gmail, Notes, Docs, and everywhere else." />
        <meta key="og:title" property="og:title" content="HyperPaste — Turn any text into a hyperlink with Cmd+V" />
        <meta key="og:description" property="og:description" content="Copy a URL, select text, Cmd+V. The text becomes a clickable hyperlink. Works in Gmail, Notes, Google Docs, and everywhere else." />
        <meta key="og:image" property="og:image" content="https://www.georgevisan.com/hyperpaste-og.png" />
        <meta key="og:image:width" property="og:image:width" content="2644" />
        <meta key="og:image:height" property="og:image:height" content="1650" />
        <meta key="og:image:type" property="og:image:type" content="image/png" />
        <meta key="og:image:alt" property="og:image:alt" content="HyperPaste — Turn any text into a hyperlink with Cmd+V" />
        <meta key="og:url" property="og:url" content="https://www.georgevisan.com/hyperpaste" />
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content="HyperPaste — Turn any text into a hyperlink with Cmd+V" />
        <meta key="twitter:description" name="twitter:description" content="Copy a URL, select text, Cmd+V. The text becomes a clickable hyperlink. Works in Gmail, Notes, Google Docs, and everywhere else." />
        <meta key="twitter:image" name="twitter:image" content="https://www.georgevisan.com/hyperpaste-og.png" />
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
          />
          <StyledContent
            ref={contentRef}
            className={jetbrainsMono.className}
            style={isMobile && isNavExpanded ? { filter: 'blur(8px)' } : undefined}
          >
            <VideoWrapper className="demo-video">
              <DemoVideo src="/hyperPaste.mp4" autoPlay muted loop playsInline />
            </VideoWrapper>

            <TitleRow className="title-row">
              <IconWrapper>
                <AppIcon
                  src="/hyperpaste-icon.png"
                  alt="HyperPaste"
                  width={240}
                  height={240}
                  quality={100}
                  priority
                />
              </IconWrapper>
              <p className={`${textStyles.caption} text-[var(--color-text)]`}>
                HYPERPASTE
              </p>
            </TitleRow>

            <TextBlock>
              <p className={`${textStyles.caption} text-[var(--color-text)] fade-in`} style={{ opacity: 0.6 }}>
                ADD A LINK TO ANY TEXT JUST LIKE IN SLACK.
              </p>
              <p className={`${textStyles.caption} text-[var(--color-text)] fade-in`} style={{ opacity: 0.6 }}>
                WORKS IN GMAIL, APPLE NOTES, GOOGLE DOCS, NOTION, OUTLOOK, AND EVERYWHERE RICH TEXT LIVES. ONE-TIME PURCHASE. MACOS.
              </p>
            </TextBlock>

            <div className="fade-in">
              <BuyButton href="https://buy.stripe.com/14A14mdlU02A3xle2h43S01">
                Buy for $10
              </BuyButton>
            </div>
          </StyledContent>
        </ContentWrapper>
      </PageWrapper>
    </>
  );
}
