// ============================================================================
// types.ts - Analytics Type Definitions
// ============================================================================

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  totalResponses: number;
  uniqueWords: number;
  topWords: Array<{ word: string; count: number; percentage: number }>;
  wordFrequency: Map<string, number>;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    ambiguous: number;
  };
  categories: {
    existence: number;
    emotional: number;
    abstract: number;
    religious: number;
    negative: number;
    unknown: number;
  };
  timestamp: number;
}

export interface PersonalMetrics {
  currentWord: string;
  wordRank: number; // Position in top words (0 = not in top, 1 = first)
  othersWithSameWord: number;
  uniqueWordCount: number;
  repeatedWordCount: number;
  daysCompleted: number;
  streak: number; // Consecutive days
  journey: Array<{ day: number; word: string; timestamp: string }>;
  isUnique: boolean; // True if word only appears once today
  percentileRank: number; // Top X% (0-100)
}

export interface ComparativeMetrics {
  todayVsYesterday: {
    stability: number; // % of words matching yesterday (0-100)
    volatility: number; // Rate of change (0-100)
    newWordsRate: number; // % of words that are new today
  };
  unityScore: number; // 0-100, how much we agree
  convergenceRate: number; // Rate at which we're converging
  dayOverDayChange: {
    wordChanges: number; // Number of unique words changed
    sentimentShift: number; // Change in sentiment (-100 to 100)
    categoryShift: Record<string, number>; // Changes per category
  };
}

export type SentimentType = 'positive' | 'negative' | 'neutral' | 'ambiguous';
export type WordCategory = 'existence' | 'emotional' | 'abstract' | 'religious' | 'negative' | 'unknown';

