'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import PageWrapper from "../components/pageWrapper";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "../utils/gsap";
import { JetBrains_Mono } from 'next/font/google';
import styled from 'styled-components';
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";
import { MobileNavbar } from "../components/MobileNavbar";
import type { MobileNavbarRef } from "../components/MobileNavbar";

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

// Types
interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  average_cadence?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  has_heartrate: boolean;
}

interface ZoneBucket {
  min: number;
  max: number;
  time: number;
}

interface ActivityZone {
  distribution_buckets: ZoneBucket[];
  type: string;
  sensor_based: boolean;
  custom_zones: boolean;
}

interface DateRange {
  id: string;
  label: string;
  getRange: () => { after: number; before: number };
}

// Styled Components
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
  gap: var(--space-md);
  overflow-y: auto;
  transition: filter 0.4s ease;
  padding: var(--space-xl) var(--space-xl);
  opacity: 0;
  
  @media (max-width: 440px) {
    --mobile-navbar-height: 32px;
    padding: var(--space-xl) var(--space-md);
    padding-top: 80px;
    gap: var(--space-md);
    min-height: 0;
    overflow-y: auto;
  }
`;

const DataContainer = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  
  @media (max-width: 440px) {
    max-width: none;
  }
`;

const DateSelectorWrapper = styled.div`
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding-bottom: var(--space-xs);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const DateButton = styled.button<{ $isActive: boolean }>`
  padding: var(--space-xs) var(--space-md);
  border: 1px solid ${props => props.$isActive ? 'var(--color-text)' : 'var(--color-text)'};
  background: ${props => props.$isActive ? 'var(--color-text)' : 'transparent'};
  color: ${props => props.$isActive ? 'var(--color-page-content)' : 'var(--color-text)'};
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 200ms ease;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: ${props => props.$isActive ? 1 : 0.6};
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 1;
      border-color: var(--color-text);
      background: var(--color-text);
      color: var(--color-page-content);
    }
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

const SectionTitle = styled.h2`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  margin: 0;
  opacity: 0.6;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
`;

const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
`;

const StatValue = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
`;

const ThresholdSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-accent-primary);
  border-radius: 8px;
`;

const ThresholdValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-page-content);
`;

const ThresholdLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-page-content);
  opacity: 0.8;
`;

const ZoneRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
`;

const ZoneLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  width: 24px;
  flex-shrink: 0;
`;

const ZoneBarContainer = styled.div`
  flex: 1;
  height: 16px;
  background: var(--color-text);
  border-radius: 4px;
  overflow: hidden;
  opacity: 0.15;
`;

const ZoneBar = styled.div<{ $width: number; $zone: number }>`
  height: 100%;
  background: var(--color-accent-primary);
  width: ${props => props.$width}%;
  border-radius: 4px;
  transition: width 0.3s cubic-bezier(.215, .61, .355, 1);
`;

const ZoneTime = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  width: 80px;
  text-align: right;
  flex-shrink: 0;
`;

const ZonePercent = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.6;
  width: 40px;
  text-align: right;
  flex-shrink: 0;
`;

const ActivityCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: transparent;
  border: 1px solid var(--color-text);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 200ms ease;
  opacity: 0.6;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 1;
      border-color: var(--color-text);
      background: var(--color-text);
      
      span {
        color: var(--color-page-content);
      }
    }
  }
`;

const ActivityName = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  transition: color 200ms ease;
`;

const ActivityMeta = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  transition: color 200ms ease;
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--space-md);
`;

const ModalContent = styled.div`
  background: var(--color-page-content);
  border-radius: 12px;
  padding: var(--space-lg);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
`;

const ModalTitle = styled.h3`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  margin: 0;
`;

const CloseButton = styled.button`
  padding: var(--space-xs);
  background: transparent;
  border: 1px solid var(--color-text);
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text);
  font-size: 12px;
  font-weight: 700;
  transition: all 200ms ease;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: var(--color-text);
      color: var(--color-page-content);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.6;
  text-align: center;
  padding: var(--space-lg);
`;

const EmptyText = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.6;
  text-align: center;
  padding: var(--space-lg);
`;

const ErrorText = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  text-align: center;
  padding: var(--space-md);
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  word-break: break-word;
`;

// Helper functions
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

