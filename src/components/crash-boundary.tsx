"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { crashed: boolean };

/**
 * Recovers from client-side crashes (e.g. a browser auto-translate extension
 * rewriting DOM nodes React manages). Instead of the Next.js error page, the
 * broken subtree is reset in place so translation + copying keep working.
 */
export class CrashBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Recovered client error:", error);
  }

  componentDidUpdate(_: Props, prev: State) {
    if (this.state.crashed && !prev.crashed) {
      // Auto-recover on the next tick so the UI never stays on an error page.
      requestAnimationFrame(() => this.setState({ crashed: false }));
    }
  }

  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}
