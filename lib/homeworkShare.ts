/**
 * Compressed P2P Homework Sharing via lz-string
 * Generates compact shareable URLs that work entirely client-side without a database.
 */

import LZString from 'lz-string';
import { HomeworkItem } from '@/types/schedule';

export interface SharedHomeworkPayload {
  version: 1;
  createdAt: number;
  items: Array<{
    courseTitle: string;
    text: string;
    dueDate?: string;
  }>;
}

/**
 * Compresses an array of homework items into an encoded URI component.
 */
export function encodeHomeworkShare(items: HomeworkItem[]): string {
  const payload: SharedHomeworkPayload = {
    version: 1,
    createdAt: Date.now(),
    items: items.map(item => ({
      courseTitle: item.courseTitle,
      text: item.text,
      dueDate: item.dueDate,
    })),
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

/**
 * Decodes and validates a compressed homework share string.
 */
export function decodeHomeworkShare(encoded: string): SharedHomeworkPayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const data = JSON.parse(json) as SharedHomeworkPayload;
    if (data && data.version === 1 && Array.isArray(data.items)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generates the full share URL for the current window.
 */
export function generateHomeworkShareUrl(items: HomeworkItem[]): string {
  if (typeof window === 'undefined') return '';
  const code = encodeHomeworkShare(items);
  const url = new URL(window.location.href);
  url.searchParams.set('hwShare', code);
  return url.toString();
}
