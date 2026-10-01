'use client';

import React, { useState } from 'react';
import { CourseCategory, TimeOfDayFilter } from '@/types/schedule';
import { Search, X, Users, Sun, Sunset, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CourseCategory | 'ALL';
  onCategoryChange: (category: CourseCategory | 'ALL') => void;
  timeOfDayFilter?: TimeOfDayFilter;
  onTimeOfDayChange?: (filter: TimeOfDayFilter) => void;
  selectedSubGroup?: string;
  onSubGroupChange?: (subGroup: string) => void;
  availableSubGroups?: string[];
  resultsCount: number;
  /** Opens the command palette (Cmd+K) */
  onOpenCommandPalette?: () => void;
}

const CATEGORY_FILTERS: {
  key: CourseCategory | 'ALL';
  label: string;
  barColor: string;
  bgVar: string;
  textVar: string;
}[] = [
  { key: 'ALL',    label: 'Tous',    barColor: 'var(--text)',      bgVar: 'var(--surface-3)', textVar: 'var(--text)' },
  { key: 'CM',     label: 'CM',      barColor: 'var(--cm-bar)',    bgVar: 'var(--cm-bg)',     textVar: 'var(--cm-text)' },
  { key: 'TD',     label: 'TD',      barColor: 'var(--td-bar)',    bgVar: 'var(--td-bg)',     textVar: 'var(--td-text)' },
  { key: 'TP',     label: 'TP',      barColor: 'var(--tp-bar)',    bgVar: 'var(--tp-bg)',     textVar: 'var(--tp-text)' },
  { key: 'EXAM',   label: 'Examens', barColor: 'var(--exam-bar)',  bgVar: 'var(--exam-bg)',   textVar: 'var(--exam-text)' },
  { key: 'PROJET', label: 'Projets', barColor: 'var(--projet-bar)',bgVar: 'var(--projet-bg)', textVar: 'var(--projet-text)' },
];

