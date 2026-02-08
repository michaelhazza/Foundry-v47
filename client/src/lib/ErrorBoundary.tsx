import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>
              Something went wrong
            </h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              We're sorry, but something unexpected happened. Please try again.
            </p>
            {this.state.error && (
              <details
                style={{
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                  }}
                >
                  Error Details
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: '12px',
                    color: '#d32f2f',
                    margin: '10px 0',
                  }}
                >
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      fontSize: '12px',
                      color: '#666',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
