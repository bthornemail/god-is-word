// ============================================================================
// ErrorBoundary.tsx - React Error Boundary for Production Error Handling
// ============================================================================

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging (client-side only, no external service)
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, you could send to an error reporting service here
    // For client-side only, we just log to console
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>The application encountered an unexpected error.</p>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary"
              >
                Reload Page
              </button>
            </div>
          </div>

          <style>{`
            .error-boundary-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            }

            .error-boundary-content {
              background: rgba(255, 255, 255, 0.95);
              border-radius: 12px;
              padding: 32px;
              max-width: 600px;
              width: 100%;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              text-align: center;
            }

            .error-boundary-content h2 {
              color: #dc2626;
              margin-bottom: 16px;
              font-size: 24px;
            }

            .error-boundary-content p {
              color: #6b7280;
              margin-bottom: 24px;
            }

            .error-details {
              text-align: left;
              margin: 24px 0;
              padding: 16px;
              background: #f3f4f6;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #1e1b4b;
              margin-bottom: 12px;
            }

            .error-details pre {
              font-family: 'Monaco', 'Courier New', monospace;
              font-size: 12px;
              color: #dc2626;
              white-space: pre-wrap;
              word-wrap: break-word;
              overflow-x: auto;
            }

            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              margin-top: 24px;
            }

            .btn {
              padding: 12px 24px;
              font-size: 16px;
              font-weight: 600;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .btn-primary {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              color: white;
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
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

