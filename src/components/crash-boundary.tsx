"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; label?: string };
type State = { crashed: boolean; resetKey: number };

/**
 * Recovers from client-side crashes (e.g. a browser auto-translate extension
 * rewriting DOM nodes React manages). Instead of the Next.js error page, the
 * broken subtree is remounted with a fresh key so copy + translation keep working.
 */
export class CrashBoundary extends Component<Props, State> {
  state: State = { crashed: false, resetKey: 0 };
  private timer: ReturnType<typeof setTimeout> | null = null;
  private rapidCrashes = 0;
  private lastCrashAt = 0;

  static getDerivedStateFromError(): Partial<State> {
    return { crashed: true };
  }

  componentDidCatch() {
    // Guard against an endless crash loop: if crashes keep firing within a
    // second of each other, bail out of the remount cycle and render the
    // children as-is (the browser's own recovery is the last resort).
    const now = Date.now();
    this.rapidCrashes = now - this.lastCrashAt < 1000 ? this.rapidCrashes + 1 : 0;
    this.lastCrashAt = now;
    if (this.rapidCrashes > 4) {
      this.setState({ crashed: false });
      return;
    }
    // Remount children on the next tick — a fresh tree detaches from any
    // DOM nodes the translator rewrote, instead of patching them in place.
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState((s) => ({ crashed: false, resetKey: s.resetKey + 1 }));
    }, 50);
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer);
  }

  render() {
    if (this.state.crashed) return null;
    return <div key={this.state.resetKey} style={{ display: "contents" }}>{this.props.children}</div>;
  }
}
