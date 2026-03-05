// ============================================================================
// Widget.tsx - Reusable 7-Day God Mirror Widget Component
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';

interface WidgetProps {
  /** URL to the full app (for links) */
  appUrl?: string;
  /** Widget URL (for embed code) */
  widgetUrl?: string;
  /** Show embed button */
  showEmbed?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** Show link to full app */
  showFullAppLink?: boolean;
  /** Storage key prefix for answers */
  storageKey?: string;
  /** Callback when answer is saved */
  onSave?: (answer: string) => void;
}

export const Widget: React.FC<WidgetProps> = ({
  appUrl = 'https://bthornemail.github.io/god-is-word/',
  widgetUrl = typeof window !== 'undefined' ? window.location.href : '',
  showEmbed = true,
  showShare = true,
  showFullAppLink = true,
  storageKey = 'god_quick_answers',
  onSave
}) => {
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const embedCodeRef = useRef<HTMLTextAreaElement>(null);

  const saveAnswer = () => {
    const trimmed = answer.trim();
    
    if (!trimmed) {
      alert('Please enter an answer first');
      return;
    }
    
    // Get existing quick answers
    const existing = JSON.parse(
      localStorage.getItem(storageKey) || '[]'
    );
    
    // Add new answer with timestamp
    const newAnswer = {
      word: trimmed,
      timestamp: new Date().toISOString(),
      source: 'widget'
    };
    
    existing.push(newAnswer);
    localStorage.setItem(storageKey, JSON.stringify(existing));
    
    // Callback if provided
    if (onSave) {
      onSave(trimmed);
    }
    
    // Show success message
    setSaved(true);
    setAnswer('');
    
    // Hide message after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const shareAnswer = async () => {
    const trimmed = answer.trim();
    
    if (!trimmed) {
      alert('Please enter an answer first to share it');
      return;
    }
    
    const shareText = `God is ${trimmed}\n\nMy answer from The 7-Day God Mirror 🪞✨\n\nWhat do you think?\n${appUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The 7-Day God Mirror',
          text: shareText
        });
      } catch (err) {
        // User cancelled or error
        fallbackShare(shareText);
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 Share text copied to clipboard!\n\nPaste it anywhere to share your answer.');
    }).catch(() => {
      prompt('Copy this text to share:', text);
    });
  };

  const copyEmbedCode = () => {
    if (embedCodeRef.current) {
      embedCodeRef.current.select();
      navigator.clipboard.writeText(embedCodeRef.current.value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveAnswer();
    }
    if (e.key === 'Escape' && showEmbedModal) {
      setShowEmbedModal(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmbedModal) {
        setShowEmbedModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showEmbedModal]);

  const embedCode = `<!-- The 7-Day God Mirror Widget -->
<iframe 
    src="${widgetUrl}" 
    width="100%" 
    height="400" 
    frameborder="0"
    style="border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px;"
    title="The 7-Day God Mirror"
></iframe>`;

  return (
    <>
      <div className="widget-container">
        <div className="widget-header">
          <div className="widget-title">
            <span>✨</span>
            The 7-Day God Mirror
          </div>
          <div className="widget-subtitle">Answer honestly. Just one word.</div>
        </div>
        
        <div className="question-container">
          <span className="question-label">God is</span>
          <input
            type="text"
            className="answer-input"
            placeholder="your answer..."
            maxLength={50}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        {saved && (
          <div className="saved-message show">
            ✓ Your answer has been saved locally!
          </div>
        )}
        
        <div className="button-group">
          <button className="btn btn-primary" onClick={saveAnswer}>
            💾 Save Answer
          </button>
          
          {showShare && (
            <button className="btn btn-secondary" onClick={shareAnswer}>
              🔗 Share
            </button>
          )}
          
          {showEmbed && (
            <button className="btn btn-secondary" onClick={() => setShowEmbedModal(true)}>
              📋 Embed
            </button>
          )}
          
          {showFullAppLink && (
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ gridColumn: showEmbed || showShare ? 'span 2' : 'span 1' }}
            >
              📊 View Full App
            </a>
          )}
        </div>
        
        <div className="info-text">
          Your answer is saved only on your device.<br />
          Complete all 7 days in the full app to see patterns.
        </div>
      </div>

      {/* Embed Modal */}
      {showEmbedModal && (
        <div
          className="widget-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEmbedModal(false);
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Embed This Widget</div>
              <button className="modal-close" onClick={() => setShowEmbedModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-text">
                Copy and paste this code into your website:
              </p>
              <textarea
                ref={embedCodeRef}
                className="widget-textarea"
                readOnly
                value={embedCode}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '12px' }}
                onClick={copyEmbedCode}
              >
                📋 Copy to Clipboard
              </button>
              {copied && (
                <div className="saved-message show" style={{ marginTop: '12px' }}>
                  ✓ Copied!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .widget-container {
          background: rgba(255, 255, 255, 0.97);
          border-radius: 12px;
          padding: 24px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .widget-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .widget-title {
          font-size: 22px;
          font-weight: 700;
          color: #1e1b4b;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .widget-subtitle {
          font-size: 13px;
          color: #6b7280;
        }
        
        .question-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .question-label {
          font-size: 18px;
          font-weight: 600;
          color: #312e81;
          white-space: nowrap;
        }
        
        .answer-input {
          flex: 1;
          padding: 10px 14px;
          font-size: 16px;
          border: 2px solid #8b5cf6;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease;
        }
        
        .answer-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .answer-input::placeholder {
          color: #9ca3af;
          font-style: italic;
        }
        
        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .btn {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          grid-column: span 2;
        }
        
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        
        .btn-secondary {
          background: #f3f4f6;
          color: #1e1b4b;
          border: 1px solid #e5e7eb;
        }
        
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        
        .saved-message {
          background: #10b981;
          color: white;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
          font-size: 14px;
          margin-bottom: 12px;
          display: none;
          animation: slideIn 0.3s ease;
        }
        
        .saved-message.show {
          display: block;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .info-text {
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
          line-height: 1.5;
        }
        
        .widget-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e1b4b;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .modal-close:hover {
          background: #f3f4f6;
          color: #1e1b4b;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-text {
          margin-bottom: 12px;
          color: #6b7280;
          font-size: 13px;
        }
        
        .widget-textarea {
          width: 100%;
          height: 140px;
          padding: 10px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 11px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          resize: vertical;
          background: #f9fafb;
          color: #1e1b4b;
          line-height: 1.4;
        }
        
        .widget-textarea:focus {
          outline: none;
          border-color: #8b5cf6;
        }
        
        @media (max-width: 480px) {
          .widget-container {
            padding: 20px;
          }
          
          .question-container {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
          }
          
          .question-label {
            font-size: 16px;
          }
          
          .button-group {
            grid-template-columns: 1fr;
          }
          
          .btn-primary {
            grid-column: span 1;
          }
        }
      `}</style>
    </>
  );
};