export function SearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  timeOfDayFilter = 'ALL',
  onTimeOfDayChange,
  selectedSubGroup = '2-2',
  onSubGroupChange,
  availableSubGroups = [],
  resultsCount,
  onOpenCommandPalette,
}: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Count active non-default filters
  const activeFiltersCount = (
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (timeOfDayFilter !== 'ALL' ? 1 : 0) +
    (selectedSubGroup && selectedSubGroup !== '2-2' ? 1 : 0)
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // / focuses search; Cmd+K opens palette if callback provided
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (onOpenCommandPalette) {
          onOpenCommandPalette();
        } else {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  return (
    <div className="w-full space-y-0 shadow-tactile-sm">
      {/* Ligne 1 : champ de recherche spacieux */}
      <div
        className="flex items-center border shadow-tactile-xs"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border-2)',
          borderRadius: 'var(--r-1)',
        }}
      >
        <Search
          className="w-5 h-5 mx-4 sm:mx-5 shrink-0"
          style={{ color: 'var(--muted-2)' }}
          strokeWidth={2.2}
        />

        <input
          ref={inputRef}
          type="search"
          value={searchQuery}
          onChange={e => {
            onSearchChange(e.target.value);
            if (e.target.value && !isFiltersOpen) {
              setIsFiltersOpen(true);
            }
          }}
          placeholder="Rechercher cours, salle, prof…"
          className="flex-1 py-3.5 sm:py-4.5 text-base sm:text-lg bg-transparent focus:outline-none"
          style={{ color: 'var(--text)' }}
          aria-label="Rechercher dans l'emploi du temps"
        />

        {/* Boutons d'actions droite */}
        <div className="flex items-center gap-2.5 px-3 sm:px-5">
          {resultsCount !== undefined && searchQuery && (
            <span className="font-mono text-xs font-bold text-[var(--muted)] px-2 py-0.5 rounded-xs bg-[var(--surface-2)] border border-[var(--border)] hidden sm:inline">
              {resultsCount} {resultsCount > 1 ? 'résultats' : 'résultat'}
            </span>
          )}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1.5 rounded-xs transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}

          {/* Toggle Filtres */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(prev => !prev)}
            className="btn-tactile flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm border rounded-xs cursor-pointer transition-colors min-h-[40px]"
            style={{
              background: (isFiltersOpen || activeFiltersCount > 0) ? 'var(--surface-3)' : 'var(--surface-2)',
              borderColor: activeFiltersCount > 0 ? 'var(--accent)' : 'var(--border)',
              color: activeFiltersCount > 0 ? 'var(--accent)' : 'var(--muted)',
            }}
            aria-expanded={isFiltersOpen}
            title="Afficher/masquer les filtres (catégories, créneaux, groupes)"
          >
            <SlidersHorizontal size={14} strokeWidth={2.2} />
            <span className="hidden xs:inline font-bold">Filtres</span>
            {activeFiltersCount > 0 && (
              <span
                className="font-mono text-xs font-black px-1.5 py-0.2 rounded-xs"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown
              size={14}
              className={`transition-transform duration-150 ${isFiltersOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Raccourci / */}
          {!searchQuery && (
            <kbd
              className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold rounded-xs border"
              style={{
                color: 'var(--muted)',
                borderColor: 'var(--border-2)',
                background: 'var(--surface-2)',
              }}
            >
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Ligne 2 : filtres catégorie + sous-groupe (Pliable) */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center justify-between border border-t-0 overflow-x-auto no-scrollbar relative"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border-2)',
              }}
            >
              {/* Filtres catégorie avec glisseur layoutId */}
              <div className="flex items-center shrink-0">
                {CATEGORY_FILTERS.map(cat => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => onCategoryChange(cat.key)}
                      className="relative px-4 py-2 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap select-none"
                      style={{
                        color: isSelected ? cat.textVar : 'var(--muted)',
                        borderRight: '1px solid var(--border)',
                      }}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="active-cat-glider"
                          className="absolute inset-0 z-0 border-b-2"
                          style={{
                            background: cat.bgVar,
                            borderBottomColor: cat.barColor,
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Filtres plage horaire (Matin / Après-midi) */}
              {onTimeOfDayChange && (
                <div className="flex items-center shrink-0 border-l" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => onTimeOfDayChange(timeOfDayFilter === 'MORNING' ? 'ALL' : 'MORNING')}
                    className="relative px-3.5 py-2 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                    style={{
                      color: timeOfDayFilter === 'MORNING' ? 'var(--accent)' : 'var(--muted)',
                      borderRight: '1px solid var(--border)',
                    }}
                    aria-pressed={timeOfDayFilter === 'MORNING'}
                    title="Filtrer les cours du matin (8h–12h)"
                  >
                    {timeOfDayFilter === 'MORNING' && (
                      <motion.div
                        layoutId="active-tod-glider"
                        className="absolute inset-0 z-0 bg-[var(--accent-dim)] border-b-2 border-[var(--accent)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Sun className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Matin</span>
                  </button>

                  <button
                    onClick={() => onTimeOfDayChange(timeOfDayFilter === 'AFTERNOON' ? 'ALL' : 'AFTERNOON')}
                    className="relative px-3.5 py-2 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                    style={{
                      color: timeOfDayFilter === 'AFTERNOON' ? 'var(--accent)' : 'var(--muted)',
                    }}
                    aria-pressed={timeOfDayFilter === 'AFTERNOON'}
                    title="Filtrer les cours de l'après-midi (13h–19h)"
                  >
                    {timeOfDayFilter === 'AFTERNOON' && (
                      <motion.div
                        layoutId="active-tod-glider"
                        className="absolute inset-0 z-0 bg-[var(--accent-dim)] border-b-2 border-[var(--accent)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Sunset className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Après-midi</span>
                  </button>
                </div>
              )}

              {/* Sélecteur de sous-groupe */}
              {availableSubGroups.length > 0 && onSubGroupChange && (
                <div className="flex items-center gap-0 shrink-0 border-l" style={{ borderColor: 'var(--border)' }}>
                  <span
                    className="px-2.5 text-xs font-mono hidden sm:flex items-center gap-1"
                    style={{ color: 'var(--muted)' }}
                  >
                    <Users className="w-3.5 h-3.5" strokeWidth={2} />
                    Gr.
                  </span>

                  {availableSubGroups.map(sg => {
                    const isSelected = selectedSubGroup === sg;
                    return (
                      <button
                        key={sg}
                        onClick={() => onSubGroupChange(sg)}
                        className="relative px-3 py-2 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap"
                        style={{
                          color: isSelected ? 'var(--accent)' : 'var(--muted)',
                          borderLeft: '1px solid var(--border)',
                        }}
                        aria-pressed={isSelected}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-subgroup-glider"
                            className="absolute inset-0 z-0 bg-[var(--accent-dim)] border-b-2 border-[var(--accent)]"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <span className="relative z-10">{sg === '2-2' ? `${sg} ★` : `${sg}`}</span>
                      </button>
                    );
                  })}

                  <button
                    onClick={() => onSubGroupChange('ALL')}
                    className="relative px-3 py-2 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap border-l"
                    style={{
                      color: selectedSubGroup === 'ALL' ? 'var(--text)' : 'var(--muted)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {selectedSubGroup === 'ALL' && (
                      <motion.div
                        layoutId="active-subgroup-glider"
                        className="absolute inset-0 z-0 bg-[var(--surface)] border-b-2 border-[var(--text)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">Tous</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
