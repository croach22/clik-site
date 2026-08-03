import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Hero showcase — four real workflows the reader can switch between, each
// showing what went in, what came out, and the exact prompt that did it.
//
// ── DROPPING IN REAL FOOTAGE ────────────────────────────────────────────
// Each variant has `raw` (the before) and per-output `src` (the after).
// Both are null today and fall back to abstract tiles. To go live:
//   1. put files in  public/videos/showcase/<variant-id>/
//   2. set  raw: '/videos/showcase/content-day/raw.mp4'
//      and  src: '/videos/showcase/content-day/vidA_hookA.mp4'
// Nothing else changes — layout, sizing and posters are already wired.
// ────────────────────────────────────────────────────────────────────────

const ROYCE = '#5481E8';
const SALMON = '#F9838E';
const SAGE = '#7CA088';
const LAVENDER = '#9785B8';
const OCHRE = '#C5A578';

const C = (a: number) => `rgba(249, 247, 241, ${a})`;
const INSET = 'rgba(249, 247, 241, 0.04)';
const PANEL = '#13204A';

const SIGNUP = 'https://app.clik.vision/sign-up';

interface Output {
  label: string;
  dur: string;
  accent: string;
  src?: string | null;
}

interface Variant {
  id: string;
  tab: string;
  inputSummary: string;
  inputFiles: { name: string; kind: string; accent: string }[];
  moreCount: number;
  outLabel: string;
  outputs: Output[];
  raw?: string | null;
  prompt: string;
}

const VARIANTS: Variant[] = [
  {
    id: 'content-day',
    tab: 'Content day',
    inputSummary: '37 clips · one shoot day',
    inputFiles: [
      { name: 'IMG_0978.mp4', kind: 'a-roll', accent: ROYCE },
      { name: 'IMG_0982.mp4', kind: 'b-roll', accent: SAGE },
      { name: 'IMG_0991.mp4', kind: 'a-roll', accent: ROYCE },
      { name: 'IMG_1004.mp4', kind: 'graphics', accent: LAVENDER },
    ],
    moreCount: 33,
    outLabel: '12 videos · 4 concepts',
    outputs: [
      { label: 'vidA_hookA', dur: '0:34', accent: ROYCE },
      { label: 'vidA_hookB', dur: '0:31', accent: ROYCE },
      { label: 'vidB_hookA', dur: '0:48', accent: SALMON },
      { label: 'vidB_hookB', dur: '0:44', accent: SALMON },
      { label: 'vidC_hookA', dur: '0:58', accent: SAGE },
      { label: 'vidD_hookA', dur: '0:39', accent: OCHRE },
    ],
    raw: null,
    prompt:
      "Here's a full content day, 37 clips, unsorted.\n\nSort the footage into A-roll, B-roll, and graphics. Read the dialogue and visuals, then plan 4 concepts you can actually make from what's here.\n\nBuild every concept vertical, with 2 hook variants each. Use my saved caption style, title cards, and hook rules. Cut the dead air, and pull B-roll from my own footage where it fits the meaning.\n\nTell me anything the brief called for that I didn't shoot.",
  },
  {
    id: 'street-interviews',
    tab: 'Street interviews',
    inputSummary: '60 clips · no master file',
    inputFiles: [
      { name: 'IMG_2210.mp4', kind: 'guest 01', accent: ROYCE },
      { name: 'IMG_2214.mp4', kind: 'guest 02', accent: SALMON },
      { name: 'IMG_2231.mp4', kind: 'guest 03', accent: SAGE },
      { name: 'IMG_2247.mp4', kind: 'b-roll', accent: LAVENDER },
    ],
    moreCount: 56,
    outLabel: '5 videos',
    outputs: [
      { label: 'recap_guest01', dur: '0:48', accent: ROYCE },
      { label: 'recap_guest02', dur: '0:52', accent: SALMON },
      { label: 'recap_guest03', dur: '0:44', accent: SAGE },
      { label: 'compilation_best', dur: '1:24', accent: LAVENDER },
      { label: 'teaser_hookA', dur: '0:22', accent: OCHRE },
    ],
    raw: null,
    prompt:
      "This is a day of street interviews. About 60 clips, no master file, every answer is its own file.\n\nWatch all of it and find the strongest moments across every clip. Group them by guest.\n\nBuild me one recap per guest, plus a compilation of the best answers of the day and a short teaser using the single best line.\n\nAll vertical, my caption style, cut the dead air.",
  },
  {
    id: 'podcast-clipping',
    tab: 'Podcast clipping',
    inputSummary: 'Episode 42 · plus your B-roll',
    inputFiles: [
      { name: 'ep42_full.mp4', kind: 'episode', accent: ROYCE },
      { name: 'broll_studio.mp4', kind: 'b-roll', accent: SAGE },
      { name: 'broll_city.mp4', kind: 'b-roll', accent: OCHRE },
      { name: 'lower_thirds.mp4', kind: 'graphics', accent: LAVENDER },
    ],
    moreCount: 12,
    outLabel: '8 clips · your B-roll',
    outputs: [
      { label: 'ep42_clip01', dur: '0:41', accent: ROYCE },
      { label: 'ep42_clip02', dur: '0:37', accent: SALMON },
      { label: 'ep42_clip03', dur: '0:55', accent: SAGE },
      { label: 'ep42_clip04', dur: '0:29', accent: LAVENDER },
      { label: 'ep42_clip05', dur: '0:46', accent: OCHRE },
      { label: 'ep42_clip06', dur: '0:33', accent: ROYCE },
    ],
    raw: null,
    prompt:
      "Here's episode 42, plus my B-roll library and my graphics.\n\nPull the 8 strongest moments from the episode and build them as vertical clips.\n\nWhen a moment needs a cutaway, use my own B-roll, matched to what's actually being said. Never stock.\n\nUse my saved caption style and title cards, and cut the dead air out of the dialogue.",
  },
  {
    id: 'yap-batch',
    tab: 'Yap batch',
    inputSummary: '18 takes · one sitting',
    inputFiles: [
      { name: 'take_01.mp4', kind: 'idea 01', accent: ROYCE },
      { name: 'take_02.mp4', kind: 'idea 01', accent: ROYCE },
      { name: 'take_03.mp4', kind: 'idea 02', accent: SALMON },
      { name: 'take_04.mp4', kind: 'idea 03', accent: SAGE },
    ],
    moreCount: 14,
    outLabel: '6 videos · best takes',
    outputs: [
      { label: 'idea01_hookA', dur: '0:38', accent: ROYCE },
      { label: 'idea01_hookB', dur: '0:35', accent: ROYCE },
      { label: 'idea02_hookA', dur: '0:42', accent: SALMON },
      { label: 'idea02_hookB', dur: '0:40', accent: SALMON },
      { label: 'idea03_hookA', dur: '0:51', accent: SAGE },
      { label: 'idea03_hookB', dur: '0:47', accent: SAGE },
    ],
    raw: null,
    prompt:
      "Here's a yap batch, 18 takes recorded in one sitting, several attempts per idea.\n\nGroup the takes by idea and keep the best delivery of each line. Drop the flubs and the restarts.\n\nBuild one vertical video per idea with 2 hook variants each, using my saved caption style and hook rules. Cut every pause.",
  },
];

