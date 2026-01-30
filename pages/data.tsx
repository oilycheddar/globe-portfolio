'use client';

import { useThemeStore } from "../hooks/useThemeStore";
import { themes } from "../styles/themes";
import { typography } from "../styles/text";
import PageWrapper from "../components/pageWrapper";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "../utils/gsap";
import styled from 'styled-components';
import { Navbar } from "../components/Navbar";
import type { NavbarRef } from "../components/Navbar";
import { MobileNavbar } from "../components/MobileNavbar";
import type { MobileNavbarRef } from "../components/MobileNavbar";

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
  average_heartrate?: number;
  max_heartrate?: number;
  has_heartrate: boolean;
}

interface HRMetrics {
  timeBelowThreshold: number;
  timeAboveThreshold: number;
  totalTime: number;
  avgHR: number;
  maxHR: number;
  minHR: number;
  zoneDistribution: {
    zone1: number;
    zone2: number;
    zone3: number;
    zone4: number;
    zone5: number;
  };
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
  border: 1px solid var(--color-text);
  background: ${props => props.$isActive ? 'var(--color-text)' : 'transparent'};
  color: ${props => props.$isActive ? 'var(--color-page-content)' : 'var(--color-text)'};
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 200ms ease;
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: var(--color-text);
      background: var(--color-text);
      color: var(--color-page-content);
    }
  }
`;

const DateRangeText = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

const SectionTitle = styled.h2`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  margin: 0;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
`;

const StatLabel = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
`;

const StatValue = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
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
  font-family: ${typography.caption.fontFamily};
  font-size: 24px;
  font-weight: ${typography.caption.fontWeight};
  color: var(--color-page-content);
`;

const ThresholdLabel = styled.div`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-page-content);
`;

const ZoneRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
`;

const ZoneLabel = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  width: 24px;
  flex-shrink: 0;
`;

const ZoneBarContainer = styled.div`
  flex: 1;
  height: 16px;
  background: var(--color-text-secondary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ZoneBar = styled.div<{ $width: number; $zone: number }>`
  height: 100%;
  background: var(--color-accent-primary);
  width: ${props => props.$width}%;
  border-radius: 4px;
  transition: width 0.3s cubic-bezier(.215, .61, .355, 1);
`;

const ZoneTime = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  width: 80px;
  text-align: right;
  flex-shrink: 0;
`;

const ZonePercent = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  width: 40px;
  text-align: right;
  flex-shrink: 0;
`;

const ActivityCard = styled.button<{ $isExpanded: boolean }>`
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
`;

const ActivityName = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
`;

const ActivityMeta = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
`;

const ActivityDetails = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-text);
  margin-top: var(--space-sm);
`;

const LoadingText = styled.div`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  text-align: center;
  padding: var(--space-lg);
`;

const EmptyText = styled.div`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  text-align: center;
  padding: var(--space-lg);
`;

const ErrorText = styled.div`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
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

