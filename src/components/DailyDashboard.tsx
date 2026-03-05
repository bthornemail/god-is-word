// ============================================================================
// DailyDashboard.tsx - Main Analytics Dashboard
// ============================================================================

import React from 'react';
import type { Perceptron } from '../lib/perceptron/types';
import { useAnalytics } from '../hooks/useAnalytics';
import { WordCloud } from './WordCloud';
import { PersonalStats } from './PersonalStats';
import { ComparativeMetrics } from './ComparativeMetrics';
import { Activity, Users, TrendingUp } from 'lucide-react';

interface CollectiveSignature {
  entries: Perceptron[];
  pattern?: { positive: number; negative: number; neutral: number };
}

interface TodayEntry {
  word: string;
  content: string;
  type: string;
  triples: any[];
}

interface DailyDashboardProps {
  userEntries: Perceptron[];
  collectiveData: CollectiveSignature[];
  currentDay: number;
  todayEntry?: TodayEntry;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({
  userEntries,
  collectiveData,
  currentDay,
  todayEntry,
}) => {
  const { dailyMetrics, personalMetrics, comparativeMetrics, isLoading } = useAnalytics(
    userEntries,
    collectiveData,
    currentDay,
    todayEntry
  );

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Activity className="w-8 h-8 animate-spin" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!dailyMetrics) {
    return (
      <div className="dashboard-empty">
        <Users className="w-12 h-12" />
        <h3>No Data Available</h3>
        <p>Complete your journal entries or import collective data to see analytics.</p>
      </div>
    );
  }

  const wordCloudData = dailyMetrics.topWords
    .slice(0, 50)
    .map(w => ({ word: w.word, count: w.count }));

  return (
    <div className="daily-dashboard">
      {/* Header Stats */}
      <div className="dashboard-header">
        <div className="header-stat">
          <div className="stat-icon">
            <Users className="w-6 h-6" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{dailyMetrics.totalResponses}</div>
            <div className="stat-label">Total Responses Today</div>
          </div>
        </div>

        <div className="header-stat">
          <div className="stat-icon">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-info">
            <div className="stat-value">{dailyMetrics.uniqueWords}</div>
            <div className="stat-label">Unique Words</div>
          </div>
        </div>

        {comparativeMetrics && (
          <div className="header-stat highlight">
            <div className="stat-icon">
              <Activity className="w-6 h-6" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{comparativeMetrics.unityScore}</div>
              <div className="stat-label">Unity Score</div>
            </div>
          </div>
        )}
      </div>

      {/* Top Words List */}
      <div className="top-words-section">
        <h3 className="section-title">Today's Top 10 Words</h3>
        <div className="top-words-list">
          {dailyMetrics.topWords.slice(0, 10).map((word, idx) => (
            <div key={word.word} className="top-word-item">
              <div className="word-rank">#{idx + 1}</div>
              <div className="word-name">{word.word}</div>
              <div className="word-count">{word.count}</div>
              <div className="word-percentage">
                <div className="percentage-bar">
                  <div
                    className="percentage-fill"
                    style={{ width: `${word.percentage}%` }}
                  />
                </div>
                <span>{word.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Word Cloud */}
      {wordCloudData.length > 0 && (
        <div className="word-cloud-section">
          <h3 className="section-title">Live Word Cloud</h3>
          <WordCloud words={wordCloudData} maxWords={50} animate={true} />
        </div>
      )}

      {/* Personal Stats */}
      <PersonalStats metrics={personalMetrics} currentDay={currentDay} />

      {/* Comparative Metrics */}
      <ComparativeMetrics metrics={comparativeMetrics} />

      <style>{`
        .daily-dashboard {
          padding: 20px;
        }

        .dashboard-header {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .header-stat {
          background: rgba(30, 27, 75, 0.4);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-stat.highlight {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .stat-icon {
          color: #a78bfa;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #f3f4f6;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #9ca3af;
        }

        .top-words-section {
          background: rgba(30, 27, 75, 0.4);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #e0e7ff;
          margin-bottom: 20px;
        }

        .top-words-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .top-word-item {
          display: grid;
          grid-template-columns: 40px 1fr 80px 150px;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          transition: background 0.2s;
        }

        .top-word-item:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .word-rank {
          font-size: 18px;
          font-weight: 700;
          color: #a78bfa;
        }

        .word-name {
          font-size: 16px;
          font-weight: 600;
          color: #f3f4f6;
          text-transform: capitalize;
        }

        .word-count {
          font-size: 14px;
          color: #9ca3af;
          text-align: right;
        }

        .word-percentage {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .percentage-bar {
          flex: 1;
          height: 6px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .percentage-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          transition: width 0.5s ease;
        }

        .word-percentage span {
          font-size: 12px;
          color: #9ca3af;
          min-width: 45px;
          text-align: right;
        }

        .word-cloud-section {
          margin-bottom: 32px;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: #9ca3af;
        }

        .dashboard-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          text-align: center;
          color: #9ca3af;
        }

        .dashboard-empty h3 {
          font-size: 24px;
          color: #e0e7ff;
          margin: 16px 0 8px;
        }

        .dashboard-empty p {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

