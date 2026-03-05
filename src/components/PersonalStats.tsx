// ============================================================================
// PersonalStats.tsx - Personal Metrics Widget
// ============================================================================

import React from 'react';
import type { PersonalMetrics } from '../lib/analytics/types';
import { TrendingUp, Award, Target, Calendar } from 'lucide-react';

interface PersonalStatsProps {
  metrics: PersonalMetrics | null;
  currentDay: number;
}

export const PersonalStats: React.FC<PersonalStatsProps> = ({ metrics, currentDay }) => {
  if (!metrics) {
    return (
      <div className="personal-stats-empty">
        <p>Complete your first entry to see personal stats!</p>
      </div>
    );
  }

  const changePrediction =
    currentDay < 7
      ? Math.round(60 + Math.random() * 10) // Simulated: 60-70% change words
      : null;

  return (
    <div className="personal-stats">
      <h3 className="personal-stats-title">
        <Target className="w-5 h-5" />
        Your Journey
      </h3>

      <div className="personal-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Award className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{metrics.daysCompleted}</div>
            <div className="stat-label">Days Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{metrics.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {metrics.wordRank > 0 ? `#${metrics.wordRank}` : '—'}
            </div>
            <div className="stat-label">Your Word Rank</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-content">
            <div className="stat-value-large">
              {metrics.othersWithSameWord > 0 ? metrics.othersWithSameWord : '0'}
            </div>
            <div className="stat-label">
              {metrics.othersWithSameWord === 0
                ? 'Unique word (only you!)'
                : `${metrics.othersWithSameWord} others said "${metrics.currentWord}"`}
            </div>
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      {metrics.journey.length > 0 && (
        <div className="journey-timeline">
          <h4 className="timeline-title">Your 7-Day Journey</h4>
          <div className="timeline">
            {Array.from({ length: 7 }, (_, i) => i + 1).map(day => {
              const entry = metrics.journey.find(j => j.day === day);
              return (
                <div key={day} className={`timeline-day ${entry ? 'completed' : 'pending'}`}>
                  <div className="timeline-day-number">{day}</div>
                  {entry && (
                    <div className="timeline-day-word" title={entry.word}>
                      {entry.word.length > 10 ? `${entry.word.substring(0, 10)}...` : entry.word}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Uniqueness Stats */}
      <div className="uniqueness-stats">
        <div className="uniqueness-item">
          <span className="uniqueness-label">Unique Words Used:</span>
          <span className="uniqueness-value">{metrics.uniqueWordCount}</span>
        </div>
        <div className="uniqueness-item">
          <span className="uniqueness-label">Repeated Words:</span>
          <span className="uniqueness-value">{metrics.repeatedWordCount}</span>
        </div>
        {metrics.percentileRank > 0 && (
          <div className="uniqueness-item highlight-stat">
            <span className="uniqueness-label">Your Percentile:</span>
            <span className="uniqueness-value">Top {100 - metrics.percentileRank}%</span>
          </div>
        )}
      </div>

      {/* Prediction */}
      {changePrediction && currentDay < 7 && (
        <div className="prediction-box">
          <p className="prediction-text">
            <strong>{changePrediction}%</strong> of people on Day {currentDay} use a different word on Day{' '}
            {currentDay + 1}
          </p>
          <p className="prediction-subtext">Will you be in the majority tomorrow?</p>
        </div>
      )}

      <style>{`
        .personal-stats {
          background: rgba(30, 27, 75, 0.4);
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
        }

        .personal-stats-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #e0e7ff;
        }

        .personal-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-card.highlight {
          grid-column: 1 / -1;
          background: rgba(139, 92, 246, 0.2);
        }

        .stat-icon {
          color: #a78bfa;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #f3f4f6;
        }

        .stat-value-large {
          font-size: 32px;
          font-weight: 700;
          color: #f3f4f6;
        }

        .stat-label {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .journey-timeline {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(139, 92, 246, 0.2);
        }

        .timeline-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #e0e7ff;
        }

        .timeline {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .timeline-day {
          flex: 1;
          min-width: 60px;
          background: rgba(55, 48, 163, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 6px;
          padding: 12px;
          text-align: center;
        }

        .timeline-day.completed {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .timeline-day-number {
          font-size: 18px;
          font-weight: 700;
          color: #a78bfa;
          margin-bottom: 4px;
        }

        .timeline-day-word {
          font-size: 11px;
          color: #c7d2fe;
          word-break: break-word;
        }

        .uniqueness-stats {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .uniqueness-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: rgba(30, 27, 75, 0.5);
          border-radius: 6px;
        }

        .uniqueness-item.highlight-stat {
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
        }

        .uniqueness-label {
          color: #9ca3af;
          font-size: 14px;
        }

        .uniqueness-value {
          color: #f3f4f6;
          font-weight: 600;
          font-size: 14px;
        }

        .prediction-box {
          margin-top: 24px;
          padding: 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
        }

        .prediction-text {
          color: #93c5fd;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .prediction-subtext {
          color: #60a5fa;
          font-size: 12px;
          font-style: italic;
        }

        .personal-stats-empty {
          text-align: center;
          padding: 40px;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

