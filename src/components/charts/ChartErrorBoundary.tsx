'use client';

import { Component, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-sm text-white/60">
                Unable to render chart. Try refreshing the page.
              </p>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}
