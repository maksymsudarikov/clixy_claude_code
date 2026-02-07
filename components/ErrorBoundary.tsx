import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error: _error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/#/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF] p-4">
          <div className="bg-white border-2 border-[#141413] p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-[#141413] uppercase tracking-tight mb-2">
                Something Went Wrong
              </h1>
              <p className="text-sm text-[#9E9E98]">
                The application encountered an unexpected error
              </p>
            </div>

            {/* Error Details (collapsed by default) */}
            {this.state.error && (
              <details className="mb-6 bg-[#F0F0EB] border border-[#9E9E98] p-4 text-xs">
                <summary className="cursor-pointer font-medium text-[#141413] mb-2 uppercase tracking-wider">
                  Error Details
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong className="text-[#141413]">Message:</strong>
                    <pre className="mt-1 text-[#9E9E98] overflow-x-auto whitespace-pre-wrap break-words">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong className="text-[#141413]">Stack:</strong>
                      <pre className="mt-1 text-[#9E9E98] overflow-x-auto whitespace-pre-wrap break-words text-[10px]">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-[#141413] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-white text-[#141413] px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#141413] hover:text-white border-2 border-[#141413] transition-colors"
              >
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-xs text-center text-[#9E9E98]">
              If this problem persists, contact{' '}
              <a
                href="mailto:art@olgaprudka.com"
                className="text-[#141413] hover:underline"
              >
                art@olgaprudka.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}