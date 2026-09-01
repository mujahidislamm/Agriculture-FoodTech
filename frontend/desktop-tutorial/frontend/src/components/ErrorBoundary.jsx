import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <div className="text-5xl">⚠️</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Something went wrong</h1>
            <p className="text-gray-600 text-center mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <details className="mb-6 text-sm text-gray-500 bg-gray-50 p-4 rounded">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">Error details</summary>
              <pre className="overflow-auto max-h-48 text-xs mt-2">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
