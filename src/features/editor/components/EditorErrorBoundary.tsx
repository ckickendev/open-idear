"use client";

import React, { Component } from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for the editor.
 *
 * If Tiptap or any editor component crashes (corrupt content, extension error),
 * this catches the error and shows a recovery UI instead of a white screen.
 */
export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Editor crashed:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-md w-full text-center space-y-4 p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-editor-danger)]/10 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--color-editor-text)]">
              Editor encountered an error
            </h2>
            <p className="text-sm text-[var(--color-editor-secondary)]">
              Something went wrong with the editor. Your content has been
              preserved. Try reloading.
            </p>
            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-[var(--color-editor-muted)] cursor-pointer hover:text-[var(--color-editor-secondary)]">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-[var(--color-editor-danger)] bg-[var(--color-editor-elevated)] p-3 rounded-lg overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 text-sm font-medium bg-[var(--color-editor-accent)] text-white rounded-lg hover:bg-[var(--color-editor-accent-hover)] transition-all duration-150 cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] rounded-lg hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
