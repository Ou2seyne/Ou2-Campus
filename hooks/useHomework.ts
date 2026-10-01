'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { HomeworkItem } from '@/types/schedule';

const STORAGE_KEY_HOMEWORK = 'pillcal_homeworks_v1';

const DEFAULT_SAMPLE_HOMEWORKS: HomeworkItem[] = [
  {
    id: 'hw-sample-1',
    courseTitle: 'Algorithmique et programmation 1',
    text: 'Préparer le TP 3 sur les pointeurs et tableaux dynamiques (Salle D004)',
    dueDate: '2026-10-05',
    isDone: false,
    createdAt: 1727690000000,
  },
  {
    id: 'hw-sample-2',
    courseTitle: 'Calculus 1',
    text: 'Faire les exercices 4 et 7 de la feuille de TD 2 (M. Baranek)',
    dueDate: '2026-10-02',
    isDone: false,
    createdAt: 1727680000000,
  },
];

let hwListeners: Array<() => void> = [];
function notifyHw() {
  hwListeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.warn(e);
    }
  });
}

function subscribeHw(listener: () => void) {
  hwListeners.push(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_HOMEWORK) {
      cachedHwRaw = null;
      listener();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    hwListeners = hwListeners.filter(fn => fn !== listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

let cachedHwRaw: string | null = null;
let cachedHwList: HomeworkItem[] = DEFAULT_SAMPLE_HOMEWORKS;

function getHomeworksSnapshot(): HomeworkItem[] {
  if (typeof window === 'undefined') return DEFAULT_SAMPLE_HOMEWORKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOMEWORK);
    if (raw !== cachedHwRaw) {
      cachedHwRaw = raw;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cachedHwList = parsed;
        } else {
          cachedHwList = DEFAULT_SAMPLE_HOMEWORKS;
        }
      } else {
        cachedHwList = DEFAULT_SAMPLE_HOMEWORKS;
      }
    }
  } catch {
    cachedHwList = DEFAULT_SAMPLE_HOMEWORKS;
  }
  return cachedHwList;
}

function getServerHomeworksSnapshot(): HomeworkItem[] {
  return DEFAULT_SAMPLE_HOMEWORKS;
}

export function useHomework() {
  const items = useSyncExternalStore(
    subscribeHw,
    getHomeworksSnapshot,
    getServerHomeworksSnapshot
  );

  const persist = useCallback((updated: HomeworkItem[]) => {
    cachedHwList = updated;
    try {
      const raw = JSON.stringify(updated);
      cachedHwRaw = raw;
      localStorage.setItem(STORAGE_KEY_HOMEWORK, raw);
    } catch (e) {
      console.warn(e);
    }
    notifyHw();
  }, []);

  const addHomework = useCallback((courseTitle: string, text: string, dueDate?: string) => {
    const newItem: HomeworkItem = {
      id: `hw-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      courseTitle,
      text: text.trim(),
      dueDate,
      isDone: false,
      createdAt: Date.now(),
    };
    persist([newItem, ...items]);
  }, [items, persist]);

  const toggleHomework = useCallback((id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, isDone: !item.isDone } : item
    );
    persist(updated);
  }, [items, persist]);

  const deleteHomework = useCallback((id: string) => {
    const updated = items.filter(item => item.id !== id);
    persist(updated);
  }, [items, persist]);

  // Pending count by course
  const pendingByCourse = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(item => {
      if (!item.isDone) {
        map[item.courseTitle] = (map[item.courseTitle] || 0) + 1;
      }
    });
    return map;
  }, [items]);

  const pendingCount = useMemo(() => {
    return items.filter(i => !i.isDone).length;
  }, [items]);

  const getHomeworksForCourse = useCallback((courseTitle: string) => {
    return items.filter(i => i.courseTitle.toLowerCase() === courseTitle.toLowerCase());
  }, [items]);

  return {
    items,
    pendingCount,
    pendingByCourse,
    addHomework,
    toggleHomework,
    deleteHomework,
    getHomeworksForCourse,
  };
}
