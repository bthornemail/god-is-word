// ============================================================================
// WordCloud.tsx - Word Cloud Visualization Component
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';

interface WordCloudProps {
  words: Array<{ word: string; count: number }>;
  maxWords?: number;
  animate?: boolean;
  onWordClick?: (word: string) => void;
  width?: number;
  height?: number;
}

export const WordCloud: React.FC<WordCloudProps> = ({
  words,
  maxWords = 50,
  animate = true,
  onWordClick,
  width = 600,
  height = 400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayedWords, setDisplayedWords] = useState<typeof words>([]);

  // Sort and limit words
  const sortedWords = words
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, maxWords);

  // Handle empty case
  if (sortedWords.length === 0) {
    return (
      <div className="word-cloud-empty">
        <p>No words to display</p>
      </div>
    );
  }

  // Calculate size scale (log scale for better distribution)
  const maxCount = sortedWords[0]?.count || 1;
  const minCount = sortedWords[sortedWords.length - 1]?.count || 1;

  const getFontSize = (count: number): number => {
    const logMax = Math.log(maxCount);
    const logMin = Math.log(minCount);
    const logCount = Math.log(count);
    const ratio = (logCount - logMin) / (logMax - logMin);
    return Math.max(12, 12 + ratio * 48); // 12px to 60px
  };

  // Animate words appearing
  useEffect(() => {
    if (!animate) {
      setDisplayedWords(sortedWords);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < sortedWords.length) {
        setDisplayedWords(sortedWords.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [sortedWords, animate]);

  // Render word cloud
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Simple word placement algorithm
    const placed: Array<{ x: number; y: number; width: number; height: number }> = [];
    const padding = 10;

    displayedWords.forEach((item) => {
      const fontSize = getFontSize(item.count);
      ctx.font = `${fontSize}px sans-serif`;
      const metrics = ctx.measureText(item.word);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      // Try to find a position
      let placedFlag = false;
      let attempts = 0;
      const maxAttempts = 50;

      while (!placedFlag && attempts < maxAttempts) {
        const x = Math.random() * (width - textWidth);
        const y = fontSize + Math.random() * (height - fontSize);

        // Check collision
        const collision = placed.some(p => {
          return !(
            x + textWidth + padding < p.x ||
            x > p.x + p.width + padding ||
            y + textHeight + padding < p.y ||
            y > p.y + p.height + padding
          );
        });

        if (!collision) {
          // Set color based on frequency (bright = more frequent)
          const intensity = item.count / maxCount;
          const hue = 240 - intensity * 60; // Blue to purple gradient
          ctx.fillStyle = `hsl(${hue}, 70%, ${50 + intensity * 20}%)`;
          ctx.fillText(item.word, x, y);

          placed.push({ x, y, width: textWidth, height: textHeight });
          placedFlag = true;
        }
        attempts++;
      }
    });
  }, [displayedWords, width, height]);

  return (
    <div className="word-cloud-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={() => {
          if (onWordClick && displayedWords.length > 0) {
            // Simple click detection - click anywhere on canvas to select first word
            // In production, implement proper hit testing
            onWordClick(displayedWords[0].word);
          }
        }}
        style={{ cursor: onWordClick ? 'pointer' : 'default', width: '100%', height: 'auto' }}
        className="word-cloud-canvas"
      />
      <style>{`
        .word-cloud-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background: rgba(30, 27, 75, 0.3);
          border-radius: 12px;
          overflow: hidden;
        }
        .word-cloud-canvas {
          max-width: 100%;
          height: auto;
        }
        .word-cloud-empty {
          text-align: center;
          padding: 40px;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

