import { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { textStyles } from '../styles/text';
import { CaseStudy as CaseStudyType } from '../data/caseStudies';
import React from 'react';
import Image from 'next/image';

const CaseStudyWrapper = styled.div`
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --navbar-height: 64px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-xl);
  transition: filter 0.4s ease;
  width: 100%;
  height: fit-content;
  visibility: visible;
  
  @media (max-width: 440px) {
    --mobile-navbar-height: 24px;
    padding: var(--space-md) 0;
    gap: var(--space-md);
    width: auto;
  }
`;

interface ImageWrapperProps {
  $isClickable?: boolean;
}

const ImageWrapper = styled.div<ImageWrapperProps>`
  width: 100%;
  position: relative;
  aspect-ratio: auto;
  margin: 0;
  overflow: hidden;
  border-radius: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 70vh;
  cursor: ${props => props.$isClickable ? 'pointer' : 'default'} !important;
  
  @media (max-width: 440px) {
    margin: 0;
    max-height: none;
  }
`;

const PlayButton = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  z-index: 10;
  
  &:hover {
    transform: scale(1.1);
  }

  &::before {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 15px 0 15px 25px;
    border-color: transparent transparent transparent white;
    margin-left: 5px;
  }

  @media (max-width: 440px) {
    width: 60px;
    height: 60px;

    &::before {
      border-width: 12px 0 12px 20px;
      margin-left: 4px;
    }
  }
`;

const WorkSampleVideo = styled.video`
  max-height: 70vh;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  
  @media (max-width: 440px) {
    max-height: none;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

const VideoPosterImage = styled(Image)`
  max-height: 70vh;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  
  @media (max-width: 440px) {
    max-height: none;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

const WorkSampleImage = styled(Image)`
  max-height: 70vh;
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  
  @media (max-width: 440px) {
    max-height: none;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

const BentoGrid = styled.div`
  display: grid;
  gap: var(--space-sm);
  width: 100%;
  max-height: 70vh;
  height: fit-content;
  border-radius: 12px;
  overflow: hidden;
  
  /* 2 images: side by side */
  &[data-count="2"] {
    grid-template-columns: 1fr 1fr;
    aspect-ratio: 16/8;
  }
  
  /* 3 images: large left, 2 stacked right */
  &[data-count="3"] {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    aspect-ratio: 16/10;
  }
  
  /* 4 images: 2x2 grid */
  &[data-count="4"] {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    aspect-ratio: 16/10;
  }
  
  /* 5 images: 2 top, 3 bottom */
  &[data-count="5"] {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr 1fr;
    aspect-ratio: 16/9;
  }
  
  /* 6 images: 3x2 grid */
  &[data-count="6"] {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr 1fr;
    aspect-ratio: 16/9;
  }
  
  @media (max-width: 440px) {
    max-height: none;
    gap: var(--space-sm);
    
    /* Mobile: Full vertical stack for optimal UX */
    &[data-count="2"] {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      aspect-ratio: unset;
    }
    
    &[data-count="3"] {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      aspect-ratio: unset;
    }
    
    &[data-count="4"] {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
      aspect-ratio: unset;
    }
    
    &[data-count="5"], &[data-count="6"] {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(var(--count), auto);
      aspect-ratio: unset;
    }
  }
`;

interface BentoItemProps {
  $span?: string;
  $count: number;
  $index: number;
}

const BentoGridItem = styled.div<BentoItemProps>`
  position: relative;
  overflow: hidden;
  background: var(--color-bg-secondary, #f5f5f5);
  border-radius: 8px;
  
  /* 3 images layout: first image spans 2 rows */
  ${props => props.$count === 3 && props.$index === 0 && `
    grid-row: span 2;
  `}
  
  /* 5 images layout: first 2 span wider */
  ${props => props.$count === 5 && props.$index < 2 && `
    grid-column: span 1;
    grid-row: 1;
  `}
  
  ${props => props.$count === 5 && props.$index >= 2 && `
    grid-row: 2;
  `}
  
  @media (max-width: 440px) {
    border-radius: 6px;
    
    /* Mobile: Each item takes full width and auto height */
    grid-column: 1;
    grid-row: auto;
    aspect-ratio: 16/10; /* Consistent aspect ratio for better layout */
  }
  
  /* Video items get slightly more height for better visibility on mobile */
  &[data-is-video="true"] {
    @media (max-width: 440px) {
      aspect-ratio: 16/9;
    }
  }
`;

const BentoImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s cubic-bezier(.455, .03, .515, .955);
  
  &:hover {
    transform: scale(1.02);
  }
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: scale(1.02);
    }
  }
  
  @media not (hover: hover) {
    &:hover {
      transform: none;
    }
  }
`;

const BentoVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s cubic-bezier(.455, .03, .515, .955);
  cursor: pointer;
  
  &:hover {
    transform: scale(1.02);
  }
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: scale(1.02);
    }
  }
  
  @media not (hover: hover) {
    &:hover {
      transform: none;
    }
  }
`;

const BentoPlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  pointer-events: none;
  
  &::before {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 12px 0 12px 20px;
    border-color: transparent transparent transparent white;
    margin-left: 4px;
  }

  @media (max-width: 440px) {
    width: 56px;
    height: 56px;

    &::before {
      border-width: 11px 0 11px 18px;
      margin-left: 3px;
    }
  }
`;

const LightboxOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, ${props => props.$isOpen ? 0.9 : 0});
  backdrop-filter: blur(${props => props.$isOpen ? '8px' : '0px'});
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.25s cubic-bezier(.215, .61, .355, 1);
  
  @media (max-width: 440px) {
    padding: 0;
  }
`;

const LightboxContent = styled.div<{ $isOpen: boolean }>`
  position: relative;
  width: 90vw;
  height: 80vh;
  max-width: min(1200px, 90vw);
  max-height: min(800px, 80vh);
  transform: ${props => props.$isOpen 
    ? 'scale(1) translateY(0)' 
    : 'scale(0.95) translateY(8px)'
  };
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: all 0.25s cubic-bezier(.215, .61, .355, 1);
  transition-delay: ${props => props.$isOpen ? '0.02s' : '0s'};
  
  @media (max-width: 768px) {
    width: 95vw;
    height: 85vh;
    max-width: min(95vw, calc(100vw - 32px)); /* Ensure content doesn't exceed viewport */
    max-height: min(85vh, calc(100vh - 32px)); /* Account for any UI elements */
    transform: ${props => props.$isOpen 
      ? 'scale(1) translateY(0)' 
      : 'scale(0.96) translateY(6px)'
    };
  }
  
  @media (max-width: 440px) {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    transform: ${props => props.$isOpen 
      ? 'scale(1) translateY(0)' 
      : 'scale(0.98) translateY(4px)'
    };
  }
`;

const LightboxMedia = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: visible; /* Allow content to breathe */
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: pan-x; /* Allow horizontal swipe gestures */
  
  img, video {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: center;
    display: block;
    transition: all 0.2s cubic-bezier(.215, .61, .355, 1);
  }
  
  /* Ensure images scale properly on narrow viewports */
  @media (max-width: 768px) {
    img, video {
      max-width: calc(100vw - 32px); /* Account for container padding */
    }
  }
  
  @media (max-width: 440px) {
    border-radius: 0;
    background: rgba(0, 0, 0, 0.05);
    
    /* Add padding to avoid content being too close to edges */
    padding: var(--space-lg) var(--space-md);
    box-sizing: border-box;
    
    img, video {
      max-width: calc(100vw - var(--space-md) * 2); /* Account for mobile padding */
      max-height: calc(100vh - var(--space-lg) * 2); /* Account for mobile padding */
    }
  }
`;

const LightboxClose = styled.button`
  position: absolute;
  top: -48px;
  right: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s cubic-bezier(.215, .61, .355, 1);
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
    transition-duration: 0.1s;
  }
  
  @media (max-width: 440px) {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 20px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    
    &:active {
      transform: scale(0.9);
      background: rgba(0, 0, 0, 0.8);
    }
  }