function formatPace(metersPerSecond: number): string {
  if (!metersPerSecond || metersPerSecond === 0) return '--:--';
  const minutesPerKm = 1000 / (metersPerSecond * 60);
  const mins = Math.floor(minutesPerKm);
  const secs = Math.floor((minutesPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDateRanges(): DateRange[] {
  return [
    {
      id: 'week',
      label: '7D',
      getRange: () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        return {
          after: Math.floor(monday.getTime() / 1000),
          before: Math.floor(sunday.getTime() / 1000)
        };
      }
    },
    {
      id: '2weeks',
      label: '2W',
      getRange: () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset - 7);
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(now);
        const currentMondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        sunday.setDate(now.getDate() + currentMondayOffset + 6);
        sunday.setHours(23, 59, 59, 999);
        
        return {
          after: Math.floor(monday.getTime() / 1000),
          before: Math.floor(sunday.getTime() / 1000)
        };
      }
    },
    {
      id: 'month',
      label: '1M',
      getRange: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDay.setHours(0, 0, 0, 0);
        
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 59, 999);
        
        return {
          after: Math.floor(firstDay.getTime() / 1000),
          before: Math.floor(lastDay.getTime() / 1000)
        };
      }
    },
    {
      id: 'ytd',
      label: 'YTD',
      getRange: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), 0, 1);
        firstDay.setHours(0, 0, 0, 0);
        
        return {
          after: Math.floor(firstDay.getTime() / 1000),
          before: Math.floor(now.getTime() / 1000)
        };
      }
    }
  ];
}

