"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (error.message?.includes('removeChild')) {
      console.warn('DOM removal error caught and handled');
      this.setState({ hasError: false });
      return;
    }
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{display: 'none'}} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;