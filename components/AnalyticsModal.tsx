'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent } from '@/types/schedule';
import { X, Clock, Award, Layers } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ScheduleEvent[];
  cohortName?: string;
  selectedDate?: Date;
}

export function AnalyticsModal({
  isOpen,
  onClose,
  events,
  cohortName = 'Groupe 2-2',
  selectedDate = new Date(),
}: AnalyticsModalProps) {
  const [scope, setScope] = useState<'WEEK' | 'ALL'>('WEEK');
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (deltaY > 70) {
      onClose();
    }
  };

  const scopedEvents = useMemo(() => {
    if (scope === 'ALL') return events;
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return events.filter(e => {
      const d = new Date(e.dtstart);
      return d >= weekStart && d <= weekEnd;
    });
  }, [events, scope, selectedDate]);

  const analytics = useMemo(() => {
    let totalMinutes = 0;
    const categoryMinutes: Record<string, number> = { CM: 0, TD: 0, TP: 0, EXAM: 0, PROJET: 0, AUTRE: 0 };
    const courseMinutes: Record<string, number>   = {};
    const dayOfWeekMinutes: number[]              = [0, 0, 0, 0, 0, 0, 0];

    scopedEvents.forEach(e => {
      totalMinutes += e.durationMinutes;
      categoryMinutes[e.category] = (categoryMinutes[e.category] || 0) + e.durationMinutes;
      const base = e.cleanTitle.replace(/\s*[-–—:]?\s*(TD|TP|CM|GR\d?|TD\d?).*$/i, '').trim();
      courseMinutes[base] = (courseMinutes[base] || 0) + e.durationMinutes;
      dayOfWeekMinutes[new Date(e.dtstart).getDay()] += e.durationMinutes;
    });

    const totalHours = Math.round(totalMinutes / 60);
    const topCourses = Object.entries(courseMinutes)
      .map(([title, mins]) => ({
        title,
        minutes: mins,
        hours: Math.round(mins / 60),
        percentage: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    let busiestDayIndex = 1, maxDayMins = 0;
    for (let i = 1; i <= 6; i++) {
      if (dayOfWeekMinutes[i] > maxDayMins) { maxDayMins = dayOfWeekMinutes[i]; busiestDayIndex = i; }
    }

    return {
      totalEvents: scopedEvents.length,
      totalMinutes,
      totalHours,
      categoryMinutes,
      topCourses,
      busiestDayName: maxDayMins > 0 ? dayNames[busiestDayIndex] : '—',
    };
  }, [scopedEvents]);

  if (!isOpen) return null;

  const CATEGORIES = [
    { key: 'CM',    label: 'Cours magistraux', barColor: 'var(--cm-bar)' },
    { key: 'TD',    label: 'Travaux dirigés',  barColor: 'var(--td-bar)' },
    { key: 'TP',    label: 'Travaux pratiques',barColor: 'var(--tp-bar)' },
    { key: 'EXAM',  label: 'Évaluations',      barColor: 'var(--exam-bar)' },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Statistiques"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full sm:max-w-3xl max-h-[92vh] flex flex-col overflow-hidden z-10 shadow-tactile-dark"
          style={{
            background: 'var(--surface)',
            borderTop: `4px solid var(--accent)`,
          }}
        >
          {/* Poignée tactile mobile */}
          <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-[var(--surface-2)]">
            <div className="w-12 h-1.5 rounded-full bg-[var(--border-2)]" />
          </div>

          {/* En-tête */}
          <div
            className="flex items-center justify-between px-6 sm:px-8 py-5 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text)' }}>
                Statistiques &amp; volume
              </h2>
              <p className="text-xs sm:text-sm mt-1 font-mono font-bold" style={{ color: 'var(--muted)' }}>{cohortName}</p>
            </div>

            {/* Scope toggle : Semaine vs Semestre */}
            <div
              className="inline-flex border p-1 relative mr-2 shadow-tactile-xs"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border-2)',
              }}
              role="tablist"
            >
              <button
                type="button"
                role="tab"
                aria-selected={scope === 'WEEK'}
                onClick={() => setScope('WEEK')}
                className="relative px-4 py-1.5 text-xs sm:text-sm font-black transition-colors cursor-pointer z-10 min-h-[34px]"
                style={{
                  color: scope === 'WEEK' ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {scope === 'WEEK' && (
                  <motion.div
                    layoutId="active-analytics-scope"
                    className="absolute inset-0 shadow-tactile-xs border -z-10"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border-2)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span>Cette semaine</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={scope === 'ALL'}
                onClick={() => setScope('ALL')}
                className="relative px-4 py-1.5 text-xs sm:text-sm font-black transition-colors cursor-pointer z-10 min-h-[34px]"
                style={{
                  color: scope === 'ALL' ? 'var(--text)' : 'var(--muted)',
                }}
              >
                {scope === 'ALL' && (
                  <motion.div
                    layoutId="active-analytics-scope"
                    className="absolute inset-0 shadow-tactile-xs border -z-10"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border-2)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span>Semestre entier</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="btn-tactile p-2 rounded-xs border border-[var(--border)] transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface-2)] min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Stats rapides */}
            <div
              className="grid grid-cols-3 divide-x divide-[var(--border)] border-b bg-[var(--surface-2)]"
              style={{ borderColor: 'var(--border)' }}
            >
              {[
                {
                  label: scope === 'WEEK' ? 'Volume hebdo' : 'Volume total',
                  value: `${analytics.totalHours}h`,
                  sub: `${analytics.totalEvents} séances`,
                  icon: Clock,
                },
                {
                  label: 'Matières actives',
                  value: analytics.topCourses.length,
                  sub: 'unités d\'enseignement',
                  icon: Layers,
                },
                {
                  label: 'Jour le + dense',
                  value: analytics.busiestDayName,
                  sub: scope === 'WEEK' ? 'cette semaine' : 'au semestre',
                  icon: Award,
                },
              ].map(({ label, value, sub, icon: Icon }) => (
                <div key={label} className="px-5 sm:px-6 py-4 sm:py-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-[var(--muted)]">{label}</span>
                    <Icon className="w-4 h-4 text-[var(--muted-2)]" strokeWidth={2} />
                  </div>
                  <div
                    className="text-2xl sm:text-3xl font-black tabular-nums leading-tight font-mono text-[var(--text)]"
                  >
                    {value}
                  </div>
                  {sub && <p className="text-xs mt-1 font-mono text-[var(--muted-2)] font-medium">{sub}</p>}
                </div>
              ))}
            </div>

            {/* Répartition par type */}
            <div className="px-5 py-4 border-b space-y-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-[11px] font-800 uppercase tracking-widest font-mono text-[var(--muted)]">
                Répartition par format ({scope === 'WEEK' ? 'cette semaine' : 'semestre'})
              </h3>
              <div className="space-y-2.5">
                {CATEGORIES.map(cat => {
                  const mins = analytics.categoryMinutes[cat.key] || 0;
                  const pct  = analytics.totalMinutes > 0 ? Math.round((mins / analytics.totalMinutes) * 100) : 0;
                  const hrs  = Math.round(mins / 60);
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-xs"
                            style={{ background: cat.barColor }}
                          />
                          <span className="text-xs font-700 text-[var(--text)]">
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-xs tabular-nums font-mono text-[var(--muted)] font-700">
                          {hrs}h · {pct}%
                        </span>
                      </div>
                      {/* Barre de progression */}
                      <div
                        className="h-2 w-full bg-[var(--surface-3)]"
                      >
                        <div
                          className="h-full transition-all duration-500 ease-out"
                          style={{ width: `${pct}%`, background: cat.barColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top matières */}
            <div className="px-5 py-4 space-y-2">
              <h3 className="text-[11px] font-800 uppercase tracking-widest font-mono text-[var(--muted)]">
                Volume par matière ({scope === 'WEEK' ? 'cette semaine' : 'semestre'})
              </h3>
              <div className="divide-y divide-[var(--border)]">
                {analytics.topCourses.length === 0 ? (
                  <p className="py-4 text-xs font-mono text-[var(--muted)]">Aucun cours trouvé pour cette sélection.</p>
                ) : (
                  analytics.topCourses.slice(0, 8).map(c => (
                    <div
                      key={c.title}
                      className="flex items-center justify-between py-2.5 gap-3"
                    >
                      <span className="text-xs font-700 text-[var(--text)] truncate">{c.title}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <div
                          className="hidden sm:block h-1.5"
                          style={{
                            width: `${Math.max(8, c.percentage * 1.5)}px`,
                            background: 'var(--accent)',
                            opacity: 0.7,
                            minWidth: '8px',
                            maxWidth: '100px',
                          }}
                        />
                        <span
                          className="text-xs tabular-nums font-mono font-700 w-10 text-right text-[var(--text)]"
                        >
                          {c.hours}h
                        </span>
                        <span
                          className="text-[11px] tabular-nums font-mono w-8 text-right text-[var(--muted)]"
                        >
                          {c.percentage}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
