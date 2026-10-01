'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface FocusTrapOptions {
  /** When true, the trap is active. */
  active: boolean;
  /** Element to return focus to when trap deactivates. */
  returnFocus?: boolean;
  /** Close handler to call on Escape. */
  onClose?: () => void;
}

/**
 * useFocusTrap — traps keyboard focus within a container.
 * Returns a ref to attach to the container element.
 */
export function useFocusTrap<T extends HTMLElement>({
  active,
  returnFocus = true,
  onClose,
}: FocusTrapOptions) {
  const containerRef = useRef<T | null>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Capture the element that had focus before the trap opened
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement;
    }
  }, [active]);

  // Focus the first focusable element when trap activates
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const firstFocusable = getFirstFocusable(containerRef.current);
    firstFocusable?.focus();
  }, [active]);

  // Return focus on close
  useEffect(() => {
    if (!active && returnFocus && previousFocusRef.current) {
      (previousFocusRef.current as HTMLElement).focus?.();
    }
  }, [active, returnFocus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<T>) => {
      if (!active) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const currentFocus = document.activeElement;

      if (e.shiftKey) {
        if (currentFocus === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (currentFocus === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [active, onClose]
  );

  return { containerRef, handleKeyDown };
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest('[hidden]') && el.offsetParent !== null
  );
}

function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  return getFocusableElements(container)[0] ?? null;
}
