'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeworkItem } from '@/types/schedule';
import { X, CheckCircle2, Circle, Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HomeworkItem[];
  onAdd: (courseTitle: string, text: string, dueDate?: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  availableCourses: string[];
  initialCourse?: string;
}

export function HomeworkModal({
  isOpen,
  onClose,
  items,
  onAdd,
  onToggle,
  onDelete,
  availableCourses,
  initialCourse = '',
}: HomeworkModalProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourse || availableCourses[0] || 'Général');
  const [taskText, setTaskText]             = useState('');
  const [dueDate, setDueDate]               = useState('');
  const [filter, setFilter]                 = useState<'ALL' | 'PENDING' | 'DONE'>('PENDING');

  const [prevInitial, setPrevInitial] = useState(initialCourse);
  if (initialCourse !== prevInitial) {
    setPrevInitial(initialCourse);
    if (initialCourse) {
      setSelectedCourse(initialCourse);
    }
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    onAdd(selectedCourse, taskText, dueDate || undefined);
    setTaskText('');
    setDueDate('');
  };

  const filteredItems = items.filter(item => {
    if (filter === 'PENDING') return !item.isDone;
    if (filter === 'DONE')    return item.isDone;
    return true;
  });

  if (!isOpen) return null;

  const FILTERS: { key: 'PENDING' | 'DONE' | 'ALL'; label: string }[] = [
    { key: 'PENDING', label: 'À faire' },
    { key: 'DONE',    label: 'Terminés' },
    { key: 'ALL',     label: `Tous (${items.length})` },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Devoirs et rappels"
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
          className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden z-10 shadow-tactile-dark"
          style={{
            background: 'var(--surface)',
            borderTop: `4px solid var(--projet-bar)`,
          }}
        >
          {/* Poignée tactile mobile */}
          <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-[var(--surface-2)]">
            <div className="w-12 h-1.5 rounded-full bg-[var(--border-2)]" />
          </div>

          {/* En-tête */}
          <div
            className="flex items-center justify-between px-6 sm:px-8 py-5 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--projet-bg)' }}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text)' }}>
                Devoirs &amp; rappels
              </h2>
              <p className="text-xs sm:text-sm mt-1 font-mono font-bold" style={{ color: 'var(--muted)' }}>
                {items.filter(i => !i.isDone).length} tâche{items.filter(i => !i.isDone).length > 1 ? 's' : ''} en attente
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

          {/* Formulaire d'ajout */}
          <form
            onSubmit={handleSubmit}
            className="border-b space-y-3 px-6 sm:px-8 py-5"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="px-3.5 py-2.5 text-sm font-medium border focus:outline-none sm:w-2/5 rounded-xs"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-2)',
                  color: 'var(--text)',
                }}
              >
                {availableCourses.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>

              <input
                type="text"
                value={taskText}
                onChange={e => setTaskText(e.target.value)}
                placeholder="Réviser le TD 2, finir l'exercice 4…"
                className="flex-1 px-3.5 py-2.5 text-sm border focus:outline-none rounded-xs font-medium"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-2)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: 'var(--muted)' }} strokeWidth={2} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="px-3 py-2 text-sm border focus:outline-none rounded-xs"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border-2)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!taskText.trim()}
                className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 text-sm font-extrabold rounded-xs transition-colors cursor-pointer disabled:opacity-40 min-h-[42px]"
                style={{
                  background: 'var(--text)',
                  color: 'var(--bg)',
                }}
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Ajouter
              </button>
            </div>
          </form>

          {/* Onglets filtre avec glisseur layoutId */}
          <div
            className="flex border-b relative"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            {FILTERS.map(f => {
              const isSelected = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className="relative px-5 py-2.5 text-xs sm:text-sm font-black transition-colors cursor-pointer select-none"
                  style={{
                    color: isSelected ? 'var(--text)' : 'var(--muted)',
                    borderRight: '1px solid var(--border)',
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-homework-filter-glider"
                      className="absolute inset-0 bg-[var(--surface)] border-b-2 border-[var(--projet-bar)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16" style={{ color: 'var(--muted)' }}>
                <CheckCircle2 className="w-9 h-9" style={{ color: 'var(--tp-bar)', opacity: 0.6 }} strokeWidth={1.5} />
                <p className="text-base font-extrabold" style={{ color: 'var(--text)' }}>
                  {filter === 'DONE' ? 'Aucune tâche terminée' : 'Aucun devoir en attente'}
                </p>
                <p className="text-xs sm:text-sm">Ajoutez un devoir ci-dessus.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 px-6 sm:px-8 py-4.5 transition-colors"
                    style={{ opacity: item.isDone ? 0.55 : 1 }}
                  >
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.82 }}
                      onClick={() => onToggle(item.id)}
                      className="mt-0.5 shrink-0 cursor-pointer transition-colors p-0.5"
                      style={{ color: item.isDone ? 'var(--tp-bar)' : 'var(--border-2)' }}
                      aria-label={item.isDone ? 'Marquer comme à faire' : 'Marquer comme terminé'}
                    >
                      {item.isDone ? (
                        <motion.div
                          initial={{ scale: 0.6 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                        >
                          <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
                        </motion.div>
                      ) : (
                        <Circle className="w-5.5 h-5.5 hover:text-[var(--text)] transition-colors" strokeWidth={1.8} />
                      )}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <span
                        className="inline-block text-xs font-mono font-bold px-2 py-0.5 mb-1.5 rounded-xs"
                        style={{
                          background: 'var(--projet-bg)',
                          color: 'var(--projet-text)',
                          border: '1px solid var(--projet-bar)',
                        }}
                      >
                        {item.courseTitle}
                      </span>
                      <p
                        className={`text-sm sm:text-base leading-relaxed font-semibold transition-all ${item.isDone ? 'line-through opacity-70' : ''}`}
                        style={{ color: item.isDone ? 'var(--muted)' : 'var(--text)' }}
                      >
                        {item.text}
                      </p>
                      {item.dueDate && (
                        <p
                          className="text-xs mt-1.5 font-mono font-bold"
                          style={{ color: 'var(--muted)' }}
                        >
                          Pour le {format(new Date(item.dueDate), 'd MMMM yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="btn-tactile shrink-0 p-2 rounded-xs transition-colors cursor-pointer text-[var(--muted-2)] hover:text-red-500"
                      aria-label="Supprimer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
