// ============================================================================
// engine.ts - Core Analytics Computation Engine
// ============================================================================

import type { Perceptron } from '../perceptron/types';
import type {
  DailyMetrics,
  PersonalMetrics,
  ComparativeMetrics,
  SentimentType,
  WordCategory,
} from './types';
import {
  getTodayDate,
  getDateFromTimestamp,
  isSameDay,
  parseDate,
} from './time';

/**
 * Categorizes a word into semantic categories
 */
export function categorizeWord(word: string): WordCategory {
  const lower = word.toLowerCase().trim();

  // Negative words
  const negativeWords = ['hate', 'nothing', 'none', 'absent', 'void', 'empty', 'null', 'absence', 'lack'];
  if (negativeWords.some(n => lower.includes(n))) {
    return 'negative';
  }

  // Existence/Ontological
  const existenceWords = ['exist', 'being', 'is', 'reality', 'truth', 'nature', 'essence', 'substance', 'entity'];
  if (existenceWords.some(e => lower.includes(e))) {
    return 'existence';
  }

  // Emotional/Relational
  const emotionalWords = ['love', 'compassion', 'care', 'kindness', 'peace', 'joy', 'hope', 'faith', 'trust', 'mercy', 'grace', 'forgiveness'];
  if (emotionalWords.some(e => lower.includes(e))) {
    return 'emotional';
  }

  // Religious/Traditional
  const religiousWords = ['god', 'lord', 'divine', 'holy', 'sacred', 'worship', 'prayer', 'bible', 'scripture', 'christ', 'jesus', 'allah', 'buddha', 'prophet'];
  if (religiousWords.some(r => lower.includes(r))) {
    return 'religious';
  }

  // Abstract/Philosophical
  const abstractWords = ['infinity', 'eternal', 'absolute', 'ultimate', 'transcendent', 'metaphysical', 'cosmic', 'universal', 'infinite', 'absolute'];
  if (abstractWords.some(a => lower.includes(a))) {
    return 'abstract';
  }

  return 'unknown';
}

/**
 * Computes sentiment from word and pattern data
 */
export function computeSentiment(
  _word: string,
  pattern?: { positive: number; negative: number; neutral: number }
): SentimentType {
  if (!pattern) {
    return 'ambiguous';
  }

  const total = pattern.positive + pattern.negative + pattern.neutral;
  if (total === 0) {
    return 'ambiguous';
  }

  const positiveRatio = pattern.positive / total;
  const negativeRatio = pattern.negative / total;

  if (positiveRatio > 0.6) return 'positive';
  if (negativeRatio > 0.6) return 'negative';
  if (Math.abs(positiveRatio - negativeRatio) < 0.2) return 'neutral';
  return positiveRatio > negativeRatio ? 'positive' : 'negative';
}

/**
 * Computes daily metrics for a specific date
 */
export function computeDailyMetrics(date: string, allEntries: Perceptron[]): DailyMetrics {
  // Filter entries for this date
  const entriesForDate = allEntries.filter(entry => {
    if (!entry || !entry.timestamp) return false;
    try {
      const entryDate = getDateFromTimestamp(entry.timestamp);
      return isSameDay(entryDate, date);
    } catch {
      return false;
    }
  });

  const totalResponses = entriesForDate.length;

  // Count word frequencies
  const wordFrequency = new Map<string, number>();
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0, ambiguous: 0 };
  const categoryCounts = {
    existence: 0,
    emotional: 0,
    abstract: 0,
    religious: 0,
    negative: 0,
    unknown: 0,
  };

  entriesForDate.forEach(entry => {
    if (!entry || !entry.word) return;
    const word = String(entry.word).toLowerCase().trim();
    if (word) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);

      // Categorize
      const category = categorizeWord(word);
      categoryCounts[category]++;

      // Sentiment (use pattern if available, otherwise infer from word)
      if (entry.point) {
        // Try to infer from pattern structure
        const sentiment = computeSentiment(word, {
          positive: entry.point.Node || 0,
          negative: entry.point.Edge || 0,
          neutral: entry.point.Graph || 0,
        });
        sentimentCounts[sentiment]++;
      } else {
        sentimentCounts.ambiguous++;
      }
    }
  });

  const uniqueWords = wordFrequency.size;

  // Calculate top words with percentages
  const sortedWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100); // Top 100

  const topWords = sortedWords.map(([word, count]) => ({
    word,
    count,
    percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
  }));

  // Calculate sentiment percentages
  const totalSentiment = sentimentCounts.positive + sentimentCounts.negative + sentimentCounts.neutral + sentimentCounts.ambiguous;
  const sentiment = {
    positive: totalSentiment > 0 ? (sentimentCounts.positive / totalSentiment) * 100 : 0,
    negative: totalSentiment > 0 ? (sentimentCounts.negative / totalSentiment) * 100 : 0,
    neutral: totalSentiment > 0 ? (sentimentCounts.neutral / totalSentiment) * 100 : 0,
    ambiguous: totalSentiment > 0 ? (sentimentCounts.ambiguous / totalSentiment) * 100 : 0,
  };

  // Calculate category percentages
  const totalCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const categories = {
    existence: totalCategories > 0 ? (categoryCounts.existence / totalCategories) * 100 : 0,
    emotional: totalCategories > 0 ? (categoryCounts.emotional / totalCategories) * 100 : 0,
    abstract: totalCategories > 0 ? (categoryCounts.abstract / totalCategories) * 100 : 0,
    religious: totalCategories > 0 ? (categoryCounts.religious / totalCategories) * 100 : 0,
    negative: totalCategories > 0 ? (categoryCounts.negative / totalCategories) * 100 : 0,
    unknown: totalCategories > 0 ? (categoryCounts.unknown / totalCategories) * 100 : 0,
  };

  return {
    date,
    totalResponses,
    uniqueWords,
    topWords,
    wordFrequency,
    sentiment,
    categories,
    timestamp: Date.now(),
  };
}

