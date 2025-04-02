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
  cursor: pointer;
  visibility: visible;
  
  @media (max-width: 440px) {
    --mobile-navbar-height: 24px;
    padding: var(--space-md) 0;
    gap: var(--space-md);
    width: auto;
  }
`;

const ImageWrapper = styled.div`
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(autoplay);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (autoplay && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Autoplay failed:', error);
      });
    }
  }, [autoplay]);

  const isLoopingVideo = data.videoUrl.includes('loom');
  const isClickableVideo = data.videoUrl !== 'none' && !isLoopingVideo;

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
        {data.videoUrl !== 'none' ? (
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
              style={{ display: isVideoPlaying ? 'block' : 'none' }}
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
    </CaseStudyWrapper>
  );
}); 