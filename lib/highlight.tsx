import React from 'react';

interface HighlightTextProps {
  text: string;
  query?: string;
  className?: string;
}

export function HighlightText({ text, query = '', className = '' }: HighlightTextProps) {
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="px-0.5 font-bold"
            style={{
              backgroundColor: 'var(--accent-dim)',
              color: 'var(--accent)',
              borderBottom: '1.5px solid var(--accent)',
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