// Format date range for display
function formatDateRange(rangeId: string): string {
  const range = getDateRanges().find(r => r.id === rangeId);
  if (!range) return '';
  
  const { after, before } = range.getRange();
  const startDate = new Date(after * 1000);
  const endDate = new Date(before * 1000);
  
  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  };
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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
  const [hrMetricsMap, setHRMetricsMap] = useState<{ [key: number]: HRMetrics }>({});
  const [aggregatedMetrics, setAggregatedMetrics] = useState<HRMetrics | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null);
  const [activityMetricsLoading, setActivityMetricsLoading] = useState(false);
  
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
        // Fetch HR streams for each activity
        fetchHRMetricsForActivities(data.activities);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [selectedRange]);

  // Fetch HR metrics from streams for all activities
  const fetchHRMetricsForActivities = async (acts: Activity[]) => {
    const metricsMap: { [key: number]: HRMetrics } = {};
    const aggregated: HRMetrics = {
      timeBelowThreshold: 0,
      timeAboveThreshold: 0,
      totalTime: 0,
      avgHR: 0,
      maxHR: 0,
      minHR: Infinity,
      zoneDistribution: { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 }
    };
    
    let hrSum = 0;
    let hrCount = 0;
    
    for (const activity of acts) {
      if (activity.has_heartrate) {
        try {
          const response = await fetch(`/api/strava/activities/${activity.id}/streams`);
          const data = await response.json();
          
          if (data.metrics) {
            metricsMap[activity.id] = data.metrics;
            
            // Aggregate metrics
            aggregated.timeBelowThreshold += data.metrics.timeBelowThreshold;
            aggregated.timeAboveThreshold += data.metrics.timeAboveThreshold;
            aggregated.totalTime += data.metrics.totalTime;
            aggregated.zoneDistribution.zone1 += data.metrics.zoneDistribution.zone1;
            aggregated.zoneDistribution.zone2 += data.metrics.zoneDistribution.zone2;
            aggregated.zoneDistribution.zone3 += data.metrics.zoneDistribution.zone3;
            aggregated.zoneDistribution.zone4 += data.metrics.zoneDistribution.zone4;
            aggregated.zoneDistribution.zone5 += data.metrics.zoneDistribution.zone5;
            
            if (data.metrics.maxHR > aggregated.maxHR) aggregated.maxHR = data.metrics.maxHR;
            if (data.metrics.minHR < aggregated.minHR) aggregated.minHR = data.metrics.minHR;
            hrSum += data.metrics.avgHR * data.metrics.totalTime;
            hrCount += data.metrics.totalTime;
          }
        } catch (error) {
          console.error(`Error fetching HR metrics for activity ${activity.id}:`, error);
        }
      }
    }
    
    // Calculate overall average HR
    if (hrCount > 0) {
      aggregated.avgHR = Math.round(hrSum / hrCount);
    }
    if (aggregated.minHR === Infinity) aggregated.minHR = 0;
    
    setHRMetricsMap(metricsMap);
    setAggregatedMetrics(aggregated);
  };

  // Fetch HR metrics for expanded activity
  const fetchActivityMetrics = async (activityId: number) => {
    if (hrMetricsMap[activityId]) return;
    
    setActivityMetricsLoading(true);
    try {
      const response = await fetch(`/api/strava/activities/${activityId}/streams`);
      const data = await response.json();
      
      if (data.metrics) {
        setHRMetricsMap(prev => ({ ...prev, [activityId]: data.metrics }));
      }
    } catch (error) {
      console.error('Error fetching activity HR metrics:', error);
    } finally {
      setActivityMetricsLoading(false);
    }
  };

  // Calculate stats
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
  const avgPace = totalTime > 0 ? totalDistance / totalTime : 0;
  
  // Get HR metrics from aggregated data
  const timeBelowThreshold = aggregatedMetrics?.timeBelowThreshold || 0;
  const totalZoneTime = aggregatedMetrics ? 
    aggregatedMetrics.zoneDistribution.zone1 + 
    aggregatedMetrics.zoneDistribution.zone2 + 
    aggregatedMetrics.zoneDistribution.zone3 + 
    aggregatedMetrics.zoneDistribution.zone4 + 
    aggregatedMetrics.zoneDistribution.zone5 : 0;

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
    if (expandedActivityId === activity.id) {
      setExpandedActivityId(null);
    } else {
      setExpandedActivityId(activity.id);
      if (activity.has_heartrate && !hrMetricsMap[activity.id]) {
        fetchActivityMetrics(activity.id);
      }
    }
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
            <DateRangeText>{formatDateRange(selectedRange)}</DateRangeText>

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
                    <StatLabel>Avg Pace</StatLabel>
                    <StatValue>{formatPace(avgPace)}</StatValue>
                  </StatRow>
                </Section>

                {/* HR Zones */}
                <Section>
                  <SectionTitle>HR Zones</SectionTitle>
                  {aggregatedMetrics ? (
                    <>
                      {[
                        { label: 'Z1', time: aggregatedMetrics.zoneDistribution.zone1 },
                        { label: 'Z2', time: aggregatedMetrics.zoneDistribution.zone2 },
                        { label: 'Z3', time: aggregatedMetrics.zoneDistribution.zone3 },
                        { label: 'Z4', time: aggregatedMetrics.zoneDistribution.zone4 },
                        { label: 'Z5', time: aggregatedMetrics.zoneDistribution.zone5 },
                      ].map((zone, index) => {
                        const percent = totalZoneTime > 0 ? (zone.time / totalZoneTime) * 100 : 0;
                        return (
                          <ZoneRow key={index}>
                            <ZoneLabel>{zone.label}</ZoneLabel>
                            <ZoneBarContainer>
                              <ZoneBar $width={percent} $zone={index} />
                            </ZoneBarContainer>
                            <ZoneTime>{formatTime(zone.time)}</ZoneTime>
                            <ZonePercent>{percent.toFixed(0)}%</ZonePercent>
                          </ZoneRow>
                        );
                      })}
                    </>
                  ) : (
                    <EmptyText>Loading HR data...</EmptyText>
                  )}
                </Section>

                {/* Activities List */}
                <Section>
                  <SectionTitle>Activities ({activities.length})</SectionTitle>
                  {activities.length === 0 ? (
                    <EmptyText>No activities found</EmptyText>
                  ) : (
                    activities.map(activity => {
                      const isExpanded = expandedActivityId === activity.id;
                      const activityMetrics = hrMetricsMap[activity.id];
                      
                      return (
                        <ActivityCard 
                          key={activity.id}
                          $isExpanded={isExpanded}
                          onClick={() => handleActivityClick(activity)}
                        >
                          <ActivityName>{activity.name}</ActivityName>
                          <ActivityMeta>
                            {formatDate(activity.start_date_local)} • {formatDistance(activity.distance)} • {formatTime(activity.moving_time)}
                          </ActivityMeta>
                          
                          <ActivityDetails $isVisible={isExpanded}>
                            {activity.has_heartrate ? (
                              activityMetricsLoading && !activityMetrics ? (
                                <LoadingText>Loading HR data...</LoadingText>
                              ) : activityMetrics ? (
                                <>
                                  <Section>
                                    <SectionTitle>Time Below {AEROBIC_THRESHOLD} BPM</SectionTitle>
                                    <StatRow>
                                      <StatLabel>Below Threshold</StatLabel>
                                      <StatValue>{formatTime(activityMetrics.timeBelowThreshold)}</StatValue>
                                    </StatRow>
                                    <StatRow>
                                      <StatLabel>Above Threshold</StatLabel>
                                      <StatValue>{formatTime(activityMetrics.timeAboveThreshold)}</StatValue>
                                    </StatRow>
                                  </Section>
                                  <Section>
                                    <SectionTitle>HR Zones</SectionTitle>
                                    {[
                                      { label: 'Z1', time: activityMetrics.zoneDistribution.zone1 },
                                      { label: 'Z2', time: activityMetrics.zoneDistribution.zone2 },
                                      { label: 'Z3', time: activityMetrics.zoneDistribution.zone3 },
                                      { label: 'Z4', time: activityMetrics.zoneDistribution.zone4 },
                                      { label: 'Z5', time: activityMetrics.zoneDistribution.zone5 },
                                    ].map((zone, index) => {
                                      const activityTotalTime = activityMetrics.zoneDistribution.zone1 +
                                        activityMetrics.zoneDistribution.zone2 +
                                        activityMetrics.zoneDistribution.zone3 +
                                        activityMetrics.zoneDistribution.zone4 +
                                        activityMetrics.zoneDistribution.zone5;
                                      const percent = activityTotalTime > 0 ? (zone.time / activityTotalTime) * 100 : 0;
                                      return (
                                        <ZoneRow key={index}>
                                          <ZoneLabel>{zone.label}</ZoneLabel>
                                          <ZoneBarContainer>
                                            <ZoneBar $width={percent} $zone={index} />
                                          </ZoneBarContainer>
                                          <ZoneTime>{formatTime(zone.time)}</ZoneTime>
                                          <ZonePercent>{percent.toFixed(0)}%</ZonePercent>
                                        </ZoneRow>
                                      );
                                    })}
                                  </Section>
                                </>
                              ) : (
                                <EmptyText>No HR stream data available</EmptyText>
                              )
                            ) : (
                              <EmptyText>No heart rate data</EmptyText>
                            )}

                            <Section>
                              <SectionTitle>Stats</SectionTitle>
                              <StatRow>
                                <StatLabel>Duration</StatLabel>
                                <StatValue>{formatTime(activity.moving_time)}</StatValue>
                              </StatRow>
                              <StatRow>
                                <StatLabel>Pace</StatLabel>
                                <StatValue>{formatPace(activity.average_speed)}</StatValue>
                              </StatRow>
                              {activity.average_heartrate && (
                                <StatRow>
                                  <StatLabel>Avg HR</StatLabel>
                                  <StatValue>{Math.round(activity.average_heartrate)} bpm</StatValue>
                                </StatRow>
                              )}
                            </Section>
                          </ActivityDetails>
                        </ActivityCard>
                      );
                    })
                  )}
                </Section>
              </>
            )}
          </DataContainer>
        </StyledContent>
      </ContentWrapper>
    </PageWrapper>
  );
}
