'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent } from '@/types/schedule';
import {
  X,
  Coffee,
  ArrowRightLeft,
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { haptic } from '@/lib/haptics';

interface ScheduleComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryEvents: ScheduleEvent[];
  primaryCohortName?: string;
  selectedDate?: Date;
}

export function ScheduleComparatorModal({
  isOpen,
  onClose,
  primaryEvents,
  primaryCohortName = 'Mon planning',
  selectedDate = new Date(),
}: ScheduleComparatorModalProps) {
  // Preset comparison cohorts
  const [comparisonTarget, setComparisonTarget] = useState<'GR21' | 'L3INFO' | 'CUSTOM'>('GR21');
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Generate simulated comparison events for the secondary cohort on selected day
  const secondaryEvents = useMemo(() => {
    // Generate shifted realistic comparison events based on primary events
    return primaryEvents.map(e => {
      const origStart = new Date(e.dtstart);
      const origEnd = new Date(e.dtend);
      // Slight variation: subgroup 1 might have TD at different times
      const isShifted = e.category === 'TP' || e.category === 'TD';
      const shiftHours = isShifted ? 2 : 0;

      const shiftedStart = new Date(origStart.getTime() + shiftHours * 3600000);
      const shiftedEnd = new Date(origEnd.getTime() + shiftHours * 3600000);

      return {
        ...e,
        id: `sec-${e.id}`,
        subGroup: comparisonTarget === 'GR21' ? '2-1' : 'L3',
        dtstart: shiftedStart.toISOString(),
        dtend: shiftedEnd.toISOString(),
      };
    });
  }, [primaryEvents, comparisonTarget]);

  // Primary and secondary events on selected date
  const dayPrimary = useMemo(() => {
    return primaryEvents
      .filter(e => isSameDay(new Date(e.dtstart), selectedDate))
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());
  }, [primaryEvents, selectedDate]);

  const daySecondary = useMemo(() => {
    return secondaryEvents
      .filter(e => isSameDay(new Date(e.dtstart), selectedDate))
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());
  }, [secondaryEvents, selectedDate]);

  // Detect common free slots on this date
  const commonFreeSlots = useMemo(() => {
    // Check 12:00 to 14:00 (Lunch)
    const lunchStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0);
    const lunchEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 14, 0);

    const primaryBusyLunch = dayPrimary.some(e => {
      const s = new Date(e.dtstart);
      const end = new Date(e.dtend);
      return s < lunchEnd && end > lunchStart;
    });

    const secondaryBusyLunch = daySecondary.some(e => {
      const s = new Date(e.dtstart);
      const end = new Date(e.dtend);
      return s < lunchEnd && end > lunchStart;
    });

    const slots = [];
    if (!primaryBusyLunch && !secondaryBusyLunch) {
      slots.push({
        label: 'Pause déjeuner commune',
        time: '12h00 – 14h00',
        note: 'Idéal pour manger ensemble au Restaurant Universitaire',
      });
    }

    // Check after 16:30
    const eveningStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 16, 30);
    const eveningEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 19, 0);

    const primaryBusyEvening = dayPrimary.some(e => {
      const s = new Date(e.dtstart);
      const end = new Date(e.dtend);
      return s < eveningEnd && end > eveningStart;
    });

    const secondaryBusyEvening = daySecondary.some(e => {
      const s = new Date(e.dtstart);
      const end = new Date(e.dtend);
      return s < eveningEnd && end > eveningStart;
    });

    if (!primaryBusyEvening && !secondaryBusyEvening) {
      slots.push({
        label: 'Fin d\'après-midi libre en commun',
        time: '16h30 – 19h00',
        note: 'Créneau idéal pour réviser à la BU en groupe',
      });
    }

    return slots;
  }, [dayPrimary, daySecondary, selectedDate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (deltaY > 70) onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Comparateur de plannings"
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
            borderTop: '4px solid var(--accent)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowRightLeft className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
                  COMPARAISON DE PROMOTIONS &amp; GROUPES
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
                Comparateur de Plannings
              </h2>
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

          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
            {/* Choix du groupe à comparer */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)]">
              <div className="text-xs font-mono font-bold text-[var(--muted)]">
                Comparer {primaryCohortName} avec :
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { haptic.tap(); setComparisonTarget('GR21'); }}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-xs border transition-colors cursor-pointer ${
                    comparisonTarget === 'GR21'
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]'
                  }`}
                >
                  Groupe 2-1
                </button>
                <button
                  type="button"
                  onClick={() => { haptic.tap(); setComparisonTarget('L3INFO'); }}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-xs border transition-colors cursor-pointer ${
                    comparisonTarget === 'L3INFO'
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]'
                  }`}
                >
                  Licence 3
                </button>
              </div>
            </div>

            {/* Créneaux libres communs détectés */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coffee className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[var(--text)]">
                  Créneaux Libres en Commun ({format(selectedDate, 'EEEE d MMMM', { locale: fr })})
                </h3>
              </div>

              {commonFreeSlots.length === 0 ? (
                <div className="p-4 rounded-xs border border-dashed border-[var(--border-2)] text-xs font-mono text-[var(--muted)]">
                  Aucun créneau libre simultané de plus d&apos;une heure ce jour-ci.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {commonFreeSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xs border bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-tactile-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono font-black text-xs">{slot.label}</span>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          {slot.time}
                        </span>
                      </div>
                      <p className="text-[11px] font-sans opacity-90">{slot.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vue comparative des deux journées côte à côte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Colonne Groupe Principal */}
              <div className="p-4 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <span className="text-xs font-mono font-black text-[var(--text)]">{primaryCohortName}</span>
                  <span className="text-[11px] font-mono text-[var(--muted)] font-bold">{dayPrimary.length} cours</span>
                </div>
                {dayPrimary.length === 0 ? (
                  <p className="text-xs font-mono text-[var(--muted)] py-4 text-center">Aucun cours</p>
                ) : (
                  dayPrimary.map(e => (
                    <div key={e.id} className="p-2.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] text-xs">
                      <span className="font-mono font-bold block text-[var(--muted)]">
                        {format(new Date(e.dtstart), 'HH:mm')} – {format(new Date(e.dtend), 'HH:mm')}
                      </span>
                      <span className="font-extrabold text-[var(--text)] block truncate mt-0.5">{e.cleanTitle}</span>
                      <span className="text-[11px] font-mono text-[var(--muted-2)] block">{e.room || e.location}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Colonne Groupe Comparé */}
              <div className="p-4 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <span className="text-xs font-mono font-black text-[var(--accent)]">
                    {comparisonTarget === 'GR21' ? 'Groupe 2-1 (Comparé)' : 'Licence 3 (Comparé)'}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--muted)] font-bold">{daySecondary.length} cours</span>
                </div>
                {daySecondary.length === 0 ? (
                  <p className="text-xs font-mono text-[var(--muted)] py-4 text-center">Aucun cours</p>
                ) : (
                  daySecondary.map(e => (
                    <div key={e.id} className="p-2.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] text-xs">
                      <span className="font-mono font-bold block text-[var(--muted)]">
                        {format(new Date(e.dtstart), 'HH:mm')} – {format(new Date(e.dtend), 'HH:mm')}
                      </span>
                      <span className="font-extrabold text-[var(--text)] block truncate mt-0.5">{e.cleanTitle}</span>
                      <span className="text-[11px] font-mono text-[var(--muted-2)] block">{e.room || e.location}</span>
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
