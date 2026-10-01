export type CourseCategory = 'CM' | 'TD' | 'TP' | 'EXAM' | 'PROJET' | 'AUTRE';

export interface ScheduleEvent {
  id: string;
  summary: string;
  cleanTitle: string;
  code?: string;
  description: string;
  location: string;
  room?: string;
  building?: string;
  dtstart: string; // ISO 8601 string
  dtend: string;   // ISO 8601 string
  durationMinutes: number;
  category: CourseCategory;
  teacher: string;
  groups: string[];
  subGroup?: string;
  tdGroup?: string;
  notes?: string;
}

export interface SavedSchedule {
  id: string;
  name: string;
  url: string;
  isFavorite: boolean;
  lastAccessedAt: number;
  colorTag?: string;
}

export interface ScheduleMeta {
  sourceUrl: string;
  fetchedAt: string;
  totalEvents: number;
  calendarName?: string;
  timezone?: string;
  isDemo?: boolean;
}

export interface ScheduleApiResponse {
  success: boolean;
  events: ScheduleEvent[];
  meta?: ScheduleMeta;
  error?: string;
  warning?: string;
}

export type ViewMode = 'day' | 'week' | 'list';
export type TimeOfDayFilter = 'ALL' | 'MORNING' | 'AFTERNOON';

export interface FilterState {
  searchQuery: string;
  category: CourseCategory | 'ALL';
  selectedDate: string; // YYYY-MM-DD
}

export interface HomeworkItem {
  id: string;
  courseTitle: string;
  text: string;
  dueDate?: string;
  isDone: boolean;
  createdAt: number;
}

export type ThemePalette = 'matcha' | 'lavender' | 'sunset' | 'ocean';