const STEPS = [
  'Copy the prompt above.',
  'Create a free Clik account.',
  'Start a project and upload your footage.',
  'Paste the prompt into the chat and send it.',
];

// ── Prompt modal ──────────────────────────────────────────────
function PromptModal({ variant, onClose }: { variant: Variant; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(variant.prompt);
    } catch {
      /* clipboard blocked — the prompt is selectable in the panel below */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ background: 'rgba(4, 8, 20, 0.72)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Prompt for ${variant.tab}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-t-2xl border p-6 sm:rounded-2xl md:p-8"
        style={{ borderColor: C(0.12), background: PANEL }}
      >
        <div className="mb-1 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color: ROYCE }}>
              {variant.tab}
            </p>
            <h3
              className="mt-2 font-display font-medium text-clik-cream"
              style={{ fontSize: 26, letterSpacing: '-0.01em', lineHeight: 1.15 }}
            >
              Run this on your own footage<span style={{ color: ROYCE }}>.</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{ color: C(0.5) }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* the prompt */}
        <div
          className="mt-5 rounded-xl border p-4"
          style={{ borderColor: C(0.1), background: INSET }}
        >
          <pre
            className="whitespace-pre-wrap font-ui"
            style={{ fontSize: 13.5, lineHeight: 1.6, color: C(0.85), margin: 0 }}
          >
            {variant.prompt}
          </pre>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={copy} className="clik-btn clik-btn-primary">
            {copied ? 'Copied' : 'Copy prompt'}
            <span aria-hidden="true">{copied ? '✓' : ''}</span>
          </button>
          <a href={SIGNUP} className="clik-btn clik-btn-secondary">
            Start for free <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* steps */}
        <div className="mt-7 border-t pt-6" style={{ borderColor: C(0.1) }}>
          <p className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.14em', color: C(0.45) }}>
            How to use it
          </p>
          <ol className="mt-3 space-y-2.5">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span
                  className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full font-mono"
                  style={{
                    fontSize: 9,
                    color: ROYCE,
                    background: `${ROYCE}15`,
                    border: `1px solid ${ROYCE}40`,
                  }}
                >
                  {i + 1}
                </span>
                <span className="font-ui" style={{ fontSize: 14, lineHeight: 1.5, color: C(0.75) }}>
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Output tile ───────────────────────────────────────────────
function OutputTile({ o, i, shown }: { o: Output; i: number; shown: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={shown ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
      transition={{ delay: i * 0.06, type: 'spring', stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded-lg"
      style={{
        aspectRatio: '9 / 16',
        background: `${o.accent}12`,
        border: `1px solid ${o.accent}40`,
      }}
    >
      {o.src ? (
        <video
          src={o.src}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <>
          <span
            className="absolute left-1/2 top-[20%] block -translate-x-1/2 rounded-full"
            style={{ width: '36%', aspectRatio: '1', background: `${o.accent}30` }}
          />
          <span
            className="absolute left-1/2 top-[44%] block -translate-x-1/2 rounded-t-lg"
            style={{ width: '56%', height: '24%', background: `${o.accent}22` }}
          />
          <span
            className="absolute left-1/2 block -translate-x-1/2 rounded-sm"
            style={{ bottom: '22%', width: '62%', height: 4, background: o.accent }}
          />
        </>
      )}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1"
        style={{ background: 'rgba(7, 12, 27, 0.78)' }}
      >
        <span className="truncate font-mono" style={{ fontSize: 7, color: C(0.85) }}>
          {o.label}
        </span>
        <span className="font-mono" style={{ fontSize: 7, color: C(0.45) }}>
          {o.dur}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const v = VARIANTS[active];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  // portals need a DOM target, so wait for hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div ref={ref}>
      {/* variant tabs */}
      <div
        role="tablist"
        aria-label="Workflow examples"
        className="mb-3 flex flex-wrap gap-1.5"
      >
        {VARIANTS.map((variant, i) => {
          const on = i === active;
          return (
            <button
              key={variant.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className="rounded-lg border px-3 py-1.5 font-mono uppercase transition-colors"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: on ? '#F9F7F1' : C(0.5),
                borderColor: on ? `${ROYCE}70` : C(0.1),
                background: on ? `${ROYCE}1A` : 'transparent',
              }}
            >
              {variant.tab}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border p-4 md:p-5" style={{ borderColor: C(0.1), background: PANEL }}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          {/* ── RAW ── */}
          <div className="rounded-xl border p-3" style={{ borderColor: C(0.09), background: INSET }}>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.12em', color: C(0.45) }}>
                Raw
              </span>
              <span className="font-mono" style={{ fontSize: 8, color: C(0.35) }}>
                {v.inputSummary}
              </span>
            </div>

            {v.raw ? (
              <video
                src={v.raw}
                className="mb-2 w-full rounded-lg"
                style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : null}

            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="space-y-1.5"
            >
                {v.inputFiles.map((f, i) => (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, x: -6 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                    style={{ background: C(0.04), border: `1px solid ${C(0.08)}` }}
                  >
                    <span className="block h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: f.accent }} />
                    <span className="flex-1 truncate" style={{ fontSize: 10.5, color: C(0.72) }}>
                      {f.name}
                    </span>
                    <span
                      className="font-mono uppercase"
                      style={{ fontSize: 7, letterSpacing: '0.1em', color: `${f.accent}DD` }}
                    >
                      {f.kind}
                    </span>
                  </motion.div>
                ))}
                <div
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                  style={{ border: `1px dashed ${C(0.1)}` }}
                >
                  <span className="block h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: C(0.15) }} />
                  <span className="font-mono" style={{ fontSize: 9.5, color: C(0.4) }}>
                    +{v.moreCount} more
                  </span>
                </div>
            </motion.div>
          </div>

          {/* ── OUT ── */}
          <div className="rounded-xl border p-3" style={{ borderColor: `${ROYCE}30`, background: `${ROYCE}0A` }}>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="font-mono uppercase" style={{ fontSize: 8, letterSpacing: '0.12em', color: C(0.45) }}>
                Clik output
              </span>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 font-mono uppercase"
                style={{
                  fontSize: 8,
                  letterSpacing: '0.1em',
                  background: `${SAGE}18`,
                  color: `${SAGE}EE`,
                  border: `1px solid ${SAGE}45`,
                }}
              >
                {v.outLabel}
              </span>
            </div>

            <motion.div
              key={v.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`grid gap-2 ${
                  v.outputs.length === 5
                    ? 'grid-cols-3 sm:grid-cols-5'
                    : 'grid-cols-3 sm:grid-cols-6'
                }`}
              >
              {v.outputs.map((o, i) => (
                <OutputTile key={o.label} o={o} i={i} shown={inView} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* prompt CTA */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-ui" style={{ fontSize: 12.5, color: C(0.55) }}>
            This is one prompt. Run the same thing on your footage.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono uppercase transition-colors"
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              color: ROYCE,
              borderColor: `${ROYCE}55`,
              background: `${ROYCE}12`,
            }}
          >
            Copy prompt
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="4.5" y="4.5" width="8" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9.5 2.5h-7a1 1 0 0 0-1 1v7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Portalled to <body>: inside the hero the modal sits under a stacking
          context created by the section's transforms and never surfaces. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {modalOpen && <PromptModal variant={v} onClose={() => setModalOpen(false)} />}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
