'use client';

import { useEffect, useState } from 'react';
import { CareerPath } from '@/lib/types';

interface CareerPathCardProps {
  path: CareerPath;
  index: number;
  animate: boolean;
}

function getFitLabel(score: number): string {
  if (score >= 88) return 'Exceptional Fit';
  if (score >= 75) return 'Strong Fit';
  if (score >= 62) return 'Good Fit';
  return 'Moderate Fit';
}

function getFitColor(score: number): string {
  if (score >= 88) return '#C9A84C';
  if (score >= 75) return '#2ABFA3';
  if (score >= 62) return '#7B9DC9';
  return '#9D8A6B';
}

export default function CareerPathCard({ path, index, animate }: CareerPathCardProps) {
  const [barWidth, setBarWidth] = useState(0);
  const color = getFitColor(path.fitScore);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      setBarWidth(path.fitScore);
    }, index * 80 + 200);
    return () => clearTimeout(timer);
  }, [animate, path.fitScore, index]);

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(245, 237, 214, 0.08)',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-sm leading-snug mb-0.5"
            style={{ color: '#F5EDD6', fontFamily: 'var(--font-playfair-display)' }}
          >
            {path.title}
          </div>
          <div
            className="text-xs"
            style={{ color: 'rgba(245, 237, 214, 0.45)', fontFamily: 'var(--font-dm-sans)' }}
          >
            {path.category}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div
            className="text-lg font-bold leading-none"
            style={{ color, fontFamily: 'var(--font-playfair-display)' }}
          >
            {path.fitScore}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: 'rgba(245, 237, 214, 0.4)', fontFamily: 'var(--font-dm-sans)' }}
          >
            {getFitLabel(path.fitScore)}
          </div>
        </div>
      </div>

      {/* Fit score bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden mb-3"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${barWidth}%`,
            background: `linear-gradient(to right, ${color}88, ${color})`,
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      <p
        className="text-xs leading-relaxed"
        style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans)' }}
      >
        {path.whyItFits}
      </p>
    </div>
  );
}