/**
 * Computes personal metrics for the user
 */
export function computePersonalMetrics(
  userEntries: Perceptron[],
  allEntries: Perceptron[],
  _currentDay: number,
  todayEntry?: { word: string }
): PersonalMetrics {
  const todayDate = getTodayDate();
  const currentWord = todayEntry?.word?.toLowerCase().trim() || '';

  // Get today's metrics to find rank
  const todayMetrics = computeDailyMetrics(todayDate, allEntries);
  const wordRank = currentWord
    ? (todayMetrics.topWords.findIndex(w => w.word === currentWord) + 1 || 0)
    : 0;

  // Count others with same word
  const othersWithSameWord = todayMetrics.wordFrequency.get(currentWord) || 0;
  const isUnique = othersWithSameWord <= 1;

  // Track journey
  const journey = userEntries
    .filter(entry => entry && entry.day && entry.word && entry.timestamp)
    .sort((a, b) => (a.day || 0) - (b.day || 0))
    .map(entry => ({
      day: entry.day || 0,
      word: String(entry.word),
      timestamp: String(entry.timestamp),
    }));

  // Count unique vs repeated words
  const userWords = new Set(userEntries.map(e => e.word.toLowerCase().trim()));
  const uniqueWordCount = userWords.size;
  const repeatedWordCount = userEntries.length - uniqueWordCount;

  // Calculate streak (consecutive days with entries)
  let streak = 0;
  if (userEntries.length > 0) {
    const sortedEntries = userEntries.sort((a, b) => {
      const dateA = getDateFromTimestamp(a.timestamp);
      const dateB = getDateFromTimestamp(b.timestamp);
      return dateB.localeCompare(dateA); // Most recent first
    });

    let lastDate = getDateFromTimestamp(sortedEntries[0].timestamp);
    streak = 1;

    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = getDateFromTimestamp(sortedEntries[i].timestamp);
      const daysDiff = Math.abs(
        (parseDate(lastDate).getTime() - parseDate(entryDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        streak++;
        lastDate = entryDate;
      } else {
        break;
      }
    }
  }

  // Calculate percentile rank
  let percentileRank = 0;
  if (todayMetrics.totalResponses > 0 && wordRank > 0) {
    percentileRank = ((todayMetrics.topWords.length - wordRank + 1) / todayMetrics.topWords.length) * 100;
  }

  return {
    currentWord,
    wordRank,
    othersWithSameWord: Math.max(0, othersWithSameWord - (currentWord ? 1 : 0)), // Exclude self
    uniqueWordCount,
    repeatedWordCount,
    daysCompleted: userEntries.length,
    streak,
    journey,
    isUnique,
    percentileRank: Math.round(percentileRank),
  };
}

/**
 * Computes comparative metrics between today and yesterday
 */
export function computeComparativeMetrics(
  today: DailyMetrics,
  yesterday: DailyMetrics
): ComparativeMetrics {
  // Stability: % of top words that appear in both days
  const todayTopWords = new Set(today.topWords.slice(0, 10).map(w => w.word));
  const yesterdayTopWords = new Set(yesterday.topWords.slice(0, 10).map(w => w.word));

  let matchingWords = 0;
  todayTopWords.forEach(word => {
    if (yesterdayTopWords.has(word)) {
      matchingWords++;
    }
  });

  const stability = todayTopWords.size > 0 ? (matchingWords / Math.max(todayTopWords.size, yesterdayTopWords.size)) * 100 : 0;

  // Volatility: how much the distribution changed
  const volatility = Math.abs(today.uniqueWords - yesterday.uniqueWords) / Math.max(yesterday.totalResponses, 1) * 100;

  // New words rate: % of today's words that didn't appear yesterday
  let newWords = 0;
  today.wordFrequency.forEach((_, word) => {
    if (!yesterday.wordFrequency.has(word)) {
      newWords++;
    }
  });

  const newWordsRate = today.uniqueWords > 0 ? (newWords / today.uniqueWords) * 100 : 0;

  // Unity score: how concentrated are the top words? (0-100)
  // Higher = more people saying the same thing
  const top10Percentage = today.topWords.slice(0, 10).reduce((sum, w) => sum + w.percentage, 0);
  const unityScore = Math.min(100, top10Percentage * 2); // Scale so 50% top 10 = 100 unity

  // Convergence rate: are we getting more unified over time?
  const yesterdayTop10Percentage = yesterday.topWords.slice(0, 10).reduce((sum, w) => sum + w.percentage, 0);
  const convergenceRate = top10Percentage - yesterdayTop10Percentage;

  // Day-over-day changes
  const wordChanges = Math.abs(today.uniqueWords - yesterday.uniqueWords);
  const sentimentShift = today.sentiment.positive - yesterday.sentiment.positive;

  const categoryShift: Record<string, number> = {};
  Object.keys(today.categories).forEach(cat => {
    categoryShift[cat] = today.categories[cat as keyof typeof today.categories] - yesterday.categories[cat as keyof typeof yesterday.categories];
  });

  return {
    todayVsYesterday: {
      stability: Math.round(stability),
      volatility: Math.round(volatility),
      newWordsRate: Math.round(newWordsRate),
    },
    unityScore: Math.round(unityScore),
    convergenceRate: Math.round(convergenceRate * 100) / 100,
    dayOverDayChange: {
      wordChanges,
      sentimentShift: Math.round(sentimentShift * 100) / 100,
      categoryShift,
    },
  };
}


