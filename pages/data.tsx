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
  total_elevation_gain: number;
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

const ToggleLink = styled.button`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  transition: opacity 200ms ease;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 0.7;
    }
  }
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
  align-items: baseline;
  padding: var(--space-xs) 0;
  gap: var(--space-xs);
`;

const StatLabel = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  flex-shrink: 0;
`;

const StatDots = styled.span`
  flex: 1;
  overflow: hidden;
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  color: var(--color-text);
  opacity: 0.3;
  
  &::before {
    content: '....................................................................................................................';
    letter-spacing: 2px;
  }
`;

const StatValue = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  flex-shrink: 0;
  text-align: right;
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
  min-width: 24px;
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
  width: 48px;
  text-align: right;
  flex-shrink: 0;
`;

const ZonesContainer = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0;
  user-select: none;
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

const EditSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-text-secondary);
  margin-top: var(--space-sm);
`;

const EditRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const TimeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TimeInput = styled.input`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  color: var(--color-text);
  background: var(--color-text-secondary);
  border: 1px solid var(--color-text);
  border-radius: 4px;
  padding: var(--space-xs);
  width: 45px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }
  
  /* Hide spinner buttons */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const TimeUnitLabel = styled.span`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
`;

const EditButton = styled.button`
  font-family: ${typography.caption.fontFamily};
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  letter-spacing: ${typography.caption.letterSpacing};
  text-transform: ${typography.caption.textTransform};
  color: var(--color-text);
  background: none;
  border: 1px solid var(--color-text);
  border-radius: 4px;
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
  transition: all 200ms ease;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: var(--color-text);
      color: var(--color-bg);
    }
  }
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

function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`;
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
  const [showActivities, setShowActivities] = useState(false);
  const [zoneDisplayMode, setZoneDisplayMode] = useState<'time' | 'percent' | 'range'>('time');
  const [localOverrides, setLocalOverrides] = useState<{ [key: number]: { timeBelowThreshold: number } }>({});

  // Cycle through zone display modes: time → percent → range → time
  const cycleZoneDisplayMode = () => {
    setZoneDisplayMode(current => {
      if (current === 'time') return 'percent';
      if (current === 'percent') return 'range';
      return 'time';
    });
  };
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [editUnit1, setEditUnit1] = useState<string>(''); // hours or minutes depending on activity length
  const [editUnit2, setEditUnit2] = useState<string>(''); // minutes or seconds depending on activity length
  
  const dateRanges = getDateRanges();
  const AEROBIC_THRESHOLD = 151; // BPM

  // Load local overrides from localStorage on mount
  useEffect(() => {
    const storedOverrides: { [key: number]: { timeBelowThreshold: number } } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('activity-override-')) {
        const activityId = parseInt(key.replace('activity-override-', ''), 10);
        try {
          const value = JSON.parse(localStorage.getItem(key) || '{}');
          if (value.timeBelowThreshold !== undefined) {
            storedOverrides[activityId] = value;
          }
        } catch (e) {
          // ignore invalid JSON
        }
      }
    }
    setLocalOverrides(storedOverrides);
  }, []);

  // Helper to save override to localStorage
  const saveOverride = (activityId: number, timeBelowThreshold: number) => {
    const override = { timeBelowThreshold };
    localStorage.setItem(`activity-override-${activityId}`, JSON.stringify(override));
    setLocalOverrides(prev => ({ ...prev, [activityId]: override }));
  };

  // Helper to clear override from localStorage
  const clearOverride = (activityId: number) => {
    localStorage.removeItem(`activity-override-${activityId}`);
    setLocalOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[activityId];
      return newOverrides;
    });
  };

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Clear old data immediately so user sees loading state
    setActivities([]);
    setHRMetricsMap({});
    setAggregatedMetrics(null);
    setExpandedActivityId(null);
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

  // Fetch HR metrics from streams for all activities (in parallel)
  const fetchHRMetricsForActivities = async (acts: Activity[]) => {
    // Fetch all HR metrics in parallel
    const results = await Promise.all(
      acts.filter(a => a.has_heartrate).map(activity =>
        fetch(`/api/strava/activities/${activity.id}/streams`)
          .then(r => r.json())
          .then(data => ({ activityId: activity.id, metrics: data.metrics as HRMetrics | null }))
          .catch(() => ({ activityId: activity.id, metrics: null }))
      )
    );

    // Aggregate results
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

    for (const result of results) {
      if (result.metrics) {
        metricsMap[result.activityId] = result.metrics;
        
        aggregated.timeBelowThreshold += result.metrics.timeBelowThreshold;
        aggregated.timeAboveThreshold += result.metrics.timeAboveThreshold;
        aggregated.totalTime += result.metrics.totalTime;
        aggregated.zoneDistribution.zone1 += result.metrics.zoneDistribution.zone1;
        aggregated.zoneDistribution.zone2 += result.metrics.zoneDistribution.zone2;
        aggregated.zoneDistribution.zone3 += result.metrics.zoneDistribution.zone3;
        aggregated.zoneDistribution.zone4 += result.metrics.zoneDistribution.zone4;
        aggregated.zoneDistribution.zone5 += result.metrics.zoneDistribution.zone5;
        
        if (result.metrics.maxHR > aggregated.maxHR) aggregated.maxHR = result.metrics.maxHR;
        if (result.metrics.minHR < aggregated.minHR) aggregated.minHR = result.metrics.minHR;
        hrSum += result.metrics.avgHR * result.metrics.totalTime;
        hrCount += result.metrics.totalTime;
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

  // Calculate stats (distance and pace only from running activities)
  const runningActivities = activities.filter(a => ['Run', 'TrailRun', 'VirtualRun'].includes(a.sport_type));
  const totalDistance = runningActivities.reduce((sum, a) => sum + a.distance, 0);
  const totalRunningTime = runningActivities.reduce((sum, a) => sum + a.moving_time, 0);
  const avgPace = totalRunningTime > 0 ? totalDistance / totalRunningTime : 0;
  const totalElevation = activities.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0);
  
  // Get HR metrics from aggregated data (with local overrides applied)
  // For activities WITH HR data: use Z1 + Z2 from zones (consistent with what's displayed)
  const hrDataTotal = aggregatedMetrics 
    ? aggregatedMetrics.zoneDistribution.zone1 + aggregatedMetrics.zoneDistribution.zone2 
    : 0;
  // For activities WITHOUT HR data: add any local overrides
  const noHrDataOverridesTotal = Object.entries(localOverrides).reduce((sum, [activityId, override]) => {
    // Only include if this activity is NOT in hrMetricsMap (no HR data)
    if (!hrMetricsMap[Number(activityId)]) {
      return sum + (override.timeBelowThreshold || 0);
    }
    return sum;
  }, 0);
  const timeBelowThreshold = hrDataTotal + noHrDataOverridesTotal;
  // Include manual overrides in total zone time (added to Z1)
  const totalZoneTime = aggregatedMetrics ? 
    aggregatedMetrics.zoneDistribution.zone1 + 
    aggregatedMetrics.zoneDistribution.zone2 + 
    aggregatedMetrics.zoneDistribution.zone3 + 
    aggregatedMetrics.zoneDistribution.zone4 + 
    aggregatedMetrics.zoneDistribution.zone5 + 
    noHrDataOverridesTotal : noHrDataOverridesTotal;

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
                  <ThresholdLabel>Time Below AeT</ThresholdLabel>
                  <ThresholdValue>{formatTime(timeBelowThreshold)}</ThresholdValue>
                </ThresholdSection>

                {/* Weekly Stats */}
                <Section>
                  <StatRow>
                    <StatLabel>Distance</StatLabel>
                    <StatDots />
                    <StatValue>{formatDistance(totalDistance)}</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatLabel>Elevation</StatLabel>
                    <StatDots />
                    <StatValue>{formatElevation(totalElevation)}</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatLabel>Avg Pace</StatLabel>
                    <StatDots />
                    <StatValue>{formatPace(avgPace)}</StatValue>
                  </StatRow>
                </Section>

                {/* HR Zones */}
                <Section>
                  {(aggregatedMetrics || noHrDataOverridesTotal > 0) ? (
                    <ZonesContainer onClick={cycleZoneDisplayMode}>
                      {[
                        { label: 'Z1', time: (aggregatedMetrics?.zoneDistribution.zone1 || 0) + noHrDataOverridesTotal, range: '0-132' },
                        { label: 'Z2', time: aggregatedMetrics?.zoneDistribution.zone2 || 0, range: '132-151' },
                        { label: 'Z3', time: aggregatedMetrics?.zoneDistribution.zone3 || 0, range: '151-160' },
                        { label: 'Z4', time: aggregatedMetrics?.zoneDistribution.zone4 || 0, range: '160-178' },
                        { label: 'Z5', time: aggregatedMetrics?.zoneDistribution.zone5 || 0, range: '179+' },
                      ].map((zone, index) => {
                        const percent = totalZoneTime > 0 ? (zone.time / totalZoneTime) * 100 : 0;
                        // In range mode: show range as label and time as value
                        const labelValue = zoneDisplayMode === 'range' ? zone.range : zone.label;
                        const displayValue = zoneDisplayMode === 'time' 
                          ? formatTime(zone.time) 
                          : zoneDisplayMode === 'percent' 
                            ? `${percent.toFixed(0)}%` 
                            : formatTime(zone.time);
                        return (
                          <ZoneRow key={index}>
                            <ZoneLabel>{labelValue}</ZoneLabel>
                            <ZoneBarContainer>
                              <ZoneBar $width={percent} $zone={index} />
                            </ZoneBarContainer>
                            <ZoneTime>{displayValue}</ZoneTime>
                          </ZoneRow>
                        );
                      })}
                    </ZonesContainer>
                  ) : (
                    <EmptyText>Loading HR data...</EmptyText>
                  )}
                </Section>

                {/* Activities List */}
                <Section>
                  <ToggleLink onClick={() => setShowActivities(!showActivities)}>
                    {showActivities ? 'Hide' : 'Show'} Activities ({activities.length})
                  </ToggleLink>
                  {showActivities && (activities.length === 0 ? (
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
                            {(() => {
                              // Calculate effective times - use local overrides, then HR data, then default to 0
                              const baseTimeBelowThreshold = activityMetrics?.timeBelowThreshold ?? 0;
                              const baseTimeAboveThreshold = activityMetrics?.timeAboveThreshold ?? activity.moving_time;
                              const effectiveTimeBelowThreshold = localOverrides[activity.id]?.timeBelowThreshold ?? baseTimeBelowThreshold;
                              const activityTotalTime = activity.moving_time;
                              const effectiveTimeAboveThreshold = activityTotalTime - effectiveTimeBelowThreshold;
                              
                              return (
                                <>
                                  {/* Threshold Stats - always shown */}
                                  <Section>
                                    <StatRow>
                                      <StatLabel>Below Threshold{localOverrides[activity.id] ? ' (edited)' : ''}</StatLabel>
                                      <StatDots />
                                      <StatValue>
                                        {formatTime(effectiveTimeBelowThreshold)}
                                      </StatValue>
                                    </StatRow>
                                    <StatRow>
                                      <StatLabel>Above Threshold{localOverrides[activity.id] ? ' (edited)' : ''}</StatLabel>
                                      <StatDots />
                                      <StatValue>{formatTime(effectiveTimeAboveThreshold)}</StatValue>
                                    </StatRow>
                                  </Section>

                                  {/* HR Zones - only shown if HR data available */}
                                  {activity.has_heartrate && activityMetrics && (
                                    <Section>
                                      <ZonesContainer onClick={(e) => { e.stopPropagation(); cycleZoneDisplayMode(); }}>
                                        {[
                                          { label: 'Z1', time: activityMetrics.zoneDistribution.zone1, range: '0-132' },
                                          { label: 'Z2', time: activityMetrics.zoneDistribution.zone2, range: '132-151' },
                                          { label: 'Z3', time: activityMetrics.zoneDistribution.zone3, range: '151-160' },
                                          { label: 'Z4', time: activityMetrics.zoneDistribution.zone4, range: '160-178' },
                                          { label: 'Z5', time: activityMetrics.zoneDistribution.zone5, range: '179+' },
                                        ].map((zone, index) => {
                                          const zoneTotalTime = activityMetrics.zoneDistribution.zone1 +
                                            activityMetrics.zoneDistribution.zone2 +
                                            activityMetrics.zoneDistribution.zone3 +
                                            activityMetrics.zoneDistribution.zone4 +
                                            activityMetrics.zoneDistribution.zone5;
                                          const percent = zoneTotalTime > 0 ? (zone.time / zoneTotalTime) * 100 : 0;
                                          // In range mode: show range as label and time as value
                                          const labelValue = zoneDisplayMode === 'range' ? zone.range : zone.label;
                                          const displayValue = zoneDisplayMode === 'time' 
                                            ? formatTime(zone.time) 
                                            : zoneDisplayMode === 'percent' 
                                              ? `${percent.toFixed(0)}%` 
                                              : formatTime(zone.time);
                                          return (
                                            <ZoneRow key={index}>
                                              <ZoneLabel>{labelValue}</ZoneLabel>
                                              <ZoneBarContainer>
                                                <ZoneBar $width={percent} $zone={index} />
                                              </ZoneBarContainer>
                                              <ZoneTime>{displayValue}</ZoneTime>
                                            </ZoneRow>
                                          );
                                        })}
                                      </ZonesContainer>
                                    </Section>
                                  )}

                                  {/* Loading state for HR data */}
                                  {activity.has_heartrate && activityMetricsLoading && !activityMetrics && (
                                    <LoadingText>Loading HR zones...</LoadingText>
                                  )}
                                </>
                              );
                            })()}

                            <Section>
                              <StatRow>
                                <StatLabel>Duration</StatLabel>
                                <StatDots />
                                <StatValue>{formatTime(activity.moving_time)}</StatValue>
                              </StatRow>
                              <StatRow>
                                <StatLabel>Pace</StatLabel>
                                <StatDots />
                                <StatValue>{formatPace(activity.average_speed)}</StatValue>
                              </StatRow>
                              {activity.average_heartrate && (
                                <StatRow>
                                  <StatLabel>Avg HR</StatLabel>
                                  <StatDots />
                                  <StatValue>{Math.round(activity.average_heartrate)} bpm</StatValue>
                                </StatRow>
                              )}
                            </Section>

                            {/* Edit Section */}
                            <EditSection>
                              {editingActivityId === activity.id ? (
                                (() => {
                                  // Determine if activity uses hours (>= 1 hour) or just minutes/seconds
                                  const usesHours = activity.moving_time >= 3600;
                                  const unit1Label = usesHours ? 'H' : 'M';
                                  const unit2Label = usesHours ? 'M' : 'S';
                                  
                                  return (
                                    <>
                                      <EditRow>
                                        <StatLabel>Below AeT:</StatLabel>
                                        <TimeInputGroup>
                                          <TimeInput
                                            type="number"
                                            value={editUnit1}
                                            onChange={(e) => setEditUnit1(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            min="0"
                                          />
                                          <TimeUnitLabel>{unit1Label}</TimeUnitLabel>
                                          <TimeInput
                                            type="number"
                                            value={editUnit2}
                                            onChange={(e) => setEditUnit2(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            min="0"
                                            max={usesHours ? "59" : "59"}
                                          />
                                          <TimeUnitLabel>{unit2Label}</TimeUnitLabel>
                                        </TimeInputGroup>
                                      </EditRow>
                                      <EditRow>
                                        <EditButton onClick={(e) => {
                                          e.stopPropagation();
                                          const val1 = parseInt(editUnit1) || 0;
                                          const val2 = parseInt(editUnit2) || 0;
                                          const totalSeconds = usesHours 
                                            ? (val1 * 3600) + (val2 * 60)
                                            : (val1 * 60) + val2;
                                          saveOverride(activity.id, totalSeconds);
                                          setEditingActivityId(null);
                                          setEditUnit1('');
                                          setEditUnit2('');
                                        }}>
                                          Save
                                        </EditButton>
                                        <EditButton onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingActivityId(null);
                                          setEditUnit1('');
                                          setEditUnit2('');
                                        }}>
                                          Cancel
                                        </EditButton>
                                        <EditButton onClick={(e) => {
                                          e.stopPropagation();
                                          saveOverride(activity.id, activity.moving_time);
                                          setEditingActivityId(null);
                                          setEditUnit1('');
                                          setEditUnit2('');
                                        }}>
                                          Max
                                        </EditButton>
                                        {localOverrides[activity.id] && (
                                          <EditButton onClick={(e) => {
                                            e.stopPropagation();
                                            clearOverride(activity.id);
                                            setEditingActivityId(null);
                                            setEditUnit1('');
                                            setEditUnit2('');
                                          }}>
                                            Reset
                                          </EditButton>
                                        )}
                                      </EditRow>
                                    </>
                                  );
                                })()
                              ) : (
                                <EditButton onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingActivityId(activity.id);
                                  const currentValue = localOverrides[activity.id]?.timeBelowThreshold ?? 
                                    (activityMetrics?.timeBelowThreshold || 0);
                                  // Determine if activity uses hours or minutes/seconds
                                  const usesHours = activity.moving_time >= 3600;
                                  if (usesHours) {
                                    const hours = Math.floor(currentValue / 3600);
                                    const minutes = Math.floor((currentValue % 3600) / 60);
                                    setEditUnit1(hours.toString());
                                    setEditUnit2(minutes.toString());
                                  } else {
                                    const minutes = Math.floor(currentValue / 60);
                                    const seconds = currentValue % 60;
                                    setEditUnit1(minutes.toString());
                                    setEditUnit2(seconds.toString());
                                  }
                                }}>
                                  Edit
                                </EditButton>
                              )}
                            </EditSection>
                          </ActivityDetails>
                        </ActivityCard>
                      );
                    })
                  ))}
                </Section>
              </>
            )}
          </DataContainer>
        </StyledContent>
      </ContentWrapper>
    </PageWrapper>
  );
}
