// Compile-time stub for the component borrowed from ../wepump.
//
// Vite still bundles and runs WePump's REAL LiveSniperFeed.tsx at runtime (the
// '@wepump' alias in vite.config.ts does that). This file only affects `tsc`.
//
// Why stub it instead of type-checking their source: WePump has no @types/react
// installed, so motion's prop types silently collapse to `any` in that project
// and its own type-check passes. With real React types, two latent type errors
// inside their file surface here. They are their bugs to fix, not ours to
// block on, and neither affects runtime:
//   - useSmoothWheelScroll(feedRef) gets RefObject<HTMLDivElement | null>
//   - `const EASE = [0.22, 1, 0.36, 1]` is number[], not a cubic-bezier tuple
// If we ever adopt their fixes upstream, delete this file and drop the paths
// entry in tsconfig.json.
import type { FC } from 'react';

export interface LiveSniperFeedProps {
  /** Declared by WePump but destructured as nothing — inert. */
  buyPrice?: number;
}

export declare const LiveSniperFeed: FC<LiveSniperFeedProps>;
