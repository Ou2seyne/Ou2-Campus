'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent } from '@/types/schedule';
import { X, Clock, Award, Layers, BarChart3, PieChart, TrendingUp } from 'lucide-react';
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
    // Indices: 0 = Sun, 1 = Mon ... 6 = Sat
    const dayOfWeekMinutes: number[] = [0, 0, 0, 0, 0, 0, 0];

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
        hours: Math.round((mins / 60) * 10) / 10,
        percentage: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const fullDayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    let busiestDayIndex = 1;
    let maxDayMins = 0;

    for (let i = 1; i <= 6; i++) {
      if (dayOfWeekMinutes[i] > maxDayMins) {
        maxDayMins = dayOfWeekMinutes[i];
        busiestDayIndex = i;
      }
    }

    // Days data for SVG bar chart (Mon to Sat)
    const weekDaysData = [1, 2, 3, 4, 5, 6].map(dayIndex => ({
      name: dayLabels[dayIndex],
      fullName: fullDayNames[dayIndex],
      minutes: dayOfWeekMinutes[dayIndex],
      hours: Math.round((dayOfWeekMinutes[dayIndex] / 60) * 10) / 10,
    }));

    const maxChartHours = Math.max(8, ...weekDaysData.map(d => d.hours));

    return {
      totalEvents: scopedEvents.length,
      totalMinutes,
      totalHours,
      categoryMinutes,
      topCourses,
      weekDaysData,
      maxChartHours,
      busiestDayName: maxDayMins > 0 ? fullDayNames[busiestDayIndex] : '—',
    };
  }, [scopedEvents]);

  if (!isOpen) return null;

  const CATEGORIES = [
    { key: 'CM',    label: 'Cours magistraux', barColor: 'var(--cm-bar)',   bg: 'var(--cm-bg)',   text: 'var(--cm-text)' },
    { key: 'TD',    label: 'Travaux dirigés',  barColor: 'var(--td-bar)',   bg: 'var(--td-bg)',   text: 'var(--td-text)' },
    { key: 'TP',    label: 'Travaux pratiques',barColor: 'var(--tp-bar)',   bg: 'var(--tp-bg)',   text: 'var(--tp-text)' },
    { key: 'EXAM',  label: 'Évaluations',      barColor: 'var(--exam-bar)', bg: 'var(--exam-bg)', text: 'var(--exam-text)' },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Statistiques & volume de travail"
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
          className="relative w-full sm:max-w-3xl max-h-[92vh] flex flex-col overflow-hidden z-10 shadow-tactile-dark rounded-xs"
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
            className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 sm:py-5 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-[var(--accent)]" strokeWidth={2.2} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
                  TABLEAU DE BORD ACADÉMIQUE · {cohortName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
                Statistiques &amp; Volume
              </h2>
            </div>

            {/* Scope toggle : Semaine vs Semestre */}
            <div className="flex items-center gap-2">
              <div
                className="inline-flex border p-0.5 rounded-xs shadow-tactile-xs bg-[var(--surface)]"
                style={{ borderColor: 'var(--border-2)' }}
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={scope === 'WEEK'}
                  onClick={() => setScope('WEEK')}
                  className={`px-3 py-1 text-xs font-mono font-black rounded-xs transition-colors cursor-pointer ${
                    scope === 'WEEK'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  Cette semaine
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={scope === 'ALL'}
                  onClick={() => setScope('ALL')}
                  className={`px-3 py-1 text-xs font-mono font-black rounded-xs transition-colors cursor-pointer ${
                    scope === 'ALL'
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  Semestre
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-tactile p-2 rounded-xs border border-[var(--border)] transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface)] min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Corps de la modale */}
          <div className="flex-1 overflow-y-auto">
            {/* 3 Cartes Métriques Clés */}
            <div
              className="grid grid-cols-3 divide-x divide-[var(--border)] border-b bg-[var(--surface)]"
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
                <div key={label} className="px-4 sm:px-6 py-3.5 sm:py-4 select-none">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-bold text-[var(--muted)]">{label}</span>
                    <Icon className="w-3.5 h-3.5 text-[var(--muted-2)]" strokeWidth={2} />
                  </div>
                  <div className="text-xl sm:text-2xl font-black tabular-nums leading-tight font-mono text-[var(--text)]">
                    {value}
                  </div>
                  {sub && <p className="text-[11px] mt-0.5 font-mono text-[var(--muted)] font-medium truncate">{sub}</p>}
                </div>
              ))}
            </div>

            {/* Graphique SVG Maison #1 : Charge Quotidienne par Jour (Bar Chart) */}
            <div className="p-5 sm:p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[var(--text)]">
                    Charge Horaire par Jour (Lun – Sam)
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--muted)]">
                  Échelle max : {analytics.maxChartHours}h / jour
                </span>
              </div>

              {/* SVG Bar Chart */}
              <div className="w-full bg-[var(--surface-2)] p-4 rounded-xs border border-[var(--border)]">
                <svg
                  viewBox="0 0 600 160"
                  className="w-full h-36 overflow-visible"
                  aria-label="Graphique à barres de la charge hebdomadaire"
                >
                  {/* Lignes repères horizontales */}
                  {[0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = 130 - ratio * 100;
                    const val = Math.round(ratio * analytics.maxChartHours);
                    return (
                      <g key={ratio}>
                        <line
                          x1="35"
                          y1={y}
                          x2="590"
                          y2={y}
                          stroke="var(--border)"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x="28"
                          y={y + 3}
                          textAnchor="end"
                          fill="var(--muted-2)"
                          fontSize="9"
                          fontFamily="var(--font-mono)"
                        >
                          {val}h
                        </text>
                      </g>
                    );
                  })}

                  {/* Barres des 6 jours */}
                  {analytics.weekDaysData.map((d, i) => {
                    const colWidth = 45;
                    const spacing = 88;
                    const x = 55 + i * spacing;
                    const barHeight = analytics.maxChartHours > 0
                      ? Math.max(3, (d.hours / analytics.maxChartHours) * 100)
                      : 0;
                    const y = 130 - barHeight;
                    const isBusiest = d.hours > 0 && d.fullName === analytics.busiestDayName;

                    return (
                      <g key={d.name} className="cursor-pointer group">
                        <title>{`${d.fullName} : ${d.hours}h de cours`}</title>
                        {/* Fond transparent de colonne pour hover */}
                        <rect
                          x={x - 6}
                          y={20}
                          width={colWidth + 12}
                          height={110}
                          fill="transparent"
                          className="hover:fill-[var(--surface-3)] transition-colors"
                          rx="2"
                        />
                        {/* Barre principale */}
                        <rect
                          x={x}
                          y={y}
                          width={colWidth}
                          height={barHeight}
                          fill={isBusiest ? 'var(--accent)' : 'var(--border-strong)'}
                          className="transition-all duration-300 group-hover:fill-[var(--accent)]"
                          rx="2"
                        />
                        {/* Valeur en heures au-dessus de la barre */}
                        {d.hours > 0 && (
                          <text
                            x={x + colWidth / 2}
                            y={y - 5}
                            textAnchor="middle"
                            fill="var(--text)"
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="var(--font-mono)"
                          >
                            {d.hours}h
                          </text>
                        )}
                        {/* Label du jour en bas */}
                        <text
                          x={x + colWidth / 2}
                          y={148}
                          textAnchor="middle"
                          fill={isBusiest ? 'var(--accent)' : 'var(--muted)'}
                          fontSize="11"
                          fontWeight={isBusiest ? 'bold' : 'normal'}
                          fontFamily="var(--font-mono)"
                        >
                          {d.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Répartition par Format (CM / TD / TP / EXAM) avec Barres Proportionnelles */}
            <div className="p-5 sm:p-6 border-b space-y-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[var(--text)]">
                    Répartition par Format ({scope === 'WEEK' ? 'Cette semaine' : 'Semestre'})
                  </h3>
                </div>
                <span className="text-xs font-mono text-[var(--muted)]">
                  Total : {analytics.totalHours}h ({analytics.totalEvents} séances)
                </span>
              </div>

              {/* Jauge Proportionnelle Combinée (Stacked Progress Bar) */}
              <div className="h-5 w-full bg-[var(--surface-3)] rounded-xs overflow-hidden flex border border-[var(--border)]">
                {CATEGORIES.map(cat => {
                  const mins = analytics.categoryMinutes[cat.key] || 0;
                  const pct = analytics.totalMinutes > 0 ? (mins / analytics.totalMinutes) * 100 : 0;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={cat.key}
                      style={{ width: `${pct}%`, background: cat.barColor }}
                      className="h-full transition-all duration-500 relative group"
                      title={`${cat.label} : ${Math.round(mins / 60)}h (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>

              {/* Détail par Catégorie */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {CATEGORIES.map(cat => {
                  const mins = analytics.categoryMinutes[cat.key] || 0;
                  const pct = analytics.totalMinutes > 0 ? Math.round((mins / analytics.totalMinutes) * 100) : 0;
                  const hrs = Math.round((mins / 60) * 10) / 10;
                  return (
                    <div
                      key={cat.key}
                      className="p-3 rounded-xs border flex flex-col justify-between"
                      style={{
                        background: 'var(--surface-2)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ background: cat.barColor }}
                        />
                        <span className="text-xs font-bold font-sans text-[var(--text)] truncate">
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between font-mono">
                        <span className="text-base font-black text-[var(--text)]">
                          {hrs}h
                        </span>
                        <span className="text-xs font-bold text-[var(--muted)]">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 Matières les plus denses */}
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[var(--text)]">
                  Top 5 Unités d&apos;Enseignement ({scope === 'WEEK' ? 'Cette semaine' : 'Semestre'})
                </h3>
                <span className="text-xs font-mono text-[var(--muted)] font-bold">
                  {analytics.topCourses.length} matières répertoriées
                </span>
              </div>

              {analytics.topCourses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xs">
                  <p className="text-xs font-mono text-[var(--muted)]">
                    Aucun cours trouvé pour cette sélection.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {analytics.topCourses.slice(0, 5).map((c, idx) => (
                    <div
                      key={c.title}
                      className="p-3 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-black text-[var(--accent)] text-xs w-4">
                            #{idx + 1}
                          </span>
                          <span className="font-extrabold text-[var(--text)] truncate font-sans">
                            {c.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="font-black text-[var(--text)]">{c.hours}h</span>
                          <span className="text-[var(--muted)] text-[11px]">({c.percentage}%)</span>
                        </div>
                      </div>

                      {/* Barre SVG / CSS proportionnelle */}
                      <div className="h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(4, c.percentage * 2))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
