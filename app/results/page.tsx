'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTypeByCode } from '@/lib/archetypes';
import type { CareerProfile } from '@/lib/types';
import ResultSection from '@/components/ResultSection';
import SkillsInventory from '@/components/SkillsInventory';
import CareerPathCard from '@/components/CareerPathCard';

// ─── Loading screen ──────────────────────────────────────────────────────────

function LoadingScreen({ typeName, progress = 0 }: { typeName?: string; progress?: number }) {
  const phrases = [
    'Mapping your archetype...',
    'Surfacing transferable skills...',
    'Charting career paths...',
    'Assembling your dossier...',
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#0F1C2E' }}
    >
      <div className="loading-scan-line" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 text-center px-6">
        <div
          className="text-xs font-semibold tracking-[0.3em] uppercase mb-8"
          style={{ color: 'rgba(201, 168, 76, 0.5)', fontFamily: 'var(--font-dm-sans-variable)' }}
        >
          {typeName ? `${typeName} Archetype` : 'Career Archetype Navigator'}
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold mb-10 animate-pulse-gold"
          style={{
            fontFamily: 'var(--font-playfair-display)',
            color: '#C9A84C',
          }}
        >
          Assembling your archetype
          <span className="inline-block w-6 text-left">...</span>
        </h1>

        <div
          className="text-sm transition-opacity duration-500"
          style={{ color: 'rgba(245, 237, 214, 0.4)', fontFamily: 'var(--font-dm-sans-variable)' }}
        >
          {phrases[phraseIndex]}
        </div>

        {/* Progress bar */}
        <div className="mt-10 w-48 mx-auto">
          <div
            className="h-px w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(201, 168, 76, 0.15)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(4, progress)}%`,
                background: 'linear-gradient(to right, rgba(201,168,76,0.4), #C9A84C)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          {progress > 0 && (
            <div
              className="text-center text-xs mt-2"
              style={{ color: 'rgba(201, 168, 76, 0.4)', fontFamily: 'var(--font-dm-sans-variable)' }}
            >
              {Math.round(progress)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Error screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0F1C2E' }}
    >
      <div className="text-center max-w-md">
        <div
          className="text-xs tracking-[0.2em] uppercase mb-4"
          style={{ color: 'rgba(201, 168, 76, 0.5)', fontFamily: 'var(--font-dm-sans-variable)' }}
        >
          Something went wrong
        </div>
        <p
          className="text-sm mb-8"
          style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}
        >
          {message}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #D4B56A)',
              color: '#0F1C2E',
              fontFamily: 'var(--font-dm-sans-variable)',
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              border: '1px solid rgba(245, 237, 214, 0.15)',
              color: 'rgba(245, 237, 214, 0.6)',
              fontFamily: 'var(--font-dm-sans-variable)',
            }}
          >
            Start over
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Results content (needs useSearchParams — must be in Suspense) ────────────

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mbtiType = searchParams.get('type')?.toUpperCase() ?? '';
  const typeData = getTypeByCode(mbtiType);

  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamProgress, setStreamProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [barsActive, setBarsActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const hasFetched = useRef(false);
  const dossierRef = useRef<HTMLDivElement>(null);
  // Approximate expected response length for progress estimation
  const EXPECTED_CHARS = 3800;

  async function fetchProfile() {
    setLoading(true);
    setError(null);
    setProfile(null);
    setBarsActive(false);
    setStreamProgress(0);

    const workBackground =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('can_work_background') ?? undefined
        : undefined;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mbtiType, workBackground }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const progress = Math.min(98, (accumulated.length / EXPECTED_CHARS) * 100);
        setStreamProgress(progress);
      }

      setStreamProgress(100);
      const raw = accumulated.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      const data: CareerProfile = JSON.parse(raw);
      setProfile(data);
      setTimeout(() => setBarsActive(true), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mbtiType || !typeData) {
      router.replace('/');
      return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProfile();
  }, [mbtiType]);

  async function handleDownloadPDF() {
    if (!dossierRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(dossierRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0F1C2E',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${mbtiType}-career-archetype.pdf`);
    } finally {
      setIsDownloading(false);
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/results?type=${mbtiType}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  }

  if (!typeData) return null;

  if (loading) return <LoadingScreen typeName={typeData.code} progress={streamProgress} />;

  if (error) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => {
          hasFetched.current = false;
          fetchProfile();
        }}
      />
    );
  }

  if (!profile) return null;

  return (
    <div ref={dossierRef} style={{ background: '#0F1C2E', minHeight: '100vh' }}>

      {/* Dossier header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #162336 0%, #0F1C2E 100%)',
          borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="text-xs tracking-wider transition-colors duration-150"
              style={{
                color: 'rgba(245, 237, 214, 0.35)',
                fontFamily: 'var(--font-dm-sans-variable)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245, 237, 214, 0.35)')}
            >
              ← Back
            </Link>
            <div className="h-3 w-px" style={{ background: 'rgba(245,237,214,0.15)' }} />
            <span
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: 'rgba(201, 168, 76, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}
            >
              Career Archetype Navigator
            </span>
          </div>

          <div className="flex items-start gap-5">
            <div
              className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl"
              style={{
                background: 'rgba(201, 168, 76, 0.12)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                color: '#C9A84C',
                fontFamily: 'var(--font-playfair-display)',
              }}
            >
              {typeData.code}
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-3xl sm:text-4xl font-bold leading-tight mb-2"
                style={{ fontFamily: 'var(--font-playfair-display)', color: '#F5EDD6' }}
              >
                {profile.archetypeName}
              </h1>
              <p
                className="text-base italic leading-relaxed"
                style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}
              >
                {profile.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dossier body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-14">

        {/* Essence */}
        <ResultSection title="Who You Are" delay={100}>
          <p
            className="text-base leading-loose"
            style={{ color: 'rgba(245, 237, 214, 0.82)', fontFamily: 'var(--font-dm-sans-variable)' }}
          >
            {profile.essenceDescription}
          </p>
        </ResultSection>

        {/* Core strengths */}
        <ResultSection title="Core Strengths" delay={250}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.coreStrengths.map((s, i) => (
              <div
                key={i}
                className="rounded-lg p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(245, 237, 214, 0.07)',
                }}
              >
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: '#C9A84C', fontFamily: 'var(--font-playfair-display)' }}
                >
                  {s.name}
                </div>
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}
                >
                  {s.description}
                </div>
              </div>
            ))}
          </div>
        </ResultSection>

        {/* Transferable skills */}
        <ResultSection title="Transferable Skills Inventory" delay={400} accent="#2ABFA3">
          <SkillsInventory skills={profile.transferableSkills} />
        </ResultSection>

        {/* Career paths */}
        <ResultSection title="Career Paths" delay={550}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.careerPaths.map((path, i) => (
              <CareerPathCard
                key={i}
                path={path}
                index={i}
                animate={barsActive}
              />
            ))}
          </div>
        </ResultSection>

        {/* Work environment needs */}
        <ResultSection title="What You Need to Thrive" delay={700}>
          <ul className="space-y-3">
            {profile.workEnvironmentNeeds.map((need, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#C9A84C' }}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(245, 237, 214, 0.75)', fontFamily: 'var(--font-dm-sans-variable)' }}
                >
                  {need}
                </span>
              </li>
            ))}
          </ul>
        </ResultSection>

        {/* Watch out for */}
        <ResultSection title="Watch Out For" delay={850} accent="#9D7A5A">
          <div className="space-y-3">
            {profile.watchOutFor.map((w, i) => (
              <div
                key={i}
                className="rounded-lg p-4"
                style={{
                  background: 'rgba(157, 107, 74, 0.07)',
                  border: '1px solid rgba(157, 107, 74, 0.2)',
                }}
              >
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: '#C4956A', fontFamily: 'var(--font-playfair-display)' }}
                >
                  {w.title}
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}
                >
                  {w.description}
                </p>
              </div>
            ))}
          </div>
        </ResultSection>

        {/* Growth edge */}
        <ResultSection title="Your Growth Edge" delay={1000}>
          <div
            className="rounded-xl p-6"
            style={{
              background: 'rgba(42, 191, 163, 0.04)',
              border: '1px solid rgba(42, 191, 163, 0.15)',
            }}
          >
            <p
              className="text-sm leading-loose"
              style={{ color: 'rgba(245, 237, 214, 0.8)', fontFamily: 'var(--font-dm-sans-variable)' }}
            >
              {profile.growthEdge}
            </p>
          </div>
        </ResultSection>

        {/* Actions row */}
        <div
          className="pt-6"
          style={{ borderTop: '1px solid rgba(245, 237, 214, 0.06)' }}
        >
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleShare}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={{
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  color: '#C9A84C',
                  background: 'transparent',
                  fontFamily: 'var(--font-dm-sans-variable)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Share my type ↗
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 disabled:cursor-wait"
                style={{
                  border: '1px solid rgba(245, 237, 214, 0.2)',
                  color: isDownloading ? 'rgba(245, 237, 214, 0.3)' : 'rgba(245, 237, 214, 0.7)',
                  background: 'transparent',
                  fontFamily: 'var(--font-dm-sans-variable)',
                }}
                onMouseEnter={(e) => {
                  if (!isDownloading) e.currentTarget.style.background = 'rgba(245, 237, 214, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {isDownloading ? 'Generating PDF...' : 'Download PDF ↓'}
              </button>
            </div>
            <Link
              href="/"
              className="text-sm transition-colors duration-150"
              style={{ color: 'rgba(245, 237, 214, 0.35)', fontFamily: 'var(--font-dm-sans-variable)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245, 237, 214, 0.35)')}
            >
              ← Try another type
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-6 px-4 mt-4"
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

// ─── Page export (wraps ResultsContent in Suspense) ───────────────────────────

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResultsContent />
    </Suspense>
  );
}
