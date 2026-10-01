'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ArrowDown } from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 70;
const MAX_PULL = 110;

export function PullToRefresh({
  onRefresh,
  isRefreshing = false,
  children,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const hasTriggeredHaptic = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull if at the very top of the page
      if (window.scrollY <= 2) {
        touchStartY.current = e.touches[0].clientY;
        hasTriggeredHaptic.current = false;
      } else {
        touchStartY.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY.current;

      if (deltaY > 0 && window.scrollY <= 2) {
        // Damped pull distance
        const distance = Math.min(MAX_PULL, deltaY * 0.45);
        setPullDistance(distance);
        setIsPulling(true);

        // Haptic feedback right when passing threshold
        if (distance >= PULL_THRESHOLD && !hasTriggeredHaptic.current) {
          hasTriggeredHaptic.current = true;
          haptic.medium();
        } else if (distance < PULL_THRESHOLD && hasTriggeredHaptic.current) {
          hasTriggeredHaptic.current = false;
        }

        // Prevent native rubber band while pulling down
        if (e.cancelable && distance > 10) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    const handleTouchEnd = async () => {
      if (touchStartY.current === null) return;
      touchStartY.current = null;

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        haptic.success();
        setPullDistance(45);
        try {
          await onRefresh();
        } finally {
          setPullDistance(0);
          setIsPulling(false);
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  const rotation = Math.min(360, (pullDistance / PULL_THRESHOLD) * 360);
  const isReady = pullDistance >= PULL_THRESHOLD;

  return (
    <div className="relative w-full">
      {/* Visual Pull Indicator (Mobile only) */}
      {(isPulling || isRefreshing) && (
        <div
          className="sm:hidden absolute left-0 right-0 -top-12 z-30 flex items-center justify-center pointer-events-none transition-transform duration-75"
          style={{
            transform: `translateY(${isRefreshing ? 54 : pullDistance}px)`,
          }}
          aria-hidden="true"
        >
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-tactile-sm backdrop-blur-md"
            style={{
              background: 'var(--surface)',
              borderColor: isReady ? 'var(--accent)' : 'var(--border-2)',
              color: isReady ? 'var(--accent)' : 'var(--text)',
            }}
          >
            {isRefreshing ? (
              <>
                <RotateCw className="w-3.5 h-3.5 spinner text-[var(--accent)]" />
                <span className="text-[11px] font-mono font-700">Actualisation ADE…</span>
              </>
            ) : (
              <>
                {isReady ? (
                  <RotateCw
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                ) : (
                  <ArrowDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                )}
                <span className="text-[11px] font-mono font-700">
                  {isReady ? 'Relâcher pour actualiser' : 'Tirer pour actualiser'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="w-full transition-transform duration-100 ease-out"
        style={{
          transform: isPulling ? `translateY(${Math.min(24, pullDistance * 0.25)}px)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
