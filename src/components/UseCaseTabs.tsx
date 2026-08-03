import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Three use cases — the market-opportunity argument lives in the intro line;
// the tabs are the evidence. Copy pattern per tab: In / Out / the claim.
// Each tab has a looping preview animation (timer state machine + framer-motion,
// same mechanics as the feature sections and HeroLoop).

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const LAVENDER = '#9785B8';
const OCHRE = '#C5A578';
const MID = (a: string) => `rgba(249, 247, 241, ${a})`;

interface Tab {
  id: string;
  label: string;
  chrome: string;
  accent: string;
  inLines: string[];
  outLines: string[];
  claim: string;
}

const TABS: Tab[] = [
  {
    id: 'street-interviews',
    label: 'Street interviews',
    chrome: 'street interviews',
    accent: ROYCE,
    inLines: ['A full day of interviews', '40–80 clips', 'No master file, and there never will be one'],
    outLines: ['A recap per guest', 'A compilation', 'Or both'],
    claim:
      'Clik finds the best moments across every clip and builds multiple storylines. Nobody scrubs hours of footage to find them.',
  },
  {
    id: 'batch-concepts',
    label: 'Batch concepts',
    chrome: 'batch concepts',
    accent: SALMON,
    inLines: ['A shoot day', '~100 files', 'A script or a loose brief'],
    outLines: ['Every concept in its own project', 'Planned', 'Built'],
    claim: 'Clik reads the whole batch and splits it by concept. You never sort a file.',
  },
  {
    id: 'podcast-clipping',
    label: 'Podcast clipping',
    chrome: 'podcast clipping',
    accent: LAVENDER,
    inLines: ['A finished episode, or the raw recording', 'Your B-roll', 'Your graphics'],
    outLines: ['Clips that cut to your own footage', 'Not stock'],
    claim: 'Most tools can only start once someone has produced the episode. Clik works from either end.',
  },
];

// ── Shared loop machinery ──
const LOOP_PAUSE = 2600;
const FADE_OUT = 700;

function useLoopSequence(delays: number[], enabled: boolean) {
  const [step, setStep] = useState(-1);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setStep(-1);
      setFading(false);
      return;
    }
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      setStep(-1);
      setFading(false);
      let elapsed = 0;
      delays.forEach((d, i) => {
        elapsed += d;
        timeouts.push(setTimeout(() => setStep(i), elapsed));
      });
      const total = elapsed + LOOP_PAUSE;
      timeouts.push(setTimeout(() => setFading(true), total));
      timeouts.push(setTimeout(run, total + FADE_OUT + 200));
    };
    run();
    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return { step, fading };
}

function VisualShell({
  chrome,
  fading,
  children,
  ariaLabel,
  innerRef,
}: {
  chrome: string;
  fading: boolean;
  children: React.ReactNode;
  ariaLabel: string;
  innerRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={innerRef}>
      <motion.div
        animate={{ opacity: fading ? 0 : 1 }}
        transition={{ duration: fading ? FADE_OUT / 1000 : 0.3 }}
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: MID('0.10'), background: '#13204A' }}
        role="img"
        aria-label={ariaLabel}
      >
        <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: MID('0.08') }}>
          <div className="w-2 h-2 rounded-full bg-clik-cream/20" />
          <div className="w-2 h-2 rounded-full bg-clik-cream/20" />
          <div className="w-2 h-2 rounded-full bg-clik-cream/20" />
          <span className="ml-3 text-[10px] font-mono" style={{ color: MID('0.4') }}>{chrome}</span>
        </div>
        <div className="px-4 py-5 min-h-[320px] md:min-h-[360px] flex flex-col justify-center">{children}</div>
      </motion.div>
    </div>
  );
}

function ZoneLabel({ text, right }: { text: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: MID('0.5') }}>
        {text}
      </span>
      <div className="flex-1 h-px" style={{ background: MID('0.08') }} />
      {right}
    </div>
  );
}

