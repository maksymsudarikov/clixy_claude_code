import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#D8D9CF] flex items-center justify-center p-6 text-[#141413]">
          <div className="bg-white p-8 border border-[#141413] max-w-md w-full shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
            <h1 className="text-xl font-extrabold uppercase tracking-tight mb-4">System Error</h1>
            <p className="text-sm mb-6 font-mono text-red-600 bg-red-50 p-4 border border-red-200 break-words">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex justify-between items-center">
                <p className="text-xs uppercase tracking-widest text-[#9E9E98]">Studio Olga Prudka</p>
                <button
                onClick={() => window.location.reload()}
                className="bg-[#141413] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#9E9E98] transition-colors"
                >
                Reload App
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}