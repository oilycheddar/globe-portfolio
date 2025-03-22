import { useRef, useState } from 'react';
import styled from 'styled-components';
import { textStyles } from '../styles/text';
import { CaseStudy as CaseStudyType } from '../data/caseStudies';
import React from 'react';

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
  margin: 0 calc(-1 * var(--space-lg));
  overflow: hidden;
  border-radius: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 70vh;
  
  @media (max-width: 440px) {
    margin: 0 calc(-1 * var(--space-md));
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

const WorkSampleImage = styled.img`
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

  img {
    width: 16px;
    height: 16px;
  }

  ${WorkSampleTitle} {
    text-decoration: underline;
  }
`;

const WorkSampleDescription = styled.p`
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
  overflow: visible;
  width: 650px;
  max-width: 650px;
  
  @media (max-width: 440px) {
    width: 100%;
    max-width: none;
  }
`;

const WorkSampleCopyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  width: fit-content;
  overflow: visible;
  
  ${WorkSampleTitle}, ${WorkSampleDescription} {
    text-align: left;
  }
  
  @media (max-width: 440px) {
    width: 100%;
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
  width: fit-content;
  text-align: left;
  
  @media (max-width: 440px) {
    min-width: unset;
    width: auto;
    flex: 1;
  }
`;

const WorkSampleText = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  overflow: visible;
  gap: var(--space-xl);
  
  @media (max-width: 768px) {
    gap: var(--space-sm);
  }
  
  @media (max-width: 440px) {
    flex-direction: column;
    gap: var(--space-xl);
    align-items: stretch;
  }
`;

interface CaseStudyProps {
  data: CaseStudyType;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const CaseStudy = React.forwardRef<HTMLDivElement, CaseStudyProps>(({ data, className, style, onClick }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoClick = () => {
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
        style={{ cursor: data.videoUrl !== 'none' ? 'pointer' : 'default' }}
      >
        {!isVideoPlaying && data.videoUrl !== 'none' && <PlayButton />}
        {data.videoUrl !== 'none' ? (
          <WorkSampleVideo
            ref={videoRef}
            className="work-sample-video"
            src={data.videoUrl}
            poster={data.posterUrl}
            muted
            playsInline
            onEnded={handleVideoEnded}
          />
        ) : (
          <WorkSampleImage
            src={data.posterUrl}
            alt={data.title}
          />
        )}
      </ImageWrapper>
      <WorkSampleText>
        <WorkSampleCopyContainer>
          <WorkTitleLink 
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WorkSampleTitle className={`${textStyles.caption} text-[var(--color-text)]`}>
              {data.title}
            </WorkSampleTitle>
            <img src="/link-external.svg" alt="External link" />
          </WorkTitleLink>
          <WorkSampleDescription className={`${textStyles.caption} text-[var(--color-text)]`}>
            {data.description}
          </WorkSampleDescription>
        </WorkSampleCopyContainer>
        {!data.hideTeam && (
          <WorkSampleTeamContainer>
            <CollaboratorRole className={`${textStyles.caption} text-[var(--color-text)]`}>
              {data.team.map(member => member.role).join('\n')}
            </CollaboratorRole>
            <CollaboratorNames className={`${textStyles.caption} text-[var(--color-text)]`}>
              {data.team.map(member => member.names.join(', ')).join('\n')}
            </CollaboratorNames>
          </WorkSampleTeamContainer>
        )}
      </WorkSampleText>
    </CaseStudyWrapper>
  );
}); 