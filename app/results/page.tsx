'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTypeByCode } from '@/lib/archetypes';
import type { CareerProfile, CoreStrength, TransferableSkill, CareerPath, WatchOutFor } from '@/lib/types';
import ResultSection from '@/components/ResultSection';
import SkillsInventory from '@/components/SkillsInventory';
import CareerPathCard from '@/components/CareerPathCard';

type PartialProfile = Partial<CareerProfile>;

// ─── Skeleton placeholder ─────────────────────────────────────────────────────

function Skeleton({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  const widths = ['75%', '90%', '60%', '80%', '70%'];
  return (
    <div className={`space-y-2 ${className}`} style={{ animation: 'pulse-gold 2s ease-in-out infinite' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded"
          style={{ background: 'rgba(245, 237, 214, 0.06)', width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

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
          style={{ fontFamily: 'var(--font-playfair-display)', color: '#C9A84C' }}
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0F1C2E' }}>
      <div className="text-center max-w-md">
        <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(201, 168, 76, 0.5)', fontFamily: 'var(--font-dm-sans-variable)' }}>
          Something went wrong
        </div>
        <p className="text-sm mb-8" style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}>
          {message}
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={onRetry} className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #C9A84C, #D4B56A)', color: '#0F1C2E', fontFamily: 'var(--font-dm-sans-variable)' }}>
            Try again
          </button>
          <Link href="/" className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ border: '1px solid rgba(245, 237, 214, 0.15)', color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}>
            Start over
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Results content ──────────────────────────────────────────────────────────

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mbtiType = searchParams.get('type')?.toUpperCase() ?? '';
  const typeData = getTypeByCode(mbtiType);

  const [profile, setProfile] = useState<PartialProfile>({});
  const [sectionsLoaded, setSectionsLoaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [streamProgress, setStreamProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [barsActive, setBarsActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const hasFetched = useRef(false);
  const dossierRef = useRef<HTMLDivElement>(null);
  const EXPECTED_CHARS = 4200;

  function applySection(raw: string) {
    try {
      const obj = JSON.parse(raw);
      const section = obj.section as string;
      setProfile((prev) => ({ ...prev, ...obj }));
      setSectionsLoaded((prev) => new Set([...prev, section]));
      if (section === 'intro') setLoading(false);
      if (section === 'paths') setTimeout(() => setBarsActive(true), 400);
    } catch {
      // incomplete line — skip
    }
  }

  async function fetchProfile() {
    setLoading(true);
    setError(null);
    setProfile({});
    setSectionsLoaded(new Set());
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
      let lineBuffer = '';
      let totalChars = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        totalChars += chunk.length;
        lineBuffer += chunk;
        setStreamProgress(Math.min(98, (totalChars / EXPECTED_CHARS) * 100));

        // Parse any complete lines
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.trim()) applySection(line.trim());
        }
      }

      // Flush any remaining buffered content
      if (lineBuffer.trim()) applySection(lineBuffer.trim());
      setStreamProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mbtiType || !typeData) { router.replace('/'); return; }
    if (hasFetched.current) return;
    hasFetched.current = true;

    // If a shared link includes pre-encoded profile data, restore it directly
    // instead of making a new API call (which would generate different wording).
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        const decoded: PartialProfile = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
        setProfile(decoded);
        setSectionsLoaded(new Set(['intro', 'strengths', 'skills', 'paths', 'environment']));
        setLoading(false);
        setStreamProgress(100);
        setTimeout(() => setBarsActive(true), 400);
        return;
      } catch {
        // Corrupted data param — fall through to normal fetch
      }
    }

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
        onclone: (clonedDoc) => {
          // html2canvas resets CSS animations to frame-zero when it clones the DOM.
          // animate-fade-in-up starts at opacity:0 (fill-mode: both), so cards go invisible.
          // Force all animated elements to their final visible state in the clone.
          const style = clonedDoc.createElement('style');
          style.textContent = `
            .animate-fade-in-up {
              animation: none !important;
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
            .animate-pulse-gold {
              animation: none !important;
              opacity: 1 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          // ResultSection uses inline opacity:0 until its setTimeout fires.
          // In the clone that timer never runs, so fix those inline styles too.
          clonedDoc.querySelectorAll<HTMLElement>('*').forEach((el) => {
            if (el.style.opacity === '0') {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }
          });
        },
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
    let url = `${window.location.origin}/results?type=${mbtiType}`;
    // Embed the full generated profile so the recipient sees identical results
    // rather than triggering a fresh AI generation with different wording.
    if (streamProgress >= 100 && Object.keys(profile).length > 0) {
      try {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(profile))));
        url += `&data=${encoded}`;
      } catch {
        // If encoding fails for any reason, fall back to type-only URL
      }
    }
    navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'));
  }

  if (!typeData) return null;
  if (loading) return <LoadingScreen typeName={typeData.code} progress={streamProgress} />;
  if (error) return <ErrorScreen message={error} onRetry={() => { hasFetched.current = false; fetchProfile(); }} />;

  const has = (s: string) => sectionsLoaded.has(s);
  const stillStreaming = streamProgress < 100;

  return (
    <div ref={dossierRef} style={{ background: '#0F1C2E', minHeight: '100vh' }}>

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #162336 0%, #0F1C2E 100%)', borderBottom: '1px solid rgba(201, 168, 76, 0.15)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="text-xs tracking-wider transition-colors duration-150" style={{ color: 'rgba(245, 237, 214, 0.35)', fontFamily: 'var(--font-dm-sans-variable)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245, 237, 214, 0.35)')}>
              ← Back
            </Link>
            <div className="h-3 w-px" style={{ background: 'rgba(245,237,214,0.15)' }} />
            <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(201, 168, 76, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}>
              Career Archetype Navigator
            </span>
          </div>
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl" style={{ background: 'rgba(201, 168, 76, 0.12)', border: '1px solid rgba(201, 168, 76, 0.3)', color: '#C9A84C', fontFamily: 'var(--font-playfair-display)' }}>
              {typeData.code}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2" style={{ fontFamily: 'var(--font-playfair-display)', color: '#F5EDD6' }}>
                {profile.archetypeName ?? typeData.archetypeName}
              </h1>
              <p className="text-base italic leading-relaxed" style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}>
                {profile.tagline ?? <Skeleton rows={1} />}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-14">

        {/* Essence */}
        <ResultSection title="Who You Are" delay={0}>
          {profile.essenceDescription
            ? <p className="text-base leading-loose" style={{ color: 'rgba(245, 237, 214, 0.82)', fontFamily: 'var(--font-dm-sans-variable)' }}>{profile.essenceDescription}</p>
            : <Skeleton rows={3} />}
        </ResultSection>

        {/* Core strengths */}
        <ResultSection title="Core Strengths" delay={0}>
          {has('strengths') && profile.coreStrengths ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(profile.coreStrengths as CoreStrength[]).map((s, i) => (
                <div key={i} className="rounded-lg p-4 animate-fade-in-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245, 237, 214, 0.07)' }}>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#C9A84C', fontFamily: 'var(--font-playfair-display)' }}>{s.name}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}>{s.description}</div>
                </div>
              ))}
            </div>
          ) : <Skeleton rows={4} />}
        </ResultSection>

        {/* Transferable skills */}
        <ResultSection title="Transferable Skills Inventory" delay={0} accent="#2ABFA3">
          {has('skills') && profile.transferableSkills
            ? <SkillsInventory skills={profile.transferableSkills as TransferableSkill[]} />
            : <Skeleton rows={5} />}
        </ResultSection>

        {/* Career paths */}
        <ResultSection title="Career Paths" delay={0}>
          {has('paths') && profile.careerPaths ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(profile.careerPaths as CareerPath[]).map((path, i) => (
                <CareerPathCard key={i} path={path} index={i} animate={barsActive} />
              ))}
            </div>
          ) : <Skeleton rows={6} />}
        </ResultSection>

        {/* Work environment */}
        <ResultSection title="What You Need to Thrive" delay={0}>
          {has('environment') && profile.workEnvironmentNeeds ? (
            <ul className="space-y-3">
              {(profile.workEnvironmentNeeds as string[]).map((need, i) => (
                <li key={i} className="flex items-start gap-3 animate-fade-in-up">
                  <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
                  <span className="text-sm leading-relaxed" style={{ color: 'rgba(245, 237, 214, 0.75)', fontFamily: 'var(--font-dm-sans-variable)' }}>{need}</span>
                </li>
              ))}
            </ul>
          ) : <Skeleton rows={4} />}
        </ResultSection>

        {/* Watch out for */}
        <ResultSection title="Watch Out For" delay={0} accent="#9D7A5A">
          {has('environment') && profile.watchOutFor ? (
            <div className="space-y-3">
              {(profile.watchOutFor as WatchOutFor[]).map((w, i) => (
                <div key={i} className="rounded-lg p-4 animate-fade-in-up" style={{ background: 'rgba(157, 107, 74, 0.07)', border: '1px solid rgba(157, 107, 74, 0.2)' }}>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#C4956A', fontFamily: 'var(--font-playfair-display)' }}>{w.title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(245, 237, 214, 0.6)', fontFamily: 'var(--font-dm-sans-variable)' }}>{w.description}</p>
                </div>
              ))}
            </div>
          ) : <Skeleton rows={3} />}
        </ResultSection>

        {/* Growth edge */}
        <ResultSection title="Your Growth Edge" delay={0}>
          {has('environment') && profile.growthEdge ? (
            <div className="rounded-xl p-6 animate-fade-in-up" style={{ background: 'rgba(42, 191, 163, 0.04)', border: '1px solid rgba(42, 191, 163, 0.15)' }}>
              <p className="text-sm leading-loose" style={{ color: 'rgba(245, 237, 214, 0.8)', fontFamily: 'var(--font-dm-sans-variable)' }}>{profile.growthEdge}</p>
            </div>
          ) : <Skeleton rows={4} />}
        </ResultSection>

        {/* Actions */}
        <div className="pt-6" style={{ borderTop: '1px solid rgba(245, 237, 214, 0.06)' }}>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-3">
              <button onClick={handleShare} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={{ border: '1px solid rgba(201, 168, 76, 0.3)', color: '#C9A84C', background: 'transparent', fontFamily: 'var(--font-dm-sans-variable)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                Share my type ↗
              </button>
              <button onClick={handleDownloadPDF} disabled={isDownloading || stillStreaming}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={{
                  border: '1px solid rgba(245, 237, 214, 0.2)',
                  color: (isDownloading || stillStreaming) ? 'rgba(245, 237, 214, 0.3)' : 'rgba(245, 237, 214, 0.7)',
                  background: 'transparent',
                  fontFamily: 'var(--font-dm-sans-variable)',
                  cursor: (isDownloading || stillStreaming) ? 'not-allowed' : 'pointer',
                }}
                title={stillStreaming ? 'Available once loading completes' : undefined}
                onMouseEnter={(e) => { if (!isDownloading && !stillStreaming) e.currentTarget.style.background = 'rgba(245, 237, 214, 0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                {isDownloading ? 'Generating PDF...' : stillStreaming ? 'Download PDF (loading...)' : 'Download PDF ↓'}
              </button>
            </div>
            <Link href="/" className="text-sm transition-colors duration-150"
              style={{ color: 'rgba(245, 237, 214, 0.35)', fontFamily: 'var(--font-dm-sans-variable)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245, 237, 214, 0.35)')}>
              ← Try another type
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 px-4 mt-4" style={{ borderTop: '1px solid rgba(245, 237, 214, 0.06)', color: 'rgba(245, 237, 214, 0.3)', fontSize: '12px', fontFamily: 'var(--font-dm-sans-variable)' }}>
        Built by Dan Lopez &nbsp;|&nbsp; Dan&apos;s Career Corner &nbsp;|&nbsp;{' '}
        <a href="https://danscareercorner.com" target="_blank" rel="noopener noreferrer"
          style={{ color: 'rgba(201, 168, 76, 0.5)', textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(201, 168, 76, 0.5)')}>
          danscareercorner.com
        </a>
      </footer>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResultsContent />
    </Suspense>
  );
}
