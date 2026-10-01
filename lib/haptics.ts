/**
 * Aura Campus — Native Mobile Haptic Feedback Helper
 * Uses navigator.vibrate where supported (Android, PWA, Chrome Mobile)
 * Safely degrades on unsupported devices (e.g. iOS Safari web without Taptic API)
 */

export const haptic = {
  tap: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // Ignore silent vibration errors
      }
    }
  },

  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore
      }
    }
  },

  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(22);
      } catch {
        // Ignore
      }
    }
  },

  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10, 40, 15]);
      } catch {
        // Ignore
      }
    }
  },

  warning: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 50, 25]);
      } catch {
        // Ignore
      }
    }
  },
};
