'use client';

import { useCallback, useRef } from 'react';

interface SwipeOptions {
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Minimum px of swipe distance to trigger, default 70 */
  threshold?: number;
}

/**
 * useSwipe — touch gesture hook for swipe detection.
 * Returns onTouchStart/Move/End handlers to attach to elements.
 */
export function useSwipe({
  onSwipeDown,
  onSwipeUp,
  onSwipeLeft,
  onSwipeRight,
  threshold = 70,
}: SwipeOptions) {
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback(() => {
    // passthrough — we detect on end
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!startPos.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startPos.current.x;
      const dy = touch.clientY - startPos.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      startPos.current = null;

      if (absDy > absDx) {
        // Vertical swipe
        if (dy > threshold)  onSwipeDown?.();
        if (dy < -threshold) onSwipeUp?.();
      } else {
        // Horizontal swipe
        if (dx > threshold)  onSwipeRight?.();
        if (dx < -threshold) onSwipeLeft?.();
      }
    },
    [onSwipeDown, onSwipeUp, onSwipeLeft, onSwipeRight, threshold]
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}