function Badge({ show, accent, text }: { show: boolean; accent: string; text: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="font-mono text-[9px] uppercase tracking-[0.14em] rounded-full px-2 py-0.5"
          style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ── Tab 1: Street interviews ──
// clips flood in → scan pass → best moments light up → storylines assemble
const STREET_PICKS = [1, 4, 7, 10];
const STREET_ACCENTS = [ROYCE, SALMON, SAGE, OCHRE, LAVENDER];

function StreetVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  // 0 grid in · 1 scanning · 2 picks glow · 3 storylines · 4 badge
  const { step, fading } = useLoopSequence([300, 1100, 1300, 1200, 1900], inView);

  const clips = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    accent: STREET_ACCENTS[i % STREET_ACCENTS.length],
    picked: STREET_PICKS.includes(i),
  }));

  return (
    <VisualShell
      innerRef={ref}
      chrome="street interviews"
      fading={fading}
      ariaLabel="Dozens of interview clips are scanned; the best moments light up and assemble into a recap and a compilation"
    >
      <ZoneLabel text="40–80 clips · no master file" right={<Badge show={step >= 4} accent={ROYCE} text="no scrubbing" />} />
      <div className="relative">
        <div className="grid grid-cols-6 gap-1.5">
          {clips.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                step >= 0
                  ? {
                      opacity: step >= 2 ? (c.picked ? 1 : 0.3) : 1,
                      scale: step >= 2 && c.picked ? 1.06 : 1,
                    }
                  : { opacity: 0, scale: 0.8 }
              }
              transition={{ delay: step === 0 ? i * 0.05 : 0, duration: 0.3 }}
              className="rounded-md flex items-center justify-center"
              style={{
                aspectRatio: '4 / 5',
                background: `${c.accent}${step >= 2 && c.picked ? '25' : '12'}`,
                border: `1px solid ${c.accent}${step >= 2 && c.picked ? '70' : '25'}`,
              }}
            >
              <div className="w-2/5 rounded-full" style={{ aspectRatio: '1', background: `${c.accent}40` }} />
            </motion.div>
          ))}
        </div>
        {/* scan sweep */}
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ left: '-8%', opacity: 0 }}
              animate={{ left: '104%', opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute top-0 bottom-0 w-[6%] rounded"
              style={{ background: `linear-gradient(90deg, ${ROYCE}00, ${ROYCE}30, ${ROYCE}00)` }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 space-y-2">
        {[
          { label: 'RECAP · GUEST 02', time: '0:48', segs: [ROYCE, SAGE, ROYCE] },
          { label: 'COMPILATION', time: '1:24', segs: [ROYCE, SALMON, SAGE, OCHRE] },
        ].map((row, r) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 10 }}
            animate={step >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: r * 0.25, duration: 0.35 }}
            className="rounded-lg px-3 py-2"
            style={{ background: MID('0.04'), border: `1px solid ${MID('0.08')}` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono" style={{ color: MID('0.55') }}>{row.label}</span>
              <span className="text-[9px] font-mono" style={{ color: MID('0.4') }}>{row.time}</span>
            </div>
            <div className="flex gap-1">
              {row.segs.map((accent, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0, opacity: 0 }}
                  animate={step >= 3 ? { width: `${100 / row.segs.length}%`, opacity: 1 } : { width: 0, opacity: 0 }}
                  transition={{ delay: r * 0.25 + 0.15 + i * 0.12, type: 'spring', stiffness: 140, damping: 20 }}
                  className="h-3 rounded-sm"
                  style={{ background: `${accent}45`, border: `1px solid ${accent}60` }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </VisualShell>
  );
}

// ── Tab 2: Batch concepts ──
// file wall + brief → read pass → concept color-coding → three planned projects → built
const CONCEPTS = [
  { name: 'Morning routine', files: 32, accent: SALMON },
  { name: 'Desk setup', files: 41, accent: SAGE },
  { name: 'Q&A', files: 27, accent: OCHRE },
];

function ConceptsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  // 0 files in · 1 reading · 2 color-coded · 3 projects · 4 built
  const { step, fading } = useLoopSequence([300, 1100, 1400, 1300, 1700], inView);

  const files = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    accent: CONCEPTS[i % 3].accent,
  }));

  return (
    <VisualShell
      innerRef={ref}
      chrome="batch concepts"
      fading={fading}
      ariaLabel="A hundred shoot-day files are read against the brief, split by concept, and become three planned, built projects"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: MID('0.5') }}>
          ~100 files
        </span>
        <span
          className="text-[9px] font-mono rounded px-1.5 py-0.5"
          style={{ background: `${SALMON}12`, color: `${SALMON}DD`, border: `1px solid ${SALMON}30` }}
        >
          brief.pdf
        </span>
        <div className="flex-1 h-px" style={{ background: MID('0.08') }} />
        <Badge show={step >= 4} accent={SALMON} text="you never sort a file" />
      </div>

      <div className="grid grid-cols-9 gap-1">
        {files.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 6 }}
            animate={step >= 0 ? { opacity: step >= 3 ? 0.35 : 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ delay: step === 0 ? i * 0.03 : 0, duration: 0.25 }}
            className="rounded flex items-center justify-center"
            style={{
              aspectRatio: '1',
              background: step >= 2 ? `${f.accent}18` : MID('0.05'),
              border: `1px solid ${step >= 2 ? `${f.accent}45` : MID('0.10')}`,
              transition: 'background 0.4s, border-color 0.4s',
            }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={step >= 2 ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: (i % 9) * 0.04, type: 'spring', stiffness: 300, damping: 18 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: f.accent }}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full block"
                  style={{ background: SALMON }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: MID('0.45') }}>Reading the whole batch against the brief…</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 space-y-1.5">
        {CONCEPTS.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: 10 }}
            animate={step >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2"
            style={{ background: `${c.accent}08`, border: `1px solid ${c.accent}20` }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.accent }} />
            <span className="text-xs flex-1 truncate" style={{ color: MID('0.78') }}>Concept · {c.name}</span>
            <span className="text-[9px] font-mono hidden sm:block" style={{ color: MID('0.4') }}>{c.files} files</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={step >= 4 ? 'built' : 'planned'}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="text-[9px] font-mono rounded-full px-2 py-0.5"
                style={{
                  background: `${c.accent}${step >= 4 ? '25' : '12'}`,
                  color: `${c.accent}${step >= 4 ? 'EE' : 'BB'}`,
                  border: `1px solid ${c.accent}40`,
                }}
              >
                {step >= 4 ? 'Built ✓' : 'Planned'}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </VisualShell>
  );
}

