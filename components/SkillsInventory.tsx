'use client';

import { TransferableSkill } from '@/lib/types';

interface SkillsInventoryProps {
  skills: TransferableSkill[];
}

export default function SkillsInventory({ skills }: SkillsInventoryProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'rgba(42, 191, 163, 0.05)',
        border: '1px solid rgba(42, 191, 163, 0.2)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skills.map((item, i) => (
          <div
            key={i}
            className="rounded-lg p-4"
            style={{
              background: 'rgba(15, 28, 46, 0.6)',
              border: '1px solid rgba(42, 191, 163, 0.15)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'rgba(42, 191, 163, 0.15)',
                  color: '#2ABFA3',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                {i + 1}
              </div>
              <div>
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: '#2ABFA3', fontFamily: 'var(--font-dm-sans)' }}
                >
                  {item.skill}
                </div>
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: 'rgba(245, 237, 214, 0.65)', fontFamily: 'var(--font-dm-sans)' }}
                >
                  {item.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
