'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent } from '@/types/schedule';
import {
  X,
  Sparkles,
  Check,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { format, differenceInCalendarDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { haptic } from '@/lib/haptics';

interface RevisionSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  label: string;
}

interface RevisionPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: ScheduleEvent[];
  allEvents: ScheduleEvent[];
  initialExamId?: string;
  onAddHomework: (courseTitle: string, text: string, dueDate?: string) => void;
}

export function RevisionPlannerModal({
  isOpen,
  onClose,
  exams,
  allEvents,
  initialExamId,
  onAddHomework,
}: RevisionPlannerModalProps) {
  const [manualExamId, setManualExamId] = useState<string | null>(null);
  const selectedExamId = manualExamId ?? (initialExamId || exams[0]?.id || '');
  const [manuallySelectedSlotIds, setManuallySelectedSlotIds] = useState<Set<string> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const targetExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0] || null;
  }, [exams, selectedExamId]);

  // Compute available revision slots before the target exam
  const availableSlots = useMemo(() => {
    if (!targetExam) return [];
    const now = new Date();
    const examStart = new Date(targetExam.dtstart);
    if (now >= examStart) return [];

    const daysUntilExam = differenceInCalendarDays(examStart, now);
    const slots: RevisionSlot[] = [];

    // Check up to 7 days before exam (or from today)
    const scanDays = Math.min(7, Math.max(1, daysUntilExam));

    for (let dayOffset = 0; dayOffset <= scanDays; dayOffset++) {
      const scanDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
      if (scanDate > examStart) break;

      // Filter events on scanDate
      const dayEvents = allEvents
        .filter(e => isSameDay(new Date(e.dtstart), scanDate))
        .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());

      // Ideal study window: 09:00 to 19:00
      let lastFreeTime = new Date(scanDate.getFullYear(), scanDate.getMonth(), scanDate.getDate(), 9, 0);

      // If scanning today, start from now + 30 min
      if (isSameDay(scanDate, now)) {
        if (now.getHours() >= 19) continue;
        const currentMins = now.getMinutes();
        const roundedHour = currentMins > 30 ? now.getHours() + 1 : now.getHours();
        const roundedMin = currentMins > 30 ? 0 : 30;
        const earliestToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), roundedHour, roundedMin);
        if (earliestToday > lastFreeTime) {
          lastFreeTime = earliestToday;
        }
      }

      for (const ev of dayEvents) {
        const evStart = new Date(ev.dtstart);
        const evEnd = new Date(ev.dtend);

        if (evStart > lastFreeTime) {
          const diffMins = Math.round((evStart.getTime() - lastFreeTime.getTime()) / 60000);
          // Only slots of at least 60 minutes
          if (diffMins >= 60) {
            // Cap slot to 120 mins max for realistic revision
            const slotDuration = Math.min(120, diffMins);
            const slotEnd = new Date(lastFreeTime.getTime() + slotDuration * 60000);

            slots.push({
              id: `slot-${slots.length}-${scanDate.getTime()}`,
              date: new Date(scanDate),
              startTime: format(lastFreeTime, 'HH:mm'),
              endTime: format(slotEnd, 'HH:mm'),
              durationMinutes: slotDuration,
              label: `${format(scanDate, 'EEEE d MMMM', { locale: fr })} · ${format(lastFreeTime, 'HH:mm')}–${format(slotEnd, 'HH:mm')} (${slotDuration} min)`,
            });
          }
        }

        if (evEnd > lastFreeTime) {
          lastFreeTime = evEnd;
        }
      }

      // Check remaining afternoon/evening slot after last course
      const endOfDay = new Date(scanDate.getFullYear(), scanDate.getMonth(), scanDate.getDate(), 19, 0);
      if (endOfDay > lastFreeTime) {
        const remMins = Math.round((endOfDay.getTime() - lastFreeTime.getTime()) / 60000);
        if (remMins >= 60) {
          const slotDuration = Math.min(120, remMins);
          const slotEnd = new Date(lastFreeTime.getTime() + slotDuration * 60000);
          slots.push({
            id: `slot-${slots.length}-${scanDate.getTime()}`,
            date: new Date(scanDate),
            startTime: format(lastFreeTime, 'HH:mm'),
            endTime: format(slotEnd, 'HH:mm'),
            durationMinutes: slotDuration,
            label: `${format(scanDate, 'EEEE d MMMM', { locale: fr })} · ${format(lastFreeTime, 'HH:mm')}–${format(slotEnd, 'HH:mm')} (${slotDuration} min)`,
          });
        }
      }
    }

    return slots.slice(0, 6); // Propose up to 6 optimal slots
  }, [targetExam, allEvents]);

  // Pre-select first 2 slots by default unless manually changed
  const selectedSlotIds = useMemo(() => {
    return manuallySelectedSlotIds ?? new Set(availableSlots.slice(0, 2).map(s => s.id));
  }, [manuallySelectedSlotIds, availableSlots]);

  const toggleSlot = (id: string) => {
    haptic.tap();
    const next = new Set(selectedSlotIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setManuallySelectedSlotIds(next);
  };

  const handleApplySlots = () => {
    if (!targetExam || selectedSlotIds.size === 0) return;
    const chosen = availableSlots.filter(s => selectedSlotIds.has(s.id));

    chosen.forEach((slot, index) => {
      const text = `Révisions #${index + 1} (${slot.startTime}–${slot.endTime}) : ${targetExam.cleanTitle}`;
      const dueDate = format(slot.date, 'yyyy-MM-dd');
      onAddHomework(targetExam.cleanTitle, text, dueDate);
    });

    haptic.success();
    setSuccessMessage(`${chosen.length} créneaux ajoutés à votre carnet de devoirs.`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1500);
  };

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
        aria-label="Planificateur de révisions"
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
          className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden z-10 shadow-tactile-dark rounded-xs"
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
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
                  OPTIMISATION DU TEMPS LIBRE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
                Planificateur de Révisions
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

          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5">
            {/* Sélecteur d'examen cible */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[var(--muted)] mb-2">
                Évaluation ciblée
              </label>
              {exams.length === 0 ? (
                <div className="p-4 rounded-xs border border-dashed border-[var(--border-2)] text-xs text-[var(--muted)]">
                  Aucun examen détecté dans l&apos;emploi du temps actuel.
                </div>
              ) : (
                <select
                  value={selectedExamId}
                  onChange={e => {
                    setManualExamId(e.target.value);
                    setManuallySelectedSlotIds(null);
                  }}
                  className="w-full p-3 text-sm font-bold border rounded-xs focus:outline-none bg-[var(--surface)] border-[var(--border-2)] text-[var(--text)] font-sans"
                >
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.cleanTitle} ({format(new Date(ex.dtstart), 'EEEE d MMMM', { locale: fr })})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Bannière de l'examen sélectionné */}
            {targetExam && (
              <div
                className="p-4 rounded-xs border flex items-start gap-3"
                style={{
                  background: 'var(--exam-bg)',
                  borderColor: 'var(--exam-bar)',
                  color: 'var(--exam-text)',
                }}
              >
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm font-mono">
                  <span className="font-black block">{targetExam.cleanTitle}</span>
                  <span className="opacity-90 block mt-0.5">
                    Prévu le {format(new Date(targetExam.dtstart), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>
            )}

            {/* Liste des créneaux libres détectés */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold uppercase text-[var(--muted)]">
                  Créneaux libres détectés avant le DS ({availableSlots.length})
                </span>
                <span className="text-[11px] font-mono text-[var(--muted-2)]">
                  {selectedSlotIds.size} sélectionné(s)
                </span>
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[var(--border)] rounded-xs text-xs font-mono text-[var(--muted)]">
                  Aucun créneau libre supérieur à 1 heure n&apos;a été trouvé avant cette évaluation.
                </div>
              ) : (
                <div className="space-y-2">
                  {availableSlots.map(slot => {
                    const isSelected = selectedSlotIds.has(slot.id);
                    return (
                      <div
                        key={slot.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleSlot(slot.id)}
                        onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') toggleSlot(slot.id); }}
                        className="p-3.5 rounded-xs border cursor-pointer flex items-center justify-between gap-3 transition-colors btn-tactile shadow-tactile-xs select-none"
                        style={{
                          background: isSelected ? 'var(--accent-dim)' : 'var(--surface)',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border-2)',
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-5 h-5 rounded-xs border flex items-center justify-center shrink-0 transition-colors"
                            style={{
                              background: isSelected ? 'var(--accent)' : 'transparent',
                              borderColor: isSelected ? 'var(--accent)' : 'var(--border-2)',
                              color: '#ffffff',
                            }}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>

                          <div>
                            <span className="text-xs sm:text-sm font-bold font-sans text-[var(--text)] block truncate">
                              {slot.label}
                            </span>
                            <span className="text-[11px] font-mono text-[var(--muted)] block">
                              Pause idéale pour fiches de révision &amp; annales
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-xs border shrink-0 bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]">
                          {slot.durationMinutes} min
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Message de succès */}
            {successMessage && (
              <div className="p-3 rounded-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                <Check size={16} />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Footer d'action */}
          <div
            className="flex items-center justify-between px-5 sm:px-8 py-3.5 border-t"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleApplySlots}
              disabled={selectedSlotIds.size === 0 || !targetExam}
              className="btn-tactile inline-flex items-center gap-2 px-4 py-2 rounded-xs text-xs sm:text-sm font-mono font-black text-white bg-[var(--accent)] disabled:opacity-40 cursor-pointer shadow-tactile-xs"
            >
              <BookOpen size={14} />
              <span>Programmer {selectedSlotIds.size} séance{selectedSlotIds.size > 1 ? 's' : ''}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
