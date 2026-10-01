'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleEvent, HomeworkItem } from '@/types/schedule';
import { getCategoryTheme } from '@/lib/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  X, Clock, MapPin, User, Users, BookOpen,
  Calendar, ExternalLink, Copy, Check,
  Circle, CheckCircle2, Share2, Download, Navigation,
} from 'lucide-react';
import { decodeCampusRoom } from '@/lib/campus.data';
import { downloadEventIcs, shareCourseEvent } from '@/lib/calendarExport';

interface CourseDetailModalProps {
  event: ScheduleEvent | null;
  onClose: () => void;
  homeworks?: HomeworkItem[];
  onAddHomework?: (courseTitle: string, text: string) => void;
  onToggleHomework?: (id: string) => void;
}

export function CourseDetailModal({
  event,
  onClose,
  homeworks = [],
  onAddHomework,
  onToggleHomework,
}: CourseDetailModalProps) {
  const [copied, setCopied]             = React.useState(false);
  const [shared, setShared]             = React.useState(false);
  const [newHomeworkText, setNewHomework] = React.useState('');
  const touchStartY = React.useRef<number | null>(null);

  // Fermeture clavier
  React.useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [event, onClose]);

  const campusLocation = React.useMemo(
    () => (event ? decodeCampusRoom(event.room, event.location) : null),
    [event]
  );

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

  const handleShare = async () => {
    if (!event) return;
    const ok = await shareCourseEvent(event);
    if (ok) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleDownloadIcs = () => {
    if (!event) return;
    downloadEventIcs(event);
  };

  if (!event) return null;

  const theme          = getCategoryTheme(event.category);
  const startDate      = new Date(event.dtstart);
  const endDate        = new Date(event.dtend);
  const formattedDate  = format(startDate, 'EEEE d MMMM yyyy', { locale: fr });
  const startTime      = format(startDate, 'HH:mm');
  const endTime        = format(endDate,   'HH:mm');

  const courseHomeworks = homeworks.filter(
    h => h.courseTitle.toLowerCase() === event.cleanTitle.toLowerCase()
  );

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeworkText.trim() || !onAddHomework) return;
    onAddHomework(event.cleanTitle, newHomeworkText);
    setNewHomework('');
  };

  const handleCopy = () => {
    const text = [
      `${event.cleanTitle} (${event.category})`,
      `Date : ${formattedDate}, ${startTime}–${endTime}`,
      `Salle : ${event.location}`,
      event.teacher ? `Enseignant : ${event.teacher}` : '',
      event.groups.length > 0 ? `Groupes : ${event.groups.join(', ')}` : '',
      event.notes ? `Notes : ${event.notes}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGCalUrl = () => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fmt  = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    const title   = encodeURIComponent(`${event.cleanTitle} [${event.category}]`);
    const details = encodeURIComponent(`Enseignant: ${event.teacher||'N/A'}\nGroupes: ${event.groups.join(', ')}\n\n${event.description||''}`);
    const loc     = encodeURIComponent(event.location);
    const dates   = `${fmt(startDate)}/${fmt(endDate)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${loc}`;
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label={event.cleanTitle}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />

        {/* Panneau */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden z-10 rounded-xs shadow-tactile-dark"
          style={{
            background: 'var(--surface)',
            borderTop: '4px solid var(--accent)',
            borderColor: 'var(--border-2)',
          }}
        >
          {/* Poignée tactile mobile (Drag Handle) */}
          <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-[var(--surface-2)]">
            <div className="w-12 h-1.5 rounded-full bg-[var(--border-2)]" />
          </div>

          {/* En-tête (Spacieux) */}
          <div
            className={`px-6 sm:px-8 pt-5 pb-5 border-b ${theme.catClass}`}
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black px-2 py-0.5 rounded-xs font-mono uppercase ${theme.badgeClass}`}>
                  {theme.label}
                </span>
                {event.subGroup && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-xs font-mono border"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--text-2)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    gr. {event.subGroup}
                  </span>
                )}
                {event.code && (
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-xs border"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--muted)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {event.code}
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="btn-tactile shrink-0 p-2 rounded-xs border border-[var(--border)] transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface-2)] min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            <h2
              className="text-xl sm:text-2xl font-black leading-snug tracking-tight"
              style={{ color: 'var(--text)' }}
            >
              {event.cleanTitle}
            </h2>
          </div>

          {/* Corps */}
          <div className="flex-1 overflow-y-auto">
            {/* Bloc infos (Aéré) */}
            <div className="divide-y divide-[var(--border)]">

              {/* Date & heure */}
              <div className="flex items-start gap-4 px-6 sm:px-8 py-4 sm:py-5">
                <Clock className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" strokeWidth={2} />
                <div>
                  <p className="text-xs capitalize mb-0.5 font-mono text-[var(--muted)] font-semibold">{formattedDate}</p>
                  <p className="text-sm sm:text-base font-black font-mono" style={{ color: 'var(--text)' }}>
                    {startTime} – {endTime}
                    <span className="ml-2 text-xs font-bold text-[var(--muted)]">
                      ({event.durationMinutes} min)
                    </span>
                  </p>
                </div>
              </div>

              {/* Salle + Décodage Campus Lens piloté par données */}
              <div className="flex items-start gap-4 px-6 sm:px-8 py-4 sm:py-5">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-[var(--accent)]" strokeWidth={2.2} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <p className="text-xs font-mono font-bold text-[var(--muted)]">SALLE &amp; LOCALISATION</p>
                    {campusLocation?.isKnown ? (
                      <span className="text-xs font-mono font-black px-2 py-0.5 rounded-xs border border-[var(--border-2)] bg-[var(--surface-2)] text-[var(--accent)] flex items-center gap-1.5 shadow-tactile-xs">
                        <Navigation className="w-3 h-3" />
                        {campusLocation.badge}
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-xs border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        Salle inconnue dans l&apos;annuaire
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base font-extrabold font-mono" style={{ color: 'var(--text)' }}>
                    {event.location || event.room || 'Salle non précisée'}
                  </p>

                  {campusLocation?.isKnown ? (
                    <div className="mt-2 space-y-1.5 text-xs font-mono">
                      <div className="flex flex-wrap items-center gap-2 text-[var(--text-2)]">
                        <span className="font-bold">{campusLocation.building}</span>
                        <span className="text-[var(--border-2)]">·</span>
                        <span>{campusLocation.floor}</span>
                        {campusLocation.capacity && (
                          <>
                            <span className="text-[var(--border-2)]">·</span>
                            <span className="text-[var(--muted)]">Capacité ~{campusLocation.capacity} pl.</span>
                          </>
                        )}
                      </div>

                      <div className="text-[11px] text-[var(--muted)]">
                        <span>PMR : </span>
                        <span>{campusLocation.accessibility}</span>
                      </div>

                      {campusLocation.equipment && campusLocation.equipment.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {campusLocation.equipment.map((eq, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded-xs border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}

                      {campusLocation.note && (
                        <p className="text-[11px] text-[var(--muted-2)] pt-0.5">
                          ↳ {campusLocation.note}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 p-2.5 rounded-xs border border-dashed border-[var(--border-2)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
                      <p className="font-sans">
                        Cette salle n&apos;est pas encore répertoriée dans notre annuaire automatique de la Faculté des Sciences. Consultez le tableau d&apos;affichage de votre département.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enseignant */}
              {event.teacher && (
                <div className="flex items-start gap-4 px-6 sm:px-8 py-4 sm:py-5">
                  <User className="w-5 h-5 mt-0.5 shrink-0 text-[var(--muted)]" strokeWidth={2} />
                  <div>
                    <p className="text-xs font-mono font-bold mb-0.5 text-[var(--muted)]">ENSEIGNANT</p>
                    <p className="text-sm sm:text-base font-extrabold" style={{ color: 'var(--text)' }}>{event.teacher}</p>
                  </div>
                </div>
              )}

              {/* Groupes */}
              {event.groups.length > 0 && (
                <div className="flex items-start gap-4 px-6 sm:px-8 py-4 sm:py-5">
                  <Users className="w-5 h-5 mt-0.5 shrink-0 text-[var(--muted)]" strokeWidth={2} />
                  <div>
                    <p className="text-xs font-mono font-bold mb-0.5 text-[var(--muted)]">PROMOTIONS & GROUPES</p>
                    <p className="text-sm sm:text-base font-bold font-mono" style={{ color: 'var(--text)' }}>{event.groups.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {event.notes && (
                <div className="flex items-start gap-4 px-6 sm:px-8 py-4 sm:py-5">
                  <BookOpen className="w-5 h-5 mt-0.5 shrink-0 text-[var(--muted)]" strokeWidth={2} />
                  <div>
                    <p className="text-xs font-mono font-bold mb-0.5 text-[var(--muted)]">REMARQUES ADE</p>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-mono" style={{ color: 'var(--text-2)' }}>
                      {event.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Devoirs */}
            <div
              className="border-t px-5 py-4 space-y-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-700" style={{ fontWeight: 700, color: 'var(--text)' }}>
                  Devoirs &amp; rappels
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {courseHomeworks.filter(h => !h.isDone).length} en attente
                </span>
              </div>

              {courseHomeworks.length > 0 && (
                <div className="space-y-1.5">
                  {courseHomeworks.map(h => (
                    <div
                      key={h.id}
                      onClick={() => onToggleHomework?.(h.id)}
                      className="flex items-center gap-2.5 px-3 py-2.5 border cursor-pointer transition-colors"
                      style={{
                        background: h.isDone ? 'transparent' : 'var(--surface)',
                        borderColor: 'var(--border)',
                        opacity: h.isDone ? 0.5 : 1,
                      }}
                    >
                      <button type="button" style={{ color: h.isDone ? 'var(--tp-bar)' : 'var(--border-2)' }}>
                        {h.isDone
                          ? <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                          : <Circle      className="w-4 h-4" strokeWidth={1.75} />
                        }
                      </button>
                      <span
                        className={`text-xs ${h.isDone ? 'line-through' : ''}`}
                        style={{ color: h.isDone ? 'var(--muted)' : 'var(--text)' }}
                      >
                        {h.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!courseHomeworks.length && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Aucun devoir pour ce cours.</p>
              )}

              {onAddHomework && (
                <form onSubmit={handleCreateHomework} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newHomeworkText}
                    onChange={e => setNewHomework(e.target.value)}
                    placeholder="Ajouter un devoir ou rappel…"
                    className="flex-1 px-3 py-2 text-xs border focus:outline-none"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newHomeworkText.trim()}
                    className="px-3 py-2 text-xs font-600 transition-colors cursor-pointer disabled:opacity-40"
                    style={{
                      background: 'var(--text)',
                      color: 'var(--bg)',
                      fontWeight: 600,
                    }}
                  >
                    Ajouter
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Pied — actions */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Copier */}
              <button
                onClick={handleCopy}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-700 border transition-colors cursor-pointer shadow-tactile-xs rounded-xs"
                style={{
                  color: 'var(--text)',
                  borderColor: 'var(--border-2)',
                  background: 'var(--surface)',
                }}
                title="Copier le texte du cours"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    Copié
                  </span>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />
                    <span>Copier</span>
                  </>
                )}
              </button>

              {/* Partager */}
              <button
                onClick={handleShare}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-700 border transition-colors cursor-pointer shadow-tactile-xs rounded-xs"
                style={{
                  color: 'var(--text)',
                  borderColor: 'var(--border-2)',
                  background: 'var(--surface)',
                }}
                title="Partager ce cours (SMS, WhatsApp, Discord)"
              >
                {shared ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    Partagé !
                  </span>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Partager</span>
                  </>
                )}
              </button>

              {/* Télécharger .ics */}
              <button
                onClick={handleDownloadIcs}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-700 border transition-colors cursor-pointer shadow-tactile-xs rounded-xs"
                style={{
                  color: 'var(--muted)',
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                }}
                title="Télécharger fichier .ics universel (Apple / Outlook)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fichier .ics</span>
              </button>
            </div>

            {/* Google Agenda */}
            <a
              href={getGCalUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-700 transition-colors shadow-tactile-xs rounded-xs"
              style={{
                background: 'var(--text)',
                color: 'var(--bg)',
              }}
              title="Ajouter à Google Agenda"
            >
              <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Google Agenda</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
