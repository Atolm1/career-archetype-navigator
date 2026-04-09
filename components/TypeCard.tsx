'use client';

import { MBTIType, TEMPERAMENT_META } from '@/lib/archetypes';

interface TypeCardProps {
  type: MBTIType;
  isSelected: boolean;
  onClick: () => void;
}

export default function TypeCard({ type, isSelected, onClick }: TypeCardProps) {
  const meta = TEMPERAMENT_META[type.temperament];

  return (
    <button
      onClick={onClick}
      className="relative w-full text-left rounded-lg p-3 transition-all duration-200 cursor-pointer group"
      style={{
        background: isSelected ? 'rgba(201, 168, 76, 0.18)' : meta.bg,
        border: `1px solid ${isSelected ? '#C9A84C' : meta.border}`,
        boxShadow: isSelected
          ? '0 0 0 1px #C9A84C, 0 4px 20px rgba(201, 168, 76, 0.2)'
          : '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      <div
        className="text-xl font-bold tracking-wide mb-0.5"
        style={{
          fontFamily: 'var(--font-playfair-display)',
          color: isSelected ? '#C9A84C' : '#F5EDD6',
        }}
      >
        {type.code}
      </div>
      <div
        className="text-xs leading-tight"
        style={{
          color: isSelected ? '#D4B56A' : 'rgba(245, 237, 214, 0.6)',
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        {type.archetypeName.replace('The ', '')}
      </div>
      {isSelected && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ background: '#C9A84C' }}
        />
      )}
    </button>
  );
}
