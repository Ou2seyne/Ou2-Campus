'use client';

import React, { useState } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { getCategoryTheme } from '@/lib/theme';
import { format, isSameDay } from 'date-fns';
import { MapPin, User, BookOpen, Copy, Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

import { HighlightText } from '@/lib/highlight';

interface CourseCardProps {
  event: ScheduleEvent;
  onClick?: () => void;
  compact?: boolean;
  pendingHomeworkCount?: number;
  onAddHomework?: (courseTitle: string) => void;
  searchQuery?: string;
  onFilterTeacher?: (teacher: string) => void;
  onFilterRoom?: (room: string) => void;
  /** When true, the time is shown on the left timeline gutter instead of inside the card */
  hideInlineTime?: boolean;
  /** When true, renders an expansive hero spotlight card with generous padding and larger text */
  hero?: boolean;
}

export function CourseCard({
  event,
  onClick,
  compact = false,
  pendingHomeworkCount = 0,
  onAddHomework,
  searchQuery = '',
  onFilterTeacher,
  onFilterRoom,
  hideInlineTime = false,
  hero = false,
}: CourseCardProps) {
  const [copiedRoom, setCopiedRoom] = useState(false);
  const theme     = getCategoryTheme(event.category);
  const startDate = new Date(event.dtstart);
  const endDate   = new Date(event.dtend);
  const now       = new Date();

  const isOngoing = now >= startDate && now <= endDate;
  const isToday   = isSameDay(startDate, now);
  const isPast    = isToday && now.getTime() > endDate.getTime();

  const startTime = format(startDate, 'HH:mm');
  const endTime   = format(endDate,   'HH:mm');

  const progressPercent = isOngoing
    ? Math.min(100, Math.max(2, Math.round(
        ((now.getTime() - startDate.getTime()) /
         (endDate.getTime() - startDate.getTime())) * 100
      )))
    : 0;

  const minutesRemaining = isOngoing
    ? Math.max(1, Math.round((endDate.getTime() - now.getTime()) / 60000))
    : 0;

  const isTP = event.category === 'TP';

  const handleCopyRoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    const roomText = event.room || event.location;
    if (roomText) {
      navigator.clipboard.writeText(roomText);
      setCopiedRoom(true);
      setTimeout(() => setCopiedRoom(false), 1500);
    }
  };

  const handleQuickAddHomework = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddHomework?.(event.cleanTitle);
  };

  const cardBase = [
    'relative w-full cursor-pointer select-none group border',
    'transition-all duration-120 btn-tactile shadow-tactile-xs',
    isPast ? 'opacity-65 saturate-[0.80] hover:opacity-100' : '',
    theme.catClass,
    isTP ? (theme.pattern ?? '') : '',
  ].filter(Boolean).join(' ');

  return (
    <motion.article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      className={cardBase}
      style={{
        borderRadius: 'var(--r-1)',
        borderColor: isOngoing ? 'var(--live-bar)' : 'var(--border-2)',
        ...(isOngoing ? {
          outline: `2px solid var(--live-bar)`,
          outlineOffset: '-2px',
        } : {}),
      }}
      aria-label={`${event.cleanTitle}, ${startTime} à ${endTime}`}
    >
      {/* Scanline radar si en cours */}
      {isOngoing && <div className="scanline-live" aria-hidden="true" />}

      {/* Barre de progression en cours */}
      {isOngoing && (
        <div
          className="progress-fill-live absolute top-0 left-0 right-0 z-20"
          style={{
            height: '3px',
            width: `${progressPercent}%`,
            transition: 'width 0.7s ease',
            background: 'var(--live-pulse)',
          }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}

      <div className={hero ? 'p-4 sm:p-5' : (compact ? 'py-2.5 px-3.5' : 'p-3.5 sm:p-4')}>

        {/* Ligne supérieure : En-tête de carte */}
        <div className={`flex items-center justify-between gap-2.5 ${hero ? 'mb-3.5' : 'mb-2.5'}`}>

          {/* Si inline time : affiche l'horaire ici */}
          {!hideInlineTime ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`${hero ? 'text-sm sm:text-base' : 'text-sm'} font-black tabular-nums shrink-0 font-mono`}
                style={{
                  color: isOngoing ? 'var(--live-text)' : 'var(--text)',
                  letterSpacing: '-0.01em',
                }}
              >
                {startTime}
                <span className="mx-1 font-normal opacity-40">–</span>
                {endTime}
              </span>

              <span className={`${hero ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm'} shrink-0 font-mono text-[var(--muted)] font-bold`}>
                {event.durationMinutes} min
              </span>

              {isOngoing && (
                <span className="stamp-live shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator-pulse inline-block" />
                  <span>EN COURS · {minutesRemaining} MIN</span>
                </span>
              )}
            </div>
          ) : (
            /* Si heure à gauche sur le gutter : affiche les badges catégoriels en haut */
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {/* Badge Catégorie */}
              <span
                className={`${hero ? 'text-xs sm:text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5'} font-black rounded-xs font-mono uppercase ${theme.badgeClass}`}
              >
                {theme.shortLabel}
              </span>

              {/* Sous-groupe */}
              {event.subGroup && (
                <span
                  className={`${hero ? 'text-xs sm:text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5'} font-bold rounded-xs font-mono border`}
                  style={{
                    background: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-2)',
                  }}
                >
                  {event.subGroup}
                </span>
              )}

              {/* Badge Évaluation */}
              {event.category === 'EXAM' && (
                <span className={`stamp-exam ${hero ? 'text-xs py-1' : 'text-xs py-0.5'}`}>
                  ÉVALUATION
                </span>
              )}

              {/* Badge Live si en cours */}
              {isOngoing && (
                <span className={`stamp-live ${hero ? 'py-1' : 'py-0.5'}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator-pulse inline-block" />
                  <span>EN COURS · {minutesRemaining} MIN</span>
                </span>
              )}
            </div>
          )}

          {/* Badges droite */}
          <div className="flex items-center gap-2 shrink-0">
            {!hideInlineTime && (
              <>
                {event.category === 'EXAM' && (
                  <span className={`stamp-exam ${hero ? 'text-xs' : 'text-xs'}`}>ÉVALUATION</span>
                )}
                <span className={`${hero ? 'text-xs sm:text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5'} font-black rounded-xs font-mono uppercase ${theme.badgeClass}`}>
                  {theme.shortLabel}
                </span>
                {event.subGroup && (
                  <span className={`${hero ? 'text-xs sm:text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5'} font-bold rounded-xs font-mono border bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-2)]`}>
                    {event.subGroup}
                  </span>
                )}
              </>
            )}

            {/* Pastille devoirs urgents */}
            {pendingHomeworkCount > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 ${hero ? 'text-xs px-3 py-1' : 'text-xs px-2.5 py-0.5'} font-bold rounded-xs font-mono border`}
                style={{
                  background: 'var(--projet-bg)',
                  borderColor: 'var(--projet-bar)',
                  color: 'var(--projet-text)',
                }}
                title={`${pendingHomeworkCount} devoir(s) à rendre`}
              >
                <BookOpen size={hero ? 15 : 13} strokeWidth={2.5} />
                <span>{pendingHomeworkCount}</span>
              </span>
            )}
          </div>
        </div>

        {/* Titre du cours */}
        <h3
          className={`font-extrabold leading-snug ${hero ? 'text-base sm:text-lg mb-3 tracking-tight' : 'text-sm sm:text-base mb-2 tracking-tight'} font-sans`}
          style={{
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          <HighlightText text={event.cleanTitle} query={searchQuery} />
        </h3>

        {/* Métadonnées : Salle façon Boarding Pass + Enseignant */}
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm ${hero ? 'pt-2' : 'pt-1'}`}>
          {/* Salle : Poinçon technique d'embarquement */}
          <button
            type="button"
            onClick={handleCopyRoom}
            onContextMenu={e => {
              if (onFilterRoom && (event.room || event.location)) {
                e.preventDefault();
                e.stopPropagation();
                onFilterRoom(event.room || event.location);
              }
            }}
            title="Cliquer pour copier la salle (clic droit pour filtrer)"
            className={`inline-flex items-center gap-2 font-bold font-mono ${hero ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-2.5 py-1 text-xs'} rounded-xs border transition-colors cursor-pointer active:scale-95`}
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border-2)',
              color: 'var(--text)',
            }}
          >
            <MapPin className={`${hero ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-[var(--accent)] shrink-0`} strokeWidth={2.5} />
            <span>
              <HighlightText text={event.room || event.location || 'Salle non précisée'} query={searchQuery} />
            </span>
            {copiedRoom ? (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 ml-1">
                <Check className="w-3.5 h-3.5" /> Copié
              </span>
            ) : (
              <Copy className="w-3 h-3 text-[var(--muted-2)] group-hover:text-[var(--text)] ml-0.5" />
            )}
          </button>

          {/* Enseignant */}
          {event.teacher && (
            <button
              type="button"
              onClick={e => {
                if (onFilterTeacher) {
                  e.stopPropagation();
                  onFilterTeacher(event.teacher);
                }
              }}
              title={onFilterTeacher ? `Filtrer par cet enseignant (${event.teacher})` : undefined}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-left ${
                onFilterTeacher ? 'hover:text-[var(--text)] cursor-pointer hover:underline' : ''
              }`}
              style={{ color: 'var(--muted)' }}
            >
              <User className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <HighlightText text={event.teacher} query={searchQuery} />
            </button>
          )}

          {/* Bouton rapide d'ajout de devoir contextuel */}
          {onAddHomework && (
            <button
              type="button"
              onClick={handleQuickAddHomework}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-xs border transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] border-[var(--border)] hover:border-[var(--border-2)] bg-[var(--surface-2)]"
              title="Ajouter un devoir pour cette matière"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Devoir</span>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
