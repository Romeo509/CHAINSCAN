import { useEffect, RefObject } from 'react';

/**
 * Adds inertial (eased) mouse-wheel scrolling to an overflow container.
 *
 * A single requestAnimationFrame loop drives `scrollTop` toward an
 * accumulated target using frame-rate-independent exponential ease-out.
 * Successive wheel events add to the target instead of restarting the
 * animation, so trackpad momentum stays smooth and mouse notches glide.
 *
 * It only intercepts `wheel` events, so the native scrollbar and touch
 * scrolling keep working. At the top/bottom edges control is released so
 * the surrounding page can scroll normally (no trap).
 *
 * @param ref      Ref to the scrollable element (must have overflow-y: auto).
 * @param duration Approximate seconds to settle ~99% of the way. Lower = snappier.
 */
export function useSmoothWheelScroll(ref: RefObject<HTMLElement>, duration = 0.32) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect the OS "reduce motion" setting: leave native stepping.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let target = el.scrollTop;
    let raf = 0;
    let running = false;
    let last = 0;

    // Smoothing speed derived from duration (higher = faster settle).
    const speed = 6 / Math.max(duration, 0.05);

    const maxScroll = () => el.scrollHeight - el.clientHeight;
    const clamp = (v: number) => Math.max(0, Math.min(v, maxScroll()));

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      running = false;
      last = 0;
    };

    const tick = (t: number) => {
      if (!last) last = t;
      // Clamp dt so a background-tab stall doesn't cause a jump.
      const dt = Math.min((t - last) / 1000, 0.064);
      last = t;

      const current = el.scrollTop;
      const dist = target - current;
      if (Math.abs(dist) < 0.5) {
        el.scrollTop = target;
        stop();
        return;
      }

      // Exponential ease-out: cover a fixed fraction of the remaining
      // distance each frame, independent of frame rate.
      const factor = 1 - Math.exp(-dt * speed);
      el.scrollTop = current + dist * factor;
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      // Nothing to scroll, or a pinch/zoom gesture — let the browser handle it.
      if (e.ctrlKey || maxScroll() <= 0) return;

      const atTop = el.scrollTop <= 0 && e.deltaY < 0;
      const atBottom = el.scrollTop >= maxScroll() - 1 && e.deltaY > 0;
      if (atTop || atBottom) {
        // At an edge: release so the page scrolls instead of trapping the wheel.
        stop();
        target = el.scrollTop;
        return;
      }

      e.preventDefault();

      // Normalize across delta modes: 0 = px, 1 = lines (Firefox), 2 = pages.
      const step =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * el.clientHeight : e.deltaY;

      // Accumulate onto the current target so rapid events keep their momentum
      // instead of each restarting from the live position.
      target = clamp(target + step);
      if (!running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    // If the user drags the native scrollbar or touch-scrolls while idle,
    // resync the target so the next wheel gesture starts from the right place.
    const onScroll = () => {
      if (!running) {
        target = el.scrollTop;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
      stop();
    };
  }, [ref, duration]);
}
