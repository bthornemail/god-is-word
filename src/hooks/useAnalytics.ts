// ============================================================================
// useAnalytics.ts - React Hook for Analytics
// ============================================================================

import { useMemo } from 'react';
import type { Perceptron } from '../lib/perceptron/types';
import type {
  DailyMetrics,
  PersonalMetrics,
  ComparativeMetrics,
} from '../lib/analytics/types';
import {
  computeDailyMetrics,
  computePersonalMetrics,
  computeComparativeMetrics,
} from '../lib/analytics/engine';
import { getTodayDate, getYesterdayDate } from '../lib/analytics/time';

interface CollectiveSignature {
  entries: Perceptron[];
  pattern?: { positive: number; negative: number; neutral: number };
}

interface TodayEntry {
  word: string;
}

/**
 * Aggregates all entries from user entries and collective data
 */
function aggregateAllEntries(
  userEntries: Perceptron[],
  collectiveData: CollectiveSignature[]
): Perceptron[] {
  const allEntries: Perceptron[] = [...userEntries];

  collectiveData.forEach(sig => {
    if (sig.entries && Array.isArray(sig.entries)) {
      allEntries.push(...sig.entries);
    }
  });

  return allEntries;
}

/**
 * React hook for analytics computation
 */
export function useAnalytics(
  userEntries: Perceptron[],
  collectiveData: CollectiveSignature[],
  currentDay: number,
  todayEntry?: TodayEntry
) {
  // Memoize aggregated entries
  const allEntries = useMemo(() => {
    return aggregateAllEntries(userEntries, collectiveData);
  }, [userEntries, collectiveData]);

  // Memoize today's metrics
  const dailyMetrics = useMemo<DailyMetrics | null>(() => {
    if (allEntries.length === 0) return null;
    const today = getTodayDate();
    return computeDailyMetrics(today, allEntries);
  }, [allEntries]);

  // Memoize yesterday's metrics for comparison
  const yesterdayMetrics = useMemo<DailyMetrics | null>(() => {
    if (allEntries.length === 0) return null;
    const yesterday = getYesterdayDate();
    return computeDailyMetrics(yesterday, allEntries);
  }, [allEntries]);

  // Memoize personal metrics
  const personalMetrics = useMemo<PersonalMetrics | null>(() => {
    if (userEntries.length === 0 && !todayEntry?.word) return null;
    return computePersonalMetrics(userEntries, allEntries, currentDay, todayEntry);
  }, [userEntries, allEntries, currentDay, todayEntry]);

  // Memoize comparative metrics
  const comparativeMetrics = useMemo<ComparativeMetrics | null>(() => {
    if (!dailyMetrics || !yesterdayMetrics) return null;
    return computeComparativeMetrics(dailyMetrics, yesterdayMetrics);
  }, [dailyMetrics, yesterdayMetrics]);

  const isLoading = !dailyMetrics && allEntries.length === 0;

  return {
    dailyMetrics,
    yesterdayMetrics,
    personalMetrics,
    comparativeMetrics,
    allEntries,
    isLoading,
  };
}