// ── Tab 3: Podcast clipping ──
// episode waveform + your assets → hot moments light up → clips pop, cut to your footage
const WAVE_BARS = Array.from({ length: 44 }, (_, i) => 8 + ((i * 37) % 20));
const HOT_RANGES: Array<[number, number, string]> = [
  [6, 11, LAVENDER],
  [20, 25, ROYCE],
  [33, 38, SALMON],
];

function inHotRange(i: number): string | null {
  for (const [a, b, accent] of HOT_RANGES) if (i >= a && i <= b) return accent;
  return null;
}

function PodcastVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });
  // 0 wave+assets in · 1 hot moments · 2 clips pop · 3 your-footage chips · 4 badge
  const { step, fading } = useLoopSequence([300, 1300, 1200, 1300, 1600], inView);

  return (
    <VisualShell
      innerRef={ref}
      chrome="podcast clipping"
      fading={fading}
      ariaLabel="An episode waveform's best moments light up and become vertical clips that cut to the creator's own B-roll and graphics"
    >
      <ZoneLabel text="EP 42 · 1:02:14" right={<Badge show={step >= 4} accent={LAVENDER} text="works from either end" />} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={step >= 0 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end gap-[2px] h-12 rounded-lg px-3 py-2"
        style={{ background: MID('0.04'), border: `1px solid ${MID('0.08')}` }}
      >
        {WAVE_BARS.map((h, i) => {
          const hot = inHotRange(i);
          const lit = hot && step >= 1;
          return (
            <motion.div
              key={i}
              animate={lit ? { scaleY: [1, 1.25, 1] } : { scaleY: 1 }}
              transition={lit ? { duration: 1.4, repeat: Infinity, delay: (i % 6) * 0.1 } : {}}
              className="flex-1 rounded-sm origin-bottom"
              style={{
                height: h,
                background: lit ? `${hot}CC` : MID('0.18'),
                transition: 'background 0.4s',
              }}
            />
          );
        })}
      </motion.div>

      {/* your assets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={step >= 0 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-2 flex gap-1.5"
      >
        {['your b-roll', 'your graphics'].map((a) => (
          <span
            key={a}
            className="text-[9px] font-mono rounded px-1.5 py-0.5"
            style={{ background: MID('0.05'), color: MID('0.5'), border: `1px solid ${MID('0.10')}` }}
          >
            {a}
          </span>
        ))}
      </motion.div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 max-w-[280px]">
        {HOT_RANGES.map(([, , accent], i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={step >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.7, y: 12 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 220, damping: 20 }}
            className="relative rounded-lg overflow-hidden"
            style={{ aspectRatio: '9 / 14', background: `${accent}12`, border: `1px solid ${accent}40` }}
          >
            <div
              className="absolute left-1/2 top-[18%] -translate-x-1/2 rounded-full"
              style={{ width: '36%', aspectRatio: '1', background: `${accent}30` }}
            />
            {/* B-roll cutaway strip — the differentiator */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={step >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ delay: i * 0.15, duration: 0.3 }}
              className="absolute left-1/2 -translate-x-1/2 top-[48%] rounded-sm flex items-center justify-center"
              style={{ width: '72%', height: '22%', background: `${accent}35`, border: `1px solid ${accent}70` }}
            >
              <span className="text-[6px] font-mono" style={{ color: MID('0.6') }}>your b-roll</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={step >= 2 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[10%] rounded-sm"
              style={{ width: '60%', height: 4, background: `${accent}CC` }}
            />
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={step >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-[10px]"
        style={{ color: MID('0.45') }}
      >
        Cutaways from your footage, not stock.
      </motion.p>
    </VisualShell>
  );
}

const VISUALS: Record<string, () => JSX.Element> = {
  'street-interviews': StreetVisual,
  'batch-concepts': ConceptsVisual,
  'podcast-clipping': PodcastVisual,
};

export default function UseCaseTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  const Visual = VISUALS[tab.id];

  return (
    <section id="use-cases" className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-[1100px]">
        <div className="clik-section-header">
          <span className="idx">[ 01 ]</span>
          <span className="rule"></span>
          <span className="label">USE CASES</span>
        </div>

        {/* The market-opportunity argument, in one line — the tabs are the evidence */}
        <h2
          className="font-display font-medium text-clik-cream"
          style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', lineHeight: 1.15, letterSpacing: '-0.02em', maxWidth: '28ch' }}
        >
          Imagine a clipping tool that worked on raw footage{' '}
          <span style={{ color: 'rgba(249, 247, 241, 0.45)' }}>
            (and on podcasts)<span style={{ color: ROYCE }}>.</span>
          </span>
        </h2>

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Use cases"
          className="mt-10 flex flex-wrap gap-x-7 gap-y-2 border-b"
          style={{ borderColor: 'rgba(249, 247, 241, 0.12)' }}
        >
          {TABS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActive(i)}
              className="relative pb-3 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors"
              style={{ color: i === active ? '#F9F7F1' : 'rgba(249, 247, 241, 0.45)' }}
            >
              {t.label}
              {i === active && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px block h-[2px]"
                  style={{ background: ROYCE }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Panel — keyed remount with enter-only animation. No AnimatePresence:
            the looping visuals re-render continuously, which starves exit
            animations and wedges mode="wait". */}
          <motion.div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-10 flex flex-col lg:flex-row items-start gap-10 lg:gap-16"
          >
            {/* Copy: In / Out / the claim */}
            <div className="flex-1 lg:max-w-md">
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(249, 247, 241, 0.45)' }}>
                    In
                  </p>
                  <p className="mt-1.5 font-ui text-clik-cream" style={{ fontSize: 17, lineHeight: 1.5 }}>
                    {tab.inLines.join('. ')}.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(249, 247, 241, 0.45)' }}>
                    Out
                  </p>
                  <p className="mt-1.5 font-ui text-clik-cream" style={{ fontSize: 17, lineHeight: 1.5 }}>
                    {tab.outLines.join('. ')}.
                  </p>
                </div>
              </div>
              <p
                className="mt-7 rounded-xl px-4 py-3.5 font-ui"
                style={{
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: 'rgba(249, 247, 241, 0.75)',
                  background: `${tab.accent}08`,
                  border: `1px solid ${tab.accent}20`,
                }}
              >
                {tab.claim}
              </p>
            </div>

            {/* Looping preview */}
            <div className="flex-1 w-full lg:max-w-xl">
              <Visual />
            </div>
          </motion.div>
      </div>
    </section>
  );
}