// Main Component
export default function Data() {
  const { theme, setTheme, noiseEnabled, setNoiseEnabled } = useThemeStore();
  const themeKeys = Object.keys(themes);
  const contentRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<NavbarRef>(null);
  const mobileNavbarRef = useRef<MobileNavbarRef>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  
  // Data state
  const [selectedRange, setSelectedRange] = useState<string>('week');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoneData, setZoneData] = useState<{ [key: number]: ActivityZone[] }>({});
  const [aggregatedZones, setAggregatedZones] = useState<number[]>([0, 0, 0, 0, 0]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityZonesLoading, setActivityZonesLoading] = useState(false);
  
  const dateRanges = getDateRanges();
  const AEROBIC_THRESHOLD = 151; // BPM

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    const range = dateRanges.find(r => r.id === selectedRange);
    if (!range) return;
    
    const { after, before } = range.getRange();
    
    try {
      const response = await fetch(`/api/strava/activities?after=${after}&before=${before}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      }
      
      if (data.activities) {
        setActivities(data.activities);
        // Fetch zones for each activity
        fetchZonesForActivities(data.activities);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [selectedRange]);

  // Fetch zones for all activities
  const fetchZonesForActivities = async (acts: Activity[]) => {
    const zonesMap: { [key: number]: ActivityZone[] } = {};
    const aggregated = [0, 0, 0, 0, 0];
    
    for (const activity of acts) {
      if (activity.has_heartrate) {
        try {
          const response = await fetch(`/api/strava/activities/${activity.id}/zones`);
          const data = await response.json();
          
          if (data.zones && data.zones.length > 0) {
            zonesMap[activity.id] = data.zones;
            
            // Aggregate zone times
            const hrZone = data.zones[0];
            if (hrZone && hrZone.distribution_buckets) {
              hrZone.distribution_buckets.forEach((bucket: ZoneBucket, index: number) => {
                if (index < 5) {
                  aggregated[index] += bucket.time || 0;
                }
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching zones for activity ${activity.id}:`, error);
        }
      }
    }
    
    setZoneData(zonesMap);
    setAggregatedZones(aggregated);
  };

  // Fetch zones for selected activity
  const fetchActivityZones = async (activityId: number) => {
    if (zoneData[activityId]) return;
    
    setActivityZonesLoading(true);
    try {
      const response = await fetch(`/api/strava/activities/${activityId}/zones`);
      const data = await response.json();
      
      if (data.zones) {
        setZoneData(prev => ({ ...prev, [activityId]: data.zones }));
      }
    } catch (error) {
      console.error('Error fetching activity zones:', error);
    } finally {
      setActivityZonesLoading(false);
    }
  };

  // Calculate stats
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
  const avgCadence = activities.filter(a => a.average_cadence).length > 0
    ? activities.reduce((sum, a) => sum + (a.average_cadence || 0), 0) / activities.filter(a => a.average_cadence).length
    : 0;
  const avgPace = totalTime > 0 ? totalDistance / totalTime : 0;
  
  // Calculate time below threshold (Z1 + Z2 typically)
  const timeBelowThreshold = aggregatedZones[0] + aggregatedZones[1];
  const totalZoneTime = aggregatedZones.reduce((sum, t) => sum + t, 0);

  // Initialize animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (navbarRef.current?.container) {
        gsap.set(navbarRef.current.container, {
          opacity: 1,
          y: 0,
          visibility: 'visible'
        });

        const allNavElements = [
          navbarRef.current.themeTop,
          navbarRef.current.grid,
          navbarRef.current.noise,
          navbarRef.current.themeBottom,
          navbarRef.current.themeLeft,
          navbarRef.current.themeRight
        ];

        allNavElements.forEach(element => {
          if (element) {
            gsap.set(element, { opacity: 0, y: -10, filter: 'blur(20px)' });
          }
        });
      }

      gsap.set(contentRef.current, { opacity: 1, visibility: 'visible' });

      const tl = gsap.timeline({
        delay: 1.2,
        defaults: { ease: "sine.out" }
      });

      tl.fromTo(".data-container", {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      });

      if (navbarRef.current) {
        const allNavElements = [
          navbarRef.current.themeTop,
          navbarRef.current.grid,
          navbarRef.current.noise,
          navbarRef.current.themeBottom,
          navbarRef.current.themeLeft,
          navbarRef.current.themeRight
        ];

        tl.to(allNavElements, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: "cubic-bezier(.455, .03, .515, .955)",
          clearProps: "all"
        }, "+=0.2");
      }
    }, contentRef);

    return () => ctx.revert();
  }, []);

  // Fetch data on range change
  useEffect(() => {
    fetchActivities();
  }, [selectedRange, fetchActivities]);

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 440);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    if (activity.has_heartrate && !zoneData[activity.id]) {
      fetchActivityZones(activity.id);
    }
  };

  const closeModal = () => {
    setSelectedActivity(null);
  };

  const handleGridToggle = () => {};
  const handleNoiseToggle = (value: boolean) => setNoiseEnabled(value);
  const handleNavExpandedChange = (value: boolean) => setIsNavExpanded(value);

  return (
    <PageWrapper noiseEnabled={noiseEnabled}>
      <ContentWrapper>
        {isMobile && (
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
        )}
        <Navbar
          ref={navbarRef}
          onGridToggle={handleGridToggle}
          onNoiseToggle={handleNoiseToggle}
          onThemeChange={cycleTheme}
          initialNoiseState={noiseEnabled}
          hideInactiveToggles={false}
          showDvdToggle={false}
          show3DToggle={false}
        />
        <StyledContent 
          ref={contentRef}
          className={jetbrainsMono.className}
          style={isMobile && isNavExpanded ? { filter: 'blur(8px)' } : undefined}
        >
          <DataContainer className="data-container">
            {/* Date Range Selector */}
            <DateSelectorWrapper>
              {dateRanges.map(range => (
                <DateButton
                  key={range.id}
                  $isActive={selectedRange === range.id}
                  onClick={() => setSelectedRange(range.id)}
                >
                  {range.label}
                </DateButton>
              ))}
            </DateSelectorWrapper>

            {error && (
              <ErrorText>{error}</ErrorText>
            )}

            {loading ? (
              <LoadingText>Loading...</LoadingText>
            ) : (
              <>
                {/* Time Below Threshold - Primary KPI */}
                <ThresholdSection>
                  <ThresholdLabel>Time Below {AEROBIC_THRESHOLD} BPM</ThresholdLabel>
                  <ThresholdValue>{formatTime(timeBelowThreshold)}</ThresholdValue>
                </ThresholdSection>

                {/* Weekly Stats */}
                <Section>
                  <SectionTitle>Stats</SectionTitle>
                  <StatRow>
                    <StatLabel>Distance</StatLabel>
                    <StatValue>{formatDistance(totalDistance)}</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatLabel>Avg Cadence</StatLabel>
                    <StatValue>{avgCadence > 0 ? `${Math.round(avgCadence * 2)} spm` : '--'}</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatLabel>Avg Pace</StatLabel>
                    <StatValue>{formatPace(avgPace)}</StatValue>
                  </StatRow>
                </Section>

                {/* HR Zones */}
                <Section>
                  <SectionTitle>HR Zones</SectionTitle>
                  {aggregatedZones.map((time, index) => {
                    const percent = totalZoneTime > 0 ? (time / totalZoneTime) * 100 : 0;
                    return (
                      <ZoneRow key={index}>
                        <ZoneLabel>Z{index + 1}</ZoneLabel>
                        <ZoneBarContainer>
                          <ZoneBar $width={percent} $zone={index} />
                        </ZoneBarContainer>
                        <ZoneTime>{formatTime(time)}</ZoneTime>
                        <ZonePercent>{percent.toFixed(0)}%</ZonePercent>
                      </ZoneRow>
                    );
                  })}
                </Section>

                {/* Activities List */}
                <Section>
                  <SectionTitle>Activities ({activities.length})</SectionTitle>
                  {activities.length === 0 ? (
                    <EmptyText>No activities found</EmptyText>
                  ) : (
                    activities.map(activity => (
                      <ActivityCard 
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                      >
                        <ActivityName>{activity.name}</ActivityName>
                        <ActivityMeta>
                          {formatDate(activity.start_date_local)} • {formatDistance(activity.distance)} • {formatTime(activity.moving_time)}
                        </ActivityMeta>
                      </ActivityCard>
                    ))
                  )}
                </Section>
              </>
            )}
          </DataContainer>
        </StyledContent>

        {/* Activity Detail Modal */}
        <ModalOverlay $isOpen={!!selectedActivity} onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            {selectedActivity && (
              <>
                <ModalHeader>
                  <div>
                    <ModalTitle>{selectedActivity.name}</ModalTitle>
                    <ActivityMeta style={{ marginTop: '8px' }}>
                      {formatDate(selectedActivity.start_date_local)} • {formatDistance(selectedActivity.distance)}
                    </ActivityMeta>
                  </div>
                  <CloseButton onClick={closeModal}>×</CloseButton>
                </ModalHeader>

                {selectedActivity.has_heartrate ? (
                  activityZonesLoading ? (
                    <LoadingText>Loading zones...</LoadingText>
                  ) : zoneData[selectedActivity.id] ? (
                    <Section>
                      <SectionTitle>HR Zones</SectionTitle>
                      {zoneData[selectedActivity.id][0]?.distribution_buckets?.map((bucket, index) => {
                        const totalActivityTime = zoneData[selectedActivity.id][0].distribution_buckets.reduce(
                          (sum, b) => sum + (b.time || 0), 0
                        );
                        const percent = totalActivityTime > 0 ? (bucket.time / totalActivityTime) * 100 : 0;
                        return (
                          <ZoneRow key={index}>
                            <ZoneLabel>Z{index + 1}</ZoneLabel>
                            <ZoneBarContainer>
                              <ZoneBar $width={percent} $zone={index} />
                            </ZoneBarContainer>
                            <ZoneTime>{formatTime(bucket.time)}</ZoneTime>
                            <ZonePercent>{percent.toFixed(0)}%</ZonePercent>
                          </ZoneRow>
                        );
                      })}
                    </Section>
                  ) : (
                    <EmptyText>No zone data available</EmptyText>
                  )
                ) : (
                  <EmptyText>No heart rate data for this activity</EmptyText>
                )}

                <Section>
                  <SectionTitle>Stats</SectionTitle>
                  <StatRow>
                    <StatLabel>Duration</StatLabel>
                    <StatValue>{formatTime(selectedActivity.moving_time)}</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatLabel>Pace</StatLabel>
                    <StatValue>{formatPace(selectedActivity.average_speed)}</StatValue>
                  </StatRow>
                  {selectedActivity.average_heartrate && (
                    <StatRow>
                      <StatLabel>Avg HR</StatLabel>
                      <StatValue>{Math.round(selectedActivity.average_heartrate)} bpm</StatValue>
                    </StatRow>
                  )}
                  {selectedActivity.average_cadence && (
                    <StatRow>
                      <StatLabel>Cadence</StatLabel>
                      <StatValue>{Math.round(selectedActivity.average_cadence * 2)} spm</StatValue>
                    </StatRow>
                  )}
                </Section>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      </ContentWrapper>
    </PageWrapper>
  );
}