`;

const LightboxNavButton = styled.button<{ $direction: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  ${props => props.$direction === 'prev' ? 'left: -60px;' : 'right: -60px;'}
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s cubic-bezier(.215, .61, .355, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.9);
    transition-duration: 0.1s;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    
    &:hover {
      transform: translateY(-50%) scale(1);
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  @media (max-width: 768px) {
    ${props => props.$direction === 'prev' ? 'left: -50px;' : 'right: -50px;'}
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  @media (max-width: 440px) {
    display: none; /* Hide navigation buttons on mobile - use swipe instead */
  }
`;

const WorkSampleTitle = styled.h2`
  margin: 0;
  text-align: left;
  white-space: nowrap;
  width: fit-content;
  
  @media (max-width: 440px) {
    width: fit-content;
  }
`;

const WorkTitleLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: inherit;
  font: inherit;
  
  &:hover {
    opacity: 0.8;
  }

  img, svg {
    width: 16px;
    height: 16px;
    color: var(--color-text);
  }

  ${WorkSampleTitle} {
    text-decoration: underline;
  }
`;

interface WorkSampleDescriptionProps {
  $hideTeam?: boolean;
}

interface WorkSampleCopyContainerProps {
  $hideTeam?: boolean;
}

const WorkSampleDescription = styled.p<WorkSampleDescriptionProps>`
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
  overflow: visible;
  width: 100%;
  max-width: 650px;
  
  @media (max-width: 1000px) {
    width: 100%;
    max-width: none;
  }
