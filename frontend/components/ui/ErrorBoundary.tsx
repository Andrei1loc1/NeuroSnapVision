"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-200/50">
              <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-700">Ceva n-a mers bine</p>
            <p className="mt-1 text-xs text-zinc-400">Încearcă să reîncarci pagina</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 rounded-full bg-zinc-900/5 px-4 py-2 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-900/10 active:scale-95"
            >
              Reîncearcă
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;