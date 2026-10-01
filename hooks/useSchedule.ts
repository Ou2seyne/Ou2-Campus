'use client';

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { CourseCategory, SavedSchedule, ScheduleApiResponse, ScheduleEvent, ViewMode, TimeOfDayFilter } from '@/types/schedule';
import { format, isSameDay, startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks } from 'date-fns';

const STORAGE_KEY_SCHEDULES = 'pillcal_schedules_v1';
const STORAGE_KEY_CURRENT_ID = 'pillcal_active_id_v1';
const STORAGE_KEY_SUBGROUP = 'pillcal_subgroup_v1';
const CACHE_PREFIX = 'pillcal_events_cache_';

const DEFAULT_DEMO_SCHEDULES: SavedSchedule[] = [
  {
    id: 'real-l1-math-artois',
    name: 'L1 MATHS TD2 (Univ Artois)',
    url: 'https://ade-consult.univ-artois.fr/jsp/custom/modules/plannings/5YGpM4nJ.shu',
    isFavorite: true,
    lastAccessedAt: 1727690000000,
    colorTag: 'sage',
  },
  {
    id: 'demo-l3-info',
    name: 'Licence 3 Informatique',
    url: 'demo://sample-l3',
    isFavorite: false,
    lastAccessedAt: 1727680000000,
    colorTag: 'sage',
  },
  {
    id: 'demo-m1-miage',
    name: 'Master MIAGE - Web & Cloud',
    url: 'demo://sample-miage',
    isFavorite: false,
    lastAccessedAt: 1727670000000,
    colorTag: 'lavender',
  },
  {
    id: 'demo-but-info',
    name: 'BUT Informatique (S4)',
    url: 'demo://sample-but',
    isFavorite: false,
    lastAccessedAt: 1727660000000,
    colorTag: 'peach',
  },
];

let schedulesListeners: Array<() => void> = [];
function notifySchedules() {
  schedulesListeners.forEach(fn => {
    try { fn(); } catch (e) { console.warn(e); }
  });
}
function subscribeSchedules(listener: () => void) {
  schedulesListeners.push(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_SCHEDULES) {
      cachedSchedulesRaw = null;
      listener();
    }
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', handleStorage);
  return () => {
    schedulesListeners = schedulesListeners.filter(fn => fn !== listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', handleStorage);
  };
}

let cachedSchedulesRaw: string | null = null;
let cachedSchedulesList: SavedSchedule[] = DEFAULT_DEMO_SCHEDULES;

function getSchedulesSnapshot(): SavedSchedule[] {
  if (typeof window === 'undefined') return DEFAULT_DEMO_SCHEDULES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHEDULES);
    if (raw !== cachedSchedulesRaw) {
      cachedSchedulesRaw = raw;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedSchedulesList = parsed;
        } else {
          cachedSchedulesList = DEFAULT_DEMO_SCHEDULES;
        }
      } else {
        cachedSchedulesList = DEFAULT_DEMO_SCHEDULES;
      }
    }
  } catch {
    cachedSchedulesList = DEFAULT_DEMO_SCHEDULES;
  }
  return cachedSchedulesList;
}

function getServerSchedulesSnapshot(): SavedSchedule[] {
  return DEFAULT_DEMO_SCHEDULES;
}

