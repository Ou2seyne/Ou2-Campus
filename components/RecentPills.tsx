'use client';

import React from 'react';
import { SavedSchedule } from '@/types/schedule';
import { Star, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentPillsProps {
  schedules: SavedSchedule[];
  currentScheduleId: string | null;
  onSelectSchedule: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemoveSchedule: (id: string) => void;
  onOpenAddModal: () => void;
}

export function RecentPills({
  schedules,
  currentScheduleId,
  onSelectSchedule,
  onToggleFavorite,
  onRemoveSchedule,
  onOpenAddModal,
}: RecentPillsProps) {
  const sortedSchedules = React.useMemo(() => {
    return [...schedules].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.lastAccessedAt - a.lastAccessedAt;
    });
  }, [schedules]);

  if (sortedSchedules.length === 0) return null;

  return (
    <div
      className="w-full flex items-stretch border overflow-x-auto no-scrollbar shadow-tactile-sm"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-2)',
      }}
      role="navigation"
      aria-label="Plannings enregistrés"
    >
      {/* Bouton ajouter */}
      <button
        onClick={onOpenAddModal}
        className="btn-tactile flex items-center gap-1.5 px-3.5 py-2 text-xs font-700 shrink-0 border-r transition-colors cursor-pointer bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]"
        style={{
          borderColor: 'var(--border)',
        }}
        aria-label="Ajouter un planning"
        title="Ajouter un planning"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span className="hidden sm:inline">Ajouter</span>
      </button>

      {/* Liste des plannings */}
      {sortedSchedules.map(schedule => {
        const isActive = schedule.id === currentScheduleId;

        return (
          <div
            key={schedule.id}
            className="group relative flex items-center border-r shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Indicateur actif glissant layoutId */}
            {isActive && (
              <motion.div
                layoutId="active-schedule-glider"
                className="absolute inset-0 bg-[var(--accent-dim)] -z-0 border-b-2 border-[var(--accent)]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            {/* Favori — séparé */}
            <button
              type="button"
              onClick={() => onToggleFavorite(schedule.id)}
              className="relative z-10 shrink-0 pl-3 py-2 transition-colors cursor-pointer"
              style={{ color: schedule.isFavorite ? 'var(--td-bar)' : 'var(--border-2)' }}
              aria-label={schedule.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star
                className="w-3.5 h-3.5"
                fill={schedule.isFavorite ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
            </button>

            {/* Nom — bouton de sélection */}
            <button
              type="button"
              onClick={() => onSelectSchedule(schedule.id)}
              className="relative z-10 px-2 pr-3 py-2 text-xs font-700 transition-colors cursor-pointer truncate max-w-[130px] sm:max-w-[200px]"
              style={{
                color: isActive ? 'var(--text)' : 'var(--muted)',
              }}
            >
              {schedule.name}
            </button>

            {/* Supprimer (hover) */}
            {schedules.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Supprimer le planning "${schedule.name}" ?`)) {
                    onRemoveSchedule(schedule.id);
                  }
                }}
                className="relative z-10 opacity-0 group-hover:opacity-100 mr-1 p-1 rounded-xs transition-all cursor-pointer text-[var(--muted-2)] hover:text-red-500"
                aria-label="Supprimer ce planning"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
