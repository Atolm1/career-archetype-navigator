'use client';

import { useEffect, useRef, useState } from 'react';

interface ResultSectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
  accent?: string;
}

export default function ResultSection({
  title,
  children,
  delay = 0,
  accent = '#C9A84C',
}: ResultSectionProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-px flex-1" style={{ background: `${accent}33` }} />
          <h2
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: accent, fontFamily: 'var(--font-dm-sans)' }}
          >
            {title}
          </h2>
          <div className="h-px flex-1" style={{ background: `${accent}33` }} />
        </div>
      </div>
      {children}
    </div>
  );
}