`;

const WorkSampleCopyContainer = styled.div<WorkSampleCopyContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  width: ${props => props.$hideTeam ? '100%' : 'fit-content'};
  overflow: visible;
  
  ${WorkSampleTitle}, ${WorkSampleDescription} {
    text-align: left;
  }
  
  @media (max-width: 440px) {
    width: 100%;
    gap: var(--space-sm);
  }
`;

const WorkSampleTeamContainer = styled(WorkSampleCopyContainer)`
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;
  gap: var(--space-lg);
  width: fit-content;

  @media (max-width: 440px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: var(--space-md);
    width: 100%;
  }
`;

const CollaboratorRole = styled(WorkSampleTitle)`
  white-space: pre-line;
  text-align: left;
`;

const CollaboratorNames = styled(WorkSampleDescription)`
  white-space: pre-line;
  width: 100%;
  text-align: left;
  
  @media (max-width: 440px) {
    width: 100%;
    flex: 1;
  }
`;

const HorizontalRule = styled.hr`
  display: none;
  width: 100%;
  height: 1px;
  background-color: var(--color-accent-secondary);
  border: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const WorkSampleText = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  overflow: visible;
  gap: var(--space-xl);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-xl);
    align-items: stretch;
  }
  
  @media (max-width: 440px) {
    gap: var(--space-md);
  }
`;

interface CaseStudyProps {
  data: CaseStudyType;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  autoplay?: boolean;
}

