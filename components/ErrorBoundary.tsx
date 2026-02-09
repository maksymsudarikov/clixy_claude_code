import React, { ReactNode, useEffect, useState } from 'react';

interface Props {
  children: ReactNode;
}

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      setError(event.error || new Error(event.message || 'Unknown runtime error'));
      if (event.filename) {
        setErrorInfo(`${event.filename}:${event.lineno}:${event.colno}`);
      }
      event.preventDefault();
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error
        ? event.reason
        : new Error(typeof event.reason === 'string' ? event.reason : 'Unhandled promise rejection');
      setError(reason);
      setErrorInfo('Unhandled Promise Rejection');
      event.preventDefault();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/#/';
  };

  if (!error) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF] p-4">
      <div className="bg-white border-2 border-[#141413] p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#141413] uppercase tracking-tight mb-2">
            Something Went Wrong
          </h1>
          <p className="text-sm text-[#9E9E98]">
            The application encountered an unexpected error
          </p>
        </div>

        <details className="mb-6 bg-[#F0F0EB] border border-[#9E9E98] p-4 text-xs">
          <summary className="cursor-pointer font-medium text-[#141413] mb-2 uppercase tracking-wider">
            Error Details
          </summary>
          <div className="mt-2 space-y-2">
            <div>
              <strong className="text-[#141413]">Message:</strong>
              <pre className="mt-1 text-[#9E9E98] overflow-x-auto whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </div>
            {errorInfo && (
              <div>
                <strong className="text-[#141413]">Context:</strong>
                <pre className="mt-1 text-[#9E9E98] overflow-x-auto whitespace-pre-wrap break-words text-[10px]">
                  {errorInfo}
                </pre>
              </div>
            )}
          </div>
        </details>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReload}
            className="flex-1 bg-[#141413] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 bg-white text-[#141413] px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#141413] hover:text-white border-2 border-[#141413] transition-colors"
          >
            Go Home
          </button>
        </div>

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
};
