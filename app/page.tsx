'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { useTheme } from '@/hooks/useTheme';
import { useHomework } from '@/hooks/useHomework';
import { Header } from '@/components/Header';
import { ScheduleLiveBanner } from '@/components/ScheduleLiveBanner';
import { SearchBar } from '@/components/SearchBar';
import { DateSelector } from '@/components/DateSelector';
import { TimelineView } from '@/components/TimelineView';
import { WeekView } from '@/components/WeekView';
import { ListView } from '@/components/ListView';
import dynamic from 'next/dynamic';
import { CourseDetailModal } from '@/components/CourseDetailModal';
import { ExamRadarModal } from '@/components/ExamRadarModal';
import { HomeworkModal } from '@/components/HomeworkModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileActionSheet } from '@/components/MobileActionSheet';
import { OfflineBanner } from '@/components/OfflineBanner';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';
import { PwaInstallSheet } from '@/components/PwaInstallSheet';
import { PullToRefresh } from '@/components/PullToRefresh';
import { DailyBriefingCard } from '@/components/DailyBriefingCard';
import { usePwa } from '@/hooks/usePwa';
import { ContextBanner } from '@/components/ContextBanner';
import { CommandPalette, useCommandPalette } from '@/features/command-palette/CommandPalette';
import { Toast } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScheduleEvent } from '@/types/schedule';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { migrateFromLocalStorage } from '@/lib/idb';
import { decodeHomeworkShare } from '@/lib/homeworkShare';

// Lazy-loaded dialogs for fast initial LCP
const AnalyticsModal = dynamic(() => import('@/components/AnalyticsModal').then(m => m.AnalyticsModal), { ssr: false });
const RevisionPlannerModal = dynamic(() => import('@/components/RevisionPlannerModal').then(m => m.RevisionPlannerModal), { ssr: false });
const ScheduleComparatorModal = dynamic(() => import('@/components/ScheduleComparatorModal').then(m => m.ScheduleComparatorModal), { ssr: false });
const ShortcutsModal = dynamic(() => import('@/components/ShortcutsModal').then(m => m.ShortcutsModal), { ssr: false });
const UrlModalInput = dynamic(() => import('@/components/UrlModalInput').then(m => m.UrlModalInput), { ssr: false });

