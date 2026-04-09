'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TypeCard from '@/components/TypeCard';
import {
  MBTI_TYPES,
  TEMPERAMENT_ORDER,
  TEMPERAMENT_META,
  getTypesByTemperament,
} from '@/lib/archetypes';

export default function HomePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [workBackground, setWorkBackground] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const selectedTypeData = MBTI_TYPES.find((t) => t.code === selectedType);

  function handleSubmit() {
    if (!selectedType || isNavigating) return;
    setIsNavigating(true);
    if (workBackground.trim()) {
      sessionStorage.setItem('can_work_background', workBackground.trim());
    } else {
      sessionStorage.removeItem('can_work_background');
    }
    router.push(`/results?type=${selectedType}`);
  }

  return (
    <div
      className="min-h-screen dossier-bg"
      style={{ background: '#0F1C2E' }}
    >
      {/* Header */}
      <header className="pt-12 pb-2 px-6 text-center">
        <div
          className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          style={{ color: '#C9A84C', fontFamily: 'var(--font-dm-sans-variable)' }}
        >
          Dan&apos;s Career Corner
        </div>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
          style={{
            fontFamily: 'var(--font-playfair-display)',
            color: '#F5EDD6',
          }}
        >
          Career Archetype
          <br />
          <span style={{ color: '#C9A84C' }}>Navigator</span>
        </h1>
        <p
          className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          style={{
            color: 'rgba(245, 237, 214, 0.7)',
            fontFamily: 'var(--font-dm-sans-variable)',
          }}
        >
          Select your MBTI type to unlock your career archetype — a deep-read
          on your strengths, transferable skills, and best-fit paths.
        </p>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 pt-10">

        {/* Type grid */}
        <div className="mb-10">
          <h2
            className="text-center text-xs font-semibold tracking-[0.2em] uppercase mb-6"
            style={{ color: 'rgba(245, 237, 214, 0.4)', fontFamily: 'var(--font-dm-sans-variable)' }}
          >
            Select Your Type
          </h2>

          <div className="space-y-5">
            {TEMPERAMENT_ORDER.map((temperament) => {
              const meta = TEMPERAMENT_META[temperament];
              const types = getTypesByTemperament(temperament);
              return (
                <div key={temperament}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span
                      className="text-xs font-bold tracking-wider"
                      style={{ color: meta.headerColor, fontFamily: 'var(--font-dm-sans-variable)' }}
                    >
                      {meta.label}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'rgba(245, 237, 214, 0.35)', fontFamily: 'var(--font-dm-sans-variable)' }}
                    >
                      — {meta.subtitle}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {types.map((type) => (
                      <TypeCard
                        key={type.code}
                        type={type}
                        isSelected={selectedType === type.code}
                        onClick={() =>
                          setSelectedType(
                            selectedType === type.code ? null : type.code
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected type callout */}
        {selectedTypeData && (
          <div
            className="rounded-xl p-4 mb-8 text-center animate-fade-in-up"
            style={{
              background: 'rgba(201, 168, 76, 0.08)',
              border: '1px solid rgba(201, 168, 76, 0.25)',
            }}
          >
            <span
              className="text-sm"
              style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}
            >
              Selected:{' '}
            </span>
            <span
              className="font-bold"
              style={{ color: '#C9A84C', fontFamily: 'var(--font-playfair-display)' }}
            >
              {selectedTypeData.code}
            </span>
            <span
              className="text-sm ml-2"
              style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}
            >
              — {selectedTypeData.archetypeName}
            </span>
          </div>
        )}

        {/* Work background */}
        <div className="mb-8">
          <label
            htmlFor="work-background"
            className="block text-sm font-semibold mb-1"
            style={{ color: '#F5EDD6', fontFamily: 'var(--font-dm-sans-variable)' }}
          >
            Work background{' '}
            <span style={{ color: 'rgba(245, 237, 214, 0.4)', fontWeight: 400 }}>
              — optional
            </span>
          </label>
          <p
            className="text-xs mb-3"
            style={{
              color: 'rgba(245, 237, 214, 0.45)',
              fontFamily: 'var(--font-dm-sans-variable)',
            }}
          >
            Share 2–3 sentences about your current or past work. We&apos;ll personalize
            your transferable skills and career paths based on what you&apos;ve actually done.
          </p>
          <textarea
            id="work-background"
            value={workBackground}
            onChange={(e) => setWorkBackground(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="e.g. I've spent 6 years in retail management, most recently running a team of 12. Before that I worked in customer service and trained new hires. I'm looking to transition into a different field."
            className="w-full rounded-lg px-4 py-3 text-sm resize-none outline-none transition-colors duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(245, 237, 214, 0.12)',
              color: '#F5EDD6',
              fontFamily: 'var(--font-dm-sans-variable)',
              lineHeight: '1.6',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 237, 214, 0.12)';
            }}
          />
          <div
            className="text-right text-xs mt-1"
            style={{ color: 'rgba(245, 237, 214, 0.3)', fontFamily: 'var(--font-dm-sans-variable)' }}
          >
            {workBackground.length}/600
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedType || isNavigating}
            className="px-10 py-4 rounded-lg font-semibold text-base transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'var(--font-dm-sans-variable)',
              background: selectedType
                ? 'linear-gradient(135deg, #C9A84C, #D4B56A)'
                : 'rgba(201, 168, 76, 0.2)',
              color: selectedType ? '#0F1C2E' : 'rgba(201, 168, 76, 0.4)',
              boxShadow: selectedType ? '0 4px 20px rgba(201, 168, 76, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (selectedType && !isNavigating) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(201, 168, 76, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = selectedType
                ? '0 4px 20px rgba(201, 168, 76, 0.3)'
                : 'none';
            }}
          >
            {isNavigating ? 'Loading...' : 'Explore My Archetype →'}
          </button>
          {!selectedType && (
            <p
              className="text-xs mt-3"
              style={{
                color: 'rgba(245, 237, 214, 0.35)',
                fontFamily: 'var(--font-dm-sans-variable)',
              }}
            >
              Select a type above to continue
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-6 px-4"
        style={{
          borderTop: '1px solid rgba(245, 237, 214, 0.06)',
          color: 'rgba(245, 237, 214, 0.3)',
          fontSize: '12px',
          fontFamily: 'var(--font-dm-sans-variable)',
        }}
      >
        Built by Dan Lopez &nbsp;|&nbsp; Dan&apos;s Career Corner &nbsp;|&nbsp;{' '}
        <a
          href="https://danscareercorner.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(201, 168, 76, 0.5)', textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(201, 168, 76, 0.5)')}
        >
          danscareercorner.com
        </a>
      </footer>
    </div>
  );
}