let activeIdListeners: Array<() => void> = [];
function notifyActiveId() {
  activeIdListeners.forEach(fn => {
    try { fn(); } catch (e) { console.warn(e); }
  });
}
function subscribeActiveId(listener: () => void) {
  activeIdListeners.push(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_CURRENT_ID) {
      listener();
    }
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', handleStorage);
  return () => {
    activeIdListeners = activeIdListeners.filter(fn => fn !== listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', handleStorage);
  };
}

function getActiveIdSnapshot(): string | null {
  if (typeof window === 'undefined') return DEFAULT_DEMO_SCHEDULES[0].id;
  try {
    const savedActiveId = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
    if (savedActiveId) return savedActiveId;
  } catch {}
  return DEFAULT_DEMO_SCHEDULES[0].id;
}

function getServerActiveIdSnapshot(): string | null {
  return DEFAULT_DEMO_SCHEDULES[0].id;
}

let subGroupListeners: Array<() => void> = [];
function notifySubGroup() {
  subGroupListeners.forEach(fn => {
    try { fn(); } catch (e) { console.warn(e); }
  });
}
function subscribeSubGroup(listener: () => void) {
  subGroupListeners.push(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_SUBGROUP) {
      listener();
    }
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', handleStorage);
  return () => {
    subGroupListeners = subGroupListeners.filter(fn => fn !== listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', handleStorage);
  };
}

function getSubGroupSnapshot(): string {
  if (typeof window === 'undefined') return '2-2';
  return localStorage.getItem(STORAGE_KEY_SUBGROUP) || '2-2';
}

function getServerSubGroupSnapshot(): string {
  return '2-2';
}

export function useSchedule() {
  const savedSchedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedulesSnapshot,
    getServerSchedulesSnapshot
  );

  const currentScheduleId = useSyncExternalStore(
    subscribeActiveId,
    getActiveIdSnapshot,
    getServerActiveIdSnapshot
  );

  const selectedSubGroup = useSyncExternalStore(
    subscribeSubGroup,
    getSubGroupSnapshot,
    getServerSubGroupSnapshot
  );

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  // Filters & Navigation
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<TimeOfDayFilter>('ALL');

  const setSelectedSubGroup = useCallback((sg: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBGROUP, sg);
    } catch (e) {
      console.warn(e);
    }
    notifySubGroup();
  }, []);

  const setCurrentScheduleId = useCallback((id: string | null) => {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY_CURRENT_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_ID);
      }
    } catch (e) {
      console.warn(e);
    }
    notifyActiveId();
  }, []);

  // Persist schedules helper
  const persistSchedules = useCallback((updatedList: SavedSchedule[]) => {
    cachedSchedulesList = updatedList;
    try {
      const raw = JSON.stringify(updatedList);
      cachedSchedulesRaw = raw;
      localStorage.setItem(STORAGE_KEY_SCHEDULES, raw);
    } catch (e) {
      console.error('Could not save schedules to localStorage', e);
    }
    notifySchedules();
  }, []);

  // Fetch schedule events
  const fetchScheduleData = useCallback(async (url: string, scheduleId?: string, silentRefresh = false) => {
    if (!silentRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    setWarning(null);

    // Try reading from cache first for instantaneous render
    if (scheduleId && !silentRefresh) {
      try {
        const cached = localStorage.getItem(`${CACHE_PREFIX}${scheduleId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.events)) {
            setEvents(parsed.events);
            setLastFetchedAt(parsed.fetchedAt || null);
          }
        }
      } catch (e) {
        console.warn('Failed to parse cache', e);
      }
    }

    try {
      const endpoint = `/api/schedule?url=${encodeURIComponent(url)}`;
      const res = await fetch(endpoint);
      const data: ScheduleApiResponse = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Impossible de récupérer l'emploi du temps.");
      }

      setEvents(data.events);
      setWarning(data.warning || null);
      const timestamp = data.meta?.fetchedAt || new Date().toISOString();
      setLastFetchedAt(timestamp);

      // Cache the result
      if (scheduleId) {
        try {
          localStorage.setItem(
            `${CACHE_PREFIX}${scheduleId}`,
            JSON.stringify({
              events: data.events,
              fetchedAt: timestamp,
            })
          );
        } catch (e) {
          console.warn('Failed to write to cache', e);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la récupération de l'emploi du temps.";
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Sync initial fetch on mount
  useEffect(() => {
    const active = savedSchedules.find(s => s.id === currentScheduleId);
    if (active) {
      const timer = setTimeout(() => {
        fetchScheduleData(active.url, active.id);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentScheduleId, fetchScheduleData, savedSchedules]);

  // Add or switch to an ADE URL
  const loadSchedule = useCallback(
    (url: string, customName?: string) => {
      const cleanUrl = url.trim();
      let schedule = savedSchedules.find(s => s.url === cleanUrl);

      if (!schedule) {
        const newSchedule: SavedSchedule = {
          id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: customName || (cleanUrl.startsWith('demo://') ? 'Emploi du temps Démo' : 'Mon Emploi du Temps ADE'),
          url: cleanUrl,
          isFavorite: false,
          lastAccessedAt: Date.now(),
        };

        const updated = [newSchedule, ...savedSchedules];
        persistSchedules(updated);
        schedule = newSchedule;
      } else {
        const updated = savedSchedules.map(s =>
          s.id === schedule!.id ? { ...s, lastAccessedAt: Date.now(), name: customName || s.name } : s
        );
        persistSchedules(updated);
      }

      setCurrentScheduleId(schedule.id);
      fetchScheduleData(schedule.url, schedule.id);
    },
    [savedSchedules, persistSchedules, fetchScheduleData, setCurrentScheduleId]
  );

  // Switch to an already saved schedule
  const switchSchedule = useCallback(
    (id: string) => {
      const schedule = savedSchedules.find(s => s.id === id);
      if (!schedule) return;

      const updated = savedSchedules.map(s => (s.id === id ? { ...s, lastAccessedAt: Date.now() } : s));
      persistSchedules(updated);

      setCurrentScheduleId(id);
      fetchScheduleData(schedule.url, schedule.id);
    },
    [savedSchedules, persistSchedules, fetchScheduleData, setCurrentScheduleId]
  );

  // Refresh current schedule
  const refreshSchedule = useCallback(() => {
    const current = savedSchedules.find(s => s.id === currentScheduleId);
    if (current) {
      fetchScheduleData(current.url, current.id, true);
    }
  }, [savedSchedules, currentScheduleId, fetchScheduleData]);

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (id: string) => {
      const updated = savedSchedules.map(s => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
      persistSchedules(updated);
    },
    [savedSchedules, persistSchedules]
  );

  // Remove schedule
  const removeSchedule = useCallback(
    (id: string) => {
      const remaining = savedSchedules.filter(s => s.id !== id);
      persistSchedules(remaining);
      try {
        localStorage.removeItem(`${CACHE_PREFIX}${id}`);
      } catch (e) {
        console.warn(e);
      }

      if (currentScheduleId === id) {
        if (remaining.length > 0) {
          switchSchedule(remaining[0].id);
        } else {
          setCurrentScheduleId(null);
          setEvents([]);
        }
      }
    },
    [savedSchedules, currentScheduleId, persistSchedules, switchSchedule, setCurrentScheduleId]
  );

  // Current active schedule object
  const currentSchedule = useMemo(() => {
    return savedSchedules.find(s => s.id === currentScheduleId) || null;
  }, [savedSchedules, currentScheduleId]);

  // Available subgroups in events
  const availableSubGroups = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      if (e.subGroup) set.add(e.subGroup);
    });
    return Array.from(set).sort((a, b) => {
      if (a === '2-2') return -1;
      if (b === '2-2') return 1;
      return a.localeCompare(b);
    });
  }, [events]);

  // Base events filtered by student subgroup (e.g. 2-2 vs 2-1) and TD cohort (TD2 vs TD1)
  const cohortEvents = useMemo(() => {
    return events.filter(event => {
      if (!selectedSubGroup || selectedSubGroup === 'ALL') {
        return true;
      }

      // Extract target TD number if selectedSubGroup is e.g. "2-2", "2-1", "1-2", "1-1"
      const targetTd = selectedSubGroup.includes('-') ? selectedSubGroup.split('-')[0] : null;

      // 1. Check TD cohort affiliation (e.g. TD2 vs TD1)
      if (event.tdGroup && targetTd && event.tdGroup !== targetTd) {
        return false;
      }

      // 2. Check specific TP sub-group affiliation (e.g. 2-2 vs 2-1)
      if (event.subGroup && event.subGroup !== selectedSubGroup) {
        return false;
      }

      return true;
    });
  }, [events, selectedSubGroup]);

  // Filtered events with category and search query applied
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return cohortEvents.filter(event => {
      if (selectedCategory !== 'ALL' && event.category !== selectedCategory) {
        return false;
      }

      if (query.length > 0) {
        const matchesSummary = event.summary.toLowerCase().includes(query);
        const matchesTitle = event.cleanTitle.toLowerCase().includes(query);
        const matchesCode = event.code?.toLowerCase().includes(query);
        const matchesTeacher = event.teacher.toLowerCase().includes(query);
        const matchesRoom = event.room?.toLowerCase().includes(query);
        const matchesLocation = event.location.toLowerCase().includes(query);
        const matchesGroups = event.groups.some(g => g.toLowerCase().includes(query));
        const matchesDesc = event.description.toLowerCase().includes(query);

        return (
          matchesSummary ||
          matchesTitle ||
          matchesCode ||
          matchesTeacher ||
          matchesRoom ||
          matchesLocation ||
          matchesGroups ||
          matchesDesc
        );
      }

      if (timeOfDayFilter === 'MORNING') {
        const hour = new Date(event.dtstart).getHours();
        if (hour >= 13) return false;
      } else if (timeOfDayFilter === 'AFTERNOON') {
        const hour = new Date(event.dtend).getHours();
        const startHour = new Date(event.dtstart).getHours();
        if (startHour < 12 && hour <= 13) return false;
      }

      return true;
    });
  }, [cohortEvents, searchQuery, selectedCategory, timeOfDayFilter]);

  // Events for selected day
  const dayEvents = useMemo(() => {
    return filteredEvents
      .filter(event => isSameDay(new Date(event.dtstart), selectedDate))
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());
  }, [filteredEvents, selectedDate]);

  // Events for selected week
  const weekEvents = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

    return filteredEvents
      .filter(event => {
        const d = new Date(event.dtstart);
        return d >= weekStart && d <= weekEnd;
      })
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());
  }, [filteredEvents, selectedDate]);

  // Navigation helpers
  const goToToday = useCallback(() => setSelectedDate(new Date()), []);
  const goToNextDay = useCallback(() => setSelectedDate(prev => addDays(prev, 1)), []);
  const goToPrevDay = useCallback(() => setSelectedDate(prev => subDays(prev, 1)), []);
  const goToNextWeek = useCallback(() => setSelectedDate(prev => addWeeks(prev, 1)), []);
  const goToPrevWeek = useCallback(() => setSelectedDate(prev => subWeeks(prev, 1)), []);

  // Today stats (derived from student's subgroup cohort)
  const todayStats = useMemo(() => {
    const now = new Date();
    const todayList = cohortEvents.filter(e => isSameDay(new Date(e.dtstart), now));
    const totalMinutes = todayList.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const durationLabel = hours > 0 ? `${hours}h${minutes > 0 ? `${minutes.toString().padStart(2, '0')}` : ''}` : `${minutes} min`;

    const ongoing = todayList.find(e => {
      const s = new Date(e.dtstart).getTime();
      const end = new Date(e.dtend).getTime();
      const t = now.getTime();
      return t >= s && t <= end;
    });

    const upcoming = todayList
      .filter(e => new Date(e.dtstart).getTime() > now.getTime())
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime())[0];

    return {
      count: todayList.length,
      durationLabel,
      totalMinutes,
      ongoing,
      upcoming,
    };
  }, [cohortEvents]);

  // Days in week with event counts (derived from student's subgroup cohort)
  const weekDays = useMemo(() => {
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 6 }).map((_, i) => {
      const date = addDays(monday, i);
      const count = cohortEvents.filter(e => isSameDay(new Date(e.dtstart), date)).length;
      return {
        date,
        formattedDay: format(date, 'eee'),
        dayNumber: format(date, 'd'),
        hasEvents: count > 0,
        eventCount: count,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
      };
    });
  }, [selectedDate, cohortEvents]);

  return {
    currentSchedule,
    savedSchedules,
    events,
    filteredEvents,
    dayEvents,
    weekEvents,
    isLoading,
    isRefreshing,
    error,
    warning,
    lastFetchedAt,
    searchQuery,
    selectedCategory,
    timeOfDayFilter,
    selectedDate,
    viewMode,
    weekDays,
    todayStats,
    selectedSubGroup,
    availableSubGroups,
    setSelectedSubGroup,
    setSearchQuery,
    setSelectedCategory,
    setTimeOfDayFilter,
    setSelectedDate,
    setViewMode,
    loadSchedule,
    switchSchedule,
    refreshSchedule,
    toggleFavorite,
    removeSchedule,
    goToToday,
    goToNextDay,
    goToPrevDay,
    goToNextWeek,
    goToPrevWeek,
  };
}