export default function SchedulePage() {
  const {
    currentSchedule,
    savedSchedules,
    dayEvents,
    weekEvents,
    filteredEvents,
    events,
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
  } = useSchedule();

  const { isDark, toggleDark } = useTheme();

  const {
    items: homeworkItems,
    pendingCount: homeworkPendingCount,
    pendingByCourse,
    addHomework,
    toggleHomework,
    deleteHomework,
  } = useHomework();

  const {
    isOnline,
    showReconnectedBadge,
    canInstall,
    isIos,
    isInstallable,
    isStandalone,
    promptInstall,
    dismissPrompt,
    hasUpdate,
    applyUpdate,
  } = usePwa();

  // Modal states
  const [selectedEvent, setSelectedEvent]           = useState<ScheduleEvent | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen]         = useState(false);
  const [isExamRadarOpen, setIsExamRadarOpen]       = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen]       = useState(false);
  const [isHomeworkOpen, setIsHomeworkOpen]         = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen]       = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen]     = useState(false);
  const [isInstallSheetOpen, setIsInstallSheetOpen] = useState(false);
  const [homeworkContextCourse, setHomeworkContextCourse] = useState<string>('');
  const [hudMessage, setHudMessage]                 = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode]               = useState(false);
  const [isRevisionPlannerOpen, setIsRevisionPlannerOpen] = useState(false);
  const [revisionTargetExam, setRevisionTargetExam] = useState<ScheduleEvent | null>(null);
  const [isComparatorOpen, setIsComparatorOpen]     = useState(false);
  const [singleKeyShortcutsEnabled, setSingleKeyShortcutsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('aura_single_key_shortcuts') !== 'false';
  });

  const handleToggleSingleKeyShortcuts = (enabled: boolean) => {
    setSingleKeyShortcutsEnabled(enabled);
    try {
      localStorage.setItem('aura_single_key_shortcuts', String(enabled));
    } catch {}
  };

  // Command palette
  const palette = useCommandPalette();

  // Run IndexedDB migration on first load
  useEffect(() => {
    migrateFromLocalStorage().catch(console.warn);
  }, []);

  // Deep-link URL param handling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const viewParam  = params.get('view');
        const modalParam = params.get('modal');
        const dateParam  = params.get('date');

        if (viewParam === 'day' || viewParam === 'week' || viewParam === 'list') {
          setViewMode(viewParam);
        }
        if (modalParam === 'exams')    setIsExamRadarOpen(true);
        else if (modalParam === 'homework') setIsHomeworkOpen(true);
        else if (modalParam === 'analytics') setIsAnalyticsOpen(true);
        else if (modalParam === 'revisions') setIsRevisionPlannerOpen(true);
        else if (modalParam === 'comparator') setIsComparatorOpen(true);

        const hwShareParam = params.get('hwShare');
        if (hwShareParam) {
          const decoded = decodeHomeworkShare(hwShareParam);
          if (decoded && decoded.items.length > 0) {
            decoded.items.forEach(it => {
              addHomework(it.courseTitle, it.text, it.dueDate);
            });
            setHudMessage(`${decoded.items.length} devoir(s) importé(s) !`);
            setTimeout(() => setHudMessage(null), 2500);
            params.delete('hwShare');
            const newSearch = params.toString();
            const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
            window.history.replaceState({}, '', newUrl);
          }
        }

        if (dateParam && dateParam !== 'today') {
          const d = new Date(dateParam);
          if (!isNaN(d.getTime())) setSelectedDate(d);
        }
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(timer);
  }, [setViewMode, setSelectedDate, addHomework]);

  // Background refresh on visibility + online events
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshSchedule();
    };
    const handleOnline = () => {
      if (navigator.onLine) refreshSchedule();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshSchedule]);

  // Available course names for homework linking
  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const base = e.cleanTitle.replace(/\s*[-–—:]?\s*(TD|TP|CM|GR\d?|TD\d?).*$/i, '').trim();
      if (base) set.add(base);
    });
    return Array.from(set).sort();
  }, [events]);

  // 1-second timer for live progress
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const upcomingExamsCount = useMemo(() => {
    return events.filter((e) => {
      const isExam =
        e.category === 'EXAM' ||
        /\bds\b|\bexam|\bpartiel|\bévaluation/i.test(`${e.summary} ${e.cleanTitle}`);
      return isExam && new Date(e.dtend).getTime() >= currentTimestamp;
    }).length;
  }, [events, currentTimestamp]);

  const handlePrev = useCallback(
    () => (viewMode === 'week' ? goToPrevWeek() : goToPrevDay()),
    [viewMode, goToPrevWeek, goToPrevDay]
  );
  const handleNext = useCallback(
    () => (viewMode === 'week' ? goToNextWeek() : goToNextDay()),
    [viewMode, goToNextWeek, goToNextDay]
  );

  const handleOpenHomeworkWithCourse = (courseTitle: string) => {
    setHomeworkContextCourse(courseTitle);
    setIsHomeworkOpen(true);
  };

  const handleFilterTeacher = useCallback(
    (teacher: string) => {
      setSearchQuery(teacher);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchQuery]
  );
  const handleFilterRoom = useCallback(
    (room: string) => {
      setSearchQuery(room);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchQuery]
  );

  // ── Keyboard shortcuts with HUD feedback ──────────────────
  useEffect(() => {
    let hudTimer: ReturnType<typeof setTimeout>;
    const triggerHud = (msg: string) => {
      setHudMessage(msg);
      clearTimeout(hudTimer);
      hudTimer = setTimeout(() => setHudMessage(null), 1200);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when inside form controls
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) return;

      // Cmd/Ctrl+K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') return;

      // Universal navigation keys (always active)
      if (e.key === 'ArrowLeft') {
        handlePrev();
        triggerHud(viewMode === 'week' ? 'Semaine préc. [←]' : 'Jour préc. [←]');
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNext();
        triggerHud(viewMode === 'week' ? 'Semaine suiv. [→]' : 'Jour suiv. [→]');
        return;
      }
      if (e.key === 'Escape') {
        if (selectedEvent) setSelectedEvent(null);
        else if (isRevisionPlannerOpen) setIsRevisionPlannerOpen(false);
        else if (isComparatorOpen) setIsComparatorOpen(false);
        else if (isExamRadarOpen) setIsExamRadarOpen(false);
        else if (isAnalyticsOpen) setIsAnalyticsOpen(false);
        else if (isHomeworkOpen) setIsHomeworkOpen(false);
        else if (isShortcutsOpen) setIsShortcutsOpen(false);
        else if (isUrlModalOpen) setIsUrlModalOpen(false);
        else if (isFocusMode) setIsFocusMode(false);
        return;
      }

      // Single-character shortcuts guarded by WCAG 2.1.4 setting
      if (!singleKeyShortcutsEnabled) return;

      switch (e.key) {
        case 'j': case 'J':
          setViewMode('day');
          triggerHud('Vue Jour [J]');
          break;
        case 's': case 'S':
          setViewMode('week');
          triggerHud('Vue Semaine [S]');
          break;
        case 'l': case 'L':
          setViewMode('list');
          triggerHud('Vue Liste [L]');
          break;
        case 't': case 'T':
          goToToday();
          triggerHud("Aujourd'hui [T]");
          break;
        case 'r': case 'R':
          refreshSchedule();
          triggerHud('Actualisation [R]');
          break;
        case 'f': case 'F':
          setIsFocusMode((prev) => !prev);
          triggerHud(!isFocusMode ? 'Focus Mode [F]' : 'Mode normal [F]');
          break;
        case 'g': case 'G':
          palette.open();
          triggerHud('Aller à… [G]');
          break;
        case '/':
          e.preventDefault();
          (document.querySelector('input[type="search"]') as HTMLInputElement)?.focus();
          triggerHud('Recherche [/]');
          break;
        case '?':
          if (e.shiftKey || e.key === '?') setIsShortcutsOpen((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(hudTimer);
    };
  }, [
    handlePrev, handleNext, goToToday, refreshSchedule, setViewMode, viewMode,
    selectedEvent, isExamRadarOpen, isAnalyticsOpen, isHomeworkOpen,
    isShortcutsOpen, isUrlModalOpen, isFocusMode, isComparatorOpen, isRevisionPlannerOpen, palette, singleKeyShortcutsEnabled,
  ]);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Keyboard HUD toast */}
      <AnimatePresence>
        {hudMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.12 }}
            className="fixed bottom-20 sm:bottom-6 right-6 z-50 pointer-events-none"
          >
            <Toast message={hudMessage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA update toast */}
      <AnimatePresence>
        {hasUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 no-print"
          >
            <div
              className="p-3 border flex items-center justify-between gap-3"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--accent)',
                color: 'var(--text)',
                borderRadius: '2px',
                boxShadow: 'var(--el-accent)',
                borderTop: '3px solid var(--accent)',
              }}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-xs font-sans font-700">
                <span
                  className="w-2 h-2 rounded-full pulse-dot"
                  style={{ background: '#22C55E' }}
                  aria-hidden="true"
                />
                <span>Nouvelle version disponible</span>
              </div>
              <button
                onClick={applyUpdate}
                className="btn-tactile px-2.5 py-1 text-[11px] font-800 border"
                style={{
                  background: 'var(--accent)',
                  borderColor: 'var(--accent)',
                  color: '#fff',
                  borderRadius: '2px',
                  boxShadow: '2px 2px 0 rgba(0,82,204,0.5)',
                  fontWeight: 800,
                  minHeight: '36px',
                }}
              >
                Mettre à jour
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette
        isOpen={palette.isOpen}
        onClose={palette.close}
        events={filteredEvents}
        isDark={isDark}
        onToggleDark={toggleDark}
        onViewChange={setViewMode}
        onOpenExamRadar={() => { setIsExamRadarOpen(true); palette.close(); }}
        onOpenHomework={() => { setHomeworkContextCourse(''); setIsHomeworkOpen(true); palette.close(); }}
        onOpenAnalytics={() => { setIsAnalyticsOpen(true); palette.close(); }}
        onOpenSources={() => { setIsUrlModalOpen(true); palette.close(); }}
        onOpenRevisionPlanner={() => { setIsRevisionPlannerOpen(true); palette.close(); }}
        onOpenComparator={() => { setIsComparatorOpen(true); palette.close(); }}
        onRefresh={refreshSchedule}
        onGoToToday={goToToday}
        onSearchChange={setSearchQuery}
        onSelectSubGroup={setSelectedSubGroup}
        onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
        isFocusMode={isFocusMode}
      />

      {/* Focus mode overlay hides header/controls */}
      {!isFocusMode && (
        <>
          <Header
            scheduleName={currentSchedule?.name || 'Emploi du temps ADE'}
            isRefreshing={isRefreshing}
            onRefresh={refreshSchedule}
            onOpenAddModal={() => setIsUrlModalOpen(true)}
            lastFetchedAt={lastFetchedAt}
            onOpenExamRadar={() => setIsExamRadarOpen(true)}
            examCount={upcomingExamsCount}
            onOpenHomework={() => { setHomeworkContextCourse(''); setIsHomeworkOpen(true); }}
            homeworkCount={homeworkPendingCount}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            isDark={isDark}
            onToggleDark={toggleDark}
            isOnline={isOnline}
            onOpenInstallSheet={() => setIsInstallSheetOpen(true)}
            canInstall={canInstall}
            isStandalone={isStandalone}
            onOpenCommandPalette={palette.open}
            schedules={savedSchedules}
            currentScheduleId={currentSchedule?.id || null}
            onSelectSchedule={switchSchedule}
            onToggleFavorite={toggleFavorite}
            onRemoveSchedule={removeSchedule}
          />
          <OfflineBanner isOnline={isOnline} showReconnectedBadge={showReconnectedBadge} />
          <ContextBanner
            events={events}
            lastFetchedAt={lastFetchedAt}
            onOpenExamRadar={() => setIsExamRadarOpen(true)}
            onSelectEvent={setSelectedEvent}
          />
        </>
      )}

      {/* Focus mode indicator */}
      {isFocusMode && (
        <div
          className="fixed top-2 right-2 z-50 no-print"
          aria-live="polite"
        >
          <button
            onClick={() => setIsFocusMode(false)}
            className="btn-tactile font-mono text-[10px] uppercase px-2 py-1 border"
            style={{
              background: 'var(--text)',
              color: 'var(--bg)',
              borderColor: 'var(--border-2)',
              boxShadow: 'var(--el-dark)',
              borderRadius: '2px',
              fontWeight: 800,
              letterSpacing: '0.07em',
            }}
            aria-label="Quitter le mode Focus"
            title="Quitter le mode Focus [F ou Esc]"
          >
            FOCUS [F]
          </button>
        </div>
      )}

      {/* Main content */}
      <main id="main-content" tabIndex={-1}>
        <PullToRefresh onRefresh={refreshSchedule} isRefreshing={isRefreshing}>
          <div className={`${viewMode === 'week' ? 'max-w-[1400px] w-full' : 'max-w-5xl'} mx-auto px-4 sm:px-6 py-4 pb-24 sm:pb-10 space-y-4 transition-all duration-150`}>

            {!isFocusMode && (
              <>
                {/* Search + collapsible filters */}
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  timeOfDayFilter={timeOfDayFilter}
                  onTimeOfDayChange={setTimeOfDayFilter}
                  selectedSubGroup={selectedSubGroup}
                  onSubGroupChange={setSelectedSubGroup}
                  availableSubGroups={availableSubGroups}
                  resultsCount={filteredEvents.length}
                  onOpenCommandPalette={palette.open}
                />

                {/* Date selector + view mode */}
                <DateSelector
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  weekDays={weekDays}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onGoToToday={goToToday}
                  onPrev={handlePrev}
                  onNext={handleNext}
                />

                {/* Daily briefing or compact live banner */}
                {viewMode === 'day' ? (
                  <DailyBriefingCard
                    events={dayEvents}
                    homeworks={homeworkItems}
                    selectedDate={selectedDate}
                    onSelectEvent={setSelectedEvent}
                    onOpenHomework={() => { setHomeworkContextCourse(''); setIsHomeworkOpen(true); }}
                    onOpenExamRadar={() => setIsExamRadarOpen(true)}
                  />
                ) : (
                  <ScheduleLiveBanner
                    stats={todayStats}
                    examCount={upcomingExamsCount}
                    homeworkCount={homeworkPendingCount}
                    onSelectEvent={setSelectedEvent}
                    onOpenExamRadar={() => setIsExamRadarOpen(true)}
                    onOpenHomework={() => { setHomeworkContextCourse(''); setIsHomeworkOpen(true); }}
                    onOpenShortcuts={() => setIsShortcutsOpen(true)}
                  />
                )}
              </>
            )}

            {/* Warning banner */}
            {warning && (
              <div
                className="flex items-start gap-3.5 px-5 py-4 border-l-4 text-sm sm:text-base shadow-tactile-sm"
                style={{
                  background: 'var(--td-bg)',
                  borderLeftColor: 'var(--td-bar)',
                  color: 'var(--td-text)',
                }}
                role="alert"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2.2} />
                <p style={{ fontWeight: 600 }}>{warning}</p>
              </div>
            )}

            {/* Main content area */}
            {isLoading ? (
              <div
                className="w-full space-y-4 my-2"
                role="status"
                aria-live="polite"
                aria-label="Chargement de l'édition ADE"
              >
                {/* Briefing skeleton */}
                <div
                  className="w-full border p-4 sm:p-6 shadow-tactile-sm animate-pulse flex flex-col gap-4"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-2)',
                    borderRadius: 'var(--r-1)',
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="h-4 w-44 bg-[var(--surface-3)] rounded-xs" />
                    <div className="h-4 w-28 bg-[var(--surface-3)] rounded-xs" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-[var(--surface-3)] rounded-xs" />
                      <div className="h-10 w-32 bg-[var(--surface-3)] rounded-xs" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="h-3 w-32 bg-[var(--surface-3)] rounded-xs" />
                      <div className="h-7 w-3/4 bg-[var(--surface-3)] rounded-xs" />
                      <div className="h-4 w-1/2 bg-[var(--surface-3)] rounded-xs" />
                    </div>
                  </div>
                </div>

                {/* Course Skeletons list */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 sm:gap-4 items-start">
                      <div className="w-14 sm:w-16 pt-2 shrink-0 space-y-1.5 text-right hidden sm:block">
                        <div className="h-4 w-12 bg-[var(--surface-2)] rounded-xs ml-auto animate-pulse" />
                        <div className="h-3 w-8 bg-[var(--surface-2)] rounded-xs ml-auto animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <Skeleton variant="course" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div
                className="w-full flex flex-col items-start gap-4 px-6 sm:px-8 py-6 border-l-4 shadow-tactile-sm"
                style={{
                  background: 'var(--exam-bg)',
                  borderLeftColor: 'var(--exam-bar)',
                  color: 'var(--exam-text)',
                }}
                role="alert"
              >
                <div className="flex items-center gap-2.5 font-extrabold text-base sm:text-lg">
                  <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2.2} />
                  <span>Erreur de chargement du planning</span>
                </div>
                <p className="text-sm leading-relaxed opacity-90">{error}</p>
                <div className="flex items-center gap-3.5 mt-2 flex-wrap">
                  <button
                    onClick={refreshSchedule}
                    className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 text-sm font-extrabold border"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--exam-bar)',
                      color: 'var(--exam-text)',
                      boxShadow: '2px 2px 0 var(--exam-bar)',
                      borderRadius: 'var(--r-1)',
                      minHeight: '44px',
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Réessayer</span>
                  </button>
                  <button
                    onClick={() => setIsUrlModalOpen(true)}
                    className="text-sm font-bold underline underline-offset-4"
                    style={{ color: 'var(--exam-text)', minHeight: '44px' }}
                  >
                    Changer d&apos;URL ADE
                  </button>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'day' ? (
                  <motion.div
                    key="day-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                  >
                    <TimelineView
                      events={dayEvents}
                      onSelectEvent={setSelectedEvent}
                      pendingByCourse={pendingByCourse}
                      onAddHomework={handleOpenHomeworkWithCourse}
                      onPrev={handlePrev}
                      onNext={handleNext}
                      searchQuery={searchQuery}
                      onFilterTeacher={handleFilterTeacher}
                      onFilterRoom={handleFilterRoom}
                      currentTimestamp={currentTimestamp}
                    />
                  </motion.div>
                ) : viewMode === 'week' ? (
                  <motion.div
                    key="week-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                  >
                    <WeekView
                      selectedDate={selectedDate}
                      events={weekEvents}
                      onSelectEvent={setSelectedEvent}
                      onSelectDate={(d) => {
                        setSelectedDate(d);
                        setViewMode('day');
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                  >
                    <ListView
                      events={filteredEvents}
                      onSelectEvent={setSelectedEvent}
                      searchQuery={searchQuery}
                      onFilterTeacher={handleFilterTeacher}
                      onFilterRoom={handleFilterRoom}
                      pendingByCourse={pendingByCourse}
                      onAddHomework={handleOpenHomeworkWithCourse}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Footer */}
            {!isFocusMode && (
              <footer
                className="pt-6 pb-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-mono no-print"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-2)' }}
              >
                <p>Aura Campus · ADE · L1 Maths-Info TD2 · Univ. d&apos;Artois</p>
                <div className="flex items-center gap-2 text-xs flex-wrap justify-center">
                  <span>Raccourcis :</span>
                  {(['J','S','L','T','R','F','⌘K'].map((k) => (
                    <kbd
                      key={k}
                      className="px-2 py-0.5 border font-mono font-bold"
                      style={{
                        borderColor: 'var(--border-2)',
                        background: 'var(--surface-2)',
                        color: 'var(--muted)',
                        borderRadius: '2px',
                        boxShadow: '1px 1px 0 var(--border-2)',
                      }}
                    >
                      {k}
                    </kbd>
                  )))}
                  <button
                    onClick={() => setIsShortcutsOpen(true)}
                    className="px-2.5 py-0.5 border font-mono font-bold hover:border-[var(--text)] transition-colors cursor-pointer"
                    style={{
                      borderColor: 'var(--border-2)',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      borderRadius: '2px',
                      minHeight: '32px',
                    }}
                    aria-label="Aide raccourcis clavier"
                  >
                    ?
                  </button>
                </div>
              </footer>
            )}
          </div>
        </PullToRefresh>
      </main>

      {/* Mobile bottom nav */}
      {!isFocusMode && (
        <MobileBottomNav
          currentViewMode={viewMode}
          onSelectViewMode={setViewMode}
          onGoToToday={goToToday}
          onOpenHomework={() => { setHomeworkContextCourse(''); setIsHomeworkOpen(true); }}
          homeworkCount={homeworkPendingCount}
          onOpenExamRadar={() => setIsExamRadarOpen(true)}
          examCount={upcomingExamsCount}
          onOpenActionMenu={() => setIsActionMenuOpen(true)}
          canInstall={canInstall}
          isStandalone={isStandalone}
        />
      )}

      {/* Modals */}
      <CourseDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        homeworks={homeworkItems}
        onAddHomework={addHomework}
        onToggleHomework={toggleHomework}
      />
      <ExamRadarModal
        isOpen={isExamRadarOpen}
        onClose={() => setIsExamRadarOpen(false)}
        events={filteredEvents}
        onOpenHomework={handleOpenHomeworkWithCourse}
        onOpenRevisionPlanner={(exam) => {
          setRevisionTargetExam(exam);
          setIsRevisionPlannerOpen(true);
        }}
        nowTimestamp={currentTimestamp}
      />
      <RevisionPlannerModal
        isOpen={isRevisionPlannerOpen}
        onClose={() => {
          setIsRevisionPlannerOpen(false);
          setRevisionTargetExam(null);
        }}
        exams={filteredEvents.filter(e => e.category === 'EXAM' || /\bds\b|\bexam/i.test(`${e.summary} ${e.cleanTitle}`))}
        allEvents={events}
        initialExamId={revisionTargetExam?.id}
        onAddHomework={addHomework}
      />
      <ScheduleComparatorModal
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        primaryEvents={filteredEvents}
        primaryCohortName={selectedSubGroup !== 'ALL' ? `Groupe ${selectedSubGroup}` : (currentSchedule?.name || 'Mon planning')}
        selectedDate={selectedDate}
      />
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        events={filteredEvents}
        cohortName={selectedSubGroup !== 'ALL' ? `Groupe ${selectedSubGroup}` : 'Tous les groupes'}
        selectedDate={selectedDate}
      />
      <HomeworkModal
        isOpen={isHomeworkOpen}
        onClose={() => setIsHomeworkOpen(false)}
        items={homeworkItems}
        onAdd={addHomework}
        onToggle={toggleHomework}
        onDelete={deleteHomework}
        availableCourses={availableCourses}
        initialCourse={homeworkContextCourse}
      />
      <UrlModalInput
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onSubmit={loadSchedule}
        isLoading={isLoading}
        initialUrl={currentSchedule?.url || ''}
        initialName={currentSchedule?.name || ''}
      />
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        singleKeyEnabled={singleKeyShortcutsEnabled}
        onToggleSingleKey={handleToggleSingleKeyShortcuts}
      />

      {/* Mobile action sheet */}
      <MobileActionSheet
        isOpen={isActionMenuOpen}
        onClose={() => setIsActionMenuOpen(false)}
        isStandalone={isStandalone}
        onOpenInstallSheet={() => setIsInstallSheetOpen(true)}
        onRefresh={refreshSchedule}
        isRefreshing={isRefreshing}
        isDark={isDark}
        onToggleDark={toggleDark}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenAddModal={() => setIsUrlModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isOnline={isOnline}
        scheduleName={currentSchedule?.name}
        lastFetchedAt={lastFetchedAt}
        onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
        isFocusMode={isFocusMode}
      />

      {/* PWA Install sheet */}
      <PwaInstallSheet
        isOpen={isInstallSheetOpen}
        onClose={() => setIsInstallSheetOpen(false)}
        isIos={isIos}
        isInstallable={isInstallable}
        isStandalone={isStandalone}
        onInstall={promptInstall}
      />

      {/* Non-intrusive install banner */}
      <PwaInstallBanner
        canInstall={canInstall}
        isIos={isIos}
        isInstallable={isInstallable}
        onInstall={promptInstall}
        onDismiss={dismissPrompt}
      />
    </div>
  );
}
