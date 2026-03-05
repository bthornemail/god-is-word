// ============================================================================
// ComparativeMetrics.tsx - Day-over-Day Comparison Widget
// ============================================================================

import React from 'react';
import type { ComparativeMetrics as ComparativeMetricsType } from '../lib/analytics/types';
import { TrendingUp, TrendingDown, Gauge, BarChart3 } from 'lucide-react';

interface ComparativeMetricsProps {
  metrics: ComparativeMetricsType | null;
}

export const ComparativeMetrics: React.FC<ComparativeMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="comparative-empty">
        <p>Need data from multiple days to show comparisons</p>
      </div>
    );
  }

  const { todayVsYesterday, unityScore, convergenceRate, dayOverDayChange } = metrics;

  // Gauge component for Unity Score
  const UnityGauge = ({ score }: { score: number }) => {
    const percentage = Math.min(100, Math.max(0, score));
    const angle = (percentage / 100) * 180; // 0-180 degrees for semicircle

    return (
      <div className="unity-gauge">
        <svg viewBox="0 0 200 120" className="gauge-svg">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="12"
          />
          {/* Filled arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeDasharray={`${(angle / 180) * 251} 251`}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
          </defs>
        </svg>
        <div className="gauge-value">{Math.round(score)}</div>
        <div className="gauge-label">Unity Score</div>
      </div>
    );
  };

  return (
    <div className="comparative-metrics">
      <h3 className="comparative-title">
        <BarChart3 className="w-5 h-5" />
        Day-over-Day Analysis
      </h3>

      {/* Unity Score */}
      <div className="unity-section">
        <UnityGauge score={unityScore} />
        <div className="unity-description">
          <p>
            <strong>Unity Score</strong> measures how much we agree.
          </p>
          <p className="unity-detail">
            {unityScore < 30 && 'High diversity - everyone says something different'}
            {unityScore >= 30 && unityScore < 60 && 'Moderate agreement - some common themes'}
            {unityScore >= 60 && 'Strong convergence - we\'re finding common ground'}
          </p>
        </div>
      </div>

      {/* Stability & Volatility */}
      <div className="stability-grid">
        <div className="metric-card">
          <div className="metric-header">
            <Gauge className="w-5 h-5" />
            <span>Stability</span>
          </div>
          <div className="metric-value">{todayVsYesterday.stability}%</div>
          <div className="metric-description">
            {todayVsYesterday.stability > 50
              ? 'Top words are consistent with yesterday'
              : 'Significant changes from yesterday'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <TrendingUp className="w-5 h-5" />
            <span>Volatility</span>
          </div>
          <div className="metric-value">{todayVsYesterday.volatility}%</div>
          <div className="metric-description">
            Rate of change in word diversity
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <BarChart3 className="w-5 h-5" />
            <span>New Words</span>
          </div>
          <div className="metric-value">{todayVsYesterday.newWordsRate}%</div>
          <div className="metric-description">
            Words appearing for the first time today
          </div>
        </div>
      </div>

      {/* Sentiment Shift */}
      <div className="sentiment-shift">
        <div className="shift-header">
          <span>Sentiment Shift</span>
          <div className={`shift-indicator ${dayOverDayChange.sentimentShift >= 0 ? 'positive' : 'negative'}`}>
            {dayOverDayChange.sentimentShift >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(dayOverDayChange.sentimentShift).toFixed(1)}%</span>
          </div>
        </div>
        <div className="shift-bar">
          <div
            className="shift-fill"
            style={{
              width: `${Math.min(100, Math.abs(dayOverDayChange.sentimentShift))}%`,
              backgroundColor: dayOverDayChange.sentimentShift >= 0 ? '#10b981' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Convergence Rate */}
      {Math.abs(convergenceRate) > 0.1 && (
        <div className="convergence-box">
          <div className="convergence-label">
            Convergence Rate: <strong>{convergenceRate > 0 ? '+' : ''}{convergenceRate.toFixed(2)}%</strong>
          </div>
          <div className="convergence-description">
            {convergenceRate > 0
              ? 'We\'re becoming more unified over time'
              : 'We\'re becoming more diverse over time'}
          </div>
        </div>
      )}

      <style>{`
        .comparative-metrics {
          background: rgba(30, 27, 75, 0.4);
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
        }

        .comparative-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #e0e7ff;
        }

        .unity-section {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .unity-gauge {
          position: relative;
          width: 200px;
          height: 120px;
          flex-shrink: 0;
        }

        .gauge-svg {
          width: 100%;
          height: 100%;
        }

        .gauge-value {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 32px;
          font-weight: 700;
          color: #f3f4f6;
        }

        .gauge-label {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #9ca3af;
        }

        .unity-description {
          flex: 1;
        }

        .unity-description p {
          margin-bottom: 8px;
          color: #c7d2fe;
        }

        .unity-detail {
          font-size: 14px;
          color: #9ca3af;
          font-style: italic;
        }

        .stability-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-card {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          padding: 16px;
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a78bfa;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #f3f4f6;
          margin-bottom: 8px;
        }

        .metric-description {
          font-size: 12px;
          color: #9ca3af;
        }

        .sentiment-shift {
          margin-bottom: 24px;
        }

        .shift-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          color: #e0e7ff;
          font-weight: 600;
        }

        .shift-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .shift-indicator.positive {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .shift-indicator.negative {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .shift-bar {
          width: 100%;
          height: 8px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .shift-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .convergence-box {
          padding: 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
        }

        .convergence-label {
          color: #93c5fd;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .convergence-description {
          color: #60a5fa;
          font-size: 14px;
          font-style: italic;
        }

        .comparative-empty {
          text-align: center;
          padding: 40px;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

