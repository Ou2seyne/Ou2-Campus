/**
 * lib/idb.ts — IndexedDB typed repository for Aura Campus.
 * Uses the `idb` library for promise-based access.
 * Stores: homework, schedule events cache.
 * Includes migration from existing localStorage keys.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { HomeworkItem, ScheduleEvent, SavedSchedule } from '@/types/schedule';

const DB_NAME    = 'aura-campus-db';
const DB_VERSION = 1;

interface AuraCampusDB extends DBSchema {
  homework: {
    key: string;
    value: HomeworkItem;
    indexes: { 'by-course': string; 'by-done': number };
  };
  'schedule-cache': {
    key: string; // scheduleId
    value: {
      scheduleId: string;
      events: ScheduleEvent[];
      fetchedAt: string;
    };
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
}

let dbPromise: Promise<IDBPDatabase<AuraCampusDB>> | null = null;

function getDb(): Promise<IDBPDatabase<AuraCampusDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available on the server.'));
  }
  if (!dbPromise) {
    dbPromise = openDB<AuraCampusDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Homework store
        if (!db.objectStoreNames.contains('homework')) {
          const hwStore = db.createObjectStore('homework', { keyPath: 'id' });
          hwStore.createIndex('by-course', 'courseTitle');
          hwStore.createIndex('by-done', 'isDone');
        }
        // Schedule cache store
        if (!db.objectStoreNames.contains('schedule-cache')) {
          db.createObjectStore('schedule-cache', { keyPath: 'scheduleId' });
        }
        // Generic settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

/* ── Homework Repository ──────────────────────────────────── */

export const homeworkRepo = {
  async getAll(): Promise<HomeworkItem[]> {
    const db = await getDb();
    return db.getAll('homework');
  },

  async put(item: HomeworkItem): Promise<void> {
    const db = await getDb();
    await db.put('homework', item);
  },

  async putMany(items: HomeworkItem[]): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('homework', 'readwrite');
    await Promise.all([...items.map((item) => tx.store.put(item)), tx.done]);
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('homework', id);
  },

  async clear(): Promise<void> {
    const db = await getDb();
    await db.clear('homework');
  },
};

/* ── Schedule Cache Repository ───────────────────────────── */

export const scheduleCacheRepo = {
  async get(scheduleId: string): Promise<{ events: ScheduleEvent[]; fetchedAt: string } | null> {
    const db = await getDb();
    const entry = await db.get('schedule-cache', scheduleId);
    if (!entry) return null;
    return { events: entry.events, fetchedAt: entry.fetchedAt };
  },

  async put(scheduleId: string, events: ScheduleEvent[], fetchedAt: string): Promise<void> {
    const db = await getDb();
    await db.put('schedule-cache', { scheduleId, events, fetchedAt });
  },

  async delete(scheduleId: string): Promise<void> {
    const db = await getDb();
    await db.delete('schedule-cache', scheduleId);
  },
};

/* ── Settings Repository ─────────────────────────────────── */

export const settingsRepo = {
  async get<T>(key: string): Promise<T | null> {
    const db = await getDb();
    const entry = await db.get('settings', key);
    return entry ? (entry.value as T) : null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    const db = await getDb();
    await db.put('settings', { key, value });
  },

  async delete(key: string): Promise<void> {
    const db = await getDb();
    await db.delete('settings', key);
  },
};

/* ── Migration from localStorage ────────────────────────── */

const OLD_HW_KEY   = 'pillcal_homeworks_v1';
const OLD_CACHE_PREFIX = 'pillcal_events_cache_';

/**
 * migrateFromLocalStorage — runs once on first launch with IndexedDB.
 * Copies existing homework and schedule caches from localStorage → IndexedDB.
 * Removes the old keys after a successful migration.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  const migrated = localStorage.getItem('aura_idb_migrated_v1');
  if (migrated === '1') return;

  try {
    // 1. Migrate homework
    const rawHw = localStorage.getItem(OLD_HW_KEY);
    if (rawHw) {
      const items: HomeworkItem[] = JSON.parse(rawHw);
      if (Array.isArray(items) && items.length > 0) {
        await homeworkRepo.putMany(items);
        // Keep localStorage as backup until we're sure — remove after 1 day
        setTimeout(() => {
          try { localStorage.removeItem(OLD_HW_KEY); } catch {}
        }, 24 * 60 * 60 * 1000);
      }
    }

    // 2. Migrate schedule event caches
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(OLD_CACHE_PREFIX)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const scheduleId = k.replace(OLD_CACHE_PREFIX, '');
          const parsed = JSON.parse(raw);
          if (parsed.events && parsed.fetchedAt) {
            await scheduleCacheRepo.put(scheduleId, parsed.events, parsed.fetchedAt);
          }
        }
        keysToRemove.push(k);
      }
    }

    localStorage.setItem('aura_idb_migrated_v1', '1');

    // Remove old cache keys after migration
    setTimeout(() => {
      keysToRemove.forEach((k) => {
        try { localStorage.removeItem(k); } catch {}
      });
    }, 24 * 60 * 60 * 1000);
  } catch (err) {
    console.warn('[Aura] IndexedDB migration failed, falling back to localStorage:', err);
  }
}
