'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent } from '@/types/schedule';
import { X, Clock, MapPin, CheckCircle2, BookOpen, Download } from 'lucide-react';
import { format, differenceInCalendarDays, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { downloadEventIcs } from '@/lib/calendarExport';

interface ExamRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ScheduleEvent[];
  onOpenHomework?: (courseTitle: string) => void;
  nowTimestamp?: number;
}

export function ExamRadarModal({
  isOpen,
  onClose,
  events,
  onOpenHomework,
  nowTimestamp = 0,
}: ExamRadarModalProps) {
  const exams = useMemo(() => {
    const filtered = events.filter(e => {
      const isCatExam   = e.category === 'EXAM';
      const text        = `${e.summary} ${e.cleanTitle} ${e.description}`.toLowerCase();
      const isKeyword   = /\bds\b|\bexam|\bpartiel|\bévaluation|\bcontrôle|\btest\b/i.test(text);
      return isCatExam || isKeyword;
    });
    const uniqueMap = new Map<string, ScheduleEvent>();
    filtered.forEach(e => {
      const key = `${e.cleanTitle}-${e.dtstart.substring(0, 13)}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, e);
    });
    return Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime()
    );
  }, [events]);

  const upcomingExams = useMemo(() => exams.filter(e => new Date(e.dtend).getTime() >= nowTimestamp), [exams, nowTimestamp]);
  const pastExams     = useMemo(() => exams.filter(e => new Date(e.dtend).getTime()  < nowTimestamp), [exams, nowTimestamp]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const touchStartY = React.useRef<number | null>(null);
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

  if (!isOpen) return null;

  const getUrgency = (exam: ScheduleEvent): { label: string; color: string } => {
    const start    = new Date(exam.dtstart);
    const daysLeft = differenceInCalendarDays(start, new Date());
    if (isToday(start))   return { label: "aujourd'hui",  color: 'var(--exam-bar)' };
    if (daysLeft <= 3)    return { label: `J-${daysLeft} — urgent`, color: 'var(--exam-bar)' };
    if (daysLeft <= 10)   return { label: `J-${daysLeft}`,          color: 'var(--td-bar)' };
    return { label: `dans ${daysLeft} j`,                            color: 'var(--muted)' };
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Radar des examens"
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
            borderTop: `4px solid var(--exam-bar)`,
          }}
        >
          {/* Poignée tactile mobile */}
          <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-[var(--surface-2)]">
            <div className="w-12 h-1.5 rounded-full bg-[var(--border-2)]" />
          </div>

          {/* En-tête */}
          <div
            className="flex items-center justify-between px-6 sm:px-8 py-5 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--exam-bg)' }}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text)' }}>
                Contrôles &amp; examens
              </h2>
              <p className="text-xs sm:text-sm mt-1 font-mono font-bold" style={{ color: 'var(--muted)' }}>
                {upcomingExams.length} évaluation{upcomingExams.length > 1 ? 's' : ''} à venir
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-tactile p-2 rounded-xs border border-[var(--border)] transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface)] min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto">
            {exams.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20" style={{ color: 'var(--muted)' }}>
                <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--tp-bar)' }} strokeWidth={1.5} />
                <p className="text-base sm:text-lg font-extrabold" style={{ color: 'var(--text)' }}>Aucun examen détecté</p>
                <p className="text-xs sm:text-sm">Aucun DS ou évaluation trouvé dans l&apos;emploi du temps.</p>
              </div>
            ) : (
              <>
                {/* Examens à venir */}
                {upcomingExams.length > 0 && (
                  <div>
                    <div
                      className="px-6 sm:px-8 py-2.5 border-b"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      <span className="text-xs font-mono font-black uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                        À venir ({upcomingExams.length})
                      </span>
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                      {upcomingExams.map(exam => {
                        const start   = new Date(exam.dtstart);
                        const urgency = getUrgency(exam);

                        return (
                          <div
                            key={exam.id}
                            className="px-6 sm:px-8 py-5 border-b"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            {/* Ligne métadonnées */}
                            <div className="flex items-center justify-between gap-3 mb-2.5">
                              <span
                                className="text-sm font-bold capitalize font-mono"
                                style={{ color: 'var(--muted)' }}
                              >
                                {format(start, 'EEEE d MMMM yyyy', { locale: fr })}
                              </span>
                              <span
                                className="text-xs font-extrabold px-2.5 py-1 rounded-xs font-mono border"
                                style={{
                                  background: 'var(--surface-2)',
                                  borderColor: urgency.color,
                                  color: urgency.color,
                                }}
                              >
                                {urgency.label}
                              </span>
                            </div>

                            {/* Titre */}
                            <h3
                              className="text-base sm:text-lg md:text-xl font-black mb-2.5 leading-snug"
                              style={{ color: 'var(--text)' }}
                            >
                              {exam.cleanTitle}
                            </h3>

                            {/* Infos inline */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-medium" style={{ color: 'var(--muted)' }}>
                              <span className="flex items-center gap-1.5 font-mono font-bold">
                                <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                                {format(start, 'HH:mm')} – {format(new Date(exam.dtend), 'HH:mm')}
                                <span>({exam.durationMinutes} min)</span>
                              </span>

                              <span className="flex items-center gap-1.5 font-mono font-bold">
                                <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                                {exam.room || exam.location}
                              </span>

                              {exam.teacher && (
                                <span className="font-semibold">{exam.teacher}</span>
                              )}

                              <div className="ml-auto flex items-center gap-2 flex-wrap pt-1 sm:pt-0">
                                <button
                                  type="button"
                                  onClick={() => downloadEventIcs(exam)}
                                  className="btn-tactile inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-xs border border-[var(--border-2)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer min-h-[34px]"
                                  title="Télécharger l'événement .ics pour votre agenda personnel"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>.ics</span>
                                </button>

                                {onOpenHomework && (
                                  <button
                                    type="button"
                                    onClick={() => { onClose(); onOpenHomework(exam.cleanTitle); }}
                                    className="btn-tactile inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xs border transition-colors cursor-pointer shadow-tactile-xs min-h-[34px]"
                                    style={{
                                      background: 'var(--accent-dim)',
                                      borderColor: 'var(--accent)',
                                      color: 'var(--accent)',
                                    }}
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Planifier révisions</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Examens passés */}
                {pastExams.length > 0 && (
                  <div>
                    <div
                      className="px-5 py-2 border-b border-t"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      <span className="text-[11px] font-700 uppercase tracking-wide" style={{ fontWeight: 700, color: 'var(--muted)' }}>
                        Passés ({pastExams.length})
                      </span>
                    </div>
                    <div className="divide-y divide-[var(--border)] opacity-50">
                      {pastExams.map(exam => (
                        <div
                          key={exam.id}
                          className="flex items-center gap-3 px-5 py-3 border-b"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--tp-bar)' }} strokeWidth={2} />
                          <span className="text-xs font-500" style={{ fontWeight: 500, color: 'var(--text)' }}>
                            {exam.cleanTitle}
                          </span>
                          <span
                            className="ml-auto text-xs capitalize"
                            style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}
                          >
                            {format(new Date(exam.dtstart), 'd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
