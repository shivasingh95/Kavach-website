"use client";
// frontend/components/shared/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const isDev = process.env.NODE_ENV === "development";

    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
          <ShieldAlert className="text-red-400" size={28} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-2 max-w-md">
          An unexpected error occurred. Try refreshing or click below to retry.
        </p>
        {isDev && this.state.error && (
          <pre className="mt-2 mb-4 text-left text-xs text-red-300 bg-red-500/5 border border-red-500/20 rounded-lg p-3 max-w-lg overflow-x-auto whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
        )}
        <button
          onClick={this.handleReset}
          className="flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    );
  }
}
