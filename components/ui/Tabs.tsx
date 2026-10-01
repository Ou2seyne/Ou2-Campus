'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  gliderId?: string;
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeId,
  onChange,
  gliderId = 'tab-glider',
  className = '',
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      triggerHaptic('light');
      onChange(nextTab.id);
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`inline-flex items-center p-0.5 border rounded-xs select-none shadow-tactile-xs ${className}`}
      style={{
        background: 'var(--surface-2)',
        borderColor: 'var(--border-2)',
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              triggerHaptic('tap');
              onChange(tab.id);
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="btn-tactile relative px-3 py-1.5 text-xs font-sans font-700 outline-none flex items-center gap-1.5 z-10 transition-colors"
            style={{
              color: isActive ? 'var(--text)' : 'var(--muted)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId={gliderId}
                className="absolute inset-0 border rounded-xs z-[-1]"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-2)',
                  boxShadow: 'var(--el-1)',
                  borderRadius: '2px',
                }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-xs border"
                style={{
                  background: isActive ? 'var(--surface-2)' : 'var(--surface-3)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