export const CaseStudy = React.forwardRef<HTMLDivElement, CaseStudyProps>(({ data, className, style, onClick, autoplay = false }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bentoVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(autoplay);
  const [bentoVideosPlaying, setBentoVideosPlaying] = useState<boolean[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (autoplay && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Autoplay failed:', error);
      });
    }
  }, [autoplay]);

  const isLoopingVideo = data.videoUrl.includes('loom');
  const isClickableVideo = data.videoUrl !== 'none' && (!isLoopingVideo || data.posterUrl !== 'none');

  const handleVideoClick = () => {
    if (!isClickableVideo) return;
    
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${data.posterUrl}`);
    setImageLoaded(true); // Still show the broken image rather than nothing
  };

  // Initialize bento video playing state
  useEffect(() => {
    if (data.useBentoLayout && data.images) {
      setBentoVideosPlaying(new Array(data.images.length).fill(false));
    }
  }, [data.useBentoLayout, data.images]);

  const handleBentoVideoClick = (index: number) => {
    const video = bentoVideoRefs.current[index];
    if (!video) return;

    const newBentoVideosPlaying = [...bentoVideosPlaying];
    
    if (newBentoVideosPlaying[index]) {
      video.pause();
      newBentoVideosPlaying[index] = false;
    } else {
      video.play();
      newBentoVideosPlaying[index] = true;
    }
    
    setBentoVideosPlaying(newBentoVideosPlaying);
  };

  // Lightbox functionality
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = ''; // Restore body scroll
    // Pause lightbox video if playing
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.pause();
    }
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!data.images) return;
    
    const totalItems = data.images.length;
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else {
      setLightboxIndex((prev) => (prev + 1) % totalItems);
    }
    
    // Pause current video when navigating
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.pause();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateLightbox('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''; // Restore body scroll on unmount
    };
  }, []);

  // Swipe functionality for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && data.images) {
      navigateLightbox('next');
    }
    if (isRightSwipe && data.images) {
      navigateLightbox('prev');
    }
  };

  return (
    <CaseStudyWrapper 
      ref={ref} 
      className={className} 
      style={style}
      onClick={onClick}
    >
      <ImageWrapper 
        className="work-sample-image-wrapper"
        onClick={handleVideoClick}
        $isClickable={isClickableVideo}
      >
        {!isVideoPlaying && isClickableVideo && <PlayButton />}
        {data.useBentoLayout && data.images && data.images.length > 0 ? (
          <BentoGrid data-count={data.images.length}>
            {data.images.map((mediaSrc, index) => {
              const isVideo = mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.webm') || mediaSrc.endsWith('.mov');
              
              return (
                <BentoGridItem 
                  key={`${data.id}-bento-${index}`}
                  $count={data.images!.length}
                  $index={index}
                  data-is-video={isVideo}
                  onClick={isVideo ? () => handleBentoVideoClick(index) : () => openLightbox(index)}
                  onDoubleClick={isVideo ? () => openLightbox(index) : undefined}
                  style={{ cursor: 'pointer' }}
                >
                  {isVideo ? (
                    <>
                      {!bentoVideosPlaying[index] && <BentoPlayButton />}
                      <BentoVideo
                        ref={(el) => { bentoVideoRefs.current[index] = el; }}
                        src={mediaSrc}
                        poster={mediaSrc.includes('treasury_demo') ? '/Treasury_demo_poster.png' : undefined}
                        muted
                        loop
                        playsInline
                        onEnded={() => {
                          const newBentoVideosPlaying = [...bentoVideosPlaying];
                          newBentoVideosPlaying[index] = false;
                          setBentoVideosPlaying(newBentoVideosPlaying);
                        }}
                      />
                    </>
                  ) : (
                    <BentoImage
                      src={mediaSrc}
                      alt={`${data.title} - Image ${index + 1}`}
                      fill
                      quality={95}
                      sizes="(max-width: 440px) 90vw, (max-width: 768px) 60vw, 50vw"
                    />
                  )}
                </BentoGridItem>
              );
            })}
          </BentoGrid>
        ) : data.videoUrl !== 'none' ? (
          <>
            {data.posterUrl !== 'none' && (
              <VideoPosterImage
                src={data.posterUrl}
                alt={data.title}
                width={1920}
                height={1080}
                priority
                quality={100}
                style={{ display: isVideoPlaying ? 'none' : 'block' }}
              />
            )}
            <WorkSampleVideo
              ref={videoRef}
              className="work-sample-video"
              src={data.videoUrl}
              muted
              playsInline
              autoPlay={autoplay}
              loop={data.videoUrl.includes('loom')}
              onEnded={handleVideoEnded}
              style={{ display: (isVideoPlaying || data.posterUrl === 'none') ? 'block' : 'none' }}
            />
          </>
        ) : (
          <WorkSampleImage
            src={data.posterUrl}
            alt={data.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
            width={1920}
            height={1080}
            priority
            quality={100}
          />
        )}
      </ImageWrapper>
      <WorkSampleText>
        <WorkSampleCopyContainer $hideTeam={data.hideTeam}>
          <WorkTitleLink 
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WorkSampleTitle className={`${textStyles.caption} text-[var(--color-text)]`}>
              {data.title}
            </WorkSampleTitle>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.66699 4.04175C4.32181 4.04175 4.04199 4.32157 4.04199 4.66675C4.04199 5.01193 4.32181 5.29175 4.66699 5.29175H9.82478L4.22505 10.8915C3.98097 11.1356 3.98097 11.5313 4.22505 11.7754C4.46913 12.0194 4.86486 12.0194 5.10893 11.7754L10.7087 6.17563V11.3334C10.7087 11.6786 10.9885 11.9584 11.3337 11.9584C11.6788 11.9584 11.9587 11.6786 11.9587 11.3334V4.66675C11.9587 4.32157 11.6788 4.04175 11.3337 4.04175H4.66699Z" />
            </svg>
          </WorkTitleLink>
          <WorkSampleDescription 
            className={`${textStyles.caption} text-[var(--color-text)]`}
            $hideTeam={data.hideTeam}
          >
            {data.description}
          </WorkSampleDescription>
        </WorkSampleCopyContainer>
        {!data.hideTeam && (
          <>
            <HorizontalRule />
            <WorkSampleTeamContainer>
              <CollaboratorRole className={`${textStyles.caption} text-[var(--color-text)]`}>
                {data.team.map(member => member.role).join('\n')}
              </CollaboratorRole>
              <CollaboratorNames className={`${textStyles.caption} text-[var(--color-text)]`}>
                {data.team.map(member => member.names.join(', ')).join('\n')}
              </CollaboratorNames>
            </WorkSampleTeamContainer>
          </>
        )}
      </WorkSampleText>

      {/* Lightbox */}
      {data.useBentoLayout && data.images && data.images.length > 0 && (
        <LightboxOverlay 
          $isOpen={lightboxOpen}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLightbox();
            }
          }}
        >
          <LightboxContent $isOpen={lightboxOpen}>
            <LightboxClose onClick={closeLightbox}>
              ×
            </LightboxClose>
            
            {data.images.length > 1 && (
              <>
                <LightboxNavButton 
                  $direction="prev" 
                  onClick={() => navigateLightbox('prev')}
                  disabled={data.images.length <= 1}
                >
                  ←
                </LightboxNavButton>
                <LightboxNavButton 
                  $direction="next" 
                  onClick={() => navigateLightbox('next')}
                  disabled={data.images.length <= 1}
                >
                  →
                </LightboxNavButton>
              </>
            )}
            
            <LightboxMedia
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {(() => {
                const currentMedia = data.images[lightboxIndex];
                const isVideo = currentMedia.endsWith('.mp4') || currentMedia.endsWith('.webm') || currentMedia.endsWith('.mov');
                
                if (isVideo) {
                  return (
                    <video
                      ref={lightboxVideoRef}
                      src={currentMedia}
                      controls
                      muted
                      playsInline
                    />
                  );
                } else {
                  return (
                    <Image
                      src={currentMedia}
                      alt={`${data.title} - Image ${lightboxIndex + 1}`}
                      width={1920}
                      height={1080}
                      quality={95}
                      style={{ 
                        objectFit: 'contain',
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                    />
                  );
                }
              })()}
            </LightboxMedia>
          </LightboxContent>
        </LightboxOverlay>
      )}
    </CaseStudyWrapper>
  );
}); 