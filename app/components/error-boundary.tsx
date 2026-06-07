"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-6 text-sm">
              {this.state.error.message || "An unexpected error occurred"}
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors">
              Back to Search
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
